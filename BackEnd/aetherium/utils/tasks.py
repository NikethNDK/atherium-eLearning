# tasks.py
from celery import Celery
import os
import io
import cloudinary
import cloudinary.uploader
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from typing import Dict, Any
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Celery
app = Celery('file_upload')

# Celery configuration
app.conf.update(
    broker_url='redis://localhost:6379/0',  # or your Redis URL
    result_backend='redis://localhost:6379/0',
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    task_track_started=True,
    task_time_limit=1800,  # 30 minutes
    task_soft_time_limit=1500,  # 25 minutes
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=1000,
)

# Database setup (adjust according to your database configuration)
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/dbname")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Import your models (adjust imports according to your project structure)
from aetherium.models.courses.lesson import Lesson, LessonContent  # Update this import

@app.task(bind=True, name='upload_file_task')
def upload_file_task(self, lesson_id: int, file_path: str, file_type: str, filename: str):
    """
    Celery task for uploading files to Cloudinary
    """
    try:
        # Update task state
        self.update_state(
            state='PROGRESS',
            meta={'current': 0, 'total': 100, 'status': 'Starting upload...'}
        )
        
        # Create database session
        db = SessionLocal()
        
        try:
            # Verify lesson exists
            lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
            if not lesson:
                raise Exception(f"Lesson with id {lesson_id} not found")
            
            # Update task state
            self.update_state(
                state='PROGRESS',
                meta={'current': 20, 'total': 100, 'status': 'Lesson verified, uploading to Cloudinary...'}
            )
            
            # Upload to Cloudinary
            upload_result = None
            
            with open(file_path, 'rb') as file:
                file_content = file.read()
                file_stream = io.BytesIO(file_content)
                
                if file_type == "video":
                    upload_result = cloudinary.uploader.upload(
                        file_stream,
                        resource_type="video",
                        folder="elearning/videos",
                        overwrite=True,
                        invalidate=True,
                        quality="auto",
                        video_codec="h264",
                        audio_codec="aac",
                        timeout=300,  # 5 minutes timeout
                        filename=filename
                    )
                elif file_type == "pdf":
                    upload_result = cloudinary.uploader.upload(
                        file_stream,
                        resource_type="raw",
                        folder="elearning/pdfs",
                        overwrite=True,
                        invalidate=True,
                        timeout=180,  # 3 minutes timeout
                        filename=filename
                    )
                else:
                    upload_result = cloudinary.uploader.upload(
                        file_stream,
                        resource_type="auto",
                        folder="elearning/files",
                        overwrite=True,
                        invalidate=True,
                        timeout=180,
                        filename=filename
                    )
            
            # Update task state
            self.update_state(
                state='PROGRESS',
                meta={'current': 70, 'total': 100, 'status': 'Upload complete, generating thumbnail...'}
            )
            
            # Generate thumbnail for video
            thumbnail_url = ""
            if file_type == "video" and upload_result.get("public_id"):
                try:
                    thumbnail_url = cloudinary.CloudinaryImage(upload_result["public_id"]).image(
                        resource_type="video",
                        format="jpg",
                        transformation=[
                            {"width": 400, "height": 300, "crop": "fill"},
                            {"quality": "auto"}
                        ]
                    )
                except Exception as thumb_error:
                    logger.error(f"Failed to generate thumbnail: {thumb_error}")
                    thumbnail_url = ""
            
            # Update task state
            self.update_state(
                state='PROGRESS',
                meta={'current': 90, 'total': 100, 'status': 'Updating database...'}
            )
            
            # Update or create lesson content
            content = db.query(LessonContent).filter(
                LessonContent.lesson_id == lesson_id
            ).first()
            
            if not content:
                content = LessonContent(lesson_id=lesson_id)
                db.add(content)
            
            # Update content fields
            content.file_url = upload_result.get("secure_url", "")
            content.file_public_id = upload_result.get("public_id", "")
            content.file_type = upload_result.get("file_type", file_type)
            content.file_size = upload_result.get("bytes", 0)
            
            if file_type == "video":
                content.video_duration = upload_result.get("duration")
                content.video_thumbnail = thumbnail_url
            
            db.commit()
            
            # Prepare result
            result = {
                "public_id": upload_result.get("public_id", ""),
                "url": upload_result.get("secure_url", ""),
                "file_type": file_type,
                "file_size": upload_result.get("bytes", 0),
                "format": upload_result.get("format", "")
            }
            
            if file_type == "video":
                result.update({
                    "duration": upload_result.get("duration"),
                    "width": upload_result.get("width"),
                    "height": upload_result.get("height"),
                    "thumbnail": thumbnail_url
                })
            
            # Clean up temporary file
            try:
                os.unlink(file_path)
            except Exception as e:
                logger.error(f"Failed to delete temporary file: {e}")
            
            return {
                'current': 100,
                'total': 100,
                'status': 'Upload completed successfully!',
                'result': result
            }
            
        finally:
            db.close()
            
    except Exception as exc:
        # Clean up temporary file on error
        try:
            os.unlink(file_path)
        except:
            pass
            
        logger.error(f"Upload task failed: {exc}")
        raise self.retry(exc=exc, countdown=60, max_retries=3)

@app.task(name='check_upload_status')
def check_upload_status(task_id: str):
    """
    Check the status of an upload task
    """
    from celery.result import AsyncResult
    
    result = AsyncResult(task_id, app=app)
    
    if result.state == 'PENDING':
        response = {
            'state': result.state,
            'current': 0,
            'total': 1,
            'status': 'Pending...'
        }
    elif result.state != 'FAILURE':
        response = {
            'state': result.state,
            'current': result.info.get('current', 0),
            'total': result.info.get('total', 1),
            'status': result.info.get('status', '')
        }
        if 'result' in result.info:
            response['result'] = result.info['result']
    else:
        response = {
            'state': result.state,
            'current': 1,
            'total': 1,
            'status': str(result.info),
        }
    
    return response

if __name__ == '__main__':
    app.start()


def make_celery(app_name=__name__):
    """Create and configure Celery app"""
    
    # Redis configuration for local WSL instance
    redis_url = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
    
    celery = Celery(
        app_name,
        broker=redis_url,
        backend=redis_url,
        include=['tasks']  # Include your tasks module
    )
    
    # Celery configuration
    celery.conf.update(
        task_serializer='json',
        accept_content=['json'],
        result_serializer='json',
        timezone='UTC',
        enable_utc=True,
        task_track_started=True,
        task_time_limit=1800,  # 30 minutes
        task_soft_time_limit=1500,  # 25 minutes
        worker_prefetch_multiplier=1,
        worker_max_tasks_per_child=1000,
        result_expires=3600,  # Results expire after 1 hour
        task_routes={
            'upload_file_task': {'queue': 'file_uploads'},
            'check_upload_status': {'queue': 'status_checks'},
        }
    )
    
    return celery