from sqlalchemy import Column, Integer, String, TIMESTAMP, BOOLEAN, ForeignKey
from config.database import Base
from sqlalchemy.orm import relationship, Mapped
from typing import List

class ICalGeneral(Base):
    __tablename__ = "ical_general"

    ical_id = Column(Integer, primary_key=True, index=True, nullable=False)

    name = Column(String(255), nullable=False)
    source = Column(String(255), nullable=False, unique=True)

    is_active = Column(BOOLEAN, nullable=False, default=False)
    is_custom = Column(BOOLEAN, nullable=False, default=False)
    last_modified = Column(TIMESTAMP, nullable=False)

    # Mapped is a type hint for the 1:n relationship
    events: Mapped[List["ICalEventBase"]] = relationship(back_populates="ical")


class ICalEventBase(Base):
    __tablename__ = "ical_event_base"

    base_event_id = Column(Integer, primary_key=True, index=True, nullable=False)
    ical_id = Column(Integer, ForeignKey("ical_general.ical_id"), nullable=False)

    summary = Column(String(255), nullable=False)
    last_modified = Column(TIMESTAMP, nullable=False)

    event = relationship("ICalEvent", backref="ical_event_base")
    ical = relationship("ICalGeneral", backref="ical_event_base")


class ICalEvent(Base):
    __tablename__ = "ical_event"

    event_id = Column(Integer, primary_key=True, index=True, nullable=False)
    base_event_id = Column(Integer, ForeignKey("ical_event_base.base_event_id"), nullable=False)

    description = Column(String(255))
    location_id = Column(Integer, ForeignKey("ical_location.location_id"), nullable=False)

    start = Column(TIMESTAMP, nullable=False)
    end = Column(TIMESTAMP, nullable=False)
    timezone_id = Column(Integer, ForeignKey("time_zones.timezone_id"), nullable=False)

    last_modified = Column(TIMESTAMP, nullable=False)

    location = relationship("ICalLocation", backref="ical_event")
    timezone = relationship("TimeZones", backref="ical_event")


class ICalLocation(Base):
    __tablename__ = "ical_location"

    location_id = Column(Integer, primary_key=True, index=True, nullable=False)
    location = Column(String(255), nullable=False)
    last_modified = Column(TIMESTAMP, nullable=False)


class TimeZones(Base):
    __tablename__ = "time_zones"

    timezone_id = Column(Integer, primary_key=True, index=True, nullable=False)
    timezone = Column(String(255), nullable=False)
    last_modified = Column(TIMESTAMP, nullable=False)
