
from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, DateTime, Float, Text, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from aetherium.database.db import Base

from aetherium.models.enum import (
    PurchaseStatus, PaymentMethod,
    purchase_status_enum, payment_method_enum
)

class Purchase(Base):
    __tablename__ = "purchases"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    
    # Updated amount fields
    subtotal = Column(Float, nullable=False)  # Base price without tax
    tax_amount = Column(Float, nullable=False)  # Tax amount (18% GST)
    total_amount = Column(Float, nullable=False)  # Total amount (subtotal + tax)

    amount = Column(Float, nullable=False)
    payment_method = Column(payment_method_enum, nullable=False)
    status = Column(purchase_status_enum, default=PurchaseStatus.PENDING, nullable=False)
    transaction_id = Column(String(100), nullable=True)
    purchased_at = Column(DateTime(timezone=True), server_default=func.now())
    
    __table_args__ = (
        UniqueConstraint('user_id', 'course_id', name='unique_user_course_purchase'),
    )

    user = relationship("User", back_populates="purchases")
    course = relationship("Course", back_populates="purchases")

class Cart(Base):
    __tablename__ = "cart"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    added_at = Column(DateTime(timezone=True), server_default=func.now())
    
    __table_args__ = (
        UniqueConstraint('user_id', 'course_id', name='unique_user_course_cart'),
    )
    
    user = relationship("User", back_populates="cart_items")
    course = relationship("Course", back_populates="cart_items")

class Wishlist(Base):
    __tablename__ = "wishlist"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    added_at = Column(DateTime(timezone=True), server_default=func.now())
    
    __table_args__ = (
        UniqueConstraint('user_id', 'course_id', name='unique_user_course_wishlist'),
    )

    user = relationship("User", back_populates="wishlist_items")
    course = relationship("Course", back_populates="wishlist_items")

# class CourseProgress(Base):
#     __tablename__ = "course_progress"
    
#     id = Column(Integer, primary_key=True, index=True)
#     user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
#     course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
#     lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=True)
#     is_completed = Column(Boolean, default=False)
#     progress_percentage = Column(Float, default=0.0)
#     last_accessed = Column(DateTime(timezone=True), server_default=func.now())
#     completed_at = Column(DateTime(timezone=True), nullable=True)
    
#     __table_args__ = (
#         UniqueConstraint('user_id', 'course_id', name='unique_user_course_progress'),
#     )

#     user = relationship("User", back_populates="course_progress")
#     course = relationship("Course", back_populates="course_progress")
#     lesson = relationship("Lesson", backref="course_progress")

class CourseReview(Base):
    __tablename__ = "course_reviews"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    rating = Column(Integer, nullable=False)
    review_text = Column(Text, nullable=True)
    is_verified_purchase = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    __table_args__ = (
        UniqueConstraint('user_id', 'course_id', name='unique_user_course_review'),
    )
    
    user = relationship("User", back_populates="course_reviews")
    course = relationship("Course", back_populates="course_reviews")

__all__ = [
    "Purchase",
    "Cart", 
    "Wishlist",
    # "CourseProgress",
    "CourseReview"
]