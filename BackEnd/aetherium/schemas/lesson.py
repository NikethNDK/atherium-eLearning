from typing import Optional, List, Union
from datetime import datetime
from pydantic import BaseModel, Field, field_validator, model_validator
from aetherium.models.enum import ContentType


class LessonContentCreate(BaseModel):
    text_content: Optional[str] = None
    file_url: Optional[str] = None
    file_public_id: Optional[str] = None
    file_type: Optional[str] = None
    file_size: Optional[int] = None
    video_duration: Optional[int] = None
    video_thumbnail: Optional[str] = None
    external_url: Optional[str] = None
    link_title: Optional[str] = None
    link_description: Optional[str] = None


class LessonContentResponse(LessonContentCreate):
    id: int
    lesson_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = {
        "from_attributes": True
    }


class QuestionCreate(BaseModel):
    question_text: str
    options: Optional[List[str]] = None
    correct_answer: Optional[Union[str, List[str], bool]] = None
    points: float = Field(default=1.0, ge=0)
    order_index: int = Field(default=0, ge=0)


class QuestionResponse(QuestionCreate):
    id: int
    assessment_id: int

    model_config = {
        "from_attributes": True
    }


class AssessmentCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = None
    passing_score: float = Field(default=70.0, ge=0, le=100)
    time_limit: Optional[int] = Field(default=None, ge=1)
    max_attempts: int = Field(default=3, ge=1)
    questions: List[QuestionCreate] = Field(default_factory=list)


class AssessmentResponse(BaseModel):
    id: int
    lesson_id: int
    title: str
    description: Optional[str] = None
    passing_score: float
    time_limit: Optional[int] = None
    max_attempts: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    questions: List[QuestionResponse] = []

    model_config = {
        "from_attributes": True
    }


class LessonCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    content_type: ContentType
    duration: Optional[int] = Field(default=None, ge=0)
    description: Optional[str] = None
    order_index: int = Field(default=0, ge=0)
    content: Optional[LessonContentCreate] = None
    assessment: Optional[AssessmentCreate] = None

    @field_validator('content_type', mode='before')
    def validate_content_type(cls, v):
        if v is None or v == "":
            raise ValueError("content_type is required")
        if isinstance(v, str):
            try:
                return ContentType(v)
            except ValueError:
                raise ValueError(f"Invalid content_type: {v}")
        return v

    @model_validator(mode='after')
    def validate_content_and_assessment(self):
        content_type = self.content_type

        if content_type == ContentType.ASSESSMENT:
            if not self.assessment:
                raise ValueError("Assessment data is required for assessment type lessons")
            if self.content is not None:
                raise ValueError("Content must be None for assessment type lessons")
        else:
            if not self.content:
                raise ValueError(f"Content is required for {content_type.value} type lessons")
            if self.assessment is not None:
                raise ValueError("Assessment should not be provided for non-assessment lessons")
        return self


class LessonUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=200)
    duration: Optional[int] = Field(default=None, ge=0)
    description: Optional[str] = None
    order_index: Optional[int] = Field(default=None, ge=0)
    is_active: Optional[bool] = None
    content: Optional[LessonContentCreate] = None
    assessment: Optional[AssessmentCreate] = None


class LessonResponse(BaseModel):
    id: int
    name: str
    section_id: int
    content_type: ContentType
    duration: Optional[int] = None
    description: Optional[str] = None
    order_index: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    lesson_content: Optional[LessonContentResponse] = None
    assessments: List[AssessmentResponse] = []

    model_config = {
        "from_attributes": True
    }
