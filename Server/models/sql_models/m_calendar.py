from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey,
    TIMESTAMP,
    func,
    JSON,
    BOOLEAN,
    CheckConstraint,
    UniqueConstraint,
    DateTime,
    UUID,
)
from sqlalchemy.orm import validates, relationship
import json
import datetime
import hashlib
from dateutil import parser
import pytz
import uuid

from config.database import Base
from config.general import DEFAULT_TIMEZONE


###########################################################################
################################### Base ##################################
###########################################################################
class University(Base):
    __tablename__ = "university"
    university_id = Column(Integer, primary_key=True, index=True)
    university_uuid = Column(UUID(as_uuid=True), nullable=False, unique=True, index=True, default=uuid.uuid4)
    university_name = Column(String(255), nullable=False, unique=True)

    address_id = Column(Integer, ForeignKey("addresses.address_id"), nullable=True)
    domains = Column(JSON, nullable=True)

    last_modified = Column(TIMESTAMP, nullable=False, server_default=func.now(), onupdate=func.current_timestamp())

    courses = relationship("Course", back_populates="university")
    rooms = relationship("Room", back_populates="university")
    address = relationship("Address", uselist=False)


###########################################################################
################################### User ##################################
###########################################################################
class UserCalendar(Base):
    __tablename__ = "user_calendar"
    __table_args__ = (
        CheckConstraint(
            "(custom_calendar_id IS NOT NULL AND native_calendar_id IS NULL) OR "
            "(custom_calendar_id IS NULL AND native_calendar_id IS NOT NULL)",
            name="chk_one_calendar_id",
        ),
    )

    calendar_users_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False, unique=True, index=True)

    custom_calendar_id = Column(Integer, ForeignKey("calendar_custom.calendar_custom_id"), nullable=True)
    native_calendar_id = Column(Integer, ForeignKey("calendar_native_courses.course_id"), nullable=True)

    last_modified = Column(TIMESTAMP, nullable=False, server_default=func.now(), onupdate=func.current_timestamp())

    course = relationship("Course", uselist=False)
    custom_calendar = relationship("CalendarCustom", uselist=False)


class CalendarBackend(Base):
    __tablename__ = "calendar_backend"
    calendar_backend_id = Column(Integer, primary_key=True, index=True)
    backend_name = Column(String(255), nullable=False, unique=True)
    is_custom_available = Column(BOOLEAN, nullable=False, default=True)
    last_modified = Column(TIMESTAMP, nullable=False, server_default=func.now(), onupdate=func.current_timestamp())


###########################################################################
################################## Custom #################################
###########################################################################
class CalendarCustom(Base):
    __tablename__ = "calendar_custom"
    __table_args__ = (UniqueConstraint("university_id", "course_name", name="uix_university_id_course_name"),)
    calendar_custom_id = Column(Integer, primary_key=True, index=True)
    university_id = Column(Integer, ForeignKey("university.university_id"), nullable=True)

    course_name = Column(String(255), nullable=False, unique=True)

    source_backend_id = Column(Integer, ForeignKey("calendar_backend.calendar_backend_id"), nullable=False)
    source_url = Column(String(255), nullable=False, unique=True)

    data = Column(JSON, nullable=False)
    hash = Column(String(255), nullable=False)

    refresh_interval = Column(Integer, nullable=False, default=15)  # In minutes
    last_updated = Column(TIMESTAMP, nullable=False)

    verified = Column(
        BOOLEAN, default=False
    )  # True if the data is from a verified source (not used yet will be implemented later in the project)
    last_modified = Column(TIMESTAMP, nullable=False, server_default=func.now(), onupdate=func.current_timestamp())

    university = relationship("University", cascade="save-update", uselist=False)
    source_backend = relationship("CalendarBackend", cascade="save-update", uselist=False)

    @validates("data")
    def validate_data(self, key, data):
        if len(json.dumps(data)) > 200 * 1024:  # 200 Kilobytes
            raise ValueError("Data is too large!")
        return data

    @validates("refresh_interval")
    def validate_refresh_interval(self, key, interval):
        if interval % 10 != 0 or interval > 120:
            raise ValueError("Refresh interval must be divisible by 10 and no greater than 120 minutes.")
        return interval


###########################################################################
################################## Native #################################
###########################################################################


class Course(Base):
    __tablename__ = "calendar_native_courses"
    course_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    course_name = Column(String(255), nullable=False)
    university_id = Column(Integer, ForeignKey("university.university_id"), nullable=False, index=True)
    last_modified = Column(TIMESTAMP, nullable=False, server_default=func.now(), onupdate=func.current_timestamp())

    university = relationship("University", back_populates="courses", uselist=False)  # Many-to-one
    lectures = relationship("Lecture", back_populates="course", cascade="all, delete-orphan")  # One-to-many


