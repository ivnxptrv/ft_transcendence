import pytest


def _password_grant(payload, otp=None):
    body = {
        "grant_type": "password",
        "email": payload["email"],
        "password": payload["password"],
    }
    if otp is not None:
        body["otp"] = otp
    return body


@pytest.mark.asyncio
async def test_login_happy(client, register_payload):
    await client.post("/api/v1/users", json=register_payload)
    r = await client.post("/api/v1/tokens", json=_password_grant(register_payload))
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["token_type"] == "Bearer"
    assert body["access_token"]
    assert body["refresh_token"]
    assert body["expires_in"] > 0
    assert body["jti"]


@pytest.mark.asyncio
async def test_login_wrong_password(client, register_payload):
    await client.post("/api/v1/users", json=register_payload)
    r = await client.post(
        "/api/v1/tokens",
        json={
            "grant_type": "password",
            "email": register_payload["email"],
            "password": "WrongPass99",
        },
    )
    assert r.status_code == 401


@pytest.mark.asyncio
async def test_login_unknown_email(client):
    r = await client.post(
        "/api/v1/tokens",
        json={
            "grant_type": "password",
            "email": "nobody@example.com",
            "password": "Whatever123",
        },
    )
    assert r.status_code == 401


@pytest.mark.asyncio
async def test_login_missing_grant_type_is_422(client, register_payload):
    await client.post("/api/v1/users", json=register_payload)
    r = await client.post(
        "/api/v1/tokens",
        json={"email": register_payload["email"], "password": register_payload["password"]},
    )
    assert r.status_code == 422
