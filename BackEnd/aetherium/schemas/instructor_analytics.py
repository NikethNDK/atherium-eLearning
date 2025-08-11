from datetime import date, datetime
from typing import List
from pydantic import BaseModel

class CourseAnalyticsResponse(BaseModel):
    total_students: int
    total_revenue: float
    total_tax: float
    total_income: float
    average_progress: float

class PurchaseStatItem(BaseModel):
    date: date
    count: int
    revenue: float

class PurchaseStatsResponse(BaseModel):
    stats: List[PurchaseStatItem]
    period: str  # 'daily', 'weekly', 'monthly', 'yearly'

class StudentProgressResponse(BaseModel):
    user_id: int
    firstname: str
    lastname: str
    email: str
    progress: float  # percentage
    joined_at: datetime