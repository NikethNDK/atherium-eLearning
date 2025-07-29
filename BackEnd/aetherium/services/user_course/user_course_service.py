from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_,func,desc
from aetherium.models.courses import Course, VerificationStatus, Section,Category
from aetherium.models.user import User
# from aetherium.models.user_course import Purchase,PurchaseStatus
from aetherium.models.user_course import Cart, Purchase, Wishlist,CourseReview, PurchaseStatus, PaymentMethod
from aetherium.schemas.user_course import CourseFilters,CourseResponse,InstructorResponse,CategoryResponse,CourseProgressUpdate,CourseReviewCreate
from aetherium.models.courses.progress import CourseProgress
from aetherium.models.user_course import CourseReview
from fastapi import HTTPException
from typing import Optional,Dict
import uuid
from datetime import datetime,timezone
from aetherium.models.courses.lesson import Lesson

class UserCourseService:
    @staticmethod
    def get_published_courses(db: Session, filters: CourseFilters) ->Dict:
        # query = db.query(Course).options(
        #     joinedload(Course.instructor),
        #     joinedload(Course.category),
        #     joinedload(Course.topic)
        # ).filter(
        #     Course.is_published == True,
        #     Course.verification_status == VerificationStatus.VERIFIED
        # )
        query = db.query(Course).filter(Course.is_published.is_(True))
        if filters.search:
            search_term = f"%{filters.search}%"
            query = query.filter(
                or_(
                    Course.title.ilike(search_term),
                    Course.description.ilike(search_term)
                )
            )
        
        if filters.category:
            query = query.filter(Course.category_id == filters.category)
        if filters.level:
            query = query.filter(Course.level == filters.level)
        if filters.language:
            query = query.filter(Course.language == filters.language)
        
        # offset = (filters.page - 1) * filters.limit
        # total_courses = query.count()
        # courses = query.offset(offset).limit(filters.limit).all()
        # Calculate total items and pages
        total_items = query.count()
        total_pages = (total_items + filters.limit - 1) // filters.limit

        paginated_query = query.offset((filters.page - 1) * filters.limit).limit(filters.limit)

        # NOW execute the query to get the actual courses
        courses = paginated_query.all()
        
        course_responses = []
      
        for course in courses:
            # Fetch instructor and category
            instructor = db.query(User).filter(User.id == course.instructor_id).first()
            category = db.query(Category).filter(Category.id == course.category_id).first()

            course_response = CourseResponse(
                id=course.id,
                title=course.title,
                subtitle=course.subtitle,
                description=course.description,
                price=course.price,
                discount_price=course.discount_price,
                cover_image=course.cover_image,
                category=CategoryResponse(id=category.id, name=category.name) if category else None,
                instructor=InstructorResponse(
                    id=instructor.id,
                    firstname=instructor.firstname,
                    lastname=instructor.lastname,
                    profile_picture=instructor.profile_picture,
                    title=instructor.title,
                    # bio=instructor.bio
                ) if instructor else None,
                level=course.level,
                language=course.language,
                duration=course.duration,
                duration_unit=course.duration_unit,
                # rating=course.rating,
                # num_reviews=course.num_reviews,
                # num_students=course.num_students,
                created_at=course.created_at,
                updated_at=course.updated_at,
                # status=course.status
            )
            course_responses.append(course_response)

        return {
            "courses": course_responses,
            "total_pages": total_pages,
            "current_page": filters.page,
            "total_items": total_items
        }
    
    @staticmethod
    def get_course_details(db: Session, course_id: int, user_id: Optional[int] = None):
        course = db.query(Course).options(
            joinedload(Course.instructor),
            joinedload(Course.category),
            joinedload(Course.topic),
            joinedload(Course.learning_objectives),
            joinedload(Course.target_audiences),
            joinedload(Course.requirements)
        ).filter(
            Course.id == course_id,
            Course.is_published == True,
            Course.verification_status == VerificationStatus.VERIFIED
        ).first()
        
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
        
        # Check purchase status
        is_purchased = False
        if user_id:
            purchase = db.query(Purchase).filter(
                Purchase.user_id == user_id,
                Purchase.course_id == course_id,
                Purchase.status == PurchaseStatus.COMPLETED
            ).first()
            is_purchased = purchase is not None
        
        # Only include sections and lessons if purchased
        if is_purchased:
            course.sections = db.query(Section).options(
                joinedload(Section.lessons).joinedload(Lesson.lesson_content)
            ).filter(Section.course_id == course_id).all()
        else:
            course.sections = []
        
        return course
    
    
    @staticmethod
    def check_course_purchase(db: Session, user_id: int, course_id: int):
        """Check if user has purchased the course"""
        purchase = db.query(Purchase).filter(
            Purchase.user_id == user_id,
            Purchase.course_id == course_id,
            Purchase.status == PurchaseStatus.COMPLETED
        ).first()
        
        return {
            "is_purchased": purchase is not None,
            "purchase_date": purchase.purchased_at if purchase else None
        }
    
    # Cart Operations
    @staticmethod
    def add_to_cart(db: Session, user_id: int, course_id: int):
        course = db.query(Course).filter(
            Course.id == course_id,
            Course.is_published == True
        ).first()
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
        
        # Check if already purchased
        existing_purchase = db.query(Purchase).filter(
            Purchase.user_id == user_id,
            Purchase.course_id == course_id,
            Purchase.status == PurchaseStatus.COMPLETED
        ).first()
        if existing_purchase:
            raise HTTPException(status_code=400, detail="Course already purchased")
        
        # Check if already in cart
        existing_cart_item = db.query(Cart).filter(
            Cart.user_id == user_id,
            Cart.course_id == course_id
        ).first()
        if existing_cart_item:
            raise HTTPException(status_code=400, detail="Course already in cart")
        
        cart_item = Cart(user_id=user_id, course_id=course_id)
        db.add(cart_item)
        db.commit()
        db.refresh(cart_item)
        return cart_item
    
    @staticmethod
    def get_cart(db: Session, user_id: int):
        """Get user's cart items"""
        cart_items = db.query(Cart).options(
            joinedload(Cart.course).joinedload(Course.instructor)
        ).filter(Cart.user_id == user_id).all()
        
        total_amount = sum(
            item.course.discount_price or item.course.price or 0 
            for item in cart_items
        )
        
        return {
            "items": cart_items,
            "total_items": len(cart_items),
            "total_amount": total_amount
        }
    
    @staticmethod
    def remove_from_cart(db: Session, user_id: int, course_id: int):
        cart_item = db.query(Cart).filter(
            Cart.user_id == user_id,
            Cart.course_id == course_id
        ).first()
        
        if not cart_item:
            raise HTTPException(status_code=404, detail="Item not found in cart")
        
        db.delete(cart_item)
        db.commit()
        return {"message": "Item removed from cart"}
    
    # Purchase Operations
    @staticmethod
    def purchase_course(db: Session, user_id: int, course_id: int, payment_method: PaymentMethod):
        course = db.query(Course).filter(
            Course.id == course_id,
            Course.is_published == True
        ).first()
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
        
        # Check if already purchased
        existing_purchase = db.query(Purchase).filter(
            Purchase.user_id == user_id,
            Purchase.course_id == course_id,
            Purchase.status == PurchaseStatus.COMPLETED
        ).first()
        if existing_purchase:
            raise HTTPException(status_code=400, detail="Course already purchased")
        
        # Calculate amount
        amount = course.discount_price or course.price or 0
        
        # Create purchase record
        purchase = Purchase(
            user_id=user_id,
            course_id=course_id,
            amount=amount,
            payment_method=payment_method,
            status=PurchaseStatus.COMPLETED,  
            transaction_id=str(uuid.uuid4())
        )
        
        db.add(purchase)
        
        # Remove from cart if exists
        cart_item = db.query(Cart).filter(
            Cart.user_id == user_id,
            Cart.course_id == course_id
        ).first()
        if cart_item:
            db.delete(cart_item)
        
        # Initialize course progress
        progress = CourseProgress(
            user_id=user_id,
            course_id=course_id,
            progress_percentage=0.0,
            is_completed=False
        )
        db.add(progress)
        
        db.commit()
        db.refresh(purchase)
        return purchase
    
    @staticmethod
    def get_user_purchases(db: Session, user_id: int):
        purchases = db.query(Purchase).options(
            joinedload(Purchase.course).joinedload(Course.instructor),
            joinedload(Purchase.course).joinedload(Course.sections)
        ).filter(
            Purchase.user_id == user_id,
            Purchase.status == PurchaseStatus.COMPLETED
        ).order_by(desc(Purchase.purchased_at)).all()
        
        return [purchase.course for purchase in purchases]
    
    # Progress Operations
    @staticmethod
    def update_course_progress(db: Session, user_id: int, course_id: int, progress_data: CourseProgressUpdate):
        """Update course progress"""
        progress = db.query(CourseProgress).filter(
            CourseProgress.user_id == user_id,
            CourseProgress.course_id == course_id
        ).first()
        
        if not progress:
            # Check if user has purchased the course
            purchase = db.query(Purchase).filter(
                Purchase.user_id == user_id,
                Purchase.course_id == course_id,
                Purchase.status == PurchaseStatus.COMPLETED
            ).first()
            if not purchase:
                raise HTTPException(status_code=403, detail="Course not purchased")
            
            progress = CourseProgress(user_id=user_id, course_id=course_id)
            db.add(progress)
        
        # Update progress
        if progress_data.lesson_id is not None:
            progress.lesson_id = progress_data.lesson_id
        if progress_data.progress_percentage is not None:
            progress.progress_percentage = progress_data.progress_percentage
        if progress_data.is_completed is not None:
            progress.is_completed = progress_data.is_completed
            if progress_data.is_completed:
                progress.completed_at = datetime.now(timezone.utc)
        
        progress.last_accessed = datetime.now(timezone.utc)
        
        db.commit()
        db.refresh(progress)
        return progress
    
    @staticmethod
    def get_course_progress(db: Session, user_id: int, course_id: int):
        progress = db.query(CourseProgress).filter(
            CourseProgress.user_id == user_id,
            CourseProgress.course_id == course_id
        ).first()
        
        if not progress:
            return {
                "progress_percentage": 0.0,
                "is_completed": False,
                "last_accessed": None,
                "completed_at": None
            }
        
        return progress
    
    # Review Operations
    @staticmethod
    def create_course_review(db: Session, user_id: int, review_data: CourseReviewCreate):
        """Create a course review"""
        # Check if user has purchased the course
        purchase = db.query(Purchase).filter(
            Purchase.user_id == user_id,
            Purchase.course_id == review_data.course_id,
            Purchase.status == PurchaseStatus.COMPLETED
        ).first()
        
        is_verified = purchase is not None
        
        # Check if review already exists
        existing_review = db.query(CourseReview).filter(
            CourseReview.user_id == user_id,
            CourseReview.course_id == review_data.course_id
        ).first()
        
        if existing_review:
            raise HTTPException(status_code=400, detail="Review already exists")
        
        review = CourseReview(
            user_id=user_id,
            course_id=review_data.course_id,
            rating=review_data.rating,
            review_text=review_data.review_text,
            is_verified_purchase=is_verified
        )
        
        db.add(review)
        db.commit()
        db.refresh(review)
        return review
    
    @staticmethod
    def get_course_reviews(db: Session, course_id: int, page: int = 1, limit: int = 10):
        """Get course reviews with pagination"""
        offset = (page - 1) * limit
        
        reviews = db.query(CourseReview).options(
            joinedload(CourseReview.user)
        ).filter(
            CourseReview.course_id == course_id
        ).order_by(desc(CourseReview.created_at)).offset(offset).limit(limit).all()
        
        total_reviews = db.query(CourseReview).filter(CourseReview.course_id == course_id).count()
        
        # Calculate average rating
        avg_rating = db.query(func.avg(CourseReview.rating)).filter(
            CourseReview.course_id == course_id
        ).scalar() or 0
        
        return {
            "reviews": reviews,
            "total": total_reviews,
            "average_rating": round(float(avg_rating), 1),
            "page": page,
            "limit": limit
        }
    
    # Wishlist Operations
    @staticmethod
    def add_to_wishlist(db: Session, user_id: int, course_id: int):
        # Check if course exists
        course = db.query(Course).filter(Course.id == course_id).first()
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
        
        # Check if already in wishlist
        existing_item = db.query(Wishlist).filter(
            Wishlist.user_id == user_id,
            Wishlist.course_id == course_id
        ).first()
        if existing_item:
            raise HTTPException(status_code=400, detail="Course already in wishlist")
        
        wishlist_item = Wishlist(user_id=user_id, course_id=course_id)
        db.add(wishlist_item)
        db.commit()
        db.refresh(wishlist_item)
        return wishlist_item
    
    @staticmethod
    def get_wishlist(db: Session, user_id: int):
        wishlist_items = db.query(Wishlist).options(
            joinedload(Wishlist.course).joinedload(Course.instructor)
        ).filter(Wishlist.user_id == user_id).all()
        
        return wishlist_items
    
    @staticmethod
    def remove_from_wishlist(db: Session, user_id: int, course_id: int):
        wishlist_item = db.query(Wishlist).filter(
            Wishlist.user_id == user_id,
            Wishlist.course_id == course_id
        ).first()
        
        if not wishlist_item:
            raise HTTPException(status_code=404, detail="Item not found in wishlist")
        
        db.delete(wishlist_item)
        db.commit()
        return {"message": "Item removed from wishlist"}