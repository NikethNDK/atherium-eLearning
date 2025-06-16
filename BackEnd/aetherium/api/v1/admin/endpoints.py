from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from aetherium.database.db import get_db
from aetherium.services.user_service import get_all_users,block_user
from aetherium.utils.jwt_utils import get_current_user
from aetherium.schemas.user import UserResponse
from typing import List

router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/users", response_model=List[UserResponse])
def list_users(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    users = get_all_users(db)
    return users


@router.post("/users/{user_id}/block", response_model=UserResponse)
def block_user_endpoint(
    user_id: int,
    block: bool,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return block_user(db, user_id, block)