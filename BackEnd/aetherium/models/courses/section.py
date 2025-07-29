from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from aetherium.database.db import Base
from sqlalchemy import DateTime, func

class Section(Base):
    __tablename__="sections"

    id=Column(Integer,primary_key=True,index=True)
    name=Column(String(200),nullable=False)
    course_id=Column(Integer,ForeignKey('courses.id'),nullable=False)

    course=relationship("Course",back_populates="sections")
    lessons=relationship("Lesson",back_populates="section",cascade="all, delete-orphan")
    created_at = Column(DateTime(timezone=True), server_default=func.now())