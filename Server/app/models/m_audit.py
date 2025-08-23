from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import ForeignKey, UUID, Boolean, DateTime, Enum, Text, String
from sqlalchemy.dialects.mysql import TIMESTAMP
import uuid
import datetime
import enum

from config.database import Base
from config.settings import DEFAULT_TIMEZONE

class ErrorLevels(enum.Enum):
    DEBUG = "DEBUG"
    WARNING = "WARNING"
    ERROR = "ERROR"
    CRITICAL = "CRITICAL"


class ErrorLog(Base):
    __tablename__ = "logs_error"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    timestamp: Mapped[datetime.datetime] = mapped_column(
        TIMESTAMP(timezone=True, fsp=6),
        nullable=False,
        default=lambda: datetime.datetime.now(DEFAULT_TIMEZONE)
    )
    level: Mapped[ErrorLevels] = mapped_column(Enum(ErrorLevels), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    traceback: Mapped[str] = mapped_column(Text, nullable=True)
    correlation_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=True)
