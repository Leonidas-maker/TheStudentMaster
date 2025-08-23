from sqlalchemy import select
from sqlalchemy.orm import joinedload
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from models import m_canteen

async def get_all_canteens(db: AsyncSession, details: bool = False) -> list[m_canteen.Canteen]:
    """Get all canteens from the database.

    :param db: database session
    :return: list of canteen objects
    """
    query_options = []
    if details:
        query_options.append(joinedload(m_canteen.Canteen.address))

    res = await db.execute(select(m_canteen.Canteen).options(*query_options))
    canteens = res.scalars().all()
    return list(canteens)


async def get_canteen(
    db: AsyncSession, short_name: str, with_menus: bool = False
) -> Optional[m_canteen.Canteen]:
    """Get a canteen by its short name.

    :param db: database session
    :param canteen_short_name: short name of the canteen
    :return: canteen object or None if not found
    """
    query_options = []

    if with_menus:
        query_options.extend(
            [joinedload(m_canteen.Canteen.menus), joinedload(m_canteen.Canteen.menus).joinedload(m_canteen.Menu.dish)]
        )

    res = await db.execute(
        select(m_canteen.Canteen).options(*query_options).filter_by(canteen_short_name=short_name)
    )
    return res.scalars().unique().one_or_none()
