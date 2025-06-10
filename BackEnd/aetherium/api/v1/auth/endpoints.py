from fastapi import APIRouter, Depends, HTTPException, status,Response
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from aetherium.database.db import get_db
from aetherium.models.user import User, Role
from aetherium.schemas.user import UserCreate, UserResponse, Token, UserUpdate,OTPVerify,OTPSend
from aetherium.services.auth_service import create_user, update_user_bio
from aetherium.utils.jwt_utils import create_access_token, get_current_user
from aetherium.utils.password_hash import verify_password
from aetherium.utils.email_utils import generate_otp,store_otp,verify_otp_code,send_otp_email
from authlib.integrations.starlette_client import OAuth
from starlette.requests import Request
from starlette.config import Config
from aetherium.config import settings
# from jose import jwt

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
    client_kwargs={'scope': 'openid email profile'}
)


def get_token_from_cookie(request:Request)->str:
    token=request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail="No token provided")
    return token

@router.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    if user.role_id == 3 and current_user["role"] != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only admins can register admins")
    db_user = create_user(db, user)
    # Send OTP after registration
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
    # print("Test")
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive account")
    if not user.is_emailverified:
        otp = generate_otp()
        store_otp(user.email, otp)
        try:
            await send_otp_email(user.email, otp)
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Email not verified, OTP sent")
    access_token = create_access_token(data={"sub": user.email, "role": user.role.name})
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False, 
        samesite="lax",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MIN * 60  
    )
    return {"message": "Login successful"}

@router.get("/google/login")
async def google_login(request: Request):
    redirect_uri = settings.GOOGLE_REDIRECT_URI
    return await oauth.google.authorize_redirect(request, redirect_uri)

@router.get("/google/callback")
async def google_callback(request: Request, response: Response, db: Session = Depends(get_db)):
    token = await oauth.google.authorize_access_token(request)
    user_info = token.get('userinfo')
    if not user_info:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to fetch user info")
    
    email = user_info.get('email')       
    google_id = user_info.get('sub')
    firstname = user_info.get('given_name')
    lastname = user_info.get('family_name')
    
    user = db.query(User).filter(User.google_id == google_id).first()
    if not user:
        user = db.query(User).filter(User.email == email).first()
        if user:
            user.google_id = google_id
            user.is_emailverified = True
            db.commit()
        else:
            default_role = db.query(Role).filter(Role.name == "user").first()
            if not default_role:
                raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Default role not found")
            user = User(
                email=email,
                google_id=google_id,
                role_id=default_role.id,
                is_active=True,
                is_emailverified=True,
                firstname=firstname,
                lastname=lastname,
                phone_number=None
            )
            db.add(user)
            db.commit()
            db.refresh(user)
    
    access_token = create_access_token(data={"sub": user.email, "role": user.role.name})
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MIN * 60
    )
    return {"message":"Google login successful"}


@router.put("/bio", response_model=UserResponse)
def update_bio(
    user_update: UserUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    
    updated_user = update_user_bio(db, user_update, current_user["email"])
    return updated_user


# For user role and redirecting the ui
@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == current_user["email"]).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(key="access_token")
    return {"message": "Logout successful"}

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
    return send_otp(otp_send, db)  # Reuse send_otp logic

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