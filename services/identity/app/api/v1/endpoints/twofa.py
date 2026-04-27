"""2FA (TOTP) endpoints — auth.md §6 (deferred).

Not mounted in api_router yet. Will handle:
  - POST /users/me/2fa/setup   → generate TOTP secret + otpauth URI/QR
  - POST /users/me/2fa/verify  → confirm first code, persist twofa_secret
  - /tokens login challenge flow for enrolled users (replaces the 501 guard
    currently raised in token_service.issue_pair).
"""
from fastapi import APIRouter

router = APIRouter()
