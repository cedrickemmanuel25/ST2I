from sqlalchemy import Column, Integer, String, Time, Date, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.database import Base

class Schedule(Base):
    __tablename__ = "horaires"

    id = Column(Integer, primary_key=True, index=True)
    jour_semaine = Column(Integer) # 0=Lundi, 6=Dimanche
    heure_debut = Column(Time)
    heure_fin = Column(Time)
    active = Column(Boolean, default=True)
    description = Column(String, nullable=True)

class ScheduleException(Base):
    __tablename__ = "horaires_exceptions"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, index=True)
    type = Column(String) # ferie, conge, exceptionnel
    heure_debut = Column(Time, nullable=True) # None pour jour complet
    heure_fin = Column(Time, nullable=True)
    description = Column(String)
