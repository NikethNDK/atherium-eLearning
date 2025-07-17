import razorpay,os,hmac,hashlib
from typing import Dict,Any
from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_
from aetherium.models.user_course import Purchase
from aetherium.models.enum import PaymentMethod,PurchaseStatus
from aetherium.config import settings
import logging
logger = logging.getLogger(__name__) 
class RazorpayService:
    def __init__(self):
        self.key_id=settings.RAZORPAY_KEY_ID
        self.key_secret=settings.RAZORPAY_KEY_SECRET

        self.client=razorpay.Client(auth=(self.key_id,self.key_secret))
    
    def create_order(self, amount:float, currency: str="INR", receipt:str=None):
        try:
            amount_in_paise=int(amount*100)
            order_data={
                "amount":amount_in_paise,
                "currency":currency,
                "receipt":receipt or f"order_{int(amount_in_paise)}",
                "payment_capture":1
            }
            logger.debug(f"Creating Razorpay order with data: {order_data}")
            order=self.client.order.create(order_data)
            logger.debug(f"Razorpay order created successfully: {order}")
            return order
        except Exception as e:
        #     raise HTTPException(status_code=500, detail=f"Failed to create the Razorpay order: {str(e)}")
            import traceback
            logger.error("Exception while creating Razorpay order")
            traceback.print_exc()  # prints the full traceback to terminal
            raise HTTPException(status_code=500, detail=f"Failed to create Razorpay order: {str(e)}")


    def verify_payment_signature(self,order_id:str,payment_id:str,signature:str) -> bool:
        try:
            sign_string=f"{order_id}|{payment_id}"

            generated_signature=hmac.new(self.key_secret.encode('utf-8'),sign_string.encode('utf-8'),hashlib.sha256).hexdigest()

            return hmac.compare_digest(generated_signature,signature)
        except Exception as e:
            print(f"Error verifying the signature : {e}")
            return False
        
    def get_payment_details(self,payment_id:str)-> Dict[str,Any]:
        try:
            payment = self.client.payment.fetch(payment_id)
            return payment
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to fetch payment details: {str(e)}"
            )
        

    def create_purchase_record(self,db:Session,user_id:int,course_id:int,subtotal: float, tax_amount: float, total_amount: float,order_id:str, status:PurchaseStatus=PurchaseStatus.PENDING)->Purchase:
        print(f"Creating purchase with: user_id={user_id}, course_id={course_id}, order_id={order_id}")
        try:
            purchase=Purchase(
                user_id=user_id,
                course_id=course_id,
                amount=0,
                subtotal=subtotal,
                tax_amount=tax_amount,
                total_amount=total_amount,
                payment_method=PaymentMethod.CARD,
                status=status,
                transaction_id=order_id
            )

            db.add(purchase)
            db.commit()
            db.refresh(purchase)
            logger.info(f"Purchase record created successfully for order {order_id}")
            return purchase
        
        except Exception as e:
            # db.rollback()
            # raise HTTPException(status_code=500, detail=f"Failed to create purchase record: {str(e)}")
            import traceback
            db.rollback()
            print("ERROR:", traceback.format_exc())
            raise HTTPException(status_code=500, detail=f"Failed to create purchase record: {str(e)}")
    
    def update_purchase_status(self,db:Session,order_id:str,payment_id:str,status:PurchaseStatus)->Purchase:
        try:
            purchase=db.query(Purchase).filter(Purchase.transaction_id==order_id).first()
            if not purchase:
                raise HTTPException(status_code= 404,detail="Purchase record not found")

            purchase.status=status

            if status==PurchaseStatus.COMPLETED:
                purchase.transaction_id=payment_id

            db.commit()
            db.refresh(purchase)

            return purchase
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500,detail=f"Failed to update the purchase status {str(e)}")   
    
    def handle_existing_purchase(self, db: Session, user_id: int, course_id: int) -> dict:
        """Handle existing purchase records before creating new order"""
        try:
            # Check for completed purchase
            completed_purchase = db.query(Purchase).filter(
                and_(
                    Purchase.user_id == user_id,
                    Purchase.course_id == course_id,
                    Purchase.status == PurchaseStatus.COMPLETED
                )
            ).first()
            
            if completed_purchase:
                return {
                    "status": "already_purchased",
                    "message": "Course already purchased",
                    "purchase": completed_purchase
                }
            
            # Check for pending purchases
            pending_purchases = db.query(Purchase).filter(
                and_(
                    Purchase.user_id == user_id,
                    Purchase.course_id == course_id,
                    Purchase.status == PurchaseStatus.PENDING
                )
            ).all()
            
            # Handle pending purchases
            if pending_purchases:
                # Option 1: Cancel old pending orders and create new one
                for pending_purchase in pending_purchases:
                    logger.info(f"Canceling pending purchase {pending_purchase.id}")
                    pending_purchase.status = PurchaseStatus.FAILED
                
                db.commit()
                logger.info(f"Canceled {len(pending_purchases)} pending purchases")
                
                # Alternative Option 2: Reuse existing pending order
                # You can uncomment this if you prefer to reuse existing orders
                # latest_pending = max(pending_purchases, key=lambda x: x.id)
                # return {
                #     "status": "reuse_pending",
                #     "message": "Reusing existing pending order",
                #     "purchase": latest_pending
                # }
            
            # Check for failed purchases (optional cleanup)
            failed_purchases = db.query(Purchase).filter(
                and_(
                    Purchase.user_id == user_id,
                    Purchase.course_id == course_id,
                    Purchase.status == PurchaseStatus.FAILED
                )
            ).all()
            
            # Clean up old failed purchases (optional)
            if failed_purchases:
                for failed_purchase in failed_purchases:
                    db.delete(failed_purchase)
                db.commit()
                logger.info(f"Cleaned up {len(failed_purchases)} failed purchases")
            
            return {"status": "proceed", "message": "Can create new order"}
            
        except Exception as e:
            logger.error(f"Error handling existing purchase: {e}")
            db.rollback()
            raise HTTPException(
                status_code=500,
                detail="Failed to process existing purchase records"
            )

    def create_purchase_record_safe(
        self, 
        db: Session, 
        user_id: int, 
        course_id: int, 
        subtotal: float, tax_amount: float, total_amount: float, 
        order_id: str, 
        status: PurchaseStatus = PurchaseStatus.PENDING
    ) -> Purchase:
        """Safely create purchase record with duplicate handling"""
        try:
            # Handle existing purchases first
            result = self.handle_existing_purchase(db, user_id, course_id)
            
            if result["status"] == "already_purchased":
                raise HTTPException(
                    status_code=400,
                    detail="Course already purchased"
                )
            
            # Create new purchase record
            purchase = Purchase(
                user_id=user_id,
                amount=0,
                course_id=course_id,
                subtotal=subtotal,
                tax_amount=tax_amount,
                total_amount=total_amount,
                payment_method=PaymentMethod.CARD,
                status=status,
                transaction_id=order_id
            )
            
            db.add(purchase)
            db.commit()
            db.refresh(purchase)
            
            logger.info(f"Purchase record created successfully: {purchase.id}")
            return purchase
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error creating purchase record: {e}")
            db.rollback()
            raise HTTPException(
                status_code=500,
                detail="Failed to create purchase record"
            )

razorpay_service=RazorpayService()      
  