from pydantic import BaseModel
from datetime import time, date
from typing import Optional, List

class ScheduleBase(BaseModel):
    jour_semaine: int
    heure_debut: time
    heure_fin: time
    active: bool = True
    description: Optional[str] = None

class ScheduleCreate(ScheduleBase):
    pass

class ScheduleResponse(ScheduleBase):
    id: int

    class Config:
        from_attributes = True

class ScheduleExceptionBase(BaseModel):
    date: date
    type: str
    heure_debut: Optional[time] = None
    heure_fin: Optional[time] = None
    description: str

class ScheduleExceptionCreate(ScheduleExceptionBase):
    pass

class ScheduleExceptionResponse(ScheduleExceptionBase):
    id: int

    class Config:
        from_attributes = True

class ScheduleStatusCheck(BaseModel):
    within_schedule: bool
    status: str
    message: str
