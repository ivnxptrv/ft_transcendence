"""Test bootstrap.

Sets env vars BEFORE the app is imported (so `app.config.Settings`, which
reads `os.environ` at class-body time, picks them up):
  - throwaway RSA keypair for JWT signing
  - file-backed SQLite DB so multiple AsyncSession connections see the same
    schema (`:memory:` would give each connection its own empty DB)
"""
import os
import tempfile
from pathlib import Path

from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa

_TMP = Path(tempfile.mkdtemp(prefix="identity-tests-"))
_PRIV = _TMP / "private.pem"
_PUB = _TMP / "public.pem"
_DB = _TMP / "test.db"

_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
_PRIV.write_bytes(
    _key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.TraditionalOpenSSL,
        encryption_algorithm=serialization.NoEncryption(),
    )
)
_PUB.write_bytes(
    _key.public_key().public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo,
    )
)

os.environ["JWT_PRIVATE_KEY_PATH"] = str(_PRIV)
os.environ["JWT_PUBLIC_KEY_PATH"] = str(_PUB)
os.environ["DATABASE_URL"] = f"sqlite+aiosqlite:///{_DB}"
os.environ.setdefault("BCRYPT_COST", "4")  # speed up password hashing in tests

import pytest  # noqa: E402
import pytest_asyncio  # noqa: E402
from httpx import ASGITransport, AsyncClient  # noqa: E402

from app.database import Base, SessionLocal, engine  # noqa: E402
from app.dependencies import get_db  # noqa: E402
from app.main import app  # noqa: E402


@pytest_asyncio.fixture
async def db_session():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async with SessionLocal() as session:
        yield session
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture
async def client(db_session):
    async def _override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = _override_get_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()


@pytest.fixture
def register_payload():
    return {
        "email": "alice@example.com",
        "password": "Hunter2pass",
        "first_name": "Alice",
        "last_name": "Doe",
    }
