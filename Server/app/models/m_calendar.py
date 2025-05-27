from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey,
    func,
    JSON,
    BOOLEAN,
    CheckConstraint,
    UniqueConstraint,
    DateTime,
    UUID,
    PrimaryKeyConstraint,
)
from sqlalchemy.orm import validates, relationship, Mapped, mapped_column
import datetime
import hashlib
from dateutil import parser
import pytz
import uuid
from typing import Optional, List
from dataclasses import dataclass
import datetime


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
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)

    address_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("addresses.address_id"), nullable=True)
    domains: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    last_modified: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.datetime.now(DEFAULT_TIMEZONE),
        onupdate=lambda: datetime.datetime.now(DEFAULT_TIMEZONE),
    )

    courses: Mapped[List["Course"]] = relationship("Course", back_populates="university")
    rooms: Mapped[List["Room"]] = relationship("Room", back_populates="university")
    address: Mapped["Address | None"] = relationship("Address", uselist=False)

    @property
    def course_names(self):
        return [course.course_name for course in self.courses]

    @property
    def room_count(self):
        return len(self.rooms)


class CalendarBackend(Base):
    __tablename__ = "calendar_backend"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    is_custom_available: Mapped[bool] = mapped_column(BOOLEAN, nullable=False, default=True)
    last_modified: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.datetime.now(DEFAULT_TIMEZONE),
        onupdate=lambda: datetime.datetime.now(DEFAULT_TIMEZONE),
    )


###########################################################################
################################## Native #################################
###########################################################################
class Course(Base):
    __tablename__ = "calendar_native_courses"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    university_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("university.id"), nullable=False, index=True
    )
    last_modified: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.datetime.now(DEFAULT_TIMEZONE),
        onupdate=lambda: datetime.datetime.now(DEFAULT_TIMEZONE),
    )

    university: Mapped["University | None"] = relationship(
        "University", back_populates="courses", uselist=False
    )  # Many-to-one
    lectures: Mapped[List["Lecture"]] = relationship(
        "Lecture", back_populates="course", cascade="all, delete-orphan"
    )  # One-to-many

    __table_args__ = (
        UniqueConstraint("name", "university_id", name="uq_course_name_university_id"),
        CheckConstraint("name != ''", name="check_name_not_empty"),
    )


class Lecture(Base):
    __tablename__ = "calendar_native_lectures"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    course_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("calendar_native_courses.id", ondelete="CASCADE"), nullable=False, index=True
    )

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    lecturer: Mapped[str | None] = mapped_column(String(255), nullable=True, default=None)
    last_modified: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.datetime.now(DEFAULT_TIMEZONE),
        onupdate=lambda: datetime.datetime.now(DEFAULT_TIMEZONE),
    )

    course: Mapped["Course"] = relationship("Course", back_populates="lectures", uselist=False)
    sessions: Mapped[List["Session"]] = relationship("Session", back_populates="lecture", cascade="all, delete-orphan")

    __table_args__ = (
        UniqueConstraint("course_id", "name", name="uq_course_id_name"),
        CheckConstraint("name != ''", name="check_name_not_empty"),
    )


class SessionRoom(Base):
    __tablename__ = "calendar_native_session_room"
    session_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("calendar_native_sessions.id", ondelete="CASCADE"), primary_key=True
    )
    room_id: Mapped[int] = mapped_column(Integer, ForeignKey("university_rooms.id"), primary_key=True)

    __table_args__ = (PrimaryKeyConstraint("session_id", "room_id"),)


class Session(Base):
    __tablename__ = "calendar_native_sessions"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    lecture_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("calendar_native_lectures.id", ondelete="CASCADE"), nullable=False, index=True
    )
    start_time: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    end_time: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    external_id: Mapped[str] = mapped_column(String(40), nullable=False)  # External ID

    last_modified: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.datetime.now(DEFAULT_TIMEZONE),
        onupdate=lambda: datetime.datetime.now(DEFAULT_TIMEZONE),
    )

    lecture: Mapped["Lecture"] = relationship("Lecture", back_populates="sessions")
    rooms: Mapped[List["Room"]] = relationship(
        "Room", back_populates="sessions", secondary="calendar_native_session_room", lazy="joined", uselist=True
    )
    tags: Mapped[List["Tag"]] = relationship(
        "Tag",
        secondary="calendar_native_session_tag",
        uselist=True,
        lazy="joined",
    )

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
    session_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("calendar_native_sessions.id", ondelete="CASCADE"), primary_key=True
    )
    tag_id: Mapped[int] = mapped_column(Integer, ForeignKey("calendar_tags.id"), primary_key=True)

    __table_args__ = (PrimaryKeyConstraint("session_id", "tag_id"),)


class Tag(Base):
    __tablename__ = "calendar_tags"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)


class Room(Base):
    __tablename__ = "university_rooms"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    university_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("university.id"), nullable=False, index=True
    )
    capacity: Mapped[int | None] = mapped_column(Integer, nullable=True)
    description: Mapped[str | None] = mapped_column(String(255), nullable=True)

    university: Mapped["University | None"] = relationship(
        "University", back_populates="rooms", uselist=False
    )  # Many-to-one

    # These are collections, so remove uselist=False
    sessions: Mapped[List["Session"]] = relationship(
        "Session", secondary="calendar_native_session_room", back_populates="rooms"
    )
    equipment: Mapped[List["Equipment"]] = relationship(
        "Equipment", secondary="room_equipment", back_populates="rooms"
    )  # Many-to-many

    def __hash__(self):
        return hash((self.name, self.university_id))

    __table_args__ = (UniqueConstraint("name", "university_id", name="uq_room_name_university_id"),)


class RoomEquipment(Base):
    __tablename__ = "room_equipment"
    room_id: Mapped[int] = mapped_column(Integer, ForeignKey("university_rooms.id"), primary_key=True)
    equipment_id: Mapped[int] = mapped_column(Integer, ForeignKey("equipment.id"), primary_key=True)

    __table_args__ = (PrimaryKeyConstraint("room_id", "equipment_id"),)


class Equipment(Base):
    __tablename__ = "equipment"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)

    rooms: Mapped[List["Room"]] = relationship(
        "Room", secondary="room_equipment", back_populates="equipment"
    )  # Many-to-many
