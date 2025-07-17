
from sqlalchemy.orm import Session
from aetherium.models.user import User,Wallet,WalletTransaction
from fastapi import HTTPException
from datetime import datetime
class WalletService:
    def __init__(self):
        pass
    
    def get_or_create_wallet(self, db: Session, user_id: int) -> Wallet:
        """Get existing wallet or create new one for user"""
        wallet = db.query(Wallet).filter(Wallet.user_id == user_id).first()
        if not wallet:
            wallet = Wallet(user_id=user_id, balance=0.0)
            db.add(wallet)
            db.commit()
            db.refresh(wallet)
        return wallet
    
    def add_funds(self, db: Session, user_id: int, amount: float, description: str, reference_id: str = None):
        """Add funds to user wallet"""
        wallet = self.get_or_create_wallet(db, user_id)
        
        # Update wallet balance
        wallet.balance += amount
        wallet.updated_at = datetime.utcnow()
        
        # Create transaction record
        transaction = WalletTransaction(
            wallet_id=wallet.id,
            transaction_type="credit",
            amount=amount,
            description=description,
            reference_id=reference_id
        )
        
        db.add(transaction)
        db.commit()
        db.refresh(wallet)
        
        return wallet
    
    def get_admin_user_id(self, db: Session) -> int:
        admin_user = db.query(User).filter(User.role_id == 3).first()
        if not admin_user:
            raise HTTPException(status_code=500, detail="Admin user not found")
        return admin_user.id

# Initialize wallet service
wallet_service = WalletService()