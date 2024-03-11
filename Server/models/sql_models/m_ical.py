from sqlalchemy import Column, Integer, String, TIMESTAMP, BOOLEAN, JSON
from config.database import Base
from sqlalchemy.orm import validates, sessionmaker
import json


class ICalCustom(Base):
    __tablename__ = "ical_custom"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    source_url = Column(String(255), nullable=False)
    data = Column(JSON, nullable=False)
    hash = Column(String(255), nullable=False)

    last_modified = Column(TIMESTAMP, nullable=False)

    @validates("data")
    def validate_data(self, key, data):
        if len(json.dumps(data)) > 200 * 1024:  # 200 Kilobytes
            raise ValueError("Data is too large!")
        return data

class ICalDHBWMannheim(Base):
    __tablename__ = "ical_dhbw_mannheim"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    source = Column(String(255), nullable=False)
    data = Column(JSON, nullable=False)
    hash = Column(String(255), nullable=False)
    is_active = Column(BOOLEAN, default=False)

    last_modified = Column(TIMESTAMP, nullable=False)