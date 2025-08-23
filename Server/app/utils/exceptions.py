from fastapi import HTTPException
import traceback

async def handle_exception(e, ep_context, message: str):
    """
    Handles an exception by rolling back the DB transaction, logging the error,
    and raising an HTTPException.

    :param e: The exception to handle.
    :param ep_context: The RequestContext containing db and audit_logger.
    :param message: Error message to log and return in HTTP response.
    """
    if isinstance(e, HTTPException):
        raise e

    # Rollback the database transaction
    await ep_context.db.rollback()

    # Log the error
    ep_context.audit_logger.sys_error(
        message, traceback=traceback.format_exc()
    )

    # Optionally commit any audit logs or other necessary cleanup
    await ep_context.db.commit()

    # Print the traceback for debugging
    traceback.print_exc()

    # Raise an HTTPException
    raise HTTPException(status_code=500, detail=f"{message}. Please try again later.")