from fastapi import APIRouter, Depends, HTTPException, status, Response, UploadFile, File,status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from aetherium.database.db import get_db
from aetherium.models.user import User, Role
from aetherium.schemas.user import UserCreate, UserResponse, Token, UserUpdate, OTPVerify, OTPSend, PasswordChange,MessageResponse,ForgotPasswordRequest,ResetPasswordRequest
from aetherium.services.auth_service import create_user, update_user_bio, change_password, upload_profile_picture
from aetherium.utils.jwt_utils import create_access_token, get_current_user,create_refresh_token,blacklist_token,is_token_blacklisted
from aetherium.utils.password_hash import verify_password,hash_password
from aetherium.utils.email_utils import generate_otp, store_otp, verify_otp_code, send_otp_email,check_existing_reset_request,generate_reset_token,store_reset_token,delete_reset_token,verify_reset_token,send_password_reset_email
from authlib.integrations.starlette_client import OAuth,OAuthError
from starlette.requests import Request
from starlette.config import Config
from starlette.responses import JSONResponse
from aetherium.config import settings
from fastapi.responses import FileResponse,JSONResponse
from typing import Optional
import os
from jose import JWTError,jwt
from fastapi.responses import RedirectResponse
import logging
import httpx ,json
from aetherium.utils.otp_task import send_otp_email_task,send_password_reset_email_task


logging.basicConfig(level=logging.DEBUG)
logger=logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["auth"])

# Google OAuth setup
config = Config(environ={
    "GOOGLE_CLIENT_ID": settings.GOOGLE_CLIENT_ID,
    "GOOGLE_CLIENT_SECRET": settings.GOOGLE_CLIENT_SECRET
})

oauth = OAuth(config)
oauth.register(
    name='google',
    client_id=settings.GOOGLE_CLIENT_ID,
    client_secret=settings.GOOGLE_CLIENT_SECRET,
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={'scope': 'openid email profile','prompt':'select_account'}
)

def get_token_from_cookie(request: Request) -> str:
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No token provided")
    return token

@router.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db), current_user: Optional[dict] = Depends(get_current_user)):
    if user.role_id == 3 and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only admins can register admins")
    db_user = create_user(db, user)
    otp = generate_otp()
    store_otp(db_user.email, otp)
    try:
        send_otp_email(db_user.email, otp)
    except Exception as e:
        db.delete(db_user)
        db.commit()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    return db_user

@router.post("/login")
async def login(response: Response, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive account")
    if not user.is_emailverified:
        otp = generate_otp()
        store_otp(user.email, otp)
        try:
            send_otp_email_task(user.email, otp)
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Email not verified, OTP sent")
    access_token = create_access_token(data={"sub": user.email, "role": user.role.name})
    refresh_token = create_refresh_token(data={"sub": user.email, "role": user.role.name})

    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MIN * 60,
        path="/"
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=settings.REFRESH_TOKEN_EXPIRE_MIN * 60,
        path="/"
    )


    logger.debug("Set access_token cookie for login")
    return {"message": "Login successful", "user": {"email": user.email, "firstname": user.firstname}}

@router.get("/google/login")
async def google_login(request: Request):
    redirect_uri = settings.GOOGLE_REDIRECT_URI
    logger.debug(f"Initiating Google login with redirect_uri : {redirect_uri}")
    return await oauth.google.authorize_redirect(request, redirect_uri)

