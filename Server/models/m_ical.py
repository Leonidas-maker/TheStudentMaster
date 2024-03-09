from sqlalchemy import Column, Integer, String, TIMESTAMP, BOOLEAN, ForeignKey
from sqlalchemy.dialects.mysql import MEDIUMBLOB
from config.database import Base

class ICalGeneral(Base):
    __tablename__ = "ical_general"

    ical_id = Column(Integer, primary_key=True, index=True, nullable=False)
    is_active = Column(BOOLEAN, nullable=False, default=False)
    is_custom = Column(BOOLEAN, nullable=False, default=False)

class ICalDHBWMannheim(Base):
    __tablename__ = "ical_dhbw_mannheim"

    ical_id = Column(Integer, ForeignKey("ical_general.ical_id"), nullable=False, primary_key=True)
    ical_source_id = Column(Integer, nullable=False, unique=True)
    name = Column(String(255), nullable=False)
    ical_data = Column(MEDIUMBLOB(204800), nullable=False)
    last_modified = Column(TIMESTAMP, nullable=False)

class ICalCustom(Base):
    __tablename__ = "ical_custom"

    ical_id = Column(Integer, ForeignKey("ical_general.ical_id"), nullable=False, primary_key=True)
    source_url = Column(String(255), nullable=False, unique=True)
    name = Column(String(255), nullable=False)
    ical_data = Column(MEDIUMBLOB(204800), nullable=False)
    last_modified = Column(TIMESTAMP, nullable=False)

