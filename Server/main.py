# ~~~~~~~~~~~~ External Modules ~~~~~~~~~~~ #
from fastapi import FastAPI, Request, Response
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from fastapi_cache import FastAPICache
from fastapi_cache.backends.inmemory import InMemoryBackend
from fastapi_cache.backends.redis import RedisBackend
import asyncio
from fastapi_cdn_host import monkey_patch
import os

# ~~~~~~~~~~~~~~~~~ Config ~~~~~~~~~~~~~~~~ #
from config.globals import globals
from config.database import engine
from config.general import Config, ENVIRONMENT
from redis import asyncio as aioredis

server_config = Config()

# ~~~~~~~~~~~~~~~ Middleware ~~~~~~~~~~~~~~ #
from middleware.database import get_async_db
from middleware.stats import init_stats

# ~~~~~~~~~~~~~~~~ Schemas ~~~~~~~~~~~~~~~~ #
from models.pydantic_schemas import s_stats

# ~~~~~~~~~~~~~~~~~ Models ~~~~~~~~~~~~~~~~ #
from models.sql_models import m_user, m_general, m_canteen, m_calendar, m_auth, m_stats

# ~~~~~~~~~~~~~~~~~ Routes ~~~~~~~~~~~~~~~~ #
from routes import user, auth, canteen, calendar, static, stats

m_general.Base.metadata.create_all(bind=engine)
m_user.Base.metadata.create_all(bind=engine)
m_auth.Base.metadata.create_all(bind=engine)
m_calendar.Base.metadata.create_all(bind=engine)
m_canteen.Base.metadata.create_all(bind=engine)
m_stats.Base.metadata.create_all(bind=engine)


# ======================================================== #
# ================= Startup/Shutdown Code ================ #
# ======================================================== #


@asynccontextmanager
async def lifespan(app: FastAPI):
    # ~~~~~~~~~ Code to run on startup ~~~~~~~~ #

    if ENVIRONMENT == "prod":
        redis_host = os.getenv("REDIS_HOST", "redis")
        redis_port = int(os.getenv("REDIS_PORT", 6379))

        with open("/run/secrets/tsm_redis_password", "r") as file:
            redis_password = file.read().strip()

        redis = aioredis.from_url(f"redis://:{redis_password}@{redis_host}:{redis_port}")
        FastAPICache.init(RedisBackend(redis), prefix="fastapi-cache")
    elif ENVIRONMENT == "dev":
        FastAPICache.init(InMemoryBackend())

    # ~~~~~~~~ End of code to run on startup ~~~~~~~~ #
    yield
    # ~~~~~~~~ Code to run on shutdown ~~~~~~~~ #


with open("app_description.md", "r", encoding="utf-8") as file:
    description_content = file.read()
app = FastAPI(
    lifespan=lifespan,
    swagger_ui_parameters={"operationsSorter": "tag"},
    root_path="/api",
    title="🎓 TheStudentMaster API",
    description=description_content,
    version="1.3.0",
    contact={
        "name": "TheStudentMaster Support",
        "email": "support@thestudentmaster.de",
    },
)

monkey_patch(app)


# ======================================================== #
# ======================= Test-API ======================= #
# ======================================================== #
@app.get("/")
async def root():
    return {"message": "Hello World"}


# ======================================================== #
# ======================= Analytics ====================== #
# ======================================================== #
# TODO Implement the analytics middleware


# ======================================================== #
# ====================== Middleware ====================== #
# ======================================================== #
@app.middleware("http")
async def check_route_availability(request: Request, call_next):
    base_path = request.url.path.replace("/api", "").strip("/").split("/")[0]
    route_status = globals.server_stats_cache.get(base_path, {})

    if route_status.get("status", "online") != "online" or route_status.get("maintenance", False):
        headers = {"Retry-After": "1800"}
        return JSONResponse(status_code=503, headers=headers, content={"message": "Service temporarily unavailable"})

    response = await call_next(request)
    return response


# ======================================================== #
# ======================== Router ======================== #
# ======================================================== #
static.configure_static(app)
app.include_router(user.users_router, prefix="/user", tags=["user"])
app.include_router(auth.auth_router, prefix="/auth", tags=["auth"])
app.include_router(canteen.canteen_router, prefix="/canteen", tags=["canteen"])
app.include_router(calendar.calendar_router, prefix="/calendar", tags=["calendar"])
app.include_router(stats.stats_router, prefix="/stats", tags=["stats"])
