from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from aetherium.models.withdrawal import WithdrawalRequest, BankDetails, WithdrawalStatus
from aetherium.models.user import User, Wallet
from aetherium.services.wallet_service import wallet_service
from aetherium.services.notification_service import create_notification
from fastapi import HTTPException
from datetime import datetime, timezone
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)

class WithdrawalService:
    def __init__(self):
        pass
    
    async def create_withdrawal_request(self, db: Session, instructor_id: int, amount: float) -> WithdrawalRequest:
        """Create a new withdrawal request"""
        # Check if instructor has sufficient balance
        wallet = wallet_service.get_or_create_wallet(db, instructor_id)
        if wallet.balance < amount:
            raise HTTPException(
                status_code=400, 
                detail=f"Insufficient balance. Available: ₹{wallet.balance:.2f}, Requested: ₹{amount:.2f}"
            )
        
        # Check for pending requests
        pending_request = db.query(WithdrawalRequest).filter(
            WithdrawalRequest.instructor_id == instructor_id,
            WithdrawalRequest.status == WithdrawalStatus.PENDING
        ).first()
        
        if pending_request:
            raise HTTPException(
                status_code=400,
                detail="You already have a pending withdrawal request. Please wait for admin approval."
            )
        
        # Create withdrawal request
        withdrawal_request = WithdrawalRequest(
            instructor_id=instructor_id,
            amount=amount,
            status=WithdrawalStatus.PENDING
        )
        
        db.add(withdrawal_request)
        db.commit()
        db.refresh(withdrawal_request)
        
        # Send notification to all admins
        await self._notify_admins_about_withdrawal_request(db, withdrawal_request)
        
        logger.info(f"Withdrawal request created: ID {withdrawal_request.id}, Amount: ₹{amount}")
        return withdrawal_request
    
    def get_instructor_withdrawal_requests(self, db: Session, instructor_id: int, page: int = 1, limit: int = 10) -> dict:
        """Get withdrawal requests for an instructor"""
        offset = (page - 1) * limit
        
        requests = db.query(WithdrawalRequest).filter(
            WithdrawalRequest.instructor_id == instructor_id
        ).order_by(desc(WithdrawalRequest.requested_at)).offset(offset).limit(limit).all()
        
        total = db.query(WithdrawalRequest).filter(
            WithdrawalRequest.instructor_id == instructor_id
        ).count()
        
        return {
            "requests": requests,
            "total": total,
            "page": page,
            "limit": limit
        }
    
    def get_all_withdrawal_requests(self, db: Session, page: int = 1, limit: int = 10) -> dict:
        """Get all withdrawal requests for admin"""
        offset = (page - 1) * limit
        
        requests = db.query(WithdrawalRequest).join(User, WithdrawalRequest.instructor_id == User.id).order_by(
            desc(WithdrawalRequest.requested_at)
        ).offset(offset).limit(limit).all()
        
        # Add instructor balance information to each request
        for request in requests:
            wallet = wallet_service.get_or_create_wallet(db, request.instructor_id)
            request.instructor_balance = wallet.balance
        
        total = db.query(WithdrawalRequest).count()
        
        return {
            "requests": requests,
            "total": total,
            "page": page,
            "limit": limit
        }
    
    async def update_withdrawal_request(self, db: Session, request_id: int, status: WithdrawalStatus, 
                                admin_feedback: Optional[str], admin_id: int) -> WithdrawalRequest:
        """Update withdrawal request status (approve/reject)"""
        request = db.query(WithdrawalRequest).filter(WithdrawalRequest.id == request_id).first()
        
        if not request:
            raise HTTPException(status_code=404, detail="Withdrawal request not found")
        
        if request.status != WithdrawalStatus.PENDING:
            raise HTTPException(
                status_code=400, 
                detail=f"Request is already {request.status.value}"
            )
        
        # Update request
        request.status = status
        request.admin_feedback = admin_feedback
        request.admin_id = admin_id
        request.reviewed_at = datetime.now(timezone.utc)
        
        db.commit()
        db.refresh(request)
        
        # Send notification to instructor
        await self._notify_instructor_about_withdrawal_update(db, request)
        
        logger.info(f"Withdrawal request {request_id} updated to {status.value} by admin {admin_id}")
        return request
    
    def complete_withdrawal(self, db: Session, request_id: int, instructor_id: int) -> WithdrawalRequest:
        """Complete withdrawal by debiting from wallet"""
        request = db.query(WithdrawalRequest).filter(
            WithdrawalRequest.id == request_id,
            WithdrawalRequest.instructor_id == instructor_id,
            WithdrawalRequest.status == WithdrawalStatus.APPROVED
        ).first()
        
        if not request:
            raise HTTPException(status_code=404, detail="Approved withdrawal request not found")
        
        # Check if already completed
        if request.status == WithdrawalStatus.COMPLETED:
            raise HTTPException(status_code=400, detail="Withdrawal already completed")
        
        # Debit from wallet
        wallet = wallet_service.get_or_create_wallet(db, instructor_id)
        if wallet.balance < request.amount:
            raise HTTPException(
                status_code=400,
                detail="Insufficient balance for withdrawal"
            )
        
        # Update wallet balance
        wallet.balance -= request.amount
        wallet.updated_at = datetime.now(timezone.utc)
        
        # Create debit transaction
        from aetherium.models.user import WalletTransaction
        transaction = WalletTransaction(
            wallet_id=wallet.id,
            transaction_type="debit",
            amount=request.amount,
            description=f"Withdrawal request #{request.id}",
            reference_id=f"WDR_{request.id}"
        )
        
        db.add(transaction)
        
        # Update request status
        request.status = WithdrawalStatus.COMPLETED
        request.completed_at = datetime.now(timezone.utc)
        
        db.commit()
        db.refresh(request)
        
        logger.info(f"Withdrawal request {request_id} completed. Amount: ₹{request.amount}")
        return request
    
    def get_account_summary(self, db: Session, instructor_id: int) -> dict:
        """Get instructor account summary"""
        wallet = wallet_service.get_or_create_wallet(db, instructor_id)
        
        # Get withdrawal statistics
        total_withdrawals = db.query(func.sum(WithdrawalRequest.amount)).filter(
            WithdrawalRequest.instructor_id == instructor_id,
            WithdrawalRequest.status == WithdrawalStatus.COMPLETED
        ).scalar() or 0.0
        
        pending_withdrawals = db.query(func.sum(WithdrawalRequest.amount)).filter(
            WithdrawalRequest.instructor_id == instructor_id,
            WithdrawalRequest.status == WithdrawalStatus.PENDING
        ).scalar() or 0.0
        
        # Get recent withdrawal requests
        recent_requests = db.query(WithdrawalRequest).filter(
            WithdrawalRequest.instructor_id == instructor_id
        ).order_by(desc(WithdrawalRequest.requested_at)).limit(5).all()
        
        return {
            "wallet_balance": wallet.balance,
            "total_earnings": wallet.balance + total_withdrawals,
            "pending_withdrawals": pending_withdrawals,
            "completed_withdrawals": total_withdrawals,
            "withdrawal_requests": recent_requests
        }
    
    def create_bank_details(self, db: Session, instructor_id: int, bank_data: dict) -> BankDetails:
        """Create or update bank details for instructor"""
        # If setting as primary, unset other primary accounts
        if bank_data.get("is_primary", True):
            db.query(BankDetails).filter(
                BankDetails.instructor_id == instructor_id,
                BankDetails.is_primary == True
            ).update({"is_primary": False})
        
        bank_details = BankDetails(
            instructor_id=instructor_id,
            **bank_data
        )
        
        db.add(bank_details)
        db.commit()
        db.refresh(bank_details)
        
        logger.info(f"Bank details created for instructor {instructor_id}")
        return bank_details
    
    def get_bank_details(self, db: Session, instructor_id: int) -> List[BankDetails]:
        """Get bank details for instructor"""
        return db.query(BankDetails).filter(
            BankDetails.instructor_id == instructor_id
        ).order_by(desc(BankDetails.is_primary), desc(BankDetails.created_at)).all()
    
    async def _notify_admins_about_withdrawal_request(self, db: Session, withdrawal_request: WithdrawalRequest):
        """Send notification to all admins about new withdrawal request"""
        try:
            # Get instructor details
            instructor = db.query(User).filter(User.id == withdrawal_request.instructor_id).first()
            instructor_name = f"{instructor.firstname} {instructor.lastname}" if instructor else "Unknown Instructor"
            
            # Get all admin users
            admins = db.query(User).join(User.role).filter(User.role.has(name="admin")).all()
            logger.info(f"Found {len(admins)} admin users for notification")
            
            if not admins:
                logger.warning("No admin users found in database")
                return
            
            # Create notification message
            message = f"New withdrawal request from {instructor_name} for ₹{withdrawal_request.amount:.2f}"
            
            # Send notification to each admin
            for admin in admins:
                logger.info(f"Sending notification to admin {admin.id} ({admin.email})")
                await create_notification(
                    db=db,
                    recipient_id=admin.id,
                    message=message,
                    notification_type="withdrawal_request",
                    related_data={
                        "withdrawal_request_id": withdrawal_request.id,
                        "instructor_id": withdrawal_request.instructor_id,
                        "instructor_name": instructor_name,
                        "amount": withdrawal_request.amount,
                        "request_date": withdrawal_request.requested_at.isoformat() if withdrawal_request.requested_at else None
                    }
                )
            
            logger.info(f"Withdrawal request notifications sent to {len(admins)} admins")
            
        except Exception as e:
            logger.error(f"Failed to send withdrawal request notifications: {e}")
    
    async def _notify_instructor_about_withdrawal_update(self, db: Session, withdrawal_request: WithdrawalRequest):
        """Send notification to instructor about withdrawal request update"""
        try:
            # Get admin details
            admin = db.query(User).filter(User.id == withdrawal_request.admin_id).first()
            admin_name = f"{admin.firstname} {admin.lastname}" if admin else "Admin"
            
            # Create notification message based on status
            if withdrawal_request.status == WithdrawalStatus.APPROVED:
                message = f"Your withdrawal request for ₹{withdrawal_request.amount:.2f} has been approved by {admin_name}"
            elif withdrawal_request.status == WithdrawalStatus.REJECTED:
                message = f"Your withdrawal request for ₹{withdrawal_request.amount:.2f} has been rejected by {admin_name}"
            else:
                message = f"Your withdrawal request for ₹{withdrawal_request.amount:.2f} status has been updated by {admin_name}"
            
            # Add feedback if available
            if withdrawal_request.admin_feedback:
                message += f". Feedback: {withdrawal_request.admin_feedback}"
            
            # Send notification to instructor
            await create_notification(
                db=db,
                recipient_id=withdrawal_request.instructor_id,
                message=message,
                notification_type="withdrawal_update",
                related_data={
                    "withdrawal_request_id": withdrawal_request.id,
                    "status": withdrawal_request.status.value,
                    "admin_name": admin_name,
                    "amount": withdrawal_request.amount,
                    "admin_feedback": withdrawal_request.admin_feedback,
                    "reviewed_at": withdrawal_request.reviewed_at.isoformat() if withdrawal_request.reviewed_at else None
                }
            )
            
            logger.info(f"Withdrawal update notification sent to instructor {withdrawal_request.instructor_id}")
            
        except Exception as e:
            logger.error(f"Failed to send withdrawal update notification to instructor: {e}")

# Initialize service
withdrawal_service = WithdrawalService()
