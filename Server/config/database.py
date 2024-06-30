from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import configparser
from pathlib import Path

# Load database configuration from a config file
configPath = Path(__file__).parent.parent.absolute() / "config.ini"
config = configparser.ConfigParser()
config.read(configPath)

# Extract database connection details from the configuration
host = config["DATABASE"]["host"]
user = config["DATABASE"]["user"]
password = config["DATABASE"]["password"]
database = config["DATABASE"]["database"]

# Define SSL arguments for secure database connection
ssl_args = {
    "ssl": {
        "ca": Path(__file__).parent.absolute() / "certs" / "ca-cert.pem",
        "cert": Path(__file__).parent.absolute() / "certs" / "client-cert.pem",
        "key": Path(__file__).parent.absolute() / "certs" / "client-key.pem",
        "check_hostname": False,
    }
}

# Create the database URL and SQLAlchemy engine
SQLALCHEMY_DATABASE_URL = f"mariadb+pymysql://{user}:{password}@{host}/{database}?charset=utf8mb4"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args=ssl_args, pool_pre_ping=True)

# Setup the session maker and declarative base for ORM
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
