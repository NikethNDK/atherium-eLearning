from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from aetherium.database.db import get_db
from aetherium.models.user import User
from aetherium.utils.jwt_utils import get_current_user
from aetherium.schemas.withdrawal import (
    WithdrawalRequestUpdate, WithdrawalRequestResponse, 
    WithdrawalRequestListResponse
)
from aetherium.services.withdrawal_service import withdrawal_service
from aetherium.models.withdrawal import WithdrawalStatus

router = APIRouter(prefix="/admin/withdrawal", tags=["admin-withdrawal"])

@router.get("/requests", response_model=WithdrawalRequestListResponse)
async def get_all_withdrawal_requests(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    status_filter: str = Query(None, description="Filter by status: pending, approved, rejected, completed"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all withdrawal requests for admin review"""
    if current_user.role.name != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Only admins can access withdrawal requests"
        )
    
    try:
        result = withdrawal_service.get_all_withdrawal_requests(
            db=db,
            page=page,
            limit=limit
        )
        
        # Filter by status if provided
        if status_filter:
            try:
                filter_status = WithdrawalStatus(status_filter)
                result["requests"] = [
                    req for req in result["requests"] 
                    if req.status == filter_status
                ]
                result["total"] = len(result["requests"])
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid status filter. Use: pending, approved, rejected, completed"
                )
        
        # Add instructor names
        for request in result["requests"]:
            if request.instructor:
                request.instructor_name = f"{request.instructor.firstname} {request.instructor.lastname}"
        
        return WithdrawalRequestListResponse(**result)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch withdrawal requests: {str(e)}"
        )

@router.put("/requests/{request_id}", response_model=WithdrawalRequestResponse)
async def update_withdrawal_request(
    request_id: int,
    update_data: WithdrawalRequestUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Approve or reject a withdrawal request"""
    if current_user.role.name != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Only admins can review withdrawal requests"
        )
    
    try:
        withdrawal_request = withdrawal_service.update_withdrawal_request(
            db=db,
            request_id=request_id,
            status=update_data.status,
            admin_feedback=update_data.admin_feedback,
            admin_id=current_user.id
        )
        
        # Add instructor name for response
        if withdrawal_request.instructor:
            withdrawal_request.instructor_name = f"{withdrawal_request.instructor.firstname} {withdrawal_request.instructor.lastname}"
        
        return withdrawal_request
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update withdrawal request: {str(e)}"
        )

@router.get("/requests/{request_id}", response_model=WithdrawalRequestResponse)
async def get_withdrawal_request_details(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get detailed information about a specific withdrawal request"""
    if current_user.role.name != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Only admins can access withdrawal request details"
        )
    
    try:
        from aetherium.models.withdrawal import WithdrawalRequest
        withdrawal_request = db.query(WithdrawalRequest).filter(
            WithdrawalRequest.id == request_id
        ).first()
        
        if not withdrawal_request:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Withdrawal request not found"
            )
        
        # Add instructor name for response
        if withdrawal_request.instructor:
            withdrawal_request.instructor_name = f"{withdrawal_request.instructor.firstname} {withdrawal_request.instructor.lastname}"
        
        return withdrawal_request
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch withdrawal request details: {str(e)}"
        )

@router.get("/instructor/{instructor_id}/requests", response_model=WithdrawalRequestListResponse)
async def get_instructor_withdrawal_requests(
    instructor_id: int,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get withdrawal requests for a specific instructor (admin view)"""
    if current_user.role.name != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Only admins can access instructor withdrawal requests"
        )
    
    try:
        result = withdrawal_service.get_instructor_withdrawal_requests(
            db=db,
            instructor_id=instructor_id,
            page=page,
            limit=limit
        )
        
        # Add instructor names
        for request in result["requests"]:
            if request.instructor:
                request.instructor_name = f"{request.instructor.firstname} {request.instructor.lastname}"
        
        return WithdrawalRequestListResponse(**result)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch instructor withdrawal requests: {str(e)}"
        )
