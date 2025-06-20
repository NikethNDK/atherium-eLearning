from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, Text, DateTime, Float, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from aetherium.database.db import Base
import enum

class VerificationStatus(enum.Enum):
    pending ='pending'
    PENDING ='pending'
    VERIFIED='verified'
    REJECTED='rejected'

class CourseLevel(enum.Enum):
    Beginner="Beginner"
    Intermediate = "Intermediate"
    # INTERMEDIATE="Intermediate"
    EXPERT="Expert"
    ALL_LEVELS="All Levels"

class DurationUnit(enum.Enum):
    hours="hours"
    days="days"

class Course(Base):
    __tablename__='courses'
   

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=True)  
    subtitle = Column(String(200), nullable=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    topic_id = Column(Integer, ForeignKey("topics.id"), nullable=True)
    language = Column(String(50), nullable=True)
    level = Column(Enum(CourseLevel, name="courselevel"), nullable=True)
    duration = Column(Integer, nullable=True)
    duration_unit = Column(Enum(DurationUnit, name="durationunit"), nullable=True)
    description = Column(Text, nullable=True)
    cover_image = Column(String(255), nullable=True)
    trailer_video = Column(String(255), nullable=True)
    price = Column(Float, nullable=True) 
    discount_price = Column(Float, nullable=True)
    instructor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    verification_status = Column(Enum(VerificationStatus, name="verificationstatus"), default=VerificationStatus.PENDING)
    is_published = Column(Boolean, default=False)
    admin_response = Column(Text, nullable=True)
    welcome_message = Column(Text, nullable=True)
    congratulation_message = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    category = relationship("Category", back_populates="courses")
    topic = relationship("Topic", back_populates="courses")
    instructor = relationship("User", back_populates="courses")
    sections = relationship("Section", back_populates="course", cascade="all, delete-orphan")
    learning_objectives = relationship("LearningObjective", back_populates="course", cascade="all, delete-orphan")
    target_audiences = relationship("TargetAudience", back_populates="course", cascade="all, delete-orphan")
    requirements = relationship("Requirement", back_populates="course", cascade="all, delete-orphan")
    co_instructors = relationship("CourseInstructor", back_populates="course", cascade="all, delete-orphan")