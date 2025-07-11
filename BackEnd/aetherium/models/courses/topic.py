from sqlalchemy import Column, Integer, String, ForeignKey,Text
from sqlalchemy.orm import relationship
from aetherium.database.db import Base

class Topic(Base):
    __tablename__ = "topics"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    description = Column(Text, nullable=True)

    category = relationship("Category")
    courses = relationship("Course", back_populates="topic")