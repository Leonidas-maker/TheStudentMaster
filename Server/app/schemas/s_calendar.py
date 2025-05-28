from pydantic import BaseModel, UUID4, ConfigDict, field_validator, field_serializer, Field, computed_field
from dateutil import parser
import pytz
import hashlib
from typing import Union
from typing import Optional, List, Dict, Set
from datetime import datetime
from dataclasses import dataclass, field



from config.settings import DEFAULT_TIMEZONE

from models import m_calendar



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


class NativeCalendarIdentifier(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID4 = Field(..., alias="university_uuid")
    course_name: str

    @field_validator("course_name", mode="before")
    def normalize_course_name(cls, v: str) -> str:
        return v.replace("_", " ").strip()


# ======================================================== #
# ======================= Responses ====================== #
# ======================================================== #
class ResAvailableNativeCalendars(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    university_name: str = Field(..., alias="name")
    university_uuid: UUID4 = Field(..., alias="id")
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
    X_WR_TIMEZONE: str = DEFAULT_TIMEZONE.zone or ""
    events: List[ResEvent]


class ResCalendar(BaseModel):
    university_name: Optional[str] = None
    course_name: str = Field(..., alias="name")
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

    X_WR_TIMEZONE: str = DEFAULT_TIMEZONE.zone or ""
    events: List[Event]


class CourseData(BaseModel):
    """Represents the data for a single course."""

    data: EventData
    hash: str


class RoomAvailabilityResponse(BaseModel):
    room_name: str
    last_booked: Optional[datetime] = None
    next_booked: Optional[datetime] = None




###########################################################################
################################# DHBW.APP ################################
###########################################################################
class ApiLectureDTO(BaseModel):
    date: datetime
    site: str
    lecturer: Optional[str] = Field(default=None)
    startTime: datetime
    endTime: datetime
    name: str
    type: str
    rooms: List[str]
    course: str
    id: int


class ApiChangeInfoDTO(BaseModel):
    fieldName: str
    fieldType: str
    previousValue: str
    value: str
    id: int


class ApiUpdatedLectureDTO(BaseModel):
    lecture: ApiLectureDTO
    changeInfos: List[ApiChangeInfoDTO]
    id: int


class ApiSyncLecturesInfoResponseDTO(BaseModel):
    sites: List[str]
    startTime: datetime
    endTime: datetime
    status: str
    newLectures: List[ApiLectureDTO]
    updatedLectures: List[ApiUpdatedLectureDTO]
    removedLectures: List[ApiLectureDTO]
    id: int


###########################################################################
########################## Database Add / Update ##########################
###########################################################################


# ======================================================== #
# ========================= Room ========================= #
# ======================================================== #
class Room(BaseModel):
    """Represents a room in the university."""

    model_config = ConfigDict(from_attributes=True)

    name: str
    capacity: Optional[int] = Field(default=None)
    description: Optional[str] = Field(default=None)
    equipment: List[str] = Field(default_factory=list)


# ======================================================== #
# ======================== Session ======================= #
# ======================================================== #

def session_parse_dt(v: Union[str, datetime]) -> datetime:
    """Parses a datetime string into a datetime object."""
    if isinstance(v, str):
        dt = parser.parse(v)
        if dt.tzinfo is None:
            dt = pytz.utc.localize(dt)
        return dt.astimezone(DEFAULT_TIMEZONE)
    return v.astimezone(DEFAULT_TIMEZONE) if isinstance(v, datetime) else v

def get_session_hash(start: datetime, end: datetime) -> str:
    """Generates a hash for the session based on its start and end times."""
    key = f"{start.isoformat()}|{end.isoformat()}"
    return hashlib.sha1(key.encode("utf-8")).hexdigest()

class Lecture(BaseModel):
    """Represents a session in the university."""

    model_config = ConfigDict(from_attributes=True)

    name: str
    lecturer: Optional[str] = Field(default=None)

    start: datetime
    end: datetime
    rooms: List[str] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list)

    @field_validator("start", "end", mode="before")
    def _parse_dt(cls, v):
        return session_parse_dt(v)

    @field_serializer("start", "end")
    def _ser_dt(self, v: datetime, _info) -> str:
        return v.astimezone(DEFAULT_TIMEZONE).isoformat()



class LectureCreate(Lecture):
    """Represents a session in the university.
    The 'external_id' field is a unique identifier for the session.
    """
    @computed_field
    @property
    def external_id(self) -> str:
        start: datetime = self.start
        end:   datetime = self.end
        if not start or not end:
            raise ValueError("Cannot generate external_id without both start and end")

        return get_session_hash(start, end)
    
class LectureUpdate(LectureCreate):
    """Represents an updated session in the university."""
    old_name: str
    old_external_id: str


# ======================================================== #
# ======================== Course ======================== #
# ======================================================== #
class CourseBase(BaseModel):
    """Represents a course in the university."""

    name: str


class CourseCreate(CourseBase):
    """
    Represents a course in the university.

    The 'lectures' field is a dictionary where the keys are the lecture names and the values are the lecture base models.
    """

    lectures: List[LectureCreate]

###########################################################################
########################### Scraper/Fetcher Base ##########################
###########################################################################
class DHBWCourseUpdate(BaseModel):
    """Represents an update from the DHBW API."""
    
    new_sessions: List[LectureCreate] = Field(default_factory=list)
    updated_sessions: List[LectureUpdate] = Field(default_factory=list)
    deleted_sessions: Dict[str, List[str]] = Field(default_factory=dict)


@dataclass
class ExistingLecture():
    """Represents an existing lecture in the university."""

    lecture: m_calendar.Lecture
    sessions: Dict[str, m_calendar.Session]
@dataclass
class ExistingCourse():
    """Represents an existing course in the university."""
    model_config = ConfigDict(arbitrary_types_allowed=True)

    course: m_calendar.Course
    lectures: Dict[str, ExistingLecture]

@dataclass
class CalendarContext():
    university: m_calendar.University

    existing_courses: Dict[str, ExistingCourse]
    existing_rooms: Dict[str, m_calendar.Room]
    existing_tags: Dict[str, m_calendar.Tag]
    
    new_courses: int = 0
    new_lectures: int = 0
    new_sessions: int = 0

    updated_courses: int = 0
    updated_lectures: int = 0
    updated_sessions: int = 0

@dataclass
class CalendarRefreshContext(CalendarContext):
    lectures_to_delete: Set[int] = field(default_factory=set)
    sessions_to_delete: Set[int] = field(default_factory=set)
    