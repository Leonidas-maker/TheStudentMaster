from config.database import SessionLocal
from contextlib import asynccontextmanager
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@asynccontextmanager
async def get_async_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()