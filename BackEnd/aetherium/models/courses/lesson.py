# from sqlalchemy import Column, Integer, String, ForeignKey, Text, DateTime, Enum,JSON
# from sqlalchemy.sql import func
# from sqlalchemy.orm import relationship
# from aetherium.database.db import Base
# from aetherium.models.enum import (ContentType,content_type_enum) 
# class Lesson(Base):
#     __tablename__ = "lessons"

#     id = Column(Integer, primary_key=True, index=True)
#     name = Column(String(200), nullable=False)
#     section_id = Column(Integer, ForeignKey("sections.id"), nullable=False)
#     content_type = Column(content_type_enum, nullable=False)
#     content_url = Column(String(255), nullable=True) 
#     duration = Column(Integer, nullable=True)  
#     description = Column(Text, nullable=True)
#     content_data=Column(Text,nullable=True)
#     order_index=Column(Integer,nullable=True,default=0)
#     assessment=Column(JSON,nullable=True)


#     created_at = Column(DateTime(timezone=True), server_default=func.now())
#     updated_at = Column(DateTime(timezone=True), onupdate=func.now())

#     section = relationship("Section", back_populates="lessons")

from sqlalchemy import Column, Integer, String, ForeignKey, Text, DateTime, Enum,JSON,Boolean,Float
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from aetherium.database.db import Base
from aetherium.models.enum import ContentType,content_type_enum

class Lesson(Base):
    __tablename__ = "lessons"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    section_id = Column(Integer, ForeignKey("sections.id"), nullable=False)
    content_type = Column(content_type_enum, nullable=False)
    duration = Column(Integer, nullable=True)  # Duration in minutes
    description = Column(Text, nullable=True)
    order_index = Column(Integer, nullable=True, default=0)
    is_active = Column(Boolean, default=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    section = relationship("Section", back_populates="lessons")
    lesson_content = relationship("LessonContent", back_populates="lesson", uselist=False, cascade="all, delete-orphan")
    lesson_progress = relationship("LessonProgress", back_populates="lesson", cascade="all, delete-orphan")

class LessonContent(Base):
    __tablename__ = "lesson_contents"
    
    id = Column(Integer, primary_key=True, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=False)
    
    # Text content
    text_content = Column(Text, nullable=True)
    
    # File/Media content
    file_url = Column(String(500), nullable=True)
    file_public_id = Column(String(255), nullable=True)  
    file_type = Column(String(50), nullable=True)  # pdf, video
    file_size = Column(Integer, nullable=True) 
    
    # Video specific
    video_duration = Column(Integer, nullable=True)  # Duration in seconds
    video_thumbnail = Column(String(500), nullable=True)
    
    # Link content
    external_url = Column(String(500), nullable=True)
    link_title = Column(String(200), nullable=True)
    link_description = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    lesson = relationship("Lesson", back_populates="lesson_content")

class Assessment(Base):
    __tablename__ = "assessments"
    
    id = Column(Integer, primary_key=True, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    passing_score = Column(Float, default=70.0)
    time_limit = Column(Integer, nullable=True) 
    max_attempts = Column(Integer, default=3)
    is_active = Column(Boolean, default=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    lesson = relationship("Lesson", backref="assessments")
    questions = relationship("Question", back_populates="assessment", cascade="all, delete-orphan")

class Question(Base):
    __tablename__ = "questions"
    
    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id"), nullable=False)
    question_text = Column(Text, nullable=False)
    options = Column(JSON, nullable=True)  
    correct_answer = Column(JSON, nullable=True)
    points = Column(Float, default=1.0)
    order_index = Column(Integer, default=0)
    
    assessment = relationship("Assessment", back_populates="questions")

__all__ = ["Lesson", "LessonContent", "Assessment", "Question"]