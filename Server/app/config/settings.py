import pytz
import os
import uuid
from pydantic import SecretStr
from pathlib import Path


DEFAULT_TIMEZONE = pytz.timezone("UTC")
DEFAULT_TIMEZONE_RESPONSE = pytz.timezone("Europe/Berlin")

ENVIRONMENT = os.environ.get("ENVIRONMENT", "dev")
DEBUG = True if ENVIRONMENT == "dev" else False #* Set to True for debugging
TESTING = os.environ.get("TESTING", "False") == "True" and ENVIRONMENT == "dev"


MAX_DB_NAME_LENGTH = 255
COURSE_HISTORY_DAYS = 183

# Only needed for first database setup
ROUTE_VERSIONS_BASE = {
    "main": "1.0.2",  # This is the frontend version
    "calendar": "1.0.0",
    "canteen": "1.0.0",
    "user": "1.0.0",
    "auth": "1.0.0",
    "dualis": "1.0.0",
}

# Redis
REDIS_URL = os.getenv("REDIS_HOST", "127.0.0.1")
REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))

if ENVIRONMENT == "dev":
    REDIS_PASSWORD = os.getenv("REDIS_PASSWORD", "root")
else:
    with open("/run/secrets/tsm_redis_password", "r") as file:
        REDIS_PASSWORD = file.read().strip()

# Email
# EMAIL_HOST = os.getenv("EMAIL_HOST", "localhost")
# EMAIL_PORT = int(os.getenv("EMAIL_PORT", "1025"))
# EMAIL_USERNAME = os.getenv("EMAIL_USERNAME", "")
# EMAIL_PASSWORD = SecretStr(os.getenv("EMAIL_PASSWORD", ""))
# SERVER_DOMAIN = os.getenv("SERVER_DOMAIN", "localhost:8000")


