from sqlalchemy.orm import Session,joinedload
from aetherium.models.courses import Course
from aetherium.models.user import User
from aetherium.models.user_course import Purchase, PurchaseStatus, Cart
from aetherium.models.courses.progress import CourseProgress
from aetherium.schemas.user_course import PurchaseResponse
from aetherium.services.razorpay_service import *
from aetherium.schemas.user_course import RazorpayOrderResponse,CourseOrderItem
from fastapi import HTTPException
from typing import Optional
import uuid
from aetherium.services.notification_service import create_notification
from aetherium.core.logger import logger
from aetherium.services.wallet_service import wallet_service
from aetherium.schemas.user_course import RazorpayOrderResponse,RazorpayPaymentVerify

class PurchaseService:
    @staticmethod
    async def purchase_course(db: Session, user_id: int, course_id: int, payment_method: str):
        course = db.query(Course).filter(
            Course.id == course_id,
            Course.is_published == True
        ).first()
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
        
        existing_purchase = db.query(Purchase).filter(
            Purchase.user_id == user_id,
            Purchase.course_id == course_id,
            Purchase.status == PurchaseStatus.COMPLETED
        ).first()
        if existing_purchase:
            raise HTTPException(status_code=400, detail="Course already purchased")
        
        amount = course.discount_price or course.price or 0
        
        purchase = Purchase(
            user_id=user_id,
            course_id=course_id,
            amount=amount,
            payment_method=payment_method,
            status=PurchaseStatus.COMPLETED,
            transaction_id=str(uuid.uuid4())
        )
        
        db.add(purchase)
        
        cart_item = db.query(Cart).filter(
            Cart.user_id == user_id,
            Cart.course_id == course_id
        ).first()
        if cart_item:
            db.delete(cart_item)
        
        progress = CourseProgress(
            user_id=user_id,
            course_id=course_id,
            progress_percentage=0.0,
            is_completed=False
        )
        db.add(progress)
        
        db.commit()
        db.refresh(purchase)
        try:
            student=db.query(User).filter(User.id==user_id).first()
            message=f"{student.firstname} {student.lastname} has purchased your course {course.title}"
            logger(f"{message}")
            await create_notification(db=db, reciepient_id= course.instructor_id, message=message,notification_type="course_purchase",
                                      related_data={
                                          "course_id":course_id,
                                          "student_id":user_id,
                                          "student_firstname":student.firstname,
                                          "student_lastname":student.lastname,
                                          "course_title": course.title
                                      })
        except Exception as e:
            logger(f"Notification failed : {e}")

        return purchase
    
    @staticmethod
    def get_user_purchases(db: Session, user_id: int):
        purchases = db.query(Purchase).options(
            joinedload(Purchase.course).joinedload(Course.instructor),
            joinedload(Purchase.course).joinedload(Course.sections)
        ).filter(
            Purchase.user_id == user_id,
            Purchase.status == PurchaseStatus.COMPLETED
        ).order_by(Purchase.purchased_at.desc()).all()
        
        return [purchase.course for purchase in purchases]
    
    @staticmethod
    def check_course_purchase(db: Session, user_id: int, course_id: int):
        purchase = db.query(Purchase).filter(
            Purchase.user_id == user_id,
            Purchase.course_id == course_id,
            Purchase.status == PurchaseStatus.COMPLETED
        ).first()
        
        return {
            "is_purchased": purchase is not None,
            "purchase_date": purchase.purchased_at if purchase else None
        }
    
    #Multiple course purchase

    @staticmethod
    async def create_course_order(db: Session, user_id:int ,course_id: Optional[int] = None,user_email: str=None, user_firstname: str=None, user_lastname: str=None,purchase_type:str='single') -> RazorpayOrderResponse:
        
        """Create razorpay order"""
        try:
            if purchase_type=="single":
                return await PurchaseService._create_single_course_order(
                    db,user_id,course_id,user_email,user_firstname,user_lastname
                )
            elif purchase_type=="cart":
                return await PurchaseService._create_cart_order(
                    db,user_id,user_email,user_firstname,user_lastname
                )
            else:
                raise HTTPException(status_code=400, detail="Invalid purchase type")
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error in create_course_order: {e}")
            raise HTTPException(status_code=500,detail="Failed to create order. Please try again")
    
    @staticmethod
    async def _create_single_course_order(db:Session,user_id,course_id:int,user_email:str,user_firstname:str,user_lastname:str) -> RazorpayOrderResponse:
        """Single course order createion"""
        course=db.query(Course).filter(Course.id ==course_id).first()
        if not course:
            raise HTTPException(status_code=404,detail="Course not found")
        exsisting_purchase=db.query(Purchase).filter(
            and_(Purchase.user_id ==user_id,
                 Purchase.course_id==course_id,
                 Purchase.status==PurchaseStatus.COMPLETED)
        ).first()
        if exsisting_purchase:
            raise HTTPException(status_code=400, detail="Course already purchased")
        
        subtotal=course.discount_price if course.discount_price else course.price
        if subtotal<=0:
            raise HTTPException (status_code=400, detail="Invalid course price")
        tax_amount=subtotal*0.18
        total_amount=subtotal+tax_amount

        receipt = f"single_course_{course.id}_user_{user_id}"

        razorpay_order=razorpay_service.create_order(
            amount=total_amount,
            receipt=receipt
        )

        #create purhcase record
        purchase=razorpay_service.create_purchase_record_safe(
            db=db,
            user_id=user_id,
            course_id=course_id,
            subtotal=subtotal,
            tax_amount=tax_amount,
            total_amount=total_amount,
            order_id=razorpay_order['id'],
            status=PurchaseStatus.PENDING
        )
        course_item = CourseOrderItem(
            course_id=course.id,
            course_title=course.title,
            subtotal=subtotal,
            tax_amount=tax_amount,
            total_amount=total_amount
        )
    
        return RazorpayOrderResponse(
            order_id=razorpay_order['id'],
            amount=razorpay_order['amount'],
            currency=razorpay_order['currency'],
            key_id=razorpay_service.key_id,
            user_email=user_email,
            user_name=f"{user_firstname} {user_lastname}",
            purchase_type="single",
            courses=[course_item],
            subtotal=subtotal,
            tax_amount=tax_amount,
            total_amount=total_amount
        )

    @staticmethod
    async def _create_cart_order(
        db: Session, 
        user_id: int, 
        user_email: str, 
        user_firstname: str, 
        user_lastname: str
    ) -> RazorpayOrderResponse:
        """Create order for all items in cart"""

        # Get cart items
        cart_items = db.query(Cart).filter(Cart.user_id == user_id).all()

        if not cart_items:
            raise HTTPException(status_code=400, detail="Cart is empty")

        # Get course details and validate
        course_ids = [item.course_id for item in cart_items]
        courses = db.query(Course).filter(Course.id.in_(course_ids)).all()

        if len(courses) != len(cart_items):
            raise HTTPException(status_code=404, detail="Some courses not found")

        # Check for already purchased courses
        existing_purchases = db.query(Purchase).filter(
            and_(
                Purchase.user_id == user_id,
                Purchase.course_id.in_(course_ids),
                Purchase.status == PurchaseStatus.COMPLETED
            )
        ).all()

        if existing_purchases:
            purchased_course_ids = [p.course_id for p in existing_purchases]
            purchased_courses = [c.title for c in courses if c.id in purchased_course_ids]
            raise HTTPException(
                status_code=400,
                detail=f"Already purchased courses: {', '.join(purchased_courses)}"
            )

        # Calculate totals
        course_items = []
        total_subtotal = 0
        total_tax_amount = 0

        for course in courses:
            subtotal = course.discount_price if course.discount_price else course.price
            if subtotal <= 0:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Invalid price for course: {course.title}"
                )

            tax_amount = subtotal * 0.18
            course_total = subtotal + tax_amount

            course_items.append(CourseOrderItem(
                course_id=course.id,
                course_title=course.title,
                subtotal=subtotal,
                tax_amount=tax_amount,
                total_amount=course_total
            ))

            total_subtotal += subtotal
            total_tax_amount += tax_amount

        total_amount = total_subtotal + total_tax_amount

        # Create Razorpay order
        receipt = f"cart_user_{user_id}_{len(course_items)}_courses"
        razorpay_order = razorpay_service.create_order(
            amount=total_amount,
            receipt=receipt
        )

        # Create purchase records for each course
        purchase_records = []
        for course_item in course_items:
            purchase = razorpay_service.create_purchase_record_safe(
                db=db,
                user_id=user_id,
                course_id=course_item.course_id,
                subtotal=course_item.subtotal,
                tax_amount=course_item.tax_amount,
                total_amount=course_item.total_amount,
                order_id=razorpay_order['id'],
                status=PurchaseStatus.PENDING
            )
            purchase_records.append(purchase)

        return RazorpayOrderResponse(
            order_id=razorpay_order['id'],
            amount=razorpay_order['amount'],
            currency=razorpay_order['currency'],
            key_id=razorpay_service.key_id,
            user_email=user_email,
            user_name=f"{user_firstname} {user_lastname}",
            purchase_type="cart",
            courses=course_items,
            subtotal=total_subtotal,
            tax_amount=total_tax_amount,
            total_amount=total_amount
        )
    
    @staticmethod
    async def verify_payment_and_complete_purchase(
        db: Session, 
        payment_data: RazorpayPaymentVerify, 
        user_id: int
    ):
        """
        Verify payment and complete purchase(s) - handles both single and multi-course
        """
        try:
            # Verify payment signature
            is_valid = razorpay_service.verify_payment_signature(
                order_id=payment_data.razorpay_order_id,
                payment_id=payment_data.razorpay_payment_id,
                signature=payment_data.razorpay_signature
            )
            
            if not is_valid:
                # Update all related purchase records to FAILED
                purchases = db.query(Purchase).filter(
                    and_(
                        Purchase.transaction_id == payment_data.razorpay_order_id,
                        Purchase.user_id == user_id,
                        Purchase.status == PurchaseStatus.PENDING
                    )
                ).all()
                
                for purchase in purchases:
                    purchase.status = PurchaseStatus.FAILED
                db.commit()
                
                raise HTTPException(status_code=400, detail="Payment verification failed")
            
            # Get all pending purchases for this order
            purchases = db.query(Purchase).filter(
                and_(
                    Purchase.transaction_id == payment_data.razorpay_order_id,
                    Purchase.user_id == user_id,
                    Purchase.status == PurchaseStatus.PENDING
                )
            ).all()
            
            if not purchases:
                raise HTTPException(status_code=404, detail="No pending purchases found")
            
            # Update all purchases to COMPLETED
            course_ids = []
            purchase_ids = []
            
            for purchase in purchases:
                purchase.status = PurchaseStatus.COMPLETED
                purchase.transaction_id = payment_data.razorpay_payment_id
                course_ids.append(purchase.course_id)
                purchase_ids.append(purchase.id)
            
            db.commit()
            
            # Get course and user details for notifications and wallet distribution
            courses = db.query(Course).filter(Course.id.in_(course_ids)).all()
            user = db.query(User).filter(User.id == user_id).first()
            
            if not user:
                logger.error(f"User not found: {user_id}")
                raise HTTPException(status_code=404, detail="User not found")
            
            # Distribute funds and send notifications for each course
            for purchase in purchases:
                course = next((c for c in courses if c.id == purchase.course_id), None)
                if not course:
                    continue
                    
                try:
                    # Calculate wallet distribution amounts (excluding tax)
                    subtotal = purchase.subtotal
                    admin_commission = subtotal * 0.10  # 10% to admin
                    instructor_amount = subtotal * 0.90  # 90% to instructor
                    
                    # Add to instructor wallet
                    wallet_service.add_funds(
                        db=db,
                        user_id=course.instructor_id,
                        amount=instructor_amount,
                        description=f"Course sale commission: {course.title}",
                        reference_id=purchase.transaction_id
                    )
                    
                    # Add to admin wallet
                    admin_user_id = wallet_service.get_admin_user_id(db)
                    wallet_service.add_funds(
                        db=db,
                        user_id=admin_user_id,
                        amount=admin_commission,
                        description=f"Platform commission: {course.title}",
                        reference_id=purchase.transaction_id
                    )
                    
                    logger.info(f"Wallet distribution completed for course {course.id}")
                    
                except Exception as wallet_error:
                    logger.error(f"Error in wallet distribution for course {course.id}: {wallet_error}")
                
                # Send notification to instructor
                try:
                    message = f"{user.firstname} {user.lastname} has purchased your course {course.title}"
                    await create_notification(
                        db=db,
                        recipient_id=course.instructor_id,
                        message=message,
                        notification_type="course_purchase",
                        related_data={
                            "course_id": course.id,
                            "student_id": user_id,
                            "student_firstname": user.firstname,
                            "student_lastname": user.lastname,
                            "course_title": course.title
                        }
                    )
                except Exception as e:
                    logger.error(f"Notification failed for course {course.id}: {e}")
            
            # Remove items from cart
            cart_items = db.query(Cart).filter(
                and_(
                    Cart.user_id == user_id,
                    Cart.course_id.in_(course_ids)
                )
            ).all()
            
            for cart_item in cart_items:
                db.delete(cart_item)
            db.commit()
            
            return {
                "purchases": purchases,
                "course_ids": course_ids,
                "purchase_ids": purchase_ids,
                "transaction_id": payment_data.razorpay_payment_id
            }
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error in verify_payment_and_complete_purchase: {e}")
            raise HTTPException(
                status_code=500,
                detail="Payment verification failed. Please contact support."
            )
    # @staticmethod
    # async def verify_payment_and_complete_purchase(db: Session, payment_data: RazorpayPaymentVerify, user_id: int):
    #     """
    #     Verify payment, complete purchase, distribute funds, and send notifications
    #     """
    #     try:
    #         # Verify payment signature
    #         is_valid = razorpay_service.verify_payment_signature(
    #             order_id=payment_data.razorpay_order_id,
    #             payment_id=payment_data.razorpay_payment_id,
    #             signature=payment_data.razorpay_signature
    #         )
            
    #         if not is_valid:
    #             try:
    #                 razorpay_service.update_purchase_status(
    #                     db=db,
    #                     order_id=payment_data.razorpay_order_id,
    #                     payment_id=payment_data.razorpay_payment_id,
    #                     status=PurchaseStatus.FAILED
    #                 )
    #             except Exception as e:
    #                 logger.error(f"Failed to update purchase status to FAILED: {e}")
                
    #             raise HTTPException(status_code=400, detail="Payment verification failed")
            
    #         # Update purchase status to completed
    #         purchase = razorpay_service.update_purchase_status(
    #             db=db,
    #             order_id=payment_data.razorpay_order_id,
    #             payment_id=payment_data.razorpay_payment_id,
    #             status=PurchaseStatus.COMPLETED
    #         )

    #         # Get course and user details
    #         course = db.query(Course).filter(Course.id == purchase.course_id).first()
    #         user = db.query(User).filter(User.id == user_id).first()
            
    #         if not course or not user:
    #             logger.error(f"Course or user not found for purchase {purchase.id}")
    #             raise HTTPException(status_code=404, detail="Course or user not found")

    #         # Distribute funds to wallets
    #         if course:
    #             try:
    #                 # Calculate wallet distribution amounts (excluding tax)
    #                 subtotal = purchase.subtotal  # Amount without tax
    #                 admin_commission = subtotal * 0.10  # 10% to admin
    #                 instructor_amount = subtotal * 0.90  # 90% to instructor
                    
    #                 # Add to instructor wallet
    #                 wallet_service.add_funds(
    #                     db=db,
    #                     user_id=course.instructor_id,
    #                     amount=instructor_amount,
    #                     description=f"Course sale commission: {course.title}",
    #                     reference_id=purchase.transaction_id
    #                 )
                    
    #                 # Add to admin wallet
    #                 admin_user_id = wallet_service.get_admin_user_id(db)
    #                 wallet_service.add_funds(
    #                     db=db,
    #                     user_id=admin_user_id,
    #                     amount=admin_commission,
    #                     description=f"Platform commission: {course.title}",
    #                     reference_id=purchase.transaction_id
    #                 )
                    
    #                 logger.info(f"Wallet distribution completed for order {purchase.transaction_id}")
                    
    #             except Exception as wallet_error:
    #                 logger.error(f"Error in wallet distribution: {wallet_error}")
    #                 # Don't fail the payment verification, but log the error

    #         # Send notification to instructor (moved from order creation)
    #         try:
    #             message = f"{user.firstname} {user.lastname} has purchased your course {course.title}"
    #             logger.info(f"{message}")

    #             await create_notification(
    #                 db=db,
    #                 recipient_id=course.instructor_id,
    #                 message=message,
    #                 notification_type="course_purchase",
    #                 related_data={
    #                     "course_id": course.id,
    #                     "student_id": user_id,
    #                     "student_firstname": user.firstname,
    #                     "student_lastname": user.lastname,
    #                     "course_title": course.title
    #                 }
    #             )
    #         except Exception as e:
    #             logger.error(f"Notification failed: {e}")

    #         # Remove item from cart
    #         cart_item = db.query(Cart).filter(
    #             Cart.user_id == user_id, 
    #             Cart.course_id == payment_data.course_id
    #         ).first()
            
    #         if cart_item:
    #             db.delete(cart_item)
    #             db.commit()

    #         return {
    #             "purchase": purchase,
    #             "course_id": payment_data.course_id,
    #             "transaction_id": payment_data.razorpay_payment_id
    #         }

    #     except HTTPException:
    #         raise
    #     except Exception as e:
    #         logger.error(f"Error in verify_payment_and_complete_purchase: {e}")
    #         raise HTTPException(
    #             status_code=500,
    #             detail="Payment verification failed. Please contact support."
            # )

    # async def _send_purchase_notification(
    #     db: Session,
    #     course: Course,
    #     user_id: int,
    #     user_firstname: str,
    #     user_lastname: str
    # ):
    #     """
    #     Send notification to instructor about course purchase
    #     """
    #     try:
    #         # Get student details (you already have firstname/lastname, but getting full user for safety)
    #         student = db.query(User).filter(User.id == user_id).first()
    #         if not student:
    #             logger.error(f"Student not found for user_id: {user_id}")
    #             return

    #         # Create notification message
    #         message = f"{student.firstname} {student.lastname} has purchased your course {course.title}"
    #         logger.info(f"{message}")

    #         # Send notification to instructor
    #         await create_notification(
    #             db=db,
    #             recipient_id=course.instructor_id,  # Note: fixed typo from 'reciepient_id'
    #             message=message,
    #             notification_type="course_purchase",
    #             related_data={
    #                 "course_id": course.id,
    #                 "student_id": user_id,
    #                 "student_firstname": student.firstname,
    #                 "student_lastname": student.lastname,
    #                 "course_title": course.title
    #             }
    #         )

    #     except Exception as e:
    #         logger.error(f"Notification failed: {e}")