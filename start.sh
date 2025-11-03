#!/bin/bash

echo "🚀 Starting Delhi Legislative Council App..."
echo ""

# Start MongoDB
echo "📦 Starting MongoDB..."
if brew services list | grep -q "mongodb-community.*started"; then
    echo "✅ MongoDB is already running"
elif command -v brew &> /dev/null; then
    brew services start mongodb-community
    echo "✅ MongoDB starting..."
    sleep 2
else
    echo "⚠️  Please start MongoDB manually:"
    echo "   brew services start mongodb-community"
    echo "   or"
    echo "   mongod --dbpath ~/data/db"
    exit 1
fi

# Initialize admin if needed
echo ""
echo "👤 Initializing admin user..."
cd backend
node scripts/initAdmin.js 2>/dev/null || echo "Admin already exists or MongoDB not ready yet"

# Start backend
echo ""
echo "🔧 Starting backend server..."
npm run dev &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"
sleep 3

# Start mobile app
echo ""
echo "📱 Starting mobile app..."
cd ../mobile
npm start &
MOBILE_PID=$!
echo "Mobile PID: $MOBILE_PID"

echo ""
echo "✅ All services started!"
echo ""
echo "📱 Mobile app: Check your terminal for Expo QR code"
echo "🔧 Backend: http://localhost:5000"
echo ""
echo "To stop all services, press Ctrl+C or run: pkill -f 'node.*server.js' && pkill -f 'expo'"

wait

