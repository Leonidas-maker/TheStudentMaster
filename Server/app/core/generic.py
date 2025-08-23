from sqlalchemy.ext.asyncio import AsyncSession

from crud.audit import AuditLogger

from dataclasses import dataclass

@dataclass
class EndpointContext:
    """Dataclass wrap the db and audit_logger for the endpoints

    :param db: The database session
    :param audit_logger: The audit logger
    """

    db: AsyncSession
    audit_logger: AuditLogger