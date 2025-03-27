# import pytest
# import random

# # ~~~~~~~~~~~~~~~ Test-Asset ~~~~~~~~~~~~~~ #
# from utils.calendar.calendar_wrapper import CalendarWrapper
# from Server.utils.calendar.dhbw_app_fetcher import get_source_dhbw_ma

# ###########################################################################
# ################################### Init ##################################
# ###########################################################################

# pytest.sources_dhbw_ma = None

# DHBW_MA_SINGLE_TEST_RUNS = 10
# DHBW_MA_MULTIPLE_TEST_RUNS = 20
# RAPLA_SINGLE_TEST_RUNS = 3
# RAPLA_MULTIPLE_TEST_RUNS = 5

# ###########################################################################
# ################################ Test-Data ################################
# ###########################################################################

# # Test-URLs for rapla
# RAPLA_URLS = [
#     "https://rapla.dhbw.de/rapla/calendar?key=YFQc7NlGleuSdybxizoa8NHjLLNjd9D6tjBdAvDwwzXobLEfUIsCXHwYu-Ma7QfggMDkLLj1CsQ-kB7hFJSGjYcYLXE5KV9oTTpcSjsE5apebBNbC_ZjtngvStO4G7YHGryjvwt1kpad5g93Dkdn0A&salt=1046252309",
#     "https://rapla.dhbw-karlsruhe.de/rapla?page=calendar&user=vollmer&file=tinf22b3",
#     "https://rapla.dhbw-karlsruhe.de/rapla?page=calendar&user=vollmer&file=tinf21b3&prev=%3C%3C&day=5&month=5&year=2024",
#     "https://rapla.dhbw-karlsruhe.de/rapla?page=calendar&user=freudenmann&file=TINF21B1",
#     "https://rapla.dhbw-karlsruhe.de/rapla?page=calendar&user=eisenbiegler&file=TINF22B4",
#     "https://rapla.dhbw-karlsruhe.de/rapla?page=calendar&user=freudenmann&file=TINF23B1",
# ]

# ###########################################################################
# ############################# Helper Functions ############################
# ###########################################################################


# def check_single_output(data: dict[str, str]):
#     if data is None:
#         return

#     assert isinstance(data.get("data"), dict)
#     assert data.get("data").get("X-WR-TIMEZONE") is not None
#     assert isinstance(data.get("data").get("events"), list)
#     assert len(data.get("data").get("events")) > 0
#     assert data.get("hash") is not None

#     for event in data.get("data").get("events"):
#         assert event.get("summary") is not None
#         assert event.get("description") is not None
#         assert isinstance(event.get("description").get("tags"), list)
#         assert event.get("start") is not None
#         assert event.get("end") is not None


# def check_multiple_output(data: dict[str, str], expected_names: list[str]):
#     assert isinstance(data, dict)
#     assert len(data) == len(expected_names)

#     for course_name, course_data in data.items():
#         assert course_name in expected_names
#         if course_data is None:
#             continue
#         check_single_output(course_data)


# ###########################################################################
# ################################ Main Tests ###############################
# ###########################################################################


# @pytest.mark.dependency(name="MA_SOURCE")
# def test_get_source_dhbw_ma():
#     icals = get_source_dhbw_ma()

#     for key, value in icals.items():
#         assert key
#         assert value

#     pytest.sources_dhbw_ma = icals


# @pytest.mark.dependency(depends=["MA_SOURCE"])
# def test_get_ical_ma_single():
#     calendar_wrapper = CalendarWrapper("iCalendar", "dhbw-mannheim")

#     download_fails = 0
#     for i in range(DHBW_MA_SINGLE_TEST_RUNS):
#         ical_key = random.choice(list(pytest.sources_dhbw_ma.keys()))

#         ical = calendar_wrapper.get_data(pytest.sources_dhbw_ma[ical_key])
#         if ical is None:
#             download_fails += 1
#             continue
#         check_single_output(ical)

#     assert download_fails < DHBW_MA_SINGLE_TEST_RUNS * 0.2


# @pytest.mark.dependency(depends=["MA_SOURCE"])
# def test_get_ical_ma_multiple():
#     calendar_wrapper = CalendarWrapper("iCalendar", "dhbw-mannheim")

#     ical_keys = random.sample(list(pytest.sources_dhbw_ma.keys()), DHBW_MA_MULTIPLE_TEST_RUNS)

#     ical_choice = {}

#     for key in ical_keys:
#         ical_choice[key] = pytest.sources_dhbw_ma[key]

#     icals, download_fails = calendar_wrapper.get_data(ical_choice)

#     assert len(download_fails) < DHBW_MA_MULTIPLE_TEST_RUNS * 0.2
#     check_multiple_output(icals, ical_keys)


# def test_get_ical_ma_single_fail():
#     calendar_wrapper = CalendarWrapper("iCalendar", "dhbw-mannheim")

#     ical = calendar_wrapper.get_data("https://vorlesungsplan.dhbw-mannheim.de/ical.php?ical=123")
#     assert ical is None


# def test_get_ical_ma_multiple_fail():
#     calendar_wrapper = CalendarWrapper("iCalendar", "dhbw-mannheim")

#     ical_choice = {
#         "Test1": "https://vorlesungsplan.dhbw-mannheim.de/ical.php?ical=123",
#         "Test2": "https://vorlesungsplan.dhbw-mannheim.de/ical.php?ical=123",
#         "Test3": "https://vorlesungsplan.dhbw-mannheim.de/ical.php?ical=123",
#         "Test4": "https://vorlesungsplan.dhbw-mannheim.de/ical.php?ical=123",
#         "Test5": "https://vorlesungsplan.dhbw-mannheim.de/ical.php?ical=123",
#     }

#     icals, download_fails = calendar_wrapper.get_data(ical_choice)

#     assert len(download_fails) == len(ical_choice)
#     assert len(icals) == len(ical_choice)


# def test_get_rapla_single():
#     calendar_wrapper = CalendarWrapper("Rapla")

#     raple_urls = random.sample(RAPLA_URLS, RAPLA_SINGLE_TEST_RUNS)

#     download_fails = 0
#     for url in raple_urls:
#         rapla = calendar_wrapper.get_data(url)
#         if rapla is None:
#             download_fails += 1
#             continue
#         check_single_output(rapla)

#     assert download_fails < len(RAPLA_URLS) * 0.2


# def test_get_rapla_multiple():
#     calendar_wrapper = CalendarWrapper("Rapla")

#     rapla_urls = random.sample(RAPLA_URLS, RAPLA_MULTIPLE_TEST_RUNS)

#     rapla_choice = {}

#     for i, url in enumerate(rapla_urls):
#         rapla_choice[f"Test{i}"] = url

#     raplas, download_fails = calendar_wrapper.get_data(rapla_choice)

#     assert len(download_fails) < len(rapla_urls) * 0.2
#     check_multiple_output(raplas, list(rapla_choice.keys()))
