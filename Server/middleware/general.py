from sqlalchemy.orm import Session

# ~~~~~~~~~~~~~~~~ Schemas ~~~~~~~~~~~~~~~~ #
from models.pydantic_schemas import s_general

# ~~~~~~~~~~~~~~~~~ Models ~~~~~~~~~~~~~~~~ #
from models.sql_models import m_general, m_user, m_calendar, m_canteen


###########################################################################
####################### Database specific functions #######################
###########################################################################


# Function to create a new address in the database
def create_address(db: Session, new_address: s_general.AddressCreate) -> s_general.Address:
    if not new_address:
        raise ValueError("Address is required")

    # Check if the address already exists
    address_db = (
        db.query(m_general.Address)
        .join(m_general.PostalCode)
        .filter(
            m_general.Address.address1 == new_address.address1,
            m_general.Address.address2 == new_address.address2,
            m_general.PostalCode.postal_code == new_address.postal_code,
        )
        .first()
    )

    if address_db:
        return address_db

    new_db_objects = []
    # Check if the postal code already exists
    postal_code_db = (
        db.query(m_general.PostalCode)
        .join(m_general.City)
        .filter(
            m_general.PostalCode.postal_code == new_address.postal_code,
            m_general.City.city == new_address.city,
        )
        .first()
    )

    if not postal_code_db:
        # Check if the city already exists
        city_db = (
            db.query(m_general.City)
            .join(m_general.District)
            .filter(
                m_general.City.city == new_address.city,
                m_general.District.district == new_address.district,
            )
            .first()
        )

        if not city_db:
            # Check if the district already exists
            district_db = (
                db.query(m_general.District)
                .join(m_general.Country)
                .filter(
                    m_general.District.district == new_address.district,
                    m_general.Country.country == new_address.country,
                )
                .first()
            )

            if not district_db:
                # Check if the country already exists
                country_db = (
                    db.query(m_general.Country).filter(m_general.Country.country == new_address.country).first()
                )

                if not country_db:
                    # Create new country
                    country_db = m_general.Country(country=new_address.country)
                    new_db_objects.append(country_db)
                # >> End country check <<

                # Create new district
                district_db = m_general.District(district=new_address.district, country=country_db)
                new_db_objects.append(district_db)
            # >> End district check <<

            # Create new city
            city_db = m_general.City(city=new_address.city, district=district_db)
            new_db_objects.append(city_db)
        # >> End city check <<

        # Create new postal code
        postal_code_db = m_general.PostalCode(postal_code=new_address.postal_code, city=city_db)
        new_db_objects.append(postal_code_db)
    # >> End postal code check <<

    # Create new address
    new_address = m_general.Address(
        address1=new_address.address1,
        address2=new_address.address2,
        postal_code=postal_code_db,
    )
    new_db_objects.append(new_address)

    db.add_all(new_db_objects)
    db.flush()
    return new_address
