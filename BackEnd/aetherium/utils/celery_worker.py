# celery_worker.py
from celery import Celery
import os
import logging
from dotenv import load_dotenv
from aetherium.config import settings

# Load environment variables from .env file
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Verify Cloudinary environment variables are loaded
cloudinary_vars = {
    'CLOUDINARY_CLOUD_NAME': settings.CLOUDINARY_CLOUD_NAME,
    'CLOUDINARY_API_KEY': settings.CLOUDINARY_API_KEY,
    'CLOUDINARY_API_SECRET': settings.CLOUDINARY_API_SECRET
}

missing_vars = [key for key, value in cloudinary_vars.items() if not value]
if missing_vars:
    logger.warning(f"Missing Cloudinary environment variables: {missing_vars}")
else:
    logger.info("Cloudinary environment variables loaded successfully")

# Redis configuration
REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379/0')

celery_app = Celery(
    "aetherium",
    broker=REDIS_URL,
    backend=REDIS_URL,
    include=[
        'aetherium.utils.tasks',      # File upload tasks
        'aetherium.utils.otp_task'   # Email tasks
    ]
)

# Comprehensive Celery configuration
celery_app.conf.update(
    # Serialization
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    
    # Timezone
    timezone="Asia/Kolkata",
    enable_utc=False,
    
    # Task tracking
    task_track_started=True,
    task_send_sent_event=True,
    
    # Task routing and queues
    task_routes={
        # File operations - longer timeouts for large uploads
        'aetherium.utils.tasks.upload_file_task': {
            'queue': 'file_uploads',
        },
        'aetherium.utils.tasks.check_upload_status': {
            'queue': 'status_checks'
        },
        
        # Email operations
        'aetherium.utils.otp_task.send_otp_email_task': {
            'queue': 'emails',
        },
        'aetherium.utils.otp_task.send_password_reset_email_task': {
            'queue': 'emails',
        }
    },
    
    # Time limits (in seconds)
    task_time_limit=3600,        # Hard limit: 1 hour
    task_soft_time_limit=3300,   # Soft limit: 55 minutes
    
    # Worker settings
    worker_max_tasks_per_child=50,  # Reduced to prevent memory issues
    worker_prefetch_multiplier=1,   # Important for large file uploads
    
    # Result settings
    result_expires=7200,  # Results expire after 2 hours
    
    # Retry settings
    task_acks_late=True,
    
    # Connection settings
    broker_connection_retry_on_startup=True,
    broker_connection_retry=True,
    broker_connection_max_retries=10,
    
    # Additional broker settings for stability
    broker_transport_options={
        'visibility_timeout': 3600,
        'fanout_prefix': True,
        'fanout_patterns': True
    },
    
    # Result backend settings
    result_backend_transport_options={
        'master_name': 'localhost'
    }
)

# Queue configuration
celery_app.conf.task_default_queue = 'default'
celery_app.conf.task_queues = {
    'default': {
        'exchange': 'default',
        'routing_key': 'default',
    },
    'file_uploads': {
        'exchange': 'file_uploads',
        'routing_key': 'file_uploads',
    },
    'status_checks': {
        'exchange': 'status_checks', 
        'routing_key': 'status_checks',
    },
    'emails': {
        'exchange': 'emails',
        'routing_key': 'emails',
    }
}

# Logging configuration
@celery_app.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
    logger.info("Celery worker configured successfully")

if __name__ == '__main__':
    celery_app.start()