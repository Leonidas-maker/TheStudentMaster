# Higherly inspired by https://github.com/tom-draper/api-analytics

from dataclasses import dataclass
from datetime import datetime, timezone
from time import time
from typing import Callable, Dict, Union

from anonip import Anonip
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response
from starlette.types import ASGIApp
from user_agents import parse

from utils.analytics import log_request, logger


class Analytics(BaseHTTPMiddleware):
    """Custom middleware for logging API requests."""

    def __init__(self, app: ASGIApp, api_key: str, config: "Config" = None):
        super().__init__(app)
        self.api_key = api_key
        self.config = config or Config()

        if not self.api_key:
            logger.debug("API key is not set.")
        if not self.config.server_url:
            logger.debug("Server URL is not set.")

        # Initialize Anonip if privacy level is 1
        if self.config.privacy_level == 1:
            self.anonip = Anonip()
        else:
            self.anonip = None

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        start = time()
        response = await call_next(request)
        duration = time() - start

        device_info = self._get_device_info(request)

        log_entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "response_time": round(duration, 2),  # to 00.00 format
            "status_code": response.status_code,
            "ip": self._get_ip_address(request),
            "device_info": device_info,
        }

        request_data = {
            "path": self.config.get_path(request),
            "method": request.method,
            "log_entry": log_entry,
        }

        log_request(
            self.api_key,
            request_data,
            self.config.server_url,
        )
        return response

    def _get_device_info(self, request: Request) -> Dict:
        user_agent_str = self.config.get_user_agent(request)
        if user_agent_str:
            user_agent = parse(user_agent_str)
            device_type = "Mobile" if user_agent.is_mobile else "Desktop" if user_agent.is_pc else "Unknown"
            return {
                "device_type": device_type,
                "os": user_agent.os.family,
                "browser": user_agent.browser.family,
            }
        else:
            return {
                "device_type": "Unknown",
                "os": "Unknown",
                "browser": "Unknown",
            }

    def _get_ip_address(self, request: Request) -> Union[str, None]:
        # Check if the app is behind a proxy by looking for the `X-Forwarded-For` header
        if "X-Forwarded-For" in request.headers:
            # Get the first IP in the `X-Forwarded-For` chain (the real client IP)
            forwarded_for = request.headers["X-Forwarded-For"]
            ip = forwarded_for.split(",")[0].strip()
        elif "X-Real-IP" in request.headers:
            # Alternatively, check for the `X-Real-IP` header
            ip = request.headers["X-Real-IP"]
        else:
            # Fallback to request.client.host if no proxy headers are present
            ip = request.client.host

        # Privacy Level Handling
        if self.config.privacy_level == 2:
            # Completely discard the IP address
            return None
        if self.config.privacy_level == 1 and ip and self.anonip:
            # Anonymize the IP address using Anonip
            ip = self.anonip.process_line(ip)
        return ip

    class Mappers:
        @staticmethod
        def get_path(request: Request) -> Union[str, None]:
            return request.url.path

        @staticmethod
        def get_ip_address(request: Request) -> Union[str, None]:
            return request.client.host

        @staticmethod
        def get_hostname(request: Request) -> Union[str, None]:
            return request.url.hostname

        @staticmethod
        def get_user_id(request: Request) -> Union[str, None]:
            return None

        @staticmethod
        def get_user_agent(request: Request) -> Union[str, None]:
            return request.headers.get("user-agent", None)


@dataclass
class Config:
    """
    Configuration for the FastAPI API Analytics middleware.

    :param privacy_level: Controls client identification via IP address.
        - 0: Sends the client IP to the server to be stored and client location is inferred.
        - 1: Sends an anonymized client IP to the server.
        - 2: Avoids sending the client IP address to the server entirely.Anonip
        Defaults to 0.
    :param server_url: For self-hosting. Points to the public server URL to post requests to.
    :param get_path: Mapping function that takes a request and returns the path stored within the request.
    :param get_ip_address: Mapping function that takes a request and returns the IP address stored within the request.
    :param get_hostname: Mapping function that takes a request and returns the hostname stored within the request.
    :param get_user_agent: Mapping function that takes a request and returns the user agent stored within the request.
    :param get_user_id: Mapping function that takes a request and returns a custom user ID stored within the request.
        Defaults to None. Assigning a value allows for tracking a custom user ID specific to your API.
    """

    privacy_level: int = 0
    server_url: str = ""
    get_path: Callable[[Request], Union[str, None]] = Analytics.Mappers.get_path
    get_ip_address: Callable[[Request], Union[str, None]] = Analytics.Mappers.get_ip_address
    get_hostname: Callable[[Request], Union[str, None]] = Analytics.Mappers.get_hostname
    get_user_agent: Callable[[Request], Union[str, None]] = Analytics.Mappers.get_user_agent
    get_user_id: Callable[[Request], Union[str, None]] = Analytics.Mappers.get_user_id
