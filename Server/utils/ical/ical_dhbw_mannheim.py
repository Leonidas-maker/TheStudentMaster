from bs4 import BeautifulSoup
import requests
import os
from tqdm import tqdm
from time import sleep
import json
from icalendar import Calendar

def get_available_icals():
    url = "https://vorlesungsplan.dhbw-mannheim.de/ical.php"
    response = requests.get(url)
    soup = BeautifulSoup(response.text, "html.parser")
    ical_infos = soup.find_all("option")
    icals = {}
    for ical_info in ical_infos:
        if ical_info.get("value", "") and ical_info.get("label", "") != ical_info.get("value", ""):
            icals[ical_info["label"]] = ical_info["value"]
    return icals

def get_ical(ical_id):
    url = f"http://vorlesungsplan.dhbw-mannheim.de/ical.php?uid={ical_id}"
    response = requests.get(url)
    return response.text

def convert_ical_to_json(ical):
    cal = Calendar.from_ical(ical)
    jsonIcal = []
    for event in cal.walk('vevent'):
        jsonIcal.append({
            "summary": event.get('summary'),
            "description": event.get('description'),
            "location": event.get('location'),
            "start": event.get('dtstart').dt.strftime("%Y-%m-%d %H:%M:%S"),
            "end": event.get('dtend').dt.strftime("%Y-%m-%d %H:%M:%S"),
        })
    return json.dumps(jsonIcal)

def download_icals(icals):
    progress = tqdm(icals.items(), leave=True, total=len(icals), ascii=" ▖▘▝▗▚▞█")
    for ical_name, ical_id in icals.items():
        ical_name = ical_name.replace("\\", "_").replace("/", "_")
        if not os.path.exists(f"./tmp/{ical_name}.ics"):
            progress.set_description(f"Downloading {ical_name}")
            ical = get_ical(ical_id)
            with open(f"./tmp/{ical_name}.ics", "w", encoding='utf-8') as f:
                f.write(ical)
        else:
            progress.set_description(f"Skipping {ical_name}")
        progress.update(1)
        sleep(0.001)
    progress.set_description(f"iCal download finished!")

if __name__ == "__main__":
    icals = get_available_icals()
    ical = get_ical(icals.popitem()[1])
    ical = get_ical(icals.popitem()[1])
    ical = get_ical(icals.popitem()[1])
    print(convert_ical_to_json(ical))
    download_icals(icals)