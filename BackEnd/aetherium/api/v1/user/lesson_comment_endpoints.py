from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from aetherium.database.db import get_db
from aetherium.models.user import User
from aetherium.utils.jwt_utils import get_current_user
from aetherium.services.lesson_comment_service import LessonCommentService
from aetherium.schemas.lesson_comment import (
    LessonCommentCreate, 
    LessonCommentUpdate, 
    LessonCommentResponse, 
    LessonCommentListResponse
)

from aetherium.core.logger import logger

router = APIRouter()

@router.get("/lessons/{lesson_id}/comments", response_model=LessonCommentListResponse)
async def get_lesson_comments(
    lesson_id: int,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get comments for a specific lesson"""
    logger.info("This is inside the get lesson comment")
    if current_user.role.name != "user":
        raise HTTPException(status_code=403, detail="User access required")
    
    comment_service = LessonCommentService(db)
    return comment_service.get_lesson_comments(lesson_id, current_user.id, page, limit)

@router.post("/lessons/{lesson_id}/comments", response_model=LessonCommentResponse)
async def create_lesson_comment(
    lesson_id: int,
    comment_data: LessonCommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new comment or reply for a lesson"""
    print("Inside the lesson funciton")
    if current_user.role.name != "user":
        raise HTTPException(status_code=403, detail="User access required")
    
    # Ensure lesson_id in path matches the comment data
    comment_data.lesson_id = lesson_id
    
    comment_service = LessonCommentService(db)
    return comment_service.create_comment(current_user.id, comment_data)

@router.put("/comments/{comment_id}", response_model=LessonCommentResponse)
async def update_lesson_comment(
    comment_id: int,
    comment_data: LessonCommentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update an existing comment"""
    if current_user.role.name != "user":
        raise HTTPException(status_code=403, detail="User access required")
    
    comment_service = LessonCommentService(db)
    return comment_service.update_comment(current_user.id, comment_id, comment_data)

@router.delete("/comments/{comment_id}")
async def delete_lesson_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a comment (soft delete)"""
    if current_user.role.name != "user":
        raise HTTPException(status_code=403, detail="User access required")
    
    comment_service = LessonCommentService(db)
    return comment_service.delete_comment(current_user.id, comment_id)



