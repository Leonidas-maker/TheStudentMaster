from fastapi import HTTPException
import imaplib
import email
from email.header import decode_header
from typing import List

# ~~~~~~~~~~~~~~~ Middleware ~~~~~~~~~~~~~~ #
from middleware.email import decode_payload, parse_email_address, build_search_criteria, parseFolder


def fetch_folders(username, password, imap_server, imap_port):
    """
    Fetch a list of all available folders (mailboxes) in the email account.
    """
    mail = imaplib.IMAP4_SSL(imap_server, imap_port)
    mail.login(username, password)

    status, folders = mail.list()  # Fetch all folders
    mail.logout()

    if status == "OK":
        return parseFolder(folders)
    else:
        mail.logout()
        raise Exception("Unable to fetch folders")


def fetch_email_list(
    username, password, imap_server, imap_port, mailbox, read_status="all", since_date=None, before_date=None
):
    """
    Fetch a list of emails from a specified mailbox, without the body content.
    Returns only non-optional structural email data (From, To, Cc, Bcc, Date, Subject, Message-ID)
    with a structured format for addresses. Optionally filters by date range using SINCE and BEFORE.
    """
    mail = imaplib.IMAP4_SSL(imap_server, imap_port)
    mail.login(username, password)
    mail.select(f'"{mailbox}"')

    # Determine the search criteria based on the read_status parameter
    search_criteria = []
    if read_status == "unread":
        search_criteria.append("UNSEEN")
    elif read_status == "read":
        search_criteria.append("SEEN")
    elif read_status == "flagged":
        search_criteria.append("FLAGGED")
    else:
        search_criteria.append("ALL")

    # Add date-based filters if provided
    if since_date:
        search_criteria.append(f'SINCE {since_date.strftime("%d-%b-%Y")}')
    if before_date:
        search_criteria.append(f'BEFORE {before_date.strftime("%d-%b-%Y")}')

    # Convert the search criteria list into a string
    search_criteria_str = " ".join(search_criteria)

    # Execute the search
    status, messages = mail.search(None, search_criteria_str)
    email_ids = messages[0].split()
    emails = []
    for i, email_id in enumerate(email_ids):
        status, msg_data = mail.fetch(email_id, "(BODY.PEEK[HEADER] FLAGS)")
        if status != "OK":
            continue

        # Extract flags from the response
        msg_flags = imaplib.ParseFlags(msg_data[1]) if msg_data else None
        for response_part in msg_data:
            if isinstance(response_part, tuple):

                msg = email.message_from_bytes(response_part[1])

                # Decoding Subject
                subject, encoding = decode_header(msg["Subject"])[0]
                if isinstance(subject, bytes):
                    subject = subject.decode(encoding if encoding else "utf-8")

                # Decoding From
                from_ = msg.get("From")
                from_ = parse_email_address(email.utils.getaddresses([from_])[0])

                # Decoding To
                to_ = msg.get("To")
                to_ = [parse_email_address(addr) for addr in email.utils.getaddresses([to_])]

                # Decoding Cc
                cc_ = msg.get("Cc")
                if cc_:
                    cc_ = [parse_email_address(addr) for addr in email.utils.getaddresses([cc_])]
                else:
                    cc_ = []

                # Decoding Bcc (Bcc is not always available in headers)
                bcc_ = msg.get("Bcc")
                if bcc_:
                    bcc_ = [parse_email_address(addr) for addr in email.utils.getaddresses([bcc_])]
                else:
                    bcc_ = []

                # Fetching Date and Message-ID
                date_ = msg.get("Date")
                message_id = msg.get("Message-ID")

                # Append the non-optional data to the list
                emails.append(
                    {
                        "id": email_id.decode(),
                        "subject": subject,
                        "from_": from_,
                        "to": to_,
                        "cc": cc_,
                        "bcc": bcc_,
                        "date": date_,
                        "message_id": message_id if message_id else f"no-message-id-{i}",
                        "flags": msg_flags,
                    }
                )

    mail.logout()
    return emails


def fetch_email(username, password, imap_server, imap_port, message_id, mailbox):
    """
    Fetch a specific email using its Message-ID, including its body content, and mark it as read.
    """
    mail = imaplib.IMAP4_SSL(imap_server, imap_port)
    mail.login(username, password)
    mail.select(f'"{mailbox}"')

    # Search for the email using the Email-ID
    status, msg_ids = mail.search(None, f'HEADER Message-ID "{message_id}"')
    if status != "OK" or not msg_ids[0]:
        raise HTTPException(status_code=404, detail="Email not found")

    email_id = msg_ids[0].split()[0]

    # Fetch the email and mark it as read
    status, msg_data = mail.fetch(email_id, "(RFC822)")
    email_details = None

    for response_part in msg_data:
        if isinstance(response_part, tuple):
            msg = email.message_from_bytes(response_part[1])
            subject, encoding = decode_header(msg["Subject"])[0]
            if isinstance(subject, bytes):
                subject = subject.decode(encoding if encoding else "utf-8")

            body = ""
            if msg.is_multipart():
                for part in msg.walk():
                    content_type = part.get_content_type()
                    content_disposition = str(part.get("Content-Disposition"))
                    if content_type == "text/plain" and "attachment" not in content_disposition:
                        body = decode_payload(part)
                        break
            else:
                body = decode_payload(msg)

            email_details = {
                "message_id": message_id,
                "body": body,
            }

    # Mark the email as read
    mail.store(email_id, "+FLAGS", "\\Seen")
    mail.logout()

    if email_details:
        return email_details
    else:
        raise HTTPException(status_code=404, detail="Email not found")


