from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from aetherium.database.db import get_db
from aetherium.models.user import User
from aetherium.utils.jwt_utils import get_current_user
from aetherium.schemas.withdrawal import (
    WithdrawalRequestCreate, WithdrawalRequestResponse, 
    WithdrawalRequestListResponse, AccountSummaryResponse,
    BankDetailsCreate, BankDetailsResponse
)
from aetherium.services.withdrawal_service import withdrawal_service
from typing import List

router = APIRouter(prefix="/instructor/withdrawal", tags=["instructor-withdrawal"])

@router.post("/request", response_model=WithdrawalRequestResponse)
async def create_withdrawal_request(
    request_data: WithdrawalRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new withdrawal request"""
    if current_user.role.name != "instructor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Only instructors can create withdrawal requests"
        )
    
    try:
        withdrawal_request = await withdrawal_service.create_withdrawal_request(
            db=db,
            instructor_id=current_user.id,
            amount=request_data.amount
        )
        
        # Add instructor name for response
        withdrawal_request.instructor_name = f"{current_user.firstname} {current_user.lastname}"
        
        return withdrawal_request
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create withdrawal request: {str(e)}"
        )

@router.get("/requests", response_model=WithdrawalRequestListResponse)
async def get_withdrawal_requests(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get withdrawal requests for the current instructor"""
    if current_user.role.name != "instructor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Only instructors can access withdrawal requests"
        )
    
    try:
        result = withdrawal_service.get_instructor_withdrawal_requests(
            db=db,
            instructor_id=current_user.id,
            page=page,
            limit=limit
        )
        
        # Add instructor names
        for request in result["requests"]:
            request.instructor_name = f"{current_user.firstname} {current_user.lastname}"
        
        return WithdrawalRequestListResponse(**result)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch withdrawal requests: {str(e)}"
        )

@router.get("/account-summary", response_model=AccountSummaryResponse)
async def get_account_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get instructor account summary"""
    if current_user.role.name != "instructor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Only instructors can access account summary"
        )
    
    try:
        summary = withdrawal_service.get_account_summary(
            db=db,
            instructor_id=current_user.id
        )
        
        # Add instructor names to requests
        for request in summary["withdrawal_requests"]:
            request.instructor_name = f"{current_user.firstname} {current_user.lastname}"
        
        return AccountSummaryResponse(**summary)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch account summary: {str(e)}"
        )

@router.post("/complete/{request_id}", response_model=WithdrawalRequestResponse)
async def complete_withdrawal(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Complete an approved withdrawal request"""
    if current_user.role.name != "instructor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Only instructors can complete withdrawals"
        )
    
    try:
        withdrawal_request = withdrawal_service.complete_withdrawal(
            db=db,
            request_id=request_id,
            instructor_id=current_user.id
        )
        
        # Add instructor name for response
        withdrawal_request.instructor_name = f"{current_user.firstname} {current_user.lastname}"
        
        return withdrawal_request
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to complete withdrawal: {str(e)}"
        )

@router.post("/bank-details", response_model=BankDetailsResponse)
async def create_bank_details(
    bank_data: BankDetailsCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create or update bank details"""
    if current_user.role.name != "instructor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Only instructors can manage bank details"
        )
    
    try:
        bank_details = withdrawal_service.create_bank_details(
            db=db,
            instructor_id=current_user.id,
            bank_data=bank_data.dict()
        )
        
        return bank_details
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create bank details: {str(e)}"
        )

@router.get("/bank-details", response_model=List[BankDetailsResponse])
async def get_bank_details(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get bank details for the instructor"""
    if current_user.role.name != "instructor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Only instructors can access bank details"
        )
    
    try:
        bank_details = withdrawal_service.get_bank_details(
            db=db,
            instructor_id=current_user.id
        )
        
        return bank_details
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch bank details: {str(e)}"
        )

@router.delete("/bank-details/{bank_detail_id}")
async def delete_bank_details(
    bank_detail_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete bank details for the instructor"""
    if current_user.role.name != "instructor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Only instructors can delete bank details"
        )
    
    try:
        result = withdrawal_service.delete_bank_details(
            db=db,
            bank_detail_id=bank_detail_id,
            instructor_id=current_user.id
        )
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Bank details not found or you don't have permission to delete this"
            )
        
        return {"message": "Bank details deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete bank details: {str(e)}"
        )
