from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.exc import OperationalError
from sqlalchemy import event, text, DateTime
from sqlalchemy.types import TypeDecorator, DateTime
from sqlalchemy.orm import Mapper
import os
from contextlib import asynccontextmanager
from rich.console import Console
from urllib.parse import quote_plus
import time
import asyncio
from typing import AsyncIterator


from config.database import Base
from config.settings import DEFAULT_TIMEZONE, ENVIRONMENT

console = Console()

# Set max retries and delay between retries
MAX_RETRIES = 5
RETRY_WAIT_SECONDS = 10


async def check_db_connection(engine):
    """
    Check the database connection and retry if it fails

    :param engine: The database engine
    """
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            async with engine.connect() as conn:
                await conn.execute(text("SELECT 1"))
            return
        except OperationalError as e:
            console.log(f"Database connection failed, retrying... (attempt {attempt}/{MAX_RETRIES})")
            if attempt < MAX_RETRIES:
                console.log(f"Waiting {RETRY_WAIT_SECONDS} seconds before retrying...")
                await asyncio.sleep(RETRY_WAIT_SECONDS)
            else:
                raise RuntimeError(
                    f"Database connection failed after {MAX_RETRIES} attempts (URL: {engine.url})"
                ) from e


if ENVIRONMENT == "dev":
    db_host = os.getenv("DB_HOST", "127.0.0.1")
    SQLALCHEMY_DATABASE_URL = f"root:root@{db_host}:3306/tsm"
    ssl_args = {}
else:
    db_host = os.getenv("DB_HOST")
    db_database = os.getenv("DB_DATABASE")
    db_user = os.getenv("DB_USER")

    # Get Docker secrets for the database user and password
    try:
        ssl_args = {
            "ssl": {
                "cert": "/run/secrets/tsm_db_cert",
                "key": "/run/secrets/tsm_db_key",
                "check_hostname": False,
                "ca": "/run/secrets/tsm_mariadb_ca_cert",
            }
        }
        with open("/run/secrets/tsm_db_password", "r") as file:
            db_password = file.read().strip()
            encoded_db_password = quote_plus(db_password)
        with open("/run/secrets/tsm_db_cert_password", "r") as file:
            cert_password = file.read().strip()
            ssl_args["ssl"]["passphrase"] = cert_password
    except FileNotFoundError as e:
        raise RuntimeError("Database user and password secrets not found") from e

    SQLALCHEMY_DATABASE_URL = f"{db_user}:{encoded_db_password}@{db_host}:3306/{db_database}"

engine = create_async_engine(
    f"mysql+asyncmy://{SQLALCHEMY_DATABASE_URL}",
    connect_args=ssl_args,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,
)


@event.listens_for(engine.sync_engine, "connect")
def set_session_timezone(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute(f"SET time_zone = '{DEFAULT_TIMEZONE.zone}'")
    cursor.close()


AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, future=True, autocommit=False)


async def get_db() -> AsyncIterator[AsyncSession]:
    db = AsyncSessionLocal()
    try:
        yield db
    finally:
        await db.close()


@asynccontextmanager
async def get_async_session():
    db = AsyncSessionLocal()
    try:
        yield db
    finally:
        await db.close()



class UTCDateTime(TypeDecorator):
    impl = DateTime(timezone=False)
    cache_ok = True

    def process_bind_param(self, value, dialect):
        # Python → DB
        if value is None:
            return None
        if value.tzinfo is not None:
            # in UTC konvertieren und tzinfo entfernen
            value = value.astimezone(DEFAULT_TIMEZONE).replace(tzinfo=None)
        return value

    def process_result_value(self, value, dialect):
        # DB → Python
        if value is None:
            return None
        # aus naivem UTC ein tz-aware UTC machen
        return DEFAULT_TIMEZONE.localize(value)


@event.listens_for(Mapper, "mapper_configured")
def _replace_datetime(mapper_, class_):
    for prop in mapper_.iterate_properties:
        for col in getattr(prop, "columns", []):
            if isinstance(col.type, DateTime):
                col.type = UTCDateTime()