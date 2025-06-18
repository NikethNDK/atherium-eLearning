from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from aetherium.database.db import Base

class TargetAudience(Base):
    __tablename__ = "target_audiences"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    description = Column(String(200), nullable=False)

    course = relationship("Course", back_populates="target_audiences")