import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Activity, Apple, Dumbbell, Plus, LogOut, Camera, TrendingUp, Flame } from 'lucide-react';
import CameraCapture from '../components/CameraCapture';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = () => {
  const { currentUser, userProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [showCamera, setShowCamera] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [todayData, setTodayData] = useState({
    steps: 0,
    meals: { breakfast: null, lunch: null, dinner: null },
    workout: null
  });

  useEffect(() => {
    if (!userProfile?.onboardingCompleted) {
      navigate('/onboarding');
    }
  }, [userProfile, navigate]);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleCaptureMeal = (mealType) => {
    setSelectedMealType(mealType);
    setShowCamera(true);
  };

  const handleImageCapture = async (base64Image) => {
    setAnalyzing(true);
    setShowCamera(false);
    
    try {
      const response = await axios.post(`${API}/meals/analyze`, {
        image_base64: base64Image,
        meal_type: selectedMealType,
        user_profile: userProfile
      }, {
        timeout: 30000
      });

      if (response.data.success) {
        setAnalysisResult({
          ...response.data.analysis,
          meal_type: selectedMealType,
          image: `data:image/jpeg;base64,${base64Image}`
        });
        
        // Update today's data
        setTodayData(prev => ({
          ...prev,
          meals: {
            ...prev.meals,
            [selectedMealType]: response.data.analysis
          }
        }));
      }
    } catch (error) {
      console.error('Meal analysis error:', error);
      alert('Failed to analyze meal. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleLogSteps = () => {
    const steps = prompt('Enter your steps for today:');
    if (steps && !isNaN(steps)) {
      setTodayData(prev => ({ ...prev, steps: parseInt(steps) }));
    }
  };

  const handleLogWorkout = () => {
    const workoutType = prompt('Enter workout type (e.g., Running, Gym, Yoga):');
    if (workoutType) {
      setTodayData(prev => ({ ...prev, workout: { type: workoutType, completed: true } }));
    }
  };

  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Fitterverse
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Welcome back, {currentUser?.displayName || 'Champion'}!
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Today's Overview */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Today's Progress</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              icon={<Activity className="w-6 h-6 text-blue-500" />}
              label="Steps"
              value={todayData.steps.toLocaleString()}
              target={userProfile.targetSteps}
            />
            <StatCard
              icon={<Apple className="w-6 h-6 text-green-500" />}
              label="Meals Logged"
              value={Object.values(todayData.meals).filter(m => m).length}
              target={3}
            />
            <StatCard
              icon={<Flame className="w-6 h-6 text-orange-500" />}
              label="Workout"
              value={todayData.workout ? 'Done' : 'Pending'}
              showProgress={false}
            />
          </div>
        </div>

        {/* Mini Habit Cards */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Your Habits</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Walking Card */}
            <MiniHabitCard
              icon={<Activity className="w-8 h-8 text-blue-500" />}
              title="Walking"
              streak={5}
              target={`${userProfile.targetSteps || 7000} steps/day`}
              current={todayData.steps}
              percentage={(todayData.steps / (userProfile.targetSteps || 7000)) * 100}
              onAction={handleLogSteps}
              actionLabel="Log Steps"
            />

            {/* Diet Card */}
            <MiniHabitCard
              icon={<Apple className="w-8 h-8 text-green-500" />}
              title="Healthy Diet"
              streak={7}
              target="3 meals/day"
              current={Object.values(todayData.meals).filter(m => m).length}
              percentage={(Object.values(todayData.meals).filter(m => m).length / 3) * 100}
              onAction={() => {}}
              actionLabel="Log Meal"
              customActions={() => (
                <div className="grid grid-cols-3 gap-2 mt-3">
                  <button
                    onClick={() => handleCaptureMeal('breakfast')}
                    disabled={!!todayData.meals.breakfast}
                    className={`px-3 py-2 text-xs rounded-lg transition ${
                      todayData.meals.breakfast
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {todayData.meals.breakfast ? '✓ B' : 'Breakfast'}
                  </button>
                  <button
                    onClick={() => handleCaptureMeal('lunch')}
                    disabled={!!todayData.meals.lunch}
                    className={`px-3 py-2 text-xs rounded-lg transition ${
                      todayData.meals.lunch
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {todayData.meals.lunch ? '✓ L' : 'Lunch'}
                  </button>
                  <button
                    onClick={() => handleCaptureMeal('dinner')}
                    disabled={!!todayData.meals.dinner}
                    className={`px-3 py-2 text-xs rounded-lg transition ${
                      todayData.meals.dinner
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {todayData.meals.dinner ? '✓ D' : 'Dinner'}
                  </button>
                </div>
              )}
            />

            {/* Workout Card */}
            <MiniHabitCard
              icon={<Dumbbell className="w-8 h-8 text-purple-500" />}
              title="Workout"
              streak={3}
              target={`${userProfile.targetWorkoutDays || 3}×/week`}
              current={todayData.workout ? 1 : 0}
              percentage={todayData.workout ? 100 : 0}
              onAction={handleLogWorkout}
              actionLabel={todayData.workout ? '✓ Done' : 'Log Workout'}
            />
          </div>
        </div>

        {/* Analysis Result */}
        {analysisResult && (
          <div className="mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Meal Analysis: {analysisResult.meal_type}</h3>
                <button
                  onClick={() => setAnalysisResult(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <img
                    src={analysisResult.image}
                    alt="Meal"
                    className="w-full rounded-xl"
                  />
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-gray-600">Rating:</span>
                      <div className="flex gap-1">
                        {[1, 2, 3].map(i => (
                          <div
                            key={i}
                            className={`w-6 h-6 rounded-full ${
                              i <= (analysisResult.rating || 0) ? 'bg-green-500' : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-xl">
                      <p className="text-sm text-gray-600">Calories</p>
                      <p className="text-2xl font-bold">{analysisResult.total_calories || 0}</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-xl">
                      <p className="text-sm text-gray-600">Protein</p>
                      <p className="text-2xl font-bold">{analysisResult.protein_g || 0}g</p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-xl">
                      <p className="text-sm text-gray-600">Carbs</p>
                      <p className="text-2xl font-bold">{analysisResult.carbs_g || 0}g</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-xl">
                      <p className="text-sm text-gray-600">Fats</p>
                      <p className="text-2xl font-bold">{analysisResult.fats_g || 0}g</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">AI Suggestions:</p>
                    <p className="text-sm text-gray-700">{analysisResult.suggestions || analysisResult.detailed_analysis}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analyzing Loader */}
        {analyzing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
                <h3 className="text-xl font-bold mb-2">Analyzing your meal...</h3>
                <p className="text-gray-600">Our AI is calculating nutrition details</p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickActionCard
            icon={<TrendingUp className="w-6 h-6" />}
            label="View Analytics"
            onClick={() => alert('Analytics coming soon!')}
          />
          <QuickActionCard
            icon={<Plus className="w-6 h-6" />}
            label="Add Custom Habit"
            onClick={() => alert('Custom habits coming soon!')}
          />
          <QuickActionCard
            icon={<Camera className="w-6 h-6" />}
            label="Scan Meal"
            onClick={() => handleCaptureMeal('snack')}
          />
          <QuickActionCard
            icon={<Dumbbell className="w-6 h-6" />}
            label="Workout Plans"
            onClick={() => alert('Workout plans coming soon!')}
          />
        </div>
      </main>

      {/* Camera Modal */}
      {showCamera && (
        <CameraCapture
          onCapture={handleImageCapture}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  );
};

// Helper Components
const StatCard = ({ icon, label, value, target, showProgress = true }) => (
  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-gray-50 rounded-lg">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-600">{label}</p>
        <p className="text-xl font-bold">{value}</p>
        {showProgress && target && (
          <p className="text-xs text-gray-500">Target: {target}</p>
        )}
      </div>
    </div>
  </div>
);

const MiniHabitCard = ({ icon, title, streak, target, current, percentage, onAction, actionLabel, customActions }) => (
  <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 hover:shadow-lg transition">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        {icon}
        <h3 className="font-bold text-lg">{title}</h3>
      </div>
      <div className="text-right">
        <p className="text-xs text-gray-500">Streak</p>
        <p className="text-lg font-bold text-orange-500">{streak} 🔥</p>
      </div>
    </div>

    <div className="mb-4">
      <div className="flex justify-between text-sm mb-2">
        <span className="text-gray-600">Progress</span>
        <span className="font-medium">{Math.min(percentage, 100).toFixed(0)}%</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300"
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <p className="text-xs text-gray-500 mt-2">{target}</p>
    </div>

    {customActions ? (
      customActions()
    ) : (
      <button
        onClick={onAction}
        className="w-full py-2 bg-gradient-to-r from-gray-700 to-black text-white rounded-xl hover:opacity-90 transition font-medium"
      >
        {actionLabel}
      </button>
    )}
  </div>
);

const QuickActionCard = ({ icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition text-left"
  >
    <div className="p-2 bg-gray-50 rounded-lg w-fit mb-2">
      {icon}
    </div>
    <p className="text-sm font-medium">{label}</p>
  </button>
);

export default Dashboard;
