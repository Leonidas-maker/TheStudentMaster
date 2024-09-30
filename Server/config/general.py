import pytz
import os

ENVIRONMENT = os.getenv("ENVIRONMENT", "dev")
DEFAULT_TIMEZONE = pytz.timezone("UTC")
DEFAULT_TIMEZONE_RESPONSE = pytz.timezone("Europe/Berlin")
MAX_COURSE_NAME_LENGTH = 255