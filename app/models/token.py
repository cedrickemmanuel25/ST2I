from sqlalchemy import Column, Integer, String, DateTime, func
from app.database import Base

class TokenBlacklist(Base):
    __tablename__ = "token_blacklist"

    id = Column(Integer, primary_key=True, index=True)
    token = Column(String, unique=True, index=True)
    blacklisted_at = Column(DateTime(timezone=True), server_default=func.now())
