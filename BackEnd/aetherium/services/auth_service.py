from sqlalchemy.orm import Session
from aetherium.models.user import User, Role
from aetherium.schemas.user import UserCreate, UserUpdate
from aetherium.utils.password_hash import hash_password
from fastapi import HTTPException, status

def create_user(db: Session, user: UserCreate) -> User:
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    
    role = db.query(Role).filter(Role.id == user.role_id).first()
    if not role:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid role")
    
    hashed_password = hash_password(user.password)
    db_user = User(
        email=user.email,
        password_hash=hashed_password,
        role_id=user.role_id,
        title=user.title,
        designation=user.designation
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user_bio(db: Session, user_update: UserUpdate, email: str) -> User:
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    if user_update.title is not None:
        user.title = user_update.title
    if user_update.designation is not None:
        user.designation = user_update.designation
    
    db.commit()
    db.refresh(user)
    return user