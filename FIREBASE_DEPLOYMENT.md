# 🚀 Firebase Deployment Guide for Fitterverse

## Prerequisites
- Firebase CLI installed globally: `npm install -g firebase-tools`
- Firebase project: **fitterverse** (already configured)
- Node.js and npm/yarn installed

## 📋 Step-by-Step Deployment

### Step 1: Login to Firebase
```bash
firebase login
```
This will open a browser window for authentication.

### Step 2: Initialize Firebase (Already Done)
The project is already configured with:
- `firebase.json` - Hosting and Firestore configuration
- `.firebaserc` - Project configuration
- `firestore.rules` - Security rules
- `firestore.indexes.json` - Database indexes

### Step 3: Build the React App
```bash
cd /app/frontend
npm run build
# or
yarn build
```

This creates an optimized production build in `frontend/build/`

### Step 4: Deploy to Firebase Hosting
```bash
cd /app
firebase deploy --only hosting
```

This will:
- Upload your build to Firebase Hosting
- Make it live on your Firebase subdomain: `fitterverse.web.app`

### Step 5: Deploy Firestore Rules & Indexes
```bash
firebase deploy --only firestore:rules,firestore:indexes
```

### Step 6: Set Up Custom Domain (fitterverse.in)

#### In Firebase Console:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **fitterverse**
3. Navigate to **Hosting** → **Add custom domain**
4. Enter: `fitterverse.in`
5. Firebase will provide DNS records to add

#### In Your Domain Registrar (where you bought fitterverse.in):
Add these DNS records (Firebase will show exact values):

**For root domain (fitterverse.in):**
```
Type: A
Name: @
Value: [Firebase will provide IP addresses]
```

**For www subdomain:**
```
Type: CNAME
Name: www
Value: fitterverse.web.app
```

**Wait 24-48 hours** for DNS propagation (usually faster, 1-2 hours)

### Step 7: Update Firebase Authentication
1. Go to Firebase Console → **Authentication** → **Settings** → **Authorized domains**
2. Add these domains:
   - `fitterverse.in`
   - `www.fitterverse.in`
   - `fitterverse.web.app` (already added)
3. **Enable Email/Password** sign-in method:
   - Go to **Sign-in method** tab
   - Enable **Email/Password** provider

### Step 8: Update Backend API URL (After Backend Setup)
If you keep the backend on Emergent:
1. Update `/app/frontend/.env.production`:
```env
REACT_APP_BACKEND_URL=https://your-backend-url.com
```

2. Rebuild and redeploy:
```bash
cd /app/frontend
npm run build
cd /app
firebase deploy --only hosting
```

## 🎯 Backend Options

### Option A: Keep Backend on Emergent (Recommended for now)
**Pros:** 
- Already working
- FastAPI + Gemini AI integration ready
- Easy to maintain

**Steps:**
1. Keep backend running on Emergent
2. Update CORS to allow fitterverse.in
3. Update frontend to use backend URL

**Backend CORS Update:**
```python
# In /app/backend/.env
CORS_ORIGINS=https://fitterverse.in,https://www.fitterverse.in,https://fitterverse.web.app
```

### Option B: Deploy Backend to Google Cloud Run
**Pros:**
- Fully integrated with Firebase
- Auto-scaling
- Pay-per-use

**Steps:**
1. Create `Dockerfile` for FastAPI app
2. Deploy to Cloud Run:
```bash
gcloud run deploy fitterverse-api \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```
3. Update frontend with Cloud Run URL

### Option C: Firebase Cloud Functions (Advanced)
For API endpoints that don't require FastAPI specifically.

## 🔥 Complete Deployment Commands

### First Time Deployment:
```bash
# 1. Login
firebase login

# 2. Build frontend
cd /app/frontend
npm run build

# 3. Deploy everything
cd /app
firebase deploy
```

### Subsequent Deployments:
```bash
# Just frontend
cd /app/frontend
npm run build
cd /app
firebase deploy --only hosting

# Just Firestore rules
firebase deploy --only firestore:rules

# Everything
firebase deploy
```

## ✅ Verify Deployment

After deployment, check:
1. ✅ `https://fitterverse.web.app` loads correctly
2. ✅ Sign up with email works
3. ✅ Onboarding flow completes
4. ✅ Dashboard loads
5. ✅ Camera capture works
6. ✅ Meal analysis works (backend must be running)

## 🔧 Environment Variables

### Frontend (.env.production):
```env
REACT_APP_BACKEND_URL=https://your-backend-api-url.com
REACT_APP_FIREBASE_API_KEY=AIzaSyA-rMRXQ_iSvOF8NS-PcItEGh-iQ8U-kCs
REACT_APP_FIREBASE_AUTH_DOMAIN=fitterverse.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=fitterverse
REACT_APP_FIREBASE_STORAGE_BUCKET=fitterverse.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=46698969942
REACT_APP_FIREBASE_APP_ID=1:46698969942:web:982e736a4e2223cb9734f7
REACT_APP_FIREBASE_MEASUREMENT_ID=G-BF77DDV8SD
```

### Backend (.env):
```env
EMERGENT_LLM_KEY=sk-emergent-97bDb1fC4Ee645e92B
FIREBASE_PROJECT_ID=fitterverse
CORS_ORIGINS=https://fitterverse.in,https://www.fitterverse.in,https://fitterverse.web.app
```

## 🐛 Troubleshooting

### Build Fails
```bash
cd /app/frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Custom Domain Not Working
- Wait 24-48 hours for DNS propagation
- Verify DNS records in your domain registrar
- Check Firebase Console → Hosting → Connect domain status

### Authentication Fails
- Ensure Email/Password is enabled in Firebase Console
- Check that fitterverse.in is in authorized domains
- Clear browser cache and cookies

### Backend Not Connecting
- Verify CORS settings in backend
- Check REACT_APP_BACKEND_URL is correct
- Test backend endpoint directly with curl

## 📱 Testing Checklist

After deployment to fitterverse.in:
- [ ] Landing page loads
- [ ] Sign up with email (test@example.com / test123)
- [ ] Complete onboarding flow
- [ ] Dashboard shows 3 habit cards
- [ ] Camera capture opens
- [ ] Meal photo uploads
- [ ] AI analysis returns results
- [ ] Step logging works
- [ ] Workout logging works
- [ ] Mobile responsive works

## 🎉 Success!

Once deployed, your app will be live at:
- **Primary:** https://fitterverse.in
- **Firebase:** https://fitterverse.web.app

Next steps:
1. Test all features
2. Monitor Firebase Usage & Quotas
3. Set up Firebase Analytics
4. Configure Firebase Performance Monitoring
5. Add more features!
