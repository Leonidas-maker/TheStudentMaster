from pydantic import BaseModel, UUID4, field_validator, field_serializer
from typing import Optional, Union, List, Dict
from datetime import datetime
from dateutil import parser
import pytz
import hashlib

from config.general import DEFAULT_TIMEZONE


###########################################################################
########################## Database Add / Update ##########################
###########################################################################
# ======================================================== #
# ======================= Equipment ====================== #
# ======================================================== #
class EquipmentBase(BaseModel):
    """Represents a piece of equipment in a room."""

    name: str


class EquipmentCreate(EquipmentBase):
    """Represents a piece of equipment in a room."""

    pass


class Equipment(EquipmentBase):
    """Represents a piece of equipment in a room."""

    id: int

    class Config:
        from_attributes = True


# ======================================================== #
# ========================= Room ========================= #
# ======================================================== #
class RoomBase(BaseModel):
    """Represents a room in the university."""

    name: str
    capacity: int
    description: str


class RoomCreate(RoomBase):
    """Represents a room in the university."""

    equipment: Union[List[str], List[Equipment]]


class Room(RoomBase):
    """Represents a room in the university."""

    equipment: List[str]


# ======================================================== #
# ======================== Session ======================= #
# ======================================================== #
class SessionBase(BaseModel):
    """Represents a session in the university."""

    start: datetime
    end: datetime
    rooms: Optional[List[str]] = None
    tags: Optional[List[str]] = None

    @field_validator("start", "end", mode="before")
    def parse_datetime(cls, value):
        if isinstance(value, str):
            dt = parser.parse(value)
            if dt.tzinfo is None:
                dt = pytz.utc.localize(dt)
            return dt.astimezone(DEFAULT_TIMEZONE)
        elif isinstance(value, datetime):
            return value.astimezone(DEFAULT_TIMEZONE)
        else:
            raise ValueError(f"Invalid type for 'start' or 'end': {type(value)}")

    @field_serializer("start", "end")
    def serialize_datetime(self, value: datetime, _info) -> str:
        if isinstance(value, datetime):
            return value.astimezone(DEFAULT_TIMEZONE).isoformat()
        elif isinstance(value, str):
            dt = parser.parse(value)
            if dt.tzinfo is None:
                dt = pytz.utc.localize(dt)
            return dt.astimezone(DEFAULT_TIMEZONE).isoformat()
        else:
            raise ValueError(f"Clould not serialize 'start' or 'end' field: {value} of type {type(value)}")


class SessionCreateUpdate(SessionBase):
    """Represents a session in the university."""

    external_id: str

    # Hash the start and end times to create a unique identifier
    @field_validator("external_id", mode="before")
    def hash_times(cls, value: str, values: Dict[str, any]) -> str:
        if value is None:
            start = values.get("start")
            end = values.get("end")
            if start and end:
                return hashlib.md5(f"{start}{end}".encode()).hexdigest()
            else:
                raise ValueError("Cannot generate external_id without 'start' and 'end' fields.")
        return value


# ======================================================== #
# ======================== Lecture ======================= #
# ======================================================== #
class LectureBase(BaseModel):
    """Represents a lecture in a course."""

    lecturer: str


class LectureCreate(LectureBase):
    """
    Represents a lecture in a course.

    The 'sessions' field is a dictionary where the keys are the external IDs or hashes of the timetable entries.
    """

    name: str
    sessions: List[SessionCreateUpdate]


# class LectureUpdate(LectureBase):
#     """
#     Used to update a lecture in a course.

#     The 'new_sessions' field is a dictionary where the keys are the external IDs or hashes of the timetable entries.
#     The 'updated_sessions' field is a dictionary where the keys are the external IDs or hashes of the timetable entries.
#     The 'deleted_sessions' field is a list of session external IDs or hashes of the timetable entries.
#     """

#     new_sessions: Optional[List[SessionBase]] = None
#     updated_sessions: Optional[Dict[str, SessionBase]] = None
#     deleted_sessions: Optional[List[str]] = None


class Lecture(LectureBase):
    """Represents a lecture in a course."""

    name: str


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


# class CourseUpdate(BaseModel):
#     """
#     Used to update a course in the university.

#     The 'new_lectures' field is a dictionary where the keys are the lecture names and the values are the lecture base models.
#     The 'updated_lectures' field is a dictionary where the keys are the lecture names and the values are the lecture update models.
#     The 'deleted_lectures' field is a list of lecture names.
#     """
#     new_lectures:  List[LectureCreate] = None
#     updated_lectures: Optional[Dict[str, LectureUpdate]] = None
#     deleted_lectures: Optional[List[str]] = None


###########################################################################
########################### Scraper/Fetcher Base ##########################
###########################################################################


class DHBWLecture(LectureBase):
    """Represents a lecture in a course."""

    sessions: Dict[str, SessionBase]
    lecturer: str

    def to_lecture_create(self, lecture_name) -> LectureCreate:
        sessions_create = [
            SessionCreateUpdate(external_id=external_id, **session.model_dump())
            for external_id, session in self.sessions.items()
        ]
        return LectureCreate(name=lecture_name, lecturer=self.lecturer, sessions=sessions_create)


class DHBWCourses(BaseModel):
    courses: Dict[str, Dict[str, DHBWLecture]] = {}

    def to_courses_create(self) -> List[CourseCreate]:
        courses_create = []
        for course_name, lectures_dict in self.courses.items():
            lectures_create = [
                lecture.to_lecture_create(lecture_name) for lecture_name, lecture in lectures_dict.items()
            ]
            course_create = CourseCreate(name=course_name, lectures=lectures_create)
            courses_create.append(course_create)
        return courses_create


class DHBWCourseUpdate(DHBWCourses):
    deleted_sessions: List[str] = []

    def to_dhbw_courses(self) -> DHBWCourses:
        return DHBWCourses(courses=self.courses)


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
