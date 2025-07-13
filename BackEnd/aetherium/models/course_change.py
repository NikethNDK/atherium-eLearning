from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, Text, DateTime, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from aetherium.database.db import Base
from aetherium.models.enum import verification_status_enum, VerificationStatus

class CourseChangeRequest(Base):
    __tablename__ = "course_change_requests"
    
    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    instructor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    change_type = Column(String(50), nullable=False)  # 'content', 'pricing', 'details'
    original_data = Column(JSON, nullable=True)
    proposed_data = Column(JSON, nullable=False)
    change_description = Column(Text, nullable=True)
    status = Column(verification_status_enum, default=VerificationStatus.PENDING)
    admin_response = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    
    course = relationship("Course")
    instructor = relationship("User")