def setFlags(username, password, imap_server, imap_port, mailbox: str, message_ids: List[str], flags: List[str]):
    """
    Add or remove flags to/from a list of emails in a specified mailbox using Message-ID.
    Flags with '+' will be added, and flags with '-' will be removed.
    """
    mail = imaplib.IMAP4_SSL(imap_server, imap_port)
    mail.login(username, password)
    mail.select(f'"{mailbox}"')

    # Create two lists for flags to add and remove
    add_flags = []
    remove_flags = []

    # Separate the flags based on their prefixes
    for flag in flags:
        if flag.startswith("+"):
            add_flags.append(flag[1:])  # Strip the "+" before appending
        elif flag.startswith("-"):
            remove_flags.append(flag[1:])  # Strip the "-" before appending

    # List to store all found UIDs
    all_uids = []

    for message_id in message_ids:
        # Search for the email using its Message-ID
        search_criteria = f'HEADER Message-ID "{message_id}"'
        status, msg_uids = mail.uid("SEARCH", None, search_criteria)

        if status != "OK" or not msg_uids[0]:
            continue

        # Add the UIDs to the list (multiple UIDs could be returned)
        all_uids += msg_uids[0].split()

    all_uids = [uid.decode("utf-8") for uid in all_uids]

    # Check if we have any UIDs to update
    if all_uids:
        # Combine all UIDs into a single string for batch processing
        uid_str = ",".join(all_uids)

        # Apply flags in one batch
        if add_flags:
            mail.uid("STORE", uid_str, "+FLAGS", f"({' '.join(add_flags)})")
        if remove_flags:
            mail.uid("STORE", uid_str, "-FLAGS", f"({' '.join(remove_flags)})")

    mail.logout()


def fetch_tagged_emails(username, password, imap_server, imap_port, tags: List[str]):
    """
    Fetch a list of emails from a specified mailbox that are tagged with a specific keyword in the subject line.
    """
    mail = imaplib.IMAP4_SSL(imap_server, imap_port)
    mail.login(username, password)

    status, folders = mail.list()  # Fetch all folders
    if status != "OK":
        mail.logout()
        raise Exception("Unable to fetch folders")

    search_criteria = build_search_criteria(tags)
    emails = []
    folder_list = parseFolder(folders)
    for folder in folder_list:
        mail.select(f'"{folder}"')

        status, messages = mail.search(None, search_criteria)
        if status != "OK":
            continue

        email_ids = messages[0].split()

        for email_id in email_ids:
            status, msg_data = mail.fetch(email_id, "(BODY.PEEK[HEADER] FLAGS)")
            if status != "OK":
                continue

            # Extract flags from the response
            msg_flags = imaplib.ParseFlags(msg_data[1]) if msg_data else None
            for response_part in msg_data:
                if isinstance(response_part, tuple):

                    msg = email.message_from_bytes(response_part[1])

                    # Decoding Subject
                    subject, encoding = decode_header(msg["Subject"])[0]
                    if isinstance(subject, bytes):
                        subject = subject.decode(encoding if encoding else "utf-8")

                    # Decoding From
                    from_ = msg.get("From")
                    from_ = parse_email_address(email.utils.getaddresses([from_])[0])

                    # Decoding To
                    to_ = msg.get("To")
                    to_ = [parse_email_address(addr) for addr in email.utils.getaddresses([to_])]

                    # Decoding Cc
                    cc_ = msg.get("Cc")
                    if cc_:
                        cc_ = [parse_email_address(addr) for addr in email.utils.getaddresses([cc_])]
                    else:
                        cc_ = []

                    # Decoding Bcc (Bcc is not always available in headers)
                    bcc_ = msg.get("Bcc")
                    if bcc_:
                        bcc_ = [parse_email_address(addr) for addr in email.utils.getaddresses([bcc_])]
                    else:
                        bcc_ = []

                    # Fetching Date and Message-ID
                    date_ = msg.get("Date")
                    message_id = msg.get("Message-ID")

                    # Append the non-optional data to the list
                    emails.append(
                        {
                            "id": email_id.decode(),
                            "subject": subject,
                            "from_": from_,
                            "to": to_,
                            "cc": cc_,
                            "bcc": bcc_,
                            "date": date_,
                            "message_id": message_id,
                            "flags": msg_flags,
                            "mailbox": folder,
                        }
                    )
    mail.logout()
    return emails
