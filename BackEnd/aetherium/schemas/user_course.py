from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
from enum import Enum

class PurchaseStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"

class PaymentMethod(str, Enum):
    WALLET = "wallet"
    CARD = "card"
    UPI = "upi"
    NET_BANKING = "net_banking"

# Cart Schemas
class CartItemCreate(BaseModel):
    course_id: int

class CartItemResponse(BaseModel):
    id: int
    course_id: int
    added_at: datetime
    course: Optional[dict] = None
    
    model_config = ConfigDict(from_attributes=True)

class CartResponse(BaseModel):
    items: List[CartItemResponse]
    total_items: int
    total_amount: float

# Purchase Schemas
class PurchaseCreate(BaseModel):
    course_id: int
    payment_method: PaymentMethod = PaymentMethod.WALLET

class PurchaseResponse(BaseModel):
    id: int
    user_id: int
    course_id: int
    amount: float
    payment_method: PaymentMethod
    status: PurchaseStatus
    transaction_id: Optional[str]
    purchased_at: datetime
    course: Optional[dict] = None
    
    model_config = ConfigDict(from_attributes=True)

# Wishlist Schemas
class WishlistItemCreate(BaseModel):
    course_id: int

class WishlistItemResponse(BaseModel):
    id: int
    course_id: int
    added_at: datetime
    course: Optional[dict] = None
    
    model_config = ConfigDict(from_attributes=True)

# Progress Schemas
class CourseProgressUpdate(BaseModel):
    lesson_id: Optional[int] = None
    progress_percentage: Optional[float] = None
    is_completed: Optional[bool] = None

class CourseProgressResponse(BaseModel):
    id: int
    course_id: int
    lesson_id: Optional[int]
    is_completed: bool
    progress_percentage: float
    last_accessed: datetime
    completed_at: Optional[datetime]
    
    model_config = ConfigDict(from_attributes=True)

# Review Schemas
class CourseReviewCreate(BaseModel):
    course_id: int
    rating: int = Field(..., ge=1, le=5)
    review_text: Optional[str] = None

class CourseReviewUpdate(BaseModel):
    rating: Optional[int] = Field(None, ge=1, le=5)
    review_text: Optional[str] = None

class CourseReviewResponse(BaseModel):
    id: int
    user_id: int
    course_id: int
    rating: int
    review_text: Optional[str]
    is_verified_purchase: bool
    created_at: datetime
    updated_at: Optional[datetime]
    user: Optional[dict] = None
    
    model_config = ConfigDict(from_attributes=True)

# Course Filters
class CourseFilters(BaseModel):
    search: Optional[str] = None
    category: Optional[int] = None
    level: Optional[str] = None
    language: Optional[str] = None
    page: Optional[int] = 1
    limit: Optional[int] = 12

class PurchaseStatusCheck(BaseModel):
    is_purchased: bool
    purchase_date: Optional[datetime] = None
