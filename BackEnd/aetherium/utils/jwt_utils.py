# Backend/aetherium/utils/jwt_utils.py
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from datetime import datetime, timedelta, timezone
from typing import Dict, Optional
from aetherium.config import settings
from fastapi import Cookie
import logging
from sqlalchemy.orm import Session
from aetherium.database.db import get_db
from aetherium.models.user import User

logger = logging.getLogger(__name__)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def create_access_token(data: Dict[str, str]) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MIN)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    logger.debug(f"Created JWT: {encoded_jwt[:30]}...")
    return encoded_jwt

# async def get_current_user(access_token: str = Cookie(None)) -> Optional[Dict[str, str]]:
#     if access_token is None:
#         logger.debug("No access_token cookie found")
#         return None
#     credentials_exception = HTTPException(
#         status_code=status.HTTP_401_UNAUTHORIZED,
#         detail="Could not validate credentials",
#         headers={"WWW-Authenticate": "Bearer"},
#     )
#     try:
#         payload = jwt.decode(access_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
#         email: str = payload.get("sub")
#         role: str = payload.get("role")
#         if email is None or role is None:
#             logger.error("Invalid payload: missing email or role")
#             raise credentials_exception
#         logger.debug(f"Decoded JWT: email={email}, role={role}")
#         return {"email": email, "role": role}
#     except JWTError as e:
#         logger.error(f"JWT decode error: {str(e)}")
#         raise credentials_exception



async def get_current_user(access_token: Optional[str] = Cookie(None),db: Session = Depends(get_db)) -> User:
    if access_token is None:
        logger.debug("No access_token cookie found")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(access_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            logger.error("Invalid payload: missing email")
            raise credentials_exception

        user = db.query(User).filter(User.email == email).first()
        if user is None:
            logger.error("User not found for email from token")
            raise credentials_exception

        logger.debug(f"Authenticated user: {user.email} (role={user.role})")
        return user
    except JWTError as e:
        logger.error(f"JWT decode error: {str(e)}")
        raise credentials_exception
