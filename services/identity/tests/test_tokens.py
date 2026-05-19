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
async def test_refresh_rotates_pair(client, register_payload):
    pair = await _login(client, register_payload)

    rotated = await client.post(
        "/api/v1/sessions/refresh", json={"refresh_token": pair["refresh_token"]}
    )
    assert rotated.status_code == 200, rotated.text
    new_pair = rotated.json()
    assert new_pair["refresh_token"] != pair["refresh_token"]


@pytest.mark.asyncio
async def test_refresh_within_grace_allows_concurrent(client, register_payload):
    """Multi-tab safety: two near-simultaneous refreshes with the same token
    must both succeed, otherwise tabs race and lose."""
    pair = await _login(client, register_payload)

    r1 = await client.post(
        "/api/v1/sessions/refresh", json={"refresh_token": pair["refresh_token"]}
    )
    r2 = await client.post(
        "/api/v1/sessions/refresh", json={"refresh_token": pair["refresh_token"]}
    )
    assert r1.status_code == 200, r1.text
    assert r2.status_code == 200, r2.text

    p1 = r1.json()
    p2 = r2.json()
    # Each concurrent caller gets its own fresh pair, so the chains fan out.
    assert p1["refresh_token"] != pair["refresh_token"]
    assert p2["refresh_token"] != pair["refresh_token"]
    assert p1["refresh_token"] != p2["refresh_token"]


@pytest.mark.asyncio
async def test_refresh_outside_grace_fails(client, db_session, register_payload):
    """Past the grace window, replaying a rotated refresh is treated as theft."""
    from datetime import datetime, timedelta, timezone
    from sqlalchemy import update

    from app.core import jwt as jwt_core
    from app.models.token import Token

    pair = await _login(client, register_payload)
    jti = jwt_core.decode(pair["refresh_token"], expected_type="refresh")["jti"]

    first = await client.post(
        "/api/v1/sessions/refresh", json={"refresh_token": pair["refresh_token"]}
    )
    assert first.status_code == 200

    # Simulate the grace window having elapsed by backdating rotated_at.
    await db_session.execute(
        update(Token)
        .where(Token.jti == jti)
        .values(rotated_at=datetime.now(timezone.utc) - timedelta(seconds=999))
    )
    await db_session.commit()

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
