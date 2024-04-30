from pydantic import BaseModel


class Ical(BaseModel):
    ical_name: str
    ical_source: str
