from bs4 import BeautifulSoup
import requests
from datetime import datetime
import re



def get_menu(
    canteen_id: str,
    week_offset: int,
) -> dict:
    
    date = datetime.now().day + 7 * week_offset
    # get url for canteen_id
    match canteen_id:
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
        case "dhbw_eppelheim":
            url = f"https://www.stw-ma.de/Essen+_+Trinken/Speisepl%C3%A4ne/Speisenausgabe+DHBW+Eppelheim-date-2024%25252d03%25252d{date}-view-week.html"
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

    for i in range(0, len(rows), 2):
        # get menu items
        item_row = rows[i]
        menu_items = re.split(r"[\n\t]+", item_row.text)
        menu_items = remove_empty_strings(menu_items)

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
            # clean up menu items and prices
            menu_items[i] = remove_markings(menu_items[i])
            menu_prices[i] = remove_markings(menu_prices[i])

            list_items_prices.append({"item": menu_items[i], "price": menu_prices[i]})
        menu[menu_items[0]] = list_items_prices
        
    return menu


def remove_markings(text: str) -> str:
    return re.sub(r"\s\([a-zA-Z0-9\,]+\)", "", text)


def remove_empty_strings(list: list) -> list:
    return [x for x in list if x]


if __name__ == "__main__":

    menu = get_menu(canteen_id="greens", week_offset=0)

    pass
