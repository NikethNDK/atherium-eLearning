from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from aetherium.database.db import get_db
from aetherium.services.user_service import get_all_users,block_user
from aetherium.utils.jwt_utils import get_current_user
from aetherium.schemas.user import UserResponse
from schemas.category import CategoryCreate, CategoryResponse
from schemas.topic import TopicCreate, TopicResponse
from services.course_service import CourseService
from typing import List
from models.user import User


router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/users", response_model=List[UserResponse])
def list_users(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    users = get_all_users(db)
    return users


@router.post("/users/{user_id}/block", response_model=UserResponse)
def block_user_endpoint(
    user_id: int,
    block: bool,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return block_user(db, user_id, block)


@router.post("/categories", response_model=CategoryResponse)
async def create_category(
    category_data: CategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user.role == "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    return CourseService.create_category(db, category_data)

@router.post("/topics", response_model=TopicResponse)
async def create_topic(
    topic_data: TopicCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user.role == "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    return CourseService.create_topic(db, topic_data)

@router.post("/courses/{course_id}/review")
async def review_course(
    course_id: int,
    status: str,
    admin_response: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user.role == "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    return CourseService.review_course(db, course_id, status, admin_response)