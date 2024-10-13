from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException
from typing import List
from fastapi_cache import FastAPICache
from fastapi_cache.decorator import cache

# ~~~~~~~~~~~~~~~~~ Models ~~~~~~~~~~~~~~~~ #
from models.sql_models import m_stats

# ~~~~~~~~~~~~~~~~~ Schemas ~~~~~~~~~~~~~~~~ #
from models.pydantic_schemas import s_stats


def get_stats(db: Session) -> s_stats.ServerStatus:
    routes: List[m_stats.RouteStatus] = db.query(m_stats.RouteStatus).all()
    server_status = s_stats.ServerStatus(routes_stats={}, frontend_version="")
    for route in routes:
        if route.route_name != "main":
            server_status.routes_stats[route.route_name] = s_stats.RouteStatus(
                status=route.status,
                maintenance=route.maintenance,
                unavailable_for=route.unavailable_for,
                api_version=route.api_version,
            )
        else:
            server_status.frontend_version = route.frontend_version

    return server_status


def update_stats(db: Session, new_server_status: s_stats.ServerStatus):
    routes = db.query(m_stats.RouteStatus).all()
    for route in routes:
        if route.route_name != "main":
            route.status = new_server_status.routes_stats[route.route_name]["status"]
            route.maintenance = new_server_status.routes_stats[route.route_name]["maintenance"]
            route.unavailable_for = new_server_status.routes_stats[route.route_name]["unavailable_for"]
            route.api_version = new_server_status.routes_stats[route.route_name]["api_version"]
        else:
            route.frontend_version = new_server_status.frontend_version
    db.commit()
