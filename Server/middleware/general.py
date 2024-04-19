from sqlalchemy.orm import Session

# ~~~~~~~~~~~~~~~~ Schemas ~~~~~~~~~~~~~~~~ #
from models.pydantic_schemas import s_general

# ~~~~~~~~~~~~~~~~~ Models ~~~~~~~~~~~~~~~~ #
from models.sql_models import m_general


def create_address(db: Session, new_address: s_general.AddressCreate) -> s_general.Address:
    if not new_address:
        raise ValueError("Address is required")

    # Check if request.address exists
    address_exists = (
        db.query(m_general.Address)
        .join(m_general.PostalCode)
        .filter(
            m_general.Address.address1 == new_address.address1,
            m_general.Address.address2 == new_address.address2,
            m_general.PostalCode.postal_code == new_address.postal_code,
        )
        .first()
    )

    if address_exists:
        return address_exists

    # Check if request.address.postal_code exists
    

    postal_code_exists = (
        db.query(m_general.PostalCode)
        .join(m_general.City)
        .filter(
            m_general.PostalCode.postal_code == new_address.postal_code,
            m_general.City.city == new_address.city,
        )
        .first()
    )



    if not postal_code_exists:
        # Check if request.address.city exists
        city_exists = (
            db.query(m_general.City)
            .join(m_general.District)
            .filter(
                m_general.City.city == new_address.city,
                m_general.District.district == new_address.district,
            )
            .first()
        )

        if not city_exists:
            # Check if request.address.district exists
            district_exists = (
                db.query(m_general.District)
                .join(m_general.Country)
                .filter(
                    m_general.District.district == new_address.district,
                    m_general.Country.country == new_address.country,
                )
                .first()
            )

            if not district_exists:
                # Check if request.address.country exists
                country_exists = (
                    db.query(m_general.Country).filter(m_general.Country.country == new_address.country).first()
                )

                if not country_exists:
                    # Create new country
                    country_exists = m_general.Country(country=new_address.country)
                    db.add(country_exists)
                    db.flush()
                # >> End country check <<

                # Create new district
                district_exists = m_general.District(
                    district=new_address.district, country_id=country_exists.country_id
                )
                db.add(district_exists)
                db.flush()
            # >> End district check <<

            # Create new city
            city_exists = m_general.City(city=new_address.city, district_id=district_exists.district_id)
            db.add(city_exists)
            db.flush()
        # >> End city check <<

        # Create new postal code
        postal_code_exists = m_general.PostalCode(postal_code=new_address.postal_code, city_id=city_exists.city_id)
        db.add(postal_code_exists)
        db.flush()
    # >> End postal code check <<

    # Create new address
    new_address = m_general.Address(
        address1=new_address.address1,
        address2=new_address.address2,
        postal_code_id=postal_code_exists.postal_code_id,
    )
    db.add(new_address)
    db.flush()

    return new_address
