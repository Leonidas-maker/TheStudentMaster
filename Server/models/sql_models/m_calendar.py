from sqlalchemy import Column, Integer, String, TIMESTAMP, BOOLEAN, JSON, ForeignKey, CheckConstraint
from config.database import Base
from sqlalchemy.orm import validates, relationship
import json


class CalendarCustom(Base):
    __tablename__ = "calendar_custom"
    id = Column(Integer, primary_key=True, index=True)
    university_id = Column(Integer, ForeignKey("university.id"), nullable=True)

    lecture_name = Column(String(255), nullable=False, unique=True)

    source_backend_id = Column(Integer, ForeignKey("calendar_backend.id"), nullable=False)
    source_url = Column(String(255), nullable=False, unique=True)

    data = Column(JSON, nullable=False)
    hash = Column(String(255), nullable=False)

    refresh_interval = Column(Integer, nullable=False, default=15)  # In minutes
    last_updated = Column(TIMESTAMP, nullable=False)

    verified = Column(
        BOOLEAN, default=False
    )  # True if the data is from a verified source
    last_modified = Column(TIMESTAMP, nullable=False)

    university = relationship("University", cascade="save-update", uselist=False)
    source_backend = relationship("CalendarBackend", cascade="save-update", uselist=False)

    @validates("data")
    def validate_data(self, key, data):
        if len(json.dumps(data)) > 200 * 1024:  # 200 Kilobytes
            raise ValueError("Data is too large!")
        return data


class CalendarNative(Base):
    __tablename__ = "calendar_native"
    id = Column(Integer, primary_key=True, index=True)
    university_id = Column(Integer, ForeignKey("university.id"), nullable=False)

    lecture_name = Column(String(255), nullable=False, unique=True)

    source_backend_id = Column(Integer, ForeignKey("calendar_backend.id"), nullable=False)
    source = Column(String(255), nullable=False)

    data = Column(JSON, nullable=False)
    hash = Column(String(255), nullable=False)

    last_modified = Column(TIMESTAMP, nullable=False)

    university = relationship("University", cascade="save-update", uselist=False)
    source_backend = relationship("CalendarBackend", cascade="save-update", uselist=False)
    


class University(Base):
    __tablename__ = "university"
    id = Column(Integer, primary_key=True, index=True)
    address_id = Column(Integer, ForeignKey("addresses.address_id"), nullable=True)
    name = Column(String(255), nullable=False, unique=True)
    rooms = Column(JSON, nullable=True)
    domains = Column(JSON, nullable=True)

    last_modified = Column(TIMESTAMP, nullable=False)
    address = relationship("Address", uselist=False)


class CalendarBackend(Base):
    __tablename__ = "calendar_backend"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, unique=True)
    last_modified = Column(TIMESTAMP, nullable=False)


class UserCalendar(Base):
    __tablename__ = "calendar_users"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)

    custom_calendar_id = Column(Integer, ForeignKey("calendar_custom.id"), nullable=True)
    native_calendar_id = Column(Integer, ForeignKey("calendar_native.id"), nullable=True)

    last_modified = Column(TIMESTAMP, nullable=False)

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
