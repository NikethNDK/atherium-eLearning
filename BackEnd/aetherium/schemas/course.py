from pydantic import BaseModel,Field,ConfigDict
from typing import Optional,List
from datetime import datetime
from enum import Enum

class VerificationStatus(str, Enum):
    PENDING = "pending"
    VERIFIED = "verified"
    REJECTED = "rejected"

class CourseLevel(str, Enum):
    BEGINNER = "Beginner"
    INTERMEDIATE = "Intermediate"
    EXPERT = "Expert"
    ALL_LEVELS = "All Levels"

class DurationUnit(str, Enum):
    HOURS = "hours"
    DAYS = "days"

class CourseBase(BaseModel):
    title: str = Field(..., max_length=200)
    subtitle: Optional[str] = Field(None, max_length=200)
    category_id: int
    topic_id: Optional[int] = None
    language: str = Field(..., max_length=50)
    level: CourseLevel
    duration: int
    duration_unit: DurationUnit

# baisic info
class CourseCreateStep1(CourseBase):
    pass

# advancedinfo
class CourseCreateStep2(BaseModel):
    description:Optional[str]=None
    cover_image:Optional[str]=None
    trailer_video:Optional[str]=None
    learning_object:List[str]=Field(...,max_items=8, min_length=1,max_lenght=200)
    target_audiences:List[str]=Field(...,max_items=8,min_length=1,max_length=200)
    requirement:List[str]=Field(...,max_items=8,min_length=1,max_length=200)

# curriculam
class LessonCreate(BaseModel):
    name: str = Field(..., max_length=200)
    content_type: str  
    content_url: Optional[str] = None
    duration: Optional[int] = None
    description: Optional[str] = None

class SectionCreate(BaseModel):
    name: str = Field(..., max_length=200)
    lessons: List[LessonCreate] = []

class CourseCreateStep3(BaseModel):
    sections: List[SectionCreate] = []

class CourseCreateStep4(BaseModel):
    price: float
    welcome_message: Optional[str] = None
    congratulation_message: Optional[str] = None
    co_instructor_ids: List[int] = []

class CourseCreate(CourseBase):
    description: Optional[str] = None
    cover_image: Optional[str] = None
    trailer_video: Optional[str] = None
    price: float
    discount_price: Optional[float] = None
    welcome_message: Optional[str] = None
    congratulation_message: Optional[str] = None
    learning_objectives: List[str] = Field(..., max_items=8, min_length=1)
    target_audiences: List[str] = Field(..., max_items=8, min_length=1)
    requirements: List[str] = Field(..., max_items=8, min_length=1)
    sections: List[SectionCreate] = []
    co_instructor_ids: List[int] = []

class CourseResponse(BaseModel):
    id: int
    title: str
    subtitle: Optional[str]
    category_id: int
    topic_id: Optional[int]
    language: str
    level: CourseLevel
    duration: int
    duration_unit: DurationUnit
    description: Optional[str]
    cover_image: Optional[str]
    trailer_video: Optional[str]
    price: float
    discount_price: Optional[float]
    instructor_id: int
    verification_status: VerificationStatus
    is_published: bool
    admin_response: Optional[str]
    welcome_message: Optional[str]
    congratulation_message: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]
    learning_objectives: List[str]
    target_audiences: List[str]
    requirements: List[str]
    sections: List[dict]  
    co_instructors: List[dict] 

    model_config = ConfigDict(from_attributes=True)