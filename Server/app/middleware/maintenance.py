from fastapi import Request
from fastapi.responses import JSONResponse

from config.globals import app_globals


async def check_route_availability(request: Request, call_next):
    base_path = request.url.path.replace("/api", "").strip("/").split("/")[0]
    route_status = app_globals.server_stats_cache.get(base_path, {})

    if route_status.get("status", "online") != "online" or route_status.get("maintenance", False):
        headers = {"Retry-After": "1800"}
        return JSONResponse(status_code=503, headers=headers, content={"message": "Service temporarily unavailable"})

    response = await call_next(request)
    return response
