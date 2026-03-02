from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List
import os

from . import models, schemas, auth
from .database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="User Service", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

@app.post("/api/register", response_model=schemas.User)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(
        models.User.email == user.email
    ).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(
        email=user.email,
        username=user.username,
        hashed_password=hashed_password,
        role=user.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/api/token", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(
        models.User.email == form_data.username
    ).first()
    
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.email, "role": user.role, "user_id": user.id},
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/users/me", response_model=schemas.User)
def read_users_me(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = auth.decode_token(token)
    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = db.query(models.User).filter(models.User.email == payload.get("sub")).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.get("/api/users", response_model=List[schemas.User])
def get_users(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    payload = auth.decode_token(token)
    if payload is None or payload.get("role") != "ADMIN":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    users = db.query(models.User).all()
    return users