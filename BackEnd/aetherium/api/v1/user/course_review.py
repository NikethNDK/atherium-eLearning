from fastapi import APIRouter,Depends,HTTPException
from aetherium.schemas.course_review import CourseReviewResponse,CourseReviewCreate,CourseReviewUpdate
from sqlalchemy.orm import Session
from aetherium.database.db import get_db
from aetherium.utils.jwt_utils import get_current_user
from aetherium.models.user import User
from aetherium.services.user_course.review_service import ReviewService
from aetherium.core.logger import logger
router=APIRouter()

@router.post('/reviews',response_model=CourseReviewResponse)
async def create_review(
    review_data:CourseReviewCreate,
    db:Session=Depends(get_db),
    current_user:User=Depends(get_current_user)
):
    logger.info("Request recived at the endpont reviews")
    review=ReviewService.create_course_review(db,current_user.id,review_data)
    return review


# @router.get('/reviews',response_class=CourseReviewResponse)
# async def get_review(current_user:User=Depends(get_current_user)):
#     return {"message":"Done"}
