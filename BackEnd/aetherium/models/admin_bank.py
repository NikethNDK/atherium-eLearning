from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, DateTime
from datetime import datetime, timezone
from sqlalchemy.orm import relationship
from aetherium.database.db import Base

class AdminBankDetails(Base):
    __tablename__ = "admin_bank_details"
    
    id = Column(Integer, primary_key=True, index=True)
    admin_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    account_holder_name = Column(String(255), nullable=False)
    account_number = Column(String(20), nullable=False)
    ifsc_code = Column(String(11), nullable=False)
    branch_name = Column(String(255), nullable=False)
    bank_name = Column(String(255), nullable=False)
    is_primary = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # Relationships
    admin = relationship("User", foreign_keys=[admin_id], backref="admin_bank_details")

