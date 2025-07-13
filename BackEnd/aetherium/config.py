from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    SECRET_KEY:str
    ALGORITHM:str
    ACCESS_TOKEN_EXPIRE_MIN:int
    DATABASE_URL:str
    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str
    GOOGLE_REDIRECT_URI: str
    SMTP_SERVER: str
    SMTP_PORT: int
    SMTP_USERNAME: str
    SMTP_PASSWORD: str
    FROM_EMAIL: str
    REDIS_HOST:str
    REDIS_PORT:int
    REDIS_DB:int
    FRONTEND_URL: str
    RAZORPAY_KEY_ID :str
    RAZORPAY_KEY_SECRET:str
    CLOUDINARY_CLOUD_NAME:str
    CLOUDINARY_API_KEY:str
    CLOUDINARY_API_SECRET:str

    class Config:
        env_file = os.path.join(os.path.dirname(__file__), ".env")

settings=Settings()
