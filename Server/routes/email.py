from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional

from controllers.email import fetch_folders, fetch_email_list, fetch_email, mark_emails
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
            imap_port=request.imap_port
        )
        return {"folders": folders}
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500)

@email_router.post("/get-email-list", response_model=List[s_email.EmailListResponse])
async def get_email_list(request: s_email.EmailListRequest, 
                         read_status: Optional[str] = Query("all", enum=["all", "unread", "read"])):
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
            read_status=read_status
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
            email_id=request.email_id,
            mailbox=request.mailbox
        )
        return email
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500)

@email_router.post("/mark-emails")
async def mark_emails_endpoint(request: s_email.MarkEmailRequest):
    """
    Mark specific emails as read or unread in a specified mailbox.
    """
    try:
        mark_emails(
            username=request.username,
            password=request.password,
            imap_server=request.imap_server,
            imap_port=request.imap_port,
            email_ids=request.email_ids,
            mark_as_read=request.mark_as_read,
            mailbox=request.mailbox
        )
        return {"message": "Emails successfully marked"}
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500)