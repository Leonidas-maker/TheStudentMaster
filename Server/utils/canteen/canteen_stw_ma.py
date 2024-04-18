from bs4 import BeautifulSoup
import requests
from datetime import datetime, timedelta
import re


def fetch_menu(
    canteen_short_name: str,
    week_offset: int,
) -> dict:
    match canteen_short_name:
        case "dhbw_eppelheim":
            return fetch_menu_dhbw_eppel(week_offset)
        case _:
            return fetch_menu_general(canteen_short_name, week_offset)


def fetch_menu_dhbw_eppel(
    week_offset: int,
) -> dict:
    if not isinstance(week_offset, int):
        raise ValueError("week_offset must be an integer")
    if week_offset < 0:
        raise ValueError("week_offset must be a positive integer")
    if week_offset > 4:
        raise ValueError("week_offset must be less than 4")

    date = datetime.now().day + 7 * week_offset

    # get dates for the week
    current_date = datetime.now().date() + timedelta(days=7 * week_offset)
    weekday = current_date.weekday()
    diff = timedelta(days=weekday)

    monday = current_date - diff
    tuesday = monday + timedelta(days=1)
    wednesday = monday + timedelta(days=2)
    thursday = monday + timedelta(days=3)
    friday = monday + timedelta(days=4)

    url = f"https://www.stw-ma.de/Essen+_+Trinken/Speisepl%C3%A4ne/Speisenausgabe+DHBW+Eppelheim-date-2024%25252d03%25252d{date}-view-week.html"
    response = requests.get(url)
    soup = BeautifulSoup(response.text, "html.parser")
    rows = soup.find_all("tr")
    menu = {}

    # clean up rows
    for i in range(0, len(rows)):
        rows[i] = re.split(pattern=r"[\n\t\:\*\xa0]+", string=rows[i].text)
        rows[i] = remove_empty_strings(rows[i])

    for i in range(0, len(rows), 2):
        menu_items = list()
        match rows[i][0]:
            case "Montag":
                serving_date = monday
            case "Dienstag":
                serving_date = tuesday
            case "Mittwoch":
                serving_date = wednesday
            case "Donnerstag":
                serving_date = thursday
            case "Freitag":
                serving_date = friday
            case _:
                serving_date = None

        # dish 1
        menu_items.append(
            {
                "dish_type": rows[i][1] if len(rows[i]) > 1 else None,
                "description": rows[i][2] if len(rows[i]) > 2 else None,
                "price": rows[i][3] if len(rows[i]) > 3 else None,
                "serving_date": serving_date,
            }
        )
        # dish 2
        menu_items.append(
            {
                "dish_type": rows[i + 1][0] if len(rows[i + 1]) > 0 else None,
                "description": rows[i + 1][1] if len(rows[i + 1]) > 1 else None,
                "price": rows[i + 1][2] if len(rows[i + 1]) > 2 else None,
                "serving_date": serving_date,
            }
        )
        menu[rows[i][0]] = menu_items

    return menu


