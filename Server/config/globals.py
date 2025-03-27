from pydantic_settings import BaseSettings


class Globals(BaseSettings):
    server_stats_cache: dict = {}


globals = Globals()
