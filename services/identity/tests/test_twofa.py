import pyotp
import pytest


async def _register_and_login(client, payload):
    await client.post("/api/v1/users", json=payload)
    r = await client.post(
        "/api/v1/sessions",
        json={"email": payload["email"], "password": payload["password"]},
    )
    assert r.status_code == 200, r.text
    return r.json()


async def _enroll_and_verify(client, access_token):
    """Helper: walk a user through full 2FA enrollment. Returns the TOTP secret
    plus the recovery codes (plaintext, since they're only ever shown once)."""
    headers = {"Authorization": f"Bearer {access_token}"}
    enroll = await client.post("/api/v1/users/me/2fa/enroll", headers=headers)
    assert enroll.status_code == 200, enroll.text
    secret = enroll.json()["secret"]
    code = pyotp.TOTP(secret).now()
    verify = await client.post(
        "/api/v1/users/me/2fa/verify",
        headers=headers,
        json={"secret": secret, "code": code},
    )
    assert verify.status_code == 200, verify.text
    return secret, verify.json()["recovery_codes"]


@pytest.mark.asyncio
async def test_enroll_requires_auth(client):
    r = await client.post("/api/v1/users/me/2fa/enroll")
    assert r.status_code == 401


@pytest.mark.asyncio
async def test_enroll_returns_secret_and_otpauth_uri(client, register_payload):
    pair = await _register_and_login(client, register_payload)
    r = await client.post(
        "/api/v1/users/me/2fa/enroll",
        headers={"Authorization": f"Bearer {pair['access_token']}"},
    )
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["secret"]
    assert body["otpauth_uri"].startswith("otpauth://totp/")
    assert f"secret={body['secret']}" in body["otpauth_uri"]


@pytest.mark.asyncio
async def test_verify_with_wrong_code_does_not_persist(client, register_payload):
    """Round-trip check: persisting twofa_secret without a valid first code
    would silently lock the user out on next login."""
    pair = await _register_and_login(client, register_payload)
    headers = {"Authorization": f"Bearer {pair['access_token']}"}
    enroll = await client.post("/api/v1/users/me/2fa/enroll", headers=headers)
    secret = enroll.json()["secret"]

    bad = await client.post(
        "/api/v1/users/me/2fa/verify",
        headers=headers,
        json={"secret": secret, "code": "000000"},
    )
    assert bad.status_code == 400

    # Login still returns a real pair (2FA was not persisted).
    relogin = await client.post(
        "/api/v1/sessions",
        json={
            "email": register_payload["email"],
            "password": register_payload["password"],
        },
    )
    assert relogin.status_code == 200
    assert "access_token" in relogin.json()


@pytest.mark.asyncio
async def test_verify_finalizes_and_returns_recovery_codes(client, register_payload):
    pair = await _register_and_login(client, register_payload)
    _, recovery_codes = await _enroll_and_verify(client, pair["access_token"])
    assert len(recovery_codes) >= 8
    # Codes are formatted XXXXX-XXXXX, all distinct.
    assert len(set(recovery_codes)) == len(recovery_codes)
    assert all("-" in c for c in recovery_codes)


@pytest.mark.asyncio
async def test_login_after_enroll_returns_challenge(client, register_payload):
    pair = await _register_and_login(client, register_payload)
    await _enroll_and_verify(client, pair["access_token"])

    r = await client.post(
        "/api/v1/sessions",
        json={
            "email": register_payload["email"],
            "password": register_payload["password"],
        },
    )
    assert r.status_code == 200
    body = r.json()
    assert body.get("twofa_required") is True
    assert body["challenge_token"]
    assert "access_token" not in body


@pytest.mark.asyncio
async def test_sessions_2fa_with_totp_returns_pair(client, register_payload):
    pair = await _register_and_login(client, register_payload)
    secret, _ = await _enroll_and_verify(client, pair["access_token"])

    challenge = (await client.post(
        "/api/v1/sessions",
        json={
            "email": register_payload["email"],
            "password": register_payload["password"],
        },
    )).json()
    r = await client.post(
        "/api/v1/sessions/2fa",
        json={
            "challenge_token": challenge["challenge_token"],
            "code": pyotp.TOTP(secret).now(),
        },
    )
    assert r.status_code == 200, r.text
    assert r.json()["access_token"]


@pytest.mark.asyncio
async def test_sessions_2fa_with_bad_code_rejected(client, register_payload):
    pair = await _register_and_login(client, register_payload)
    await _enroll_and_verify(client, pair["access_token"])

    challenge = (await client.post(
        "/api/v1/sessions",
        json={
            "email": register_payload["email"],
            "password": register_payload["password"],
        },
    )).json()
    r = await client.post(
        "/api/v1/sessions/2fa",
        json={"challenge_token": challenge["challenge_token"], "code": "000000"},
    )
    assert r.status_code == 401


@pytest.mark.asyncio
async def test_recovery_code_works_and_is_single_use(client, register_payload):
    pair = await _register_and_login(client, register_payload)
    _, recovery_codes = await _enroll_and_verify(client, pair["access_token"])
    a_code = recovery_codes[0]

    challenge = (await client.post(
        "/api/v1/sessions",
        json={
            "email": register_payload["email"],
            "password": register_payload["password"],
        },
    )).json()
    ok = await client.post(
        "/api/v1/sessions/2fa",
        json={"challenge_token": challenge["challenge_token"], "code": a_code},
    )
    assert ok.status_code == 200, ok.text

    # Replaying the same recovery code on a fresh challenge must fail.
    challenge2 = (await client.post(
        "/api/v1/sessions",
        json={
            "email": register_payload["email"],
            "password": register_payload["password"],
        },
    )).json()
    replay = await client.post(
        "/api/v1/sessions/2fa",
        json={"challenge_token": challenge2["challenge_token"], "code": a_code},
    )
    assert replay.status_code == 401


@pytest.mark.asyncio
async def test_disable_requires_password_and_code(client, register_payload):
    pair = await _register_and_login(client, register_payload)
    secret, _ = await _enroll_and_verify(client, pair["access_token"])
    headers = {"Authorization": f"Bearer {pair['access_token']}"}

    # Wrong password → 401.
    bad_pw = await client.request(
        "DELETE",
        "/api/v1/users/me/2fa",
        headers=headers,
        json={"password": "WrongPass99", "code": pyotp.TOTP(secret).now()},
    )
    assert bad_pw.status_code == 401

    # Wrong code → 400.
    bad_code = await client.request(
        "DELETE",
        "/api/v1/users/me/2fa",
        headers=headers,
        json={"password": register_payload["password"], "code": "000000"},
    )
    assert bad_code.status_code == 400

    # Both right → 204 and subsequent login no longer challenges.
    ok = await client.request(
        "DELETE",
        "/api/v1/users/me/2fa",
        headers=headers,
        json={
            "password": register_payload["password"],
            "code": pyotp.TOTP(secret).now(),
        },
    )
    assert ok.status_code == 204

    relogin = await client.post(
        "/api/v1/sessions",
        json={
            "email": register_payload["email"],
            "password": register_payload["password"],
        },
    )
    assert relogin.status_code == 200
    assert "access_token" in relogin.json()
    assert "twofa_required" not in relogin.json()


@pytest.mark.asyncio
async def test_double_enroll_rejected(client, register_payload):
    pair = await _register_and_login(client, register_payload)
    await _enroll_and_verify(client, pair["access_token"])

    r = await client.post(
        "/api/v1/users/me/2fa/enroll",
        headers={"Authorization": f"Bearer {pair['access_token']}"},
    )
    assert r.status_code == 409
