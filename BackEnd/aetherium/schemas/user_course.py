from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
from enum import Enum
from aetherium.models.enum import PaymentMethod,PurchaseStatus
# class PurchaseStatus(str, Enum):
#     PENDING = "pending"
#     COMPLETED = "completed"
#     FAILED = "failed"
#     REFUNDED = "refunded"

# class PaymentMethod(str, Enum):
#     WALLET = "wallet"
#     CARD = "card"
#     UPI = "upi"
#     NET_BANKING = "net_banking"

class InstructorResponse(BaseModel):
    id: int
    firstname: str
    lastname: str
    profile_picture: Optional[str]
    title: Optional[str]
    # bio: Optional[str]
    model_config=ConfigDict(from_attributes=True)

class CategoryResponse(BaseModel):
    id: int
    name: str


class CourseResponse(BaseModel):
    id: int
    title: str
    subtitle: Optional[str]
    description: Optional[str]
    price: float
    discount_price: Optional[float]
    cover_image: Optional[str]
    category: Optional[CategoryResponse]
    instructor: Optional[InstructorResponse]
    level: Optional[str]
    language: Optional[str]
    duration: Optional[float]
    duration_unit: Optional[str]
    # rating: Optional[float]
    # num_reviews: Optional[int]
    # num_students: Optional[int]
    created_at: datetime
    updated_at: Optional[datetime]
    # status: str

    class Config:
        from_attributes = True

# Cart Schemas
class CartItemCreate(BaseModel):
    course_id: int

class CartItemResponse(BaseModel):
    id: int
    course_id: int
    added_at: datetime
    course: Optional[CourseResponse] = None
    
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
    course: Optional[CourseResponse] = None
    
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
    progress_percentage: float=0.0
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


# New schema added for user
class CourseFilters(BaseModel):
    search: Optional[str] = None
    category: Optional[int] = None
    level: Optional[str] = None
    language: Optional[str] = None
    page: int = 1
    limit: int = 12



class PaginatedCoursesResponse(BaseModel):
    courses: List[CourseResponse]
    total_pages: int
    current_page: int
    total_items: int



class OrderCourseResponse(BaseModel):
    id: int
    title: str
    subtitle: Optional[str]
    cover_image: Optional[str]
    category: Optional[dict]
    instructor: InstructorResponse
    category: CategoryResponse | None
    
    class Config:
        from_attributes = True

class OrderHistoryResponse(BaseModel):
    id: int
    course: OrderCourseResponse
    total_amount: float
    payment_method: str
    status: str
    transaction_id: str
    purchased_at: datetime
    
    model_config=ConfigDict(from_attributes=True)

class OrderDetailResponse(BaseModel):
    id: int
    course: dict  
    total_amount: float
    payment_method: str
    status: str
    transaction_id: str
    purchased_at: datetime
    
    model_config=ConfigDict(from_attributes=True)
    

class WishlistCourseResponse(BaseModel):
    id: int
    title: str
    subtitle: Optional[str]
    cover_image: Optional[str]
    price: Optional[float]
    discount_price: Optional[float]
    level: Optional[str]
    duration: Optional[int]
    duration_unit: Optional[str]
    instructor: dict
    
    model_config=ConfigDict(from_attributes=True)
    

class WishlistItemResponse(BaseModel):
    id: int
    course: WishlistCourseResponse
    added_at: datetime
    
    model_config=ConfigDict(from_attributes=True)

class RazorpayOrderCreate(BaseModel):
    course_id:int
    payment_method:PaymentMethod=PaymentMethod.CARD

class RazorpayOrderResponse(BaseModel):
    order_id:str
    amount:int
    currency:Optional[str]
    key_id:str
    course_id:int
    course_title:str
    user_email:str
    user_name:Optional[str]
    subtotal: float  
    tax_amount: float  
    total_amount: float

class RazorpayPaymentVerify(BaseModel):
    razorpay_order_id:str
    razorpay_payment_id:str
    razorpay_signature:str
    course_id: int

class PaymentSuccessResponse(BaseModel):
    success:bool
    message:str
    purchase_id:int
    course_id:int
    transaction_id:str


