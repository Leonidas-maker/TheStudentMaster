from datetime import datetime, timezone
import json
import logging
import traceback
from typing import List
from modules.general import create_address
from schemes.s_general import AddressCreate
from models.m_general import Address
from utils.canteen.mensa_scraper import get_mensa_data
from sqlalchemy.orm import Session
from models.m_mensa import Mensa, Dish, Menu
from rich.progress import Progress
from rich.console import Console

def mensa_exists(db: Session, mensa: Mensa) -> bool:
    # Check if the mensa already exists
    if db.query(Mensa).filter(Mensa.site == mensa.site).first():
        return True
    return False

def mensa_changed(db: Session, mensa: Mensa) -> bool:
    # Check if the mensa has changed
    db_mensa = db.query(Mensa).filter(Mensa.site == mensa.site).first()
    if db_mensa.hash != mensa.hash:
        return True
    return False

def dish_exists(db: Session, dish: Dish) -> bool:
    # Check if the dish already exists
    if db.query(Dish).filter(Dish.name == dish.name).first():
        return True
    return False

def dish_changed(db: Session, dish: Dish) -> bool:
    # Check if the dish has changed
    db_dish = db.query(Dish).filter(Dish.name == dish.name).first()
    if db_dish.hash != dish.hash:
        return True
    return False

def menu_exists(db: Session, mensa_id: int, dish_id: int, serving_date: datetime) -> bool:
    # Check if the menu already exists
    if db.query(Menu).filter(Menu.mensa_id == mensa_id, Menu.dish_id == dish_id, Menu.serving_date == serving_date).first():
        return True
    return False

def menu_changed(db: Session, menu: Menu) -> bool:
    # Check if the menu has changed
    db_menu = db.query(Menu).filter(Menu.mensa_id == menu.mensa_id, Menu.dish_id == menu.dish_id, Menu.serving_date == menu.serving_date).first()
    if db_menu.hash != menu.hash:
        return True
    return False


def just_do_it(db: Session, progress: Progress, task_id: int) -> None:
    error_messages = []
    try:
        progress.update(task_id, description="[bold green]Mensa[/bold green]: Fetching Mensa...", visible=True)

        do_it(db=db, progress=progress, task_id=task_id)

        progress.update(task_id, description="[bold green]Mensa[/bold green]: Done", visible=False)

        if error_messages:
            raise ValueError("\n".join(error_messages))

        return True

    except Exception as e:
        # Handle any errors by updating the progress bar and printing the error
        error_messages.append(str(e))
        progress.update(task_id, description=f"[bold red]Error[/bold red]", visible=True)
        print(e)
        traceback.print_exc()
        return False


def do_it(db: Session, progress: Progress, task_id: int) -> None:
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
    new_address = AddressCreate(
        address1=raw_address[0],
        city=raw_address[1].split(" ")[1],
        postal_code=raw_address[1].split(" ")[0],
        country="Germany",
        district="Baden-Württemberg",
    )
    logging.info(f"Creating address: {new_address}")
    address = create_address(db=db, new_address=new_address)
    logging.info(f"Address created: {address.address_id}")
    return address.address_id


def create_mensa(db: Session, mensa_info: dict) -> int:
    logging.info(f"Creating mensa: {mensa_info['name']}")
    address_id = get_id_from_address(db=db, raw_address=mensa_info["address"])

    # Create a new mensa object
    mensa = Mensa(
        site=mensa_info["site"],
        mensa_name=mensa_info["name"],
        canteen_short_name=mensa_info["canteenShortName"],
        address_id=address_id,
        opening_hours=mensa_info["openingHours"],
        info_url=mensa_info["infoUrl"],
        menu_url=mensa_info["menuUrl"],
        last_modified=datetime.now(),
    )
    
    # Check if the mensa already exists
    if not mensa_exists(db, mensa):
        # If not exists: Create the mensa
        db.add(mensa)
        db.commit()
        db.refresh(mensa)
        return mensa.mensa_id
    
    # Check for changes
    if not mensa_changed(db, mensa):
        # If no changes: Skip
        return mensa.mensa_id
    else:
        # Update the mensa
        db.add(mensa)
        db.commit()
        db.refresh(mensa)
        return mensa.mensa_id
    

def create_dishes(db: Session, courses: List[dict]) -> list[int]:

    dish_ids = []
    try:
        for course in courses:
            for dish in course:
                
                # Create a new dish object
                dish_obj = Dish(
                    name=dish["name"],
                    image=dish["image"],
                    dish_type=dish["dish_type"],
                    price_student=dish["price_student"],
                    price_employee=dish["price_employee"],
                    price_guest=dish["price_guest"],
                    co2_portion=dish["co2_portion"],
                    co2_100g=dish["co2_100g"],
                    allergens=json.dumps(dish["allergens"]) if dish["allergens"] else None,
                    additives=json.dumps(dish["additives"]) if dish["additives"] else None,
                    last_modified=datetime.now(timezone.utc),
                )
                
                if not dish_exists(db, dish_obj):
                    # Add the dish
                    db.add(dish_obj)
                    db.flush()
                    db.refresh(dish_obj)
                    dish_ids.append(dish_obj.dish_id)
                    continue
                
                if not dish_changed(db, dish_obj):
                    # Skip
                    dish_ids.append(dish_obj.dish_id)
                    continue
                else:
                    # Update the dish
                    db.add(dish_obj)
                    db.flush()
                    db.refresh(dish_obj)
                    dish_ids.append(dish_obj.dish_id)
                    continue

        db.commit()
        return dish_ids
    
    except Exception as e:
        logging.error(f"Error creating dishes: {e}")
        db.rollback()
        return dish_ids

def create_menu(db: Session, mensa_id: int, dish_ids: List[int], serving_date: datetime):
    ids = []
    
    try:
        
        for dish_id in dish_ids:
            
            # Create the menu
            menu = Menu(
                mensa_id=mensa_id,
                dish_id=dish_id,
                serving_date=datetime.strptime(serving_date, "%Y-%m-%dT%H:%M:%S.%fZ"),
                last_modified=datetime.now(timezone.utc),
            )
            
            if not menu_exists(db, mensa_id, dish_id, serving_date):
                # Add the menu
                db.add(menu)
                db.flush()
                db.refresh(menu)
                ids.append(menu.menu_id)
                continue
            
            if not menu_changed(db, menu):
                # Skip
                ids.append(menu.menu_id)
                continue
            else:
                # Update the menu
                db.add(menu)
                db.flush()
                db.refresh(menu)
                ids.append(menu.menu_id)
                continue
            
        db.commit()
        return ids
        
    except Exception as e:
        logging.error(f"Error creating menu: {e}")
        db.rollback()
        return ids
