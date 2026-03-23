from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from datetime import datetime, timedelta, date
from typing import List, Dict, Any
from app.models.attendance import Attendance
from app.models.user import User

def get_global_kpis(db: Session):
    today = date.today()
    yesterday = today - timedelta(days=1)
    
    total_users = db.query(User).filter(User.statut == "actif").count()
    
    # Today's stats
    daily_attendees = db.query(func.count(func.distinct(Attendance.user_id))).filter(
        func.date(Attendance.timestamp) == today
    ).scalar() or 0
    
    # Yesterday's stats for trend
    yesterday_attendees = db.query(func.count(func.distinct(Attendance.user_id))).filter(
        func.date(Attendance.timestamp) == yesterday
    ).scalar() or 0
    
    # Monthly stats
    month_start = today.replace(day=1)
    monthly_scans_count = db.query(func.count(func.distinct(Attendance.user_id, func.date(Attendance.timestamp)))).filter(
        Attendance.timestamp >= month_start
    ).scalar() or 0
    
    # Estimated monthly rate (simplistic: average daily rate)
    days_passed = (today - month_start).days + 1
    monthly_rate = (monthly_scans_count / (total_users * days_passed) * 100) if (total_users > 0 and days_passed > 0) else 0

    latecomers = db.query(func.count(Attendance.id)).filter(
        func.date(Attendance.timestamp) == today,
        Attendance.statut == "hors_horaires"
    ).scalar() or 0

    return {
        "total_users": total_users,
        "daily_attendees": daily_attendees,
        "yesterday_attendees": yesterday_attendees,
        "attendance_rate": round((daily_attendees / total_users * 100) if total_users > 0 else 0, 2),
        "monthly_rate": round(monthly_rate, 2),
        "latecomers": latecomers,
        "absents": max(0, total_users - daily_attendees)
    }

def get_attendance_trends(db: Session, last_days: int = 30):
    end_date = date.today()
    start_date = end_date - timedelta(days=last_days)
    
    total_users = db.query(User).filter(User.statut == "actif").count()
    
    trends = []
    current_date = start_date
    while current_date <= end_date:
        count = db.query(func.count(func.distinct(Attendance.user_id))).filter(
            func.date(Attendance.timestamp) == current_date
        ).scalar() or 0
        
        trends.append({
            "date": current_date.isoformat(),
            "real_count": count,
            "theoretical_count": total_users
        })
        current_date += timedelta(days=1)
        
    return trends

def get_recent_alerts(db: Session, limit: int = 5):
    # Anomalies: hors_horaires, hors_zone (if we had coordinates validation)
    alerts = db.query(Attendance).filter(
        or_(
            Attendance.statut == "hors_horaires",
            Attendance.note.like("%anomalie%")
        )
    ).order_by(Attendance.timestamp.desc()).limit(limit).all()
    
    return [
        {
            "id": a.id,
            "user_name": f"{a.user.prenom} {a.user.nom}",
            "type": a.type,
            "statut": a.statut,
            "timestamp": a.timestamp.isoformat(),
            "message": "Pointage hors horaires" if a.statut == "hors_horaires" else a.note
        } for a in alerts
    ]

def get_user_stats(db: Session, user_id: int):
    # Total scans
    total_scans = db.query(Attendance).filter(Attendance.user_id == user_id).count()
    
    # Success rate
    success_scans = db.query(Attendance).filter(
        Attendance.user_id == user_id,
        Attendance.statut == "succès"
    ).count()
    
    # Rank absences (simple mock for now: days without scans in last 30 days)
    # real logic would require joining with a calendar table
    
    return {
        "total_scans": total_scans,
        "success_rate": round((success_scans / total_scans * 100), 2) if total_scans > 0 else 0,
        "scans_by_type": {
            "arrivée": db.query(Attendance).filter(Attendance.user_id == user_id, Attendance.type == "arrivée").count(),
            "départ": db.query(Attendance).filter(Attendance.user_id == user_id, Attendance.type == "départ").count(),
        }
    }
