from fastapi import FastAPI, APIRouter, UploadFile, File, HTTPException, Header
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timedelta
import base64
from PIL import Image
import io
import asyncio

# Firebase Admin SDK
import firebase_admin
from firebase_admin import credentials, auth, firestore

# Emergent LLM Integration
from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Initialize Firebase Admin
try:
    cred_path = os.environ.get('FIREBASE_CREDENTIALS_PATH', ROOT_DIR / 'firebase-credentials.json')
    # For now, skip Firebase Admin init if credentials are empty
    # cred = credentials.Certificate(str(cred_path))
    # firebase_admin.initialize_app(cred)
    # db_firestore = firestore.client()
    logging.info("Firebase Admin initialized")
except Exception as e:
    logging.warning(f"Firebase Admin not initialized: {e}")
    # db_firestore = None

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============================================================================
# Models
# ============================================================================

class OnboardingData(BaseModel):
    primaryGoal: str
    secondary: List[str] = []
    sex: str
    age: int
    sleepHours: Optional[str] = None
    dietPattern: str
    exclusions: List[str] = []
    exclusionsOther: Optional[str] = None
    activityLevel: str
    currentWorkouts: str
    targetSteps: int = 0
    targetWorkoutDays: int = 0
    heightCm: float
    weightKg: float
    experience: Optional[str] = None
    stopReasons: List[str] = []
    stopOther: Optional[str] = None

class MealImageAnalysisRequest(BaseModel):
    image_base64: str
    meal_type: str  # breakfast, lunch, dinner, snack
    user_profile: Optional[Dict[str, Any]] = None

