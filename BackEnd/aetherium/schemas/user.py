from pydantic import BaseModel, EmailStr, Field, field_validator
from pydantic import StringConstraints
from typing import Optional, Annotated, List

NonEmptyStr = Annotated[str, StringConstraints(min_length=1, strip_whitespace=True)]

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    firstname: str
    lastname: str
    password: str
    role_id: int
    title: Optional[str] = None
    designation: Optional[str] = None
    phonenumber: Optional[int] = None
    profile_picture: Optional[str]=None

class UserUpdate(BaseModel):
    firstname: Optional[NonEmptyStr] = None
    lastname: Optional[NonEmptyStr] = None
    title: Optional[NonEmptyStr] = None
    designation: Optional[NonEmptyStr] = None
    phone_number: Optional[int] = None
    # username: Optional[NonEmptyStr] = None
    personal_website: Optional[str] = None
    facebook: Optional[str] = None
    instagram: Optional[str] = None
    linkedin: Optional[str] = None
    whatsapp: Optional[str] = None
    youtube: Optional[str] = None
    date_of_birth: Optional[str] = None
    profile_picture:Optional[str]=None

    @field_validator('firstname', 'lastname') 
    def reject_empty_strings(cls, v):
        if v == "":
            raise ValueError("Field cannot be empty")
        return v

class UserBlockRequest(BaseModel):
    block: bool

# Admin Dashboard Analytics Schemas
class BasicStatsResponse(BaseModel):
    total_users: int
    total_courses: int
    total_instructors: int
    pending_courses: int
    published_courses: int
    average_rating: float
    total_revenue: float
    total_sales: int
    admin_wallet_balance: float

class RevenueDataPoint(BaseModel):
    date: str
    revenue: float
    sales_count: int

class RevenueAnalyticsResponse(BaseModel):
    daily_revenue: List[RevenueDataPoint]
    monthly_revenue: List[RevenueDataPoint]

class CategoryAnalyticsResponse(BaseModel):
    category_id: int
    category_name: str
    course_count: int
    sales_count: int
    revenue: float

class InstructorAnalyticsResponse(BaseModel):
    instructor_id: int
    name: str
    profile_picture: str | None
    course_count: int
    sales_count: int
    revenue: float
    student_count: int
    initials: str

class BestSellingCourseResponse(BaseModel):
    course_id: int
    title: str
    instructor_name: str
    sales_count: int
    revenue: float
    cover_image: str | None
    price: float
    avg_rating: float

class TopInstructorResponse(BaseModel):
    id: int
    name: str
    profile_picture: str | None
    course_count: int
    total_revenue: float
    student_count: int
    initials: str

class ComprehensiveDashboardResponse(BaseModel):
    basic_stats: BasicStatsResponse
    revenue_analytics: RevenueAnalyticsResponse
    category_analytics: List[CategoryAnalyticsResponse]
    instructor_analytics: List[InstructorAnalyticsResponse]
    best_selling_courses: List[BestSellingCourseResponse]
    top_instructors: List[TopInstructorResponse]

class PasswordChange(BaseModel):
    current_password: str
    new_password: str
    confirm_password: str

class RoleResponse(BaseModel):
    id: int
    name: str

    model_config = {
        "from_attributes": True
    }

class UserResponse(UserBase):
    firstname: Optional[str] = None 
    lastname: Optional[str] = None
    # username: Optional[str] = None
    id: int 
    role: RoleResponse
    is_active: bool
    is_emailverified: bool
    title: Optional[str]
    designation: Optional[str]
    phone_number: Optional[int]
    personal_website: Optional[str] = None
    facebook: Optional[str] = None
    instagram: Optional[str] = None
    linkedin: Optional[str] = None
    whatsapp: Optional[str] = None
    youtube: Optional[str] = None
    date_of_birth: Optional[str] = None
    profile_picture: Optional[str] = None

    model_config = {
        "from_attributes": True
    }

class Token(BaseModel):
    access_token: str
    token_type: str

class OTPVerify(BaseModel):
    email: EmailStr
    otp: str

class OTPSend(BaseModel):
    email: EmailStr

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str
    confirm_password: str

class MessageResponse(BaseModel):
    message: str