from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
from aetherium.models.enum import WithdrawalStatus

class WithdrawalRequestCreate(BaseModel):
    amount: float = Field(..., gt=0, description="Amount to withdraw (must be greater than 0)")

class WithdrawalRequestResponse(BaseModel):
    id: int
    instructor_id: int
    amount: float
    status: WithdrawalStatus
    admin_feedback: Optional[str] = None
    admin_id: Optional[int] = None
    requested_at: datetime
    reviewed_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    instructor_name: Optional[str] = None
    instructor_balance: Optional[float] = None
    
    class Config:
        from_attributes = True

class WithdrawalRequestUpdate(BaseModel):
    status: WithdrawalStatus
    admin_feedback: Optional[str] = None

class BankDetailsCreate(BaseModel):
    account_holder_name: str = Field(..., min_length=2, max_length=255)
    account_number: str = Field(..., min_length=6, max_length=20, pattern=r'^[0-9]+$')
    ifsc_code: str = Field(..., min_length=11, max_length=11, pattern=r'^[A-Z]{4}0[A-Z0-9]{6}$')
    branch_name: str = Field(..., min_length=2, max_length=255)
    bank_name: str = Field(..., min_length=3, max_length=255)
    is_primary: bool = True

class BankDetailsResponse(BaseModel):
    id: int
    instructor_id: int
    account_holder_name: str
    account_number: str
    ifsc_code: str
    branch_name: str
    bank_name: str
    is_primary: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class WithdrawalRequestListResponse(BaseModel):
    requests: List[WithdrawalRequestResponse]
    total: int
    page: int
    limit: int

class AccountSummaryResponse(BaseModel):
    wallet_balance: float
    total_earnings: float
    pending_withdrawals: float
    completed_withdrawals: float
    withdrawal_requests: List[WithdrawalRequestResponse]
