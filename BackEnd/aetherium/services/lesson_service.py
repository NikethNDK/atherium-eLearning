
from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from typing import List, Optional, Dict, Any
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

       
    # async def upload_lesson_file(self,lesson_id: int,file: UploadFile,file_type: str) -> Dict[str, Any]:
    #     """Upload file for lesson content"""
    #     lesson = self.db.query(Lesson).filter(Lesson.id == lesson_id).first()
    #     if not lesson:
    #         raise HTTPException(status_code=404, detail="Lesson not found")
    #     print("Test to check")

    #     try:
    #         if file_type == "video":
    #             upload_result = await cloudinary_service.upload_video(file)
    #         elif file_type == "pdf":
    #             upload_result = cloudinary_service.upload_pdf(file)
    #         else:
    #             upload_result = await cloudinary_service.upload_file(file)
    #         print("this is upload_result", upload_result)
    #     except Exception as e:
    #         import traceback
    #         print("UPLOAD FAILED")
    #         traceback.print_exc()
    #         raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")
        
        
    #     # Update or create lesson content
    #     content = self.db.query(LessonContent).filter(
    #         LessonContent.lesson_id == lesson_id
    #     ).first()
        
    #     if not content:
    #         content = LessonContent(lesson_id=lesson_id)
    #         self.db.add(content)
        
    #     # Update content fields
    #     logger.debug(f"Uploaded data is: {upload_result}")
    #     # content.file_url = upload_result["url"]
    #     content.file_url=upload_result.get("url","")
    #     content.file_public_id = upload_result.get("public_id", "")
    #     content.file_type = upload_result.get("file_type", file_type)
    #     content.file_size = upload_result.get("file_size", 0)
        
    #     if file_type == "video":
    #         content.video_duration = upload_result.get("duration")
    #         content.video_thumbnail = upload_result.get("thumbnail")
        
    #     self.db.commit()
        
    #     return upload_result



    async def upload_lesson_file(self, lesson_id: int, file: UploadFile, file_type: str) -> Dict[str, Any]:
        """Upload file for lesson content - direct upload"""
        lesson = self.db.query(Lesson).filter(Lesson.id == lesson_id).first()
        if not lesson:
            raise HTTPException(status_code=404, detail="Lesson not found")
        
        try:
            # Read file content into memory to avoid stream issues
            file_content = await file.read()
            
            # Reset file for upload
            file.file.seek(0)
            
            # Create a BytesIO object from the content
            import io
            file_stream = io.BytesIO(file_content)
            
            # Upload based on content type
            if file_type == "video":
                upload_result = await cloudinary_service.upload_video_from_stream(
                    file_stream, 
                    filename=file.filename
                )
            elif file_type == "pdf":
                upload_result = await cloudinary_service.upload_pdf_from_stream(
                    file_stream, 
                    filename=file.filename
                )
            else:
                upload_result = await cloudinary_service.upload_file_from_stream(
                    file_stream, 
                    filename=file.filename
                )
            
            print("Upload result:", upload_result)
            
        except Exception as e:
            import traceback
            print("UPLOAD FAILED")
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")
        
        # Update or create lesson content
        return await self._update_lesson_content(lesson_id, upload_result, file_type)
    
    async def upload_lesson_file_async(self, lesson_id: int, file: UploadFile, file_type: str) -> Dict[str, Any]:
        """Upload file for lesson content - async with Celery"""
        lesson = self.db.query(Lesson).filter(Lesson.id == lesson_id).first()
        if not lesson:
            raise HTTPException(status_code=404, detail="Lesson not found")
        
        try:
            # Save file temporarily
            import tempfile
            import os
            
            # Create temporary file
            with tempfile.NamedTemporaryFile(delete=False, suffix=f"_{file.filename}") as temp_file:
                file_content = await file.read()
                temp_file.write(file_content)
                temp_file_path = temp_file.name
            
            # Start Celery task
            from aetherium.utils.tasks import upload_file_task
            task = upload_file_task.delay(
                lesson_id=lesson_id,
                file_path=temp_file_path,
                file_type=file_type,
                filename=file.filename
            )
            
            # Return task info for polling
            return {
                "task_id": task.id,
                "status": "processing",
                "message": "File upload started. Please check status."
            }
            
        except Exception as e:
            import traceback
            print("ASYNC UPLOAD FAILED")
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=f"Async upload failed: {str(e)}")
    
    async def _update_lesson_content(self, lesson_id: int, upload_result: Dict[str, Any], file_type: str) -> Dict[str, Any]:
        """Update lesson content with upload result"""
        content = self.db.query(LessonContent).filter(
            LessonContent.lesson_id == lesson_id
        ).first()
        
        if not content:
            content = LessonContent(lesson_id=lesson_id)
            self.db.add(content)
        
        # Update content fields
        content.file_url = upload_result.get("url", "")
        content.file_public_id = upload_result.get("public_id", "")
        content.file_type = upload_result.get("file_type", file_type)
        content.file_size = upload_result.get("file_size", 0)
        
        if file_type == "video":
            content.video_duration = upload_result.get("duration")
            content.video_thumbnail = upload_result.get("thumbnail")
        
        self.db.commit()
        
        return upload_result
    
    def get_lesson(self,lesson_id:int) -> Optional[LessonResponse]:
        lesson=self.db.query(Lesson).filter(Lesson.id==lesson_id).first()
        if not lesson:
            raise HTTPException(status_code=404,details="Lesson not found")
        else:
            return lesson
            return LessonResponse.model_validate(lesson)
    
    def get_lessons_by_section(self, section_id: int):
        lessons = self.db.query(Lesson).filter(Lesson.section_id == section_id).order_by(Lesson.order_index).all()
        
        # return [LessonResponse.model_validate(lesson) for lesson in lessons]
        return lessons
    
    #update lesson
    # async def update_lesson(self, lesson_id: int, lesson_data: LessonUpdate) -> LessonResponse:
    #     lesson = self.db.query(Lesson).filter(Lesson.id == lesson_id).first()
    #     if not lesson:
    #         raise HTTPException(status_code=404, detail="Lesson not found")

    #     update_data = lesson_data.model_dump(exclude_none=True, exclude={"content"})
    #     for key, value in update_data.items():
    #         setattr(lesson, key, value)
 
    #     if lesson_data.content:
    #         content = self.db.query(LessonContent).filter(
    #             LessonContent.lesson_id == lesson_id
    #         ).first()

    #         if content:
    #             content_data = lesson_data.content.model_dump(exclude_none=True)
    #             for key, value in content_data.items():
    #                 setattr(content, key, value)

    #     self.db.commit()
    #     self.db.refresh(lesson)
    #     return LessonResponse.model_validate(lesson)
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