from models.imports import *

class ContentType(enum.Enum):
    File=FILE = "file"
    VIDEO = "video"
    CAPTIONS = "captions"
    DESCRIPTION = "description"
    QUIZ = "quiz"
    LECTURE_NOTES = "lecture_notes"


class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    section_id = Column(Integer, ForeignKey("sections.id"), nullable=False)
    content_type = Column(Enum(ContentType), nullable=False)
    content_url = Column(String(255), nullable=True) 
    duration = Column(Integer, nullable=True)  
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    section = relationship("Section", back_populates="lessons")