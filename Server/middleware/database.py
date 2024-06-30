from contextlib import asynccontextmanager

# ~~~~~~~~~~~~~~~~~ Config ~~~~~~~~~~~~~~~~ #
from config.database import SessionLocal

# Dependency to get a synchronous database session
def get_db():
    db = SessionLocal()
    try:
        # Yield the database session to the calling context
        yield db
    finally:
        # Ensure the database session is closed after use
        db.close()

# Dependency to get an asynchronous database session
@asynccontextmanager
async def get_async_db():
    db = SessionLocal()
    try:
        # Yield the database session to the calling context
        yield db
    finally:
        # Ensure the database session is closed after use
        db.close()