from pydantic import BaseModel, Field, ConfigDict,field_validator
from typing import Optional, List,Union,Dict,Any
from datetime import datetime
from enum import Enum
from aetherium.models.enum import VerificationStatus,CourseLevel,DurationUnit,ContentType
import json
from .lesson import LessonCreate,LessonResponse
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
    level: Optional[CourseLevel] = None
    duration: Optional[int] = None
    duration_unit: Optional[DurationUnit] = None

    model_config = ConfigDict(from_attributes=True)

class CourseCreateStep2(BaseModel):
    description: Optional[str] = None
    learning_objectives: List[str] = []
    target_audiences: List[str] = []
    requirements: List[str] = []


class SectionCreate(BaseModel):
    name: str
    lessons: List[LessonCreate] = []

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

# Enhanced response models
class LearningObjectiveResponse(BaseModel):
    id: int
    description: str
    
    model_config = ConfigDict(from_attributes=True)

class TargetAudienceResponse(BaseModel):
    id: int
    description: str
    
    model_config = ConfigDict(from_attributes=True)

class RequirementResponse(BaseModel):
    id: int
    description: str
    
    model_config = ConfigDict(from_attributes=True)

class SectionResponse(BaseModel):
    id: int
    name: str
    lessons: List[LessonResponse] = []
    
    model_config = ConfigDict(from_attributes=True)

class CategoryResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)

class TopicResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)

class InstructorResponse(BaseModel):
    id: int
    firstname: Optional[str] = None
    lastname: Optional[str] = None
    username: Optional[str] = None
    title: Optional[str] = None
    bio: Optional[str] = None
    profile_picture: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)

class CourseResponse(BaseModel):
    id: int
    title: Optional[str]
    subtitle: Optional[str]
    category_id: Optional[int]
    topic_id: Optional[int]
    language: Optional[str]
    level: Optional[CourseLevel]
    duration: Optional[int]
    duration_unit: Optional[DurationUnit]
    description: Optional[str]
    cover_image: Optional[str]
    trailer_video: Optional[str]
    price: Optional[float]
    instructor_id: int
    verification_status: VerificationStatus
    is_published: bool
    admin_response: Optional[str]
    welcome_message: Optional[str]
    congratulation_message: Optional[str]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    
    learning_objectives: List[LearningObjectiveResponse] = []
    target_audiences: List[TargetAudienceResponse] = []
    requirements: List[RequirementResponse] = []
    sections: List[SectionResponse] = []
    category: Optional[CategoryResponse] = None
    topic: Optional[TopicResponse] = None
    instructor: Optional[InstructorResponse] = None

    model_config = ConfigDict(from_attributes=True)

