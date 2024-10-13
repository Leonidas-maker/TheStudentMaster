from typing import Dict
from pydantic import BaseModel

class RouteStatus(BaseModel):
    status: str
    maintenance: bool
    unavailable_for: int
    api_version: str

class ServerStatus(BaseModel):
    routes_stats: Dict[str, RouteStatus]
    frontend_version: str
