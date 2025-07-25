from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from aetherium.models.user import User, Role,Wallet
from aetherium.models.courses import Course, VerificationStatus
from typing import List, Dict, Any

class AdminService:
    @staticmethod
    def get_dashboard_stats(db: Session) -> Dict[str, Any]:
        total_users = db.query(User).count()
        
        total_courses = db.query(Course).count()
        
        total_instructors = db.query(User).join(Role).filter(Role.name == "instructor").count()
        
        pending_courses = db.query(Course).filter(
            Course.verification_status == VerificationStatus.PENDING
        ).count()
        
        published_courses = db.query(Course).filter(
            Course.is_published == True
        ).count()
        
        average_rating = 4.8
        
        # total_revenue = db.query(Course).func(sum())
        
        return {
            "total_users": total_users,
            "total_courses": total_courses,
            "total_instructors": total_instructors,
            "pending_courses": pending_courses,
            "published_courses": published_courses,
            "average_rating": average_rating,
            "total_revenue": total_revenue,
            "total_sales": published_courses * 15  
        }
    
    @staticmethod
    def get_top_instructors(db: Session) -> List[Dict[str, Any]]:
        # instructors with their course counts
        instructors = db.query(
            User.id,
            User.firstname,
            User.lastname,
            User.username,
            User.profile_picture,
            func.count(Course.id).label('course_count')
        ).join(Role).outerjoin(Course, User.id == Course.instructor_id)\
        .filter(Role.name == "instructor")\
        .group_by(User.id, User.firstname, User.lastname, User.username, User.profile_picture)\
        .order_by(desc('course_count'))\
        .limit(10).all()
        
        return [
            {
                "id": instructor.id,
                "name": f"{instructor.firstname} {instructor.lastname}",
                "username": instructor.username,
                "profile_picture": instructor.profile_picture,
                "course_count": instructor.course_count,
                "initials": f"{instructor.firstname[0] if instructor.firstname else ''}{instructor.lastname[0] if instructor.lastname else ''}"
            }
            for instructor in instructors
        ]
    
    @staticmethod
    def get_best_selling_courses(db: Session) -> List[Dict[str, Any]]:
        
        courses = db.query(Course).filter(
            Course.is_published == True
        ).limit(5).all()
        
        return [
            {
                "id": course.id,
                "title": course.title,
                "instructor_name": f"{course.instructor.firstname} {course.instructor.lastname}" if course.instructor else "Unknown",
                "sales_count": 100,  
                "revenue": 1500.5, 
                "cover_image": course.cover_image
            }
            for course in courses
        ]
