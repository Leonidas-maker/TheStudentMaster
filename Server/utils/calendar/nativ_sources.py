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


# TODO Validate if this is necessary
# def get_available_courses_dhbw_stug(base_url: str = "https://www.dhbw-stuttgart.de/studierendenportal/"):
#     page = requests.get(base_url)
#     soup = BeautifulSoup(page.content, "html.parser")
#     groups = soup.find_all("ul", class_="dhbw-link-list")

#     courses = {}
#     for group in groups:
#         raw_courses = group.find_all("li")
#         for course in raw_courses:
#             courses[course.get_text()] = f"www.dhbw-stuttgart.de{course.find("a").get("href")}"
#     return courses


if __name__ == "__main__":
    print(get_source_dhbw_ma())
    # print(get_available_courses_dhbw_stug())
