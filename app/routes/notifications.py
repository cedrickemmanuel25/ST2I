from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.routes.auth import get_current_user
from app.models.user import User
from app.models.notification import Notification
from app.schemas.notification import NotificationResponse, NotificationList, NotificationCreate
from app.utils.notifications_logic import create_notification

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("/", response_model=NotificationList)
def get_my_notifications(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Notification).filter(Notification.user_id == current_user.id)
    total = query.count()
    items = query.order_by(Notification.date_envoi.desc()).offset(skip).limit(limit).all()
    return {"items": items, "total": total}

@router.patch("/{notification_id}/read")
def mark_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    notif = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    notif.est_lu = True
    db.commit()
    return {"status": "success"}

@router.patch("/read-all")
def mark_all_as_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.est_lu == False
    ).update({"est_lu": True})
    db.commit()
    return {"status": "success"}

@router.post("/send")
def admin_send_notification(
    data: NotificationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    
    return create_notification(db, data.user_id, data.titre, data.message, data.type)
