from .celery_worker import celery_app
from .email_utils import send_otp_email 

@celery_app.task
def send_otp_email_task(email: str, otp: str):
    send_otp_email(email, otp) 
