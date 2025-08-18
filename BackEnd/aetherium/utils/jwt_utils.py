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
import redis


logger = logging.getLogger(__name__)

redis_client = redis.Redis(host=settings.REDIS_HOST, port=settings.REDIS_PORT, db=settings.REDIS_DB, decode_responses=True)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")




def create_access_token(data: Dict[str, str]) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MIN)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    logger.debug(f"Created JWT: {encoded_jwt[:30]}...")
    return encoded_jwt

def create_refresh_token(data: Dict[str, str]) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.REFRESH_TOKEN_EXPIRE_MIN)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    logger.debug(f"Created JWT: {encoded_jwt[:30]}...")
    return encoded_jwt

def blacklist_token(token: str,user_id:int)->None:
    ttl=settings.ACCESS_TOKEN_EXPIRE_MIN * 60
    redis_client.setex(f"black:{token}",ttl,str(user_id))

def is_token_blacklisted(token: str)->bool:
    return redis_client.get(f"black:{token}") is not None



async def get_current_user(access_token: Optional[str] = Cookie(None),db: Session = Depends(get_db)) -> User:
    if access_token is None:
        logger.debug("No access_token cookie found")
        return None
        # raise HTTPException(
        #     status_code=status.HTTP_401_UNAUTHORIZED,
        #     detail="Not authenticated"
        # )
    if is_token_blacklisted(access_token):
        logger.debug("Token is blacklisted")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token is blacklisted",
            headers={"WWW-Authenticate": "Bearer"},
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

        logger.debug(f"Authenticated user: {user.email} (role={user.role.name})")
        return user
    except JWTError as e:
        logger.error(f"JWT decode error: {str(e)}")
        raise credentials_exception


