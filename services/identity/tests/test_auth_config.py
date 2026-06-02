"""Locks the field names and shape of /.well-known/auth-config.

Web (and any other consumer) depends on these exact keys. Renaming a field
in keys.py without updating consumers should fail here, before it ships.
"""
import pytest


EXPECTED_FIELDS = {
    "issuer",
    "audience",
    "refresh_ttl_seconds",
    "register_endpoint",
    "login_endpoint",
    "refresh_endpoint",
    "logout_endpoint",
    "me_endpoint",
}


@pytest.mark.asyncio
async def test_auth_config_exposes_all_expected_fields(client):
    r = await client.get("/.well-known/auth-config")
    assert r.status_code == 200, r.text
    body = r.json()
    assert set(body.keys()) == EXPECTED_FIELDS


@pytest.mark.asyncio
async def test_auth_config_endpoint_paths_match_real_routes(client):
    """The paths advertised in the discovery doc must actually resolve."""
    r = await client.get("/.well-known/auth-config")
    config = r.json()

    # Register endpoint must accept a registration payload.
    register = await client.post(
        config["register_endpoint"],
        json={
            "email": "discovery@example.com",
            "password": "Hunter2pass",
            "role": "client",
            "first_name": "D",
            "last_name": "C",
        },
    )
    assert register.status_code == 201, register.text
    pair = register.json()

    # Login endpoint must accept credentials.
    login = await client.post(
        config["login_endpoint"],
        json={"email": "discovery@example.com", "password": "Hunter2pass"},
    )
    assert login.status_code == 200, login.text

    # Refresh endpoint must rotate the pair.
    refresh = await client.post(
        config["refresh_endpoint"],
        json={"refresh_token": pair["refresh_token"]},
    )
    assert refresh.status_code == 200, refresh.text
    rotated = refresh.json()

    # Me endpoint must return the authenticated user.
    me = await client.get(
        config["me_endpoint"],
        headers={"Authorization": f"Bearer {rotated['access_token']}"},
    )
    assert me.status_code == 200, me.text
    assert me.json()["email"] == "discovery@example.com"

    # Logout endpoint must revoke the current refresh token.
    logout = await client.request(
        "DELETE",
        config["logout_endpoint"],
        json={"refresh_token": rotated["refresh_token"]},
        headers={"Authorization": f"Bearer {rotated['access_token']}"},
    )
    assert logout.status_code == 204


@pytest.mark.asyncio
async def test_auth_config_issuer_and_audience_match_actual_tokens(client):
    """If the discovery doc's iss/aud don't match what identity puts in
    tokens, every consumer's verification will fail."""
    config = (await client.get("/.well-known/auth-config")).json()

    await client.post(
        "/api/v1/users",
        json={
            "email": "claims@example.com",
            "password": "Hunter2pass",
            "role": "client",
            "first_name": "C",
            "last_name": "L",
        },
    )
    pair = (
        await client.post(
            "/api/v1/sessions",
            json={"email": "claims@example.com", "password": "Hunter2pass"},
        )
    ).json()

    # Decode without verifying signature — we only care that the claims
    # match what discovery advertises.
    import jwt as pyjwt

    payload = pyjwt.decode(pair["access_token"], options={"verify_signature": False})
    assert payload["iss"] == config["issuer"]
    assert payload["aud"] == config["audience"]


@pytest.mark.asyncio
async def test_auth_config_refresh_ttl_is_positive_int(client):
    config = (await client.get("/.well-known/auth-config")).json()
    assert isinstance(config["refresh_ttl_seconds"], int)
    assert config["refresh_ttl_seconds"] > 0
