from aetherium.config import settings
import smtplib
import random
import string
from email.mime.text import MIMEText
import redis
import json


SMTP_SERVER = settings.SMTP_SERVER
SMTP_PORT = settings.SMTP_PORT
SMTP_USERNAME = settings.SMTP_USERNAME
SMTP_PASSWORD = settings.SMTP_PASSWORD
FROM_EMAIL = settings.FROM_EMAIL

REDIS_HOST=settings.REDIS_HOST
REDIS_PORT=settings.REDIS_PORT
REDIS_DB=settings.REDIS_DB


redis_client = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, db=REDIS_DB, decode_responses=True)
def generate_otp(length=6) -> str:
    return ''.join(random.choices(string.digits, k=length))

def store_otp(email: str, otp: str):
    if redis_client is None:
        raise ConnectionError("Redis is not connected")
    redis_client.setex(f"otp:{email}", 300, json.dumps({"otp": otp})) #Otp stored for 5 min

def verify_otp_code(email: str, otp: str) -> bool:
    stored_data = redis_client.get(f"otp:{email}")
    if stored_data:
        stored_otp = json.loads(stored_data).get("otp")
        if stored_otp == otp:
            redis_client.delete(f"otp:{email}") 
            return True
    return False

def send_otp_email(email: str, otp: str):
    print(otp)
    msg = MIMEText(f"Your OTP for email verification is: {otp}\nIt expires in 5 minutes.")
    msg['Subject'] = "Aetherium Email Verification OTP"
    msg['From'] = FROM_EMAIL
    msg['To'] = email

    try:
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.sendmail(FROM_EMAIL, email, msg.as_string())
    except Exception as e:
        raise Exception(f"Failed to send email: {str(e)}")