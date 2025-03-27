from sqlalchemy import Column, Integer, String, TIMESTAMP, ForeignKey, Boolean
from config.database import Base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func


class RouteStatus(Base):
    __tablename__ = "route_status"

    route_id = Column(Integer, primary_key=True, index=True)
    route_name = Column(String(100), nullable=False)
    status = Column(String(100), nullable=False)
    maintenance = Column(Boolean, nullable=False, default=False)
    unavailable_for = Column(Integer, nullable=False, default=0)
    api_version = Column(String(10), nullable=True)
    frontend_version = Column(String(10), nullable=True)
