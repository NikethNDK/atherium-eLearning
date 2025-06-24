from fastapi import FastAPI
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from aetherium.api.v1 import auth_router, admin_router, instructor_router,user_router
from aetherium.database.db import engine, Base
from aetherium.middleware.auth_middleware import add_session_middleware, startup_redis, shutdown_redis
import logging

logging.basicConfig(level=logging.DEBUG)
# absolute path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await startup_redis(app)
    yield 
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

# Mount static files for uploads
uploads_dir = "uploads"
if not os.path.exists(uploads_dir):
    os.makedirs(uploads_dir)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Middleware and Routers
add_session_middleware(app)
app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(instructor_router)
app.include_router(user_router)

# DB & Static Files
Base.metadata.create_all(bind=engine)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")
