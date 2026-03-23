from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional
import secrets
from datetime import datetime, timedelta

from app.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate, UserResponse, UserListResponse
from app.routes.auth import get_current_user
from app.utils.security import get_password_hash
from app.utils.qr_utils import generate_qr_base64

router = APIRouter(prefix="/users", tags=["Users"])

def check_admin(user: User = Depends(get_current_user)):
    if user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Seul un administrateur peut effectuer cette action"
        )
    return user

@router.get("", response_model=UserListResponse)
def get_users(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
    role: Optional[str] = None,
    statut: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(User)
    
    if search:
        query = query.filter(
            or_(
                User.nom.ilike(f"%{search}%"),
                User.prenom.ilike(f"%{search}%"),
                User.email.ilike(f"%{search}%")
            )
        )
    
    if role:
        query = query.filter(User.role == role)
    
    if statut:
        query = query.filter(User.statut == statut)
        
    total = query.count()
    users = query.offset((page - 1) * limit).limit(limit).all()
    
    # Enrich with last presence
    from app.models.attendance import Attendance
    from sqlalchemy import func
    
    enriched_users = []
    for user in users:
        last_att = db.query(Attendance).filter(Attendance.user_id == user.id).order_by(Attendance.timestamp.desc()).first()
        user_data = UserResponse.from_orm(user)
        user_data.last_presence = last_att.timestamp if last_att else None
        enriched_users.append(user_data)
    
    return {
        "total": total,
        "page": page,
        "limit": limit,
        "users": enriched_users
    }

@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    user_in: UserCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(check_admin)
):
    # Check if email exists
    if db.query(User).filter(User.email == user_in.email).first():
        raise HTTPException(status_code=400, detail="Cet email est déjà utilisé")
        
    db_user = User(
        nom=user_in.nom,
        prenom=user_in.prenom,
        email=user_in.email,
        role=user_in.role,
        statut=user_in.statut,
        mot_de_passe=get_password_hash(user_in.mot_de_passe)
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin" and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Accès non autorisé")
        
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    return user

@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(check_admin)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
        
    update_data = user_in.model_dump(exclude_unset=True)
    if "mot_de_passe" in update_data:
        update_data["mot_de_passe"] = get_password_hash(update_data["mot_de_passe"])
        
    for field, value in update_data.items():
        setattr(user, field, value)
        
    db.commit()
    db.refresh(user)
    return user

@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(check_admin)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    # Soft delete
    user.statut = "inactif"
    db.commit()
    return {"message": "Utilisateur désactivé (soft delete)"}

@router.post("/{user_id}/generate-qr")
def generate_user_qr(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(check_admin)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
        
    # Generate random token
    token = secrets.token_urlsafe(32)
    user.qr_code_token = token
    # Default expiry: 7 days
    user.qr_code_expiry = datetime.utcnow() + timedelta(days=7)
    
    db.commit()
    return {"message": "QR code généré avec succès", "expiry": user.qr_code_expiry}

@router.get("/{user_id}/qr-code")
def get_user_qr_image(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin" and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Accès non autorisé")
        
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.qr_code_token:
        raise HTTPException(status_code=404, detail="QR code non disponible. Veuillez le générer.")
        
    qr_data = f"ST2I:{user.qr_code_token}"
    base64_image = generate_qr_base64(qr_data)
    return {"qr_code_base64": base64_image}
