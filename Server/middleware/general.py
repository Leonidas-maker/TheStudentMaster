from sqlalchemy.orm import Session
from sqlalchemy import union, select
from operator import xor as xor_
from functools import reduce

# ~~~~~~~~~~~~~~~~ Schemas ~~~~~~~~~~~~~~~~ #
from models.pydantic_schemas import s_general

# ~~~~~~~~~~~~~~~~~ Models ~~~~~~~~~~~~~~~~ #
from models.sql_models import m_general, m_user, m_calendar, m_canteen

###########################################################################
########################## Basic logic functions ##########################
###########################################################################


# Function to perform XOR operation on multiple arguments
def xor(*args) -> bool:
    return reduce(xor_, map(bool, args))


# Function to check if only one argument is True
def only_one(*args) -> bool:
    return sum(map(bool, args)) == 1


###########################################################################
####################### Database specific functions #######################
###########################################################################


# Function to create a new address in the database
def create_address(db: Session, new_address: s_general.AddressCreate) -> s_general.Address:
    if not new_address:
        raise ValueError("Address is required")

    # Check if the address already exists
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

    # Check if the postal code already exists
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
        # Check if the city already exists
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
            # Check if the district already exists
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
                # Check if the country already exists
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


# Function to clean up unused addresses from the database
def clean_address(db: Session) -> int:
    # Addresses used by University Table (calendar)
    native_address_1_subquery = (
        db.query(m_general.Address.address_id)
        .join(m_calendar.University)
        .filter(m_calendar.University.address_id == m_general.Address.address_id)
    )

    # Addresses used by Canteen Table
    native_address_2_subquery = (
        db.query(m_general.Address.address_id)
        .join(m_canteen.Canteen)
        .filter(m_canteen.Canteen.address_id == m_general.Address.address_id)
    )

    # Addresses used by User Table
    user_address_subquery = (
        db.query(m_general.Address.address_id)
        .join(m_user.User)
        .filter(m_user.User.address_id == m_general.Address.address_id)
    )

    # Combine all subqueries
    all_subquery = union(native_address_1_subquery, native_address_2_subquery, user_address_subquery).alias(
        "all_addresses"
    )

    # Delete all addresses that are not in any of the subqueries
    delete_count = (
        db.query(m_general.Address)
        .filter(m_general.Address.address_id.notin_(all_subquery.element))
        .delete(synchronize_session=False)
    )
    db.commit()
    return delete_count
