"""Public API module (subject IV.1, Major): API-key lifecycle, X-API-Key
auth, rate limiting, and the gateway endpoints.

Gateway forwarding is monkeypatched so these tests stay hermetic — they prove
identity's auth/rate-limit/validation layer, not the peer services.
"""
import jwt as pyjwt
import pytest

from app.services import gateway


def _sub(token: str) -> str:
    return pyjwt.decode(token, options={"verify_signature": False})["sub"]


async def _access_token(client, payload) -> str:
    """Register a user; registration returns a token pair directly."""
    res = await client.post("/api/v1/users", json=payload)
    assert res.status_code == 201, res.text
    return res.json()["access_token"]


async def _issue_key(client, token, name="ci") -> dict:
    res = await client.post(
        "/api/v1/api-keys",
        headers={"Authorization": f"Bearer {token}"},
        json={"name": name},
    )
    assert res.status_code == 201, res.text
    return res.json()


# --- key lifecycle ---------------------------------------------------------


@pytest.mark.asyncio
async def test_issue_key_returns_plaintext_once(client, register_payload):
    token = await _access_token(client, register_payload)
    body = await _issue_key(client, token)
    assert body["key"].startswith("vk_")
    assert body["prefix"] == body["key"][:10]
    assert body["revoked_at"] is None
    # listing never leaks the secret
    listed = await client.get(
        "/api/v1/api-keys", headers={"Authorization": f"Bearer {token}"}
    )
    assert listed.status_code == 200
    rows = listed.json()
    assert len(rows) == 1
    assert "key" not in rows[0]
    assert rows[0]["id"] == body["id"]


@pytest.mark.asyncio
async def test_issue_key_requires_jwt(client):
    res = await client.post("/api/v1/api-keys", json={"name": "nope"})
    assert res.status_code == 401


# --- X-API-Key auth on the public surface ---------------------------------


@pytest.mark.asyncio
async def test_public_requires_api_key(client):
    res = await client.get("/api/v1/public/orders/1")
    assert res.status_code == 401


@pytest.mark.asyncio
async def test_public_rejects_unknown_key(client):
    res = await client.get(
        "/api/v1/public/orders/1", headers={"X-API-Key": "vk_not_a_real_key"}
    )
    assert res.status_code == 401


@pytest.mark.asyncio
async def test_get_order_forwards_with_valid_key(
    client, register_payload, monkeypatch
):
    token = await _access_token(client, register_payload)
    key = await _issue_key(client, token)

    async def fake_forward(method, url, **kwargs):
        assert method == "GET"
        assert url.endswith("/api/v1/orders/7")
        return {"id": 7, "title": "t", "text": "x"}

    monkeypatch.setattr(gateway, "forward", fake_forward)
    res = await client.get(
        "/api/v1/public/orders/7", headers={"X-API-Key": key["key"]}
    )
    assert res.status_code == 200
    assert res.json()["id"] == 7
    assert res.headers["X-RateLimit-Limit"]


@pytest.mark.asyncio
async def test_create_order_validates_body(client, register_payload):
    token = await _access_token(client, register_payload)
    key = await _issue_key(client, token)
    # missing required `text` → 422 before any forwarding happens
    res = await client.post(
        "/api/v1/public/orders",
        headers={"X-API-Key": key["key"]},
        json={"title": "only title"},
    )
    assert res.status_code == 422


@pytest.mark.asyncio
async def test_put_order_maps_to_patch(client, register_payload, monkeypatch):
    token = await _access_token(client, register_payload)
    key = await _issue_key(client, token)

    seen = {}

    async def fake_forward(method, url, **kwargs):
        seen["method"] = method
        seen["json"] = kwargs.get("json")
        return {"id": 3, "title": "new", "text": "body"}

    monkeypatch.setattr(gateway, "forward", fake_forward)
    res = await client.put(
        "/api/v1/public/orders/3",
        headers={"X-API-Key": key["key"]},
        json={"title": "new", "text": "body"},
    )
    assert res.status_code == 200
    assert seen["method"] == "PATCH"
    assert seen["json"] == {"title": "new", "text": "body"}


@pytest.mark.asyncio
async def test_revoked_key_is_rejected(client, register_payload):
    token = await _access_token(client, register_payload)
    key = await _issue_key(client, token)
    res = await client.delete(
        f"/api/v1/api-keys/{key['id']}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == 204
    after = await client.get(
        "/api/v1/public/orders/1", headers={"X-API-Key": key["key"]}
    )
    assert after.status_code == 401


# --- rate limiting ---------------------------------------------------------


@pytest.mark.asyncio
async def test_rate_limit_returns_429(client, register_payload, monkeypatch):
    from app import dependencies

    token = await _access_token(client, register_payload)
    key = await _issue_key(client, token)

    async def fake_forward(method, url, **kwargs):
        return {"id": 1}

    monkeypatch.setattr(gateway, "forward", fake_forward)
    # Squeeze the window down to 1 hit and reset any prior state for this key.
    monkeypatch.setattr(dependencies._rate_limiter, "limit", 1)
    dependencies._rate_limiter._hits.clear()

    headers = {"X-API-Key": key["key"]}
    first = await client.get("/api/v1/public/orders/1", headers=headers)
    assert first.status_code == 200
    second = await client.get("/api/v1/public/orders/1", headers=headers)
    assert second.status_code == 429
    assert second.headers["Retry-After"]


# --- local delete user -----------------------------------------------------


@pytest.mark.asyncio
async def test_delete_user_local(client, register_payload):
    owner_token = await _access_token(client, register_payload)
    key = await _issue_key(client, owner_token)

    # the owner's sub is the JWT subject
    sub = _sub(owner_token)

    res = await client.delete(
        f"/api/v1/public/users/{sub}", headers={"X-API-Key": key["key"]}
    )
    assert res.status_code == 204

    # second delete → gone
    again = await client.delete(
        f"/api/v1/public/users/{sub}", headers={"X-API-Key": key["key"]}
    )
    assert again.status_code == 404


@pytest.mark.asyncio
async def test_delete_user_is_self_only(client, register_payload):
    # owner A
    token_a = await _access_token(client, register_payload)
    key_a = await _issue_key(client, token_a)

    # owner B (different email)
    payload_b = {**register_payload, "email": "bob@example.com"}
    token_b = await _access_token(client, payload_b)
    sub_b = _sub(token_b)

    # A's key may not delete B
    res = await client.delete(
        f"/api/v1/public/users/{sub_b}", headers={"X-API-Key": key_a["key"]}
    )
    assert res.status_code == 403

    # B is still there: B can delete themselves
    key_b = await _issue_key(client, token_b)
    ok = await client.delete(
        f"/api/v1/public/users/{sub_b}", headers={"X-API-Key": key_b["key"]}
    )
    assert ok.status_code == 204
