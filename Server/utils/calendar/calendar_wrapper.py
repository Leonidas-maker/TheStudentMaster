from typing import List
from icalendar import Calendar
import requests
from time import sleep
import hashlib
import json
from typing import Dict, Any
import re
import datetime
from bs4 import BeautifulSoup


# TODO Max size of source
class CalendarWrapper:  # * source_model could be provided (only for threading and visual purposes)
    def __init__(
        self,
        backend: str,
        type: str = "custom",
        source: Dict[str, str] | str = None,
    ):
        if backend not in ["iCalendar", "Rapla"]:
            raise ValueError("Invalid backend")
        if type not in ["custom", "dhbw-mannheim"]:
            raise ValueError("Invalid type")

        self.backend = backend
        self.type = type
        self.source = source

        self.exam_keywords = [
            "klausur",
            "exam",
            "prüfung",
            "test",
            "quiz",
            "examen",
            "examination",
            "prüfungsleistung",
            "abschlussklausur",
            "abschlussprüfung",
            "abschlussarbeit",
            "abschlussklausur",
            "prüfungsform",
        ]

    # ======================================================== #
    # ========================= Main ========================= #
    # ======================================================== #
    def get_type(self) -> str:
        return self.type.capitalize()

    def __dict_hash(self, dictionary: dict) -> str:
        dhash = hashlib.sha1()
        encoded = json.dumps(dictionary, sort_keys=True).encode("utf-8")
        dhash.update(encoded)
        return dhash.hexdigest()

    def set_type(self, type: str):
        if type not in ["custom", "dhbw-mannheim"]:
            raise ValueError("Invalid type")
        self.type = type

    def set_backend(self, backend: str):
        if backend not in ["iCalendar", "Rapla"]:
            raise ValueError("Invalid backend")
        self.backend = backend

    def get_data(self, source: Dict[str, str] | str = None):
        if source is None:
            if self.source is None:
                raise ValueError("No source provided!")
        else:
            self.source = source

        if isinstance(self.source, dict):
            if self.backend == "iCalendar":
                return self.__ical_get_data_multiple(self.source)
            else:  # rapla
                return self.__rapla_get_data_multiple(self.source)

        else:
            if self.backend == "iCalendar":
                return self.__ical_get_data_single(self.source)
            else:  # rapla
                return self.__rapla_get_data_single(self.source)

    # ======================================================== #
    # ======================= ICalendar ====================== #
    # ======================================================== #

    def __ical_get_source_url(self, source) -> str:
        match self.type:
            case "custom":
                source_url = source
            case "dhbw-mannheim":
                source_url = f"http://vorlesungsplan.dhbw-mannheim.de/ical.php?uid={source}"
            case _:
                raise ValueError("Type not found!")

        return source_url

    def __ical_convert_to_json(self, ical) -> Dict[str, Any]:
        # * str(event.get()) because they return vText

        cal = Calendar.from_ical(ical)
        jsonIcal = {}
        jsonIcal["X-WR-TIMEZONE"] = str(cal.get("X-WR-TIMEZONE"))
        jsonEvents = []

        for event in cal.walk("vevent"):

            # ~~~~~~~~~~ Process description ~~~~~~~~~~ #
            event_description = {"tags": []}
            event_description_tmp = str(event.get("description", "")).lower()

            # Check if the lecture is online or hybrid
            if "online" in event_description_tmp.lower():
                event_description["tags"].append("online")
            elif "hybrid" in event_description_tmp.lower():
                event_description["tags"].append("hybrid")

            # Check if the lecture is an exam
            if any(ext in event.get("summary").lower() for ext in self.exam_keywords):
                event_description["tags"].append("exam")

            # ~~~~~~~~~~~~~~ Build event ~~~~~~~~~~~~~~ #
            jsonEvents.append(
                {
                    "summary": str(event.get("summary")),
                    "description": event_description,
                    "location": str(event.get("location")),
                    "start": event.get("dtstart").dt.strftime("%Y-%m-%d %H:%M:%S"),
                    "end": event.get("dtend").dt.strftime("%Y-%m-%d %H:%M:%S"),
                }
            )

        jsonIcal["events"] = jsonEvents
        return jsonIcal

    def __ical_get_data_single(self, source: str) -> Dict[str, any]:
        source_url = self.__ical_get_source_url(source)
        data = requests.get(source_url, stream=True).content.decode("utf-8")

        if data:

            json_data = self.__ical_convert_to_json(data)
            if json_data.get("events"):
                return {"data": json_data, "hash": self.__dict_hash(json_data)}
        return None

    def __ical_get_data_multiple(self, ical_sources: dict) -> Dict[str, any]:
        ical_data = {}

        download_error = []
        for lecture_name, ical_source in ical_sources.items():
            lecture_data = self.__ical_get_data_single(ical_source)
            ical_data[lecture_name] = lecture_data
            if not lecture_data:
                download_error.append(lecture_name)
        return ical_data, download_error

    # ======================================================== #
    # ========================= Rapla ======================== #
    # ======================================================== #

    def __rapla_scrape_source(self, rapla_url: str) -> Dict[str, any]:
        regex_color = re.compile(r"background-color:\s*(#[0-9a-fA-F]+)")
        page = requests.get(rapla_url)
        content = page.text.replace("<br/>", "\n")
        soup = BeautifulSoup(content, "html.parser")

        weeks = soup.find_all("table", class_="week_table")

        current_year = datetime.datetime.now().year
        last_calendar_week = 0

        event_json = {"X-WR-TIMEZONE": "Europe/Berlin", "events": []}

        course_name = soup.find("h2").get_text().split(",")[0]

        for week in weeks:
            soup = BeautifulSoup(str(week), "html.parser")
            cols = soup.findChildren("tr")
            days = []
            calendar_week = int(cols[0].findChild("th", class_="week_number").get_text().split(" ")[1])
            if calendar_week < last_calendar_week:
                current_year += 1
            for col in cols:
                rows = col.findChildren("td")
                day_offset = 0

                is_normal_spacer_before = False

                for row in rows:
                    match row.get("class")[0]:
                        case "week_header":
                            day_month = row.get_text().split(" ")[1]
                            date = f"{day_month}{current_year}"
                            days.append(date)
                        case "week_block":
                            # ~~~~~ Process <a> tag - first information ~~~~ #
                            tmp = row.findChild("a").get_text().split("\n")

                            lecture_time = tmp[0].replace("\xa0", "").split("-")

                            # ----- Lecture name + special information ----- #
                            lecture_name = tmp[1]
                            lecture_description = {"tags": []}

                            if "online" in lecture_name.lower():
                                lecture_description["tags"].append("online")

                                lecture_name = lecture_name.replace("online", "").strip()
                                while lecture_name[-1].lower() in "-_.":
                                    lecture_name = lecture_name[:-1]

                            # Check if the lecture is an exam
                            if any(ext in lecture_name.lower() for ext in self.exam_keywords):
                                lecture_description["tags"].append("exam")

                            # ---------------- Lecture Time ---------------- #
                            try:
                                lecture_start = datetime.datetime.strptime(
                                    f"{days[day_offset]} {lecture_time[0]}", "%d.%m.%Y %H:%M"
                                )
                                lecture_end = datetime.datetime.strptime(
                                    f"{days[day_offset]} {lecture_time[1]}", "%d.%m.%Y %H:%M"
                                )
                            except IndexError:
                                print(f"[ERROR] Day offset error for {course_name}->{lecture_name}! Skipping...")
                                continue

                            tmp = row.findChild("span", class_="person")
                            if tmp:
                                lecture_description["person"] = tmp.get_text()

                            # ~~ Process <span> tag - location information ~ #
                            tmp = row.findChildren("span", class_="resource")

                            lecture_location = ""
                            for info in tmp:
                                if info.getText() not in course_name:
                                    lecture_location = (
                                        info.getText()
                                        if lecture_location == ""
                                        else f"{lecture_location}, {info.getText()}"
                                    )  # Maybe multiple locations

                            # Get color of the lecture if available
                            tmp = row.get("style")

                            if tmp:
                                tmp = re.search(regex_color, tmp)
                                if tmp:
                                    lecture_description["color"] = tmp.group(1)

                            event_json["events"].append(
                                {
                                    "summary": lecture_name,
                                    "description": lecture_description,
                                    "location": lecture_location if lecture_location else None,
                                    "start": lecture_start.strftime("%Y-%m-%d %H:%M:%S"),
                                    "end": lecture_end.strftime("%Y-%m-%d %H:%M:%S"),
                                }
                            )

                        # Spacer cells
                        case "week_smallseparatorcell_black":
                            if is_normal_spacer_before:
                                day_offset += 1
                                is_normal_spacer_before = False
                        case "week_smallseparatorcell":
                            if is_normal_spacer_before:
                                day_offset += 1
                                is_normal_spacer_before = False
                        case "week_separatorcell_black":
                            is_normal_spacer_before = True
                        case "week_separatorcell":
                            is_normal_spacer_before = True

            last_calendar_week = calendar_week
        return event_json

    def __rapla_get_data_single(self, source: str) -> Dict[str, any]:
        try:
            data = self.__rapla_scrape_source(source)
        except Exception as e:
            print(f"[ERROR] Could not download {source}!")
            print(e)
            return None

        if data:
            return {"data": data, "hash": self.__dict_hash(data)}
        else:
            return None

    def __rapla_get_data_multiple(self, rapla_sources: Dict[str, str]) -> Dict[str, any]:
        rapla_data = {}

        download_error = []
        for lecture_name, rapla_source in rapla_sources.items():
            lecture_data = self.__rapla_get_data_single(rapla_source)
            rapla_data[lecture_name] = lecture_data
            if not lecture_data:
                download_error.append(lecture_name)
        return rapla_data, download_error


# ~~~~~~~~~~~~~~~~ Example ~~~~~~~~~~~~~~~~ #
# calendar_wrapper = CalendarWrapper("iCalendar" or "Rapla", "dhbw-mannheim" or "custom")
# ---------- Input --------- #
# {
#     "Lecture 1": "Source 1",
#     "Lecture 2": "Source 2"
# }
#
# --------- Output --------- #
# {
#     "data": {
#         "X-WR-TIMEZONE": "Europe/Berlin",
#         "events": [
#             {
#                 "summary": "Lecture 1",
#                 "description": "Description 1",
#                 "location": "Location 1",
#                 "start": "2021-10-01 08:00:00",
#                 "end": "2021-10-01 10:00:00"
#             },
#             {
#                 "summary": "Lecture 2",
#                 "description": "Description 2",
#                 "location": "Location 2",
#                 "start": "2021-10-01 10:00:00",
#                 "end": "2021-10-01 12:00:00"
#             }
#         ]
#     },
#     "hash": "hash"
# }
