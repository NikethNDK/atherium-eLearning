from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List

class AdminBankDetailsCreate(BaseModel):
    account_holder_name: str = Field(..., min_length=2, max_length=255)
    account_number: str = Field(..., min_length=6, max_length=20, pattern=r'^[0-9]+$')
    ifsc_code: str = Field(..., min_length=11, max_length=11, pattern=r'^[A-Z]{4}0[A-Z0-9]{6}$')
    branch_name: str = Field(..., min_length=2, max_length=255)
    bank_name: str = Field(..., min_length=3, max_length=255)
    is_primary: bool = True

class AdminBankDetailsResponse(BaseModel):
    id: int
    admin_id: int
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

class AdminBankDetailsUpdate(BaseModel):
    account_holder_name: Optional[str] = Field(None, min_length=2, max_length=255)
    account_number: Optional[str] = Field(None, min_length=6, max_length=20, pattern=r'^[0-9]+$')
    ifsc_code: Optional[str] = Field(None, min_length=11, max_length=11, pattern=r'^[A-Z]{4}0[A-Z0-9]{6}$')
    branch_name: Optional[str] = Field(None, min_length=2, max_length=255)
    bank_name: Optional[str] = Field(None, min_length=3, max_length=255)
    is_primary: Optional[bool] = None

class AdminWithdrawalRequest(BaseModel):
    amount: float = Field(..., gt=99, description="Minimum withdrawal amount is ₹100")

class AdminWithdrawalResponse(BaseModel):
    id: int
    admin_id: int
    amount: float
    status: str
    bank_details_id: int
    requested_at: datetime
    processed_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

