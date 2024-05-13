from fastapi.testclient import TestClient
from ..main import app
import pytest
import pyotp
import time
import random

client = TestClient(app)

pytest.refresh_token = None
pytest.access_token = None
pytest.secret_token = None
pytest._2fa_secret = None
pytest._2fa_backup_codes = None
pytest._2fa_last_otp = None
pytest.native_calendars = []
pytest.canteens = []


@pytest.fixture(scope="class")
def suspend_capture(pytestconfig):
    class suspend_guard:
        def __init__(self):
            self.capmanager = pytestconfig.pluginmanager.getplugin("capturemanager")

        def __enter__(self):
            self.capmanager.suspend_global_capture(in_=True)
            pass

        def __exit__(self, _1, _2, _3):
            self.capmanager.resume_global_capture()

    yield suspend_guard()


#! This test concept need to be improved @AmateReysu
#!  - The OTP verification should be automated
#!  - The test should be split into multiple tests

###########################################################################
################################ Test-Data ################################
###########################################################################

# ======================================================== #
# =================== Intial User Data =================== #
# ======================================================== #
user_data = {
    "username": "test",
    "email": "schuetzeandreas.1@web.de",
    "security": {"password": "1234"},
    "address": {
        "address1": "Hirschdell 12",
        "district": "Saarland",
        "postal_code": "66539",
        "city": "Neunkirchen",
        "country": "Germany",
    },
}

login_data = {"ident": user_data["email"], "password": user_data["security"]["password"]}

# ======================================================== #
# =================== Update User Data =================== #
# ======================================================== #
update_user_template = {
    "username": None,
    "email": None,
    "old_password": None,
    "new_password": None,
    "address": None,
    "avatar": None,
}

update_data_address = {
    "address": {
        "address1": "Hirschdell 11",
        "address2": None,
        "district": "Saarland",
        "postal_code": "66539",
        "city": "Neunkirchen",
        "country": "Germany",
    },
}

update_data_password = {
    "old_password": "1234",
    "new_password": "12345",
}

update_data_username = {
    "username": "test1",
    "old_password": "1234",
}

update_data_email = {
    "email": "test@test.de",
    "old_password": "1234",
}

###########################################################################
############################# Helper Functions ############################
###########################################################################


def check_user_data():
    # Check response message is correct by getting the user data
    response = client.get(
        "/user/me", headers={"Authorization": f"Bearer {pytest.access_token}"}, params={"address": True}
    )

    assert response.status_code == 200

    # Check if the response contains the correct data as specified in user_data
    for key, value in user_data.items():
        if key == "security":
            continue
        if key == "address":
            for k, v in value.items():
                assert response.json().get(key).get(k) == v
            continue
        assert response.json().get(key) == value


def check_save_tokens(response):
    # Get and check the refresh_token and access_token
    tmp_refresh_token = response.json().get("refresh_token")
    tmp_access_token = response.json().get("access_token")

    assert tmp_refresh_token is not None
    assert tmp_access_token is not None

    pytest.refresh_token = tmp_refresh_token
    pytest.access_token = tmp_access_token


def check_user_data_simple(only_status_code=True):
    response = client.get("/user/me", headers={"Authorization": f"Bearer {pytest.access_token}"})

    assert response.status_code == 200
    if not only_status_code:
        assert response.json().get("email") == login_data["ident"]


def pick_random_calendar(response_data):
    university = random.choice(response_data)
    course = random.choice(university["course_names"])

    return university["university_uuid"], course


def check_calendar_response(response_data, course):
    needed_keys = {"Required": ["course_name", "data", "hash", "last_modified"], "Optional": ["university_name"]}
    data_needed_keys = ["X-WR-TIMEZONE", "events"]
    events_needed_keys = {"Required": ["summary", "start", "end", "description"], "Optional": ["location"]}

    description_needed_keys = ["tags"]

    assert response_data.get("course_name") == course

    for key, value in response_data.items():
        assert key in needed_keys["Required"] + needed_keys["Optional"]
        if key in needed_keys["Required"]:
            assert value is not None

        # * Strict check if the data is correct
        if value == "data":
            assert isinstance(value, dict)
            for k, v in value.items():
                assert k in data_needed_keys
                if k == "events":
                    assert isinstance(v, list)
                    for event in v:
                        for k, v in event.items():
                            assert k in events_needed_keys["Optional"] + events_needed_keys["Required"]
                            if k in events_needed_keys["Required"]:
                                if k == "description":
                                    for k, v in event[k].items():
                                        assert k in description_needed_keys
                                else:
                                    assert v is not None
                            elif k in events_needed_keys["Optional"]:
                                continue
                            else:
                                assert False  # Unknown key
                        # End event items
                    # End events
            # End data items
    # End response_data items


