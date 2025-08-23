from sqlalchemy import Column, Integer, String, TIMESTAMP, ForeignKey, Boolean
from config.database import Base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.orm import Mapped, mapped_column  # add ORM 2.0 annotations


class RouteStatus(Base):
    __tablename__ = "route_status"

    route_id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    route_name: Mapped[str] = mapped_column(String(100), nullable=False)
    status: Mapped[str] = mapped_column(String(100), nullable=False)
    maintenance: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    unavailable_for: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    api_version: Mapped[str | None] = mapped_column(String(10), nullable=True)
    frontend_version: Mapped[str | None] = mapped_column(String(10), nullable=True)
