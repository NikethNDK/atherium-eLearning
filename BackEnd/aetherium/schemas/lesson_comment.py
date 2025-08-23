from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field

class LessonCommentBase(BaseModel):
    content: str = Field(..., min_length=1, max_length=1000)

class LessonCommentCreate(LessonCommentBase):
    lesson_id: int
    parent_comment_id: Optional[int] = None

class LessonCommentUpdate(BaseModel):
    content: str = Field(..., min_length=1, max_length=1000)

class LessonCommentResponse(LessonCommentBase):
    id: int
    lesson_id: int
    user_id: int
    parent_comment_id: Optional[int] = None
    is_edited: bool
    is_deleted: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    user_firstname: str
    user_lastname: str
    user_profile_picture: Optional[str] = None
    replies: List['LessonCommentResponse'] = []
    
    model_config = {
        "from_attributes": True
    }

class LessonCommentListResponse(BaseModel):
    comments: List[LessonCommentResponse]
    total_count: int
    page: int
    limit: int
    total_pages: int

# Update the forward reference
LessonCommentResponse.model_rebuild()



