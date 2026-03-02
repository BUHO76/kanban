from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
import httpx
import os

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token", auto_error=False)
USER_SERVICE_URL = os.getenv("USER_SERVICE_URL", "http://user-service:8000")
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")
ALGORITHM = "HS256"

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    if not token:
        raise credentials_exception
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        role: str = payload.get("role")
        user_id: int = payload.get("user_id")
        
        if email is None:
            raise credentials_exception
        
        return {"email": email, "role": role, "user_id": user_id}
    except JWTError:
        raise credentials_exception

async def get_current_user_optional(token: str = Depends(oauth2_scheme)):
    if not token:
        return None
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        role: str = payload.get("role")
        user_id: int = payload.get("user_id")
        
        if email is None:
            return None
        
        return {"email": email, "role": role, "user_id": user_id}
    except JWTError:
        return None