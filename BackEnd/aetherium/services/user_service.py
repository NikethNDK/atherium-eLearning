from sqlalchemy.orm import Session
from aetherium.models.user import User
from aetherium.schemas.user import UserResponse
from fastapi import HTTPException,status

def get_all_users(db:Session)->list[UserResponse]:
    users=db.query(User).all()
    return [UserResponse.model_validate(user) for user in users]

def block_user(db: Session, user_id: int, block: bool) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    user.is_active = not block  # If block=True, set is_active=False, and vice versa
    db.commit()
    db.refresh(user)
    return user