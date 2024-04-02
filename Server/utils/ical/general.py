from typing import List
from icalendar import Calendar
import requests
from tqdm import tqdm
from time import sleep
import hashlib
import json
from typing import Dict, Any

from .schemas import Ical

def convert_ical_to_json(ical):
    cal = Calendar.from_ical(ical)
    jsonIcal = {}
    jsonIcal["X-WR-TIMEZONE"] = cal.get("X-WR-TIMEZONE")
    jsonEvents = []

    for event in cal.walk('vevent'):
        jsonEvents.append({
            "summary": event.get('summary'),
            "description": event.get('description'),
            "location": event.get('location'),
            "start": event.get('dtstart').dt.strftime("%Y-%m-%d %H:%M:%S"),
            "end": event.get('dtend').dt.strftime("%Y-%m-%d %H:%M:%S"),
        })

    jsonIcal["events"] = jsonEvents
    return jsonIcal


def get_source_url(type: str, source: str):
    match type:
        case "iCal-Custom":
            source_url = source
        case "iCal-DHBWMannheim":
            source_url = f"http://vorlesungsplan.dhbw-mannheim.de/ical.php?uid={source}"
        case _:
            raise ValueError("Type not found!")

    return source_url
    
def dict_hash(dictionary: Dict[str, Any]) -> str:
    dhash = hashlib.sha1()
    encoded = json.dumps(dictionary, sort_keys=True).encode("utf-8")
    dhash.update(encoded)
    return dhash.hexdigest()

def get_ical_data(source:str, type: str = "iCal-Custom"):
    source_url = get_source_url(type, source)

    data = requests.get(source_url).content.decode("utf-8")
    if data:
        json_data = convert_ical_to_json(data)
        return json_data, dict_hash(json_data)
    else:
        return None


def get_icals_data(icals: List[Ical], type: str = "iCal-Custom"):
    ical_data = {}
    progress = tqdm(icals.items(), leave=False, total=len(icals), ascii=" ▖▘▝▗▚▞█")

    download_error = 0
    for ical in icals:
        progress.set_description(f"[{type}] Download and convert {ical.ical_name}")
        
        source_url = get_source_url(type, ical.ical_source)
        
        data = requests.get(source_url).text

        if data:
            json_data = convert_ical_to_json(data)
            ical_data[ical.ical_name] = {"data": json_data, "hash": dict_hash(json_data)}
        else:
            ical_data[ical.ical_name] = None
            download_error += 1
        progress.update(1)
        sleep(0.001)
    progress.close()
    print(f"[{type}] Download of {len(icals) - download_error} iCal-Data finished! ({download_error} failed)")


    return ical_data