import io
import logging
from celery import shared_task
import cloudinary
import cloudinary.uploader
from sqlalchemy.orm import Session
from aetherium.models.courses.lesson import LessonContent
from aetherium.database.db import get_db, SessionLocal
from typing import Dict, Any

logger = logging.getLogger(__name__)

def get_celery_db() -> Session:
    """Get database session for Celery tasks"""
    return SessionLocal()

@shared_task(bind=True, name='aetherium.utils.tasks.upload_file_task')
def upload_file_task(self, lesson_id: int, file_content: bytes, file_type: str, filename: str):
    """Enhanced task with proper DB handling"""
    db = None
    try:
        # Create file stream
        file_stream = io.BytesIO(file_content)
        file_stream.seek(0)  # Ensure we're at the beginning
        
        # Prepare upload parameters based on file type
        upload_params = {
            'folder': f'elearning/{file_type}s',
            'filename': filename,
            'use_filename': True,
            'unique_filename': True,
            'timeout': 600,  # Increased to 10 minutes for large videos
        }
        
        if file_type == "video":
            upload_params.update({
                'resource_type': 'video',
                'chunk_size': 6*1024*1024,  # 6MB chunks
                'eager': [{
                    'width': 400, 
                    'height': 300, 
                    'crop': 'fill',
                    'format': 'jpg'
                }]
            })
        elif file_type == "pdf":
            upload_params['resource_type'] = 'raw'
        else:
            upload_params['resource_type'] = 'auto'
        
        # Update task state
        self.update_state(
            state='PROGRESS',
            meta={'status': 'Uploading to Cloudinary...', 'progress': 10}
        )
        
        # Upload to Cloudinary
        logger.info(f"Starting Cloudinary upload for lesson {lesson_id}, file type: {file_type}")
        upload_result = cloudinary.uploader.upload(file_stream, **upload_params)
        
        # Verify upload succeeded
        if not all(k in upload_result for k in ['secure_url', 'public_id']):
            raise ValueError("Invalid Cloudinary response - missing required fields")
        
        logger.info(f"Cloudinary upload successful for lesson {lesson_id}")
        
        # Update task state
        self.update_state(
            state='PROGRESS',
            meta={'status': 'Updating database...', 'progress': 80}
        )
        
        # Update database
        db = get_celery_db()
        try:
            # Get or create lesson content
            content = db.query(LessonContent).filter_by(lesson_id=lesson_id).first()
            if not content:
                content = LessonContent(lesson_id=lesson_id)
                db.add(content)
            
            # Update basic fields
            content.file_url = upload_result['secure_url']
            content.file_public_id = upload_result['public_id']
            content.file_type = file_type
            content.file_size = upload_result.get('bytes', len(file_content))
            content.upload_status = "completed"
            
            # Video-specific fields
            if file_type == "video":
                content.video_duration = upload_result.get('duration', 0)
                
                # Handle thumbnail URL
                thumbnail_url = upload_result.get('thumbnail_url', '')
                if not thumbnail_url and 'eager' in upload_result:
                    # Try to get thumbnail from eager transformations
                    eager_results = upload_result.get('eager', [])
                    if eager_results:
                        thumbnail_url = eager_results[0].get('secure_url', '')
                
                if not thumbnail_url:
                    # Generate thumbnail URL manually
                    thumbnail_url = cloudinary.CloudinaryImage(
                        upload_result['public_id']
                    ).build_url(
                        format="jpg",
                        resource_type="video",
                        transformation=[
                            {"width": 400, "height": 300, "crop": "fill"},
                            {"quality": "auto"}
                        ]
                    )
                
                content.video_thumbnail = thumbnail_url
            
            db.commit()
            logger.info(f"Database updated successfully for lesson {lesson_id}")
            
            return {
                'status': 'success',
                'public_id': upload_result['public_id'],
                'url': upload_result['secure_url'],
                'lesson_id': lesson_id,
                'file_type': file_type,
                'file_size': upload_result.get('bytes', len(file_content)),
                'duration': upload_result.get('duration', 0) if file_type == 'video' else None,
                'thumbnail': content.video_thumbnail if file_type == 'video' else None
            }
            
        except Exception as db_error:
            db.rollback()
            logger.error(f"Database update failed for lesson {lesson_id}: {str(db_error)}")
            # Update lesson content to mark as failed
            try:
                content = db.query(LessonContent).filter_by(lesson_id=lesson_id).first()
                if content:
                    content.upload_status = "failed"
                    db.commit()
            except:
                pass
            raise Exception(f"Database update failed: {str(db_error)}")
            
    except Exception as e:
        error_msg = f"Upload task failed for lesson {lesson_id}: {str(e)}"
        logger.error(error_msg, exc_info=True)
        
        # Mark as failed in database if possible
        if db:
            try:
                content = db.query(LessonContent).filter_by(lesson_id=lesson_id).first()
                if content:
                    content.upload_status = "failed"
                    db.commit()
            except Exception as db_err:
                logger.error(f"Failed to mark upload as failed: {str(db_err)}")
        
        # Retry logic
        if self.request.retries < 3:
            raise self.retry(exc=e, countdown=60, max_retries=3)
        else:
            raise Exception(error_msg)
        
    finally:
        if db:
            db.close()

@shared_task(name='aetherium.utils.tasks.check_upload_status')
def check_upload_status(task_id: str) -> Dict[str, Any]:
    """Check status of an upload task"""
    from celery.result import AsyncResult
    
    try:
        result = AsyncResult(task_id)
        
        response = {
            'task_id': task_id,
            'state': result.state,
        }
        
        if result.state == 'PENDING':
            response['status'] = 'Task is waiting to be processed'
        elif result.state == 'PROGRESS':
            response.update(result.info)
        elif result.state == 'SUCCESS':
            response['status'] = 'Task completed successfully'
            response['result'] = result.info
        elif result.state == 'FAILURE':
            response['status'] = f'Task failed: {str(result.info)}'
            response['error'] = str(result.info)
        else:
            response['status'] = result.state
            
        return response
        
    except Exception as e:
        return {
            'task_id': task_id,
            'state': 'ERROR',
            'status': f'Failed to check task status: {str(e)}'
        }