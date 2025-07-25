from sqlalchemy.orm import Session,joinedload
from aetherium.models.user_course import CourseReview, Purchase, PurchaseStatus
from aetherium.schemas.user_course import CourseReviewCreate
from fastapi import HTTPException
from sqlalchemy import func

class ReviewService:
    @staticmethod
    def create_course_review(db: Session, user_id: int, review_data: CourseReviewCreate):
        purchase = db.query(Purchase).filter(
            Purchase.user_id == user_id,
            Purchase.course_id == review_data.course_id,
            Purchase.status == PurchaseStatus.COMPLETED
        ).first()
        
        is_verified = purchase is not None
        
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
        offset = (page - 1) * limit
        
        reviews = db.query(CourseReview).options(
            joinedload(CourseReview.user)
        ).filter(
            CourseReview.course_id == course_id
        ).order_by(CourseReview.created_at.desc()).offset(offset).limit(limit).all()
        
        total_reviews = db.query(CourseReview).filter(CourseReview.course_id == course_id).count()
        
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