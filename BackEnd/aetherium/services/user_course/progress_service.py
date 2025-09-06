from sqlalchemy.orm import Session
from aetherium.models.user_course import Purchase, PurchaseStatus
from aetherium.models.courses.progress import CourseProgress
from aetherium.schemas.user_course import CourseProgressUpdate, CourseProgressResponse
from fastapi import HTTPException
from datetime import datetime, timezone

class ProgressService:
    @staticmethod
    def update_course_progress(db: Session, user_id: int, course_id: int, progress_data: CourseProgressUpdate):
        progress = db.query(CourseProgress).filter(
            CourseProgress.user_id == user_id,
            CourseProgress.course_id == course_id
        ).first()
        
        if not progress:
            purchase = db.query(Purchase).filter(
                Purchase.user_id == user_id,
                Purchase.course_id == course_id,
                Purchase.status == PurchaseStatus.COMPLETED
            ).first()
            if not purchase:
                raise HTTPException(status_code=403, detail="Course not purchased")
            
            progress = CourseProgress(user_id=user_id, course_id=course_id)
            db.add(progress)
        
        if progress_data.lesson_id is not None:
            progress.lesson_id = progress_data.lesson_id
        if progress_data.progress_percentage is not None:
            progress.progress_percentage = progress_data.progress_percentage
        if progress_data.is_completed is not None:
            progress.is_completed = progress_data.is_completed
            if progress_data.is_completed:
                progress.completed_at = datetime.now(timezone.utc)
        
        progress.last_accessed = datetime.now(timezone.utc)
        
        db.commit()
        db.refresh(progress)
        return progress
    
    @staticmethod
    def get_course_progress(db: Session, user_id: int, course_id: int):
        progress = db.query(CourseProgress).filter(
            CourseProgress.user_id == user_id,
            CourseProgress.course_id == course_id
        ).first()
        
        if not progress:
            return {
                "progress_percentage": 0.0,
                "is_completed": False,
                "last_accessed": None,
                "completed_at": None
            }
        
        return progress