from typing import Optional

from pydantic import BaseModel


class EnrollOut(BaseModel):
    """Pre-persist enrollment payload.

    `secret` is the raw base32 TOTP secret. The web renders the QR locally
    from `otpauth_uri` (so identity doesn't ship binary images) and also
    shows the raw secret as a fallback for users who can't scan.
    """
    secret: str
    otpauth_uri: str


class VerifyIn(BaseModel):
    # Echoed back from EnrollOut so the secret is never persisted until a
    # round-trip code proves the authenticator app stored it correctly.
    secret: str
    code: str


class VerifyOut(BaseModel):
    recovery_codes: list[str]


class DisableIn(BaseModel):
    password: str
    # Either a current TOTP code or one of the recovery codes; recovery
    # codes are accepted here so a user with a lost phone can still disable.
    code: str


class ChallengeOut(BaseModel):
    """Returned by POST /sessions when the user has 2FA enabled.

    The client must POST the challenge_token + a TOTP/recovery code to
    /sessions/2fa to receive a real TokenPair.
    """
    twofa_required: bool = True
    challenge_token: str
    expires_in: int


class TwoFAChallengeIn(BaseModel):
    challenge_token: str
    code: str
