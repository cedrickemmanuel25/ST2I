from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ScanRequest(BaseModel):
    qr_token: str
    latitude: float
    longitude: float
    type: str # arrivée, départ

class ManualEntryRequest(BaseModel):
    user_id: int
    timestamp: datetime
    type: str
    note: str

class AttendanceResponse(BaseModel):
    id: int
    user_id: int
    timestamp: datetime
    type: str
    statut: str
    note: Optional[str]

    class Config:
        from_attributes = True

class AttendanceListResponse(BaseModel):
    total: int
    items: List[AttendanceResponse]
