import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Activity, Target, TrendingUp, Flame } from 'lucide-react';

const Landing = () => {
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('signin'); // 'signin' or 'signup'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const navigate = useNavigate();
  const { signInWithGoogle, signInWithApple, signUpWithEmail, signInWithEmail, currentUser } = useAuth();

  React.useEffect(() => {
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError('');
      await signInWithGoogle();
      navigate('/onboarding');
    } catch (error) {
      setError('Failed to sign in with Google');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      setLoading(true);
      setError('');
      await signInWithApple();
      navigate('/onboarding');
    } catch (error) {
      setError('Failed to sign in with Apple');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Fitterverse
            </h1>
            <p className="text-2xl md:text-3xl text-gray-700 mb-4">
              Your Journey to the Fittest Version of Yourself
            </p>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Track habits, analyze meals with AI, monitor progress with personalized insights
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={() => setShowAuth(true)}
              className="btn-primary px-8 py-4 text-lg"
              disabled={loading}
            >
              Get Started Free
            </button>
            <button
              onClick={() => {
                const features = document.getElementById('features');
                features?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="btn-secondary px-8 py-4 text-lg"
            >
              Learn More
            </button>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
            <FeatureCard
              icon={<Activity className="w-8 h-8 text-blue-500" />}
              title="Smart Tracking"
              description="Automatic step counting and workout logging"
            />
            <FeatureCard
              icon={<Flame className="w-8 h-8 text-orange-500" />}
              title="AI Meal Analysis"
              description="Scan meals and get instant nutritional insights"
            />
            <FeatureCard
              icon={<Target className="w-8 h-8 text-green-500" />}
              title="Habit Streaks"
              description="Build consistency with flexible streak tracking"
            />
            <FeatureCard
              icon={<TrendingUp className="w-8 h-8 text-purple-500" />}
              title="Analytics"
              description="Visualize progress with detailed dashboards"
            />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Everything You Need</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card">
              <h3 className="text-xl font-semibold mb-3">Walking Tracker</h3>
              <p className="text-gray-600">
                Track daily steps automatically or manually. View analytics, calories burned, and maintain streaks.
              </p>
            </div>
            <div className="card">
              <h3 className="text-xl font-semibold mb-3">Smart Diet Logging</h3>
              <p className="text-gray-600">
                Capture meal photos and get AI-powered nutritional analysis. Track breakfast, lunch, and dinner.
              </p>
            </div>
            <div className="card">
              <h3 className="text-xl font-semibold mb-3">Workout Manager</h3>
              <p className="text-gray-600">
                Log workouts, track types and duration. See your consistency and progress over time.
              </p>
            </div>
            <div className="card">
              <h3 className="text-xl font-semibold mb-3">Custom Habits</h3>
              <p className="text-gray-600">
                Build new habits or break old ones. Track anything you want with customizable goals.
              </p>
            </div>
            <div className="card">
              <h3 className="text-xl font-semibold mb-3">Personalized Insights</h3>
              <p className="text-gray-600">
                Get tailored tips, recipes, and workout plans based on your goals and profile.
              </p>
            </div>
            <div className="card">
              <h3 className="text-xl font-semibold mb-3">Detailed Analytics</h3>
              <p className="text-gray-600">
                Beautiful charts and graphs to visualize your progress and stay motivated.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of users building healthier habits every day
          </p>
          <button
            onClick={() => setShowAuth(true)}
            className="btn-primary px-12 py-4 text-lg"
          >
            Start Your Journey
          </button>
        </div>
      </section>

      {/* Auth Modal */}
      {showAuth && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2">Welcome to Fitterverse</h3>
              <p className="text-gray-600">Sign in to get started</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 p-4 border-2 border-gray-300 rounded-xl hover:border-gray-400 transition disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="font-medium">Continue with Google</span>
              </button>

              <button
                onClick={handleAppleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 p-4 bg-black text-white rounded-xl hover:bg-gray-800 transition disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                <span className="font-medium">Continue with Apple</span>
              </button>

              <div className="text-center text-sm text-gray-500 mt-4">
                Phone OTP coming soon
              </div>
            </div>

            <button
              onClick={() => {
                setShowAuth(false);
                setError('');
              }}
              className="mt-6 w-full p-3 text-gray-600 hover:text-gray-900 transition"
            >
              Cancel
            </button>

            <p className="mt-6 text-xs text-center text-gray-500">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      )}

      <div id="recaptcha-container"></div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div className="text-center p-6 bg-white bg-opacity-60 rounded-2xl backdrop-blur-sm">
    <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4 shadow-md">
      {icon}
    </div>
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-sm text-gray-600">{description}</p>
  </div>
);

export default Landing;
