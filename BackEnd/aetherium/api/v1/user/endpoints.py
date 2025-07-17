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

router = APIRouter(prefix="/user", tags=["user"])

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
    return PurchaseService.purchase_course(
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
@router.post("/courses/{course_id}/reviews", response_model=CourseReviewResponse)
async def create_course_review(
    course_id: int,
    review_data: CourseReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.name != "user":
        raise HTTPException(status_code=403, detail="User access required")
    review_data.course_id = course_id
    return ReviewService.create_course_review(db, current_user.id, review_data)

@router.get("/courses/{course_id}/reviews")
async def get_course_reviews(
    course_id: int,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    return ReviewService.get_course_reviews(db, course_id, page, limit)

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


@router.post("/payment/create-razorpay-order", response_model=RazorpayOrderResponse)
async def create_razorpay_order(order_data: RazorpayOrderCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        # Fetch course details
        course = db.query(Course).filter(Course.id == order_data.course_id).first()
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
        
        # Calculate subtotal (base price)
        subtotal = course.discount_price if course.discount_price else course.price
        
        if subtotal <= 0:
            raise HTTPException(status_code=400, detail="Invalid course price")
        
        # Calculate tax (18% GST)
        tax_amount = subtotal * 0.18
        
        # Calculate total amount (subtotal + tax)
        total_amount = subtotal + tax_amount
        
        # Create receipt
        receipt = f"course_{course.id}_user_{current_user.id}"
        
        # Create Razorpay order with total amount
        razorpay_order = razorpay_service.create_order(
            amount=total_amount,
            receipt=receipt
        )
        
        # Create purchase record with updated amounts
        purchase = razorpay_service.create_purchase_record_safe(
            db=db,
            user_id=current_user.id,
            course_id=course.id,
            subtotal=subtotal,
            tax_amount=tax_amount,
            total_amount=total_amount,
            order_id=razorpay_order['id'],
            status=PurchaseStatus.PENDING
        )
        
        logger.info(f"Order created successfully: {razorpay_order['id']} for user {current_user.id}")
        
        return RazorpayOrderResponse(
            order_id=razorpay_order['id'],
            amount=razorpay_order['amount'],
            currency=razorpay_order['currency'],
            key_id=razorpay_service.key_id,
            course_id=course.id,
            course_title=course.title,
            user_email=current_user.email,
            user_name=f"{current_user.firstname} {current_user.lastname}",
            subtotal=subtotal,
            tax_amount=tax_amount,
            total_amount=total_amount
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in create_razorpay_order: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to create order. Please try again."
        )


@router.post("/payment/verify-razorpay", response_model=PaymentSuccessResponse)
async def verify_razorpay_payment(payment_data: RazorpayPaymentVerify, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    is_valid = razorpay_service.verify_payment_signature(
        order_id=payment_data.razorpay_order_id,
        payment_id=payment_data.razorpay_payment_id,
        signature=payment_data.razorpay_signature
    )
    
    if not is_valid:
        try:
            razorpay_service.update_purchase_status(
                db=db,
                order_id=payment_data.razorpay_order_id,
                payment_id=payment_data.razorpay_payment_id,
                status=PurchaseStatus.FAILED
            )
        except Exception as e:
            logger.error(f"Failed to update purchase status to FAILED: {e}")
    
        raise HTTPException(status_code=400, detail="Payment verification failed")
    
    purchase = razorpay_service.update_purchase_status(
        db=db,
        order_id=payment_data.razorpay_order_id,
        payment_id=payment_data.razorpay_payment_id,
        status=PurchaseStatus.COMPLETED
    )

    # Get course details to find instructor for wallet distribution
    course = db.query(Course).filter(Course.id == purchase.course_id).first()
    if course:
        # Calculate wallet distribution amounts (excluding tax)
        subtotal = purchase.subtotal  # Amount without tax
        admin_commission = subtotal * 0.10  # 10% to admin
        instructor_amount = subtotal * 0.90  # 90% to instructor
        
        # Distribute funds to wallets
        try:
            # Add to instructor wallet
            wallet_service.add_funds(
                db=db,
                user_id=course.instructor_id,
                amount=instructor_amount,
                description=f"Course sale commission: {course.title}",
                reference_id=purchase.order_id
            )
            
            # Add to admin wallet
            admin_user_id = wallet_service.get_admin_user_id(db)
            wallet_service.add_funds(
                db=db,
                user_id=admin_user_id,
                amount=admin_commission,
                description=f"Platform commission: {course.title}",
                reference_id=purchase.order_id
            )
            
            logger.info(f"Wallet distribution completed for order {purchase.order_id}")
            
        except Exception as wallet_error:
            logger.error(f"Error in wallet distribution: {wallet_error}")
            # Don't fail the payment verification, but log the error
            # You might want to have a retry mechanism or manual processing

    # Remove item from cart
    cart_item = db.query(Cart).filter(Cart.user_id == current_user.id, Cart.course_id == payment_data.course_id).first()
    
    if cart_item:
        db.delete(cart_item)
        db.commit()
    
    return PaymentSuccessResponse(
        success=True,
        message="Payment successful! Course purchased successfully.",
        purchase_id=purchase.id,
        course_id=payment_data.course_id,
        transaction_id=payment_data.razorpay_payment_id
    )


# @router.post("/payment/verify-razorpay",response_model=PaymentSuccessResponse)
# async def verify_razorpay_payment(payment_data:RazorpayPaymentVerify,current_user:User=Depends(get_current_user),db:Session=Depends(get_db)):
#     is_valid = razorpay_service.verify_payment_signature(
#         order_id=payment_data.razorpay_order_id,
#         payment_id=payment_data.razorpay_payment_id,
#         signature=payment_data.razorpay_signature
#     )
    
#     if not is_valid:
#         try:
#             razorpay_service.update_purchase_status(
#                 db=db,
#                 order_id=payment_data.razorpay_order_id,
#                 payment_id=payment_data.razorpay_payment_id,
#                 status=PurchaseStatus.FAILED
#             )
#         except Exception as e:
#             logger.error(f"Failed to update purchase status to FAILED: {e}")
    
#         raise HTTPException(status_code=400, detail="Payment verification failed")
    
#     purchase = razorpay_service.update_purchase_status(
#         db=db,
#         order_id=payment_data.razorpay_order_id,
#         payment_id=payment_data.razorpay_payment_id,
#         status=PurchaseStatus.COMPLETED
#     )

#     cart_item = db.query(Cart).filter(Cart.user_id == current_user.id,Cart.course_id == payment_data.course_id).first()
    
#     if cart_item:
#         db.delete(cart_item)
#         db.commit()
    
#     return PaymentSuccessResponse(
#         success=True,
#         message="Payment successful! Course purchased successfully.",
#         purchase_id=purchase.id,
#         course_id=payment_data.course_id,
#         transaction_id=payment_data.razorpay_payment_id
#     )



##Wallet endpoints to check the balance
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
async def get_course_progress(
    course_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get course progress for current user"""
    service = ProgressService(db)
    progress = service.get_course_progress(current_user.id, course_id)
    
    if not progress:
        raise HTTPException(status_code=404, detail="Course progress not found")
    
    return progress

@router.get("/progress/sections/{section_id}", response_model=SectionProgressResponse)
async def get_section_progress(
    section_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get section progress for current user"""
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

# Analytics endpoints (for instructors/admins)
@router.get("/analytics/courses/{course_id}")
async def get_course_analytics(
    course_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get course analytics (instructor/admin only)"""
    # Add role check here
    # if current_user.role not in ["instructor", "admin"]:
    #     raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    service = ProgressService(db)
    return service.get_course_analytics(course_id)

@router.get("/analytics/courses/{course_id}/students")
async def get_course_student_progress(
    course_id: int,
    limit: int = Query(default=50, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get student progress for a course (instructor/admin only)"""
    # Add role check here
    

    
    # Get paginated student progress
    progress_query = db.query(CourseProgress).filter(
        CourseProgress.course_id == course_id
    ).join(User).offset(offset).limit(limit)
    
    progress_list = progress_query.all()
    
    # Get total count
    total_count = db.query(CourseProgress).filter(
        CourseProgress.course_id == course_id
    ).count()
    
    result = []
    for progress in progress_list:
        user = db.query(User).filter(User.id == progress.user_id).first()
        result.append({
            "user_id": progress.user_id,
            "user_name": user.name if user else "Unknown",
            "user_email": user.email if user else "Unknown",
            "progress_percentage": progress.progress_percentage,
            "is_completed": progress.is_completed,
            "lessons_completed": progress.lessons_completed,
            "total_lessons": progress.total_lessons,
            "last_accessed": progress.last_accessed,
            "completed_at": progress.completed_at
        })
    
    return {
        "students": result,
        "total_count": total_count,
        "page": offset // limit + 1,
        "per_page": limit
    }