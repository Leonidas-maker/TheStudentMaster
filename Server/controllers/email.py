from fastapi import HTTPException
import imaplib
import email
from email.header import decode_header


def fetch_folders(username, password, imap_server, imap_port):
    """
    Fetch a list of all available folders (mailboxes) in the email account.
    """
    mail = imaplib.IMAP4_SSL(imap_server, imap_port)
    mail.login(username, password)

    status, folders = mail.list()  # Fetch all folders
    mail.logout()

    if status == "OK":
        # Parse and return folder names
        folder_list = []
        for folder in folders:
            # Each folder is returned as a byte string, so decode it
            parts = folder.decode().split(' "/" ')
            folder_name = parts[-1].strip('"')
            folder_list.append(folder_name)

        return folder_list
    else:
        raise Exception("Unable to fetch folders")


def fetch_email_list(username, password, imap_server, imap_port, mailbox, read_status="all"):
    """
    Fetch a list of emails from a specified mailbox, without the body content.
    """
    mail = imaplib.IMAP4_SSL(imap_server, imap_port)
    mail.login(username, password)
    mail.select(mailbox)

    # Determine the search criteria based on the read_status parameter
    if read_status == "unread":
        search_criteria = "UNSEEN"
    elif read_status == "read":
        search_criteria = "SEEN"
    else:
        search_criteria = "ALL"

    status, messages = mail.search(None, search_criteria)
    email_ids = messages[0].split()

    emails = []
    for email_id in email_ids:
        status, msg_data = mail.fetch(email_id, "(BODY.PEEK[HEADER])")
        for response_part in msg_data:
            if isinstance(response_part, tuple):
                msg = email.message_from_bytes(response_part[1])
                subject, encoding = decode_header(msg["Subject"])[0]
                if isinstance(subject, bytes):
                    subject = subject.decode(encoding if encoding else "utf-8")
                from_ = msg.get("From")
                emails.append(
                    {
                        "id": email_id.decode(),
                        "subject": subject,
                        "from_": "---".join(
                            part.decode(encoding or "utf-8") if isinstance(part, bytes) else part
                            for part, encoding in decode_header(from_)
                        ),
                    }
                )

    mail.logout()
    return emails


def fetch_email(username, password, imap_server, imap_port, email_id, mailbox):
    """
    Fetch a specific email including its body content, and mark it as read.
    """
    mail = imaplib.IMAP4_SSL(imap_server, imap_port)
    mail.login(username, password)
    mail.select(mailbox)

    # Fetch the email and mark it as read
    status, msg_data = mail.fetch(email_id, "(RFC822)")
    email_details = None
    for response_part in msg_data:
        if isinstance(response_part, tuple):
            msg = email.message_from_bytes(response_part[1])
            subject, encoding = decode_header(msg["Subject"])[0]
            if isinstance(subject, bytes):
                subject = subject.decode(encoding if encoding else "utf-8")
            from_ = msg.get("From")
            body = ""
            if msg.is_multipart():
                for part in msg.walk():
                    content_type = part.get_content_type()
                    content_disposition = str(part.get("Content-Disposition"))
                    try:
                        body = part.get_payload(decode=True).decode()
                    except:
                        pass
                    if content_type == "text/plain" and "attachment" not in content_disposition:
                        break
            else:
                body = msg.get_payload(decode=True).decode()
            email_details = {
                "id": email_id,
                "subject": subject,
                "from_": "---".join(
                    part.decode(encoding or "utf-8") if isinstance(part, bytes) else part
                    for part, encoding in decode_header(from_)
                ),
                "body": body,
            }

    # Mark the email as read
    mail.store(email_id, "+FLAGS", "\\Seen")

    mail.logout()
    if email_details:
        return email_details
    else:
        raise HTTPException(status_code=404, detail="Email not found")


def mark_emails(username, password, imap_server, imap_port, email_ids, mark_as_read, mailbox):
    """
    Mark specific emails as read or unread based on the mark_as_read flag.
    """
    mail = imaplib.IMAP4_SSL(imap_server, imap_port)
    mail.login(username, password)
    mail.select(mailbox)

    for email_id in email_ids:
        if mark_as_read:
            mail.store(email_id, "+FLAGS", "\\Seen")  # Set the \Seen flag
        else:
            mail.store(email_id, "-FLAGS", "\\Seen")  # Remove the \Seen flag

    mail.logout()
