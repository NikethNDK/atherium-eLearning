from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from aetherium.config import settings

DATABASE_URL=settings.DATABASE_URL

engine=create_engine(DATABASE_URL)
SessionLocal=sessionmaker(autocommit=False,autoflush=False,bind=engine)
Base=declarative_base()

def get_db():
    db=SessionLocal()
    try:
        yield db
    finally:
        db.close()

# from sqlalchemy import create_engine
# from sqlalchemy.orm import sessionmaker, declarative_base
# from aetherium.config import settings

# DATABASE_URL = settings.DATABASE_URL

# # Configure engine with pool settings
# engine = create_engine(
#     DATABASE_URL,
#     pool_size=10,
#     max_overflow=20,
#     pool_pre_ping=True,
#     pool_recycle=3600
# )

# SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
# Base = declarative_base()

# def get_db():
#     """For FastAPI dependency injection"""
#     db = SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()

# # def get_celery_db():
# #     """For Celery tasks with explicit cleanup"""
# #     return SessionLocal()

# celery_engine = create_engine(
#     settings.DATABASE_URL,
#     pool_pre_ping=True,
#     pool_recycle=3600
# )
# CelerySessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=celery_engine)

# def get_celery_db():
#     """Separate session maker for Celery tasks"""
#     db = CelerySessionLocal()
  
#     try:
#         yield db
#     finally:
#         db.close()