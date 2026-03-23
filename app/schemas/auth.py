from pydantic import BaseModel, EmailStr
from typing import Optional

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    role: str

class UserInfo(BaseModel):
    id: int
    email: EmailStr
    nom: str
    prenom: str
    role: str
    statut: str

    class Config:
        from_attributes = True

class TokenData(BaseModel):
    user_id: Optional[int] = None
    email: Optional[str] = None
    role: Optional[str] = None
