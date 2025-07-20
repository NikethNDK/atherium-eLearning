# services/progress_service.py
from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from typing import List, Optional, Dict, Any
from fastapi import HTTPException
from datetime import datetime

from aetherium.models.courses.lesson import Lesson
from aetherium.models.courses.section import Section
from aetherium.models.courses.course import Course
from aetherium.models.courses.progress import LessonProgress, SectionProgress, CourseProgress
from aetherium.schemas.progress import (
    LessonProgressCreate, LessonProgressUpdate, LessonProgressResponse,
    SectionProgressResponse, CourseProgressResponse
)

class ProgressService:
    def __init__(self, db: Session):
        self.db = db

    """Update lesson progress for a user"""
    async def update_lesson_progress(self, user_id: int, lesson_id: int, progress_data: LessonProgressUpdate) -> LessonProgressResponse:
        
        # Get or create lesson progress
        progress = self.db.query(LessonProgress).filter(and_(LessonProgress.user_id == user_id,LessonProgress.lesson_id == lesson_id)).first()
        
        if not progress:
            lesson = self.db.query(Lesson).filter(Lesson.id == lesson_id).first()
            if not lesson:
                raise HTTPException(status_code=404, detail="Lesson not found")
            
            progress = LessonProgress(
                user_id=user_id,
                lesson_id=lesson_id
            )
            self.db.add(progress)
        
        # Update progress fields
        update_data = progress_data.model_dump(exclude_none=True)
        for key, value in update_data.items():
            setattr(progress, key, value)
        
        # Mark as completed if 100% progress
        if progress.progress_percentage >= 100.0:
            progress.is_completed = True
            progress.completed_at = datetime.now()
        
        self.db.commit()
        self.db.refresh(progress)
        
        # Update section and course progress
        await self._update_section_progress(user_id, lesson_id)
        
        return LessonProgressResponse.model_validate(progress)
    
    """Update section progress based on lesson completion"""
    async def _update_section_progress(self, user_id: int, lesson_id: int):
        
        lesson = self.db.query(Lesson).filter(Lesson.id == lesson_id).first()
        if not lesson:
            return
        
        section_id = lesson.section_id
        
        # Get total lessons in section
        total_lessons = self.db.query(func.count(Lesson.id)).filter(
            Lesson.section_id == section_id
        ).scalar()
        
        # Get completed lessons in section
        completed_lessons = self.db.query(func.count(LessonProgress.id)).filter(
            and_(
                LessonProgress.user_id == user_id,
                LessonProgress.is_completed == True,
                LessonProgress.lesson_id.in_(
                    self.db.query(Lesson.id).filter(Lesson.section_id == section_id)
                )
            )
        ).scalar()
        
        # Progress percentage calculation
        progress_percentage = (completed_lessons / total_lessons) * 100 if total_lessons > 0 else 0
        
        # Get or create section progress
        section_progress = self.db.query(SectionProgress).filter(
            and_(
                SectionProgress.user_id == user_id,
                SectionProgress.section_id == section_id
            )
        ).first()
        
        if not section_progress:
            section_progress = SectionProgress(
                user_id=user_id,
                section_id=section_id
            )
            self.db.add(section_progress)
        
        # Update section progress
        section_progress.lessons_completed = completed_lessons
        section_progress.total_lessons = total_lessons
        section_progress.progress_percentage = progress_percentage
        section_progress.is_completed = progress_percentage >= 100.0
        
        if section_progress.is_completed and not section_progress.completed_at:
            section_progress.completed_at = datetime.now()
        
        self.db.commit()
        
        # Update course progress
        await self._update_course_progress(user_id, section_id)
    
    async def _update_course_progress(self, user_id: int, section_id: int):
        """Update course progress based on section completion"""
        # Get section and course info
        section = self.db.query(Section).filter(Section.id == section_id).first()
        if not section:
            return
        
        course_id = section.course_id
        
        # Get total sections in course
        total_sections = self.db.query(func.count(Section.id)).filter(
            Section.course_id == course_id
        ).scalar()
        
        # Get completed sections in course
        completed_sections = self.db.query(func.count(SectionProgress.id)).filter(
            and_(
                SectionProgress.user_id == user_id,
                SectionProgress.is_completed == True,
                SectionProgress.section_id.in_(
                    self.db.query(Section.id).filter(Section.course_id == course_id)
                )
            )
        ).scalar()
        
        # Get total lessons in course
        total_lessons = self.db.query(func.count(Lesson.id)).filter(
            Lesson.section_id.in_(
                self.db.query(Section.id).filter(Section.course_id == course_id)
            )
        ).scalar()
        
        # Get completed lessons in course
        completed_lessons = self.db.query(func.count(LessonProgress.id)).filter(
            and_(
                LessonProgress.user_id == user_id,
                LessonProgress.is_completed == True,
                LessonProgress.lesson_id.in_(
                    self.db.query(Lesson.id).filter(
                        Lesson.section_id.in_(
                            self.db.query(Section.id).filter(Section.course_id == course_id)
                        )
                    )
                )
            )
        ).scalar()
        
        # Calculate progress percentage
        progress_percentage = (completed_lessons / total_lessons) * 100 if total_lessons > 0 else 0
        
        # Get or create course progress
        course_progress = self.db.query(CourseProgress).filter(
            and_(
                CourseProgress.user_id == user_id,
                CourseProgress.course_id == course_id
            )
        ).first()
        
        if not course_progress:
            course_progress = CourseProgress(
                user_id=user_id,
                course_id=course_id
            )
            self.db.add(course_progress)
        
        # Update course progress
        course_progress.sections_completed = completed_sections
        course_progress.total_sections = total_sections
        course_progress.lessons_completed = completed_lessons
        course_progress.total_lessons = total_lessons
        course_progress.progress_percentage = progress_percentage
        course_progress.is_completed = progress_percentage >= 100.0
        
        if course_progress.is_completed and not course_progress.completed_at:
            course_progress.completed_at = datetime.now()
        
        self.db.commit()
    
    def get_lesson_progress(self, user_id: int, lesson_id: int) -> Optional[LessonProgressResponse]:
        """Get lesson progress for a user"""
        progress = self.db.query(LessonProgress).filter(
            and_(
                LessonProgress.user_id == user_id,
                LessonProgress.lesson_id == lesson_id
            )
        ).first()
        
        if not progress:
            return None
        
        return progress
    
    def get_section_progress(self, user_id: int, section_id: int) -> Optional[SectionProgressResponse]:
        """Get section progress for a user"""
        progress = self.db.query(SectionProgress).filter(
            and_(
                SectionProgress.user_id == user_id,
                SectionProgress.section_id == section_id
            )
        ).first()
        
        if not progress:
            return None
        
        return progress
    
    def get_course_progress(self, user_id: int, course_id: int):
        """Get course progress for a user"""
        progress = self.db.query(CourseProgress).filter(
            and_(
                CourseProgress.user_id == user_id,
                CourseProgress.course_id == course_id
            )
        ).first()
        
        if not progress:
            return None
        
        return progress
    
    def get_user_course_progress_summary(self, user_id: int) -> List[CourseProgressResponse]:
        """Get all course progress for a user"""
        progress_list = self.db.query(CourseProgress).filter(
            CourseProgress.user_id == user_id
        ).all()
        
        return [CourseProgressResponse.from_orm(progress) for progress in progress_list]
    
    def get_course_analytics(self, course_id: int) -> Dict[str, Any]:
        """Get course analytics (completion rates, etc.)"""
        # Total enrolled users
        total_users = self.db.query(func.count(CourseProgress.user_id.distinct())).filter(
            CourseProgress.course_id == course_id
        ).scalar()
        
        # Completed users
        completed_users = self.db.query(func.count(CourseProgress.user_id)).filter(
            and_(
                CourseProgress.course_id == course_id,
                CourseProgress.is_completed == True
            )
        ).scalar()
        
        # Average progress
        avg_progress = self.db.query(func.avg(CourseProgress.progress_percentage)).filter(
            CourseProgress.course_id == course_id
        ).scalar() or 0
        
        # Most common stopping point (section with lowest completion rate)
        section_completion = self.db.query(
            SectionProgress.section_id,
            func.count(SectionProgress.id).label('total'),
            func.count(
                func.case([(SectionProgress.is_completed == True, 1)])
            ).label('completed')
        ).filter(
            SectionProgress.section_id.in_(
                self.db.query(Section.id).filter(Section.course_id == course_id)
            )
        ).group_by(SectionProgress.section_id).all()
        
        return {
            "total_enrolled": total_users,
            "completed_users": completed_users,
            "completion_rate": (completed_users / total_users * 100) if total_users > 0 else 0,
            "average_progress": float(avg_progress),
            "section_completion_rates": [
                {
                    "section_id": sc.section_id,
                    "completion_rate": (sc.completed / sc.total * 100) if sc.total > 0 else 0
                }
                for sc in section_completion
            ]
        }