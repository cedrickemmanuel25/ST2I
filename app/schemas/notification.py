from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class NotificationBase(BaseModel):
    titre: str
    message: str
    type: str

class NotificationCreate(NotificationBase):
    user_id: int

class NotificationResponse(NotificationBase):
    id: int
    date_envoi: datetime
    est_lu: bool

    class Config:
        from_attributes = True

class NotificationList(BaseModel):
    items: List[NotificationResponse]
    total: int
