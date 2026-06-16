from typing import Annotated, Literal, Optional, Union

from pydantic import BaseModel, Field


class PasswordGrantIn(BaseModel):
    """RFC 6749 §4.3 resource-owner password grant.

    `otp` is an extension parameter (§8.2): when the user has TOTP enabled it
    carries the 6-digit code (or a recovery code) in the same request, so login
    stays a single round-trip instead of a challenge handoff.
    """

    grant_type: Literal["password"]
    email: str
    password: str
    otp: Optional[str] = None


class RefreshGrantIn(BaseModel):
    """RFC 6749 §6 refresh-token grant."""

    grant_type: Literal["refresh_token"]
    refresh_token: str


# POST /api/v1/tokens accepts either grant, discriminated on grant_type.
TokenCreateIn = Annotated[
    Union[PasswordGrantIn, RefreshGrantIn], Field(discriminator="grant_type")
]


class GoogleAuthIn(BaseModel):
    """Verified Google profile forwarded by the web BFF after the code
    exchange. Trusted because the API is internal (service-to-service only)."""

    google_id: str
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None


class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "Bearer"
    expires_in: int
    # jti of the refresh token — the caller revokes via DELETE /tokens/{jti}.
    jti: str
