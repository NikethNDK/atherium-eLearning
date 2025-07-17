from sqlalchemy import Column, Integer, String, ForeignKey, Text, DateTime,UniqueConstraint,Boolean,Float
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from aetherium.database.db import Base

class LessonProgress(Base):
    __tablename__ = "lesson_progress"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=False)
    is_completed = Column(Boolean, default=False)
    progress_percentage = Column(Float, default=0.0)
    time_spent = Column(Integer, default=0)  # Time spent in seconds
    last_accessed = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    __table_args__ = (
        UniqueConstraint('user_id', 'lesson_id', name='unique_user_lesson_progress'),
    )
     
    user = relationship("User", back_populates="lesson_progress")
    lesson = relationship("Lesson", back_populates="lesson_progress")

class SectionProgress(Base):
    __tablename__ = "section_progress"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    section_id = Column(Integer, ForeignKey("sections.id"), nullable=False)
    is_completed = Column(Boolean, default=False)
    progress_percentage = Column(Float, default=0.0)
    lessons_completed = Column(Integer, default=0)
    total_lessons = Column(Integer, default=0)
    last_accessed = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    __table_args__ = (
        UniqueConstraint('user_id', 'section_id', name='unique_user_section_progress'),
    )
    
    user = relationship("User", back_populates="section_progress")
    section = relationship("Section", backref="section_progress")
 
class CourseProgress(Base):
    __tablename__ = "course_progress"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    is_completed = Column(Boolean, default=False)
    progress_percentage = Column(Float, default=0.0)
    sections_completed = Column(Integer, default=0)
    total_sections = Column(Integer, default=0)
    lessons_completed = Column(Integer, default=0)
    total_lessons = Column(Integer, default=0)
    last_accessed = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    __table_args__ = (
        UniqueConstraint('user_id', 'course_id', name='unique_user_course_progress'),
    )
    
    user = relationship("User", back_populates="course_progress")
    course = relationship("Course", back_populates="course_progress")


__all__=['CourseProgress','SectionProgress','LessonProgress']