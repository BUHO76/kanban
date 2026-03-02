from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import httpx
import os

from . import models, schemas
from .database import engine, get_db
from .auth import get_current_user, get_current_user_optional

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Project Service", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

USER_SERVICE_URL = os.getenv("USER_SERVICE_URL", "http://user-service:8000")

# Projects
@app.post("/api/projects", response_model=schemas.Project)
def create_project(
    project: schemas.ProjectCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    db_project = models.Project(
        **project.dict(),
        owner_id=current_user["user_id"]
    )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

@app.get("/api/projects", response_model=List[schemas.Project])
def get_projects(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user_optional)
):
    if current_user:
        projects = db.query(models.Project).filter(
            models.Project.owner_id == current_user["user_id"]
        ).all()
    else:
        projects = db.query(models.Project).all()
    return projects

@app.get("/api/projects/{project_id}", response_model=schemas.ProjectDetail)
def get_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user_optional)
):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@app.put("/api/projects/{project_id}", response_model=schemas.Project)
def update_project(
    project_id: int,
    project_update: schemas.ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if project.owner_id != current_user["user_id"] and current_user["role"] != "ADMIN":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    for key, value in project_update.dict(exclude_unset=True).items():
        setattr(project, key, value)
    
    db.commit()
    db.refresh(project)
    return project

@app.delete("/api/projects/{project_id}")
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if project.owner_id != current_user["user_id"] and current_user["role"] != "ADMIN":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    db.delete(project)
    db.commit()
    return {"message": "Project deleted successfully"}

# Tasks
@app.post("/api/projects/{project_id}/tasks", response_model=schemas.Task)
def create_task(
    project_id: int,
    task: schemas.TaskCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    db_task = models.Task(
        **task.dict(),
        project_id=project_id,
        created_by=current_user["user_id"]
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@app.get("/api/projects/{project_id}/tasks", response_model=List[schemas.Task])
def get_tasks(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user_optional)
):
    tasks = db.query(models.Task).filter(models.Task.project_id == project_id).all()
    return tasks

@app.put("/api/tasks/{task_id}", response_model=schemas.Task)
def update_task(
    task_id: int,
    task_update: schemas.TaskUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    for key, value in task_update.dict(exclude_unset=True).items():
        setattr(task, key, value)
    
    db.commit()
    db.refresh(task)
    return task

@app.delete("/api/tasks/{task_id}")
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    db.delete(task)
    db.commit()
    return {"message": "Task deleted successfully"}

@app.post("/api/tasks/{task_id}/assign/{user_id}")
def assign_task(
    task_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task.assigned_to = user_id
    db.commit()
    return {"message": "Task assigned successfully"}