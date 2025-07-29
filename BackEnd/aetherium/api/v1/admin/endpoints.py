from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from aetherium.database.db import get_db
from aetherium.services.user_service import get_all_users, block_user
from aetherium.utils.jwt_utils import get_current_user
from aetherium.schemas.user import (
    UserResponse, UserBlockRequest, BasicStatsResponse, 
    RevenueAnalyticsResponse, CategoryAnalyticsResponse, 
    InstructorAnalyticsResponse, BestSellingCourseResponse, 
    TopInstructorResponse, ComprehensiveDashboardResponse
)
from aetherium.schemas.category import CategoryCreate, CategoryResponse
from aetherium.schemas.topic import TopicCreate, TopicResponse
from aetherium.schemas.course import CourseResponse, CourseReviewRequest
from aetherium.services.course_service import CourseService
from aetherium.services.admin_service import AdminService
from typing import List
from aetherium.models.user import User
from aetherium.models.courses import Topic, Course

router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/users", response_model=List[UserResponse])
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.name != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return get_all_users(db)

@router.post("/users/{user_id}/block")
def block_user_endpoint(
    user_id: int,
    block_data: UserBlockRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.name != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return block_user(db, user_id, block_data.block)

@router.get("/dashboard/stats", response_model=BasicStatsResponse)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.name != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return AdminService.get_dashboard_stats(db)

@router.get("/dashboard/comprehensive", response_model=ComprehensiveDashboardResponse)
def get_comprehensive_dashboard_data(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get comprehensive dashboard data including all analytics"""
    if current_user.role.name != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return AdminService.get_comprehensive_dashboard_data(db)

@router.get("/dashboard/revenue-analytics", response_model=RevenueAnalyticsResponse)
def get_revenue_analytics(
    days: int = Query(30, description="Number of days for analytics", ge=1, le=365),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get revenue analytics for graphs and charts"""
    if current_user.role.name != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return AdminService.get_revenue_analytics(db, days)

@router.get("/dashboard/category-analytics", response_model=List[CategoryAnalyticsResponse])
def get_category_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get analytics for each category"""
    if current_user.role.name != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return AdminService.get_category_analytics(db)

@router.get("/dashboard/instructor-analytics", response_model=List[InstructorAnalyticsResponse])
def get_instructor_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get analytics for each instructor"""
    if current_user.role.name != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return AdminService.get_instructor_analytics(db)

@router.get("/dashboard/best-selling-courses", response_model=List[BestSellingCourseResponse])
def get_best_selling_courses(
    limit: int = Query(10, description="Number of courses to return", ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get best selling courses with actual sales data"""
    if current_user.role.name != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return AdminService.get_best_selling_courses(db, limit)

@router.get("/top-instructors", response_model=List[TopInstructorResponse])
def get_top_instructors(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.name != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return AdminService.get_top_instructors(db)

@router.get("/categories", response_model=List[CategoryResponse])
def get_categories(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # if current_user.role.name not in ["admin", "instructor"]:
    #     raise HTTPException(status_code=403, detail="Not authorized")
    return CourseService.get_all_categories(db)

@router.post("/categories", response_model=CategoryResponse)
async def create_category(
    category_data: CategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.name != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    return CourseService.create_category(db, category_data)

@router.put("/categories/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_id: int,
    category_data: CategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.name != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    return CourseService.update_category(db, category_id, category_data)

@router.get("/topics", response_model=List[TopicResponse])
def get_all_topics_with_category(db: Session = Depends(get_db)):
    return db.query(Topic).all()

@router.post("/topics", response_model=TopicResponse)
async def create_topic(
    topic_data: TopicCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.name not in ["admin", "instructor"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    return CourseService.create_topic(db, topic_data)

@router.get("/courses", response_model=List[CourseResponse])
async def get_all_courses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.name != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    return CourseService.get_all_courses(db)

@router.get("/courses/pending", response_model=List[CourseResponse])
async def get_pending_courses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.name != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    return CourseService.get_pending_courses(db)

@router.get("/courses/{course_id}", response_model=CourseResponse)
async def get_course_for_review(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.name not in ["admin", "instructor"]:

        raise HTTPException(status_code=403, detail="Not authorized")
    return CourseService.get_course_by_id(db, course_id)

@router.post("/courses/{course_id}/review", response_model=CourseResponse)
async def review_course(course_id: int,review_data: CourseReviewRequest,db: Session = Depends(get_db),current_user: User = Depends(get_current_user)):
    if current_user.role.name != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    return CourseService.review_course(db, course_id, review_data.status, review_data.admin_response)

from datetime import date
from typing import Optional
from aetherium.services.admin_service import AdminReportService 

@router.get("/course-report")
def get_course_report(
    course_id: Optional[int] = Query(None),
    instructor_id: Optional[int] = Query(None),
    period: str = Query("all", enum=["all", "day", "month", "year"]),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Returns course report filtered by course, instructor, and period.
    """
    report = AdminReportService.get_course_report(
        db,
        course_id=course_id,
        instructor_id=instructor_id,
        period=period,
        start_date=start_date,
        end_date=end_date
    )
    return [
        {
            "course_id": r.course_id,
            "course_title": r.course_title,
            "instructor_id": r.instructor_id,
            "instructor_name": f"{r.instructor_firstname} {r.instructor_lastname}",
            "num_students": r.num_students,
            "revenue": float(r.revenue),
            "period": r.period.isoformat() if r.period else None
        }
        for r in report
    ]


@router.get("/instructors", response_model=List[UserResponse])
def get_all_instructors(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.name != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    return AdminReportService.get_all_instructors(db)

import csv
from fastapi.responses import StreamingResponse
from io import StringIO

@router.get("/course-report/download")
def download_course_report(
    course_id: Optional[int] = Query(None),
    instructor_id: Optional[int] = Query(None),
    period: str = Query("all", enum=["all", "day", "month", "year"]),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    db: Session = Depends(get_db)
):
    report = AdminReportService.get_course_report(
        db,
        course_id=course_id,
        instructor_id=instructor_id,
        period=period,
        start_date=start_date,
        end_date=end_date
    )
    output = StringIO()
    writer = csv.writer(output)
    # Header
    writer.writerow(["Aetherium"])
    writer.writerow([f"Period: {period}"])
    writer.writerow([f"Report generated: {date.today().isoformat()}"])
    writer.writerow([])
    writer.writerow(["Course", "Instructor", "Period", "Students", "Revenue"])
    for r in report:
        writer.writerow([
            r.course_title,
            f"{r.instructor_firstname} {r.instructor_lastname}",
            r.period.isoformat() if r.period else "",
            r.num_students,
            float(r.revenue)
        ])
    output.seek(0)
    return StreamingResponse(output, media_type="text/csv", headers={"Content-Disposition": "attachment; filename=course_report.csv"})