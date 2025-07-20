# from .celery_worker import celery_app
# from .email_utils import send_otp_email,send_password_reset_email
# import logging

# logger = logging.getLogger(__name__)

# @celery_app.task
# def send_otp_email_task(email: str, otp: str):
#     send_otp_email(email, otp) 


# @celery_app.task
# def send_password_reset_email_task(email: str, reset_token: str, user_name: str):
#     # print("inside the send_pass_reset_email task in the otp_task.py")
#     # logger.info(f"Starting password reset email task for {email}")
#     try:
#         send_password_reset_email(email, reset_token, user_name)
#         logger.info(f"Password reset email send successfully to {email}")
#     except Exception as e:
#         logger.error(f"Failed to send password reset email to {email}:{str(e)}")
#         raise


from .celery_worker import celery_app
from .email_utils import send_otp_email, send_password_reset_email
import logging
from typing import Optional

logger = logging.getLogger(__name__)

# Common configuration for both email tasks
EMAIL_TASK_CONFIG = {
    'max_retries': 3,
    'default_retry_delay': 60,  # 1 minute
    'queue': 'emails',
    'ignore_result': True  # Since we don't need results for emails
}

@celery_app.task(bind=True, **EMAIL_TASK_CONFIG)
def send_otp_email_task(self, email: str, otp: str, user_name: Optional[str] = None):
    """
    Task for sending OTP emails with retry mechanism
    """
    try:
        logger.info(f"Starting OTP email to {email}")
        send_otp_email(email, otp, user_name)
        logger.info(f"OTP email sent successfully to {email}")
    except Exception as e:
        logger.error(f"Failed to send OTP email to {email}: {str(e)}")
        raise self.retry(exc=e)

@celery_app.task(bind=True, **EMAIL_TASK_CONFIG)
def send_password_reset_email_task(self, email: str, reset_token: str, user_name: str):
    """
    Task for sending password reset emails with enhanced logging
    """
    try:
        logger.info(f"Starting password reset email for {email}")
        send_password_reset_email(email, reset_token, user_name)
        logger.info(f"Password reset email sent successfully to {email}")
    except Exception as e:
        logger.error(f"Password reset email failed for {email}: {str(e)}")
        # Include stack trace for debugging
        logger.exception("Error details:") 
        raise self.retry(exc=e)