#!/usr/bin/env python3
"""
Fitterverse Backend API Testing Suite
Tests all backend endpoints for the Fitterverse health and wellness app
"""

import requests
import json
import base64
from PIL import Image, ImageDraw, ImageFont
import io
from datetime import datetime, timedelta
import uuid
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/frontend/.env')

# Get backend URL from frontend env
BACKEND_URL = os.getenv('REACT_APP_BACKEND_URL', 'https://mindhealthy.preview.emergentagent.com')
API_BASE_URL = f"{BACKEND_URL}/api"

# Test data
TEST_USER_ID = "test_user_123"
TEST_HABIT_ID = str(uuid.uuid4())

class FitterverseAPITester:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
        self.results = {
            'passed': 0,
            'failed': 0,
            'errors': []
        }
    
    def log_result(self, test_name, success, message="", response=None):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name}")
        if message:
            print(f"   {message}")
        if response and not success:
            print(f"   Response: {response.status_code} - {response.text[:200]}")
        
        if success:
            self.results['passed'] += 1
        else:
            self.results['failed'] += 1
            self.results['errors'].append({
                'test': test_name,
                'message': message,
                'response': response.text if response else None
            })
        print()
    
    def create_test_image(self, text="Test Meal"):
        """Create a simple test image for meal analysis"""
        # Create a 400x300 image with colored background
        img = Image.new('RGB', (400, 300), color=(255, 200, 100))
        draw = ImageDraw.Draw(img)
        
        # Try to use a font, fallback to default if not available
        try:
            font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 24)
        except:
            font = ImageFont.load_default()
        
        # Draw some food-like shapes and text
        draw.rectangle([50, 50, 150, 100], fill=(200, 100, 50))  # Brown rectangle (bread)
        draw.ellipse([200, 80, 300, 150], fill=(100, 200, 100))  # Green circle (salad)
        draw.rectangle([100, 180, 250, 220], fill=(255, 150, 150))  # Pink rectangle (meat)
        
        # Add text
        draw.text((150, 250), text, fill=(0, 0, 0), font=font)
        
        # Convert to base64
        buffer = io.BytesIO()
        img.save(buffer, format='JPEG')
        img_base64 = base64.b64encode(buffer.getvalue()).decode()
        
        return img_base64
    
    def test_health_check(self):
        """Test health check endpoint"""
        try:
            response = self.session.get(f"{API_BASE_URL}/health")
            if response.status_code == 200:
                data = response.json()
                if 'status' in data and data['status'] == 'healthy':
                    self.log_result("Health Check", True, "API is healthy")
                    return True
                else:
                    self.log_result("Health Check", False, "Invalid health response format", response)
            else:
                self.log_result("Health Check", False, f"HTTP {response.status_code}", response)
        except Exception as e:
            self.log_result("Health Check", False, f"Exception: {str(e)}")
        return False
    
    def test_meal_analysis(self):
        """Test Gemini AI meal image analysis - CRITICAL FEATURE"""
        try:
            # Create test image
            test_image = self.create_test_image("Healthy Breakfast")
            
            payload = {
                "image_base64": test_image,
                "meal_type": "breakfast",
                "user_profile": {
                    "primaryGoal": "weight_loss",
                    "dietPattern": "balanced",
                    "exclusions": []
                }
            }
            
            response = self.session.post(f"{API_BASE_URL}/meals/analyze", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ['success', 'meal_type', 'analysis']
                
                if all(field in data for field in required_fields):
                    analysis = data['analysis']
                    # Check if analysis has expected structure
                    analysis_fields = ['total_calories', 'protein_g', 'carbs_g', 'fats_g', 'rating']
                    
                    if all(field in analysis for field in analysis_fields):
                        self.log_result("Meal Analysis (Gemini AI)", True, 
                                      f"Analysis successful - Rating: {analysis.get('rating')}, Calories: {analysis.get('total_calories')}")
                        return True
                    else:
                        self.log_result("Meal Analysis (Gemini AI)", False, 
                                      f"Missing analysis fields: {[f for f in analysis_fields if f not in analysis]}", response)
                else:
                    self.log_result("Meal Analysis (Gemini AI)", False, 
                                  f"Missing response fields: {[f for f in required_fields if f not in data]}", response)
            else:
                self.log_result("Meal Analysis (Gemini AI)", False, f"HTTP {response.status_code}", response)
                
        except Exception as e:
            self.log_result("Meal Analysis (Gemini AI)", False, f"Exception: {str(e)}")
        return False
    
    def test_meal_logging(self):
        """Test meal logging endpoint"""
        try:
            test_image = self.create_test_image("Lunch Meal")
            
            payload = {
                "user_id": TEST_USER_ID,
                "meal_type": "lunch",
                "image_base64": test_image,
                "analysis": {
                    "total_calories": 450,
                    "protein_g": 25,
                    "carbs_g": 40,
                    "fats_g": 15,
                    "rating": 3
                },
                "rating": 3
            }
            
            response = self.session.post(f"{API_BASE_URL}/meals/log", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and 'meal_id' in data:
                    self.log_result("Meal Logging", True, f"Meal logged with ID: {data['meal_id']}")
                    return True
                else:
                    self.log_result("Meal Logging", False, "Invalid response format", response)
            else:
                self.log_result("Meal Logging", False, f"HTTP {response.status_code}", response)
                
        except Exception as e:
            self.log_result("Meal Logging", False, f"Exception: {str(e)}")
        return False
    
    def test_meal_retrieval(self):
        """Test meal retrieval endpoint"""
        try:
            response = self.session.get(f"{API_BASE_URL}/meals/{TEST_USER_ID}")
            
            if response.status_code == 200:
                data = response.json()
                if 'success' in data and 'meals' in data:
                    self.log_result("Meal Retrieval", True, f"Retrieved {data.get('count', 0)} meals")
                    return True
                else:
                    self.log_result("Meal Retrieval", False, "Invalid response format", response)
            else:
                self.log_result("Meal Retrieval", False, f"HTTP {response.status_code}", response)
                
        except Exception as e:
            self.log_result("Meal Retrieval", False, f"Exception: {str(e)}")
        return False
    
    def test_step_logging(self):
        """Test step logging endpoint"""
        try:
            payload = {
                "user_id": TEST_USER_ID,
                "steps": 7500,
                "date": datetime.now().strftime("%Y-%m-%d"),
                "source": "manual"
            }
            
            response = self.session.post(f"{API_BASE_URL}/steps/log", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and 'step_id' in data:
                    self.log_result("Step Logging", True, f"Steps logged: {payload['steps']}")
                    return True
                else:
                    self.log_result("Step Logging", False, "Invalid response format", response)
            else:
                self.log_result("Step Logging", False, f"HTTP {response.status_code}", response)
                
        except Exception as e:
            self.log_result("Step Logging", False, f"Exception: {str(e)}")
        return False
    
    def test_step_retrieval(self):
        """Test step retrieval endpoint"""
        try:
            response = self.session.get(f"{API_BASE_URL}/steps/{TEST_USER_ID}")
            
            if response.status_code == 200:
                data = response.json()
                if 'success' in data and 'steps' in data:
                    self.log_result("Step Retrieval", True, f"Retrieved step data")
                    return True
                else:
                    self.log_result("Step Retrieval", False, "Invalid response format", response)
            else:
                self.log_result("Step Retrieval", False, f"HTTP {response.status_code}", response)
                
        except Exception as e:
            self.log_result("Step Retrieval", False, f"Exception: {str(e)}")
        return False
    
    def test_workout_logging(self):
        """Test workout logging endpoint"""
        try:
            payload = {
                "user_id": TEST_USER_ID,
                "workout_type": "Running",
                "duration_minutes": 30,
                "calories_burned": 300,
                "date": datetime.now().strftime("%Y-%m-%d"),
                "completed": True
            }
            
            response = self.session.post(f"{API_BASE_URL}/workouts/log", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and 'workout_id' in data:
                    self.log_result("Workout Logging", True, f"Workout logged: {payload['workout_type']}")
                    return True
                else:
                    self.log_result("Workout Logging", False, "Invalid response format", response)
            else:
                self.log_result("Workout Logging", False, f"HTTP {response.status_code}", response)
                
        except Exception as e:
            self.log_result("Workout Logging", False, f"Exception: {str(e)}")
        return False
    
    def test_workout_retrieval(self):
        """Test workout retrieval endpoint"""
        try:
            response = self.session.get(f"{API_BASE_URL}/workouts/{TEST_USER_ID}")
            
            if response.status_code == 200:
                data = response.json()
                if 'success' in data and 'workouts' in data:
                    self.log_result("Workout Retrieval", True, "Retrieved workout data")
                    return True
                else:
                    self.log_result("Workout Retrieval", False, "Invalid response format", response)
            else:
                self.log_result("Workout Retrieval", False, f"HTTP {response.status_code}", response)
                
        except Exception as e:
            self.log_result("Workout Retrieval", False, f"Exception: {str(e)}")
        return False
    
    def test_habit_creation(self):
        """Test habit creation endpoint"""
        try:
            payload = {
                "user_id": TEST_USER_ID,
                "habit_type": "custom",
                "name": "Drink 8 glasses of water",
                "target": {"glasses": 8},
                "frequency": "daily"
            }
            
            response = self.session.post(f"{API_BASE_URL}/habits/create", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and 'habit_id' in data:
                    global TEST_HABIT_ID
                    TEST_HABIT_ID = data['habit_id']
                    self.log_result("Habit Creation", True, f"Habit created: {payload['name']}")
                    return True
                else:
                    self.log_result("Habit Creation", False, "Invalid response format", response)
            else:
                self.log_result("Habit Creation", False, f"HTTP {response.status_code}", response)
                
        except Exception as e:
            self.log_result("Habit Creation", False, f"Exception: {str(e)}")
        return False
    
    def test_habit_retrieval(self):
        """Test habit retrieval endpoint"""
        try:
            response = self.session.get(f"{API_BASE_URL}/habits/{TEST_USER_ID}")
            
            if response.status_code == 200:
                data = response.json()
                if 'success' in data and 'habits' in data:
                    self.log_result("Habit Retrieval", True, "Retrieved habit data")
                    return True
                else:
                    self.log_result("Habit Retrieval", False, "Invalid response format", response)
            else:
                self.log_result("Habit Retrieval", False, f"HTTP {response.status_code}", response)
                
        except Exception as e:
            self.log_result("Habit Retrieval", False, f"Exception: {str(e)}")
        return False
    
    def test_streak_update(self):
        """Test streak update endpoint"""
        try:
            payload = {
                "user_id": TEST_USER_ID,
                "habit_id": TEST_HABIT_ID,
                "date": datetime.now().strftime("%Y-%m-%d"),
                "completed": True
            }
            
            response = self.session.post(f"{API_BASE_URL}/streaks/update", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    self.log_result("Streak Update", True, f"Streak updated - Current: {data.get('current_streak', 0)}")
                    return True
                else:
                    self.log_result("Streak Update", False, "Invalid response format", response)
            else:
                self.log_result("Streak Update", False, f"HTTP {response.status_code}", response)
                
        except Exception as e:
            self.log_result("Streak Update", False, f"Exception: {str(e)}")
        return False
    
    def test_streak_retrieval(self):
        """Test streak retrieval endpoint"""
        try:
            response = self.session.get(f"{API_BASE_URL}/streaks/{TEST_USER_ID}/{TEST_HABIT_ID}")
            
            if response.status_code == 200:
                data = response.json()
                if 'success' in data and 'current_streak' in data:
                    self.log_result("Streak Retrieval", True, f"Current streak: {data['current_streak']}")
                    return True
                else:
                    self.log_result("Streak Retrieval", False, "Invalid response format", response)
            else:
                self.log_result("Streak Retrieval", False, f"HTTP {response.status_code}", response)
                
        except Exception as e:
            self.log_result("Streak Retrieval", False, f"Exception: {str(e)}")
        return False
    
    def run_all_tests(self):
        """Run all backend API tests"""
        print("=" * 60)
        print("FITTERVERSE BACKEND API TESTING")
        print("=" * 60)
        print(f"Testing API at: {API_BASE_URL}")
        print(f"Test User ID: {TEST_USER_ID}")
        print("=" * 60)
        print()
        
        # Run tests in priority order
        tests = [
            ("Health Check", self.test_health_check),
            ("Meal Analysis (Gemini AI)", self.test_meal_analysis),
            ("Meal Logging", self.test_meal_logging),
            ("Meal Retrieval", self.test_meal_retrieval),
            ("Step Logging", self.test_step_logging),
            ("Step Retrieval", self.test_step_retrieval),
            ("Workout Logging", self.test_workout_logging),
            ("Workout Retrieval", self.test_workout_retrieval),
            ("Habit Creation", self.test_habit_creation),
            ("Habit Retrieval", self.test_habit_retrieval),
            ("Streak Update", self.test_streak_update),
            ("Streak Retrieval", self.test_streak_retrieval),
        ]
        
        for test_name, test_func in tests:
            test_func()
        
        # Print summary
        print("=" * 60)
        print("TEST SUMMARY")
        print("=" * 60)
        print(f"✅ Passed: {self.results['passed']}")
        print(f"❌ Failed: {self.results['failed']}")
        print(f"📊 Success Rate: {(self.results['passed'] / (self.results['passed'] + self.results['failed']) * 100):.1f}%")
        
        if self.results['errors']:
            print("\n🔍 FAILED TESTS DETAILS:")
            for error in self.results['errors']:
                print(f"- {error['test']}: {error['message']}")
        
        print("=" * 60)
        
        return self.results

if __name__ == "__main__":
    tester = FitterverseAPITester()
    results = tester.run_all_tests()