###########################################################################
################################ Main Tests ###############################
###########################################################################


@pytest.mark.dependency(name="REGISTER")
def test_register(suspend_capture):
    # Register user
    response = client.post("/auth/register", json=user_data)
    assert response.status_code == 200

    # Check if the response contains the correct data as specified in user_data
    assert response.json()["username"] == user_data["username"]
    assert response.json()["email"] == user_data["email"]

    # Get and check the user_uuid
    user_uuid = response.json().get("user_uuid")
    assert user_uuid is not None

    # TODO Automate OTP verification @AmateReysu
    with suspend_capture:
        verfiy_otp = input("\n[Register] Enter OTP: ")

    # Verify account with OTP which was send by email
    response = client.post(f"/auth/verify-account/{user_uuid}", params={"verify_code": verfiy_otp})

    assert response.status_code == 200

    # Check response message is correct
    assert response.json() == {"message": "Account verified"}


# TODO Add test for other idents like email @AmateReysu
# TODO Add test for application registration @AmateReysu
@pytest.mark.dependency(name="LOGIN")
def test_login():
    response = client.post("/auth/login", json=login_data)

    assert response.status_code == 200

    check_save_tokens(response)
    check_user_data_simple(only_status_code=False)


def test_refresh_token():
    # Refresh the access_token and refresh_token
    response = client.post("/auth/refresh-token", headers={"Authorization": f"Bearer {pytest.refresh_token}"})
    assert response.status_code == 200

    # Get and check the refresh_token and access_token
    pytest.refresh_token = response.json().get("refresh_token")
    pytest.access_token = response.json().get("access_token")

    assert pytest.refresh_token is not None
    assert pytest.access_token is not None

    check_user_data_simple()


# ======================================================== #
# ======================= 2FA Tests ====================== #
# ======================================================== #


@pytest.mark.dependency(depends=["LOGIN"], name="2FA_ADD")
def test_add_2fa():
    # ~~~~~~~~~~~~~~~~~ First ~~~~~~~~~~~~~~~~~ #
    # we need to add 2FA to the account. We will not use the QR code for this test.

    # Begin 2FA activation process
    response = client.post(
        "/auth/add-2fa",
        headers={"Authorization": f"Bearer {pytest.access_token}"},
        json={"password": user_data["security"]["password"], "need_qr_code": False},
    )

    assert response.status_code == 200

    # Get and check the 2FA secret
    pytest._2fa_secret = response.json().get("secret_2fa")

    assert pytest._2fa_secret is not None

    # ~~~~~~~~~~~~~~~~~ Second ~~~~~~~~~~~~~~~~ #
    # we need to verify the 2FA code to activate 2FA.

    # Generate OTP code
    otp_code = pyotp.TOTP(pytest._2fa_secret).now()

    # Activate 2FA
    response = client.post(
        "/auth/verify-first-2fa",
        headers={"Authorization": f"Bearer {pytest.access_token}"},
        json={"otp_code": otp_code},
    )

    assert response.status_code == 200

    # Check backup codes
    pytest._2fa_backup_codes = response.json().get("backup_codes")
    assert pytest._2fa_backup_codes is not None
    assert len(pytest._2fa_backup_codes) == 6

    # Check response message is correct
    assert response.json().get("timestamp") is not None
    pytest._2fa_last_otp = otp_code


@pytest.mark.dependency(depends=["LOGIN"])
def test_logout():
    response = client.delete(
        "/auth/logout",
        headers={"Authorization": f"Bearer {pytest.refresh_token}"},
        params={"access_token": pytest.access_token},
    )

    assert response.status_code == 200
    assert response.json() == {"message": "Logout successful"}


