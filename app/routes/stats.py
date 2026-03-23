from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.routes.auth import get_current_user
from app.models.user import User
from app.models.attendance import Attendance
from app.utils.stats_logic import get_global_kpis, get_attendance_trends, get_user_stats
from app.utils.reporting import generate_excel_report, generate_pdf_report

router = APIRouter(prefix="/stats", tags=["Statistics"])

@router.get("/summary")
def get_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    return get_global_kpis(db)

@router.get("/trends")
def get_trends(
    days: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    return get_attendance_trends(db, days)

@router.get("/alerts")
def get_alerts(
    limit: int = 5,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    from app.utils.stats_logic import get_recent_alerts
    return get_recent_alerts(db, limit)

@router.get("/user/{user_id}")
def get_user_statistics(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Admin can see everyone, users can only see themselves
    if current_user.role != "admin" and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Unauthorized")
    return get_user_stats(db, user_id)

@router.get("/export")
def export_report(
    type: str = Query("excel", regex="^(excel|pdf)$"),
    user_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    
    # Fetch data (filtered if user_id provided)
    query = db.query(Attendance)
    if user_id:
        query = query.filter(Attendance.user_id == user_id)
    
    # Limit to 1000 for safety in export
    attendances = query.order_by(Attendance.timestamp.desc()).limit(1000).all()
    
    # Format for reporting utils
    report_data = []
    for att in attendances:
        report_data.append({
            "timestamp": att.timestamp.isoformat(),
            "type": att.type,
            "statut": att.statut,
            "note": att.note,
            "user": {
                "nom": att.user.nom,
                "prenom": att.user.prenom
            }
        })

    if type == "excel":
        file_obj = generate_excel_report(report_data)
        filename = f"ST2I_Report_{datetime.now().strftime('%Y%m%d')}.xlsx"
        media_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    else:
        file_obj = generate_pdf_report(report_data)
        filename = f"ST2I_Report_{datetime.now().strftime('%Y%m%d')}.pdf"
        media_type = "application/pdf"

    return StreamingResponse(
        file_obj,
        media_type=media_type,
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
