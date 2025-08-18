from fastapi import APIRouter, Depends, HTTPException, Query
from aetherium.schemas.course_review import (
    CourseReviewResponse, CourseReviewCreate, CourseReviewsListResponse
)
from sqlalchemy.orm import Session
from aetherium.database.db import get_db
from aetherium.utils.jwt_utils import get_current_user
from aetherium.models.user import User
from aetherium.services.user_course.review_service import ReviewService
from aetherium.core.logger import logger

router = APIRouter()

@router.post('/courses/{course_id}/reviews', response_model=CourseReviewResponse)
async def create_review(
    course_id: int,
    review_data: CourseReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new course review"""
    logger.info("Request received at the endpoint reviews")
    if review_data.course_id != course_id:
        raise HTTPException(status_code=400, detail="Course ID mismatch")
    
    review = ReviewService.create_course_review(db, current_user.id, review_data)
    return review

@router.get('/courses/{course_id}/reviews', response_model=CourseReviewsListResponse)
async def get_course_reviews(
    course_id: int,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """Get course reviews with pagination"""
    logger.info(f"Request received for course {course_id} reviews, page {page}")
    return ReviewService.get_course_reviews(db, course_id, page, limit)
