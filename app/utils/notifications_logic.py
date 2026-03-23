from sqlalchemy.orm import Session
from datetime import datetime, date
import pytz
from app.models.notification import Notification
from app.models.attendance import Attendance
from app.models.user import User
from app.database import SessionLocal

local_tz = pytz.timezone("Africa/Abidjan")

def create_notification(db: Session, user_id: int, titre: str, message: str, type: str):
    db_notification = Notification(
        user_id=user_id,
        titre=titre,
        message=message,
        type=type,
        date_envoi=datetime.now(local_tz)
    )
    db.add(db_notification)
    db.commit()
    db.refresh(db_notification)
    
    # Placeholder for FCM Push
    send_push_notification(user_id, titre, message)
    
    return db_notification

def send_push_notification(user_id: int, titre: str, message: str):
    # This would call Firebase Admin SDK
    print(f"DEBUG: Sending Push to User {user_id}: {titre} - {message}")

def check_missing_pointages():
    """Job scheduled for 09:30 AM daily"""
    db = SessionLocal()
    try:
        today = date.today()
        # Find all active users who haven't clocked in today
        users_with_attendance = db.query(Attendance.user_id).filter(
            Attendance.type == "arrivée",
            Attendance.timestamp >= datetime.combine(today, datetime.min.time())
        ).subquery()
        
        missing_users = db.query(User).filter(
            User.statut == "actif",
            ~User.id.in_(users_with_attendance)
        ).all()
        
        for user in missing_users:
            create_notification(
                db, 
                user.id, 
                "Rappel de Pointage", 
                "Il est 9h30 et vous n'avez pas encore pointé votre arrivée. Merci de le faire dès que possible.", 
                "rappel"
            )
    finally:
        db.close()
