from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from aetherium.database.db import get_db
from aetherium.services.user_service import get_all_users, block_user
from aetherium.utils.jwt_utils import get_current_user
from aetherium.schemas.user import UserResponse, UserBlockRequest
from aetherium.schemas.category import CategoryCreate, CategoryResponse
from aetherium.schemas.topic import TopicCreate, TopicResponse
from aetherium.schemas.course import CourseResponse, CourseReviewRequest
from aetherium.services.course_service import CourseService
from aetherium.services.admin_service import AdminService
from typing import List
from aetherium.models.user import User
from aetherium.models.courses import Topic, Course

router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/users", response_model=List[UserResponse])
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.name != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return get_all_users(db)

@router.post("/users/{user_id}/block")
def block_user_endpoint(
    user_id: int,
    block_data: UserBlockRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.name != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return block_user(db, user_id, block_data.block)

@router.get("/dashboard/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.name != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return AdminService.get_dashboard_stats(db)

@router.get("/top-instructors")
def get_top_instructors(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.name != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return AdminService.get_top_instructors(db)

@router.get("/categories", response_model=List[CategoryResponse])
def get_categories(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # if current_user.role.name not in ["admin", "instructor"]:
    #     raise HTTPException(status_code=403, detail="Not authorized")
    return CourseService.get_all_categories(db)

@router.post("/categories", response_model=CategoryResponse)
async def create_category(
    category_data: CategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.name != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    return CourseService.create_category(db, category_data)

@router.put("/categories/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_id: int,
    category_data: CategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.name != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    return CourseService.update_category(db, category_id, category_data)

@router.get("/topics", response_model=List[TopicResponse])
def get_all_topics_with_category(db: Session = Depends(get_db)):
    return db.query(Topic).all()

@router.post("/topics", response_model=TopicResponse)
async def create_topic(
    topic_data: TopicCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.name not in ["admin", "instructor"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    return CourseService.create_topic(db, topic_data)

@router.get("/courses", response_model=List[CourseResponse])
async def get_all_courses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.name != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    return CourseService.get_all_courses(db)

@router.get("/courses/pending", response_model=List[CourseResponse])
async def get_pending_courses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.name != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    return CourseService.get_pending_courses(db)

@router.get("/courses/{course_id}", response_model=CourseResponse)
async def get_course_for_review(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.name not in ["admin", "instructor"]:

        raise HTTPException(status_code=403, detail="Not authorized")
    return CourseService.get_course_by_id(db, course_id)

@router.post("/courses/{course_id}/review", response_model=CourseResponse)
async def review_course(
    course_id: int,
    review_data: CourseReviewRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.name != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    return CourseService.review_course(db, course_id, review_data.status, review_data.admin_response)