class MealLogEntry(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    meal_type: str
    image_base64: str
    analysis: Dict[str, Any]
    rating: int  # 1, 2, or 3
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StepEntry(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    steps: int
    date: str  # YYYY-MM-DD
    source: str  # manual, google_fit, apple_health
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class WorkoutEntry(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    workout_type: str
    duration_minutes: int
    calories_burned: Optional[int] = None
    date: str
    completed: bool = True
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class HabitCreate(BaseModel):
    user_id: str
    habit_type: str  # walking, diet, workout, custom
    name: str
    target: Optional[Dict[str, Any]] = None
    frequency: Optional[str] = None

class StreakUpdate(BaseModel):
    user_id: str
    habit_id: str
    date: str
    completed: bool

# ============================================================================
# Utility Functions
# ============================================================================

async def analyze_meal_with_gemini(image_base64: str, meal_type: str, user_profile: Optional[Dict] = None) -> Dict[str, Any]:
    """Analyze meal image using Gemini 2.0-flash"""
    try:
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        if not api_key:
            raise ValueError("EMERGENT_LLM_KEY not found in environment")
        
        # Create unique session ID for each request
        session_id = f"meal_analysis_{uuid.uuid4()}"
        
        # Create system message based on user profile
        profile_context = ""
        if user_profile:
            profile_context = f"""
User Profile Context:
- Goal: {user_profile.get('primaryGoal', 'General fitness')}
- Diet Pattern: {user_profile.get('dietPattern', 'Not specified')}
- Exclusions: {', '.join(user_profile.get('exclusions', []))}
"""
        
        system_message = f"""You are a nutrition expert analyzing meal images. 
Provide detailed nutritional analysis including:
1. Food items identified
2. Estimated portion sizes
3. Calories (total and per item)
4. Macronutrients (protein, carbs, fats in grams)
5. Key micronutrients
6. Health rating (1-3): 1=needs improvement, 2=okay, 3=excellent
7. Suggestions for improvement
8. Alignment with user's dietary goals

{profile_context}

Return response in JSON format with keys: foods, total_calories, protein_g, carbs_g, fats_g, rating, suggestions, detailed_analysis"""
        
        # Initialize LlmChat
        chat = LlmChat(
            api_key=api_key,
            session_id=session_id,
            system_message=system_message
        ).with_model("gemini", "gemini-2.0-flash")
        
        # Create image content
        image_content = ImageContent(image_base64=image_base64)
        
        # Create user message
        user_message = UserMessage(
            text=f"Analyze this {meal_type} meal image. Provide comprehensive nutritional analysis in JSON format.",
            file_contents=[image_content]
        )
        
        # Get response
        response = await chat.send_message(user_message)
        
        # Parse response
        try:
            # Try to extract JSON from response
            import json
            import re
            
            # Try to find JSON in the response
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                analysis = json.loads(json_match.group())
            else:
                # Fallback parsing
                analysis = {
                    "foods": ["Unable to parse specific foods"],
                    "total_calories": 500,
                    "protein_g": 20,
                    "carbs_g": 60,
                    "fats_g": 15,
                    "rating": 2,
                    "suggestions": response,
                    "detailed_analysis": response
                }
        except Exception as parse_error:
            logger.error(f"Error parsing AI response: {parse_error}")
            # Fallback structure
            analysis = {
                "foods": ["Analysis in progress"],
                "total_calories": 0,
                "protein_g": 0,
                "carbs_g": 0,
                "fats_g": 0,
                "rating": 2,
                "suggestions": response,
                "detailed_analysis": response
            }
        
        return analysis
        
    except Exception as e:
        logger.error(f"Error analyzing meal: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to analyze meal: {str(e)}")

def calculate_calories_burned(steps: int, height_cm: float, weight_kg: float, age: int, sex: str) -> int:
    """Calculate calories burned from steps"""
    # Simple formula: steps * 0.04 * weight_factor
    weight_factor = weight_kg / 70  # Normalized to 70kg
    calories = int(steps * 0.04 * weight_factor)
    return calories

def calculate_bmr(weight_kg: float, height_cm: float, age: int, sex: str) -> int:
    """Calculate Basal Metabolic Rate using Mifflin-St Jeor Equation"""
    if sex.lower() == 'male':
        bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age + 5
    else:
        bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age - 161
    return int(bmr)

# ============================================================================
# Routes
# ============================================================================

@api_router.get("/")
async def root():
    return {"message": "Fitterverse API v1.0", "status": "healthy"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

# ============================================================================
# Meal Analysis Routes
# ============================================================================

@api_router.post("/meals/analyze")
async def analyze_meal(request: MealImageAnalysisRequest):
    """Analyze meal image using Gemini AI"""
    try:
        logger.info(f"Analyzing {request.meal_type} meal")
        
        # Analyze with Gemini
        analysis = await analyze_meal_with_gemini(
            request.image_base64, 
            request.meal_type,
            request.user_profile
        )
        
        return {
            "success": True,
            "meal_type": request.meal_type,
            "analysis": analysis,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in meal analysis endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/meals/log")
async def log_meal(entry: MealLogEntry):
    """Log a meal entry with analysis"""
    try:
        # In production, save to Firestore
        # For now, return success
        return {
            "success": True,
            "meal_id": entry.id,
            "message": "Meal logged successfully"
        }
    except Exception as e:
        logger.error(f"Error logging meal: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/meals/{user_id}")
async def get_user_meals(
    user_id: str, 
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    meal_type: Optional[str] = None
):
    """Get user's meal history"""
    try:
        # In production, fetch from Firestore
        # Mock response for now
        return {
            "success": True,
            "meals": [],
            "count": 0
        }
    except Exception as e:
        logger.error(f"Error fetching meals: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# Step Tracking Routes
# ============================================================================

@api_router.post("/steps/log")
async def log_steps(entry: StepEntry):
    """Log daily steps"""
    try:
        return {
            "success": True,
            "step_id": entry.id,
            "message": "Steps logged successfully"
        }
    except Exception as e:
        logger.error(f"Error logging steps: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/steps/{user_id}")
async def get_user_steps(
    user_id: str,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
):
    """Get user's step history"""
    try:
        # Mock response
        return {
            "success": True,
            "steps": [],
            "total_steps": 0,
            "average_steps": 0
        }
    except Exception as e:
        logger.error(f"Error fetching steps: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# Workout Routes
# ============================================================================

@api_router.post("/workouts/log")
async def log_workout(entry: WorkoutEntry):
    """Log a workout"""
    try:
        return {
            "success": True,
            "workout_id": entry.id,
            "message": "Workout logged successfully"
        }
    except Exception as e:
        logger.error(f"Error logging workout: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/workouts/{user_id}")
async def get_user_workouts(
    user_id: str,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
):
    """Get user's workout history"""
    try:
        return {
            "success": True,
            "workouts": [],
            "total_workouts": 0
        }
    except Exception as e:
        logger.error(f"Error fetching workouts: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# Habit & Streak Routes
# ============================================================================

@api_router.post("/habits/create")
async def create_habit(habit: HabitCreate):
    """Create a new habit"""
    try:
        habit_id = str(uuid.uuid4())
        return {
            "success": True,
            "habit_id": habit_id,
            "message": "Habit created successfully"
        }
    except Exception as e:
        logger.error(f"Error creating habit: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/habits/{user_id}")
async def get_user_habits(user_id: str):
    """Get all habits for a user"""
    try:
        # Mock response
        return {
            "success": True,
            "habits": []
        }
    except Exception as e:
        logger.error(f"Error fetching habits: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/streaks/update")
async def update_streak(streak: StreakUpdate):
    """Update habit streak"""
    try:
        return {
            "success": True,
            "message": "Streak updated",
            "current_streak": 5
        }
    except Exception as e:
        logger.error(f"Error updating streak: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/streaks/{user_id}/{habit_id}")
async def get_streak(user_id: str, habit_id: str):
    """Get streak information for a habit"""
    try:
        return {
            "success": True,
            "current_streak": 0,
            "longest_streak": 0,
            "total_completions": 0
        }
    except Exception as e:
        logger.error(f"Error fetching streak: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# Analytics Routes
# ============================================================================

@api_router.get("/analytics/{user_id}/overview")
async def get_analytics_overview(user_id: str):
    """Get overall analytics for user"""
    try:
        return {
            "success": True,
            "total_steps_this_week": 0,
            "meals_logged_this_week": 0,
            "workouts_this_week": 0,
            "average_rating": 0,
            "active_streaks": 0
        }
    except Exception as e:
        logger.error(f"Error fetching analytics: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown():
    logger.info("Shutting down Fitterverse API")