@pytest.mark.dependency(depends=["2FA_ADD"], name="LOGIN_2FA")
def test_login_2fa():
    # Generate OTP code
    while True:
        otp_code = pyotp.TOTP(pytest._2fa_secret).now()
        if otp_code != pytest._2fa_last_otp:
            break
        else:
            time.sleep(1)

    # First login to get the security_token
    response = client.post("/auth/login", json={"ident": "test", "password": "1234"})

    assert response.status_code == 200

    # Get and check the security_token
    pytest.secret_token = response.json().get("secret_token")

    assert pytest.secret_token is not None

    # Login with 2FA
    response = client.post(
        "/auth/verify-2fa/", json={"otp_code": otp_code}, headers={"Authorization": f"Bearer {pytest.secret_token}"}
    )

    assert response.status_code == 200

    check_save_tokens(response)
    check_user_data_simple(only_status_code=False)


@pytest.mark.dependency(depends=["2FA_ADD", "LOGIN"])
def test_remove_2fa():
    # Generate OTP code
    while True:
        otp_code = pyotp.TOTP(pytest._2fa_secret).now()
        if otp_code != pytest._2fa_last_otp:
            break
        else:
            time.sleep(1)

    # Remove 2FA
    response = client.delete(
        "/auth/remove-2fa", headers={"Authorization": f"Bearer {pytest.access_token}"}, params={"otp_code": otp_code}
    )

    assert response.status_code == 200
    assert response.json() == {"message": "2FA removed"}

    pytest._2fa_last_otp = None
    pytest._2fa_backup_codes = None
    pytest._2fa_secret = None


# ======================================================== #
# ====================== Public API ====================== #
# ======================================================== #


@pytest.mark.dependency(name="PUB_CALENDAR")
def test_calendar():
    response = client.get("/calendar/available_calendars")

    assert response.status_code == 200
    response_data = response.json()
    needed_keys = ["university_name", "university_uuid", "course_names"]

    for data in response_data:
        for key, value in data.items():
            assert value is not None
            assert key in needed_keys
            if isinstance(value, list):
                for v in value:
                    assert v is not None

    pytest.native_calendars = response_data
    university_uuid, course = pick_random_calendar(response_data)

    response = client.get(f"/calendar/{university_uuid}/{course}")

    assert response.status_code == 200
    response_data = response.json()

    check_calendar_response(response_data, course)

    calendar_hash = response_data["hash"]

    response = client.get(f"/calendar/{university_uuid}/{course}/hash")

    assert response.status_code == 200
    assert response.json() == {"message": calendar_hash}


# TODO Canteen test is not fully implemented yet (reason API is not consistent) --> @AmateReysu pls update the test when the API is consistent
@pytest.mark.dependency(name="PUB_CANTEEN")
def test_canteen():
    response = client.get("/canteen/all")

    assert response.status_code == 200

    response_data = response.json()
    assert response_data is not None
    assert isinstance(response_data, list)
    assert len(response_data) > 0
    for data in response_data:
        assert data.get("canteen_name") is not None
        assert data.get("canteen_short_name") is not None

    pytest.canteens = response_data
    selected_canteen = random.choice(response_data)
    response = client.get(f"/canteen/{selected_canteen['canteen_short_name']}/menu/all")

    assert response.status_code == 200

    response_data = response.json()
    assert response_data is not None
    assert response_data.get("canteen_name") == selected_canteen["canteen_name"]
    assert response_data.get("canteen_short_name") == selected_canteen["canteen_short_name"]

    response_menu = response_data.get("menu")
    assert isinstance(response_menu, list)

    # TODO Check if the canteen scrapping is working (DB query) @AmateReysu
    assert len(response_menu) > 0  #! Verfiy if the canteen scrapping is working

    for data in response_menu:
        assert data.get("dish_type") is not None
        assert data.get("dish") is not None
        assert data.get("price") is not None
        assert data.get("serving_date") is not None

    check_service_date = random.choice(response_menu).get("serving_date")
    response = client.get(f"/canteen/menu/{check_service_date}")

    assert response.status_code == 200

    response_data = response.json()
    assert response_data is not None
    assert isinstance(response_data, list)

    for data in response_data:
        assert data.get("canteen_name") is not None
        assert data.get("canteen_short_name") is not None

        menu_data = data.get("menu")
        assert isinstance(menu_data, dict)

        assert menu_data.get("dish_type") is not None
        assert menu_data.get("dish") is not None
        assert menu_data.get("price") is not None
        assert menu_data.get("serving_date") == check_service_date


# ======================================================== #
# ==================== User-Operations1 ================== #
# ======================================================== #


