from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional, Annotated
from datetime import datetime

from controllers.email import fetch_folders, fetch_email_list, fetch_email, setFlags, fetch_tagged_emails
from models.pydantic_schemas import s_email

email_router = APIRouter()


@email_router.post("/get-folders")
async def get_folders(request: s_email.EmailBaseAuth):
    """
    Retrieve a list of all available folders (mailboxes) in the email account.
    """
    try:
        folders = fetch_folders(
            username=request.username,
            password=request.password,
            imap_server=request.imap_server,
            imap_port=request.imap_port,
        )
        return {"folders": folders}
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500)


@email_router.post("/get-email-list", response_model=List[s_email.EmailListResponse])
async def get_email_list(
    request: s_email.EmailListRequest,
    read_status: Optional[str] = Query("all", enum=["all", "unread", "read"]),
    since_date: Optional[datetime] = None,
    before_date: Optional[datetime] = None,
):
    """
    Retrieve a list of emails from a specified mailbox with basic information, excluding the body content.
    """
    try:
        emails = fetch_email_list(
            username=request.username,
            password=request.password,
            imap_server=request.imap_server,
            imap_port=request.imap_port,
            mailbox=request.mailbox,
            read_status=read_status,
            since_date=since_date,
            before_date=before_date,
        )
        return emails
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500)


@email_router.post("/get-tagged-email-list", response_model=List[s_email.EmailListTaggedResponse])
async def get_specific_email_list(
    request: s_email.EmailBaseAuth,
    tags: Annotated[list[str] | None, Query()],
):
    """
    Retrieve unread and starred emails from a specified mailbox with basic information, excluding the body content.
    """
    try:
        emails = fetch_tagged_emails(
            username=request.username,
            password=request.password,
            imap_server=request.imap_server,
            imap_port=request.imap_port,
            tags=tags,
        )
        return emails
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500)


@email_router.post("/get-email", response_model=s_email.EmailResponse)
async def get_email(request: s_email.EmailRequest):
    """
    Retrieve the full details of a specific email from a specified mailbox, including its body content, and mark it as read.
    """
    try:
        email = fetch_email(
            username=request.username,
            password=request.password,
            imap_server=request.imap_server,
            imap_port=request.imap_port,
            message_id=request.message_id,
            mailbox=request.mailbox,
        )
        return email
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500)


@email_router.post("/set-flags")
async def set_flags(request: s_email.FlagsEmailsRequest):
    """
    Add or remove flags to/from a list of emails in a specified mailbox. Flags with '+' will be added,
    while flags with '-' will be removed.
    """
    try:
        setFlags(
            username=request.username,
            password=request.password,
            imap_server=request.imap_server,
            imap_port=request.imap_port,
            mailbox=request.mailbox,
            message_ids=request.message_ids,
            flags=request.flags,
        )
        return {"message": "Emails successfully flagged"}
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500)
