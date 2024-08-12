from sqlalchemy import (
    Column,
    Integer,
    String,
    TIMESTAMP,
    BOOLEAN,
    JSON,
    ForeignKey,
    CheckConstraint,
    Uuid,
    UniqueConstraint,
)
from config.database import Base
from sqlalchemy.orm import validates, relationship
from sqlalchemy.sql import func
import json
import uuid


class CalendarCustom(Base):
    __tablename__ = "calendar_custom"
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

    __table_args__ = (UniqueConstraint("university_id", "course_name", name="uix_university_id_course_name"),)

    @validates("data")
    def validate_data(self, key, data):
        if len(json.dumps(data)) > 200 * 1024:  # 200 Kilobytes
            raise ValueError("Data is too large!")
        return data

    @validates("refresh_interval")
    def validate_refresh_interval(self, key, interval):
        if interval % 15 != 0 or interval > 120:
            raise ValueError("Refresh interval must be divisible by 15 and no greater than 120 minutes.")
        return interval


class CalendarNative(Base):
    __tablename__ = "calendar_native"
    calendar_native_id = Column(Integer, primary_key=True, index=True)

    university_id = Column(Integer, ForeignKey("university.university_id"), nullable=False)

    course_name = Column(String(255), nullable=False, unique=True)

    source_backend_id = Column(Integer, ForeignKey("calendar_backend.calendar_backend_id"), nullable=False)
    source = Column(String(255), nullable=False)

    data = Column(JSON, nullable=False)
    hash = Column(String(255), nullable=False)

    last_modified = Column(TIMESTAMP, nullable=False, server_default=func.now(), onupdate=func.current_timestamp())
    guest_last_accessed = Column(TIMESTAMP, nullable=False, server_default=func.now())

    university = relationship("University", cascade="save-update", uselist=False)
    source_backend = relationship("CalendarBackend", cascade="save-update", uselist=False)

    __table_args__ = (UniqueConstraint("university_id", "course_name", name="uix_university_id_course_name"),)


class University(Base):
    __tablename__ = "university"
    university_id = Column(Integer, primary_key=True, index=True)
    university_uuid = Column(Uuid(as_uuid=True), unique=True, nullable=False, default=uuid.uuid4)
    university_name = Column(String(255), nullable=False, unique=True)

    address_id = Column(Integer, ForeignKey("addresses.address_id"), nullable=True)
    rooms = Column(JSON, nullable=True)
    domains = Column(JSON, nullable=True)

    last_modified = Column(TIMESTAMP, nullable=False, server_default=func.now(), onupdate=func.current_timestamp())
    address = relationship("Address", uselist=False)


class CalendarBackend(Base):
    __tablename__ = "calendar_backend"
    calendar_backend_id = Column(Integer, primary_key=True, index=True)
    backend_name = Column(String(255), nullable=False, unique=True)
    last_modified = Column(TIMESTAMP, nullable=False, server_default=func.now(), onupdate=func.current_timestamp())


class UserCalendar(Base):
    __tablename__ = "calendar_users"
    calendar_users_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False, unique=True)

    custom_calendar_id = Column(Integer, ForeignKey("calendar_custom.calendar_custom_id"), nullable=True)
    native_calendar_id = Column(Integer, ForeignKey("calendar_native.calendar_native_id"), nullable=True)

    last_modified = Column(TIMESTAMP, nullable=False, server_default=func.now(), onupdate=func.current_timestamp())

    __table_args__ = (
        CheckConstraint(
            "(custom_calendar_id IS NOT NULL AND native_calendar_id IS NULL) OR "
            "(custom_calendar_id IS NULL AND native_calendar_id IS NOT NULL)",
            name="chk_one_calendar_id",
        ),
    )


# {
#     "reserved_rooms": [...],
#     "lecture_rooms": [
#         {
#             "room_name": "A 101",
#             "room_capacity": 30,
#             "room_equipment": ["Beamer", "Whiteboard"],
#             "room_description": "This room is equipped with a beamer and a whiteboard.",
#             "room_reservations": [
#                 0: {
#                     "reservation_start": "2021-09-01 08:00:00",
#                     "reservation_end": "2021-09-01 09:30:00",
#                 },
#                 1: {
#                     "reservation_start": "2021-09-01 10:00:00",
#                     "reservation_end": "2021-09-01 11:30:00",
#                 }
#             ]
#         }
#     ]
# }
