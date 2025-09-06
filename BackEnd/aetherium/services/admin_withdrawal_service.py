from sqlalchemy.orm import Session
from sqlalchemy import desc
from aetherium.models.admin_withdrawal import AdminWithdrawalRequest
from aetherium.models.admin_bank import AdminBankDetails
from aetherium.models.user import User
from aetherium.models.user import Wallet
from aetherium.core.logger import logger
from typing import List, Optional
from fastapi import HTTPException

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
    
    def get_withdrawal_requests(self, db: Session, admin_id: int, page: int = 1, limit: int = 10) -> dict:
        """Get withdrawal requests for admin"""
        offset = (page - 1) * limit
        
        requests = db.query(AdminWithdrawalRequest).filter(
            AdminWithdrawalRequest.admin_id == admin_id
        ).order_by(desc(AdminWithdrawalRequest.requested_at)).offset(offset).limit(limit).all()
        
        total = db.query(AdminWithdrawalRequest).filter(
            AdminWithdrawalRequest.admin_id == admin_id
        ).count()
        
        return {
            "requests": requests,
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

