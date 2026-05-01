import pytest


async def _login(client, payload) -> dict:
    await client.post("/api/v1/users", json=payload)
    r = await client.post(
        "/api/v1/sessions",
        json={"email": payload["email"], "password": payload["password"]},
    )
    assert r.status_code == 200, r.text
    return r.json()


@pytest.mark.asyncio
async def test_refresh_rotates_and_revokes_old(client, register_payload):
    pair = await _login(client, register_payload)

    rotated = await client.post(
        "/api/v1/sessions/refresh", json={"refresh_token": pair["refresh_token"]}
    )
    assert rotated.status_code == 200, rotated.text
    new_pair = rotated.json()
    assert new_pair["refresh_token"] != pair["refresh_token"]

    # Re-using the old refresh token must fail (rotation invalidated it).
    replay = await client.post(
        "/api/v1/sessions/refresh", json={"refresh_token": pair["refresh_token"]}
    )
    assert replay.status_code == 401


@pytest.mark.asyncio
async def test_logout_revokes_refresh(client, register_payload):
    pair = await _login(client, register_payload)

    logout = await client.request(
        "DELETE",
        "/api/v1/sessions",
        json={"refresh_token": pair["refresh_token"]},
        headers={"Authorization": f"Bearer {pair['access_token']}"},
    )
    assert logout.status_code == 204

    after = await client.post(
        "/api/v1/sessions/refresh", json={"refresh_token": pair["refresh_token"]}
    )
    assert after.status_code == 401


@pytest.mark.asyncio
async def test_logout_requires_bearer(client, register_payload):
    pair = await _login(client, register_payload)

    r = await client.request(
        "DELETE", "/api/v1/sessions", json={"refresh_token": pair["refresh_token"]}
    )
    assert r.status_code == 401  # missing Authorization header


@pytest.mark.asyncio
async def test_invalid_refresh_token_rejected(client):
    r = await client.post(
        "/api/v1/sessions/refresh", json={"refresh_token": "not-a-jwt"}
    )
    assert r.status_code == 401


@pytest.mark.asyncio
async def test_access_token_carries_role_claim(client, register_payload):
    """Web reads payload.role to authorize routes — make sure it's there."""
    from app.core import jwt as jwt_core

    register_payload["role"] = "insider"
    pair = await _login(client, register_payload)
    payload = jwt_core.decode(pair["access_token"], expected_type="access")
    assert payload["role"] == "insider"


@pytest.mark.asyncio
async def test_get_current_user_dependency(client, register_payload):
    """get_current_user decodes a valid access token and rejects bad ones."""
    from fastapi import Depends

    from app.dependencies import get_current_user
    from app.main import app

    @app.get("/api/v1/_test/me")
    async def _me(user=Depends(get_current_user)):
        return {"sub": user.sub, "email": user.email}

    pair = await _login(client, register_payload)

    ok = await client.get(
        "/api/v1/_test/me",
        headers={"Authorization": f"Bearer {pair['access_token']}"},
    )
    assert ok.status_code == 200, ok.text
    assert ok.json()["email"] == register_payload["email"]

    bad = await client.get(
        "/api/v1/_test/me", headers={"Authorization": "Bearer not-a-jwt"}
    )
    assert bad.status_code == 401

    missing = await client.get("/api/v1/_test/me")
    assert missing.status_code == 401  # missing Authorization header


@pytest.mark.asyncio
async def test_users_me_returns_profile(client, register_payload):
    pair = await _login(client, register_payload)
    r = await client.get(
        "/api/v1/users/me",
        headers={"Authorization": f"Bearer {pair['access_token']}"},
    )
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["email"] == register_payload["email"]
    assert body["role"] == register_payload["role"]
    assert body["first_name"] == register_payload["first_name"]
    assert body["last_name"] == register_payload["last_name"]
    # `id` is the UUID `sub`, not the autoincrement PK.
    assert isinstance(body["id"], str) and len(body["id"]) >= 32


@pytest.mark.asyncio
async def test_jwks_at_host_root(client):
    r = await client.get("/.well-known/jwks.json")
    assert r.status_code == 200
    body = r.json()
    assert isinstance(body.get("keys"), list) and body["keys"]
    assert body["keys"][0]["kty"] == "RSA"
