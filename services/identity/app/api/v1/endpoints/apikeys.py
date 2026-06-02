"""API key issuance — auth.md §7 (deferred).

Not mounted in api_router yet. Will handle:
  - POST /api-keys          → issue a key (hashed at rest) scoped to a user
  - DELETE /api-keys/{id}   → revoke
Required by subject IV.1 major (public API with secured api-key).
"""
from fastapi import APIRouter

router = APIRouter()
