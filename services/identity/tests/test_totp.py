import jwt as pyjwt
import pyotp
import pytest


def _sub(token: str) -> str:
    return pyjwt.decode(token, options={"verify_signature": False})["sub"]


async def _register_and_login(client, payload):
    await client.post("/api/v1/users", json=payload)
    r = await client.post(
        "/api/v1/tokens",
        json={
            "grant_type": "password",
            "email": payload["email"],
            "password": payload["password"],
        },
    )
    assert r.status_code == 200, r.text
    return r.json()


async def _password_login(client, payload, otp=None):
    body = {
        "grant_type": "password",
        "email": payload["email"],
        "password": payload["password"],
    }
    if otp is not None:
        body["otp"] = otp
    return await client.post("/api/v1/tokens", json=body)


async def _enroll_and_verify(client, access_token):
    """Walk a user through full TOTP enrollment. Returns the secret + the
    recovery codes (plaintext — only ever shown once)."""
    sub = _sub(access_token)
    headers = {"Authorization": f"Bearer {access_token}"}
    enroll = await client.post(f"/api/v1/users/{sub}/totp", headers=headers)
    assert enroll.status_code == 200, enroll.text
    secret = enroll.json()["secret"]
    code = pyotp.TOTP(secret).now()
    verify = await client.post(
        f"/api/v1/users/{sub}/totp/verification",
        headers=headers,
        json={"secret": secret, "code": code},
    )
    assert verify.status_code == 200, verify.text
    return secret, verify.json()["recovery_codes"]


@pytest.mark.asyncio
async def test_enroll_requires_auth(client):
    r = await client.post("/api/v1/users/anybody/totp")
    assert r.status_code == 401


@pytest.mark.asyncio
async def test_enroll_for_other_user_forbidden(client, register_payload):
    pair = await _register_and_login(client, register_payload)
    r = await client.post(
        "/api/v1/users/not-my-sub/totp",
        headers={"Authorization": f"Bearer {pair['access_token']}"},
    )
    assert r.status_code == 403


@pytest.mark.asyncio
async def test_enroll_returns_secret_and_otpauth_uri(client, register_payload):
    pair = await _register_and_login(client, register_payload)
    sub = _sub(pair["access_token"])
    r = await client.post(
        f"/api/v1/users/{sub}/totp",
        headers={"Authorization": f"Bearer {pair['access_token']}"},
    )
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["secret"]
    assert body["otpauth_uri"].startswith("otpauth://totp/")
    assert f"secret={body['secret']}" in body["otpauth_uri"]
    assert "issuer=vekko" in body["otpauth_uri"]


@pytest.mark.asyncio
async def test_verify_with_wrong_code_does_not_persist(client, register_payload):
    """Round-trip check: persisting twofa_secret without a valid first code
    would silently lock the user out on next login."""
    pair = await _register_and_login(client, register_payload)
    sub = _sub(pair["access_token"])
    headers = {"Authorization": f"Bearer {pair['access_token']}"}
    enroll = await client.post(f"/api/v1/users/{sub}/totp", headers=headers)
    secret = enroll.json()["secret"]

    bad = await client.post(
        f"/api/v1/users/{sub}/totp/verification",
        headers=headers,
        json={"secret": secret, "code": "000000"},
    )
    assert bad.status_code == 400

    # Login still returns a real pair (2FA was not persisted).
    relogin = await _password_login(client, register_payload)
    assert relogin.status_code == 200
    assert "access_token" in relogin.json()


@pytest.mark.asyncio
async def test_verify_finalizes_and_returns_recovery_codes(client, register_payload):
    pair = await _register_and_login(client, register_payload)
    _, recovery_codes = await _enroll_and_verify(client, pair["access_token"])
    assert len(recovery_codes) >= 8
    assert len(set(recovery_codes)) == len(recovery_codes)
    assert all("-" in c for c in recovery_codes)


@pytest.mark.asyncio
async def test_login_after_enroll_requires_otp(client, register_payload):
    pair = await _register_and_login(client, register_payload)
    await _enroll_and_verify(client, pair["access_token"])

    # No otp → 401 with the totp_required marker, no tokens.
    r = await _password_login(client, register_payload)
    assert r.status_code == 401
    body = r.json()
    assert body.get("totp_required") is True
    assert "access_token" not in body


@pytest.mark.asyncio
async def test_login_with_otp_returns_pair(client, register_payload):
    pair = await _register_and_login(client, register_payload)
    secret, _ = await _enroll_and_verify(client, pair["access_token"])

    r = await _password_login(client, register_payload, otp=pyotp.TOTP(secret).now())
    assert r.status_code == 200, r.text
    assert r.json()["access_token"]


@pytest.mark.asyncio
async def test_login_with_bad_otp_rejected(client, register_payload):
    pair = await _register_and_login(client, register_payload)
    await _enroll_and_verify(client, pair["access_token"])

    r = await _password_login(client, register_payload, otp="000000")
    assert r.status_code == 401
    assert r.json().get("totp_required") is True


@pytest.mark.asyncio
async def test_recovery_code_works_and_is_single_use(client, register_payload):
    pair = await _register_and_login(client, register_payload)
    _, recovery_codes = await _enroll_and_verify(client, pair["access_token"])
    a_code = recovery_codes[0]

    ok = await _password_login(client, register_payload, otp=a_code)
    assert ok.status_code == 200, ok.text

    # Replaying the same recovery code must fail (single use).
    replay = await _password_login(client, register_payload, otp=a_code)
    assert replay.status_code == 401


@pytest.mark.asyncio
async def test_disable_requires_password_and_code(client, register_payload):
    pair = await _register_and_login(client, register_payload)
    secret, _ = await _enroll_and_verify(client, pair["access_token"])
    sub = _sub(pair["access_token"])
    headers = {"Authorization": f"Bearer {pair['access_token']}"}

    # Wrong password → 401.
    bad_pw = await client.request(
        "DELETE",
        f"/api/v1/users/{sub}/totp",
        headers=headers,
        json={"password": "WrongPass99", "code": pyotp.TOTP(secret).now()},
    )
    assert bad_pw.status_code == 401

    # Wrong code → 400.
    bad_code = await client.request(
        "DELETE",
        f"/api/v1/users/{sub}/totp",
        headers=headers,
        json={"password": register_payload["password"], "code": "000000"},
    )
    assert bad_code.status_code == 400

    # Both right → 204 and subsequent login no longer requires otp.
    ok = await client.request(
        "DELETE",
        f"/api/v1/users/{sub}/totp",
        headers=headers,
        json={
            "password": register_payload["password"],
            "code": pyotp.TOTP(secret).now(),
        },
    )
    assert ok.status_code == 204

    relogin = await _password_login(client, register_payload)
    assert relogin.status_code == 200
    assert "access_token" in relogin.json()


@pytest.mark.asyncio
async def test_double_enroll_rejected(client, register_payload):
    pair = await _register_and_login(client, register_payload)
    await _enroll_and_verify(client, pair["access_token"])
    sub = _sub(pair["access_token"])

    r = await client.post(
        f"/api/v1/users/{sub}/totp",
        headers={"Authorization": f"Bearer {pair['access_token']}"},
    )
    assert r.status_code == 409
