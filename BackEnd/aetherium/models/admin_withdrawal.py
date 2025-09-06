from sqlalchemy import Column, Integer, String, ForeignKey, Float, DateTime, Text, Enum
from datetime import datetime, timezone
from sqlalchemy.orm import relationship
from aetherium.database.db import Base
from aetherium.models.enum import WithdrawalStatus

class AdminWithdrawalRequest(Base):
    __tablename__ = "admin_withdrawal_requests"
    
    id = Column(Integer, primary_key=True, index=True)
    admin_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount = Column(Float, nullable=False)
    status = Column(Enum(WithdrawalStatus), default=WithdrawalStatus.PENDING, nullable=False)
    bank_details_id = Column(Integer, ForeignKey("admin_bank_details.id"), nullable=False)
    requested_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    processed_at = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)
    
    # Relationships
    admin = relationship("User", foreign_keys=[admin_id], backref="admin_withdrawal_requests")
    bank_details = relationship("AdminBankDetails", foreign_keys=[bank_details_id])

