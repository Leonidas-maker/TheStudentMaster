from datetime import datetime
import logging
from typing import List
from models.m_general import Address
from Scheduler.utils.canteen.mensa_scraper import get_mensa_data
from sqlalchemy.orm import Session
from Scheduler.models.m_mensa import Mensa, Dish, Menu


def do_it(db: Session):
    # Fetch the data from the API
    data = get_mensa_data()

    # Check if the data is not empty
    if data:
        for mensa_info, dishes in data:
            mensa_id = create_mensa(db, mensa_info)
            for dish in dishes:
                dish_ids = create_dishes(db, dish["courses"])
                menu_ids = create_menu(db, mensa_id=mensa_id, dish_ids=dish_ids, serving_date=dish["date"])
    else:
        # Log an error if the data is empty
        logging.error("No data to parse")
        

def get_id_from_address(db: Session, raw_address: str) -> int:
    raw_address = raw_address.split("\n")
    address = Address(
        address1=raw_address[0],
        postal_code_id=[1].split(" ")[0],
    )
    db.add(address)
    db.commit()
    db.refresh(address)
    return address.address_id


def create_mensa(db: Session, mensa_info: dict) -> int:

    address_id = get_id_from_address(db=db, raw_address=mensa_info["address"])

    # Create a new mensa object
    mensa = Mensa(
        site=mensa_info["site"],
        name=mensa_info["name"],
        canteen_short_name=mensa_info["canteenShortName"],
        address_id=address_id,
        opening_hours=mensa_info["openingHours"],
        info_url=mensa_info["infoUrl"],
        menu_url=mensa_info["menuUrl"],
        last_modified=datetime.now(),
    )

    db.add(mensa)
    db.commit()
    db.refresh(mensa)

    return mensa.mensa_id


def create_dishes(db: Session, courses: List[dict]) -> list[int]:

    dish_ids = []

    for course in courses:
        dish_obj = Dish(
            name=course["name"],
            image=course["image"],
            dish_type=course["dish_type"],
            price_student=course["price_student"],
            price_employee=course["price_employee"],
            price_guest=course["price_guest"],
            co2_portion=course["co2_portion"],
            co2_100g=course["co2_100g"],
            allergens=course["allergens"],
            additives=course["additives"],
            last_modified=datetime.now(),
        )
        db.add(dish_obj)
        db.commit()
        db.refresh(dish_obj)
        dish_ids.append(dish_obj.dish_id)

    return dish_ids


def create_menu(db: Session, mensa_id: int, dish_ids: List[int], serving_date: datetime):
    ids = []
    for dish_id in dish_ids:
        menu = Menu(
            mensa_id=mensa_id,
            dish_id=dish_id,
            serving_date=serving_date,
            last_modified=datetime.now(),
        )
        db.add(menu)
        db.commit()
        db.refresh(menu)
        ids.append(menu.menu_id)
    return ids
