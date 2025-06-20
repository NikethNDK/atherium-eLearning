from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from aetherium.schemas.course import (
    CourseCreateStep1, CourseCreateStep2, CourseCreateStep3, CourseCreateStep4, 
    CourseResponse, CourseStatusUpdate
)
from aetherium.schemas.user import UserResponse
from aetherium.services.course_service import CourseService
from aetherium.database.db import get_db
from aetherium.utils.jwt_utils import get_current_user
from aetherium.models.user import User
from aetherium.models.courses import VerificationStatus
import os
import logging   
from pathlib import Path

router = APIRouter(
    prefix="/instructor/courses", tags=["Instructor Courses"]
)

logger = logging.getLogger(__name__)

@router.post("/step1", response_model=CourseResponse)
async def create_course_step1(
    course_data: CourseCreateStep1,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.name != "instructor":
        raise HTTPException(status_code=403, detail="Not Authorized")
    
    return CourseService.create_or_update_course_step1(db, course_data, current_user.id)

@router.put("/{course_id}/step2", response_model=CourseResponse)
async def update_course_step2(
    course_id: int,
    description: str = Form(""),
    learning_objectives: List[str] = Form([]),
    target_audiences: List[str] = Form([]),
    requirements: List[str] = Form([]),
    cover_image: Optional[UploadFile] = File(None),
    trailer_video: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.name != "instructor":
        raise HTTPException(status_code=403, detail='Not authorized')
    
    cover_image_path = await save_file(cover_image, "cover_images") if cover_image else None
    trailer_video_path = await save_file(trailer_video, "trailers") if trailer_video else None
    
    course_data = CourseCreateStep2(
        description=description,
        learning_objectives=[obj for obj in learning_objectives if obj.strip()],
        target_audiences=[aud for aud in target_audiences if aud.strip()],
        requirements=[req for req in requirements if req.strip()]
    )
    
    return CourseService.update_course_step2(
        db, course_id, course_data, current_user.id, cover_image_path, trailer_video_path
    )

@router.put("/{course_id}/step3", response_model=CourseResponse)
async def update_course_step3(
    course_id: int,
    course_data: CourseCreateStep3,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.name != 'instructor':
        raise HTTPException(status_code=403, detail="Not authorized")
    return CourseService.update_course_step3(db, course_id, course_data, current_user.id)

@router.put("/{course_id}/step4", response_model=CourseResponse)
async def update_course_step4(
    course_id: int,
    course_data: CourseCreateStep4,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.name != "instructor":
        raise HTTPException(status_code=403, detail="Not Authorized")
    return CourseService.update_course_step4(db, course_id, course_data, current_user.id)

@router.post("/{course_id}/submit", response_model=CourseResponse)
async def submit_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.name != "instructor":
        raise HTTPException(status_code=403, detail="Not authorized")
    return CourseService.submit_course_for_review(db, course_id, current_user.id)

@router.get("/drafts", response_model=List[CourseResponse])
async def get_drafts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.name != "instructor":
        raise HTTPException(status_code=403, detail="Not authorized")
    return CourseService.get_instructor_drafts(db, current_user.id)

@router.get("/pending-approval", response_model=List[CourseResponse])
async def get_pending_approval(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.name != "instructor":
        raise HTTPException(status_code=403, detail="Not authorized")
    return CourseService.get_instructor_pending_courses(db, current_user.id)

@router.get("/my-courses", response_model=List[CourseResponse])
async def get_my_courses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.name != "instructor":
        raise HTTPException(status_code=403, detail="Not authorized")
    return CourseService.get_instructor_published_courses(db, current_user.id)

@router.put("/{course_id}/status")
async def update_course_status(
    course_id: int,
    status_data: CourseStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.name != "instructor":
        raise HTTPException(status_code=403, detail="Not authorized")
    return CourseService.update_course_status(db, course_id, current_user.id, status_data.status)

@router.get("/{course_id}", response_model=CourseResponse)
async def get_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.name != "instructor":
        raise HTTPException(status_code=403, detail="Not authorized")
    return CourseService.get_instructor_course(db, course_id, current_user.id)

@router.get("/search/instructors", response_model=List[UserResponse])
async def search_instructors(
    q: str = Query(..., min_length=2),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.name != "instructor":
        raise HTTPException(status_code=403, detail="Not authorized")
    return CourseService.search_instructors(db, q)

@router.get("/all/instructors", response_model=List[UserResponse])
async def get_all_instructors(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.name != "instructor":
        raise HTTPException(status_code=403, detail="Not authorized")
    return CourseService.get_all_instructors(db)

async def save_file(file: UploadFile, subfolder: str) -> str:
    if not file:
        return None
    upload_dir = Path(f"uploads/{subfolder}")
    upload_dir.mkdir(parents=True, exist_ok=True)
    file_path = upload_dir / file.filename
    with file_path.open("wb") as buffer:
        buffer.write(await file.read())
    return str(file_path)

