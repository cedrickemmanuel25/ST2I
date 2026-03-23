from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.token import TokenBlacklist
from app.schemas.auth import LoginRequest, TokenResponse, UserInfo, TokenData
from app.utils.security import verify_password, create_access_token, decode_token
from datetime import timedelta

router = APIRouter(prefix="/auth", tags=["Authentication"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    # Check blacklist
    blacklisted = db.query(TokenBlacklist).filter(TokenBlacklist.token == token).first()
    if blacklisted:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token blacklisted")

    payload = decode_token(token)
    if payload is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    
    user_id: int = payload.get("user_id")
    if user_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    
    if user.statut != "actif":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Compte inactif")
    
    return user

@router.post("/login", response_model=TokenResponse)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.mot_de_passe):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Email ou mot de passe incorrect")
    
    if user.statut != "actif":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Compte inactif")

    token_data = {"user_id": user.id, "email": user.email, "role": user.role}
    access_token = create_access_token(data=token_data)
    
    return {"access_token": access_token, "token_type": "bearer", "role": user.role}

@router.post("/logout")
def logout(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    # Add token to blacklist
    db_token = TokenBlacklist(token=token)
    db.add(db_token)
    db.commit()
    return {"message": "DÉCONNEXION réussie"}

@router.post("/refresh", response_model=TokenResponse)
def refresh(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    # Verify and refresh
    user = get_current_user(token, db)
    token_data = {"user_id": user.id, "email": user.email, "role": user.role}
    new_token = create_access_token(data=token_data)
    
    return {"access_token": new_token, "token_type": "bearer", "role": user.role}

@router.get("/me", response_model=UserInfo)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
