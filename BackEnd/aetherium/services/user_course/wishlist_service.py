from sqlalchemy.orm import Session,joinedload
from aetherium.models.courses import Course
from aetherium.models.user_course import Wishlist
from fastapi import HTTPException

class WishlistService:
    @staticmethod
    def add_to_wishlist(db: Session, user_id: int, course_id: int):
        course = db.query(Course).filter(Course.id == course_id).first()
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
        
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