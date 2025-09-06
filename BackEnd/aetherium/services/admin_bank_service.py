from sqlalchemy.orm import Session
from sqlalchemy import desc
from aetherium.models.admin_bank import AdminBankDetails
from aetherium.models.admin_withdrawal import AdminWithdrawalRequest
from aetherium.models.user import User
from aetherium.core.logger import logger
from typing import List, Optional

class AdminBankService:
    def create_bank_details(self, db: Session, admin_id: int, bank_data: dict) -> AdminBankDetails:
        """Create bank details for admin"""
        # If this is set as primary, unset other primary bank details
        if bank_data.get('is_primary', False):
            db.query(AdminBankDetails).filter(
                AdminBankDetails.admin_id == admin_id,
                AdminBankDetails.is_primary == True
            ).update({"is_primary": False})
        
        bank_details = AdminBankDetails(
            admin_id=admin_id,
            **bank_data
        )
        
        db.add(bank_details)
        db.commit()
        db.refresh(bank_details)
        
        logger.info(f"Admin bank details created for admin {admin_id}")
        return bank_details
    
    def get_bank_details(self, db: Session, admin_id: int) -> List[AdminBankDetails]:
        """Get bank details for admin"""
        return db.query(AdminBankDetails).filter(
            AdminBankDetails.admin_id == admin_id
        ).order_by(desc(AdminBankDetails.is_primary), desc(AdminBankDetails.created_at)).all()
    
    def update_bank_details(self, db: Session, bank_detail_id: int, admin_id: int, update_data: dict) -> Optional[AdminBankDetails]:
        """Update bank details for admin"""
        bank_detail = db.query(AdminBankDetails).filter(
            AdminBankDetails.id == bank_detail_id,
            AdminBankDetails.admin_id == admin_id
        ).first()
        
        if not bank_detail:
            return None
        
        # If setting as primary, unset other primary bank details
        if update_data.get('is_primary', False):
            db.query(AdminBankDetails).filter(
                AdminBankDetails.admin_id == admin_id,
                AdminBankDetails.is_primary == True,
                AdminBankDetails.id != bank_detail_id
            ).update({"is_primary": False})
        
        for key, value in update_data.items():
            if hasattr(bank_detail, key):
                setattr(bank_detail, key, value)
        
        db.commit()
        db.refresh(bank_detail)
        
        logger.info(f"Admin bank details updated: ID {bank_detail_id}")
        return bank_detail
    
    def delete_bank_details(self, db: Session, bank_detail_id: int, admin_id: int) -> bool:
        """Delete bank details for admin"""
        bank_detail = db.query(AdminBankDetails).filter(
            AdminBankDetails.id == bank_detail_id,
            AdminBankDetails.admin_id == admin_id
        ).first()
        
        if not bank_detail:
            return False
        
        db.delete(bank_detail)
        db.commit()
        
        logger.info(f"Admin bank details deleted: ID {bank_detail_id}")
        return True
    
    def get_primary_bank_details(self, db: Session, admin_id: int) -> Optional[AdminBankDetails]:
        """Get primary bank details for admin"""
        return db.query(AdminBankDetails).filter(
            AdminBankDetails.admin_id == admin_id,
            AdminBankDetails.is_primary == True
        ).first()

# Initialize service
admin_bank_service = AdminBankService()

