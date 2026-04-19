#!/bin/bash
set -e

# -----------------------------
# CONFIG — EDIT THESE PATHS
# -----------------------------
BACKEND_DIR="/var/www/travel-tracker/backend"
FRONTEND_DIR="/var/www/travel-tracker/frontend"
TARGET_DIR="/var/www/travel-tracker"
WEB_USER="www-data"

echo "----------------------------------------"
echo " Travel Tracker Deployment Script"
echo "----------------------------------------"

echo "Updating ownership to www-data:www-data..."
sudo chown -R www-data:www-data "$TARGET_DIR"

echo "Updating permissions to 0774..."
sudo chmod -R 0774 "$TARGET_DIR"

echo "Done with permissions."

# -----------------------------
# Build Backend
# -----------------------------
echo "Building backend..."
cd "$BACKEND_DIR"

# Install deps if needed
npm install --production=false

# Build backend (your backend build command)
npm run build

echo "Backend build complete."

# -----------------------------
# Build Frontend
# -----------------------------
echo "Building frontend..."
cd "$FRONTEND_DIR"

npm install
npm run build

echo "Frontend build complete."

echo "----------------------------------------"
echo " Deployment Complete"
echo "----------------------------------------"
