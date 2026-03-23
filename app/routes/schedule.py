from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import pytz

from app.database import get_db
from app.models.schedule import Schedule, ScheduleException
from app.schemas.schedule import (
    ScheduleCreate, ScheduleResponse, 
    ScheduleExceptionCreate, ScheduleExceptionResponse,
    ScheduleStatusCheck
)
from app.routes.auth import get_current_user
from app.models.user import User
from app.utils.schedule_utils import is_within_schedule, TIMEZONE

router = APIRouter(prefix="/horaires", tags=["Schedules"])

@router.get("/", response_model=List[ScheduleResponse])
def get_schedules(db: Session = Depends(get_db)):
    return db.query(Schedule).all()

@router.post("/", response_model=ScheduleResponse)
def create_schedule(
    request: ScheduleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    
    db_schedule = Schedule(**request.model_dump())
    db.add(db_schedule)
    db.commit()
    db.refresh(db_schedule)
    return db_schedule

@router.post("/exceptions", response_model=ScheduleExceptionResponse)
def add_exception(
    request: ScheduleExceptionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    
    db_exception = ScheduleException(**request.model_dump())
    db.add(db_exception)
    db.commit()
    db.refresh(db_exception)
    return db_exception

@router.get("/today", response_model=ScheduleStatusCheck)
def check_today_schedule(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    now_local = datetime.now(TIMEZONE)
    is_allowed, status_code = is_within_schedule(db, current_user.id, now_local)
    
    return {
        "within_schedule": is_allowed,
        "status": status_code,
        "message": "Pointage autorisé" if is_allowed else "Hors des horaires autorisés"
    }

@router.delete("/{id}")
def delete_schedule(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    
    db_schedule = db.query(Schedule).filter(Schedule.id == id).first()
    if not db_schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    
    db.delete(db_schedule)
    db.commit()
    return {"message": "Schedule deleted"}
