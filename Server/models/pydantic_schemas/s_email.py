from pydantic import BaseModel
from typing import List, Optional

class EmailBaseAuth(BaseModel):
    username: str
    password: str
    imap_server: str
    imap_port: int

class EmailListRequest(EmailBaseAuth):
    mailbox: str 

class EmailListResponse(BaseModel):
    id: str
    subject: str
    from_: str

class EmailRequest(EmailBaseAuth):
    email_id: str 
    mailbox: str 

class EmailResponse(BaseModel):
    id: str
    subject: str
    from_: str
    body: str

class MarkEmailRequest(EmailBaseAuth):
    email_ids: List[str]
    mark_as_read: bool
    mailbox: str

class MailboxResponse(BaseModel):
    name: str