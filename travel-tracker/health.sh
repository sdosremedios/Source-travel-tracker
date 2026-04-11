#!/bin/bash

echo "======================================"
echo "🌿 TravelTracker Health Check"
echo "======================================"
echo

# 1. Check PM2 process
echo "➡️  Checking PM2 process..."
pm2 status traveltracker-backend || { echo "❌ PM2 process not found"; exit 1; }
echo "✔️  PM2 process is running"
echo

# 2. Check backend directly on port 3000
echo "➡️  Checking backend API (localhost:3000)..."
BACKEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/trips)

if [ "$BACKEND_RESPONSE" = "200" ]; then
    echo "✔️  Backend is responding on port 3000"
else
    echo "❌ Backend is NOT responding on port 3000 (HTTP $BACKEND_RESPONSE)"
    exit 1
fi
echo

# 3. Check Apache proxy
echo "➡️  Checking Apache proxy (/api)..."
PROXY_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://travelshot.photography/api/trips)

if [ "$PROXY_RESPONSE" = "200" ]; then
    echo "✔️  Apache proxy is forwarding correctly"
else
    echo "❌ Apache proxy is NOT forwarding correctly (HTTP $PROXY_RESPONSE)"
    exit 1
fi
echo

# 4. Check frontend API call
echo "➡️  Checking frontend API endpoint..."
FRONTEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://travelshot.photography/api/trips)

if [ "$FRONTEND_RESPONSE" = "200" ]; then
    echo "✔️  Frontend API endpoint is reachable"
else
    echo "❌ Frontend API endpoint failed (HTTP $FRONTEND_RESPONSE)"
fi
echo

# 5. Check SQLite database file
echo "➡️  Checking SQLite database..."
DB_PATH="/var/www/traveltracker-backend/travel.db"

if [ -f "$DB_PATH" ]; then
    echo "✔️  Database file exists at $DB_PATH"
else
    echo "❌ Database file NOT found at $DB_PATH"
    exit 1
fi
echo

# 6. Check number of trips in DB
echo "➡️  Counting trips in database..."
TRIP_COUNT=$(sqlite3 $DB_PATH "SELECT COUNT(*) FROM trips;" 2>/dev/null)

if [ $? -eq 0 ]; then
    echo "✔️  Trips in database: $TRIP_COUNT"
else
    echo "❌ Could not query SQLite database"
    exit 1
fi
echo

echo "======================================"
echo "🌱 Health Check Complete"
echo "======================================"
