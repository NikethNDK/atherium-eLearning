from sqlalchemy.orm import Session
from sqlalchemy import func, extract, and_
from datetime import datetime, timedelta
from typing import List, Dict
from aetherium.models.user_course import Purchase
from aetherium.models.user import User
from aetherium.models.courses import Course
from aetherium.models.courses.progress import CourseProgress
from aetherium.schemas.instructor_analytics import CourseAnalyticsResponse,PurchaseStatsResponse,StudentProgressResponse
from fastapi import HTTPException
from aetherium.models.enum import PaymentMethod,PurchaseStatus
class CourseAnalyticsService:
    
    @staticmethod
    def get_course_analytics(db: Session, course_id: int, instructor_id: int) -> CourseAnalyticsResponse:
        # Verify the course belongs to the instructor
        course = db.query(Course).filter(
            and_(
                Course.id == course_id,
                Course.instructor_id == instructor_id
            )
        ).first()
        
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
        
        # Get total purchases
        total_purchases = db.query(func.count(Purchase.id)).filter(
            Purchase.course_id == course_id
        ).scalar()
        
        # Get total revenue
        revenue_data = db.query(
            func.sum(Purchase.total_amount).label("total_revenue"),
            func.sum(Purchase.tax_amount).label("total_tax"),
            func.sum(Purchase.subtotal).label("total_subtotal")
        ).filter(
            Purchase.course_id == course_id,
            Purchase.status == PurchaseStatus.COMPLETED
        ).first()
        
        # Get average progress of all students
        avg_progress = db.query(
            func.avg(CourseProgress.progress_percentage).label("avg_progress")
        ).filter(
            CourseProgress.course_id == course_id
        ).scalar() or 0
        
        return CourseAnalyticsResponse(
            total_students=total_purchases,
            total_revenue=revenue_data.total_revenue or 0,
            total_tax=revenue_data.total_tax or 0,
            total_income=revenue_data.total_subtotal or 0,
            average_progress=round(float(avg_progress), 2))
    
    @staticmethod
    def get_purchase_stats(db: Session, course_id: int, instructor_id: int, period: str) -> PurchaseStatsResponse:
        # Verify course ownership
        course = db.query(Course).filter(
            and_(
                Course.id == course_id,
                Course.instructor_id == instructor_id
            )
        ).first()
        
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
        
        now = datetime.utcnow()
        stats = []
        
        if period == "daily":
            # Last 30 days
            for i in range(30, -1, -1):
                date = now - timedelta(days=i)
                day_start = datetime(date.year, date.month, date.day)
                day_end = day_start + timedelta(days=1)
                
                count = db.query(func.count(Purchase.id)).filter(
                    and_(
                        Purchase.course_id == course_id,
                        Purchase.purchased_at >= day_start,
                        Purchase.purchased_at < day_end,
                        Purchase.status == PurchaseStatus.COMPLETED
                    )
                ).scalar()
                
                revenue = db.query(func.sum(Purchase.total_amount)).filter(
                    and_(
                        Purchase.course_id == course_id,
                        Purchase.purchased_at >= day_start,
                        Purchase.purchased_at < day_end,
                        Purchase.status == PurchaseStatus.COMPLETED
                    )
                ).scalar() or 0
                
                stats.append({
                    "date": day_start.date(),
                    "count": count,
                    "revenue": revenue
                })
        
        elif period == "monthly":
            # Last 12 months
            for i in range(12, -1, -1):
                date = now - timedelta(days=30*i)
                month_start = datetime(date.year, date.month, 1)
                next_month = month_start.replace(day=28) + timedelta(days=4)  # Ensure we get to next month
                month_end = next_month - timedelta(days=next_month.day - 1)
                
                count = db.query(func.count(Purchase.id)).filter(
                    and_(
                        Purchase.course_id == course_id,
                        Purchase.purchased_at >= month_start,
                        Purchase.purchased_at < month_end,
                        Purchase.status == PurchaseStatus.COMPLETED
                    )
                ).scalar()
                
                revenue = db.query(func.sum(Purchase.total_amount)).filter(
                    and_(
                        Purchase.course_id == course_id,
                        Purchase.purchased_at >= month_start,
                        Purchase.purchased_at < month_end,
                        Purchase.status == PurchaseStatus.COMPLETED
                    )
                ).scalar() or 0
                
                stats.append({
                    "date": month_start.date(),
                    "count": count,
                    "revenue": revenue
                })
        
        # Similar logic for weekly and yearly periods
        
        return PurchaseStatsResponse(stats=stats, period=period)
    
    @staticmethod
    def get_student_progress(db: Session, course_id: int, instructor_id: int) -> List[StudentProgressResponse]:
        # Verify course ownership
        course = db.query(Course).filter(
            and_(
                Course.id == course_id,
                Course.instructor_id == instructor_id
            )
        ).first()
        
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
        
        students_progress = db.query(
            User.id,
            User.firstname,
            User.lastname,
            User.email,
            CourseProgress.progress_percentage,
            Purchase.purchased_at
        ).join(
            Purchase, Purchase.user_id == User.id
        ).join(
            CourseProgress, and_(
                CourseProgress.user_id == User.id,
                CourseProgress.course_id == course_id
            )
        ).filter(
            Purchase.course_id == course_id,
            Purchase.status == PurchaseStatus.COMPLETED
        ).all()
        
        return [
            StudentProgressResponse(
                user_id=row.id,
                firstname=row.firstname,
                lastname=row.lastname,
                email=row.email,
                progress=row.progress_percentage,
                joined_at=row.purchased_at
            )
            for row in students_progress
        ]