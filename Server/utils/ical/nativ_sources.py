from bs4 import BeautifulSoup
import requests


def get_source_dhbw_ma() -> dict[str, str]:
    url = "https://vorlesungsplan.dhbw-mannheim.de/ical.php"
    response = requests.get(url)
    soup = BeautifulSoup(response.text, "html.parser")
    ical_infos = soup.find_all("option")
    icals = {}
    for ical_info in ical_infos:
        if ical_info.get("value", "") and ical_info.get("label", "") != ical_info.get("value", ""):
            icals[ical_info["label"]] = ical_info["value"]
    return icals
