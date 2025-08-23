from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, func, desc
from typing import List, Optional, Dict, Any
from fastapi import HTTPException
from datetime import datetime, timezone
from aetherium.core.logger import logger
from aetherium.models.courses.lesson_comment import LessonComment, LessonCommentEdit
from aetherium.models.courses.course import Course
from aetherium.models.courses.section import Section
from aetherium.models.courses.lesson import Lesson
from aetherium.models.user import User
from aetherium.models.user_course import Purchase
from aetherium.schemas.lesson_comment import LessonCommentCreate, LessonCommentUpdate, LessonCommentResponse, LessonCommentListResponse

from aetherium.core.logger import logger

class LessonCommentService:
    def __init__(self, db: Session):
        self.db = db
    
    def _can_access_lesson_comments(self, user_id: int, lesson_id: int) -> bool:
        
        # Check if user has purchased the cours
        purchase = self.db.query(Purchase).join(Purchase.course).join(Course.sections).join(Section.lessons).filter(
            and_(
                Purchase.user_id == user_id,
                Lesson.id == lesson_id,
                Purchase.status == "COMPLETED"
            )
        ).first()
        logger.info(f"Purchase in the _can access: {purchase}")
        
        if purchase:
            return True
            
        lesson = self.db.query(Lesson).filter(Lesson.id == lesson_id).first()
        if lesson:
            course = lesson.section.course
            if course.instructor_id == user_id:
                return True
                
        return False
    
    def _can_modify_comment(self, user_id: int, comment: LessonComment) -> bool:
        """Check if user can modify a comment"""
        return comment.user_id == user_id
    
    def get_lesson_comments(self, lesson_id: int, 
        user_id: int,
        page: int = 1, 
        limit: int = 20
    ) -> LessonCommentListResponse:
        """Get paginated comments for a lesson"""
        if not self._can_access_lesson_comments(user_id, lesson_id):
            raise HTTPException(status_code=403, detail="Access denied. Purchase the course to view comments.")
        
        # Get total count
        total_count = self.db.query(LessonComment).filter(
            and_(
                LessonComment.lesson_id == lesson_id,
                LessonComment.parent_comment_id.is_(None),
                LessonComment.is_deleted == False
            )
        ).count()
        
        # Calculate pagination
        offset = (page - 1) * limit
        total_pages = (total_count + limit - 1) // limit
        
        # Get top-level comments with replies
        comments = self.db.query(LessonComment).options(
            joinedload(LessonComment.user),
            joinedload(LessonComment.replies).joinedload(LessonComment.user)
        ).filter(
            and_(
                LessonComment.lesson_id == lesson_id,
                LessonComment.parent_comment_id.is_(None),
                LessonComment.is_deleted == False
            )
        ).order_by(desc(LessonComment.created_at)).offset(offset).limit(limit).all()
        
        # Convert to response format
        comment_responses = []
        for comment in comments:
            comment_response = self._convert_to_response(comment)
            comment_responses.append(comment_response)
        
        return LessonCommentListResponse(
            comments=comment_responses,
            total_count=total_count,
            page=page,
            limit=limit,
            total_pages=total_pages
        )
    
    def create_comment(self, user_id: int, comment_data: LessonCommentCreate) -> LessonCommentResponse:
        """Create a new comment or reply"""
        logger.info("Trying to add new Comment")
        if not self._can_access_lesson_comments(user_id, comment_data.lesson_id):
            raise HTTPException(status_code=403, detail="Access denied. Purchase the course to comment.")
        
        # Validate parent comment if this is a reply
        if comment_data.parent_comment_id:
            parent_comment = self.db.query(LessonComment).filter(
                and_(
                    LessonComment.id == comment_data.parent_comment_id,
                    LessonComment.lesson_id == comment_data.lesson_id,
                    LessonComment.is_deleted == False
                )
            ).first()
            if not parent_comment:
                raise HTTPException(status_code=404, detail="Parent comment not found")
        
        # Create the comment
        comment = LessonComment(
            lesson_id=comment_data.lesson_id,
            user_id=user_id,
            parent_comment_id=comment_data.parent_comment_id,
            content=comment_data.content
        )
        
        self.db.add(comment)
        self.db.commit()
        self.db.refresh(comment)
        
        # Load user data for response
        comment = self.db.query(LessonComment).options(
            joinedload(LessonComment.user)
        ).filter(LessonComment.id == comment.id).first()
        
        return self._convert_to_response(comment)
    
    def update_comment(
        self, 
        user_id: int, 
        comment_id: int, 
        comment_data: LessonCommentUpdate
    ) -> LessonCommentResponse:
        """Update an existing comment"""
        comment = self.db.query(LessonComment).filter(
            and_(
                LessonComment.id == comment_id,
                LessonComment.is_deleted == False
            )
        ).first()
        
        if not comment:
            raise HTTPException(status_code=404, detail="Comment not found")
        
        if not self._can_modify_comment(user_id, comment):
            raise HTTPException(status_code=403, detail="You can only edit your own comments")
        
        # Store previous content for edit history
        edit_record = LessonCommentEdit(
            comment_id=comment.id,
            previous_content=comment.content
        )
        self.db.add(edit_record)
        
        # Update comment
        comment.content = comment_data.content
        comment.is_edited = True
        comment.updated_at = datetime.now(timezone.utc)
        
        self.db.commit()
        self.db.refresh(comment)
        
        # Load user data for response
        comment = self.db.query(LessonComment).options(
            joinedload(LessonComment.user)
        ).filter(LessonComment.id == comment.id).first()
        
        return self._convert_to_response(comment)
    
    def delete_comment(self, user_id: int, comment_id: int) -> Dict[str, str]:
        """Soft delete a comment"""
        comment = self.db.query(LessonComment).filter(
            and_(
                LessonComment.id == comment_id,
                LessonComment.is_deleted == False
            )
        ).first()
        
        if not comment:
            raise HTTPException(status_code=404, detail="Comment not found")
        
        if not self._can_modify_comment(user_id, comment):
            raise HTTPException(status_code=403, detail="You can only delete your own comments")
        
        # Soft delete
        comment.is_deleted = True
        comment.updated_at = datetime.utcnow()
        
        self.db.commit()
        
        return {"message": "Comment deleted successfully"}
    
    def _convert_to_response(self, comment: LessonComment) -> LessonCommentResponse:
        """Convert comment model to response schema"""
        # Convert replies recursively
        replies = []
        for reply in comment.replies:
            if not reply.is_deleted:
                replies.append(self._convert_to_response(reply))
        
        return LessonCommentResponse(
            id=comment.id,
            lesson_id=comment.lesson_id,
            user_id=comment.user_id,
            parent_comment_id=comment.parent_comment_id,
            content=comment.content,
            is_edited=comment.is_edited,
            is_deleted=comment.is_deleted,
            created_at=comment.created_at,
            updated_at=comment.updated_at,
            user_firstname=comment.user.firstname,
            user_lastname=comment.user.lastname,
            user_profile_picture=comment.user.profile_picture,
            replies=replies
        )
