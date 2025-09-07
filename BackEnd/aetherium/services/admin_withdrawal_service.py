from sqlalchemy.orm import Session
from sqlalchemy import desc
from aetherium.models.admin_withdrawal import AdminWithdrawalRequest
from aetherium.models.admin_bank import AdminBankDetails
from aetherium.models.user import User
from aetherium.models.user import Wallet
from aetherium.models.enum import WithdrawalStatus
from aetherium.core.logger import logger
from typing import List, Optional
from fastapi import HTTPException
from datetime import datetime

class AdminWithdrawalService:
    def create_withdrawal_request(self, db: Session, admin_id: int, amount: float, bank_details_id: int) -> AdminWithdrawalRequest:
        """Create withdrawal request for admin"""
        # Check if bank details exist and belong to admin
        bank_details = db.query(AdminBankDetails).filter(
            AdminBankDetails.id == bank_details_id,
            AdminBankDetails.admin_id == admin_id
        ).first()
        
        if not bank_details:
            raise HTTPException(status_code=404, detail="Bank details not found")
        
        # Check if admin has sufficient wallet balance
        wallet = db.query(Wallet).filter(Wallet.user_id == admin_id).first()
        if not wallet or wallet.balance < amount:
            raise HTTPException(status_code=400, detail="Insufficient wallet balance")
        
        # Create withdrawal request
        withdrawal_request = AdminWithdrawalRequest(
            admin_id=admin_id,
            amount=amount,
            bank_details_id=bank_details_id
        )
        
        db.add(withdrawal_request)
        db.commit()
        db.refresh(withdrawal_request)
        
        logger.info(f"Admin withdrawal request created: ID {withdrawal_request.id}, Amount: ₹{amount}")
        return withdrawal_request
    
    def create_immediate_withdrawal(self, db: Session, admin_id: int, amount: float, bank_details_id: int) -> AdminWithdrawalRequest:
        """Create immediate withdrawal for admin (debit wallet immediately)"""
        # Validate bank details
        bank_details = db.query(AdminBankDetails).filter(
            AdminBankDetails.id == bank_details_id,
            AdminBankDetails.admin_id == admin_id
        ).first()
        
        if not bank_details:
            raise HTTPException(status_code=404, detail="Bank details not found")
        
        # Check if admin has sufficient wallet balance
        wallet = db.query(Wallet).filter(Wallet.user_id == admin_id).first()
        if not wallet or wallet.balance < amount:
            raise HTTPException(status_code=400, detail="Insufficient wallet balance")
        
        # Debit the amount from wallet immediately
        wallet.balance -= amount
        
        # Create withdrawal record (marked as completed)
        withdrawal_request = AdminWithdrawalRequest(
            admin_id=admin_id,
            amount=amount,
            bank_details_id=bank_details_id,
            status=WithdrawalStatus.COMPLETED,  # Mark as completed immediately
            processed_at=datetime.utcnow()  # Set processed time
        )
        
        db.add(withdrawal_request)
        db.commit()
        db.refresh(withdrawal_request)
        
        logger.info(f"Admin immediate withdrawal processed: ID {withdrawal_request.id}, Amount: ₹{amount}, New Balance: ₹{wallet.balance}")
        return withdrawal_request
    
    def get_withdrawal_requests(self, db: Session, admin_id: int, page: int = 1, limit: int = 10) -> dict:
        """Get withdrawal requests for admin"""
        offset = (page - 1) * limit
        
        requests = db.query(AdminWithdrawalRequest).filter(
            AdminWithdrawalRequest.admin_id == admin_id
        ).order_by(desc(AdminWithdrawalRequest.requested_at)).offset(offset).limit(limit).all()
        
        total = db.query(AdminWithdrawalRequest).filter(
            AdminWithdrawalRequest.admin_id == admin_id
        ).count()
        
        # Convert SQLAlchemy objects to dictionaries
        requests_data = []
        for request in requests:
            request_dict = {
                "id": request.id,
                "admin_id": request.admin_id,
                "amount": request.amount,
                "status": request.status.value if request.status else None,  # Convert enum to string
                "bank_details_id": request.bank_details_id,
                "requested_at": request.requested_at.isoformat() if request.requested_at else None,
                "processed_at": request.processed_at.isoformat() if request.processed_at else None,
                "notes": request.notes
            }
            
            # Add bank details if available
            if request.bank_details:
                request_dict["bank_details"] = {
                    "id": request.bank_details.id,
                    "bank_name": request.bank_details.bank_name,
                    "account_number": request.bank_details.account_number,
                    "ifsc_code": request.bank_details.ifsc_code,
                    "account_holder_name": request.bank_details.account_holder_name
                }
            
            requests_data.append(request_dict)
        
        return {
            "requests": requests_data,
            "total": total,
            "page": page,
            "limit": limit
        }
    
    def get_admin_wallet_balance(self, db: Session, admin_id: int) -> float:
        """Get admin wallet balance"""
        wallet = db.query(Wallet).filter(Wallet.user_id == admin_id).first()
        return wallet.balance if wallet else 0.0

# Initialize service
admin_withdrawal_service = AdminWithdrawalService()

