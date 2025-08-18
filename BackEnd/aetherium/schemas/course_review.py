from datetime import datetime
from pydantic import BaseModel,Field,field_validator,ConfigDict
from typing import Optional
from .user import UserResponse

class CourseReviewBase(BaseModel):
    rating:int=Field(...,ge=1,le=5,description="rating must be between 1 and 5")
    review_text:Optional[str]=None

class CourseReviewCreate(CourseReviewBase):
    course_id:int

class CourseReviewUpdate(BaseModel):
    rating:int=Field(...,ge=1,le=5)
    review_text:Optional[str]=None

class CourseReviewResponse(CourseReviewBase):
    id:int
    user_id:int
    course_id:int
    is_verified_purchase:bool
    created_at:datetime
    updated_at:Optional[datetime]=None

    model_config=ConfigDict(from_attributes=True)

class CourseReviewWithUserResponse(CourseReviewBase):
    id:int
    user_id:int
    course_id:int
    is_verified_purchase:bool
    created_at:datetime
    updated_at:Optional[datetime]=None
    user:UserResponse

    model_config=ConfigDict(from_attributes=True)

class CourseReviewsListResponse(BaseModel):
    reviews: list[CourseReviewWithUserResponse]
    total: int
    average_rating: float
    page: int
    limit: int