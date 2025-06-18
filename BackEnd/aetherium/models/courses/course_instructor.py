from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from aetherium.database.db import Base

class CourseInstructor(Base):
    __tablename__ = "course_instructors"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    instructor_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    course = relationship("Course", back_populates="co_instructors")
    instructor = relationship("User")