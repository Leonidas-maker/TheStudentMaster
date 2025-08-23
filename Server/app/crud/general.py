from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from schemas import s_generic

from models import m_generic

async def create_address(
    session: AsyncSession,
    address_in: s_generic.AddressCreate
) -> m_generic.Address:
    if not address_in:
        raise ValueError("Address is required")

    # 1) Look for an existing Address
    stmt = (
        select(m_generic.Address)
        .join(m_generic.PostalCode)
        .where(
            m_generic.Address.address1 == address_in.address1,
            m_generic.Address.address2 == address_in.address2,
            m_generic.PostalCode.postal_code == address_in.postal_code,
        )
    )
    result = await session.execute(stmt)
    address_db = result.scalar_one_or_none()
    if address_db:
        return address_db

    new_objs = []

    # 2) Look for an existing PostalCode
    stmt = (
        select(m_generic.PostalCode)
        .join(m_generic.City)
        .where(
            m_generic.PostalCode.postal_code == address_in.postal_code,
            m_generic.City.city == address_in.city,
        )
    )
    result = await session.execute(stmt)
    postal_db = result.scalar_one_or_none()

    if not postal_db:
        # 3) Look for an existing City
        stmt = (
            select(m_generic.City)
            .join(m_generic.District)
            .where(
                m_generic.City.city == address_in.city,
                m_generic.District.district == address_in.district,
            )
        )
        result = await session.execute(stmt)
        city_db = result.scalar_one_or_none()

        if not city_db:
            # 4) Look for an existing District
            stmt = (
                select(m_generic.District)
                .join(m_generic.Country)
                .where(
                    m_generic.District.district == address_in.district,
                    m_generic.Country.country == address_in.country,
                )
            )
            result = await session.execute(stmt)
            district_db = result.scalar_one_or_none()

            if not district_db:
                # 5) Look for an existing Country
                stmt = select(m_generic.Country).where(
                    m_generic.Country.country == address_in.country
                )
                result = await session.execute(stmt)
                country_db = result.scalar_one_or_none()

                if not country_db:
                    country_db = m_generic.Country(country=address_in.country)
                    new_objs.append(country_db)

                # create District
                district_db = m_generic.District(
                    district=address_in.district,
                    country=country_db
                )
                new_objs.append(district_db)

            # create City
            city_db = m_generic.City(
                city=address_in.city,
                district=district_db
            )
            new_objs.append(city_db)

        # create PostalCode
        postal_db = m_generic.PostalCode(
            postal_code=address_in.postal_code,
            city=city_db
        )
        new_objs.append(postal_db)

    # 6) Finally, create the Address
    address_db = m_generic.Address(
        address1=address_in.address1,
        address2=address_in.address2,
        postal_code=postal_db,
    )
    new_objs.append(address_db)

    # bulk-add and flush
    session.add_all(new_objs)
    await session.flush()

    return address_db
