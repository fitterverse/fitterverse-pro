#!/bin/bash

echo "🚀 Deploying Fitterverse to Firebase..."
echo ""

# Check if firebase-tools is installed
if ! command -v firebase &> /dev/null
then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Build the frontend
echo "📦 Building React app..."
cd frontend
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please fix errors and try again."
    exit 1
fi

echo "✅ Build successful!"
echo ""

# Go back to root
cd ..

# Ask user to login
echo "🔐 Please ensure you're logged in to Firebase..."
firebase login --reauth

# Deploy
echo ""
echo "🚀 Deploying to Firebase Hosting..."
firebase deploy --only hosting

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo ""
    echo "🌐 Your app is now live at:"
    echo "   - https://fitterverse.web.app"
    echo "   - https://fitterverse.firebaseapp.com"
    echo ""
    echo "📋 Next steps:"
    echo "   1. Set up custom domain (fitterverse.in) in Firebase Console"
    echo "   2. Enable Email/Password authentication"
    echo "   3. Add fitterverse.in to authorized domains"
    echo ""
else
    echo "❌ Deployment failed! Check errors above."
    exit 1
fi
