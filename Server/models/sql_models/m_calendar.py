from sqlalchemy import Column, Integer, String, TIMESTAMP, BOOLEAN, JSON
from config.database import Base
from sqlalchemy.orm import validates, relationship
import json


class CalendarCustom(Base):
    __tablename__ = "calendar_custom"
    id = Column(Integer, primary_key=True, index=True)
    university_id = Column(Integer, nullable=True)  

    lecture_name = Column(String(255), nullable=False)

    source_backend = Column(String(255), nullable=False)
    source_url = Column(String(255), nullable=False)

    data = Column(JSON, nullable=False)
    hash = Column(String(255), nullable=False)

    verified = Column(BOOLEAN, default=False) # True if the data is from a verified source or is validated by other users (e.g. by voting)
    last_modified = Column(TIMESTAMP, nullable=False)

    university = relationship("University", cascade="save-update", uselist=False)

    @validates("data")
    def validate_data(self, key, data):
        if len(json.dumps(data)) > 200 * 1024:  # 200 Kilobytes
            raise ValueError("Data is too large!")
        return data

class CalendarNative(Base):
    __tablename__ = "calendar_native"
    id = Column(Integer, primary_key=True, index=True)
    university_id = Column(Integer, nullable=False)
    lecture_name = Column(String(255), nullable=False)
    source = Column(String(255), nullable=False)
    data = Column(JSON, nullable=False)
    hash = Column(String(255), nullable=False)
    is_active = Column(BOOLEAN, default=False)

    last_modified = Column(TIMESTAMP, nullable=False)

    university = relationship("University", cascade="save-update", uselist=False)

class University(Base):
    __tablename__ = "university"
    id = Column(Integer, primary_key=True, index=True)
    address_id = Column(Integer, nullable=False)
    name = Column(String(255), nullable=False)
    rooms = Column(JSON, nullable=False)


    last_modified = Column(TIMESTAMP, nullable=False)
    address = relationship("Address", uselist=False)
    

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