from redis import asyncio as aioredis

from config.settings import REDIS_URL

class RedisManager:
    def __init__(self, host: str, port: int, password: str, db: int):
        self.redis = aioredis.Redis(host=host, port=port, password=password, db=db)

    async def connect(self):
        """Connect to the Redis server."""
        await self.redis.ping()

    async def close(self):
        """Close the Redis connection."""
        await self.redis.close()

    async def set(self, key: str, value: str):
        """Set a key in Redis.

        :param key: The key to set.
        :param value: The value to set.
        """
        await self.redis.set(key, value)
    
    async def get(self, key: str):
        """Get a key from Redis.

        :param key: The key to get.
        :return: The value of the key or None if it doesn't exist.
        """
        return await self.redis.get(key)
    
    async def delete(self, key: str):
        """Delete a key from Redis.

        :param key: The key to delete.
        """
        await self.redis.delete(key)

    async def exists(self, key: str):    
        """Check if a key exists in Redis.

        :param key: The key to check.
        :return: True if the key exists, False otherwise.
        """
        return await self.redis.exists(key)

    async def expire(self, key: str, seconds: int):
        """_summary_

        :param key: _description_
        :param seconds: _description_
        """
        await self.redis.expire(key, seconds)

    async def setex(self, key: str, seconds: int, value: str):
        """Set a key with an expiration time.

        :param key: The key to set.
        :param seconds: The number of seconds until the key expires.
        :param value: The value to set.
        """
        await self.redis.setex(key, seconds, value)

    async def ttl(self, key: str):
        """Get the time-to-live of a key.

        :param key: The key to check.
        :return: The time-to-live of the key in seconds.
        """
        return await self.redis.ttl(key)
