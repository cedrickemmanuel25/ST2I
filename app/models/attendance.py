from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.database import Base

class AttendanceType(str, enum.Enum):
    ARRIVEE = "arrivée"
    DEPART = "départ"
    ABSENCE = "absence_justifiée"

class AttendanceStatus(str, enum.Enum):
    SUCCES = "succès"
    HORS_ZONE = "hors_zone"
    HORS_HORAIRES = "hors_horaires"
    MANUEL = "manuel"

class Attendance(Base):
    __tablename__ = "presences"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    timestamp = Column(DateTime, default=datetime.utcnow)
    type = Column(String) # arrivée, départ
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    statut = Column(String) # succès, hors_zone, hors_horaires, manuel
    note = Column(String, nullable=True)
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    user = relationship(
        "User", 
        back_populates="presences", 
        foreign_keys=[user_id]
    )
    created_by = relationship(
        "User", 
        back_populates="created_attendances",
        foreign_keys=[created_by_id]
    )
