from pydantic import BaseModel, UUID4
from typing import Optional, List
from datetime import datetime

from config.general import DEFAULT_TIMEZONE

###########################################################################
################################# Sontiges ################################
###########################################################################
class CalendarCustomBase(BaseModel):
    course_name: str


class CalendarCustomCreate(CalendarCustomBase):
    university_id: Optional[UUID4] = None
    source_backend: str
    source_url: str


class CalendarCustom(CalendarCustomBase):
    university_name: str
    data: dict
    hash: str
    refresh_interval: int
    verified: bool
    last_modified: datetime

    class Config:
        from_attributes = True


class University(BaseModel):
    id: int
    address_id: int
    name: str
    rooms: dict
    last_modified: datetime

    class Config:
        from_attributes = True


class CalendarBackend(BaseModel):
    id: int
    name: str
    last_modified: datetime

    class Config:
        from_attributes = True


# ======================================================== #
# ======================= Requests ======================= #
# ======================================================== #


class NativeCalenderIdentifier(BaseModel):
    university_uuid: UUID4
    course_name: str


# ======================================================== #
# ======================= Responses ====================== #
# ======================================================== #
class ResAvailableNativeCalendars(BaseModel):
    university_name: str
    university_uuid: UUID4
    course_names: List[str]


class ResEventDescription(BaseModel):
    tags: List[str] = []
    lecturer: str = ""


class ResEvent(BaseModel):
    start: str
    end: str
    summary: str
    location: str
    description: ResEventDescription


class ResEventData(BaseModel):
    X_WR_TIMEZONE: str = DEFAULT_TIMEZONE.zone
    events: List[ResEvent]


class ResCalendar(BaseModel):
    university_name: Optional[str] = None
    course_name: str
    data: ResEventData
    hash: datetime
    last_modified: datetime


# ======================================================== #
# ============== Calendar Response Structure ============= #
# ======================================================== #


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


class EventData(BaseModel):
    """Represents a collection of events along with metadata."""

    X_WR_TIMEZONE: str = DEFAULT_TIMEZONE.zone
    events: List[Event]


class CourseData(BaseModel):
    """Represents the data for a single course."""

    data: EventData
    hash: str


class RoomAvailabilityResponse(BaseModel):
    room_name: str
    last_booked: Optional[datetime] = None
    next_booked: Optional[datetime] = None
