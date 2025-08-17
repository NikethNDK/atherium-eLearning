from fastapi import APIRouter
from .endpoints import router as endpoints_router
from .course_review import router as review_router

user_router=APIRouter(prefix="/user",tags=["user"])
user_router.include_router(endpoints_router)
user_router.include_router(review_router)

__all__=["user_router"]

