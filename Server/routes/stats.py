from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from fastapi_cache.decorator import cache
from models.pydantic_schemas import s_stats


from middleware.database import get_db

from controllers.stats import get_stats


stats_router = APIRouter()

@stats_router.get("/all")
@cache(expire=120)
async def api_get_stats(db: Session = Depends(get_db)) -> s_stats.ServerStatus:
    return get_stats(db)