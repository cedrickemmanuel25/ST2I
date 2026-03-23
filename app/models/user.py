from sqlalchemy import Column, Integer, String, Boolean, DateTime, func, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base
import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String)
    prenom = Column(String)
    email = Column(String, unique=True, index=True)
    mot_de_passe = Column(String)
    role = Column(String) # admin/employe/etudiant
    statut = Column(String, default="actif") # actif/inactif
    date_creation = Column(DateTime(timezone=True), server_default=func.now())

    # Explicit relationships instead of backref to avoid mapper crashes
    presences = relationship("Attendance", back_populates="user", foreign_keys="[Attendance.user_id]")
    created_attendances = relationship("Attendance", back_populates="created_by", foreign_keys="[Attendance.created_by_id]")
    notifications = relationship("Notification", back_populates="user")
