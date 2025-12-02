#!/bin/bash

echo "🚀 Setting up Citizen Safety Ecosystem..."

# Check Node.js version
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create .env files if they don't exist
if [ ! -f backend/.env ]; then
    echo "📝 Creating backend/.env from env.example..."
    cp backend/env.example backend/.env
    echo "⚠️  Please edit backend/.env and set your ADMIN_TOKEN"
fi

if [ ! -f web/.env ]; then
    echo "📝 Creating web/.env from env.example..."
    cp web/env.example web/.env
fi

# Initialize database
echo "🗄️  Initializing database..."
npm run migrate --workspace=backend

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit backend/.env and set ADMIN_TOKEN"
echo "2. Start backend: npm run dev:backend"
echo "3. Start web: npm run dev:web"
echo "4. Start mobile: npm run dev:mobile"
echo ""

