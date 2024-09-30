from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, declarative_base
import configparser
from pathlib import Path
import os
from rich.console import Console

from config.general import DEFAULT_TIMEZONE, ENVIRONMENT
from config.db_certs import generate_client_cert


# Generate a client certificate if it is the first boot
first_boot = os.getenv("FIRST_BOOT", "true").lower() == "true"
if first_boot:
    console = Console()
    generate_client_cert(console)
    os.environ["FIRST_BOOT"] = "false"

ssl_args = {
    "ssl": {
        "cert": "./config/certs/client-cert.pem",
        "key": "./config/certs/client-key.pem",
        "check_hostname": False,
    }
}

if ENVIRONMENT == "dev":
    # Load database configuration from a config file
    configPath = Path(os.getenv("CONFIG_PATH", Path(__file__).parent.parent.absolute() / "config.ini"))
    config = configparser.ConfigParser()
    config.read(configPath)

    # Extract database connection details from the configuration
    db_host = config["DATABASE"]["host"]
    db_user = config["DATABASE"]["user"]
    db_password = config["DATABASE"]["password"]
    db_database = config["DATABASE"]["database"]
    ssl_args["ssl"]["passphrase"] = "devpassword"
    ssl_args["ssl"]["ca"] = "./config/certs/ca-cert.pem"

elif ENVIRONMENT == "prod":
    # Extract database connection details from the environment variables
    host = os.getenv("DB_HOST")
    database = os.getenv("DB_DATABASE")

    # Get Docker secrets for the database user and password
    try:
        with open("/run/secrets/the_student_master_db_user", "r") as file:
            db_user = file.read().strip()
        with open("/run/secrets/the_student_master_db_password", "r") as file:
            db_password = file.read().strip()
        with open("/run/secrets/the_student_master_db_cert_password", "r") as file:
            cert_password = file.read().strip()
            ssl_args["ssl"]["passphrase"] = cert_password

        ssl_args["ssl"]["ca"] = "/run/secrets/the_student_master_db_ca_cert"
    except FileNotFoundError as e:
        raise RuntimeError("Database user and password secrets not found") from e
else:
    raise RuntimeError("Invalid environment, must be either dev or prod")

# Create the database URL and SQLAlchemy engine
SQLALCHEMY_DATABASE_URL = f"mariadb+pymysql://{db_user}:{db_password}@{db_host}/{db_database}?charset=utf8mb4"
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
