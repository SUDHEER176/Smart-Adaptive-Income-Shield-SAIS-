#!/bin/bash
# GigShield AI+ - Quick Start Script
# Copy this to your project root and run: bash quickstart.sh

echo "🛡️ GigShield AI+ - Quick Start"
echo "=============================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Install from https://nodejs.org/"
    exit 1
fi
echo "✅ Node.js found: $(node --version)"

# Check MongoDB
if ! command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB not found. Install or use MongoDB Atlas"
fi
echo ""

# Install Backend Dependencies
echo "📦 Installing backend dependencies..."
cd server || exit
npm install
echo "✅ Backend dependencies installed"
echo ""

# Install Frontend Dependencies
echo "📦 Installing frontend dependencies..."
cd ../client || exit
npm install
echo "✅ Frontend dependencies installed"
echo ""

# Create .env file if not exists
echo "🔧 Setting up environment variables..."
if [ ! -f ../server/.env ]; then
    cat > ../server/.env << EOF
MONGO_URI=mongodb://localhost:27017/gigshield
PORT=5000
JWT_SECRET=gigshield_secret_key_2024
NODE_ENV=development
EOF
    echo "✅ Created .env file"
else
    echo "ℹ️  .env file already exists"
fi
echo ""

echo "🚀 SETUP COMPLETE!"
echo ""
echo "To start the application:"
echo ""
echo "Terminal 1 - Backend:"
echo "  cd server"
echo "  npm start"
echo ""
echo "Terminal 2 - Frontend:"
echo "  cd client"
echo "  npm start"
echo ""
echo "Then visit: http://localhost:3000"
echo ""
echo "Demo credentials:"
echo "  Email: demo@gigshield.com"
echo "  Password: demo123"
echo ""
