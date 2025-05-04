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
from sqlalchemy.orm import validates, relationship, Mapped, mapped_column
import datetime
import hashlib
from dateutil import parser
import pytz
import uuid
from typing import Optional
from dataclasses import dataclass


from config.database import Base
from config.settings import DEFAULT_TIMEZONE

from .m_generic import Address


@dataclass
class RoomBooking:
    room_id: int
    last_booked: Optional[datetime.datetime]
    next_booked: Optional[datetime.datetime]

###########################################################################
################################### Base ##################################
###########################################################################
class University(Base):
    __tablename__ = "university"
    university_id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    university_uuid: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False, unique=True, index=True, default=uuid.uuid4)
    university_name: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)

    address_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("addresses.address_id"), nullable=True)
    domains: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    last_modified: Mapped[datetime.datetime] = mapped_column(TIMESTAMP, nullable=False, server_default=func.now(), onupdate=func.current_timestamp())

    courses: Mapped[list["Course"]] = relationship("Course", back_populates="university")
    rooms: Mapped[list["Room"]] = relationship("Room", back_populates="university")
    address: Mapped["Address | None"] = relationship("Address", uselist=False)

    @property
    def course_names(self):
        return [course.course_name for course in self.courses]

    @property
    def room_count(self):
        return len(self.rooms)


class CalendarBackend(Base):
    __tablename__ = "calendar_backend"
    calendar_backend_id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    backend_name: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    is_custom_available: Mapped[bool] = mapped_column(BOOLEAN, nullable=False, default=True)
    last_modified: Mapped[datetime.datetime] = mapped_column(TIMESTAMP, nullable=False, server_default=func.now(), onupdate=func.current_timestamp())

###########################################################################
################################## Native #################################
###########################################################################
class Course(Base):
    __tablename__ = "calendar_native_courses"
    course_id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    course_name: Mapped[str] = mapped_column(String(255), nullable=False)
    university_id: Mapped[int] = mapped_column(Integer, ForeignKey("university.university_id"), nullable=False, index=True)
    last_modified: Mapped[datetime.datetime] = mapped_column(TIMESTAMP, nullable=False, server_default=func.now(), onupdate=func.current_timestamp())

    university: Mapped["University | None"] = relationship("University", back_populates="courses", uselist=False)  # Many-to-one
    lectures: Mapped[list["Lecture"]] = relationship("Lecture", back_populates="course", cascade="all, delete-orphan")  # One-to-many


class Lecture(Base):
    __tablename__ = "calendar_native_lectures"
    lecture_id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    course_id: Mapped[int] = mapped_column(Integer, ForeignKey("calendar_native_courses.course_id", ondelete="CASCADE"), nullable=False, index=True)

    lecture_name: Mapped[str] = mapped_column(String(255), nullable=False)
    lecturer: Mapped[str | None] = mapped_column(String(255), nullable=True)
    last_modified: Mapped[datetime.datetime] = mapped_column(TIMESTAMP, nullable=False, server_default=func.now(), onupdate=func.current_timestamp())

    course: Mapped["Course"] = relationship("Course", back_populates="lectures", uselist=False)  # Many-to-one
    sessions: Mapped[list["Session"]] = relationship("Session", back_populates="lecture", cascade="all, delete-orphan")  # One-to-many
    
class SessionRoom(Base):
    __tablename__ = "calendar_native_session_room"
    session_room_id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    session_id: Mapped[int] = mapped_column(Integer, ForeignKey("calendar_native_sessions.session_id", ondelete="CASCADE"), nullable=False, index=True)
    room_id: Mapped[int] = mapped_column(Integer, ForeignKey("university_rooms.room_id"), nullable=False, index=True)

class Session(Base):
    __tablename__ = "calendar_native_sessions"
    session_id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    lecture_id: Mapped[int] = mapped_column(Integer, ForeignKey("calendar_native_lectures.lecture_id", ondelete="CASCADE"), nullable=False, index=True)
    start_time: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    end_time: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    external_id: Mapped[str] = mapped_column(String(40), nullable=False)  # External ID

    last_modified: Mapped[datetime.datetime] = mapped_column(TIMESTAMP, nullable=False, server_default=func.now(), onupdate=func.current_timestamp())

    lecture: Mapped["Lecture"] = relationship("Lecture", back_populates="sessions")
    rooms: Mapped[list["Room"]] = relationship("Room", back_populates="sessions", secondary="calendar_native_session_room")
    tags: Mapped[list["SessionTag"]] = relationship("SessionTag", back_populates="session", cascade="all, delete-orphan")

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

class SessionTag(Base):
    __tablename__ = "calendar_native_session_tag"
    session_tag_id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    session_id: Mapped[int] = mapped_column(Integer, ForeignKey("calendar_native_sessions.session_id", ondelete="CASCADE"), nullable=False, index=True)
    tag_id: Mapped[int] = mapped_column(Integer, ForeignKey("calendar_tags.tag_id"), nullable=False, index=True)

    session: Mapped["Session"] = relationship("Session", back_populates="tags")  # Many-to-one, uselist=False not needed
    tag: Mapped["Tag"] = relationship("Tag")  # Many-to-one


class Tag(Base):
    __tablename__ = "calendar_tags"
    tag_id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    tag_name: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)


class Room(Base):
    __tablename__ = "university_rooms"
    __table_args__ = (UniqueConstraint("room_name", "university_id", name="uq_room_name_university_id"),)
    room_id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    room_name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    university_id: Mapped[int] = mapped_column(Integer, ForeignKey("university.university_id"), nullable=False, index=True)
    room_capacity: Mapped[int | None] = mapped_column(Integer, nullable=True)
    room_description: Mapped[str | None] = mapped_column(String(255), nullable=True)

    university: Mapped["University | None"] = relationship("University", back_populates="rooms", uselist=False)  # Many-to-one

    # These are collections, so remove uselist=False
    sessions: Mapped[list["Session"]] = relationship("Session", secondary="calendar_native_session_room", back_populates="rooms")
    room_equipment: Mapped[list["RoomEquipment"]] = relationship("RoomEquipment", back_populates="room", cascade="all, delete-orphan")


class RoomEquipment(Base):
    __tablename__ = "room_equipment"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    room_id: Mapped[int] = mapped_column(Integer, ForeignKey("university_rooms.room_id"), nullable=False)
    equipment_id: Mapped[int] = mapped_column(Integer, ForeignKey("equipment.equipment_id"), nullable=False)

    room: Mapped["Room | None"] = relationship("Room", back_populates="room_equipment", uselist=False)  # Many-to-one
    equipment: Mapped["Equipment | None"] = relationship("Equipment", uselist=False)  # Assuming one-to-one


class Equipment(Base):
    __tablename__ = "equipment"
    equipment_id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    equipment_name: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
