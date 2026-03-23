import hmac
import hashlib
import os
from datetime import date
import uuid

SECRET_KEY = os.getenv("QR_SECRET_KEY", "st2i_super_secret_qr_key")

def generate_daily_qr_token(user_id: int) -> str:
    """
    Generates a daily rotating token: UUID + Date + HMAC
    """
    today = str(date.today())
    u_id = str(uuid.uuid4())
    
    message = f"{user_id}:{today}:{u_id}"
    signature = hmac.new(
        SECRET_KEY.encode(),
        message.encode(),
        hashlib.sha256
    ).hexdigest()
    
    return f"{message}:{signature[:16]}"

def validate_qr_token(token: str, user_id: int) -> bool:
    """
    Validates the token: checks user_id, today's date, and signature
    """
    try:
        parts = token.split(":")
        if len(parts) != 4:
            return False
            
        t_user_id, t_date, t_uuid, t_sig = parts
        
        # Check if user_id matches
        if int(t_user_id) != user_id:
            return False
            
        # Check if date is today
        if t_date != str(date.today()):
            return False
            
        # Validate signature
        message = f"{t_user_id}:{t_date}:{t_uuid}"
        recomputed_sig = hmac.new(
            SECRET_KEY.encode(),
            message.encode(),
            hashlib.sha256
        ).hexdigest()[:16]
        
        return hmac.compare_digest(t_sig, recomputed_sig)
    except Exception:
        return False