@pytest.mark.dependency(depends=["LOGIN"])
def test_update_user():
    update_data = {}

    for key, value in update_data_address.items():
        update_data[key] = value

    # ~~~~~~~~~~~~~ Update address ~~~~~~~~~~~~ #
    response = client.put("/user/me", headers={"Authorization": f"Bearer {pytest.access_token}"}, json=update_data)

    assert response.status_code == 200
    for key, value in response.json().get("address").items():
        assert value == update_data_address["address"][key]

    # ~~~~~~~~~~~~ Update password ~~~~~~~~~~~~ #
    update_data = {}
    for key, value in update_data_password.items():
        update_data[key] = value

    response = client.put("/user/me", headers={"Authorization": f"Bearer {pytest.access_token}"}, json=update_data)

    assert response.status_code == 200

    # Check if the password was updated by change the password back to the old password
    update_data = update_user_template.copy()
    update_data["old_password"] = update_data_password["new_password"]
    update_data["new_password"] = update_data_password["old_password"]

    response = client.put("/user/me", headers={"Authorization": f"Bearer {pytest.access_token}"}, json=update_data)

    assert response.status_code == 200

    # ~~~~~~~~~~~~ Update username ~~~~~~~~~~~~ #
    update_data = {}
    for key, value in update_data_username.items():
        update_data[key] = value

    response = client.put("/user/me", headers={"Authorization": f"Bearer {pytest.access_token}"}, json=update_data)

    assert response.status_code == 200
    assert response.json().get("username") == update_data_username["username"]

    user_data["username"] = update_data_username["username"]

    # ~~~~~~~~~~~~~ Update email ~~~~~~~~~~~~~~ #
    update_data = {}
    for key, value in update_data_email.items():
        update_data[key] = value

    response = client.put("/user/me", headers={"Authorization": f"Bearer {pytest.access_token}"}, json=update_data)

    # * Should be 401 because the username was changed before (2h wait time)
    assert response.status_code == 401


# ======================================================== #
# ==================== Forgot Password =================== #
# ======================================================== #
@pytest.mark.dependency(depends=["REGISTER"])
def test_forgot_password(suspend_capture):
    # ~~~~~~~~~ Request password reset ~~~~~~~~ #
    response = client.post("/auth/forgot-password", json={"email": user_data["email"]})

    assert response.status_code == 200

    # Check response message is correct
    user_uuid = response.json().get("user_uuid")

    assert user_uuid is not None
    assert response.json().get("message") == "Email sent"

    # TODO Automate OTP verification @AmateReysu
    with suspend_capture:
        verfiy_otp = input("\n[Forgot Password] Enter OTP: ")

    # ~~~~~~~~~~~~~ Reset password ~~~~~~~~~~~~ #
    response = client.put(
        f"/auth/reset-password/{user_uuid}",
        json={"new_password": update_data_password["new_password"], "otp_code": verfiy_otp},
    )

    assert response.status_code == 200
    assert response.json() == {"message": "Password reset successfully"}

    login_data["password"] = update_data_password["new_password"]
    test_login()


# ======================================================== #
# ==================== User-Operations2 ================== #
# ======================================================== #


@pytest.mark.dependency(depends=["LOGIN", "PUB_CALENDAR"])
def test_add_remove_calendar_native():
    # ~~~~ Add Native-Calendar to the user ~~~~ #
    university_uuid, course = pick_random_calendar(pytest.native_calendars)

    calendar_native_json = {"university_uuid": university_uuid, "course_name": course}

    response = client.post(
        "/user/calendar/", headers={"Authorization": f"Bearer {pytest.access_token}"}, json=calendar_native_json
    )
    response_data = response.json()

    assert response.status_code == 200
    check_calendar_response(response_data, course)

    # ~~~~~~ Verfiy if calendar was added ~~~~~ #
    response = client.get("/user/calendar/", headers={"Authorization": f"Bearer {pytest.access_token}"})
    response_data = response.json()

    assert response.status_code == 200
    check_calendar_response(response_data, course)

    calendar_hash = response_data["hash"]

    response = client.get("/user/calendar/hash", headers={"Authorization": f"Bearer {pytest.access_token}"})

    assert response.status_code == 200
    assert response.json() == {"message": calendar_hash}

    # ~~ Remove Native-Calendar from the user ~ #
    response = client.delete("/user/calendar/", headers={"Authorization": f"Bearer {pytest.access_token}"})

    assert response.status_code == 200
    assert response.json() == {"message": "Calendar removed"}

    # ~~~~~ Verfiy if calendar was removed ~~~~ #
    response = client.get("/user/calendar/", headers={"Authorization": f"Bearer {pytest.access_token}"})

    assert response.status_code == 404
    assert response.json() == {"detail": "Calendar not found"}


