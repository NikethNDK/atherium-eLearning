from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field


class LessonProgressCreate(BaseModel):
    lesson_id: int
    progress_percentage: float = Field(default=0.0, ge=0, le=100)
    time_spent: int = Field(default=0, ge=0)  # Seconds


class LessonProgressUpdate(BaseModel):
    progress_percentage: Optional[float] = Field(default=None, ge=0, le=100)
    time_spent: Optional[int] = Field(default=None, ge=0)
    is_completed: Optional[bool] = None


class LessonProgressResponse(BaseModel):
    id: int
    user_id: int
    lesson_id: int
    is_completed: bool
    progress_percentage: float
    time_spent: int
    last_accessed: datetime
    completed_at: Optional[datetime] = None

    model_config = {
        "from_attributes": True
    }


class SectionProgressResponse(BaseModel):
    id: int
    user_id: int
    section_id: int
    is_completed: bool
    progress_percentage: float
    lessons_completed: int
    total_lessons: int
    last_accessed: datetime
    completed_at: Optional[datetime] = None

    model_config = {
        "from_attributes": True
    }


class CourseProgressResponse(BaseModel):
    id: int
    user_id: int
    course_id: int
    is_completed: bool
    progress_percentage: float
    sections_completed: int
    total_sections: int
    lessons_completed: int
    total_lessons: int
    last_accessed: datetime
    completed_at: Optional[datetime] = None

    model_config = {
        "from_attributes": True
    }
