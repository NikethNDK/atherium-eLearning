from pydantic import BaseModel, Field, ConfigDict,field_validator
from typing import Optional, List,Union,Dict,Any
from datetime import datetime
from enum import Enum
from aetherium.models.enum import VerificationStatus,CourseLevel,DurationUnit,ContentType
import json
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

class LessonCreate(BaseModel):
    name:str
    content_type:ContentType
    content_url:Optional[str]=None
    # duration:Optional[Union[int,str]]
    duration: Optional[int] = None
    description:Optional[str]=None
    content_data:Optional[str]=None
    order_index:Optional[int]=0
    assessment:Optional[Dict[str,Any]]=None
    
    @field_validator('content_type', mode='before')
    @classmethod
    def validate_content_type(cls, v):
        if v is None or v == "":
            raise ValueError("content_type is required")
        if isinstance(v, str):
            try:
                return ContentType(v)
            except ValueError:
                raise ValueError(f"Invalid content_type: {v}")
        return v

    @field_validator('duration', mode='before')
    @classmethod
    def parse_duration(cls, v):
        if v is None or v == "":
            return None
        if isinstance(v, str):
            try:
                return int(v) if v.strip() else None
            except ValueError:
                return None
        return v

    @field_validator('content_data', mode='before')
    @classmethod
    def parse_content_data(cls, v):
        if v is None:
            return None
        if isinstance(v, dict):
            import json
            return json.dumps(v)
        return str(v)

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

# class LessonResponse(BaseModel):
#     id: int
#     name: str
#     duration: Optional[int] = None
    
#     model_config = ConfigDict(from_attributes=True)

class LessonResponse(BaseModel):
    id: int
    name: str
    content_type: ContentType
    content_url: Optional[str] = None
    duration: Optional[int] = None
    description: Optional[str] = None
    content_data: Optional[str] = None
    order_index: int
    is_published: bool = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    assessment: Optional[Dict[str, Any]] = None
    
    @field_validator('content_data', mode='before')
    @classmethod
    def serialize_content_data(cls, v):
        if v is None:
            return None
        if isinstance(v, dict):
            return json.dumps(v)
        return str(v)
    
    @field_validator('assessment', mode='before')
    @classmethod
    def serialize_assessment(cls, v):
        if v is None:
            return None
        if isinstance(v, str):
            try:
                return json.loads(v)
            except json.JSONDecodeError:
                return None
        return v
    
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



#     # ***********************************************

# from pydantic import BaseModel, root_validator, ValidationError
# from typing import Optional, Union, List, Dict, Any


# # Content Type Models
# class TextContent(BaseModel):
#     text: str


# class VideoContent(BaseModel):
#     url: str
#     length: Optional[int]


# class QuizContent(BaseModel):
#     questions: List[Dict[str, Any]]


# # LessonCreate Model
# class LessonCreateModel(BaseModel):
#     name: str
#     content_type: str
#     description: Optional[str]
#     duration: Optional[Union[int, str]]
#     order_index: Optional[int] = 0
#     assessment: Optional[Dict[str, Any]] = None
#     content: Dict[str, Any]  # Raw input from frontend

#     # This will be dynamically created based on content_type
#     parsed_content: Optional[Union[TextContent, VideoContent, QuizContent]] = None

#     @root_validator(pre=True)
#     def validate_content_by_type(cls, values):
#         content_type = values.get("content_type")
#         content = values.get("content")

#         if content_type == "TEXT":
#             try:
#                 values["parsed_content"] = TextContent(**content)
#             except ValidationError as e:
#                 raise ValueError(f"Invalid TEXT content: {e}")

#         elif content_type == "VIDEO":
#             try:
#                 values["parsed_content"] = VideoContent(**content)
#             except ValidationError as e:
#                 raise ValueError(f"Invalid VIDEO content: {e}")

#         elif content_type == "QUIZ":
#             try:
#                 values["parsed_content"] = QuizContent(**content)
#             except ValidationError as e:
#                 raise ValueError(f"Invalid QUIZ content: {e}")

#         else:
#             raise ValueError(f"Unsupported content_type: {content_type}")

#         return values


