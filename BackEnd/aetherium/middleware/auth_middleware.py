from starlette.middleware.sessions import SessionMiddleware
from aetherium.config import settings
from fastapi import FastAPI
import redis.asyncio as redis
from redis.asyncio import Redis

async def get_redis_client() -> Redis:
    return redis.Redis(
        host=settings.REDIS_HOST,
        port=settings.REDIS_PORT,
        db=settings.REDIS_DB,
        decode_responses=True
    )
    

def add_session_middleware(app: FastAPI):
    app.add_middleware(
        SessionMiddleware,
        secret_key=settings.SECRET_KEY,
        max_age=3600,   
        same_site="lax",    
        https_only=False,  
    )

async def startup_redis(app: FastAPI):
    app.state.redis = await get_redis_client()

async def shutdown_redis(app: FastAPI):
    await app.state.redis.close()