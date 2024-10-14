# Higherly inspired by https://github.com/tom-draper/api-analytics

import logging
import threading
from datetime import datetime
from typing import Dict, List, Tuple, Union

import requests

# Use a dictionary to group requests by (path, method)
_requests: Dict[Tuple[str, str], Dict] = {}
_last_posted = datetime.now()

logger = logging.getLogger("api_analytics")
logger.setLevel(logging.DEBUG)


def log_request(
    api_key: str,
    request_data: Dict,
    server_url: str,
):
    logger.debug(f"Logging request: {request_data}")
    if not api_key:
        logger.debug("Aborting log request: API key is not set.")
        return

    global _requests, _last_posted

    # Extract 'path', 'method', and 'log_entry' from request_data
    path = request_data.pop('path', None)
    method = request_data.pop('method', None)
    log_entry = request_data.pop('log_entry', None)
    if path is None or method is None or log_entry is None:
        logger.error("Request data must contain 'path', 'method', and 'log_entry'")
        return

    key = (path, method)

    if key not in _requests:
        _requests[key] = {
            'path': path,
            'method': method,
            'api_request_logs': []
        }
    _requests[key]['api_request_logs'].append(log_entry)

    now = datetime.now()
    if (now - _last_posted).total_seconds() > 30.0:
        # Convert _requests to a list
        requests_list = list(_requests.values())
        threading.Thread(
            target=_post_requests,
            args=(api_key, requests_list, server_url),
        ).start()
        _requests = {}
        _last_posted = now


def _post_requests(
    api_key: str,
    requests_data: List[Dict],
    server_url: str,
):
    url = _endpoint_url(server_url)
    logger.debug(f"Posting {len(requests_data)} grouped requests to server: {url}")
    if url is None:
        logger.debug("Aborting post to server: Server URL is not set.")
        return
    
    try:
        response = requests.post(
            url,
            headers={"X-API-Key": api_key},
            json=requests_data,
            timeout=10,
        )
        logger.debug(f"Response from server ({response.status_code}): {response.text}")
    except requests.exceptions.RequestException as e:
        logger.error(f"Failed to post requests: {e}")


def _endpoint_url(server_url: Union[str, None]):
    if not server_url:
        return None
    if server_url.endswith("/"):
        return server_url + "/analytics/log-request"
    return server_url + "/analytics/log-request"
