from sqlalchemy.orm import Session, joinedload

from config.globals import globals

from models.sql_models import m_stats

from models.pydantic_schemas import s_stats


from config.general import ROUTE_VERSIONS_BASE

async def init_stats(db: Session):
    routes = db.query(m_stats.RouteStatus).all()
    if not routes:
        new_routes = []
        # Create the main route
        new_routes.append(m_stats.RouteStatus(route_name="main", status="online", maintenance=False, unavailable_for=0, frontend_version=ROUTE_VERSIONS_BASE["main"]))

        # Create the other routes
        for route_name, route_version in ROUTE_VERSIONS_BASE.items():
            if route_name != "main":
                new_routes.append(m_stats.RouteStatus(route_name=route_name, status="online", maintenance=False, unavailable_for=0, api_version=route_version))

        db.add_all(new_routes)
        db.commit()
        routes = new_routes

    # Needed for the cache
    for route in routes:
        if route.route_name != "main":
            globals.server_stats_cache[route.route_name] = {
                "status": route.status,
                "maintenance": route.maintenance,
                "unavailable_for": route.unavailable_for,
                "api_version": route.api_version,
            }