def fetch_menu_general(
    canteen_short_name: str,
    week_offset: int,
) -> dict:

    if not isinstance(week_offset, int):
        raise ValueError("week_offset must be an integer")
    if week_offset < 0:
        raise ValueError("week_offset must be a positive integer")
    if week_offset > 4:
        raise ValueError("week_offset must be less than 4")

    if not canteen_short_name:
        raise ValueError("canteen_id is required")
    if not isinstance(canteen_short_name, str):
        raise ValueError("canteen_id must be a string")

    date = datetime.now().day + 7 * week_offset

    # get dates for the week
    current_date = datetime.now().date() + timedelta(days=7 * week_offset)
    weekday = current_date.weekday()
    diff = timedelta(days=weekday)

    monday = current_date - diff
    tuesday = monday + timedelta(days=1)
    wednesday = monday + timedelta(days=2)
    thursday = monday + timedelta(days=3)
    friday = monday + timedelta(days=4)

    # get url for canteen_id
    match canteen_short_name:
        case "schlossmensa":
            url = f"https://www.stw-ma.de/men%C3%BCplan_schlossmensa-date-2024%25252d03%25252d{date}-view-week.html"
        case "greens":
            url = f"https://www.stw-ma.de/Essen+_+Trinken/Speisepl%C3%A4ne/greenes%C2%B2-date-2024%25252d03%25252d{date}-view-week.html"
        case "mensawagon":
            url = f"https://www.stw-ma.de/Essen+_+Trinken/Speisepl%C3%A4ne/mensawagon-date-2024%25252d03%25252d{date}-view-week.html"
        case "hochschule_mannheim":
            url = f"https://www.stw-ma.de/Essen+_+Trinken/Speisepl%C3%A4ne/Hochschule+Mannheim-date-2024%25252d03%25252d{date}-view-week.html"
        case "cafeteria_musikhochschule":
            url = f"https://www.stw-ma.de/Essen+_+Trinken/Speisepl%C3%A4ne/Cafeteria+Musikhochschule-date-2024%25252d03%25252d{date}-view-week.html"
        case "popakademie":
            url = f"https://www.stw-ma.de/Essen+_+Trinken/Speisepl%C3%A4ne/CAFE+33-date-2024%25252d03%25252d{date}-view-week.html"
        case "mensaria_metropol":
            url = f"https://www.stw-ma.de/Essen+_+Trinken/Speisepl%C3%A4ne/Mensaria+Metropol-date-2024%25252d03%25252d{date}-view-week.html"
        case "mensaria_wohlgelegen":
            url = f"https://www.stw-ma.de/Essen+_+Trinken/Speisepl%C3%A4ne/Mensaria+Wohlgelegen-date-2024%25252d03%25252d{date}-view-week.html"
        # case "dhbw_eppelheim":
        #     url = f"https://www.stw-ma.de/Essen+_+Trinken/Speisepl%C3%A4ne/Speisenausgabe+DHBW+Eppelheim-date-2024%25252d03%25252d{date}-view-week.html"
        case _:
            raise ValueError("Invalid canteen_id").add_note(
                "canteen_id must be one of the following: schlossmensa, greens, mensawagon, hochschule_mannheim, cafeteria_musikhochschule, popakademie, mensaria_metropol, mensaria_wohlgelegen, dhbw_eppelheim"
            )

    response = requests.get(url)
    soup = BeautifulSoup(response.text, "html.parser")
    rows = soup.find_all("tr")
    menu = {}

    # get menu names
    menu_names = rows.pop(0)
    menu_names = re.split(r"[\n\t]+", menu_names.text)
    menu_names = remove_empty_strings(menu_names)

    for i in range(0, len(rows) - 1, 2):
        # get menu items
        item_row = rows[i]
        menu_items = re.split(r"[\n\t]+", item_row.text)
        menu_items = remove_empty_strings(menu_items)

        match menu_items[0]:
            case "Montag":
                serving_date = monday
            case "Dienstag":
                serving_date = tuesday
            case "Mittwoch":
                serving_date = wednesday
            case "Donnerstag":
                serving_date = thursday
            case "Freitag":
                serving_date = friday
            case _:
                serving_date = None

        # get price
        raw_price_list = rows[i + 1]
        raw_price_list = re.split(r"[\n\t]+", raw_price_list.text)
        raw_price_list = remove_empty_strings(raw_price_list)
        menu_prices = ["Montag"]
        for i in range(0, len(raw_price_list), 2):
            menu_prices.append(f"{raw_price_list[i+1]}: {raw_price_list[i]}")

        if not len(menu_items) == len(menu_prices) and len(menu_items) == len(
            menu_names
        ):
            print("Error: Length of menu items and prices do not match")
            return

        list_items_prices = list()
        for i in range(len(menu_items)):

            list_items_prices.append(
                {
                    "dish_type": menu_names[i],
                    "description": menu_items[i],
                    "price": menu_prices[i],
                    "serving_date": serving_date,
                }
            )
        menu[menu_items[0]] = list_items_prices[1:]

    return menu


def remove_empty_strings(list: list) -> list:
    return [x for x in list if x]


if __name__ == "__main__":

    # canteen_short_names = [
    #     "schlossmensa",
    #     "greens",
    #     "mensawagon",
    #     "hochschule_mannheim",
    #     "cafeteria_musikhochschule",
    #     "popakademie",
    #     "mensaria_metropol",
    #     "mensaria_wohlgelegen",
    #     "dhbw_eppelheim",
    # ]

    # fetch_menu(canteen_short_name="schlossmensa", week_offset=0)

    pass
