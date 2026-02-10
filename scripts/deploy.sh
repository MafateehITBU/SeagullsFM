#!/bin/bash
# Run this script on the server (or via GitHub Actions) from the repo root.
# It pulls latest code, builds moodfm-web and cms, and restarts the backend.

set -e
echo "========== Deploy started at $(date) =========="

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

# 1. Pull latest from Git
echo ">> Pulling latest code..."
git pull origin main || git pull origin master

# 2. Build moodfm-web
echo ">> Building moodfm-web..."
cd moodfm-web
npm install
npm run build
cd "$REPO_ROOT"

# 3. Build cms
echo ">> Building cms..."
cd cms
npm install
npm run build
cd "$REPO_ROOT"

# 4. Backend: install deps and restart
echo ">> Installing backend dependencies..."
cd backend
npm install
cd "$REPO_ROOT"

echo ">> Restarting backend..."
if command -v pm2 &> /dev/null; then
  pm2 restart backend 2>/dev/null || pm2 restart all
else
  echo "PM2 not found. Restart backend manually (e.g. systemctl or node)."
fi

echo "========== Deploy finished at $(date) =========="
