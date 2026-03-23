import hmac
import hashlib
import os
import uuid
from datetime import datetime, date
import pytz
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.token import TokenBlacklist

QR_SECRET_KEY = os.getenv("QR_SECRET_KEY", "st2i_qr_prod_secret_2026")
TIMEZONE = pytz.timezone("Africa/Abidjan")

def generate_secure_qr_token(user_id: int) -> str:
    """
    Generates a secure, signed QR token: user_id:date:uuid:signature
    """
    today = datetime.now(TIMEZONE).date().isoformat()
    u_id = str(uuid.uuid4())
    
    # Payload
    message = f"{user_id}:{today}:{u_id}"
    
    # Signature HMAC-SHA256
    signature = hmac.new(
        QR_SECRET_KEY.encode(),
        message.encode(),
        hashlib.sha256
    ).hexdigest()
    
    return f"{message}:{signature}"

def validate_qr_token_v2(db: Session, token: str, user_id: int) -> bool:
    """
    Strict validation of the QR token including sign, date, user and blacklist.
    """
    try:
        parts = token.split(":")
        if len(parts) != 4:
            return False
            
        t_user_id, t_date, t_uuid, t_sig = parts
        
        # 1. User verification
        if int(t_user_id) != user_id:
            return False
            
        # 2. Date verification
        today = datetime.now(TIMEZONE).date().isoformat()
        if t_date != today:
            return False
            
        # 3. HMAC Signature verification
        message = f"{t_user_id}:{t_date}:{t_uuid}"
        expected_sig = hmac.new(
            QR_SECRET_KEY.encode(),
            message.encode(),
            hashlib.sha256
        ).hexdigest()
        
        if not hmac.compare_digest(t_sig, expected_sig):
            return False
            
        # 4. Replay protection (Blacklist)
        blacklisted = db.query(TokenBlacklist).filter(TokenBlacklist.token == t_uuid).first()
        if blacklisted:
            return False
            
        return True
    except Exception:
        return False

def rotate_all_qr_codes(db: Session):
    """
    Task to rotate tokens for all active users.
    """
    users = db.query(User).filter(User.statut == "actif").all()
    for user in users:
        user.qr_code_token = generate_secure_qr_token(user.id)
        # Expiry is end of day today
        user.qr_code_expiry = datetime.now(TIMEZONE).replace(hour=23, minute=59, second=59)
    db.commit()

def run_rotation_job():
    from app.database import SessionLocal
    db = SessionLocal()
    try:
        rotate_all_qr_codes(db)
    finally:
        db.close()
