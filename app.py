#!/usr/bin/env python

from api.utils.startup import init_env
init_env()

from os import getenv
from api import auth, api
from logging import getLogger
from fastapi import FastAPI, APIRouter, Request
from api.utils.utils import CustomError, jsonify
from fastapi.responses import FileResponse
from api.utils.deadline import DeadlineManager
from fastapi_sqlalchemy import DBSessionMiddleware
from starlette.middleware.cors import CORSMiddleware

logger = getLogger(__name__)

app = FastAPI(title="server")

app.add_middleware(
    DBSessionMiddleware,
    db_url=getenv("DB_URL")
)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=[
        "http://localhost:4030",
        "http://127.0.0.1:4030"
    ],
    allow_methods=["*"],
    allow_headers=["*"]
)

# app.mount("/static", StaticFiles(directory="."), name="static")
router = APIRouter(prefix="/api")
router.include_router(api.router)
router.include_router(auth.router)
app.include_router(router)

@app.on_event("startup")
def startup():
    init_env()
    DeadlineManager().start()
    logger.info("Application startup complete.")

@app.on_event("shutdown")
def shutdown():
    DeadlineManager().stop()
    logger.info("Application shutdown complete.")

@app.middleware("http")
async def middleware(request: Request, call_next):
    try:
        res = await call_next(request)
        if res.status_code != 200:
            logger.warning(f"{res.status_code} {request.url.path}")
        return res
    except CustomError as e:
        logger.error(f"[CustomError]: {str(e)}")
        return jsonify({"status": "ng", "detail": str(e)}, e.code)
    except Exception as e:
        logger.error(str(e), exc_info=True)
        return jsonify({"status": "ng", "detail": "Internal Server Error"}, 500)

@app.get("/assets/{filename:str}")
def assets(filename: str):
    return FileResponse(f"dist/assets/{filename}")
    
@app.get("/")
def index():
    return FileResponse(f"dist/assets/index.html")

@app.get("/pages/{rest:path}")
def pages(rest: str):
    return FileResponse(f"dist/assets/index.html")