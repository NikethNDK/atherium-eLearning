from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from aetherium.database.db import get_db
from aetherium.utils.jwt_utils import get_current_user
from aetherium.models.user import User
from aetherium.services.user_course_service import UserCourseService
from aetherium.schemas.user_course import *
from aetherium.schemas.course import CourseResponse
from typing import List, Optional

router = APIRouter(prefix="/user", tags=["user"])


@router.get("/courses", response_model=dict)
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
    
    return UserCourseService.check_course_purchase(db, current_user.id, course_id)

# Cart Endpoints
@router.post("/cart/add")
async def add_to_cart(
    cart_item: CartItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.name != "user":
        raise HTTPException(status_code=403, detail="User access required")
    
    return UserCourseService.add_to_cart(db, current_user.id, cart_item.course_id)

@router.get("/cart", response_model=CartResponse)
async def get_cart(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.name != "user":
        raise HTTPException(status_code=403, detail="User access required")
    
    return UserCourseService.get_cart(db, current_user.id)

@router.delete("/cart/remove/{course_id}")
async def remove_from_cart(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.name != "user":
        raise HTTPException(status_code=403, detail="User access required")
    
    return UserCourseService.remove_from_cart(db, current_user.id, course_id)

# Purchase Endpoints
@router.post("/purchase", response_model=PurchaseResponse)
async def purchase_course(
    purchase_data: PurchaseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.name != "user":
        raise HTTPException(status_code=403, detail="User access required")
    
    return UserCourseService.purchase_course(
        db, current_user.id, purchase_data.course_id, purchase_data.payment_method
    )

@router.get("/my-courses", response_model=List[CourseResponse])
async def get_my_courses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.name != "user":
        raise HTTPException(status_code=403, detail="User access required")
    
    return UserCourseService.get_user_purchases(db, current_user.id)

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
    
    return UserCourseService.update_course_progress(db, current_user.id, course_id, progress_data)

@router.get("/courses/{course_id}/progress", response_model=CourseProgressResponse)
async def get_course_progress(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.name != "user":
        raise HTTPException(status_code=403, detail="User access required")
    
    return UserCourseService.get_course_progress(db, current_user.id, course_id)

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
    return UserCourseService.create_course_review(db, current_user.id, review_data)

@router.get("/courses/{course_id}/reviews")
async def get_course_reviews(
    course_id: int,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    return UserCourseService.get_course_reviews(db, course_id, page, limit)

# Wishlist Endpoints
@router.post("/wishlist/add")
async def add_to_wishlist(
    wishlist_item: WishlistItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.name != "user":
        raise HTTPException(status_code=403, detail="User access required")
    
    return UserCourseService.add_to_wishlist(db, current_user.id, wishlist_item.course_id)

@router.get("/wishlist", response_model=List[WishlistItemResponse])
async def get_wishlist(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.name != "user":
        raise HTTPException(status_code=403, detail="User access required")
    
    return UserCourseService.get_wishlist(db, current_user.id)

@router.delete("/wishlist/remove/{course_id}")
async def remove_from_wishlist(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.name != "user":
        raise HTTPException(status_code=403, detail="User access required")
    
    return UserCourseService.remove_from_wishlist(db, current_user.id, course_id)
