from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, DateTime, Float, Text, Enum
from datetime import datetime, timezone
from sqlalchemy.orm import relationship
from aetherium.database.db import Base
from aetherium.models.enum import WithdrawalStatus, withdrawal_status_enum

class WithdrawalRequest(Base):
    __tablename__ = "withdrawal_requests"
    
    id = Column(Integer, primary_key=True, index=True)
    instructor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount = Column(Float, nullable=False)
    status = Column(withdrawal_status_enum, default=WithdrawalStatus.PENDING, nullable=False)
    admin_feedback = Column(Text, nullable=True)
    admin_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    requested_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    reviewed_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    
    # Relationships
    instructor = relationship("User", foreign_keys=[instructor_id], backref="withdrawal_requests")
    admin = relationship("User", foreign_keys=[admin_id], backref="admin_withdrawal_reviews")

class BankDetails(Base):
    __tablename__ = "bank_details"
    
    id = Column(Integer, primary_key=True, index=True)
    instructor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    account_holder_name = Column(String(255), nullable=False)
    account_number = Column(String(50), nullable=False)
    ifsc_code = Column(String(20), nullable=False)
    branch_name = Column(String(255), nullable=False)
    bank_name = Column(String(255), nullable=False)
    is_primary = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    # Relationships
    instructor = relationship("User", backref="bank_details")
