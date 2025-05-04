from sqlalchemy.ext.asyncio import AsyncSession
import uuid
from typing import Optional


from models.m_audit import  ErrorLog, ErrorLevels

from config.settings import DEFAULT_TIMEZONE, DEBUG


###########################################################################
################################## Logger #################################
###########################################################################
class AuditLogger:
    def __init__(self, db: AsyncSession):
        self.db = db

    def log_to_error(
        self,
        level: ErrorLevels,
        message: str,
        traceback: Optional[str] = None,
        correlation_id: Optional[uuid.UUID] = None,
    ) -> ErrorLog:
        """Log to the error log table.

        :param level: The error level
        :param message: The error message
        :param traceback: The traceback details, defaults to None
        :param correlation_id: The correlation ID for error tracking, defaults to None
        :raises ValueError: If the error level is invalid
        :return: The created ErrorLog object
        """
        if type(level) is not ErrorLevels:
            raise ValueError("Invalid error level")

        log_entry = ErrorLog(
            level=level,
            message=message,
            traceback=traceback,
            correlation_id=correlation_id,
        )
        self.db.add(log_entry)
        return log_entry

    # ======================================================== #
    # ======================== General ======================== #
    # ======================================================== #
    # def sys_info(self, message: str, details: Optional[str] = None, status: bool = True):
    #     """Log a system information message.

    #     :param message: The information message
    #     :param details: Additional details about the information, defaults to None
    #     :param status: The status of the message, defaults to True
    #     """
    #     self.log_to_audit(SYSTEM_USER_ID, message, AuditLogCategories.SYSTEM, details, status, is_system=True)

    def sys_warning(self, message: str, details: Optional[str] = None, correlation_id: Optional[uuid.UUID] = None):
        """Log a system warning message.

        :param message: The warning message
        :param details: Additional details about the warning, defaults to None
        :param correlation_id: The correlation ID for tracking, defaults to None
        """
        self.log_to_error(ErrorLevels.WARNING, message, details, correlation_id)

    def sys_error(self, message: str, correlation_id: Optional[uuid.UUID] = None, traceback: Optional[str] = None):
        """Log a system error message.

        :param message: The error message
        :param correlation_id: The correlation ID for error tracking, defaults to None
        :param traceback: The traceback details, defaults to None
        """
        self.log_to_error(ErrorLevels.ERROR, message, traceback, correlation_id)

    def sys_critical(self, message: str, correlation_id: Optional[uuid.UUID] = None, traceback: Optional[str] = None):
        """Log a system critical message.

        :param message: The critical error message
        :param correlation_id: The correlation ID for error tracking, defaults to None
        :param traceback: The traceback details, defaults to None
        """
        self.log_to_error(ErrorLevels.CRITICAL, message, traceback, correlation_id)

    def sys_debug(self, message: str, description: Optional[str] = None):
        """Log a system debug message.

        :param message: The debug message
        :param description: Additional description about the debug message, defaults to None
        """
        if DEBUG:
            self.log_to_error(ErrorLevels.DEBUG, message, description)
