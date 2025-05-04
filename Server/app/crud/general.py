from sqlalchemy.orm import Session

from schemas import s_generic

from models import m_generic


###########################################################################
####################### Database specific functions #######################
###########################################################################


# Function to create a new address in the database
def create_address(db: Session, new_address: s_generic.AddressCreate) -> s_generic.Address:
    if not new_address:
        raise ValueError("Address is required")

    # Check if the address already exists
    address_db = (
        db.query(m_generic.Address)
        .join(m_generic.PostalCode)
        .filter(
            m_generic.Address.address1 == new_address.address1,
            m_generic.Address.address2 == new_address.address2,
            m_generic.PostalCode.postal_code == new_address.postal_code,
        )
        .first()
    )

    if address_db:
        return address_db

    new_db_objects = []
    # Check if the postal code already exists
    postal_code_db = (
        db.query(m_generic.PostalCode)
        .join(m_generic.City)
        .filter(
            m_generic.PostalCode.postal_code == new_address.postal_code,
            m_generic.City.city == new_address.city,
        )
        .first()
    )

    if not postal_code_db:
        # Check if the city already exists
        city_db = (
            db.query(m_generic.City)
            .join(m_generic.District)
            .filter(
                m_generic.City.city == new_address.city,
                m_generic.District.district == new_address.district,
            )
            .first()
        )

        if not city_db:
            # Check if the district already exists
            district_db = (
                db.query(m_generic.District)
                .join(m_generic.Country)
                .filter(
                    m_generic.District.district == new_address.district,
                    m_generic.Country.country == new_address.country,
                )
                .first()
            )

            if not district_db:
                # Check if the country already exists
                country_db = (
                    db.query(m_generic.Country).filter(m_generic.Country.country == new_address.country).first()
                )

                if not country_db:
                    # Create new country
                    country_db = m_generic.Country(country=new_address.country)
                    new_db_objects.append(country_db)
                # >> End country check <<

                # Create new district
                district_db = m_generic.District(district=new_address.district, country=country_db)
                new_db_objects.append(district_db)
            # >> End district check <<

            # Create new city
            city_db = m_generic.City(city=new_address.city, district=district_db)
            new_db_objects.append(city_db)
        # >> End city check <<

        # Create new postal code
        postal_code_db = m_generic.PostalCode(postal_code=new_address.postal_code, city=city_db)
        new_db_objects.append(postal_code_db)
    # >> End postal code check <<

    # Create new address
    new_address = m_generic.Address(
        address1=new_address.address1,
        address2=new_address.address2,
        postal_code=postal_code_db,
    )
    new_db_objects.append(new_address)

    db.add_all(new_db_objects)
    db.flush()
    return new_address
