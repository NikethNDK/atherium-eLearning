from aetherium.config import settings
import smtplib
import random
import string
from email.mime.text import MIMEText
import redis
import json
from email.mime.multipart import MIMEMultipart
from datetime import datetime,timedelta,timezone
import secrets


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

def send_otp_email(email: str, otp: str, user_name: str = None):
    print(otp)
    # Create personalized greeting if user_name is provided
    greeting = f"Hello {user_name}," if user_name else "Hello,"
    msg = MIMEText(f"{greeting}\n\nYour OTP for email verification is: {otp}\nIt expires in 5 minutes.")
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
    
def generate_reset_token() -> str:
    """Generate a secure random token for password reset"""
    print( "this is reset token gnereateed in email_util.py generate_reset_token func",secrets.token_urlsafe(32))
    return secrets.token_urlsafe(32)

def store_reset_token(email: str, token: str, user_id: int):

    if redis_client is None:
        raise ConnectionError("Redis is not connected")
    
    reset_data = {
        "token": token,
        "user_id": user_id,
        "email": email,
        "created_at": datetime.now(timezone.utc).isoformat() 
    }
    
    # Store for 1 hour (3600 seconds)
    redis_client.setex(f"reset_token:{token}", 3600, json.dumps(reset_data))
    
    # Also store by email to prevent multiple requests
    redis_client.setex(f"reset_email:{email}", 3600, json.dumps(reset_data))


def verify_reset_token(token: str) -> dict:
    """Verify password reset token and return user data"""
    stored_data = redis_client.get(f"reset_token:{token}")
    print(stored_data)
    if stored_data:
        return json.loads(stored_data)
    return None

def delete_reset_token(token: str, email: str):
    """Delete password reset token after use"""
    redis_client.delete(f"reset_token:{token}")
    redis_client.delete(f"reset_email:{email}")

def check_existing_reset_request(email: str) -> bool:
    """Check if there's already a pending reset request for this email"""
    return redis_client.exists(f"reset_email:{email}")

def send_password_reset_email(email: str, reset_token: str, user_name: str = "User"):
    """Send password reset email with reset link"""
    print(f"Password reset token for {email}: {reset_token}")
    
    # Create the reset URL - adjust this based on your frontend URL
    frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
    reset_url = f"{frontend_url}/reset-password?token={reset_token}"
    
    # Create HTML email
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset - Aetherium</title>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background-color: #7c3aed; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
            .content {{ background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }}
            .button {{ display: inline-block; background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }}
            .footer {{ text-align: center; margin-top: 20px; font-size: 12px; color: #666; }}
            .warning {{ background-color: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Password Reset Request</h1>
            </div>
            <div class="content">
                <h2>Hello {user_name},</h2>
                <p>We received a request to reset your password for your Aetherium account.</p>
                <p>Click the button below to reset your password:</p>
                <a href="{reset_url}" class="button">Reset Password</a>
                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all; background-color: #e5e7eb; padding: 10px; border-radius: 4px;">{reset_url}</p>
                
                <div class="warning">
                    <strong>Important:</strong>
                    <ul>
                        <li>This link will expire in 1 hour</li>
                        <li>If you didn't request this reset, please ignore this email</li>
                        <li>For security, this link can only be used once</li>
                    </ul>
                </div>
                
                <p>If you're having trouble clicking the button, copy and paste the URL above into your web browser.</p>
                <p>Best regards,<br>The Aetherium Team</p>
            </div>
            <div class="footer">
                <p>This is an automated email. Please do not reply to this message.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    # Create plain text version
    text_content = f"""
    Hello {user_name},

    We received a request to reset your password for your Aetherium account.

    Please click the following link to reset your password:
    {reset_url}

    Important:
    - This link will expire in 1 hour
    - If you didn't request this reset, please ignore this email
    - For security, this link can only be used once

    Best regards,
    The Aetherium Team

    This is an automated email. Please do not reply to this message.
    """
    
    # Create multipart message
    msg = MIMEMultipart('alternative')
    msg['Subject'] = "Reset Your Aetherium Password"
    msg['From'] = FROM_EMAIL
    msg['To'] = email
    
    # Attach both plain text and HTML versions
    text_part = MIMEText(text_content, 'plain')
    html_part = MIMEText(html_content, 'html')
    
    msg.attach(text_part)
    msg.attach(html_part)

    try:
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.sendmail(FROM_EMAIL, email, msg.as_string())
    except Exception as e:
        raise Exception(f"Failed to send password reset email: {str(e)}")