from sqlalchemy.orm import Session,joinedload
from aetherium.models.courses import Course
from aetherium.models.user_course import Cart, Purchase, PurchaseStatus
from fastapi import HTTPException

class CartService:
    @staticmethod
    def add_to_cart(db: Session, user_id: int, course_id: int):
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