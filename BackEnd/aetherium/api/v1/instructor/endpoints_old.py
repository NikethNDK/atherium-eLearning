from fastapi import APIRouter,Depends,HTTPException,UploadFile,File
from sqlalchemy.orm import Session
from typing import List
from aetherium.schemas.course import CourseCreateStep1,CourseCreateStep2,CourseCreateStep3,CourseCreateStep4,CourseResponse
from aetherium.services.course_service import CourseService
from aetherium.services.user_service import UserService
from aetherium.database.db import get_db
from aetherium.utils.jwt_utils import get_current_user
from aetherium.models.user import User
import os,logging   
from pathlib import Path

router=APIRouter(
    prefix="/instructor/courses",tags=["Instructor Courses"]
)

logger=logging.getLogger(__name__)

@router.post("/step1",response_model=CourseCreateStep1)
async def create_course_step1(
    course_data:CourseCreateStep1,
    db:Session=Depends(get_db),
    current_user:User=Depends(get_current_user)
):
    print("This is course_data",course_data)
    print("Thjis is course data using model_dump",course_data.model_dump())
    if not current_user.role.name=="instructor":
        raise HTTPException(status_code=403, detail="Not Authorized")
    
    logger.debug(f"Recieved course data: {course_data.model_dump()}")
    return CourseService.create_or_update_course_step1(db,course_data,current_user.id)

@router.post("/{course_id}/step2")
async def update_course_step2(
    course_id:int,
    course_data:CourseCreateStep2,
    cover_image:UploadFile=File(None),
    trailer_video:UploadFile=File(None),
    db:Session=Depends(get_db),
    current_user:User=Depends(get_current_user)

):
    if not current_user.role.name=="instructor":
        raise HTTPException(status_code=403, detail='Not authorized')
    cover_image_path=await save_file(cover_image,"cover_images")if cover_image else None
    trailer_video_path=await save_file(trailer_video,"trailers") if trailer_video else None
    return CourseService.update_course_step2(
        db,course_id,course_data,current_user.id,cover_image_path,trailer_video_path
    )


@router.post("/{course_id}/step3",response_model=CourseResponse)
async def update_course_step3(
    course_id:int,
    course_data:CourseCreateStep3,
    db:Session=Depends(get_db),
    current_user:User=Depends(get_current_user)
):
    if not current_user.role.name=='instructor':
        raise HTTPException(status_code=403, detail="Not authorized")
    return CourseService.update_course_step3(db,course_id,course_data,current_user.id)

@router.post("/{course_id}/step4",response_model=CourseResponse)
async def update_course_step4(
    course_id:int,
    course_data:CourseCreateStep4,
    db: Session=Depends(get_db),
    current_user:User=Depends(get_current_user)
):
    if not current_user.role.name =="instructor":
        raise HTTPException(status_code=403, detail="Not Authorized")
    return CourseService.update_course_step4(db,course_id,course_data,current_user.id)


@router.post("/{course_id}/submit", response_model=CourseResponse)
async def submit_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user.role.name == "instructor":
        raise HTTPException(status_code=403, detail="Not authorized")
    return CourseService.submit_course_for_review(db, course_id, current_user.id)

@router.get("/drafts", response_model=List[CourseResponse])
async def get_drafts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user.role == "instructor":
        raise HTTPException(status_code=403, detail="Not authorized")
    return CourseService.get_instructor_drafts(db, current_user.id)

@router.get("/instructors/search", response_model=List[dict])
async def search_instructors(
    query: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return UserService.search_instructors(db, query)

async def save_file(file: UploadFile, subfolder: str) -> str:
    if not file:
        return None
    upload_dir = Path(f"uploads/{subfolder}")
    upload_dir.mkdir(parents=True, exist_ok=True)
    file_path = upload_dir / file.filename
    with file_path.open("wb") as buffer:
        buffer.write(await file.read())
    return str(file_path)