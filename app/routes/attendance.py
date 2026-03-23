from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import datetime, date, time
import pytz
import os
from typing import Optional, List

from app.database import get_db
from app.models.attendance import Attendance, AttendanceStatus
from app.models.user import User
from app.schemas.attendance import ScanRequest, ManualEntryRequest, AttendanceResponse, AttendanceListResponse
from app.routes.auth import get_current_user
from app.utils.geo_utils import calculate_distance
from app.utils.qr_logic import validate_qr_token
from app.utils.schedule_utils import is_within_schedule, TIMEZONE
from app.utils.notifications_logic import create_notification
from app.utils.qr_security import validate_qr_token_v2
from app.models.token import TokenBlacklist

router = APIRouter(prefix="/pointage", tags=["Attendance"])

# Configuration Bureau (Exemple : Abidjan Plateau)
OFFICE_LAT = 5.3261
OFFICE_LON = -4.0197
GEO_FENCE_RADIUS = 50 # mètres

TIMEZONE = pytz.timezone("Africa/Abidjan")

@router.post("/scan", response_model=AttendanceResponse)
def process_scan(
    request: ScanRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Valider le Token QR (V2 avec signature et blacklist)
    if not validate_qr_token_v2(db, request.qr_token, current_user.id):
        raise HTTPException(status_code=400, detail="L'identification QR a échoué (token invalide, expiré ou déjà utilisé)")

    # 2. Vérifier la Géolocalisation
    # On récupère les coordonnées du bureau depuis les variables d'environnement
    office_lat = float(os.getenv("OFFICE_LAT", OFFICE_LAT))
    office_lon = float(os.getenv("OFFICE_LON", OFFICE_LON))
    geo_radius = float(os.getenv("OFFICE_RADIUS_METERS", GEO_FENCE_RADIUS))
    
    distance = calculate_distance(request.latitude, request.longitude, office_lat, office_lon)
    scan_status = AttendanceStatus.SUCCES
    
    if distance > geo_radius:
        scan_status = AttendanceStatus.HORS_ZONE

    # 3. Vérifier les Horaires via Schedule Utils
    now_local = datetime.now(TIMEZONE)
    is_allowed, schedule_status = is_within_schedule(db, current_user.id, now_local)
    
    if not is_allowed:
        create_notification(
            db, 
            current_user.id, 
            "Alerte Horaire", 
            f"Votre scan de {request.type} à {now_local.strftime('%H:%M')} est hors de votre plage autorisée.", 
            "alerte"
        )
        scan_status = AttendanceStatus.HORS_HORAIRES
    # Note: if both are fail, HORS_ZONE might have priority or vice-versa, 
    # here we keep HORS_ZONE if distance > 50 even if timing is OK.
    # But if timing is bad, it flags HORS_HORAIRES.

    # 4. Enregistrer
    db_attendance = Attendance(
        user_id=current_user.id,
        timestamp=datetime.utcnow(),
        type=request.type,
        latitude=request.latitude,
        longitude=request.longitude,
        statut=scan_status.value
    )
    
    db.add(db_attendance)
    # 5. Blacklister le token pour éviter le replay
    token_uuid = request.qr_token.split(":")[2] # user_id:date:uuid:sig
    blacklist_entry = TokenBlacklist(token=token_uuid)
    db.add(blacklist_entry)
    
    db.commit()
    db.refresh(db_attendance)
    
    return db_attendance

@router.get("/today", response_model=List[AttendanceResponse])
def get_today_attendance(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    today = date.today()
    return db.query(Attendance).filter(
        Attendance.user_id == current_user.id,
        Attendance.timestamp >= datetime.combine(today, time.min),
        Attendance.timestamp <= datetime.combine(today, time.max)
    ).all()

@router.get("/history", response_model=AttendanceListResponse)
def get_history(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1),
    user_id: Optional[int] = None,
    statut: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Sécurité : un non-admin ne voit que son historique
    if current_user.role != "admin":
        user_id = current_user.id
        
    query = db.query(Attendance)
    if user_id:
        query = query.filter(Attendance.user_id == user_id)
    if statut:
        query = query.filter(Attendance.statut == statut)
        
    total = query.count()
    items = query.order_by(Attendance.timestamp.desc()).offset((page-1)*limit).limit(limit).all()
    
    return {"total": total, "items": items}

@router.post("/manual", response_model=AttendanceResponse)
def manual_entry(
    request: ManualEntryRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Réservé aux administrateurs")
        
    db_attendance = Attendance(
        user_id=request.user_id,
        timestamp=request.timestamp,
        type=request.type,
        statut=AttendanceStatus.MANUEL.value,
        note=request.note
    )
    db.add(db_attendance)
    db.commit()
    db.refresh(db_attendance)
    return db_attendance
