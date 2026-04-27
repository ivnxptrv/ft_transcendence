import pytest


@pytest.mark.asyncio
async def test_register_happy(client, register_payload):
    r = await client.post("/api/v1/users/", json=register_payload)
    assert r.status_code == 201, r.text
    body = r.json()
    assert body["token_type"] == "Bearer"
    assert body["access_token"]
    assert body["refresh_token"]
    assert body["expires_in"] > 0


@pytest.mark.asyncio
async def test_register_duplicate_email(client, register_payload):
    r1 = await client.post("/api/v1/users/", json=register_payload)
    assert r1.status_code == 201, r1.text
    r2 = await client.post("/api/v1/users/", json=register_payload)
    assert r2.status_code == 400


@pytest.mark.asyncio
async def test_register_invalid_email(client, register_payload):
    register_payload["email"] = "not-an-email"
    r = await client.post("/api/v1/users/", json=register_payload)
    assert r.status_code == 422


@pytest.mark.asyncio
async def test_register_weak_password(client, register_payload):
    register_payload["password"] = "short"
    r = await client.post("/api/v1/users/", json=register_payload)
    assert r.status_code == 422
