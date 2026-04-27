"""Google OAuth endpoints — auth.md §5 (deferred).

Not mounted in api_router yet. Will handle:
  - GET /oauth/google/login      → redirect to Google (PKCE + state)
  - GET /oauth/google/callback   → exchange code, link/create user, issue JWT pair
"""
from fastapi import APIRouter

router = APIRouter()
