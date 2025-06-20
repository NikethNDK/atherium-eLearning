from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
from enum import Enum

class CourseStatus(str, Enum):
    DRAFT = "draft"
    PENDING = "pending"
    VERIFIED = "verified"
    REJECTED = "rejected"
    PUBLISHED = "published"
    DISABLED = "disabled"

class CourseCreateStep1(BaseModel):
    title: str = Field(..., max_length=200)
    subtitle: Optional[str] = Field(None, max_length=200)
    category_id: Optional[int] = None
    topic_id: Optional[int] = None
    language: Optional[str] = Field(None, max_length=50)
    level: Optional[str] = None
    duration: Optional[int] = None
    duration_unit: Optional[str] = None

class CourseCreateStep2(BaseModel):
    description: Optional[str] = None
    learning_objectives: List[str] = []
    target_audiences: List[str] = []
    requirements: List[str] = []

class SectionCreate(BaseModel):
    name: str
    lessons: List[dict] = []

class CourseCreateStep3(BaseModel):
    sections: List[SectionCreate] = []

class CourseCreateStep4(BaseModel):
    price: Optional[float] = None
    welcome_message: Optional[str] = None
    congratulation_message: Optional[str] = None
    co_instructor_ids: List[int] = []

class CourseStatusUpdate(BaseModel):
    status: str

class CourseReviewRequest(BaseModel):
    status: str
    admin_response: Optional[str] = None

class CourseResponse(BaseModel):
    id: int
    title: Optional[str]
    subtitle: Optional[str]
    category_id: Optional[int]
    topic_id: Optional[int]
    language: Optional[str]
    level: Optional[str]
    duration: Optional[int]
    duration_unit: Optional[str]
    description: Optional[str]
    cover_image: Optional[str]
    trailer_video: Optional[str]
    price: Optional[float]
    instructor_id: int
    verification_status: str
    is_published: bool
    admin_response: Optional[str]
    welcome_message: Optional[str]
    congratulation_message: Optional[str]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    model_config = ConfigDict(from_attributes=True)
