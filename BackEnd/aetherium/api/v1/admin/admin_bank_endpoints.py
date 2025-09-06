from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from aetherium.database.db import get_db
from aetherium.models.user import User
from aetherium.utils.jwt_utils import get_current_user
from aetherium.schemas.admin_bank import (
    AdminBankDetailsCreate, 
    AdminBankDetailsResponse, 
    AdminBankDetailsUpdate
)
from aetherium.services.admin_bank_service import admin_bank_service
from typing import List

router = APIRouter()

@router.post("/bank-details", response_model=AdminBankDetailsResponse)
async def create_admin_bank_details(
    bank_data: AdminBankDetailsCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create bank details for admin"""
    if current_user.role.name != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Only admins can create bank details"
        )
    
    try:
        bank_details = admin_bank_service.create_bank_details(
            db=db,
            admin_id=current_user.id,
            bank_data=bank_data.dict()
        )
        return bank_details
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create bank details: {str(e)}"
        )

@router.get("/bank-details", response_model=List[AdminBankDetailsResponse])
async def get_admin_bank_details(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get bank details for admin"""
    if current_user.role.name != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Only admins can access bank details"
        )
    
    try:
        bank_details = admin_bank_service.get_bank_details(
            db=db,
            admin_id=current_user.id
        )
        return bank_details
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch bank details: {str(e)}"
        )

@router.put("/bank-details/{bank_detail_id}", response_model=AdminBankDetailsResponse)
async def update_admin_bank_details(
    bank_detail_id: int,
    update_data: AdminBankDetailsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update bank details for admin"""
    if current_user.role.name != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Only admins can update bank details"
        )
    
    try:
        # Filter out None values
        update_dict = {k: v for k, v in update_data.dict().items() if v is not None}
        
        bank_details = admin_bank_service.update_bank_details(
            db=db,
            bank_detail_id=bank_detail_id,
            admin_id=current_user.id,
            update_data=update_dict
        )
        
        if not bank_details:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Bank details not found"
            )
        
        return bank_details
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update bank details: {str(e)}"
        )

@router.delete("/bank-details/{bank_detail_id}")
async def delete_admin_bank_details(
    bank_detail_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete bank details for admin"""
    if current_user.role.name != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Only admins can delete bank details"
        )
    
    try:
        result = admin_bank_service.delete_bank_details(
            db=db,
            bank_detail_id=bank_detail_id,
            admin_id=current_user.id
        )
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Bank details not found"
            )
        
        return {"message": "Bank details deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete bank details: {str(e)}"
        )

