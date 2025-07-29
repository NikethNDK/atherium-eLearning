from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_
from datetime import datetime, timedelta
from aetherium.models.user import User, Role, Wallet
from aetherium.models.courses import Course, VerificationStatus, Category
from aetherium.models.user_course import Purchase, CourseReview
from aetherium.models.enum import PurchaseStatus
from typing import List, Dict, Any


class AdminService:

    @staticmethod

    def get_dashboard_stats(db: Session) -> Dict[str, Any]:

        total_users = db.query(User).count()
        total_courses = db.query(Course).count()
        total_instructors = db.query(User).join(Role).filter(Role.name == "instructor").count()

        pending_courses = db.query(Course).filter(

            Course.verification_status == VerificationStatus.PENDING
        ).count()
        published_courses = db.query(Course).filter(

            Course.is_published == True

        ).count()

        # Revenue and sales stats
        completed_purchases = db.query(Purchase).filter(
            Purchase.status == PurchaseStatus.COMPLETED
        )
        
        total_revenue = db.query(func.sum(Purchase.total_amount)).filter(
            Purchase.status == PurchaseStatus.COMPLETED
        ).scalar() or 0.0
        
        total_sales = completed_purchases.count()
        
        # Admin wallet balance
        admin_wallet = db.query(Wallet).join(User).join(Role).filter(
            Role.name == "admin"
        ).first()
        admin_wallet_balance = admin_wallet.balance if admin_wallet else 0.0
        
        # Average rating calculation
        avg_rating_result = db.query(func.avg(CourseReview.rating)).scalar()
        average_rating = round(float(avg_rating_result), 1) if avg_rating_result else 0.0
        
        return {
            "total_users": total_users,
            "total_courses": total_courses,
            "total_instructors": total_instructors,
            "pending_courses": pending_courses,
            "published_courses": published_courses,
            "average_rating": average_rating,
            "total_revenue": round(total_revenue, 2),
            "total_sales": total_sales,
            "admin_wallet_balance": round(admin_wallet_balance, 2)
        }
    
    @staticmethod
    def get_revenue_analytics(db: Session, days: int = 30) -> Dict[str, Any]:
        """Get revenue analytics for the specified number of days"""
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        # Daily revenue data for graph
        daily_revenue = db.query(
            func.date(Purchase.purchased_at).label('date'),
            func.sum(Purchase.total_amount).label('revenue'),
            func.count(Purchase.id).label('sales_count')
        ).filter(
            and_(
                Purchase.status == PurchaseStatus.COMPLETED,
                Purchase.purchased_at >= start_date,
                Purchase.purchased_at <= end_date
            )
        ).group_by(func.date(Purchase.purchased_at)).order_by('date').all()
        
        # Monthly revenue data
        monthly_revenue = db.query(
            func.date_trunc('month', Purchase.purchased_at).label('month'),
            func.sum(Purchase.total_amount).label('revenue'),
            func.count(Purchase.id).label('sales_count')
        ).filter(
            Purchase.status == PurchaseStatus.COMPLETED
        ).group_by(func.date_trunc('month', Purchase.purchased_at)).order_by('month').all()
        
        return {
            "daily_revenue": [
                {
                    "date": str(item.date),
                    "revenue": float(item.revenue),
                    "sales_count": item.sales_count
                }
                for item in daily_revenue
            ],
            "monthly_revenue": [
                {
                    "date": str(item.month.date()),
                    "revenue": float(item.revenue),
                    "sales_count": item.sales_count
                }
                for item in monthly_revenue
            ]
        }
    
    @staticmethod
    def get_category_analytics(db: Session) -> List[Dict[str, Any]]:
        """Get analytics for each category"""
        category_stats = db.query(
            Category.id,
            Category.name,
            func.count(Course.id).label('course_count'),
            func.count(Purchase.id).label('sales_count'),
            func.sum(Purchase.total_amount).label('revenue')
        ).outerjoin(Course, Category.id == Course.category_id)\
        .outerjoin(Purchase, and_(
            Course.id == Purchase.course_id,
            Purchase.status == PurchaseStatus.COMPLETED
        ))\
        .group_by(Category.id, Category.name)\
        .order_by(desc('revenue')).all()
        
        return [
            {
                "category_id": item.id,
                "category_name": item.name,
                "course_count": item.course_count,
                "sales_count": item.sales_count or 0,
                "revenue": float(item.revenue) if item.revenue else 0.0
            }
            for item in category_stats
        ]
    
    @staticmethod
    def get_instructor_analytics(db: Session) -> List[Dict[str, Any]]:
        """Get analytics for each instructor"""
        instructor_stats = db.query(
            User.id,
            User.firstname,
            User.lastname,
            User.profile_picture,
            func.count(Course.id).label('course_count'),
            func.count(Purchase.id).label('sales_count'),
            func.sum(Purchase.total_amount).label('revenue'),
            func.count(func.distinct(Purchase.user_id)).label('student_count')
        ).join(Role).filter(Role.name == "instructor")\
        .outerjoin(Course, User.id == Course.instructor_id)\
        .outerjoin(Purchase, and_(
            Course.id == Purchase.course_id,
            Purchase.status == PurchaseStatus.COMPLETED
        ))\
        .group_by(User.id, User.firstname, User.lastname, User.profile_picture)\
        .order_by(desc('revenue')).all()
        
        return [
            {
                "instructor_id": item.id,
                "name": f"{item.firstname} {item.lastname}",
                "profile_picture": item.profile_picture,
                "course_count": item.course_count,
                "sales_count": item.sales_count or 0,
                "revenue": float(item.revenue) if item.revenue else 0.0,
                "student_count": item.student_count or 0,
                "initials": f"{item.firstname[0] if item.firstname else ''}{item.lastname[0] if item.lastname else ''}"
            }
            for item in instructor_stats
        ]
    
    @staticmethod
    def get_best_selling_courses(db: Session, limit: int = 10) -> List[Dict[str, Any]]:
        """Get best selling courses with actual sales data"""
        best_sellers = db.query(
            Course.id,
            Course.title,
            Course.cover_image,
            Course.price,
            User.firstname,
            User.lastname,
            func.count(Purchase.id).label('sales_count'),
            func.sum(Purchase.total_amount).label('revenue'),
            func.avg(CourseReview.rating).label('avg_rating')
        ).outerjoin(Purchase, and_(
            Course.id == Purchase.course_id,
            Purchase.status == PurchaseStatus.COMPLETED
        ))\
        .join(User, Course.instructor_id == User.id)\
        .outerjoin(CourseReview, Course.id == CourseReview.course_id)\
        .filter(Course.is_published == True)\
        .group_by(Course.id, Course.title, Course.cover_image, Course.price, User.firstname, User.lastname)\
        .order_by(desc('sales_count')).limit(limit).all()
        
        return [
            {
                "course_id": item.id,
                "title": item.title,
                "instructor_name": f"{item.firstname} {item.lastname}",
                "sales_count": item.sales_count or 0,
                "revenue": float(item.revenue) if item.revenue else 0.0,
                "cover_image": item.cover_image,
                "price": float(item.price) if item.price else 0.0,
                "avg_rating": round(float(item.avg_rating), 1) if item.avg_rating else 0.0
            }
            for item in best_sellers
        ]
    
    @staticmethod
    def get_top_instructors(db: Session) -> List[Dict[str, Any]]:
        """Get top instructors by course count and revenue"""
        instructors = db.query(
            User.id,
            User.firstname,
            User.lastname,
           
            User.profile_picture,
            func.count(Course.id).label('course_count'),
            func.sum(Purchase.total_amount).label('total_revenue'),
            func.count(func.distinct(Purchase.user_id)).label('student_count')
        ).join(Role).outerjoin(Course, User.id == Course.instructor_id)\
        .outerjoin(Purchase, and_(
            Course.id == Purchase.course_id,
            Purchase.status == PurchaseStatus.COMPLETED
        ))\
        .filter(Role.name == "instructor")\
        .group_by(User.id, User.firstname, User.lastname,User.profile_picture)\
        .order_by(desc('total_revenue'))\
        .limit(10).all()
        
        return [
            {
                "id": instructor.id,
                "name": f"{instructor.firstname} {instructor.lastname}",
                "profile_picture": instructor.profile_picture,
                "course_count": instructor.course_count,
                "total_revenue": float(instructor.total_revenue) if instructor.total_revenue else 0.0,
                "student_count": instructor.student_count or 0,
                "initials": f"{instructor.firstname[0] if instructor.firstname else ''}{instructor.lastname[0] if instructor.lastname else ''}"
            }
            for instructor in instructors
        ]
    
    @staticmethod
    def get_comprehensive_dashboard_data(db: Session) -> Dict[str, Any]:
        """Get all dashboard data in one comprehensive response"""
        basic_stats = AdminService.get_dashboard_stats(db)
        revenue_analytics = AdminService.get_revenue_analytics(db)
        category_analytics = AdminService.get_category_analytics(db)
        instructor_analytics = AdminService.get_instructor_analytics(db)
        best_sellers = AdminService.get_best_selling_courses(db)
        top_instructors = AdminService.get_top_instructors(db)
        
        return {
            "basic_stats": basic_stats,
            "revenue_analytics": revenue_analytics,
            "category_analytics": category_analytics,
            "instructor_analytics": instructor_analytics,
            "best_selling_courses": best_sellers,
            "top_instructors": top_instructors
        }

