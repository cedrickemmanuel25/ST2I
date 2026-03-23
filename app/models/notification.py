from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum as SqlEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import pytz
from app.database import Base

local_tz = pytz.timezone("Africa/Abidjan")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    titre = Column(String)
    message = Column(String)
    type = Column(String)  # rappel, alerte, info
    date_envoi = Column(DateTime, default=lambda: datetime.now(local_tz))
    est_lu = Column(Boolean, default=False)

    user = relationship("User", back_populates="notifications")
