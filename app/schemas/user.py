from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    nom: str
    prenom: str
    email: EmailStr
    role: str # admin, employé, étudiant
    statut: str = "actif"

class UserCreate(UserBase):
    mot_de_passe: str

class UserUpdate(BaseModel):
    nom: Optional[str] = None
    prenom: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    statut: Optional[str] = None
    mot_de_passe: Optional[str] = None

class UserResponse(UserBase):
    id: int
    date_creation: datetime
    qr_code_expiry: Optional[datetime] = None
    last_presence: Optional[datetime] = None

    class Config:
        from_attributes = True

class UserListResponse(BaseModel):
    total: int
    page: int
    limit: int
    users: List[UserResponse]
