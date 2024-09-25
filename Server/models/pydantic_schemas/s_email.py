from pydantic import BaseModel
from typing import List, Optional


class EmailBaseAuth(BaseModel):
    username: str
    password: str
    imap_server: str
    imap_port: int


class EmailListRequest(EmailBaseAuth):
    mailbox: str


class EmailAddress(BaseModel):
    name: str
    email: str

class EmailListResponse(BaseModel):
    id: str
    subject: str
    from_: EmailAddress
    to: List[EmailAddress]     
    cc: Optional[List[EmailAddress]]  
    bcc: Optional[List[EmailAddress]] 
    date: str
    message_id: str
    flags: List[str]

class EmailListTaggedResponse(EmailListResponse):
    mailbox: str


class EmailRequest(EmailBaseAuth):
    message_id: str
    mailbox: str


class EmailResponse(BaseModel):
    message_id: str
    body: str


class FlagsEmailsRequest(EmailBaseAuth):
    mailbox: str
    message_ids: List[str]
    flags: List[str]
    


class MailboxResponse(BaseModel):
    name: str
