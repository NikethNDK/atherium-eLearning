from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, and_,func,distinct
from aetherium.models.courses import *
from aetherium.models.user import Wallet,User
from aetherium.models.user_course import Purchase
from aetherium.schemas.course import (
    CourseCreateStep1, CourseCreateStep2, CourseCreateStep3, CourseCreateStep4, 
    CourseResponse
)
from aetherium.schemas.category import CategoryCreate, CategoryResponse
from aetherium.schemas.topic import TopicCreate
from fastapi import HTTPException
from typing import List,Optional
from aetherium.core.logger import logger
from sqlalchemy.orm import selectinload, with_loader_criteria
from sqlalchemy import asc

class CourseService:
    @staticmethod
    def create_step1(db: Session, course_data: CourseCreateStep1, instructor_id: int):
        # course = db.query(Course).filter(
        #     Course.instructor_id == instructor_id, 
        #     Course.verification_status == VerificationStatus.PENDING,
        #     Course.is_published == False
        # ).first()

        # if not course:
        course = Course(
            instructor_id=instructor_id,
            verification_status=VerificationStatus.DRAFT,
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
            db.query(LearningObjective).filter(LearningObjective.course_id == course_id).delete()
      
            for obj_desc in course_data.learning_objectives:
                if obj_desc.strip():
                    objective = LearningObjective(course_id=course_id, description=obj_desc.strip())
                    db.add(objective)


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
    def update_course_step4(db: Session, course_id: int, course_data: CourseCreateStep4, instructor_id: int):
        course = db.query(Course).filter(
            Course.id == course_id, 
            Course.instructor_id == instructor_id
        ).first()
        
        if not course:
            raise HTTPException(status_code=404, detail="Course not found or not authorized")

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

        missing_fields = []
        
        if not course.title or not course.title.strip():
            missing_fields.append("title")
        
        if not course.description or not course.description.strip():
            missing_fields.append("description")

        price_value = None
        if course.price is not None:
            try:
                price_value = float(course.price)
            except (ValueError, TypeError):
                price_value = None
        
        if price_value is None or price_value < 0:
            missing_fields.append("price")
        
        
        learning_objectives = db.query(LearningObjective).filter(
            LearningObjective.course_id == course_id
        ).count()
        if learning_objectives == 0:
            missing_fields.append("learning objectives")
        
        
        target_audiences = db.query(TargetAudience).filter(
            TargetAudience.course_id == course_id
        ).count()
        if target_audiences == 0:
            missing_fields.append("target audiences")
        
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
            Course.verification_status == VerificationStatus.DRAFT,
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
            Course.verification_status.in_([VerificationStatus.PENDING, VerificationStatus.REJECTED])
            # Course.verification_status == VerificationStatus.PENDING or Course.verification_status == VerificationStatus.REJECTED
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
            course.verification_status = VerificationStatus.REJECTED
        
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
    







    
    @staticmethod
    def get_instructor_courses(db: Session, instructor_id: int, page: int = 1, limit: int = 10, status: Optional[str] = None):
        """Get paginated courses for a specific instructor with optional status filter"""
        offset = (page - 1) * limit
        
        query = db.query(Course).options(
            joinedload(Course.learning_objectives),
            joinedload(Course.target_audiences),
            joinedload(Course.requirements),
            joinedload(Course.sections),
            joinedload(Course.category),
            joinedload(Course.topic),
            joinedload(Course.instructor)
        ).filter(Course.instructor_id == instructor_id)
        
        # Filter by status if provided
        if status:
            if status == "verified":
                query = query.filter(Course.verification_status == VerificationStatus.VERIFIED)
            elif status == "pending":
                query = query.filter(Course.verification_status == VerificationStatus.PENDING)
            elif status == "rejected":
                query = query.filter(Course.verification_status == VerificationStatus.REJECTED)
        
        courses = query.order_by(Course.created_at.desc()).offset(offset).limit(limit).all()
        return courses


    @staticmethod
    def get_instructor_course_detail(db: Session, course_id: int, instructor_id: int):
        """Get detailed information about a specific course owned by the instructor"""
        from aetherium.models.courses.lesson import Lesson
        course = db.query(Course).options(
            joinedload(Course.learning_objectives),
            joinedload(Course.target_audiences),
            joinedload(Course.requirements),
            joinedload(Course.sections).joinedload(Section.lessons).joinedload(Lesson.lesson_content),
            joinedload(Course.category),
            joinedload(Course.topic),
            joinedload(Course.instructor)
        ).filter(
            Course.id == course_id,
            Course.instructor_id == instructor_id
        ).first()
        
        if not course:
            raise HTTPException(status_code=404, detail="Course not found or not authorized")
        logger.info(f"The course which is called for course_id {course_id} and the details is {course}")
        return course

    @staticmethod
    def get_instructor_dashboard_stats(db: Session, instructor_id: int):
        """Get dashboard statistics for instructor"""
        total_courses = db.query(Course).filter(Course.instructor_id == instructor_id).count()
        
        verified_courses = db.query(Course).filter(
            Course.instructor_id == instructor_id,
            Course.verification_status == VerificationStatus.VERIFIED
        ).count()
        
        pending_courses = db.query(Course).filter(
            Course.instructor_id == instructor_id,
            Course.verification_status == VerificationStatus.PENDING
        ).count()
        
        rejected_courses = db.query(Course).filter(
            Course.instructor_id == instructor_id,
            Course.verification_status == VerificationStatus.REJECTED
        ).count()
        from aetherium.models.enum import PurchaseStatus
        student_count=(db.query(func.count(distinct(Purchase.user_id))).join
                        (Course,Purchase.course_id ==Course.id).filter(
                            Course.instructor_id==instructor_id,
                            Purchase.status==PurchaseStatus.COMPLETED
                        ).scalar()
                        )

        total_students = student_count or 0  
        if instructor_id!=1:
            total_earned=(db.query(func.sum(Wallet.balance)).filter(Wallet.user_id==instructor_id)).scalar()
            logger.info(f"Total amount for this instructor{total_earned}")
        total_revenue = round(total_earned,2) if total_earned else 0.0

        pending_reviews = 0  
        
        return {
            "totalCourses": total_courses,
            "verifiedCourses": verified_courses,
            "pendingCourses": pending_courses,
            "rejectedCourses": rejected_courses,
            "totalStudents": total_students,
            "totalRevenue": total_revenue,
            "pendingReviews": pending_reviews
        }

   
    @staticmethod
    def update_course_step3_with_lessons(db: Session, course_id: int, course_data: CourseCreateStep3, instructor_id: int):
        course = db.query(Course).filter(
            Course.id == course_id, 
            Course.instructor_id == instructor_id
        ).first()
        
        if not course:
            raise HTTPException(status_code=404, detail="Course not found or not authorized")

       
        db.query(Section).filter(Section.course_id == course_id).delete()

        for section_data in course_data.sections:
            if section_data.name.strip():
                section = Section(course_id=course_id, name=section_data.name.strip())
                db.add(section)
                db.flush() 
                
                if hasattr(section_data, 'lessons') and section_data.lessons:
                    for lesson_data in section_data.lessons:
                        if lesson_data.name.strip():
                            lesson = Lesson(
                                section_id=section.id,
                                name=lesson_data.name.strip(),
                                content_type=lesson_data.content_type or ContentType.DESCRIPTION,
                                content_url=lesson_data.content_url,
                                duration=lesson_data.duration,
                                description=lesson_data.description
                            )
                            db.add(lesson)

        db.commit()
        db.refresh(course)
        return course
