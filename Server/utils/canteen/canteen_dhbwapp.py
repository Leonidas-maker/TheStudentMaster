import re
from httpx import get
import requests
from datetime import datetime
from sqlalchemy.orm import Session

# middleware helpers
from middleware.general import create_address
from middleware.canteen import create_canteen, create_dish, create_menu

# models
from models.sql_models.m_canteen import Canteen, Dish, Menu

# pydantic schema for address creation
from models.pydantic_schemas.s_general import AddressCreate, PostalCode

# the API endpoint that returns the res.json‑style payload
API_URL = "https://api.dhbw.app/mensa"


def split_address(address):
    # Split the address into lines and filter out empty lines
    lines = [line.strip() for line in address.split("\n") if line.strip()]

    # Street with house number
    street_with_no = lines[0] if lines else ""

    # Postal code and city
    postal_code = ""
    city = ""
    if len(lines) > 1:
        match = re.match(r"(\d{5})\s+(.+)", lines[1])
        if match:
            postal_code = match.group(1)
            city = match.group(2)

    return street_with_no, postal_code, city


def sync_dhbw_menus(db: Session, progress=None, task_id=None) -> bool:
    """
    Fetch DHBW‑app mensa data and store into the DB.
    Returns True on success, False (and rolls back) on any error.
    """
    try:
        resp = requests.get(API_URL)
        resp.raise_for_status()
        data = resp.json()

        # set total to number of canteens
        if progress and task_id is not None:
            progress.update(task_id, total=len(data), description="[bold green]Sync DHBW canteens[/bold green]")

        for entry in data:
            mensa = entry["mensaInfo"]

            # 1) create or fetch address
            addr = split_address(mensa.get("address", ""))
            addr_in = AddressCreate(
                address1=addr[0],
                address2=None,
                district=None,
                postal_code=addr[1],
                city=addr[2],
                country=None,
            )
            addr_db = create_address(db, addr_in)

            # 2) fetch canteen
            canteen_in = Canteen(
                canteen_name=mensa["name"],
                address_id=addr_db.address_id,
                image_url=None,
            )
            canteen_db = create_canteen(db, canteen_in)

            # 3) for each menu day, create dishes & menus
            for menu in entry.get("menus", []):
                serving_date = datetime.fromisoformat(menu["date"][:-1]).date()
                for category in ("starters", "mainCourses", "sideOrders", "desserts"):
                    for d in menu.get(category, []):
                        price = d.get("priceStudent")
                        if price is None:
                            continue
                        dish_in = Dish(
                            description=d["name"],
                            image_url=d.get("image"),
                            price=str(price),
                        )
                        dish_db = create_dish(db, dish_in)
                        menu_in = Menu(
                            canteen_id=canteen_db.canteen_id,
                            dish_id=dish_db.dish_id,
                            dish_type=d["type"],
                            serving_date=serving_date,
                        )
                        create_menu(db, menu_in)

            # advance one canteen
            if progress and task_id is not None:
                progress.update(task_id, advance=1)

        db.commit()
        return True

    except Exception as e:
        print("Error syncing DHBW menus:", e)
        db.rollback()
        return False