@pytest.mark.dependency(depends=["LOGIN"])
def test_add_remove_calendar_custom():
    # ~~~~ Add Custom-Calendar to the user ~~~~ #

    calendar_custom_json = {
        "course_name": "Pytest-Custom-Calendar-Test",
        "university_uuid": "e5ee4d2bb5c64c059603ac29b34aa867",
        "source_backend": "Rapla",
        "source_url": "https://rapla.dhbw.de/rapla/internal_calendar?key=YFQc7NlGleuSdybxizoa8NHjLLNjd9D6tjBdAvDwwzXobLEfUIsCXHwYu-Ma7QfggMDkLLj1CsQ-kB7hFJSGjYcYLXE5KV9oTTpcSjsE5apebBNbC_ZjtngvStO4G7YHGryjvwt1kpad5g93Dkdn0A&salt=1046252309&day=12&month=2&year=2024&pages=20",
    }

    response = client.post(
        "/user/calendar/", headers={"Authorization": f"Bearer {pytest.access_token}"}, json=calendar_custom_json
    )
    response_data = response.json()

    assert response.status_code == 200
    check_calendar_response(response_data, calendar_custom_json["course_name"])

    # ~~~~~~ Verfiy if calendar was added ~~~~~ #
    response = client.get("/user/calendar/", headers={"Authorization": f"Bearer {pytest.access_token}"})
    response_data = response.json()

    assert response.status_code == 200
    check_calendar_response(response_data, calendar_custom_json["course_name"])

    calendar_hash = response_data["hash"]

    response = client.get("/user/calendar/hash", headers={"Authorization": f"Bearer {pytest.access_token}"})

    assert response.status_code == 200
    assert response.json() == {"message": calendar_hash}

    # ~~ Remove Custom-Calendar from the user ~ #
    response = client.delete("/user/calendar/", headers={"Authorization": f"Bearer {pytest.access_token}"})

    assert response.status_code == 200
    assert response.json() == {"message": "Calendar removed"}

    # ~~~~~ Verfiy if calendar was removed ~~~~ #
    response = client.get("/user/calendar/", headers={"Authorization": f"Bearer {pytest.access_token}"})

    assert response.status_code == 404
    assert response.json() == {"detail": "Calendar not found"}


# ======================================================== #


@pytest.mark.dependency(depends=["LOGIN", "PUB_CANTEEN"])
def test_add_remove_canteen():
    # ~~~~ Add Canteen to the user ~~~~ #
    selected_canteen = random.choice(pytest.canteens)
    response = client.put(
        "/user/canteen",
        headers={"Authorization": f"Bearer {pytest.access_token}"},
        params={"canteen_short_name": selected_canteen["canteen_short_name"]},
    )

    assert response.status_code == 200
    assert response.json().get("canteen_short_name") == selected_canteen["canteen_short_name"]
    assert response.json().get("canteen_name") == selected_canteen["canteen_name"]

    # ~~~~~~ Verfiy if canteen was added ~~~~~ #
    response = client.get("/user/canteen", headers={"Authorization": f"Bearer {pytest.access_token}"})

    assert response.status_code == 200
    assert response.json().get("canteen_short_name") == selected_canteen["canteen_short_name"]
    assert response.json().get("canteen_name") == selected_canteen["canteen_name"]

    # ~~ Remove Canteen from the user ~ #
    response = client.delete("/user/canteen", headers={"Authorization": f"Bearer {pytest.access_token}"})

    assert response.status_code == 200
    assert response.json() == {"message": "Canteen removed"}

    # ~~~~~ Verfiy if canteen was removed ~~~~ #
    response = client.get("/user/canteen", headers={"Authorization": f"Bearer {pytest.access_token}"})

    assert response.status_code == 404
    assert response.json() == {"detail": "No canteen assigned to user"}


# ======================================================== #


@pytest.mark.dependency(depends=["LOGIN"])
def test_delete_user():
    response = client.delete("/user/me", headers={"Authorization": f"Bearer {pytest.access_token}"})

    assert response.status_code == 200
    assert response.json() == {"message": "User deleted"}
