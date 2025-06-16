from fastapi import FastAPI
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from aetherium.api.v1.auth.endpoints import router as auth_router
from aetherium.api.v1.admin.endpoints import router as admin_router
from aetherium.database.db import engine, Base
from aetherium.middleware.auth_middleware import add_session_middleware, startup_redis, shutdown_redis

# absolute path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await startup_redis(app)
    yield  # This allows the app to run
    await shutdown_redis(app)

app = FastAPI(lifespan=lifespan)

# CORS
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins= ["http://localhost:5173","http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["Set-Cookie"],
)

# Middleware and Routers
add_session_middleware(app)
app.include_router(auth_router)
app.include_router(admin_router)

# DB & Static Files
Base.metadata.create_all(bind=engine)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")
