from logging.config import fileConfig
import asyncio  # Add this
from sqlalchemy.ext.asyncio import create_async_engine  # Add this
from sqlalchemy import engine_from_config
from sqlalchemy import pool
import os
from alembic import context

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

import sys
from os.path import abspath, dirname

# This tells Python to look in the root folder for the 'app' module
sys.path.insert(0, dirname(dirname(abspath(__file__))))

from app.database import Base
from app import models

target_metadata = Base.metadata

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# add your model's MetaData object here
# for 'autogenerate' support
# from myapp import mymodel
# target_metadata = mymodel.Base.metadata
# target_metadata = None

# other values from the config, defined by the needs of env.py,
# can be acquired:
# my_important_option = config.get_main_option("my_important_option")
# ... etc.


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection):
    """This is the actual synchronous-style call Alembic expects."""
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()


async def run_migrations_online() -> None:
    """Run migrations in 'online' mode using an Async Engine."""

    # 1. Get and Fix URL
    raw_url = os.environ.get("DATABASE_URL", "")
    async_url = raw_url.replace("postgres://", "postgresql+asyncpg://")

    # 2. Create the Async Engine
    connectable = create_async_engine(async_url)

    # 3. Use 'async with' and 'run_sync' to bridge to Alembic
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    # 4. Clean up the engine
    await connectable.dispose()


if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_migrations_online())
