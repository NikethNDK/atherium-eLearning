from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from aetherium.database.db import get_db
from aetherium.models.user import User
from aetherium.utils.jwt_utils import get_current_user
from aetherium.schemas.admin_bank import AdminWithdrawalRequest, AdminWithdrawalResponse
from aetherium.services.admin_withdrawal_service import admin_withdrawal_service
from aetherium.services.admin_bank_service import admin_bank_service
from typing import List

router = APIRouter()

@router.post("/withdrawal/request", response_model=AdminWithdrawalResponse)
async def create_admin_withdrawal(
    withdrawal_data: AdminWithdrawalRequest,
    bank_details_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create immediate withdrawal for admin (debit wallet immediately)"""
    if current_user.role.name != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Only admins can create withdrawals"
        )
    
    try:
        withdrawal_request = admin_withdrawal_service.create_immediate_withdrawal(
            db=db,
            admin_id=current_user.id,
            amount=withdrawal_data.amount,
            bank_details_id=bank_details_id
        )
        return withdrawal_request
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process withdrawal: {str(e)}"
        )

@router.get("/withdrawal/requests", response_model=dict)
async def get_admin_withdrawal_requests(
    page: int = 1,
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get withdrawal requests for admin"""
    if current_user.role.name != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Only admins can access withdrawal requests"
        )
    
    try:
        result = admin_withdrawal_service.get_withdrawal_requests(
            db=db,
            admin_id=current_user.id,
            page=page,
            limit=limit
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch withdrawal requests: {str(e)}"
        )

@router.get("/withdrawal/my-requests", response_model=dict)
async def get_my_admin_withdrawal_requests(
    page: int = 1,
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get admin's own withdrawal requests"""
    if current_user.role.name != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Only admins can access withdrawal requests"
        )
    
    try:
        result = admin_withdrawal_service.get_withdrawal_requests(
            db=db,
            admin_id=current_user.id,
            page=page,
            limit=limit
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch withdrawal requests: {str(e)}"
        )

@router.get("/wallet/balance")
async def get_admin_wallet_balance(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get admin wallet balance"""
    if current_user.role.name != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Only admins can access wallet balance"
        )
    
    try:
        balance = admin_withdrawal_service.get_admin_wallet_balance(
            db=db,
            admin_id=current_user.id
        )
        return {"balance": balance}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch wallet balance: {str(e)}"
        )

@router.get("/bank-details/primary")
async def get_primary_bank_details(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get primary bank details for admin"""
    if current_user.role.name != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Only admins can access bank details"
        )
    
    try:
        bank_details = admin_bank_service.get_primary_bank_details(
            db=db,
            admin_id=current_user.id
        )
        return bank_details
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch primary bank details: {str(e)}"
        )

