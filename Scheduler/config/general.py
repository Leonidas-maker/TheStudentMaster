import pytz
import os
import configparser
from pathlib import Path

ENVIRONMENT = os.getenv("ENVIRONMENT", "dev")
DEFAULT_TIMEZONE = pytz.timezone("UTC")
DEFAULT_TIMEZONE_RESPONSE = pytz.timezone("Europe/Berlin")
MAX_COURSE_NAME_LENGTH = 255
COURSE_HISTORY_DAYS = 90

# Only needed for first database setup
ROUTE_VERSIONS_BASE = {
    "main": "1.0.2",  # This is the frontend version
    "calendar": "1.0.0",
    "canteen": "1.0.0",
    "user": "1.0.0",
    "auth": "1.0.0",
}


class Config:
    def __init__(self):
        configPath = Path(os.getenv("CONFIG_PATH", Path(__file__).parent.parent.absolute() / "config.ini"))
        config = configparser.ConfigParser()
        config.read(configPath)

        self.config = config

    def get(self, section: str, key: str):
        return self.config[section][key]
