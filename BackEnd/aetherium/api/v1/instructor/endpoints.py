from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session,Query
from aetherium.database.db import get_db
from aetherium.utils.jwt_utils import get_current_user
from aetherium.models.user import User
from aetherium.models.courses import Course,Section,Lesson
from aetherium.services.course_service import CourseService
from aetherium.schemas.course import *
from typing import List, Optional
import os
import shutil
from pathlib import Path
from aetherium.services.lesson_service import LessonService
from aetherium.schemas.lesson import LessonCreate, LessonUpdate, LessonResponse,LessonContentCreate, AssessmentCreate
from aetherium.core.logger import logger
from celery.result import AsyncResult
from aetherium.services.instructoranalytics_service import CourseAnalyticsService
from aetherium.schemas.instructor_analytics import *

router = APIRouter(prefix="/instructor", tags=["instructor"])


@router.post("/courses/step1", response_model=CourseResponse)
async def create_course_step1(
    course_data: CourseCreateStep1,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Course Creattion Step 1"""
    if current_user.role.name != "instructor":
        raise HTTPException(status_code=403, detail="Instructor access required")
    
    course = CourseService.create_step1(db, course_data, current_user.id)
    return course

@router.put("/courses/{course_id}/step1", response_model=CourseResponse)
async def update_course_step1(
    course_id: int,
    course_data: CourseCreateStep1,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.name != "instructor":
        raise HTTPException(status_code=403, detail="Instructor access required")
    
    course = db.query(Course).filter(Course.id == course_id,Course.instructor_id == current_user.id).first()
    
    if not course:
        raise HTTPException(status_code=404, detail="Course not found or not authorized")
    for field, value in course_data.model_dump().items():
        if value is not None:
            setattr(course, field, value)

    db.commit()
    db.refresh(course)
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
    """Course creation step 2"""
    if current_user.role.name != "instructor":
        raise HTTPException(status_code=403, detail="Instructor access required")
    
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
async def update_course_step3(course_id: int,db: Session = Depends(get_db),current_user: User = Depends(get_current_user)):
    """Course Createiion step 3"""
    course = db.query(Course).filter(Course.id == course_id,Course.instructor_id == current_user.id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    sections=db.query(Section).filter(Section.course_id==course_id).all()
    if not sections:
        raise HTTPException(status_code=404,detail="Course should have atleast one section")
    for section in sections:
        if not section.lessons:
            raise HTTPException(status_code=404,detail=f"Section {section.name} should have atleast one lesson")

    course.curriculum_complete = True
    db.commit()
    db.refresh(course)
    return course

@router.put("/courses/{course_id}/step4", response_model=CourseResponse)
async def update_course_step4(
    course_id: int,
    course_data: CourseCreateStep4,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Course Creation final step"""
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
    """Submitting the course for admin review"""
    if current_user.role.name != "instructor":
        raise HTTPException(status_code=403, detail="Instructor access required")
    
    course = CourseService.submit_course_for_review(db, course_id, current_user.id)
    return course


@router.get("/courses/drafts", response_model=List[CourseResponse])
async def get_drafts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Instructor Course Drafts"""
    if current_user.role.name != "instructor":
        raise HTTPException(status_code=403, detail="Instructor access required")
    
    return CourseService.get_instructor_drafts(db, current_user.id)


@router.get("/courses/pending-approval", response_model=List[CourseResponse])
async def get_pending_approval(db: Session = Depends(get_db),current_user: User = Depends(get_current_user)):
    
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
async def get_instructor_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.name != "instructor":
        raise HTTPException(status_code=403, detail="Instructor access required")
    
    course = CourseService.get_instructor_course_detail(
        db=db, 
        course_id=course_id, 
        instructor_id=current_user.id
    )
    
    return course




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
    """Delete Instructor's course"""
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
    """Searcing other instructors for doing collab---not implemented"""
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

@router.get("/dashboard/stats")
async def get_instructor_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Dashboard data including analytics"""
    if current_user.role.name != "instructor":
        raise HTTPException(status_code=403, detail="Instructor access required")
    
    stats = CourseService.get_instructor_dashboard_stats(
        db=db, 
        instructor_id=current_user.id
    )
    
    return stats


@router.post("/courses/{course_id}/sections", response_model=SectionResponse)
async def create_section(
    course_id: int,
    section_data: SectionCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Course Section Creation"""
    if current_user.role.name != "instructor":
        raise HTTPException(status_code=403, detail="Instructor access required")
    
    course = db.query(Course).filter(Course.id == course_id, Course.instructor_id == current_user.id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found or not authorized")
    
    # Create the section
    new_section = Section(course_id=course_id, name=section_data.name)
    db.add(new_section)
    db.commit()
    db.refresh(new_section)
    return new_section

@router.put("/sections/{section_id}", response_model=SectionResponse)
async def update_section(
    section_id: int,
    section_data: SectionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Updating the Course Section"""
    if current_user.role.name != "instructor":
        raise HTTPException(status_code=403, detail="Instructor access required")
    
    section = db.query(Section).filter(Section.id == section_id).first()
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")
    
    course = db.query(Course).filter(Course.id == section.course_id, Course.instructor_id == current_user.id).first()
    if not course:
        raise HTTPException(status_code=403, detail="Not authorized to update this section")

    section.name = section_data.name
    db.commit()
    db.refresh(section)
    return section

@router.delete("/sections/{section_id}")
async def delete_section(
    section_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete Course Section"""
    if current_user.role.name != "instructor":
        raise HTTPException(status_code=403, detail="Instructor access required")
    
    section = db.query(Section).filter(Section.id == section_id).first()
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")
    
    # Ensure the instructor owns the course this section belongs to
    course = db.query(Course).filter(Course.id == section.course_id, Course.instructor_id == current_user.id).first()
    if not course:
        raise HTTPException(status_code=403, detail="Not authorized to delete this section")

    db.delete(section)
    db.commit()
    return {"message": "Section deleted successfully"}



@router.post("/sections/{section_id}/lessons", response_model=LessonResponse)
async def create_new_lesson(section_id: int,lesson: LessonCreate,db: Session = Depends(get_db),current_user = Depends(get_current_user)):
    
    """Create new lesson in a section"""
    service = LessonService(db)
    return await service.create_lesson(section_id, lesson)

@router.get("/lessons/{lesson_id}", response_model=LessonResponse)
async def get_lesson(
    lesson_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get lesson by ID"""
    service = LessonService(db)
    lesson = service.get_lesson(lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return lesson

@router.get("/sections/{section_id}/lessons", response_model=List[LessonResponse])
async def get_lessons_by_section(
    section_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get all lessons in a section"""
    service = LessonService(db)
    return service.get_lessons_by_section(section_id)

@router.put("/lessons/{lesson_id}", response_model=LessonResponse)
async def update_lesson(
    lesson_id: int,
    lesson: LessonUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Update lesson"""
    service = LessonService(db)
    return await service.update_lesson(lesson_id, lesson)

@router.get("/lessons/{lesson_id}/assessment")
async def get_lesson_assessment(
    lesson_id: int,
    db: Session = Depends(get_db)
):
    """Get assessment details for a lesson"""
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    # Return empty assessment structure if no assessment exists
    if not lesson.assessments:
        return {
            "title": "",
            "description": "",
            "passing_score": 70,
            "time_limit": None,
            "max_attempts": 3,
            "questions": []
        }
    
    assessment = lesson.assessments[0]
    return {
        "title": assessment.title,
        "description": assessment.description,
        "passing_score": assessment.passing_score,
        "time_limit": assessment.time_limit,
        "max_attempts": assessment.max_attempts,
        "questions": [{
            "id": q.id,
            "question_text": q.question_text,
            "options": q.options or [],
            "correct_answer": q.correct_answer,
            "points": q.points,
            "order_index": q.order_index
        } for q in assessment.questions]
    }

@router.delete("/lessons/{lesson_id}")
async def delete_lesson(
    lesson_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Delete lesson"""
    service = LessonService(db)
    success = await service.delete_lesson(lesson_id)
    if not success:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return {"message": "Lesson deleted successfully"}


import os
import io
@router.post("/lessons/{lesson_id}/upload-file")
async def upload_lesson_file(
    lesson_id: int,
    file: UploadFile = File(...),
    file_type: str = Form(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Handle file uploads with size-based processing (direct or via Celery)"""
    # Validate file type (keep existing validation)
    allowed_types = ["video", "pdf", "image", "document"]
    if file_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"File type must be one of: {', '.join(allowed_types)}"
        )

    """Handle file uploads with size-based processing"""
    try:
        # Verify file content immediately
        file_content = await file.read()
        if len(file_content) == 0:
            raise HTTPException(status_code=400, detail="Uploaded file is empty")
        
        # Verify PDF header if it's a PDF
        if file_type == "pdf" and not file_content.startswith(b'%PDF-'):
            raise HTTPException(status_code=400, detail="Invalid PDF file format")

        # Create new stream for processing
        file_stream = io.BytesIO(file_content)
        file_stream.seek(0)

        service = LessonService(db)
        
        if len(file_content) > 10 * 1024 * 1024:  # >10MB - Celery path
            return await service.upload_lesson_file_async(
                lesson_id=lesson_id,
                file_stream=file_stream,
                file_type=file_type,
                filename=file.filename
            )
        else:
            result= await service.upload_lesson_file(
                lesson_id=lesson_id,
                file_stream=file_stream,
                file_type=file_type,
                filename=file.filename
            )
            result["status"] = "completed"
            return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Upload failed: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="File upload failed")

@router.get("/lessons/upload-status/{task_id}")
async def check_task_status(
    task_id: str,
    current_user = Depends(get_current_user)
):
    """Check specific task status by task_id"""
    try:
        from celery.result import AsyncResult
        task_result = AsyncResult(task_id)
        
        response = {
            "task_id": task_id,
            "state": task_result.state,
        }
        
        if task_result.state == 'PROGRESS':
            response.update(task_result.info or {})
        elif task_result.state == 'SUCCESS':
            response["result"] = task_result.info
        elif task_result.state == 'FAILURE':
            response["error"] = str(task_result.info)
        
        return response
        
    except Exception as e:
        logger.error(f"Error checking task {task_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to check task status: {str(e)}"
        )
    
@router.post("/lessons/{lesson_id}/link-content")
async def add_link_content(
    lesson_id: int,
    content: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Add external link content to lesson"""
    service = LessonService(db)
    
    # Validate required fields for link content
    if "external_url" not in content:
        raise HTTPException(status_code=400, detail="external_url is required")
    
    content_create = LessonContentCreate(**content)
    lesson_update = LessonUpdate(content=content_create)
    
    return await service.update_lesson(lesson_id, lesson_update)

@router.post("/lessons/{lesson_id}/text-content")
async def add_text_content(
    lesson_id: int,
    content: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Add text content to lesson"""
    service = LessonService(db)
    
    # Validate required fields for text content
    if "text_content" not in content:
        raise HTTPException(status_code=400, detail="text_content is required")
    
    content_create = LessonContentCreate(**content)
    lesson_update = LessonUpdate(content=content_create)
    
    return await service.update_lesson(lesson_id, lesson_update)

@router.post("/sections/{section_id}/lessons/reorder")
async def reorder_lessons(
    section_id: int,
    lesson_orders: List[Dict[str, int]],
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Reorder lessons in a section"""
    service = LessonService(db)
    success = service.reorder_lessons(section_id, lesson_orders)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to reorder lessons")
    return {"message": "Lessons reordered successfully"}

@router.post("/lessons/bulk-create")
async def bulk_create_lessons(
    lessons: List[Dict[str, Any]],
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Bulk create lessons"""
    service = LessonService(db)
    created_lessons = []
    
    for lesson_data in lessons:
        section_id = lesson_data.pop("section_id")
        lesson_create = LessonCreate(**lesson_data)
        lesson = await service.create_lesson(section_id, lesson_create)
        created_lessons.append(lesson)
    
    return {"lessons": created_lessons, "count": len(created_lessons)}

# Progress endpoints
@router.post("/lessons/{lesson_id}/progress")
async def update_lesson_progress(
    lesson_id: int,
    progress_data: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Update lesson progress for current user"""
    from aetherium.services.progress_service import ProgressService
    from aetherium.schemas.progress import LessonProgressUpdate
    
    service = ProgressService(db)
    progress_update = LessonProgressUpdate(**progress_data)
    
    return await service.update_lesson_progress(
        current_user.id, lesson_id, progress_update
    )

@router.get("/lessons/{lesson_id}/progress")
async def get_lesson_progress(
    lesson_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get lesson progress for current user"""
    from aetherium.services.progress_service import ProgressService
    if current_user.role.name != "instructor":
        raise HTTPException(status_code=403, detail="Instructor access required")
    service = ProgressService(db)
    progress = service.get_lesson_progress(current_user.id, lesson_id)
    
    if not progress:
        # Return default progress if none exists
        return {
            "user_id": current_user.id,
            "lesson_id": lesson_id,
            "is_completed": False,
            "progress_percentage": 0.0,
            "time_spent": 0
        }
    
    return progress



@router.get("/courses/{course_id}/analytics", response_model=CourseAnalyticsResponse)
async def get_course_analytics(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.name != "instructor":
        raise HTTPException(status_code=403, detail="Instructor access required")
    
    return CourseAnalyticsService.get_course_analytics(db, course_id, current_user.id)


@router.get("/courses/{course_id}/purchase-stats", response_model=PurchaseStatsResponse)
async def get_purchase_stats(
    course_id: int,
    period: str = "monthly",  
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.name != "instructor":
        raise HTTPException(status_code=403, detail="Instructor access required")
    
    return CourseAnalyticsService.get_purchase_stats(db, course_id, current_user.id, period)


@router.get("/courses/{course_id}/student-progress", response_model=List[StudentProgressResponse])
async def get_student_progress(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.name != "instructor":
        raise HTTPException(status_code=403, detail="Instructor access required")
    
    return CourseAnalyticsService.get_student_progress(db, course_id, current_user.id)