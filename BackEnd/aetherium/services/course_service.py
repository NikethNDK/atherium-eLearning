from sqlalchemy.orm import Session
from models.courses import *
from schemas.course import(CourseCreateStep1,CourseCreateStep2,CourseCreateStep3,CourseCreateStep4,CourseResponse)
from schemas.category import CategoryCreate
from schemas.topic import TopicCreate
from fastapi import HTTPException

class CourseService:
    @staticmethod
    def create_or_update_course_step1(db:Session, course_data:CourseCreateStep1,instructor_id:int):
        category=db.query(Category).filter(Category.id==course_data).first()
        if not category:
            raise HTTPException(status_code=400,detail="Category not found")
        
        if course_data.topic_id:
            topic=db.query(Topic).filter(Topic.id==course_data.topic_id).first()
            if not topic:
                raise HTTPException(status_code=400,detail="Topic not found")
        
        course = Course(
            **course_data.model_dump(),
            instructor_id=instructor_id,
            verification_status=VerificationStatus.PENDING,
            is_published=False
        )
        db.add(course)
        db.commit()
        db.refresh(course)
        return course

    @staticmethod
    def update_course_step2(
        db: Session, course_id: int, course_data: CourseCreateStep2, instructor_id: int,
        cover_image_path: str, trailer_video_path: str
    ):
        course = db.query(Course).filter(Course.id == course_id, Course.instructor_id == instructor_id).first()
        if not course:
            raise HTTPException(status_code=404, detail="Course not found or not authorized")
        
        course.description = course_data.description
        course.cover_image = cover_image_path
        course.trailer_video = trailer_video_path
        
        # Clear existing learning objectives, target audiences, requirements
        db.query(LearningObjective).filter(LearningObjective.course_id == course_id).delete()
        db.query(TargetAudience).filter(TargetAudience.course_id == course_id).delete()
        db.query(Requirement).filter(Requirement.course_id == course_id).delete()
        
        # Add new ones
        for obj in course_data.learning_objectives:
            db.add(LearningObjective(course_id=course_id, description=obj))
        for audience in course_data.target_audiences:
            db.add(TargetAudience(course_id=course_id, description=audience))
        for req in course_data.requirements:
            db.add(Requirement(course_id=course_id, description=req))
        
        db.commit()
        db.refresh(course)
        return course

    @staticmethod
    def update_course_step3(db: Session, course_id: int, course_data: CourseCreateStep3, instructor_id: int):
        course = db.query(Course).filter(Course.id == course_id, Course.instructor_id == instructor_id).first()
        if not course:
            raise HTTPException(status_code=404, detail="Course not found or not authorized")
        
        # Clear existing sections
        db.query(Section).filter(Section.course_id == course_id).delete()
        
        # Add new sections and lessons
        for section_data in course_data.sections:
            section = Section(name=section_data.name, course_id=course_id)
            db.add(section)
            db.flush()  # Get section ID
            for lesson_data in section_data.lessons:
                lesson = Lesson(**lesson_data.dict(), section_id=section.id)
                db.add(lesson)
        
        db.commit()
        db.refresh(course)
        return course

    @staticmethod
    def update_course_step4(db: Session, course_id: int, course_data: CourseCreateStep4, instructor_id: int):
        course = db.query(Course).filter(Course.id == course_id, Course.instructor_id == instructor_id).first()
        if not course:
            raise HTTPException(status_code=404, detail="Course not found or not authorized")
        
        course.price = course_data.price
        course.welcome_message = course_data.welcome_message
        course.congratulation_message = course_data.congratulation_message
        
        # Clear existing co-instructors
        db.query(CourseInstructor).filter(CourseInstructor.course_id == course_id).delete()
        
        # Add new co-instructors
        for co_instructor_id in course_data.co_instructor_ids:
            db.add(CourseInstructor(course_id=course_id, instructor_id=co_instructor_id))
        
        db.commit()
        db.refresh(course)
        return course

    @staticmethod
    def submit_course_for_review(db: Session, course_id: int, instructor_id: int):
        course = db.query(Course).filter(Course.id == course_id, Course.instructor_id == instructor_id).first()
        if not course:
            raise HTTPException(status_code=404, detail="Course not found or not authorized")
        if course.verification_status != VerificationStatus.PENDING:
            raise HTTPException(status_code=400, detail="Course already submitted or reviewed")
        
        # Validate required fields
        if not (course.title and course.category_id and course.language and course.level and
                course.duration and course.duration_unit and course.price):
            raise HTTPException(status_code=400, detail="Incomplete course data")
        
        course.verification_status = VerificationStatus.PENDING
        db.commit()
        db.refresh(course)
        return course

    @staticmethod
    def get_instructor_drafts(db: Session, instructor_id: int):
        return db.query(Course).filter(
            Course.instructor_id == instructor_id,
            Course.is_published == False
        ).all()

    @staticmethod
    def create_category(db: Session, category_data: CategoryCreate):
        category = Category(**category_data.dict())
        db.add(category)
        db.commit()
        db.refresh(category)
        return category

    @staticmethod
    def create_topic(db: Session, topic_data: TopicCreate):
        topic = Topic(**topic_data.dict())
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
        if status == VerificationStatus.VERIFIED:
            course.is_published = True
        elif status == VerificationStatus.REJECTED:
            course.is_published = False
        
        db.commit()
        db.refresh(course)
        return course