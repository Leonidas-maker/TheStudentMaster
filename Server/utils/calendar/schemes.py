from pydantic import BaseModel, field_validator, field_serializer, Field, RootModel
from typing import List, Dict, Optional, Union
from dateutil import parser
import pytz
from datetime import datetime

# ~~~~~~~~~~~~~~~~~ Config ~~~~~~~~~~~~~~~~ #
DEFAULT_TIMEZONE = pytz.timezone("Europe/Berlin")


###########################################################################
################################### Base ##################################
###########################################################################
class EventDescription(BaseModel):
    """Represents the description of an event."""

    tags: List[str] = []
    lecturer: str = ""
    id: int


class Event(BaseModel):
    """Represents a single event in the calendar."""

    start: str
    end: str
    summary: str
    location: str
    description: EventDescription

    # Serialize the 'start' and 'end' fields to a string in ISO format
    @field_validator('start', 'end', mode='before')
    def serialize_time(cls, value: Union[str, datetime]) -> str:
        if isinstance(value, str):
            value = parser.parse(value)
            # Ensure that the datetime is timezone-aware
            if value.tzinfo is None:
                # Assume the datetime is in UTC if not timezone-aware
                value = pytz.utc.localize(value)

            # Convert to the desired timezone (e.g., Europe/Berlin)
            return value.astimezone(DEFAULT_TIMEZONE).isoformat()
        elif isinstance(value, datetime):
            return value.astimezone(DEFAULT_TIMEZONE).isoformat()
        else:
            raise ValueError(f"Invalid type for 'start' or 'end': {type(value)}")


class EventData(BaseModel):
    """Represents a collection of events along with metadata."""

    X_WR_TIMEZONE: str = Field(DEFAULT_TIMEZONE.zone, alias="X-WR-TIMEZONE")
    events: List[Event]

    @field_validator("X_WR_TIMEZONE", mode="before")
    def force_default_timezone(cls, value):
        return DEFAULT_TIMEZONE.zone


class CourseData(BaseModel):
    """Represents the data for a single course."""

    data: EventData
    hash: str


class DHBWCourse(BaseModel):
    """Represents a collection of courses."""
    data: Dict[str, CourseData]


# ======================================================== #
# ===================== UpdatesBases ===================== #
# ======================================================== #
class DHBWUpdateSiteBase(BaseModel):
    """Represents the data structure for updating a DHBW calendar site."""

    new: Dict[str, Dict[int, Event]]
    updated: Dict[str, Dict[int, Event]]
    deleted: List[str]


class DHBWUpdateCalendar(BaseModel):
    """Represents the data structure for updating a DHBW calendar."""
    X_WR_TIMEZONE: str = Field(DEFAULT_TIMEZONE.zone, alias="X-WR-TIMEZONE")
    data: Dict[str, DHBWUpdateSiteBase]

    @field_validator("X_WR_TIMEZONE", mode="before")
    def force_default_timezone(cls, value):
        return DEFAULT_TIMEZONE.zone
