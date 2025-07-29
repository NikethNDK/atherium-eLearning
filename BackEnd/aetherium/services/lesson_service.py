
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, func
from typing import List, Optional, Dict, Any,Union
from fastapi import HTTPException, UploadFile
from datetime import datetime
from aetherium.core.logger import logger
from aetherium.models.courses.lesson import Lesson, LessonContent, Assessment, Question
from aetherium.models.courses.section import Section
from aetherium.models.courses.progress import LessonProgress, SectionProgress, CourseProgress
from aetherium.schemas.lesson import (
    LessonCreate, LessonUpdate, LessonResponse,
    LessonContentCreate, AssessmentCreate
)
from aetherium.models.enum import ContentType
from aetherium.services.cloudinary_service import cloudinary_service
import os
import io
import tempfile
import shutil
from pathlib import Path
from aetherium.utils.tasks import upload_file_task
from werkzeug.utils import secure_filename

class LessonService:
    def __init__(self, db: Session):
        self.db = db
    
    async def create_lesson(self, section_id: int, lesson_data: LessonCreate):
        """Create a new lesson"""
        section= self.db.query(Section).filter(Section.id == section_id).first()
        if not section:
            raise HTTPException(status_code=404,detail="Section not found")
        
        lesson=Lesson(
            name=lesson_data.name,
            section_id=section_id,
            content_type=lesson_data.content_type,
            duration=lesson_data.duration,
            description=lesson_data.description,
            order_index=lesson_data.order_index
        )
        self.db.add(lesson)
        self.db.flush()

        #Adding content to the lesson
        if lesson_data.content and lesson_data.content_type !=ContentType.ASSESSMENT:
            content=LessonContent(
                lesson_id=lesson.id,
                **lesson_data.content.model_dump(exclude_none=True)
            )
            self.db.add(content)
        #Assesment creation
        if lesson_data.assessment and lesson_data.content_type ==ContentType.ASSESSMENT:
            assessment=Assessment(
                lesson_id=lesson.id,
                title=lesson_data.assessment.title,
                description=lesson_data.assessment.description,
                passing_score=lesson_data.assessment.passing_score,
                time_limit=lesson_data.assessment.time_limit,
                max_attempts=lesson_data.assessment.max_attempts,
                is_active=True

            )
            self.db.add(assessment)
            self.db.flush()

            #Question createion
            for question_data in lesson_data.assessment.questions:
                question=Question(
                    assessment_id=assessment.id,
                    question_text=question_data.question_text,
                    options=question_data.options,
                    correct_answer=question_data.correct_answer,
                    points=question_data.points,
                    order_index=question_data.order_index
                )
                self.db.add(question)
        self.db.commit()
        self.db.refresh(lesson)
        return lesson



    # async def upload_lesson_file(self, lesson_id: int, file: UploadFile, file_type: str) -> Dict[str, Any]:
    #     """Upload file for lesson content - direct upload (for small files <10MB)"""
    #     lesson = self.db.query(Lesson).filter(Lesson.id == lesson_id).first()
    #     if not lesson:
    #         raise HTTPException(status_code=404, detail="Lesson not found")

    #     try:
    #         # Read file content into memory
    #         file_content = await file.read()
    #         file_stream = io.BytesIO(file_content)
    #         file_stream.seek(0)

    #         if len(file_content)==0:
    #             raise ValueError("Uploaded file is empty")
    #         # Await the Cloudinary upload
    #         upload_result = await self._upload_to_cloudinary(
    #             file_stream=file_stream,
    #             file_type=file_type,
    #             filename=file.filename
    #         )

    #         # Ensure we have the expected result structure
    #         if not all(k in upload_result for k in ['secure_url', 'public_id']):
    #             raise ValueError("Invalid Cloudinary response format")

    #         # Update database
    #         return await self._update_lesson_content(lesson_id, upload_result, file_type)

    #     except Exception as e:
    #         self.db.rollback()
    #         raise HTTPException(
    #             status_code=500,
    #             detail=f"Direct upload failed: {str(e)}"
    #         )
    #     finally:
    #         file_stream.close()

    async def upload_lesson_file(self,lesson_id: int,file_stream: io.BytesIO,file_type: str,filename: str) -> Dict[str, Any]:
        """Upload file for lesson content - direct upload"""
        try:
            # Verify stream content
            current_pos = file_stream.tell()
            file_stream.seek(0, 2)  # Seek to end
            file_size = file_stream.tell()
            file_stream.seek(current_pos)  # Reset position

            if file_size == 0:
                raise ValueError("Cannot process empty file stream")

            # Upload to Cloudinary
            upload_result = await self._upload_to_cloudinary(
                file_stream=file_stream,
                file_type=file_type,
                filename=filename
            )
 

            # Update database
            return await self._update_lesson_content(lesson_id, upload_result, file_type)
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=500,
                detail=f"Direct upload failed: {str(e)}"
            )


    async def _update_lesson_content(self, lesson_id: int, upload_result: Dict[str, Any], file_type: str) -> Dict[str, Any]:
        """Robust database update with proper error handling"""
        db = self.db
        logger.info(f"Updating lesson content for lesson_id {lesson_id} with upload_result {upload_result}")
        try:
            content = db.query(LessonContent).filter(
                LessonContent.lesson_id == lesson_id
            ).first()
            
            if not content:
                content = LessonContent(lesson_id=lesson_id)
                db.add(content)
            
            # Required fields
            content.file_url = upload_result.get('url','')
            content.file_public_id = upload_result['public_id']
            content.file_type = file_type
            content.file_size = upload_result.get('bytes', 0)
            # content.upload_status = "completed"
            # Video-specific fields
            if file_type == "video":
                content.video_duration = upload_result.get('duration', 0)
                content.video_thumbnail = upload_result.get('thumbnail_url', '')
            
            db.commit()  # Explicit commit
            logger.info(f"Successfully updated lesson {lesson_id} content")
            return upload_result
            
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to update lesson content: {str(e)}")
            raise Exception(f"Database update failed: {str(e)}")

    async def upload_lesson_file_async(self,lesson_id: int,file_stream: io.BytesIO,file_type: str,filename: str) -> Dict[str, Any]:
        """Async upload for large files (>10MB) with better error handling"""
        lesson = self.db.query(Lesson).filter(Lesson.id == lesson_id).first()
        if not lesson:
            raise HTTPException(status_code=404, detail="Lesson not found")

        try:
            # Verify stream content
            original_position = file_stream.tell()
            file_stream.seek(0, 2)  # Seek to end to check size
            file_size = file_stream.tell()
            file_stream.seek(original_position)  # Reset to original position

            if file_size == 0:
                raise ValueError("Cannot process empty file")

            # Read all content for Celery task
            file_stream.seek(0)  # Ensure we're at the beginning
            file_content = file_stream.read()

            if len(file_content) == 0:
                raise ValueError("Failed to read file content")

            # Create or update processing record
            content = self.db.query(LessonContent).filter(
                LessonContent.lesson_id == lesson_id
            ).first()

            if not content:
                content = LessonContent(
                    lesson_id=lesson_id,
                    file_type=file_type,
                    upload_status="processing"
                )
                self.db.add(content)
            else:
                content.upload_status = "processing"
                content.file_type = file_type

            self.db.commit()

            # Import here to avoid circular imports
            from aetherium.utils.tasks import upload_file_task

            # Start Celery task with proper parameters
            task = upload_file_task.delay(
                lesson_id=lesson_id,
                file_content=file_content,
                file_type=file_type,
                filename=filename or f"file_{lesson_id}"
            )

            logger.info(f"Started async upload task {task.id} for lesson {lesson_id}")

            return {
                "task_id": task.id,
                "status": "processing",
                "message": "File upload started. Please check status using the task_id.",
                "lesson_id": lesson_id,
                "file_size": len(file_content)
            }

        except Exception as e:
            # Mark as failed in database
            try:
                content = self.db.query(LessonContent).filter(
                    LessonContent.lesson_id == lesson_id
                ).first()
                if content:
                    content.upload_status = "failed"
                    self.db.commit()
            except Exception as db_err:
                logger.error(f"Failed to update status to failed: {str(db_err)}")
                self.db.rollback()

            logger.error(f"Async upload setup failed for lesson {lesson_id}: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Async upload setup failed: {str(e)}"
            )

    async def _upload_to_cloudinary(self, file_stream: io.BytesIO, file_type: str, filename: str) -> Dict[str, Any]:
        """Centralized Cloudinary upload logic"""
        try:
            if file_type == "video":
                result = await cloudinary_service.upload_video_from_stream(
                    file_stream, 
                    filename=filename
                )
            elif file_type == "pdf":
                result = await cloudinary_service.upload_pdf_from_stream(
                    file_stream,
                    filename=filename
                )
            else:
                result = await cloudinary_service.upload_file_from_stream(
                    file_stream,
                    filename=filename
                )

            # Ensure we have a proper result before returning
            if not isinstance(result, dict):
                raise ValueError("Invalid upload response format")

            return result

        except Exception as e:
            raise Exception(f"Cloudinary upload failed: {str(e)}")

    
    
    def get_lesson(self,lesson_id:int) -> Optional[LessonResponse]:
        lesson=self.db.query(Lesson).options(
            joinedload(Lesson.lesson_content)
        ).filter(Lesson.id==lesson_id).first()
        if not lesson:
            raise HTTPException(status_code=404,details="Lesson not found")
        else:
            return lesson
            return LessonResponse.model_validate(lesson)
    
    def get_lessons_by_section(self, section_id: int):
        lessons = self.db.query(Lesson).options(
            joinedload(Lesson.lesson_content)
        ).filter(Lesson.section_id == section_id).order_by(Lesson.order_index).all()
        
        # return [LessonResponse.model_validate(lesson) for lesson in lessons]
        return lessons
    
    
    async def update_lesson(self, lesson_id: int, lesson_data: LessonUpdate) -> LessonResponse:
        lesson = self.db.query(Lesson).filter(Lesson.id == lesson_id).first()
        if not lesson:
            raise HTTPException(status_code=404, detail="Lesson not found")
    
        # Update basic lesson fields
        update_data = lesson_data.model_dump(exclude_none=True, exclude={"content", "assessment"})
        for key, value in update_data.items():
            setattr(lesson, key, value)
    
        # Handle content update (for non-assessment lessons)
        if lesson_data.content and lesson.content_type != ContentType.ASSESSMENT:
            content = self.db.query(LessonContent).filter(
                LessonContent.lesson_id == lesson_id
            ).first()
    
            if content:
                content_data = lesson_data.content.model_dump(exclude_none=True)
                for key, value in content_data.items():
                    setattr(content, key, value)
            else:
                # Create new content if it doesn't exist
                content = LessonContent(
                    lesson_id=lesson_id,
                    **lesson_data.content.model_dump(exclude_none=True)
                )
                self.db.add(content)
    
        # Handle assessment update (for assessment lessons)
        if lesson_data.assessment and lesson.content_type == ContentType.ASSESSMENT:
            assessment = self.db.query(Assessment).filter(
                Assessment.lesson_id == lesson_id
            ).first()
    
            if assessment:
                # Update existing assessment
                assessment_data = lesson_data.assessment.model_dump(exclude_none=True, exclude={"questions"})
                for key, value in assessment_data.items():
                    setattr(assessment, key, value)
    
                # Handle questions update
                if lesson_data.assessment.questions:
                    # First delete existing questions
                    self.db.query(Question).filter(
                        Question.assessment_id == assessment.id
                    ).delete()
    
                    # Then add all questions (including updates and new ones)
                    for i, question_data in enumerate(lesson_data.assessment.questions):
                        question = Question(
                            assessment_id=assessment.id,
                            question_text=question_data.question_text,
                            options=question_data.options,
                            correct_answer=question_data.correct_answer,
                            points=question_data.points,
                            order_index=i
                        )
                        self.db.add(question)
            else:
                # Create new assessment if it doesn't exist
                assessment = Assessment(
                    lesson_id=lesson_id,
                    title=lesson_data.assessment.title,
                    description=lesson_data.assessment.description,
                    passing_score=lesson_data.assessment.passing_score,
                    time_limit=lesson_data.assessment.time_limit,
                    max_attempts=lesson_data.assessment.max_attempts,
                    is_active=True
                )
                self.db.add(assessment)
                self.db.flush()
    
                # Add questions
                for i, question_data in enumerate(lesson_data.assessment.questions):
                    question = Question(
                        assessment_id=assessment.id,
                        question_text=question_data.question_text,
                        options=question_data.options,
                        correct_answer=question_data.correct_answer,
                        points=question_data.points,
                        order_index=i
                    )
                    self.db.add(question)
    
        self.db.commit()
        self.db.refresh(lesson)
        return LessonResponse.model_validate(lesson)

    """Delete lesson and assosiated files"""
    async def delete_lesson(self, lesson_id: int) -> bool:
     
        lesson = self.db.query(Lesson).filter(Lesson.id == lesson_id).first()
        if not lesson:
            return False
        
        # Delete associated file from Cloudinary
        content = self.db.query(LessonContent).filter(
            LessonContent.lesson_id == lesson_id
        ).first()
        
        if content and content.file_public_id:
            await cloudinary_service.delete_file(
                content.file_public_id, 
                content.file_type or "auto"
            )
        
        self.db.delete(lesson)
        self.db.commit()
        
        return True
    
    """Reorder lessons in a section"""
    def reorder_lessons(self, section_id: int, lesson_orders: List[Dict[str, int]]) -> bool:
        for order_data in lesson_orders:
            lesson_id = order_data["lesson_id"]
            new_order = order_data["order_index"]
            
            lesson = self.db.query(Lesson).filter(
                and_(Lesson.id == lesson_id, Lesson.section_id == section_id)
            ).first()
            
            if lesson:
                lesson.order_index = new_order
        
        self.db.commit()
        return True