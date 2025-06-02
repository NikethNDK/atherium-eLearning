from pydantic import BaseSettings

class Settings(BaseSettings):
    SECRET_KEY=str
    ALGORITHM=str
    ACCESS_TOKEN_EXPIRE_MIN=int
    DATABASE_URL=str

    class config:
        env_file=".env"

settings=Settings()
