from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, Text, DateTime, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from aetherium.database.db import Base
from aetherium.models.enum import (
    VerificationStatus, CourseLevel, DurationUnit,
    verification_status_enum, course_level_enum, duration_unit_enum
)

class Course(Base):
    __tablename__ = 'courses'
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=True)
    subtitle = Column(String(200), nullable=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    topic_id = Column(Integer, ForeignKey("topics.id"), nullable=True)
    language = Column(String(50), nullable=True)

    level = Column(course_level_enum, nullable=True)
    duration = Column(Integer, nullable=True)
    duration_unit = Column(duration_unit_enum, nullable=True)
    verification_status = Column(verification_status_enum, default=VerificationStatus.PENDING,nullable=False)
    description = Column(Text, nullable=True)
    cover_image = Column(String(255), nullable=True)
    trailer_video = Column(String(255), nullable=True)
    price = Column(Float, nullable=True)
    discount_price = Column(Float, nullable=True)
    instructor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    is_published = Column(Boolean, default=False)
    admin_response = Column(Text, nullable=True)
    welcome_message = Column(Text, nullable=True)
    congratulation_message = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    curriculum_complete=Column(Boolean,default=False)

    # Relationships
    category = relationship("Category", back_populates="courses")
    topic = relationship("Topic", back_populates="courses")
    instructor = relationship("User", back_populates="courses")
    sections = relationship("Section", back_populates="course", cascade="all, delete-orphan")
    learning_objectives = relationship("LearningObjective", back_populates="course", cascade="all, delete-orphan")
    target_audiences = relationship("TargetAudience", back_populates="course", cascade="all, delete-orphan")
    requirements = relationship("Requirement", back_populates="course", cascade="all, delete-orphan")
    co_instructors = relationship("CourseInstructor", back_populates="course", cascade="all, delete-orphan")
    purchases = relationship("Purchase", back_populates="course")
    cart_items = relationship("Cart", back_populates="course")
    wishlist_items = relationship("Wishlist", back_populates="course")
    course_progress = relationship("CourseProgress", back_populates="course")
    course_reviews = relationship("CourseReview", back_populates="course")

    

__all__ = ["Course"]