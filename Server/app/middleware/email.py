import quopri
import html
from email.header import decode_header


def isHTML(msg: str) -> bool:
    """Check if the email is an HTML message."""
    return any(tag in msg for tag in ["<html>", "<head>", "<body>"])


def text_to_html(decoded_str):
    """Converts plain text into HTML-formatted string."""

    # 1. Escape special HTML characters (<, >, &, etc.)
    escaped_str = html.escape(decoded_str)

    # 2. Convert double newlines to paragraph tags
    html_str = escaped_str.replace("\n\n", "</p><p>")

    # 3. Convert single newlines to <br> tags
    html_str = html_str.replace("\n", "<br>")

    # 4. Wrap the content in <p> tags for better formatting
    html_str = f"<p>{html_str}</p>"

    return html_str


def try_decoding_with_encodings(decoded_bytes, encodings=None):
    """Try decoding bytes with a list of encodings."""
    if encodings is None:
        encodings = ["utf-8", "ISO-8859-1", "latin1", "windows-1252"]

    # Try each encoding in the list
    for encoding in encodings:
        try:
            # Attempt to decode the bytes using the current encoding
            return decoded_bytes.decode(encoding)
        except (UnicodeDecodeError, AttributeError):
            continue  # If this encoding fails, try the next one

    # If all encodings fail, return the bytes decoded with 'utf-8' and ignore errors
    return decoded_bytes.decode("utf-8", errors="ignore")


def decode_payload(part):
    """Attempt to decode the payload with different encodings and handle quoted-printable."""

    # First, check if the content transfer encoding is 'quoted-printable'
    if part.get("Content-Transfer-Encoding", "").lower() == "quoted-printable":
        try:
            # Decode quoted-printable content into bytes
            decoded_bytes = quopri.decodestring(part.get_payload())
            decoded_str = try_decoding_with_encodings(decoded_bytes)

            # Replace the \r\n (CRLF) with a standard newline
            decoded_str = decoded_str.replace("\r\n", "\n")

            # Check if the decoded string is HTML or plain text
            if isHTML(decoded_str):
                return decoded_str
            else:
                return text_to_html(decoded_str)
        except (UnicodeDecodeError, AttributeError):
            pass

    # If not quoted-printable, get the payload and try decoding
    decoded_bytes = part.get_payload(decode=True)
    decoded_str = try_decoding_with_encodings(decoded_bytes)

    # Check if the decoded string is HTML or plain text
    if isHTML(decoded_str):
        return decoded_str
    else:
        return text_to_html(decoded_str)


def parse_email_address(address):
    """
    Helper function to parse the name and email from an address tuple.
    Handles MIME-encoded email headers and returns a dictionary with name and email fields.
    Ensures the name is always a string.
    """
    name, email_address = address

    # Decode the name if it's encoded in MIME format
    if name:
        decoded_name = []
        for part, encoding in decode_header(name):
            if isinstance(part, bytes):
                # Decode from bytes to string using the specified encoding (if any)
                decoded_name.append(part.decode(encoding or "utf-8"))
            else:
                decoded_name.append(part)
        # Join all parts (in case the name is split across multiple encoded sections)
        name = "".join(decoded_name)

    if email_address:
        decoded_email_address = []
        for part, encoding in decode_header(email_address):
            if isinstance(part, bytes):
                # Decode from bytes to string using the specified encoding (if any)
                try:
                    decoded_email_address.append(part.decode(encoding or "utf-8"))
                except UnicodeDecodeError:
                    # Handle decoding errors and fall back to a default encoding
                    decoded_email_address.append(part.decode("utf-8", errors="replace"))
            else:
                decoded_email_address.append(part)

        # Join all parts and make sure the result is complete
        email_address = "".join(decoded_email_address).strip()

    # Ensure name is always a string, even if it's empty
    return {"name": name if name else "", "email": email_address}


def build_search_criteria(tags):
    # If there are no tags, return an empty string
    if len(tags) == 1:
        return tags[0]

    # Combine multiple tags with 'OR' operator
    combined_criteria = tags[0]
    for criteria in tags[1:]:
        combined_criteria = f"OR {combined_criteria} {criteria}"

    return combined_criteria


def parseFolder(folders: list) -> list:
    # Parse and return folder names
    folder_list = []
    for folder in folders:
        # Each folder is returned as a byte string, so decode it
        parts = folder.decode().split(' "/" ')
        folder_name = parts[-1].strip('"')
        folder_list.append(folder_name)

    return folder_list
