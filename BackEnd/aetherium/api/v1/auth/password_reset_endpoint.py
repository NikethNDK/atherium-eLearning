from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from aetherium.database.db import get_db
from aetherium.models.user import User
from aetherium.utils.email_utils import (
    generate_reset_token, 
    store_reset_token, 
    verify_reset_token, 
    delete_reset_token,
    check_existing_reset_request
)
from aetherium.utils.otp_task import send_password_reset_email_task
from aetherium.utils import password_hash
from typing import Optional


class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str
    confirm_password: str

class MessageResponse(BaseModel):
    message: str
    
router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/forgot-password", response_model=MessageResponse)
async def forgot_password(
    request: ForgotPasswordRequest,
    db: Session = Depends(get_db)
):
   
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        return MessageResponse(message="If your email is registered, you will receive a password reset link shortly.")
    
    # Check if there's already a pending reset request
    if check_existing_reset_request(request.email):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="A password reset email was already sent. Please check your email or wait before requesting again."
        )
    
    # Generate reset token
    reset_token = generate_reset_token()
    
    # Store reset token
    store_reset_token(request.email, reset_token, user.id)
    
    # Send email asynchronously
    user_name = f"{user.firstname} {user.lastname}".strip() if user.firstname else "User"
    send_password_reset_email_task.delay(request.email, reset_token, user_name)
    
    return MessageResponse(message="If your email is registered, you will receive a password reset link shortly.")

@router.post("/reset-password", response_model=MessageResponse)
async def reset_password(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db)
):
    """Reset user password using reset token"""
    
    # Validate passwords match
    if request.new_password != request.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match"
        )
    
    # Validate password strength (add your own validation)
    if len(request.new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters long"
        )
    
    # Verify reset token
    token_data = verify_reset_token(request.token)
    if not token_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )
    
    # Get user
    user = db.query(User).filter(User.id == token_data["user_id"]).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update password
    user.password = password_hash(request.new_password)
    db.commit()
    
    # Delete reset token
    delete_reset_token(request.token, token_data["email"])
    
    return MessageResponse(message="Password has been reset successfully. You can now login with your new password.")

@router.get("/verify-reset-token/{token}")
async def verify_reset_token_endpoint(token: str):
    """Verify if reset token is valid"""
    token_data = verify_reset_token(token)
    if not token_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )
    
    return {
        "valid": True,
        "email": token_data["email"]
    }
