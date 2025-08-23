from typing import Optional
from contextlib import contextmanager

from utils.redis_manager import RedisManager

class RedisManagerDependency:
    def __init__(self):
        self.redis_manager = None

    def init(self, redis_manager: RedisManager):
        self.redis_manager = redis_manager

    @contextmanager
    def get(self):
        if not self.redis_manager:
            raise RuntimeError("RedisManager not initialized")
        yield self.redis_manager

redis_manager_dependency = RedisManagerDependency()
