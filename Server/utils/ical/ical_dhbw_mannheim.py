from bs4 import BeautifulSoup
import requests
from tqdm import tqdm
from time import sleep
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

def get_ical_data(icals):
    progress = tqdm(icals.items(), leave=False, total=len(icals), ascii=" ▖▘▝▗▚▞█")
    ical_data = {}
    for ical_name, ical_id in icals.items():
        progress.set_description(f"Download and convert {ical_name}")
        ical = get_ical(ical_id)
        ical_data[ical_name] = convert_ical_to_json(ical)
           
        progress.update(1)
        sleep(0.001)
    progress.close()
    print(f"Download of {len(icals)} iCal-Data finished!")
    return ical_data

# if __name__ == "__main__":
#     icals = get_available_icals()
#     #icals = dict(itertools.islice(icals.items(), 8)) 

#     with open("ical_data.json", "w") as file:
#         file.write(json.dumps(get_ical_data(icals)))