import pytest


@pytest.mark.asyncio
async def test_login_happy(client, register_payload):
    await client.post("/api/v1/users/", json=register_payload)
    r = await client.post(
        "/api/v1/tokens/",
        json={"email": register_payload["email"], "password": register_payload["password"]},
    )
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["token_type"] == "Bearer"
    assert body["access_token"]
    assert body["refresh_token"]
    assert body["expires_in"] > 0


@pytest.mark.asyncio
async def test_login_wrong_password(client, register_payload):
    await client.post("/api/v1/users/", json=register_payload)
    r = await client.post(
        "/api/v1/tokens/",
        json={"email": register_payload["email"], "password": "WrongPass99"},
    )
    assert r.status_code == 401


@pytest.mark.asyncio
async def test_login_unknown_email(client):
    r = await client.post(
        "/api/v1/tokens/",
        json={"email": "nobody@example.com", "password": "Whatever123"},
    )
    assert r.status_code == 401
