import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

const Onboarding = () => {
  const { currentUser, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    primaryGoal: '',
    secondary: [],
    sex: '',
    age: '',
    sleepHours: '',
    dietPattern: '',
    exclusions: [],
    activityLevel: '',
    currentWorkouts: '',
    targetSteps: 7000,
    targetWorkoutDays: 3,
    heightCm: '',
    weightKg: '',
    experience: '',
    stopReasons: []
  });

  useEffect(() => {
    if (!currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const steps = [
    'goal', 'secondary', 'sex', 'age', 'sleep', 'diet', 'activity', 
    'workouts', 'targets', 'physical', 'experience', 'review'
  ];

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleMultiple = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleNext = () => {
    if (step < steps.length - 1) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleFinish = async () => {
    if (!currentUser) return;
    
    setSaving(true);
    try {
      const profileData = {
        ...formData,
        age: parseInt(formData.age) || 0,
        heightCm: parseFloat(formData.heightCm) || 0,
        weightKg: parseFloat(formData.weightKg) || 0,
        onboardingCompleted: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await updateUserProfile(currentUser.uid, profileData);
      
      // Create default habits
      const habitsRef = doc(db, 'user_habits', currentUser.uid);
      await setDoc(habitsRef, {
        walking: {
          type: 'walking',
          name: 'Walking',
          target: formData.targetSteps,
          active: formData.targetSteps > 0
        },
        diet: {
          type: 'diet',
          name: 'Healthy Diet',
          active: true
        },
        workout: {
          type: 'workout',
          name: 'Workout',
          target: formData.targetWorkoutDays,
          active: formData.targetWorkoutDays > 0
        }
      }, { merge: true });

      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const progress = ((step + 1) / steps.length) * 100;

  const renderStep = () => {
    const currentStep = steps[step];

    switch (currentStep) {
      case 'goal':
        return (
          <StepContainer title="What's your main goal?" subtitle="You can change this later">
            <OptionList
              value={formData.primaryGoal}
              onChange={(v) => updateField('primaryGoal', v)}
              options={[
                'Lose fat',
                'Build muscle',
                'General fitness',
                'Manage PCOS',
                'Manage Diabetes',
                'Manage Thyroid'
              ]}
            />
          </StepContainer>
        );

      case 'secondary':
        return (
          <StepContainer title="Secondary focus" subtitle="Pick what matters right now">
            <MultiSelect
              values={formData.secondary}
              onToggle={(v) => toggleMultiple('secondary', v)}
              options={[
                'Energy & sleep',
                'Mobility/flexibility',
                'Cardio fitness',
                'Stress reduction',
                'Habit consistency'
              ]}
            />
          </StepContainer>
        );

      case 'sex':
        return (
          <StepContainer title="Sex" subtitle="Used only to personalize nutrition">
            <OptionList
              value={formData.sex}
              onChange={(v) => updateField('sex', v)}
              options={['Male', 'Female', 'Prefer not to say']}
            />
          </StepContainer>
        );

      case 'age':
        return (
          <StepContainer title="Age" subtitle="Helps personalize recovery tips">
            <input
              type="number"
              value={formData.age}
              onChange={(e) => updateField('age', e.target.value)}
              placeholder="Enter your age"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
            />
          </StepContainer>
        );

      case 'sleep':
        return (
          <StepContainer title="Average Sleep Hours" subtitle="How many hours do you sleep per night?">
            <OptionList
              value={formData.sleepHours}
              onChange={(v) => updateField('sleepHours', v)}
              options={[
                'Less than 5 hours',
                '5-6 hours',
                '6-7 hours',
                '7-8 hours',
                '8+ hours'
              ]}
            />
          </StepContainer>
        );

      case 'diet':
        return (
          <StepContainer title="Diet Pattern" subtitle="We'll match recipes and foods to avoid">
            <OptionList
              value={formData.dietPattern}
              onChange={(v) => updateField('dietPattern', v)}
              options={['Vegetarian', 'Eggetarian', 'Non-veg', 'Vegan', 'Jain']}
            />
            <div className="mt-6">
              <p className="text-sm text-gray-600 mb-3">Exclusions (optional)</p>
              <MultiSelect
                values={formData.exclusions}
                onToggle={(v) => toggleMultiple('exclusions', v)}
                options={[
                  'No eggs',
                  'No onion/garlic',
                  'Lactose-free',
                  'Gluten-free',
                  'Nut allergy'
                ]}
              />
            </div>
          </StepContainer>
        );

      case 'activity':
        return (
          <StepContainer title="Current Activity" subtitle="A rough guess is okay">
            <OptionList
              value={formData.activityLevel}
              onChange={(v) => updateField('activityLevel', v)}
              options={[
                'Sedentary (<5k steps)',
                'Light (5-7k steps)',
                'Moderate (7-10k steps)',
                'Active (10k+ steps)',
                'Very active'
              ]}
            />
          </StepContainer>
        );

      case 'workouts':
        return (
          <StepContainer title="Current Workouts" subtitle="Be honest—this helps us right-size your plan">
            <OptionList
              value={formData.currentWorkouts}
              onChange={(v) => updateField('currentWorkouts', v)}
              options={['None', '≤1×/week', '2-3×/week', '4-5×/week', '6-7×/week']}
            />
          </StepContainer>
        );

      case 'targets':
        return (
          <StepContainer title="Week One Targets" subtitle="Pick what's realistic">
            <div className="space-y-6">
              <div>
                <p className="text-sm text-gray-600 mb-3">Walking target</p>
                <OptionList
                  value={String(formData.targetSteps)}
                  onChange={(v) => updateField('targetSteps', parseInt(v))}
                  options={[
                    { label: 'None', value: '0' },
                    { label: '5,000 steps', value: '5000' },
                    { label: '7,000 steps', value: '7000' },
                    { label: '10,000 steps', value: '10000' }
                  ]}
                />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-3">Workout days per week</p>
                <OptionList
                  value={String(formData.targetWorkoutDays)}
                  onChange={(v) => updateField('targetWorkoutDays', parseInt(v))}
                  options={[
                    { label: 'None', value: '0' },
                    { label: '2 days', value: '2' },
                    { label: '3 days', value: '3' },
                    { label: '4 days', value: '4' },
                    { label: '5 days', value: '5' }
                  ]}
                />
              </div>
            </div>
          </StepContainer>
        );

      case 'physical':
        return (
          <StepContainer title="Physical Stats" subtitle="Used to personalize your plan">
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-2">Height (cm)</label>
                <input
                  type="number"
                  value={formData.heightCm}
                  onChange={(e) => updateField('heightCm', e.target.value)}
                  placeholder="e.g., 170"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">Weight (kg)</label>
                <input
                  type="number"
                  value={formData.weightKg}
                  onChange={(e) => updateField('weightKg', e.target.value)}
                  placeholder="e.g., 70"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </StepContainer>
        );

      case 'experience':
        return (
          <StepContainer title="Have you tried before?" subtitle="Helps us tailor support">
            <OptionList
              value={formData.experience}
              onChange={(v) => updateField('experience', v)}
              options={[
                'First time',
                'Tried on my own',
                'Program/coach',
                'Used apps',
                'On & off'
              ]}
            />
            <div className="mt-6">
              <p className="text-sm text-gray-600 mb-3">What usually gets in the way?</p>
              <MultiSelect
                values={formData.stopReasons}
                onToggle={(v) => toggleMultiple('stopReasons', v)}
                options={[
                  'Time/energy',
                  'Travel/routine',
                  'Boring meals',
                  'Soreness/injury',
                  'Motivation dips',
                  'Nothing — I\'m all in'
                ]}
              />
            </div>
          </StepContainer>
        );

      case 'review':
        return (
          <StepContainer title="Review & Finish" subtitle="Your personalized plan is ready">
            <div className="space-y-4 bg-gray-50 p-6 rounded-xl">
              <ReviewItem label="Goal" value={formData.primaryGoal} />
              <ReviewItem label="Sex" value={formData.sex} />
              <ReviewItem label="Age" value={formData.age} />
              <ReviewItem label="Sleep" value={formData.sleepHours} />
              <ReviewItem label="Diet" value={formData.dietPattern} />
              <ReviewItem label="Activity" value={formData.activityLevel} />
              <ReviewItem label="Walking Target" value={`${formData.targetSteps} steps`} />
              <ReviewItem label="Workout Target" value={`${formData.targetWorkoutDays} days/week`} />
              <ReviewItem label="Height" value={`${formData.heightCm} cm`} />
              <ReviewItem label="Weight" value={`${formData.weightKg} kg`} />
            </div>
          </StepContainer>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-2 text-sm text-gray-600 text-center">
            Step {step + 1} of {steps.length}
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {renderStep()}

          {/* Navigation */}
          <div className="flex gap-4 mt-8">
            {step > 0 && (
              <button
                onClick={handleBack}
                className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition"
              >
                Back
              </button>
            )}
            {step < steps.length - 1 ? (
              <button
                onClick={handleNext}
                className="flex-1 btn-primary"
                disabled={!isStepValid(steps[step], formData)}
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleFinish}
                className="flex-1 btn-primary"
                disabled={saving || !isStepValid('review', formData)}
              >
                {saving ? 'Saving...' : 'Finish Setup'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const StepContainer = ({ title, subtitle, children }) => (
  <div>
    <h2 className="text-2xl font-bold mb-2">{title}</h2>
    {subtitle && <p className="text-gray-600 mb-6">{subtitle}</p>}
    {children}
  </div>
);

const OptionList = ({ value, onChange, options }) => (
  <div className="space-y-2">
    {options.map((option) => {
      const optValue = typeof option === 'string' ? option : option.value;
      const optLabel = typeof option === 'string' ? option : option.label;
      const isSelected = value === optValue;
      
      return (
        <button
          key={optValue}
          onClick={() => onChange(optValue)}
          className={`w-full px-4 py-3 rounded-xl border-2 text-left transition ${
            isSelected
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          {optLabel}
        </button>
      );
    })}
  </div>
);

const MultiSelect = ({ values, onToggle, options }) => (
  <div className="space-y-2">
    {options.map((option) => {
      const isSelected = values.includes(option);
      
      return (
        <button
          key={option}
          onClick={() => onToggle(option)}
          className={`w-full px-4 py-3 rounded-xl border-2 text-left transition ${
            isSelected
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          {option}
        </button>
      );
    })}
  </div>
);

const ReviewItem = ({ label, value }) => (
  <div className="flex justify-between items-center">
    <span className="text-gray-600">{label}:</span>
    <span className="font-medium">{value || '—'}</span>
  </div>
);

// Validation
const isStepValid = (step, data) => {
  switch (step) {
    case 'goal':
      return !!data.primaryGoal;
    case 'secondary':
      return true;
    case 'sex':
      return !!data.sex;
    case 'age':
      return data.age && parseInt(data.age) > 0;
    case 'sleep':
      return !!data.sleepHours;
    case 'diet':
      return !!data.dietPattern;
    case 'activity':
      return !!data.activityLevel;
    case 'workouts':
      return !!data.currentWorkouts;
    case 'targets':
      return true;
    case 'physical':
      return data.heightCm && data.weightKg && parseFloat(data.heightCm) > 0 && parseFloat(data.weightKg) > 0;
    case 'experience':
      return !!data.experience;
    case 'review':
      return data.primaryGoal && data.sex && data.age && data.sleepHours && data.dietPattern && data.activityLevel && data.currentWorkouts && data.heightCm && data.weightKg && data.experience;
    default:
      return true;
  }
};

export default Onboarding;
