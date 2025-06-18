from pydantic import BaseModel, Field,ConfigDict
from typing import Optional

class CategoryCreate(BaseModel):
    name: str = Field(..., max_length=100)
    description: Optional[str] = None

class CategoryResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]

    model_config = ConfigDict(from_attributes=True)