class Lecture(Base):
    __tablename__ = "calendar_native_lectures"
    lecture_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    course_id = Column(Integer, ForeignKey("calendar_native_courses.course_id", ondelete="CASCADE"), nullable=False, index=True)

    lecture_name = Column(String(255), nullable=False)
    lecturer = Column(String(255), nullable=True)
    last_modified = Column(TIMESTAMP, nullable=False, server_default=func.now(), onupdate=func.current_timestamp())

    course = relationship("Course", back_populates="lectures", uselist=False)  # Many-to-one
    sessions = relationship("Session", back_populates="lecture", cascade="all, delete-orphan")  # One-to-many


class Session(Base):
    __tablename__ = "calendar_native_sessions"
    session_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    lecture_id = Column(Integer, ForeignKey("calendar_native_lectures.lecture_id", ondelete="CASCADE"), nullable=False, index=True)
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=False)
    external_id = Column(String(40), nullable=False)  # External ID

    last_modified = Column(TIMESTAMP, nullable=False, server_default=func.now(), onupdate=func.current_timestamp())

    lecture = relationship("Lecture", back_populates="sessions")
    rooms = relationship("SessionRoom", back_populates="session", cascade="all, delete-orphan")
    tags = relationship("SessionTag", back_populates="session", cascade="all, delete-orphan")

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Generiere external_id, wenn nicht gesetzt
        if not self.external_id:
            self.external_id = self.generate_sha1_hash()

        # Konvertiere start_time und end_time in UTC, falls sie als Strings übergeben werden
        if isinstance(self.start_time, str):
            dt = parser.parse(self.start_time)
            if dt.tzinfo is None:
                dt = pytz.utc.localize(dt)
            self.start_time = dt.astimezone(DEFAULT_TIMEZONE)
        if isinstance(self.end_time, str):
            dt = parser.parse(self.end_time)
            if dt.tzinfo is None:
                dt = pytz.utc.localize(dt)
            self.end_time = dt.astimezone(DEFAULT_TIMEZONE)

    def generate_sha1_hash(self):
        # Konvertiere start_time und end_time zu Strings
        start_str = (
            self.start_time.isoformat() if isinstance(self.start_time, datetime.datetime) else str(self.start_time)
        )
        end_str = self.end_time.isoformat() if isinstance(self.end_time, datetime.datetime) else str(self.end_time)

        # Kombiniere start_time und end_time, encodiere und generiere SHA-1 Hash
        hash_input = f"{start_str}{end_str}".encode("utf-8")
        return hashlib.sha1(hash_input).hexdigest()


class SessionRoom(Base):
    __tablename__ = "calendar_native_session_room"
    session_room_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    session_id = Column(Integer, ForeignKey("calendar_native_sessions.session_id", ondelete="CASCADE"), nullable=False, index=True)
    room_id = Column(Integer, ForeignKey("university_rooms.room_id"), nullable=False, index=True)

    session = relationship("Session", back_populates="rooms")  # Many-to-one, uselist=False not needed
    room = relationship("Room", back_populates="sessions")  # Many-to-one, uselist=False not needed


class SessionTag(Base):
    __tablename__ = "calendar_native_session_tag"
    session_tag_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    session_id = Column(Integer, ForeignKey("calendar_native_sessions.session_id", ondelete="CASCADE"), nullable=False, index=True)
    tag_id = Column(Integer, ForeignKey("calendar_tags.tag_id"), nullable=False, index=True)

    session = relationship("Session", back_populates="tags")  # Many-to-one, uselist=False not needed
    tag = relationship("Tag")  # Many-to-one


class Tag(Base):
    __tablename__ = "calendar_tags"
    tag_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    tag_name = Column(String(255), nullable=False, unique=True)


class Room(Base):
    __tablename__ = "university_rooms"
    __table_args__ = (UniqueConstraint("room_name", "university_id", name="uq_room_name_university_id"),)
    room_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    room_name = Column(String(255), nullable=False, index=True)
    university_id = Column(Integer, ForeignKey("university.university_id"), nullable=False, index=True)
    room_capacity = Column(Integer, nullable=True)
    room_description = Column(String(255), nullable=True)

    university = relationship("University", back_populates="rooms", uselist=False)  # Many-to-one

    # These are collections, so remove uselist=False
    sessions = relationship("SessionRoom", back_populates="room")
    room_equipment = relationship("RoomEquipment", back_populates="room", cascade="all, delete-orphan")


class RoomEquipment(Base):
    __tablename__ = "room_equipment"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    room_id = Column(Integer, ForeignKey("university_rooms.room_id"), nullable=False)
    equipment_id = Column(Integer, ForeignKey("equipment.equipment_id"), nullable=False)

    room = relationship("Room", back_populates="room_equipment", uselist=False)  # Many-to-one
    equipment = relationship("Equipment", uselist=False)  # Assuming one-to-one


class Equipment(Base):
    __tablename__ = "equipment"
    equipment_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    equipment_name = Column(String(255), nullable=False, unique=True)
