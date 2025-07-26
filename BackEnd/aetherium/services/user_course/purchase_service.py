from sqlalchemy.orm import Session,joinedload
from aetherium.models.courses import Course
from aetherium.models.user import User
from aetherium.models.user_course import Purchase, PurchaseStatus, Cart
from aetherium.models.courses.progress import CourseProgress
from aetherium.schemas.user_course import PurchaseResponse
from aetherium.services.razorpay_service import *
from aetherium.schemas.user_course import RazorpayOrderResponse
from fastapi import HTTPException
import uuid
from aetherium.services.notification_service import create_notification
from aetherium.core.logger import logger

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
    async def create_course_order_with_notification(db: Session,user_id: int,course_id: int,user_email: str,user_firstname: str,user_lastname: str) -> RazorpayOrderResponse:
        """
        Create a Razorpay order for course purchase and send notification to instructor
        """
        try:
            # Fetch course details
            course = db.query(Course).filter(Course.id == course_id).first()
            if not course:
                raise HTTPException(status_code=404, detail="Course not found")

            # Calculate amounts
            subtotal = course.discount_price if course.discount_price else course.price
            if subtotal <= 0:
                raise HTTPException(status_code=400, detail="Invalid course price")

            tax_amount = subtotal * 0.18
            total_amount = subtotal + tax_amount

            # Create receipt
            receipt = f"course_{course.id}*user*{user_id}"

            # Create Razorpay order
            razorpay_order = razorpay_service.create_order(
                amount=total_amount,
                receipt=receipt
            )

            # Create purchase record
            purchase = razorpay_service.create_purchase_record_safe(
                db=db,
                user_id=user_id,
                course_id=course.id,
                subtotal=subtotal,
                tax_amount=tax_amount,
                total_amount=total_amount,
                order_id=razorpay_order['id'],
                status=PurchaseStatus.PENDING
            )

            # Send notification to instructor
            try:
                message = f"{user_firstname} {user_lastname} has purchased your course {course.title}"
                logger.info(f"{message}")

                await create_notification(
                    db=db,
                    recipient_id=course.instructor_id,
                    message=message,
                    notification_type="course_purchase",
                    related_data={
                        "course_id": course.id,
                        "student_id": user_id,
                        "student_firstname": user_firstname,
                        "student_lastname": user_lastname,
                        "course_title": course.title
                    }
                )
            except Exception as e:
                logger.error(f"Notification failed: {e}")

            # Return response
            return RazorpayOrderResponse(
                order_id=razorpay_order['id'],
                amount=razorpay_order['amount'],
                currency=razorpay_order['currency'],
                key_id=razorpay_service.key_id,
                course_id=course.id,
                course_title=course.title,
                user_email=user_email,
                user_name=f"{user_firstname} {user_lastname}",
                subtotal=subtotal,
                tax_amount=tax_amount,
                total_amount=total_amount
            )

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error in create_course_order_with_notification: {e}")
            raise HTTPException(
                status_code=500,
                detail="Failed to create order. Please try again."
            )


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