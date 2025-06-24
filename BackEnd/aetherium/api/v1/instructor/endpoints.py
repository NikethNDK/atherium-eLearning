from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from aetherium.database.db import get_db
from aetherium.utils.jwt_utils import get_current_user
from aetherium.models.user import User
from aetherium.services.course_service import CourseService
from aetherium.schemas.course import *
from typing import List, Optional
import os
import shutil
from pathlib import Path

router = APIRouter(prefix="/instructor", tags=["instructor"])

@router.post("/courses/step1", response_model=CourseResponse)
async def create_course_step1(
    course_data: CourseCreateStep1,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.name != "instructor":
        raise HTTPException(status_code=403, detail="Instructor access required")
    
    course = CourseService.create_or_update_course_step1(db, course_data, current_user.id)
    return course

@router.put("/courses/{course_id}/step2", response_model=CourseResponse)
async def update_course_step2(
    course_id: int,
    description: Optional[str] = Form(None),
    learning_objectives: Optional[str] = Form(None),
    target_audiences: Optional[str] = Form(None),
    requirements: Optional[str] = Form(None),
    cover_image: Optional[UploadFile] = File(None),
    trailer_video: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.name != "instructor":
        raise HTTPException(status_code=403, detail="Instructor access required")
    
    # Handle file uploads
    cover_image_path = None
    trailer_video_path = None
    
    if cover_image:
        upload_dir = Path("uploads/cover_images")
        upload_dir.mkdir(parents=True, exist_ok=True)
        cover_image_path = f"uploads/cover_images/{cover_image.filename}"
        with open(cover_image_path, "wb") as buffer:
            shutil.copyfileobj(cover_image.file, buffer)
    
    if trailer_video:
        upload_dir = Path("uploads/trailers")
        upload_dir.mkdir(parents=True, exist_ok=True)
        trailer_video_path = f"uploads/trailers/{trailer_video.filename}"
        with open(trailer_video_path, "wb") as buffer:
            shutil.copyfileobj(trailer_video.file, buffer)
    
    # Parse arrays from form data
    learning_objectives_list = []
    if learning_objectives:
        learning_objectives_list = [obj.strip() for obj in learning_objectives.split('\n') if obj.strip()]
    
    target_audiences_list = []
    if target_audiences:
        target_audiences_list = [aud.strip() for aud in target_audiences.split('\n') if aud.strip()]
    
    requirements_list = []
    if requirements:
        requirements_list = [req.strip() for req in requirements.split('\n') if req.strip()]
    
    course_data = CourseCreateStep2(
        description=description,
        learning_objectives=learning_objectives_list,
        target_audiences=target_audiences_list,
        requirements=requirements_list
    )
    
    course = CourseService.update_course_step2(
        db, course_id, course_data, current_user.id, 
        cover_image_path, trailer_video_path
    )
    return course

@router.put("/courses/{course_id}/step3", response_model=CourseResponse)
async def update_course_step3(
    course_id: int,
    course_data: CourseCreateStep3,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.name != "instructor":
        raise HTTPException(status_code=403, detail="Instructor access required")
    
    course = CourseService.update_course_step3(db, course_id, course_data, current_user.id)
    return course

@router.put("/courses/{course_id}/step4", response_model=CourseResponse)
async def update_course_step4(
    course_id: int,
    course_data: CourseCreateStep4,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.name != "instructor":
        raise HTTPException(status_code=403, detail="Instructor access required")
    
    course = CourseService.update_course_step4(db, course_id, course_data, current_user.id)
    return course

@router.post("/courses/{course_id}/submit", response_model=CourseResponse)
async def submit_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.name != "instructor":
        raise HTTPException(status_code=403, detail="Instructor access required")
    
    course = CourseService.submit_course_for_review(db, course_id, current_user.id)
    return course

@router.get("/courses/drafts", response_model=List[CourseResponse])
async def get_drafts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.name != "instructor":
        raise HTTPException(status_code=403, detail="Instructor access required")
    
    return CourseService.get_instructor_drafts(db, current_user.id)

@router.get("/courses/pending-approval", response_model=List[CourseResponse])
async def get_pending_approval(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.name != "instructor":
        raise HTTPException(status_code=403, detail="Instructor access required")
    
    return CourseService.get_instructor_pending_courses(db, current_user.id)

@router.get("/courses/my-courses", response_model=List[CourseResponse])
async def get_my_courses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.name != "instructor":
        raise HTTPException(status_code=403, detail="Instructor access required")
    
    return CourseService.get_instructor_published_courses(db, current_user.id)

@router.get("/courses/{course_id}", response_model=CourseResponse)
async def get_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.name != "instructor":
        raise HTTPException(status_code=403, detail="Instructor access required")
    
    return CourseService.get_instructor_course(db, course_id, current_user.id)

@router.put("/courses/{course_id}/status", response_model=CourseResponse)
async def update_course_status(
    course_id: int,
    status_data: CourseStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.name != "instructor":
        raise HTTPException(status_code=403, detail="Instructor access required")
    
    return CourseService.update_course_status(db, course_id, current_user.id, status_data.status)

@router.delete("/courses/{course_id}")
async def delete_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.name != "instructor":
        raise HTTPException(status_code=403, detail="Instructor access required")
    
    course = CourseService.get_instructor_course(db, course_id, current_user.id)
    db.delete(course)
    db.commit()
    return {"message": "Course deleted successfully"}

@router.get("/courses/search/instructors")
async def search_instructors(
    q: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.name != "instructor":
        raise HTTPException(status_code=403, detail="Instructor access required")
    
    return CourseService.search_instructors(db, q)

@router.get("/courses/all/instructors")
async def get_all_instructors(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.name != "instructor":
        raise HTTPException(status_code=403, detail="Instructor access required")
    
    return CourseService.get_all_instructors(db)
