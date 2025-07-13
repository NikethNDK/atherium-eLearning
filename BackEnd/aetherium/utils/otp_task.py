from .celery_worker import celery_app
from .email_utils import send_otp_email,send_password_reset_email
import logging

logger = logging.getLogger(__name__)

@celery_app.task
def send_otp_email_task(email: str, otp: str):
    send_otp_email(email, otp) 


@celery_app.task
def send_password_reset_email_task(email: str, reset_token: str, user_name: str):
    # print("inside the send_pass_reset_email task in the otp_task.py")
    # logger.info(f"Starting password reset email task for {email}")
    try:
        send_password_reset_email(email, reset_token, user_name)
        logger.info(f"Password reset email send successfully to {email}")
    except Exception as e:
        logger.error(f"Failed to send password reset email to {email}:{str(e)}")
        raise