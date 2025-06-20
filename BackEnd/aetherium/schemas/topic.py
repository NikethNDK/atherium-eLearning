from pydantic import BaseModel, Field,ConfigDict
from typing import Optional
from .category import CategoryResponse
class TopicCreate(BaseModel):
    name: str = Field(..., max_length=100)
    category_id: Optional[int] = None
    description: Optional[str] = None

class TopicResponse(BaseModel):
    id: int
    name: str
    category_id: Optional[int]
    description: Optional[str]
    category: Optional[CategoryResponse]

    model_config = ConfigDict(from_attributes=True)