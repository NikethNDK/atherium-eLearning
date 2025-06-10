from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from aetherium.api.v1.auth.endpoints import router as auth_router
from aetherium.database.db import engine, Base
from aetherium.middleware.auth_middleware import add_session_middleware, startup_redis, shutdown_redis

app = FastAPI()

# CORS configuration
origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add session middleware
add_session_middleware(app)

# Include routers
app.include_router(auth_router)

# Create database tables
Base.metadata.create_all(bind=engine)

# Startup and shutdown events
@app.on_event("startup")
async def startup_event():
    await startup_redis(app)

@app.on_event("shutdown")
async def shutdown_event():
    await shutdown_redis(app)