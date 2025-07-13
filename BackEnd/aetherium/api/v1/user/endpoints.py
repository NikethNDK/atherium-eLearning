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
from aetherium.models import User
from aetherium.models.courses import Course,Section
from aetherium.models.user_course import Purchase,Cart

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

@router.post("/payment/create-razorpay-order",response_model=RazorpayOrderResponse)
async def create_razorpay_order(order_data:RazorpayOrderCreate,current_user:User=Depends(get_current_user),db:Session=Depends(get_db)):
    course=db.query(Course).filter(Course.id==order_data.course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    exsisting_purchase=db.query(Purchase).filter(
        Purchase.course_id==order_data.course_id,
        Purchase.user_id==current_user.id,
        Purchase.status==PurchaseStatus.COMPLETED).first()
    
    if exsisting_purchase:
        raise HTTPException(status_code=400,detail="Course Already Purchased")
    
    amount=course.discount_price if course.discount_price else course.price
    reciept=f"course_{course.id}_user_{current_user.id}"
    razorpay_order=razorpay_service.create_order(amount=amount,receipt=reciept)

    razorpay_service.create_purchase_record(
        db=db,
        user_id=current_user.id,
        course_id=course.id,
        amount=amount,
        order_id=razorpay_order['id'],
        status=PurchaseStatus.PENDING
    )

    return RazorpayOrderResponse(
        order_id=razorpay_order['id'],
        amount=razorpay_order['amount'],
        currency=razorpay_order['currency'],
        key_id=razorpay_service.key_id,
        course_id=course.id,
        course_title=course.title,
        user_email=current_user.email,
        user_name=f"{current_user.firstname}{current_user.lastname}"
    )

@router.post("/payment/verify-razorpay",response_model=PaymentSuccessResponse)
async def verify_razorpay_payment(payment_data:RazorpayPaymentVerify,current_user:User=Depends(get_current_user),db:Session=Depends(get_db)):
    is_valid = razorpay_service.verify_payment_signature(
        order_id=payment_data.razorpay_order_id,
        payment_id=payment_data.razorpay_payment_id,
        signature=payment_data.razorpay_signature
    )
    
    if not is_valid:
        razorpay_service.update_purchase_status(db=db,order_id=payment_data.razorpay_order_id,payment_id=payment_data.razorpay_payment_id,status=PurchaseStatus.FAILED)
        raise HTTPException(status_code=400,detail="Payment verification failed")
    
    purchase = razorpay_service.update_purchase_status(
        db=db,
        order_id=payment_data.razorpay_order_id,
        payment_id=payment_data.razorpay_payment_id,
        status=PurchaseStatus.COMPLETED
    )

    cart_item = db.query(Cart).filter(Cart.user_id == current_user.id,Cart.course_id == payment_data.course_id).first()
    
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