@router.post("/google/exchange")
async def google_exchange(request: Request, response: Response, db: Session = Depends(get_db)):
    try:
        data = await request.json()
        code = data.get("code")
        logger.debug(f"Received code: {code}")
        if not code:
            logger.error("Missing code")
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing code")            
        try:
            async with httpx.AsyncClient() as client:
                token_response = await client.post(
                    'https://oauth2.googleapis.com/token',
                    data={
                        'code': code,
                        'client_id': settings.GOOGLE_CLIENT_ID,
                        'client_secret': settings.GOOGLE_CLIENT_SECRET,
                        'redirect_uri': settings.GOOGLE_REDIRECT_URI,
                        'grant_type': 'authorization_code'
                    },
                    headers={'Content-Type': 'application/x-www-form-urlencoded'}
                )
                token = token_response.json()
                logger.debug(f"Token response: {token}")
        except Exception as e:
            logger.error(f"Exception during token exchange: {e}")
            if 'token_response' in locals():
                logger.error(f"Raw response: {token_response.text}")
                raise


        if 'error' in token:
            logger.error(f"Token exchange error: {token['error']}")
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Token exchange failed: {token['error']}")

        if not token.get('access_token'):
            logger.error("No access_token in token response")
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to obtain access token")

        async with httpx.AsyncClient() as client:
            user_info_response = await client.get(
                'https://www.googleapis.com/oauth2/v3/userinfo',
                headers={'Authorization': f"Bearer {token['access_token']}"}
            )
            if user_info_response.status_code != 200:
                logger.error(f"Failed to fetch user info: {user_info_response.text}")
                raise HTTPException(
                    status_code=400,
                    detail="Failed to fetch user info"
                )
            user_info = user_info_response.json()

        logger.debug(f"User info: {user_info}")

        if not user_info:
            logger.error("No user_info received")
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to fetch user info")

        email = user_info.get('email')
        google_id = user_info.get('sub')
        firstname = user_info.get('given_name')
        lastname = user_info.get('family_name')
        profile_picture = user_info.get('picture')

        if not email or not google_id:
            logger.error("Missing email or google_id")
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid user info")

        # Check for existing user
        user = db.query(User).filter(User.google_id == google_id).first()
        if not user:
            user = db.query(User).filter(User.email == email).first()
            if user:
                user.google_id = google_id
                user.is_emailverified = True
                user.profile_picture = profile_picture
                db.commit()
                logger.debug(f"Updated existing user with google_id: {google_id}")
            else:
                default_role = db.query(Role).filter(Role.name == "user").first()
                if not default_role:
                    logger.error("Default role 'user' not found")
                    raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Default role not found")
                user = User(
                    email=email,
                    google_id=google_id,
                    role_id=default_role.id,
                    is_active=True,
                    is_emailverified=True,
                    firstname=firstname,
                    lastname=lastname,
                    phone_number=None,
                    profile_picture=profile_picture
                )
                db.add(user)
                db.commit()
                db.refresh(user)
                logger.debug(f"Created new user: {email}")

        access_token = create_access_token(data={"sub": user.email, "role": user.role.name})
        refresh_token = create_refresh_token(data={"sub": user.email, "role": user.role.name})
        logger.debug(f"Created access_token: {access_token[:30]}...")

      
        # response=Response()
        response_data = {"message": "Login successful"}
        response = JSONResponse(content=response_data)
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            secure=False,
            samesite="lax",
            max_age=settings.ACCESS_TOKEN_EXPIRE_MIN * 60,
            path="/"
        )
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            secure=False,
            samesite="lax",
            max_age=settings.REFRESH_TOKEN_EXPIRE_MIN * 60,
            path="/"
        )
        return response
       
    except OAuthError as e:
        logger.error(f"OAuth error: {str(e)}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"OAuth error: {str(e)}")
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")

@router.put("/bio", response_model=UserResponse)
def update_bio(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    updated_user = update_user_bio(db, user_update, current_user.email)
    return updated_user

@router.post("/change-password")
def change_user_password(
    password_data: PasswordChange,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    change_password(db, password_data, current_user.email)
    return {"message": "Password changed successfully"}

@router.post("/upload-profile-picture", response_model=dict)
def upload_profile_picture_route(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    print(f"Calling upload_profile_picture with email: {current_user.email}")
    print(f"File object type: {type(file)}, filename: {file.filename}")
    file_path = upload_profile_picture(db, file, current_user.email)
    return {"message": "Profile picture uploaded successfully", "file_path": file_path}

@router.get("/profile-picture/{user_id}")
def get_profile_picture(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.profile_picture:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile picture not found")
    if not os.path.exists(user.profile_picture):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile picture file missing")
    return FileResponse(user.profile_picture)

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: Optional[dict] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user:
        logger.debug("No current user found")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    user = db.query(User).filter(User.email == current_user.email).first()
    if not user:
        logger.error(f"User not found: email={current_user.email}")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    logger.debug(f"Returning user info: email={user.email}")
    return user

@router.post("/logout")
def logout(response: Response,request: Request,current_user: User = Depends(get_current_user)):
    logger.debug("Deleting cookies")
    access_token = request.cookies.get("access_token")
    if access_token:
        blacklist_token(access_token, current_user.id)
    response.delete_cookie(key="access_token")
    response.delete_cookie(key="refresh_token")
    return {"message": "Logout successful"}

@router.post("/refresh-token")
def refresh_token(request: Request,response: Response):
    logger.debug("Refreshing token")
    
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No refresh token provided")
    try:
        payload = jwt.decode(refresh_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email = payload.get("sub")
        role = payload.get("role")
        
        if not email:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
        
        # Check if refresh token is blacklisted
        if is_token_blacklisted(refresh_token):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token is blacklisted")
        
        # Create new access token
        access_token = create_access_token(data={"sub": email, "role": role})
        
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            secure=False,
            samesite="lax",
            max_age=settings.ACCESS_TOKEN_EXPIRE_MIN * 60,
            path="/"
        )
        
        return {"message": "Token refreshed successfully"}
        
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
            
    except Exception as e:
        logger.error(f"Error refreshing token: {e}")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Error refreshing token")
@router.post("/send-otp")
def send_otp(otp_send: OTPSend, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == otp_send.email).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if user.is_emailverified:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already verified")
    otp = generate_otp()
    store_otp(user.email, otp)
    try:
        send_otp_email(user.email, otp)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    return {"message": "OTP sent successfully"}

@router.post("/resend-otp")
def resend_otp(otp_send: OTPSend, db: Session = Depends(get_db)):
    return send_otp(otp_send, db)

@router.post("/verify-otp")
def verify_otp(otp_verify: OTPVerify, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == otp_verify.email).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if user.is_emailverified:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already verified")
    if not verify_otp_code(otp_verify.email, otp_verify.otp):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired OTP")
    user.is_emailverified = True
    db.commit()
    return {"message": "Email verified successfully"}






@router.post("/forgot-password", response_model=MessageResponse)

async def forgot_password(request: ForgotPasswordRequest,db: Session = Depends(get_db)):
    logger = logging.getLogger(__name__) 
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        logger.info(f"No user found for email: {request.email}")
        return MessageResponse(message="If your email is registered, you will receive a password reset link shortly.")
    
    logger.info(f"User found: {user.email}, ID: {user.id}")
    if check_existing_reset_request(request.email):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="A password reset email was already sent. Please check your email or wait before requesting again."
        )
    
    # Generate reset token
    reset_token = generate_reset_token()
    
    # Store reset token
    store_reset_token(user.email, reset_token, user.id)
    
    # Send email asynchronously
    user_name = f"{user.firstname} {user.lastname}".strip() if user.firstname else "User"
    logger.info(f"Queuing email task for {user.email} with token {reset_token}")
    print("After store_rest_before calling the email sending funtion")
    send_password_reset_email_task.delay(user.email, reset_token, user_name)
    
    return MessageResponse(message="If your email is registered, you will receive a password reset link shortly.")

@router.post("/reset-password", response_model=MessageResponse)
async def reset_password(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db)
):
    """Reset user password using reset token"""
    logger.info(f"{request.confirm_password}{request.token}")
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
    user.password_hash = hash_password(request.new_password)
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
