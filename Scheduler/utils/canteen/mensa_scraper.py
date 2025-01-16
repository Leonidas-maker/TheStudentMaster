import requests
from datetime import datetime, timedelta
import re
import asyncio
import logging


def fetch_mensa_data() -> list:
    # Define the URL to scrape
    url = "https://api.dhbw.app/mensa"
    # Define the headers for the request
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3"
    }
    # Send a GET request to the URL
    response = requests.get(url, headers=headers)
    # Check if the request was successful
    if response.status_code == 200:
        # Parse the JSON response
        data = response.json()
        # Return the data
        return data
    else:
        # Log an error if the request failed
        logging.error(f"Failed to fetch data from {url}")
        # Return an empty list
        return []


def parse_mensa_data() -> None:
    # Fetch the data from the API
    data = fetch_mensa_data()
    # Check if the data is not empty
    if data:

        for item in data:
            # parse "mensaInfo"
            mensa_info = parse_mensa_info(mensa_info=item["mensaInfo"])
            # parse "menus"
            dishes = parse_mensa_menus(mensa_menus=item["menus"])
            print(mensa_info)
            print(dishes)
    else:
        # Log an error if the data is empty
        logging.error("No data to parse")


def parse_mensa_info(mensa_info: dict) -> dict:
    site = mensa_info["site"]
    name = mensa_info["name"]
    # canteen_short_name = mensa_info["canteenShortName"]
    address = mensa_info["address"]
    opening_hours = mensa_info["openingHours"]
    info_url = mensa_info["infoUrl"]
    menu_url = mensa_info["menuUrl"]
    return {
        "site": site,
        "name": name,
        # "canteenShortName": canteen_short_name,
        "address": address,
        "openingHours": opening_hours,
        "infoUrl": info_url,
        "menuUrl": menu_url,
    }


def parse_mensa_menus(mensa_menus: list) -> list:
    menus = []
    for item in mensa_menus:
        menu = dict()
        menu["date"] = item["date"]
        menu["site"] = item["site"]
        menu["mainCourses"] = parse_mensa_dishes(dishes=item["mainCourses"])
        menu["sideDishes"] = parse_mensa_dishes(dishes=item["sideOrders"])
        menu["desserts"] = parse_mensa_dishes(dishes=item["desserts"])
        menus.append(menu)

    return menus


def parse_mensa_dishes(dishes: list) -> list:
    result = []
    for dish in dishes:
        menu_dish = dict()
        menu_dish["name"] = dish["name"]
        menu_dish["site"] = dish["site"]
        menu_dish["dish_type"] = dish["type"]
        menu_dish["price_student"] = dish["priceStudent"]
        menu_dish["price_employee"] = dish["priceEmployee"]
        menu_dish["price_guest"] = dish["priceGuest"]
        menu_dish["co2_portion"] = dish["co2Portion"]
        menu_dish["co2_100g"] = dish["co2100g"]
        menu_dish["allergens"] = dish["allergens"]
        menu_dish["additives"] = dish["additives"]

        result.append(menu_dish)
    return result


if __name__ == "__main__":
    # Fetch the data from the API
    data = fetch_mensa_data()
    # Print the data
    print(parse_mensa_data())
