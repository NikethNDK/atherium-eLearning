from sqlalchemy import Column, Integer, String, ForeignKey, Text, DateTime, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from aetherium.database.db import Base
from aetherium.models.enum import (ContentType,content_type_enum) 
class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    section_id = Column(Integer, ForeignKey("sections.id"), nullable=False)
    content_type = Column(content_type_enum, nullable=False)
    content_url = Column(String(255), nullable=True) 
    duration = Column(Integer, nullable=True)  
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    section = relationship("Section", back_populates="lessons")