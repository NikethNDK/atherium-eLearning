#!/usr/bin/env python3
"""
Test script for Admin Dashboard Analytics Endpoints
This script tests the new admin dashboard analytics functionality
"""

import requests
import json
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:8000"  # Adjust if your server runs on different port
ADMIN_TOKEN = "your_admin_jwt_token_here"  # Replace with actual admin token

def test_admin_dashboard_endpoints():
    """Test all admin dashboard endpoints"""
    
    headers = {
        "Authorization": f"Bearer {ADMIN_TOKEN}",
        "Content-Type": "application/json"
    }
    
    endpoints = [
        "/admin/dashboard/stats",
        "/admin/dashboard/comprehensive", 
        "/admin/dashboard/revenue-analytics",
        "/admin/dashboard/category-analytics",
        "/admin/dashboard/instructor-analytics",
        "/admin/dashboard/best-selling-courses",
        "/admin/top-instructors"
    ]
    
    print("Testing Admin Dashboard Analytics Endpoints")
    print("=" * 50)
    
    for endpoint in endpoints:
        try:
            print(f"\nTesting: {endpoint}")
            response = requests.get(f"{BASE_URL}{endpoint}", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Success - Status: {response.status_code}")
                print(f"Response keys: {list(data.keys()) if isinstance(data, dict) else f'List with {len(data)} items'}")
                
                # Print sample data for comprehensive endpoint
                if endpoint == "/admin/dashboard/comprehensive":
                    print("📊 Comprehensive Dashboard Data:")
                    print(f"  - Basic Stats: {data.get('basic_stats', {})}")
                    print(f"  - Revenue Analytics: {len(data.get('revenue_analytics', {}).get('daily_revenue', []))} daily data points")
                    print(f"  - Categories: {len(data.get('category_analytics', []))} categories")
                    print(f"  - Instructors: {len(data.get('instructor_analytics', []))} instructors")
                    print(f"  - Best Sellers: {len(data.get('best_selling_courses', []))} courses")
                    print(f"  - Top Instructors: {len(data.get('top_instructors', []))} instructors")
                
            else:
                print(f"❌ Failed - Status: {response.status_code}")
                print(f"Error: {response.text}")
                
        except Exception as e:
            print(f"❌ Exception: {str(e)}")
    
    print("\n" + "=" * 50)
    print("Test completed!")

def test_revenue_analytics_with_different_periods():
    """Test revenue analytics with different time periods"""
    
    headers = {
        "Authorization": f"Bearer {ADMIN_TOKEN}",
        "Content-Type": "application/json"
    }
    
    periods = [7, 30, 90, 365]
    
    print("\nTesting Revenue Analytics with Different Periods")
    print("=" * 50)
    
    for days in periods:
        try:
            print(f"\nTesting: /admin/dashboard/revenue-analytics?days={days}")
            response = requests.get(
                f"{BASE_URL}/admin/dashboard/revenue-analytics?days={days}", 
                headers=headers
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Success - {days} days")
                print(f"  - Daily data points: {len(data.get('daily_revenue', []))}")
                print(f"  - Monthly data points: {len(data.get('monthly_revenue', []))}")
            else:
                print(f"❌ Failed - Status: {response.status_code}")
                
        except Exception as e:
            print(f"❌ Exception: {str(e)}")

def test_best_selling_courses_with_limits():
    """Test best selling courses with different limits"""
    
    headers = {
        "Authorization": f"Bearer {ADMIN_TOKEN}",
        "Content-Type": "application/json"
    }
    
    limits = [5, 10, 20]
    
    print("\nTesting Best Selling Courses with Different Limits")
    print("=" * 50)
    
    for limit in limits:
        try:
            print(f"\nTesting: /admin/dashboard/best-selling-courses?limit={limit}")
            response = requests.get(
                f"{BASE_URL}/admin/dashboard/best-selling-courses?limit={limit}", 
                headers=headers
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Success - Limit: {limit}")
                print(f"  - Courses returned: {len(data)}")
                if data:
                    print(f"  - Top course: {data[0].get('title', 'N/A')}")
                    print(f"  - Sales count: {data[0].get('sales_count', 0)}")
            else:
                print(f"❌ Failed - Status: {response.status_code}")
                
        except Exception as e:
            print(f"❌ Exception: {str(e)}")

if __name__ == "__main__":
    print("Admin Dashboard Analytics Test Suite")
    print("Make sure to:")
    print("1. Update ADMIN_TOKEN with a valid admin JWT token")
    print("2. Ensure your FastAPI server is running")
    print("3. Have some test data in your database")
    print()
    
    # Uncomment the tests you want to run
    # test_admin_dashboard_endpoints()
    # test_revenue_analytics_with_different_periods()
    # test_best_selling_courses_with_limits()
    
    print("Please uncomment the test functions and update ADMIN_TOKEN to run the tests.") 