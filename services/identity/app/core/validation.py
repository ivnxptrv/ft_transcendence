import re

_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def is_valid_email(value: str) -> bool:
    return bool(_EMAIL_RE.match(value))


def validate_password(value: str) -> list[str]:
    errors: list[str] = []
    if len(value) < 8:
        errors.append("Password must be at least 8 characters")
    if not re.search(r"[A-Za-z]", value):
        errors.append("Password must contain at least one letter")
    if not re.search(r"\d", value):
        errors.append("Password must contain at least one digit")
    return errors
