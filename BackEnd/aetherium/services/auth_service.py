from sqlalchemy.orm import Session
from aetherium.models.user import User, Role
from aetherium.schemas.user import UserCreate, UserUpdate, PasswordChange
from aetherium.utils.password_hash import hash_password, verify_password
from fastapi import HTTPException, status
import os
from fastapi import UploadFile
from aetherium.config import settings
from aetherium.core.logger import logger
def create_user(db: Session, user: UserCreate) -> User:
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    
    role = db.query(Role).filter(Role.id == user.role_id).first()
    if not role:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid role")
    
    hashed_password = hash_password(user.password)
    db_user = User(
        firstname=user.firstname,
        lastname=user.lastname,
        email=user.email,
        password_hash=hashed_password,
        role_id=user.role_id,
        title=user.title,
        designation=user.designation,
        phone_number=user.phonenumber
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user_bio(db: Session, user_update: UserUpdate, email: str) -> User:
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    logger.info(f"Incoming update phone {user_update.phone_number}")
    if user_update.firstname is not None:
        user.firstname = user_update.firstname
    if user_update.lastname is not None:
        user.lastname = user_update.lastname
    if user_update.title is not None:
        user.title = user_update.title
    if user_update.designation is not None:
        user.designation = user_update.designation
    if user_update.phone_number is not None:
        user.phone_number = user_update.phone_number
    # if user_update.username is not None:
    #     existing_username = db.query(User).filter(User.username == user_update.username, User.email != email).first()
    #     if existing_username:
    #         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already taken")
    #     user.username = user_update.username
    if user_update.personal_website is not None:
        user.personal_website = user_update.personal_website
    if user_update.facebook is not None:
        user.facebook = user_update.facebook
    if user_update.instagram is not None:
        user.instagram = user_update.instagram
    if user_update.linkedin is not None:
        user.linkedin = user_update.linkedin
    if user_update.whatsapp is not None:
        user.whatsapp = user_update.whatsapp
    if user_update.youtube is not None:
        user.youtube = user_update.youtube
    if user_update.date_of_birth is not None:
        user.date_of_birth = user_update.date_of_birth
    
    db.commit()
    db.refresh(user)
    return user

def change_password(db: Session, password_data: PasswordChange, email: str) -> None:
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    if not verify_password(password_data.current_password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password is incorrect")
    
    if password_data.new_password != password_data.confirm_password:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="New passwords do not match")
    
    user.password_hash = hash_password(password_data.new_password)
    db.commit()

def upload_profile_picture(db: Session, file: UploadFile, email: str) -> str:
    print(f"Starting upload for email: {email}")
    print(f"File details: filename={file.filename}, size={file.size}, content_type={file.content_type}")
    user = db.query(User).filter(User.email == email).first()
    if not user:
        print("User not found")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
 
    upload_dir = "uploads/profile_pictures"
    print(f"Checking/creating directory: {upload_dir}")
    try:
        os.makedirs(upload_dir, exist_ok=True)
    except Exception as e:
        print(f"Directory creation failed: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to create directory: {str(e)}")
    
 
    if file.size > 1_000_000:
        print("File size exceeds 1MB")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File size exceeds 1MB")
    
 
    if file.content_type not in ["image/jpeg", "image/png"]:
        print(f"Invalid file type: {file.content_type}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only JPEG or PNG files are allowed")
    

    file_extension = file.filename.split(".")[-1].lower()
    file_path = f"{upload_dir}/{user.id}_{email.split('@')[0]}.{file_extension}"
    print(f"Attempting to save file to: {file_path}")
    
    # FileSave 
    try:
        with open(file_path, "wb") as buffer:
            content = file.file.read()
            print(f"Read {len(content)} bytes from file")
            buffer.write(content)
    except Exception as e:
        print(f"File save failed: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to save file: {str(e)}")
    
    # Update user profile picture path
    print(f"Updating user profile picture path to: {file_path}")
    user.profile_picture = file_path
    db.commit()
    print("Profile picture path saved successfully")
    return file_path     
