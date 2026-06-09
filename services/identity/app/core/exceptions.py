class TotpRequired(Exception):
    """Raised by the password grant when the user has TOTP enabled and no
    valid `otp` was supplied (absent or wrong code).

    Surfaced by an exception handler as 401 with a `totp_required` marker so
    the web client knows to prompt for the code and re-POST the same grant.
    """
