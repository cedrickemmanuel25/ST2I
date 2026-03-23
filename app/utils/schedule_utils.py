from datetime import datetime, time, timedelta, date
import pytz
from sqlalchemy.orm import Session
from app.models.schedule import Schedule, ScheduleException

TIMEZONE = pytz.timezone("Africa/Abidjan")
TOLERANCE_MINUTES = 15

def is_within_schedule(db: Session, user_id: int, dt: datetime) -> tuple[bool, str]:
    """
    Checks if a given datetime is within the allowed shifts for a user.
    Returns (is_allowed, status_code)
    """
    # 1. Check for specific exceptions/holidays for this date
    target_date = dt.date()
    exception = db.query(ScheduleException).filter(ScheduleException.date == target_date).first()
    
    if exception:
        if exception.type == "ferie" or (exception.heure_debut is None):
            return False, "hors_horaires" # Day off
        
        # Check specific hours for the exception
        target_time = dt.time()
        start_with_tol = (datetime.combine(date.today(), exception.heure_debut) - timedelta(minutes=TOLERANCE_MINUTES)).time()
        end_with_tol = (datetime.combine(date.today(), exception.heure_fin) + timedelta(minutes=TOLERANCE_MINUTES)).time()
        
        if start_with_tol <= target_time <= end_with_tol:
            return True, "succès"
        return False, "hors_horaires"

    # 2. Check standard weekly schedule
    day_of_week = dt.weekday()
    schedules = db.query(Schedule).filter(
        Schedule.jour_semaine == day_of_week,
        Schedule.active == True
    ).all()

    if not schedules:
        return False, "hors_horaires"

    target_time = dt.time()
    for sch in schedules:
        # Apply tolerance
        start_dt = datetime.combine(date.today(), sch.heure_debut)
        end_dt = datetime.combine(date.today(), sch.heure_fin)
        
        start_with_tol = (start_dt - timedelta(minutes=TOLERANCE_MINUTES)).time()
        end_with_tol = (end_dt + timedelta(minutes=TOLERANCE_MINUTES)).time()

        if start_with_tol <= target_time <= end_with_tol:
            return True, "succès"

    return False, "hors_horaires"
