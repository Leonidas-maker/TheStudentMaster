import json
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models import m_calendar, m_stats
from schemas import s_generic

from crud.general import create_address

from config.settings import ROUTE_VERSIONS_BASE


async def init_calendar(session: AsyncSession) -> None:
    """
    Prepare calendar tables by adding initial data if they are empty.
    """

    # 1) Insert CalendarBackends if they do not exist
    backends = ["Rapla", "iCalendar", "DHBW.APP"]
    for backend in backends:
        stmt = select(m_calendar.CalendarBackend).where(m_calendar.CalendarBackend.name == backend)
        result = await session.execute(stmt)
        backend_db = result.scalar_one_or_none()

        if not backend_db:
            # DHBW.APP has a different default value
            is_custom = False if backend == "DHBW.APP" else True
            session.add(m_calendar.CalendarBackend(name=backend, is_custom_available=is_custom))

    # 2) Load universities from JSON file
    with open("./data/ger_univercity.json", "r", encoding="utf-8") as f:
        data: list = json.load(f)

    # 3) Retrieve already existing university names
    uni_stmt = select(m_calendar.University.name)
    uni_result = await session.execute(uni_stmt)
    existing_unis = set(uni_result.scalars().all())

    # 4) Create new universities including address
    for uni in data:
        name = uni.get("name")
        if name in existing_unis:
            continue

        address_obj = None
        if uni.get("address1"):
            addr_in = s_generic.AddressCreate(
                address1=uni.get("address1"),
                address2=uni.get("address2"),
                city=uni.get("city"),
                district=uni.get("district"),
                postal_code=uni.get("zip"),
                country=uni.get("county"),
            )
            address_obj = await create_address(session, addr_in)

        session.add(
            m_calendar.University(
                name=name,
                domains=uni.get("domains"),
                address_id=address_obj.address_id if address_obj else None,
            )
        )

    # 5) Add default tags
    tags = ["online", "hybrid", "exam", "exam_review"]
    for tag in tags:
        tag_stmt = select(m_calendar.Tag).where(m_calendar.Tag.name == tag)
        tag_result = await session.execute(tag_stmt)
        tag_db = tag_result.scalar_one_or_none()
        if not tag_db:
            session.add(m_calendar.Tag(name=tag))

    # 6) Save changes
    await session.commit()


async def init_stats(db: AsyncSession):
    routes = await db.execute(select(m_stats.RouteStatus))
    routes = routes.scalars().all()
    if not routes:
        new_routes = []
        # Create the main route
        new_routes.append(
            m_stats.RouteStatus(
                route_name="main",
                status="online",
                maintenance=False,
                unavailable_for=0,
                frontend_version=ROUTE_VERSIONS_BASE["main"],
            )
        )

        # Create the other routes
        for route_name, route_version in ROUTE_VERSIONS_BASE.items():
            if route_name != "main":
                new_routes.append(
                    m_stats.RouteStatus(
                        route_name=route_name,
                        status="online",
                        maintenance=False,
                        unavailable_for=0,
                        api_version=route_version,
                    )
                )

        db.add_all(new_routes)
        routes = new_routes

    #  # Needed for the cache
    # for route in routes:
    #     if route.route_name != "main":
    #         globals.server_stats_cache[route.route_name] = {
    #             "status": route.status,
    #             "maintenance": route.maintenance,
    #             "unavailable_for": route.unavailable_for,
    #             "api_version": route.api_version,
    #         }

    await db.commit()
