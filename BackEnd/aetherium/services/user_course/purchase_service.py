from sqlalchemy.orm import Session,joinedload
from aetherium.models.courses import Course
from aetherium.models.user_course import Purchase, PurchaseStatus, Cart
from aetherium.models.user_course import CourseProgress
from aetherium.schemas.user_course import PurchaseResponse
from fastapi import HTTPException
import uuid

class PurchaseService:
    @staticmethod
    def purchase_course(db: Session, user_id: int, course_id: int, payment_method: str):
        course = db.query(Course).filter(
            Course.id == course_id,
            Course.is_published == True
        ).first()
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
        
        existing_purchase = db.query(Purchase).filter(
            Purchase.user_id == user_id,
            Purchase.course_id == course_id,
            Purchase.status == PurchaseStatus.COMPLETED
        ).first()
        if existing_purchase:
            raise HTTPException(status_code=400, detail="Course already purchased")
        
        amount = course.discount_price or course.price or 0
        
        purchase = Purchase(
            user_id=user_id,
            course_id=course_id,
            amount=amount,
            payment_method=payment_method,
            status=PurchaseStatus.COMPLETED,
            transaction_id=str(uuid.uuid4())
        )
        
        db.add(purchase)
        
        cart_item = db.query(Cart).filter(
            Cart.user_id == user_id,
            Cart.course_id == course_id
        ).first()
        if cart_item:
            db.delete(cart_item)
        
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
        ).order_by(Purchase.purchased_at.desc()).all()
        
        return [purchase.course for purchase in purchases]
    
    @staticmethod
    def check_course_purchase(db: Session, user_id: int, course_id: int):
        purchase = db.query(Purchase).filter(
            Purchase.user_id == user_id,
            Purchase.course_id == course_id,
            Purchase.status == PurchaseStatus.COMPLETED
        ).first()
        
        return {
            "is_purchased": purchase is not None,
            "purchase_date": purchase.purchased_at if purchase else None
        }