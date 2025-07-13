import razorpay,os,hmac,hashlib
from typing import Dict,Any
from fastapi import HTTPException
from sqlalchemy.orm import Session
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
        

    def create_purchase_record(self,db:Session,user_id:int,course_id:int,amount:float,order_id:str, status:PurchaseStatus=PurchaseStatus.PENDING)->Purchase:
        print(f"Creating purchase with: user_id={user_id}, course_id={course_id}, order_id={order_id}")
        try:
            purchase=Purchase(
                user_id=user_id,
                course_id=course_id,
                amount=amount,
                payment_method=PaymentMethod.CARD,
                status=status,
                transaction_id=order_id
            )
            db.add(purchase)
            db.commit()
            db.refresh(purchase)
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

razorpay_service=RazorpayService()      
  