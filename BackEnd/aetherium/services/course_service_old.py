from sqlalchemy.orm import Session
from aetherium.models.courses import *
from aetherium.schemas.course import(CourseCreateStep1,CourseCreateStep2,CourseCreateStep3,CourseCreateStep4,CourseResponse)
from aetherium.schemas.category import CategoryCreate,CategoryResponse
from aetherium.schemas.topic import TopicCreate
from fastapi import HTTPException

class CourseService:
    @staticmethod
    def create_or_update_course_step1(db: Session, course_data: CourseCreateStep1, instructor_id: int):
        # print("TEST******************************",course_data,instructor_id)

        course = db.query(Course).filter(Course.instructor_id == instructor_id, Course.is_published == False).first()

        if not course:
            course = Course(
                instructor_id=instructor_id,
                verification_status=VerificationStatus.pending.value,
                title = course_data.title ,
                subtitle = course_data.subtitle ,
                category_id = course_data.category_id ,
                topic_id = course_data.topic_id ,
                language = course_data.language ,
                level = course_data.level ,
                duration = course_data.duration ,
                duration_unit = course_data.duration_unit ,
            )
            db.add(course)
            db.commit()
            db.refresh(course)
      
        
        
        course.title = course_data.title or course.title
        
        course.subtitle = course_data.subtitle or course.subtitle
        course.category_id = course_data.category_id or course.category_id
        course.topic_id = course_data.topic_id or course.topic_id
        course.language = course_data.language or course.language
        course.level = course_data.level or course.level
        course.duration = course_data.duration or course.duration
        course.duration_unit = course_data.duration_unit or course.duration_unit
        db.commit()
        db.refresh(course)
        return course

    @staticmethod
    def update_course_step2(db: Session, course_id: int, course_data: CourseCreateStep2, instructor_id: int, cover_image_path: str, trailer_video_path: str):
        course = db.query(Course).filter(Course.id == course_id, Course.instructor_id == instructor_id).first()
        if not course:
            raise HTTPException(status_code=404, detail="Course not found or not authorized")

        if course_data.description is not None:
            course.description = course_data.description
        if cover_image_path is not None:
            course.cover_image = cover_image_path
        if trailer_video_path is not None:
            course.trailer_video = trailer_video_path
        if course_data.learning_objectives is not None:
            course.learning_objectives = course_data.learning_objectives
        if course_data.target_audiences is not None:
            course.target_audiences = course_data.target_audiences
        if course_data.requirements is not None:
            course.requirements = course_data.requirements
        db.commit()
        db.refresh(course)
        return course

    @staticmethod
    def update_course_step3(db: Session, course_id: int, course_data: CourseCreateStep3, instructor_id: int):
        course = db.query(Course).filter(Course.id == course_id, Course.instructor_id == instructor_id).first()
        if not course:
            raise HTTPException(status_code=404, detail="Course not found or not authorized")

        course.sections = [s for s in (course_data.sections or []) if s] or course.sections
        db.commit()
        db.refresh(course)
        return course

    @staticmethod
    def update_course_step4(db: Session, course_id: int, course_data: CourseCreateStep4, instructor_id: int):
        course = db.query(Course).filter(Course.id == course_id, Course.instructor_id == instructor_id).first()
        if not course:
            raise HTTPException(status_code=404, detail="Course not found or not authorized")

        course.price = course_data.price or course.price
        course.welcome_message = course_data.welcome_message or course.welcome_message
        course.congratulation_message = course_data.congratulation_message or course.congratulation_message
        course.co_instructor_ids = [cid for cid in (course_data.co_instructor_ids or []) if cid] or course.co_instructor_ids
        db.commit()
        db.refresh(course)
        return course

    @staticmethod
    def submit_course_for_review(db: Session, course_id: int, instructor_id: int):
        course = db.query(Course).filter(Course.id == course_id, Course.instructor_id == instructor_id).first()
        if not course:
            raise HTTPException(status_code=404, detail="Course not found or not authorized")
        
        # Validate all required fields
        if not (course.title and course.category_id and course.language and course.level and
                course.duration and course.duration_unit and course.price):
            raise HTTPException(status_code=400, detail="Incomplete course data")
        
        course.verification_status = VerificationStatus.PENDING.value
        db.commit()
        db.refresh(course)
        return course
    @staticmethod
    def get_instructor_drafts(db: Session, instructor_id: int):
        return db.query(Course).filter(Course.instructor_id == instructor_id, Course.is_published == False).all()

    @staticmethod
    def create_category(db: Session, category_data: CategoryCreate):
        category = Category(**category_data.model_dump())
        db.add(category)
        db.commit()
        db.refresh(category)
        return category
    
    @staticmethod
    def update_category(db: Session, category_data: CategoryResponse):
        category =db.query(Category).filter(Category.id == category_data.id).first()
        if category:
            category.name=category_data.name
            category.description=category_data.description
            # db.add(category)
            db.commit()
            db.refresh(category)
            return category
        raise HTTPException(status_code=404, detail="category not found")
    @staticmethod
    def create_topic(db: Session, topic_data: TopicCreate):
        topic = Topic(**topic_data.model_dump())
        db.add(topic)
        db.commit()
        db.refresh(topic)
        return topic

    @staticmethod
    def review_course(db: Session, course_id: int, status: str, admin_response: str):
        course = db.query(Course).filter(Course.id == course_id).first()
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
        if status not in [e.value for e in VerificationStatus]:
            raise HTTPException(status_code=400, detail="Invalid status")
        
        course.verification_status = status
        course.admin_response = admin_response
        if status == VerificationStatus.VERIFIED.value:
            course.is_published = True
        elif status == VerificationStatus.REJECTED.value:
            course.is_published = False
        
        db.commit()
        db.refresh(course)
        return course

    @staticmethod
    def get_all_categories(db: Session):
        return db.query(Category).all()