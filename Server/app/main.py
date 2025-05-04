from fastapi import FastAPI
from fastapi.responses import FileResponse
from contextlib import asynccontextmanager
from fastapi_cache import FastAPICache
from fastapi_cache.backends.inmemory import InMemoryBackend
from fastapi_cache.backends.redis import RedisBackend
from redis import asyncio as aioredis


from config.database import Base
from config.settings import REDIS_URL, REDIS_PORT, REDIS_PASSWORD

from core.database import engine, get_async_session, check_db_connection
from core.redis import redis_manager_dependency

from middleware.analytics import Analytics, Config as AnalyticsConfig

from crud.stats import init_stats

from utils.redis_manager import RedisManager

from api.v1.router import router as router_v1


# ======================================================== #
# ================= Startup/Shutdown Code ================ #
# ======================================================== #


@asynccontextmanager
async def lifespan(app: FastAPI):
    await check_db_connection(engine)

    async with engine.begin() as conn:
        # await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    async with get_async_session() as db:
        await init_stats(db)

    # Initialize the FastAPI Cache
    redis = aioredis.Redis(host=REDIS_URL, port=REDIS_PORT, password=REDIS_PASSWORD, db=0)
    FastAPICache.init(RedisBackend(redis), prefix="fastapi-cache")

    # Initialize the Redis Manager
    redis_manager = RedisManager(host=REDIS_URL, port=REDIS_PORT, password=REDIS_PASSWORD, db=2)
    redis_manager_dependency.init(redis_manager)

    yield


with open("app_description.md", "r", encoding="utf-8") as file:
    description_content = file.read()
app = FastAPI(
    lifespan=lifespan,
    swagger_ui_parameters={"operationsSorter": "tag"},
    root_path="/api",
    title="🎓 TheStudentMaster API",
    description=description_content,
    version="1.4.0",
    contact={
        "name": "TheStudentMaster Support",
        "email": "support@thestudentmaster.de",
    },
)


@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    return FileResponse("static/favicon.ico")


app.include_router(router_v1, prefix="/v1")
# static_folder = os.path.join(os.path.dirname(__file__), "static")
# app.mount("/static", StaticFiles(directory=static_folder), name="static")


# ======================================================== #
# ======================= Analytics ====================== #
# ======================================================== #
# config = AnalyticsConfig()
# config.server_url = "http://localhost:8000"
# config.privacy_level = 1

# app.add_middleware(
#     Analytics,
#     api_key="dGhlc3R1ZGVudG1hc3Rlci10ZXN0.jJ3w9AxxQrU5-GlOE2WwTyK3s1F5mT5haf6RDv80mao",
#     config=config,
# )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
