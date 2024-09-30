from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

def configure_static(app: FastAPI):
    # Mount the static directory
    app.mount("/static", StaticFiles(directory="data/public/"), name="static")

    # Route for favicon.ico
    @app.get("/favicon.ico", include_in_schema=False)
    async def favicon():
        return FileResponse("public/static/favicon.ico")