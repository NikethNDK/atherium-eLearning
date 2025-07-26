# Admin Dashboard Analytics API Documentation

This document describes the enhanced admin dashboard analytics endpoints that provide comprehensive insights into the eLearning platform's performance.

## Overview

The admin dashboard now includes comprehensive analytics for:
- Revenue tracking and trends
- Course sales performance
- Category-wise analytics
- Instructor performance metrics
- Best-selling courses
- Student engagement data

## Authentication

All endpoints require admin authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your_admin_jwt_token>
```

## Endpoints

### 1. Basic Dashboard Stats
**GET** `/admin/dashboard/stats`

Returns basic statistics for the admin dashboard.

**Response:**
```json
{
  "total_users": 1250,
  "total_courses": 89,
  "total_instructors": 45,
  "pending_courses": 12,
  "published_courses": 77,
  "average_rating": 4.2,
  "total_revenue": 125000.50,
  "total_sales": 2340,
  "admin_wallet_balance": 25000.00
}
```

### 2. Comprehensive Dashboard Data
**GET** `/admin/dashboard/comprehensive`

Returns all dashboard analytics in a single response for efficient frontend rendering.

**Response:**
```json
{
  "basic_stats": {
    "total_users": 1250,
    "total_courses": 89,
    "total_instructors": 45,
    "pending_courses": 12,
    "published_courses": 77,
    "average_rating": 4.2,
    "total_revenue": 125000.50,
    "total_sales": 2340,
    "admin_wallet_balance": 25000.00
  },
  "revenue_analytics": {
    "daily_revenue": [
      {
        "date": "2024-01-15",
        "revenue": 1250.00,
        "sales_count": 23
      }
    ],
    "monthly_revenue": [
      {
        "month": "2024-01-01",
        "revenue": 45000.00,
        "sales_count": 890
      }
    ]
  },
  "category_analytics": [
    {
      "category_id": 1,
      "category_name": "Programming",
      "course_count": 25,
      "sales_count": 1200,
      "revenue": 75000.00
    }
  ],
  "instructor_analytics": [
    {
      "instructor_id": 1,
      "name": "John Doe",
      "username": "johndoe",
      "profile_picture": "https://example.com/profile.jpg",
      "course_count": 5,
      "sales_count": 450,
      "revenue": 28000.00,
      "student_count": 420,
      "initials": "JD"
    }
  ],
  "best_selling_courses": [
    {
      "course_id": 1,
      "title": "Complete Python Masterclass",
      "instructor_name": "John Doe",
      "sales_count": 250,
      "revenue": 15000.00,
      "cover_image": "https://example.com/course.jpg",
      "price": 99.99,
      "avg_rating": 4.5
    }
  ],
  "top_instructors": [
    {
      "id": 1,
      "name": "John Doe",
      "username": "johndoe",
      "profile_picture": "https://example.com/profile.jpg",
      "course_count": 5,
      "total_revenue": 28000.00,
      "student_count": 420,
      "initials": "JD"
    }
  ]
}
```

### 3. Revenue Analytics
**GET** `/admin/dashboard/revenue-analytics?days=30`

Returns revenue analytics for graphs and charts.

**Query Parameters:**
- `days` (optional): Number of days for analytics (1-365, default: 30)

**Response:**
```json
{
  "daily_revenue": [
    {
      "date": "2024-01-15",
      "revenue": 1250.00,
      "sales_count": 23
    }
  ],
  "monthly_revenue": [
    {
      "month": "2024-01-01",
      "revenue": 45000.00,
      "sales_count": 890
    }
  ]
}
```

### 4. Category Analytics
**GET** `/admin/dashboard/category-analytics`

Returns analytics for each course category.

**Response:**
```json
[
  {
    "category_id": 1,
    "category_name": "Programming",
    "course_count": 25,
    "sales_count": 1200,
    "revenue": 75000.00
  },
  {
    "category_id": 2,
    "category_name": "Design",
    "course_count": 15,
    "sales_count": 800,
    "revenue": 48000.00
  }
]
```

### 5. Instructor Analytics
**GET** `/admin/dashboard/instructor-analytics`

Returns detailed analytics for each instructor.

**Response:**
```json
[
  {
    "instructor_id": 1,
    "name": "John Doe",
    "username": "johndoe",
    "profile_picture": "https://example.com/profile.jpg",
    "course_count": 5,
    "sales_count": 450,
    "revenue": 28000.00,
    "student_count": 420,
    "initials": "JD"
  }
]
```

### 6. Best Selling Courses
**GET** `/admin/dashboard/best-selling-courses?limit=10`

Returns the best-selling courses with actual sales data.

**Query Parameters:**
- `limit` (optional): Number of courses to return (1-50, default: 10)

**Response:**
```json
[
  {
    "course_id": 1,
    "title": "Complete Python Masterclass",
    "instructor_name": "John Doe",
    "sales_count": 250,
    "revenue": 15000.00,
    "cover_image": "https://example.com/course.jpg",
    "price": 99.99,
    "avg_rating": 4.5
  }
]
```

### 7. Top Instructors
**GET** `/admin/top-instructors`

Returns top instructors by revenue and course count.

**Response:**
```json
[
  {
    "id": 1,
    "name": "John Doe",
    "username": "johndoe",
    "profile_picture": "https://example.com/profile.jpg",
    "course_count": 5,
    "total_revenue": 28000.00,
    "student_count": 420,
    "initials": "JD"
  }
]
```

## Data Sources

The analytics are based on the following data:

1. **Revenue Data**: From completed purchases in the `purchases` table
2. **Course Data**: From the `courses` table with published status
3. **User Data**: From the `users` table with role-based filtering
4. **Category Data**: From the `categories` table
5. **Review Data**: From the `course_reviews` table for ratings
6. **Wallet Data**: From the `wallets` table for admin balance

## Key Features

### Revenue Tracking
- Real-time total revenue calculation
- Daily and monthly revenue trends
- Sales count tracking
- Admin wallet balance monitoring

### Course Analytics
- Best-selling courses by actual sales
- Course ratings and reviews
- Category-wise performance
- Instructor performance metrics

### Instructor Analytics
- Revenue per instructor
- Student count per instructor
- Course count per instructor
- Performance rankings

### Category Analytics
- Revenue per category
- Course count per category
- Sales performance per category

## Frontend Integration

### For Charts and Graphs
Use the revenue analytics endpoint to create:
- Line charts for revenue trends
- Bar charts for category performance
- Pie charts for instructor distribution

### For Dashboard Cards
Use the basic stats endpoint for:
- Total revenue display
- User count cards
- Course count cards
- Pending course alerts

### For Tables
Use the specific analytics endpoints for:
- Best-selling courses table
- Top instructors table
- Category performance table

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200`: Success
- `403`: Admin access required
- `500`: Internal server error

## Performance Considerations

- The comprehensive endpoint may take longer to load due to multiple queries
- Consider caching for frequently accessed data
- Use specific endpoints for real-time updates
- Revenue analytics with large date ranges may be slower

## Testing

Use the provided test script (`test_admin_dashboard.py`) to verify endpoint functionality:

```bash
python test_admin_dashboard.py
```

Make sure to:
1. Update the `ADMIN_TOKEN` variable with a valid admin JWT token
2. Ensure your FastAPI server is running
3. Have test data in your database

## Future Enhancements

Potential improvements for the analytics system:
- Export functionality for reports
- Real-time notifications for significant events
- Advanced filtering and date range selection
- Comparative analytics (period-over-period)
- Predictive analytics for revenue forecasting 