import pytest
from fastapi.testclient import TestClient
import os
from typing import Optional

def pytest_sessionstart(session):
    os.environ["TESTING"] = "True"

@pytest.fixture(scope="module")
def client():
    from main import app # type: ignore
    with TestClient(app) as c:
        yield c


def map_dhbw_university_to_site_code(university: str) -> Optional[str]:
    """
    Map a full DHBW university name to its corresponding DHBW.APP site code.
    """
    match university:
        case "Duale Hochschule Baden-Wuerttemberg Mosbach":
            return "MOS"
        case "Duale Hochschule Baden-Wuerttemberg Bad Mergentheim":
            return "MGH"
        case "Duale Hochschule Baden-Wuerttemberg Heilbronn":
            return "HN"
        case "Duale Hochschule Baden-Wuerttemberg Karlsruhe":
            return "KA"
        case "Duale Hochschule Baden-Wuerttemberg Villingen-Schwenningen":
            return "VS"
        case "Duale Hochschule Baden-Wuerttemberg Mannheim":
            return "MA"
        case "Duale Hochschule Baden-Wuerttemberg Stuttgart":
            return "STG"
        case "Duale Hochschule Baden-Wuerttemberg Heidenheim":
            return "HDH"
        case "Duale Hochschule Baden-Wuerttemberg Friedrichshafen":
            return "FN"
        case "Duale Hochschule Baden-Wuerttemberg Ravensburg":
            return "RV"
        case _:
            return None

COURSES_COUNT_TO_CHECK = 30