class AdminReportService:
    @staticmethod
    def get_course_report(
        db: Session,
        course_id: int = None,
        instructor_id: int = None,
        period: str = "all",  # "day", "month", "year", "all"
        start_date: str = None,
        end_date: str = None
    ):
        query = db.query(
            Course.id.label("course_id"),
            Course.title.label("course_title"),
            User.id.label("instructor_id"),
            User.firstname.label("instructor_firstname"),
            User.lastname.label("instructor_lastname"),
            func.count(Purchase.id).label("num_students"),
            func.coalesce(func.sum(Purchase.total_amount), 0).label("revenue"),
            func.date_trunc(period if period != "all" else "day", Purchase.purchased_at).label("period")
        ).join(User, Course.instructor_id == User.id
        ).join(Purchase, and_(
            Purchase.course_id == Course.id,
            Purchase.status == PurchaseStatus.COMPLETED
        ))

        if course_id:
            query = query.filter(Course.id == course_id)
        if instructor_id:
            query = query.filter(User.id == instructor_id)
        if start_date:
            
            query = query.filter(Purchase.purchased_at >= start_date)
        if end_date:
            query = query.filter(Purchase.purchased_at <= end_date)

        group_by_fields = [
            Course.id, Course.title, User.id, User.firstname, User.lastname
        ]
        if period != "all":
            group_by_fields.append(func.date_trunc(period, Purchase.purchased_at))

        query = query.group_by(*group_by_fields).order_by(func.date_trunc(period if period != "all" else "day", Purchase.purchased_at).desc())

        return query.all()
    
    @staticmethod
    def get_all_instructors(db: Session) -> List[User]:
        return db.query(User).join(Role).filter(Role.name == "instructor").all()
