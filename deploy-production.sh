#!/bin/bash

# Production Deployment Script for Filez
echo "🚀 Starting production deployment..."

# Check if required environment variables are set
if [ ! -f ".env.production" ]; then
    echo "❌ Error: .env.production file not found"
    echo "Please create .env.production with your production configuration"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

# Run database initialization (if needed)
echo "🗄️ Initializing database..."
npm run db:init

# Build the application
echo "🔨 Building application for production..."
npm run build:production

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "🎉 Production deployment ready!"
    echo ""
    echo "To start the production server, run:"
    echo "npm run start:production"
else
    echo "❌ Build failed!"
    exit 1
fi
