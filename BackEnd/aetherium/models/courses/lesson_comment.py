from sqlalchemy import Column, Integer, String, ForeignKey, Text, DateTime, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from aetherium.database.db import Base

class LessonComment(Base):
    __tablename__ = "lesson_comments"
    
    id = Column(Integer, primary_key=True, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    parent_comment_id = Column(Integer, ForeignKey("lesson_comments.id"), nullable=True)
    content = Column(Text, nullable=False)
    is_edited = Column(Boolean, default=False)
    is_deleted = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    lesson = relationship("Lesson", back_populates="comments")
    user = relationship("User", back_populates="lesson_comments")
    parent_comment = relationship("LessonComment", remote_side=[id], back_populates="replies")
    replies = relationship("LessonComment", back_populates="parent_comment", cascade="all, delete-orphan")

class LessonCommentEdit(Base):
    __tablename__ = "lesson_comment_edits"
    
    id = Column(Integer, primary_key=True, index=True)
    comment_id = Column(Integer, ForeignKey("lesson_comments.id"), nullable=False)
    previous_content = Column(Text, nullable=False)
    edited_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    comment = relationship("LessonComment")



