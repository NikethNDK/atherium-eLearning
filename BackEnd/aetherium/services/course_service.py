from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, and_
from aetherium.models.courses import *
from aetherium.schemas.course import (
    CourseCreateStep1, CourseCreateStep2, CourseCreateStep3, CourseCreateStep4, 
    CourseResponse
)
from aetherium.schemas.category import CategoryCreate, CategoryResponse
from aetherium.schemas.topic import TopicCreate
from fastapi import HTTPException
from typing import List

class CourseService:
    @staticmethod
    def create_or_update_course_step1(db: Session, course_data: CourseCreateStep1, instructor_id: int):
        course = db.query(Course).filter(
            Course.instructor_id == instructor_id, 
            Course.verification_status == VerificationStatus.PENDING,
            Course.is_published == False
        ).first()

        if not course:
            course = Course(
                instructor_id=instructor_id,
                verification_status=VerificationStatus.PENDING,
                is_published=False
            )
            db.add(course)

        # Update course data
        for field, value in course_data.model_dump().items():
            if value is not None:
                setattr(course, field, value)

        db.commit()
        db.refresh(course)
        return course

    @staticmethod
    def update_course_step2(db: Session, course_id: int, course_data: CourseCreateStep2, 
                           instructor_id: int, cover_image_path: str, trailer_video_path: str):
        course = db.query(Course).filter(
            Course.id == course_id, 
            Course.instructor_id == instructor_id
        ).first()
        
        if not course:
            raise HTTPException(status_code=404, detail="Course not found or not authorized")

        # Update basic fields
        if course_data.description is not None:
            course.description = course_data.description
        if cover_image_path:
            course.cover_image = cover_image_path
        if trailer_video_path:
            course.trailer_video = trailer_video_path

        # Handle learning objectives
        if course_data.learning_objectives:
            # Clear existing objectives
            db.query(LearningObjective).filter(LearningObjective.course_id == course_id).delete()
            # Add new objectives
            for obj_desc in course_data.learning_objectives:
                if obj_desc.strip():
                    objective = LearningObjective(course_id=course_id, description=obj_desc.strip())
                    db.add(objective)

        # Handle target audiences
        if course_data.target_audiences:
            db.query(TargetAudience).filter(TargetAudience.course_id == course_id).delete()
            for aud_desc in course_data.target_audiences:
                if aud_desc.strip():
                    audience = TargetAudience(course_id=course_id, description=aud_desc.strip())
                    db.add(audience)

        # Handle requirements
        if course_data.requirements:
            db.query(Requirement).filter(Requirement.course_id == course_id).delete()
            for req_desc in course_data.requirements:
                if req_desc.strip():
                    requirement = Requirement(course_id=course_id, description=req_desc.strip())
                    db.add(requirement)

        db.commit()
        db.refresh(course)
        return course

    @staticmethod
    def update_course_step3(db: Session, course_id: int, course_data: CourseCreateStep3, instructor_id: int):
        course = db.query(Course).filter(
            Course.id == course_id, 
            Course.instructor_id == instructor_id
        ).first()
        
        if not course:
            raise HTTPException(status_code=404, detail="Course not found or not authorized")

        # Clear existing sections
        db.query(Section).filter(Section.course_id == course_id).delete()

        # Add new sections
        for section_data in course_data.sections:
            if section_data.name.strip():
                section = Section(course_id=course_id, name=section_data.name.strip())
                db.add(section)

        db.commit()
        db.refresh(course)
        return course

    @staticmethod
    def update_course_step4(db: Session, course_id: int, course_data: CourseCreateStep4, instructor_id: int):
        course = db.query(Course).filter(
            Course.id == course_id, 
            Course.instructor_id == instructor_id
        ).first()
        
        if not course:
            raise HTTPException(status_code=404, detail="Course not found or not authorized")

        # Update fields
        for field, value in course_data.model_dump().items():
            if value is not None:
                setattr(course, field, value)

        db.commit()
        db.refresh(course)
        return course

    @staticmethod
    def submit_course_for_review(db: Session, course_id: int, instructor_id: int):
        course = db.query(Course).filter(
            Course.id == course_id, 
            Course.instructor_id == instructor_id
        ).first()
        
        if not course:
            raise HTTPException(status_code=404, detail="Course not found or not authorized")
        
        # More robust validation - check essential fields
        missing_fields = []
        
        if not course.title or not course.title.strip():
            missing_fields.append("title")
        
        if not course.description or not course.description.strip():
            missing_fields.append("description")
        
        # Check price - handle both None and 0 cases, and string conversion
        price_value = None
        if course.price is not None:
            try:
                price_value = float(course.price)
            except (ValueError, TypeError):
                price_value = None
        
        if price_value is None or price_value < 0:
            missing_fields.append("price")
        
        # Check if course has learning objectives
        learning_objectives = db.query(LearningObjective).filter(
            LearningObjective.course_id == course_id
        ).count()
        if learning_objectives == 0:
            missing_fields.append("learning objectives")
        
        # Check if course has target audiences
        target_audiences = db.query(TargetAudience).filter(
            TargetAudience.course_id == course_id
        ).count()
        if target_audiences == 0:
            missing_fields.append("target audiences")
        
        # Check if course has sections
        sections = db.query(Section).filter(
            Section.course_id == course_id
        ).count()
        if sections == 0:
            missing_fields.append("curriculum sections")
        
        if not course.welcome_message or not course.welcome_message.strip():
            missing_fields.append("welcome message")
        
        if not course.congratulation_message or not course.congratulation_message.strip():
            missing_fields.append("congratulation message")
        
        if missing_fields:
            raise HTTPException(
                status_code=400, 
                detail=f"Missing required fields: {', '.join(missing_fields)}"
            )
        
        # Ensure price is properly set as float
        if price_value is not None:
            course.price = price_value
        
        course.verification_status = VerificationStatus.PENDING
        db.commit()
        db.refresh(course)
        return course

    @staticmethod
    def get_instructor_drafts(db: Session, instructor_id: int):
        return db.query(Course).options(
            joinedload(Course.learning_objectives),
            joinedload(Course.target_audiences),
            joinedload(Course.requirements),
            joinedload(Course.sections),
            joinedload(Course.category),
            joinedload(Course.topic),
            joinedload(Course.instructor)
        ).filter(
            Course.instructor_id == instructor_id,
            Course.verification_status == VerificationStatus.PENDING,
            Course.is_published == False
        ).all()

    @staticmethod
    def get_instructor_pending_courses(db: Session, instructor_id: int):
        return db.query(Course).options(
            joinedload(Course.learning_objectives),
            joinedload(Course.target_audiences),
            joinedload(Course.requirements),
            joinedload(Course.sections),
            joinedload(Course.category),
            joinedload(Course.topic),
            joinedload(Course.instructor)
        ).filter(
            Course.instructor_id == instructor_id,
            Course.verification_status == VerificationStatus.PENDING
        ).all()

    @staticmethod
    def get_instructor_published_courses(db: Session, instructor_id: int):
        return db.query(Course).options(
            joinedload(Course.learning_objectives),
            joinedload(Course.target_audiences),
            joinedload(Course.requirements),
            joinedload(Course.sections),
            joinedload(Course.category),
            joinedload(Course.topic),
            joinedload(Course.instructor)
        ).filter(
            Course.instructor_id == instructor_id,
            Course.verification_status == VerificationStatus.VERIFIED
        ).all()

    @staticmethod
    def get_all_courses(db: Session):
        try:
            courses = db.query(Course).options(
                joinedload(Course.learning_objectives),
                joinedload(Course.target_audiences),
                joinedload(Course.requirements),
                joinedload(Course.sections),
                joinedload(Course.category),
                joinedload(Course.topic),
                joinedload(Course.instructor)
            ).all()
            print(f"Fetched {len(courses)} courses: {[c.__dict__ for c in courses]}")
            return courses
        except Exception as e:
            print(f"Error fetching courses: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error fetching courses: {str(e)}")

    @staticmethod
    def get_pending_courses(db: Session):
        return db.query(Course).options(
            joinedload(Course.learning_objectives),
            joinedload(Course.target_audiences),
            joinedload(Course.requirements),
            joinedload(Course.sections),
            joinedload(Course.category),
            joinedload(Course.topic),
            joinedload(Course.instructor)
        ).filter(
            Course.verification_status == VerificationStatus.PENDING
        ).all()

    @staticmethod
    def get_course_by_id(db: Session, course_id: int):
        course = db.query(Course).options(
            joinedload(Course.learning_objectives),
            joinedload(Course.target_audiences),
            joinedload(Course.requirements),
            joinedload(Course.sections).joinedload(Section.lessons),
            joinedload(Course.category),
            joinedload(Course.topic),
            joinedload(Course.instructor)
        ).filter(Course.id == course_id).first()
        
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
        
        return course

    @staticmethod
    def get_instructor_course(db: Session, course_id: int, instructor_id: int):
        course = db.query(Course).options(
            joinedload(Course.learning_objectives),
            joinedload(Course.target_audiences),
            joinedload(Course.requirements),
            joinedload(Course.sections).joinedload(Section.lessons),
            joinedload(Course.category),
            joinedload(Course.topic),
            joinedload(Course.instructor)
        ).filter(
            Course.id == course_id,
            Course.instructor_id == instructor_id
        ).first()
        
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
        
        return course

    @staticmethod
    def update_course_status(db: Session, course_id: int, instructor_id: int, status: str):
        course = db.query(Course).filter(
            Course.id == course_id,
            Course.instructor_id == instructor_id
        ).first()
        
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
        
        if status == "disabled":
            course.is_published = False
        elif status == "published" and course.verification_status == VerificationStatus.VERIFIED:
            course.is_published = True
        
        db.commit()
        db.refresh(course)
        return course

    @staticmethod
    def create_category(db: Session, category_data: CategoryCreate):
        category = Category(**category_data.model_dump())
        db.add(category)
        db.commit()
        db.refresh(category)
        return category
    
    @staticmethod
    def update_category(db: Session, category_id: int, category_data: CategoryCreate):
        category = db.query(Category).filter(Category.id == category_id).first()
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")
        
        for field, value in category_data.model_dump().items():
            setattr(category, field, value)
        
        db.commit()
        db.refresh(category)
        return category

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
        
        # Map frontend status to backend enum values
        status_mapping = {
            "verified": VerificationStatus.VERIFIED,
            "rejected": VerificationStatus.REJECTED,
            "pending": VerificationStatus.PENDING
        }
        
        if status not in status_mapping:
            raise HTTPException(status_code=400, detail="Invalid status")
        
        course.verification_status = status_mapping[status]
        course.admin_response = admin_response
        
        if status == "verified":
            course.is_published = True
        elif status == "rejected":
            course.is_published = False
            # Move back to draft status for editing
            course.verification_status = VerificationStatus.PENDING
        
        db.commit()
        db.refresh(course)
        return course

    @staticmethod
    def get_all_categories(db: Session):
        return db.query(Category).all()

    @staticmethod
    def search_instructors(db: Session, query: str):
        from aetherium.models.user import User, Role
        return db.query(User).join(Role).filter(
            Role.name == "instructor",
            or_(
                User.firstname.ilike(f"%{query}%"),
                User.lastname.ilike(f"%{query}%"),
                User.username.ilike(f"%{query}%")
            )
        ).limit(10).all()

    @staticmethod
    def get_all_instructors(db: Session):
        from aetherium.models.user import User, Role
        return db.query(User).join(Role).filter(
            Role.name == "instructor"
        ).limit(20).all()
