from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from aetherium.database.db import get_db
from aetherium.models.user import User, Role
from aetherium.schemas.user import UserCreate, UserResponse, Token, UserUpdate
from aetherium.services.auth_service import create_user, update_user_bio
from aetherium.utils.jwt_utils import create_access_token, get_current_user
from aetherium.utils.password_hash import verify_password
from authlib.integrations.starlette_client import OAuth
from starlette.requests import Request
from starlette.config import Config
import os
from aetherium.config import settings


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

@router.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    if user.role_id == 3:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot register as admin through public endpoint"
        )
    
    db_user = create_user(db, user)
    return db_user


@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive account")
    access_token = create_access_token(data={"sub": user.email, "role": user.role.name})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/google/login")
async def google_login(request: Request):
    # redirect_uri = os.getenv("GOOGLE_REDIRECT_URI")
    redirect_uri = settings.GOOGLE_REDIRECT_URI
    return await oauth.google.authorize_redirect(request, redirect_uri)

@router.get("/google/callback", response_model=Token)
async def google_callback(request: Request, db: Session = Depends(get_db)):
    token = await oauth.google.authorize_access_token(request)
    user_info = token.get('userinfo')
    if not user_info:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to fetch user info")
    
    email = user_info['email']
    google_id = user_info['sub']
    
    user = db.query(User).filter(User.google_id == google_id).first()
    if not user:
        user = db.query(User).filter(User.email == email).first()
        if user:
            user.google_id = google_id
            db.commit()
        else:
            default_role = db.query(Role).filter(Role.name == "user").first()
            if not default_role:
                raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Default role not found")
            user = User(
                email=email,
                google_id=google_id,
                role_id=default_role.id,
                is_active=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)
    
    access_token = create_access_token(data={"sub": user.email, "role": user.role.name})
    return {"access_token": access_token, "token_type": "bearer"}

@router.put("/bio", response_model=UserResponse)
def update_bio(user_update: UserUpdate, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user["role"] == "instructor" and (user_update.title is None or user_update.designation is None):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Title and designation required for instructors")
    updated_user = update_user_bio(db, user_update, current_user["email"])
    return updated_user