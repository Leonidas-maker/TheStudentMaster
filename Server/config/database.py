from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from rich.console import Console
from urllib.parse import quote_plus

from config.general import DEFAULT_TIMEZONE, ENVIRONMENT, Config


if ENVIRONMENT == "dev":
    # Load database configuration from a config file
    server_config = Config()

    # Extract database connection details from the configuration
    db_host = server_config.get("DATABASE", "host")
    db_user = server_config.get("DATABASE", "user")
    db_password = server_config.get("DATABASE", "password")
    db_database = server_config.get("DATABASE", "database")
    encoded_db_password = quote_plus(db_password)

    ssl_args = {
        "ssl": {
            "cert": "./config/certs/client-cert.pem",
            "key": "./config/certs/client-key.pem",
            "check_hostname": False,
            "ca": "./config/certs/ca-cert.pem",
        }
    }

elif ENVIRONMENT == "prod":
    # Extract database connection details from the environment variables
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
else:
    raise RuntimeError("Invalid environment, must be either dev or prod")

# Create the database URL and SQLAlchemy engine
SQLALCHEMY_DATABASE_URL = f"mariadb+pymysql://{db_user}:{encoded_db_password}@{db_host}/{db_database}?charset=utf8mb4"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args=ssl_args, pool_pre_ping=True)


# Set the timezone for the database connection
@event.listens_for(engine, "connect")
def set_session_timezone(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute(f"SET time_zone = '{DEFAULT_TIMEZONE.zone}'")
    cursor.close()


# Setup the session maker and declarative base for ORM
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
