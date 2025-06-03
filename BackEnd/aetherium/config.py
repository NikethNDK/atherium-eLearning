from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    SECRET_KEY:str
    ALGORITHM:str
    ACCESS_TOKEN_EXPIRE_MIN:int
    DATABASE_URL:str

    class Config:
        env_file = os.path.join(os.path.dirname(__file__), ".env")

settings=Settings()
