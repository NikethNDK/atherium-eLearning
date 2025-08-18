from aetherium.services.user_course.user_course_service import UserCourseService
from aetherium.services.user_course.cart_service import CartService
from aetherium.services.user_course.purchase_service import PurchaseService
from aetherium.services.user_course.porgress_service import ProgressService
from aetherium.services.user_course.review_service import ReviewService
from aetherium.services.user_course.wishlist_service import WishlistService
from aetherium.services.razorpay_service import *
from fastapi import APIRouter,Query,Depends,HTTPException
from typing import Optional,List
from sqlalchemy.orm import Session,joinedload
from aetherium.database.db import get_db
from aetherium.schemas.user_course import *
from aetherium.schemas.user_course import CourseFilters,CartItemCreate,CartResponse,PurchaseResponse,PurchaseCreate,CourseProgressResponse,CourseProgressUpdate,CourseReviewUpdate,CourseReviewResponse,CourseReviewCreate,WishlistItemCreate,WishlistItemResponse,PaginatedCoursesResponse,OrderHistoryResponse,OrderDetailResponse
from aetherium.schemas.course import CourseResponse
from aetherium.models.enum import PurchaseStatus
from aetherium.models.user import User,WalletTransaction
from aetherium.models.courses import Course,Section
from aetherium.models.user_course import Purchase,Cart
from aetherium.models.courses.progress import CourseProgress
from aetherium.services.progress_service import ProgressService
from aetherium.schemas.progress import (
    LessonProgressUpdate, LessonProgressResponse,
    SectionProgressResponse, CourseProgressResponse
)
from aetherium.services.wallet_service import wallet_service
from aetherium.utils.jwt_utils import get_current_user
from sqlalchemy.sql import func

# router = APIRouter(prefix="/user", tags=["user"])
router=APIRouter()

@router.get("/courses", response_model=PaginatedCoursesResponse)
async def get_published_courses(
    search: Optional[str] = Query(None),
    category: Optional[int] = Query(None),
    level: Optional[str] = Query(None),
    language: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=50),
    db: Session = Depends(get_db)
):
    filters = CourseFilters(
        search=search,
        category=category,
        level=level,
        language=language,
        page=page,
        limit=limit
    )
    return UserCourseService.get_published_courses(db, filters)

@router.get("/courses/{course_id}", response_model=CourseResponse)
async def get_course_details(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return UserCourseService.get_course_details(db, course_id, current_user.id if current_user else None)

@router.get("/courses/{course_id}/purchase-status")
async def check_course_purchase_status(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.name != "user":
        raise HTTPException(status_code=403, detail="User access required")
    return PurchaseService.check_course_purchase(db, current_user.id, course_id)

# Cart Endpoints
@router.post("/cart/add")
async def add_to_cart(
    cart_item: CartItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.name != "user":
        raise HTTPException(status_code=403, detail="User access required")
    return CartService.add_to_cart(db, current_user.id, cart_item.course_id)

@router.get("/cart", response_model=CartResponse)
async def get_cart(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.name != "user":
        raise HTTPException(status_code=403, detail="User access required")
    return CartService.get_cart(db, current_user.id)

@router.delete("/cart/remove/{course_id}")
async def remove_from_cart(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.name != "user":
        raise HTTPException(status_code=403, detail="User access required")
    return CartService.remove_from_cart(db, current_user.id, course_id)

# Purchase Endpoints
@router.post("/purchase", response_model=PurchaseResponse)
async def purchase_course(
    purchase_data: PurchaseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.name != "user":
        raise HTTPException(status_code=403, detail="User access required")
    return await PurchaseService.purchase_course(
        db, current_user.id, purchase_data.course_id, purchase_data.payment_method
    )

@router.get("/my-courses", response_model=List[CourseResponse])
async def get_my_courses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.name != "user":
        raise HTTPException(status_code=403, detail="User access required")
    return PurchaseService.get_user_purchases(db, current_user.id)

# Progress Endpoints
@router.put("/courses/{course_id}/progress", response_model=CourseProgressResponse)
async def update_course_progress(
    course_id: int,
    progress_data: CourseProgressUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.name != "user":
        raise HTTPException(status_code=403, detail="User access required")
    return ProgressService.update_course_progress(db, current_user.id, course_id, progress_data)

@router.get("/courses/{course_id}/progress", response_model=CourseProgressResponse)
async def get_course_progress(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.name != "user":
        raise HTTPException(status_code=403, detail="User access required")
    return ProgressService.get_course_progress(db, current_user.id, course_id)

# Review Endpoints
# @router.post("/courses/{course_id}/reviews", response_model=CourseReviewResponse)
# async def create_course_review(
#     course_id: int,
#     review_data: CourseReviewCreate,
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user)
# ):
#     if current_user.role.name != "user":
#         raise HTTPException(status_code=403, detail="User access required")
#     review_data.course_id = course_id
#     return ReviewService.create_course_review(db, current_user.id, review_data)

# @router.get("/courses/{course_id}/reviews")
# async def get_course_reviews(
#     course_id: int,
#     page: int = Query(1, ge=1),
#     limit: int = Query(10, ge=1, le=50),
#     db: Session = Depends(get_db)
# ):
#     return ReviewService.get_course_reviews(db, course_id, page, limit)

# Wishlist Endpoints
@router.post("/wishlist/add")
async def add_to_wishlist(
    wishlist_item: WishlistItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.name != "user":
        raise HTTPException(status_code=403, detail="User access required")
    return WishlistService.add_to_wishlist(db, current_user.id, wishlist_item.course_id)

@router.get("/wishlist", response_model=List[WishlistItemResponse])
async def get_wishlist(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.name != "user":
        raise HTTPException(status_code=403, detail="User access required")
    return WishlistService.get_wishlist(db, current_user.id)

@router.delete("/wishlist/remove/{course_id}")
async def remove_from_wishlist(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.name != "user":
        raise HTTPException(status_code=403, detail="User access required")
    return WishlistService.remove_from_wishlist(db, current_user.id, course_id)


@router.get("/orders", response_model=List[OrderHistoryResponse])
async def get_order_history(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.name != "user":
        raise HTTPException(status_code=403, detail="User access required")
    
    offset = (page - 1) * limit
    
    orders = db.query(Purchase).options(
        joinedload(Purchase.course).joinedload(Course.instructor),
        joinedload(Purchase.course).joinedload(Course.category)
    ).filter(
        Purchase.user_id == current_user.id,
        Purchase.status == PurchaseStatus.COMPLETED
    ).order_by(Purchase.purchased_at.desc()).offset(offset).limit(limit).all()
    
    return orders

@router.get("/orders/{order_id}", response_model=OrderDetailResponse)
async def get_order_detail(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.name != "user":
        raise HTTPException(status_code=403, detail="User access required")
    
    order = db.query(Purchase).options(
        joinedload(Purchase.course).joinedload(Course.instructor),
        joinedload(Purchase.course).joinedload(Course.category),
        joinedload(Purchase.course).joinedload(Course.sections).joinedload(Section.lessons)
    ).filter(
        Purchase.id == order_id,
        Purchase.user_id == current_user.id
    ).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return order

# Updated endpoints
@router.post("/payment/create-razorpay-order", response_model=RazorpayOrderResponse)
async def create_razorpay_order(
    order_data: RazorpayOrderCreate, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    try:

        order_response = await PurchaseService.create_course_order(
            db=db,
            user_id=current_user.id,
            course_id=order_data.course_id,
            user_email=current_user.email,
            user_firstname=current_user.firstname,
            user_lastname=current_user.lastname,
            purchase_type=order_data.purchase_type
        )
        
        logger.info(f"Order created successfully: {order_response.order_id} for user {current_user.id}")
        return order_response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in create_razorpay_order: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to create order. Please try again."
        )

@router.post("/payment/verify-razorpay", response_model=PaymentSuccessResponse)
async def verify_razorpay_payment(
    payment_data: RazorpayPaymentVerify, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    try:
        
        result = await PurchaseService.verify_payment_and_complete_purchase(
            db=db,
            payment_data=payment_data,
            user_id=current_user.id
        )
        
        return PaymentSuccessResponse(
            success=True,
            message="Payment successful! Course(s) purchased successfully.",
            purchase_ids=result["purchase_ids"],
            course_ids=result["course_ids"],
            transaction_id=result["transaction_id"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in verify_razorpay_payment: {e}")
        raise HTTPException(
            status_code=500,
            detail="Payment verification failed. Please try again."
        )


##Wallet endpoints 
@router.get("/wallet/balance")
async def get_wallet_balance(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    wallet = wallet_service.get_or_create_wallet(db, current_user.id)
    return {"balance": wallet.balance, "updated_at": wallet.updated_at}

@router.get("/wallet/transactions")
async def get_wallet_transactions(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    wallet = wallet_service.get_or_create_wallet(db, current_user.id)
    transactions = db.query(WalletTransaction).filter(
        WalletTransaction.wallet_id == wallet.id
    ).order_by(WalletTransaction.created_at.desc()).limit(50).all()
    
    return {"transactions": transactions}

@router.get("/progress/courses", response_model=List[CourseProgressResponse])
async def get_user_course_progress(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get all course progress for current user"""
    service = ProgressService(db)
    return service.get_user_course_progress_summary(current_user.id)



@router.get("/progress/courses/{course_id}", response_model=CourseProgressResponse)
async def get_course_progress(course_id: int,db: Session = Depends(get_db),current_user = Depends(get_current_user)
):
    """Get course progress for current user"""
    service = ProgressService(db)
    progress = service.get_course_progress(current_user.id, course_id)
    
    if not progress:
        raise HTTPException(status_code=404, detail="Course progress not found")
    
    return progress


"""Get section progress for current user"""
@router.get("/progress/sections/{section_id}", response_model=SectionProgressResponse)
async def get_section_progress(section_id: int,db: Session = Depends(get_db),current_user = Depends(get_current_user)):

    service = ProgressService(db)
    progress = service.get_section_progress(current_user.id, section_id)
    
    if not progress:
        raise HTTPException(status_code=404, detail="Section progress not found")
    
    return progress

@router.get("/progress/lessons/{lesson_id}", response_model=LessonProgressResponse)
async def get_lesson_progress(
    lesson_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get lesson progress for current user"""
    service = ProgressService(db)
    progress = service.get_lesson_progress(current_user.id, lesson_id)
    
    if not progress:
        raise HTTPException(status_code=404, detail="Lesson progress not found")
    
    return progress

@router.post("/progress/lessons/{lesson_id}", response_model=LessonProgressResponse)
async def update_lesson_progress(
    lesson_id: int,
    progress_data: LessonProgressUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Update lesson progress for current user"""
    service = ProgressService(db)
    return await service.update_lesson_progress(
        current_user.id, lesson_id, progress_data
    )

@router.post("/progress/lessons/{lesson_id}/complete")
async def complete_lesson(
    lesson_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Mark lesson as completed"""
    service = ProgressService(db)
    progress_update = LessonProgressUpdate(
        progress_percentage=100.0,
        is_completed=True
    )
    
    return await service.update_lesson_progress(
        current_user.id, lesson_id, progress_update
    )

from aetherium.schemas.user_course import CertificateEligibilityResponse
from aetherium.models.courses.progress import CourseProgress

@router.get("/verify-certificate/{course_id}",response_model=CertificateEligibilityResponse)
def verify_certificate_generation(course_id:int,db:Session=Depends(get_db),current_user=Depends(get_current_user)):
    
    #check if user purchased the coures
    purchase_history=db.query(Purchase).filter(
        Purchase.course_id==course_id,
        Purchase.user_id==current_user.id).first()
    
    if not purchase_history:
        raise HTTPException(status_code=403,detail="Course not purchased")
    
    course_progress=db.query(CourseProgress).filter(
        CourseProgress.course_id==course_id,
        CourseProgress.user_id==current_user.id).first()

    if not course_progress:
        raise HTTPException(status_code=404,detail="Course progress not found")
    
    
    if not (course_progress.is_completed or course_progress.progress_percentage==100):
        raise HTTPException(status_code=403,detail="Course not completed")
    
    course=db.query(Course).options(
        joinedload(Course.instructor)).filter(Course.id==course_id).first()  
    
    return CertificateEligibilityResponse(
        eligible=True,
        first_name=current_user.firstname,
        last_name=current_user.lastname,
        course_title=course.title,
        instructor_firstname=course.instructor.firstname,
        instructor_lastname=course.instructor.lastname,
        completion_date=course_progress.completed_at
    )

@router.post("/progress/lessons/{lesson_id}/time")
async def update_lesson_time(
    lesson_id: int,
    time_spent: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Update time spent on lesson"""
    service = ProgressService(db)
    progress_update = LessonProgressUpdate(time_spent=time_spent)
    
    return await service.update_lesson_progress(
        current_user.id, lesson_id, progress_update
    )

