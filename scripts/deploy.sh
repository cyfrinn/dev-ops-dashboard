#!/usr/bin/env bash
set -e

echo "🚀 Deploying Dev Ops Dashboard..."

cd /home/azureuser/.openclaw/workspace/dev-ops-dashboard

# Pull latest changes
if [ -d ".git" ]; then
  echo "📥 Pulling latest changes..."
  git pull origin main
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

# Build the app (if needed for production)
echo "🔨 Building..."
npm run build

# Ensure data directory exists with correct permissions
echo "📁 Ensuring data directory..."
mkdir -p data
chmod 755 data

# Start or restart with pm2 if available, otherwise use nohup
if command -v pm2 &> /dev/null; then
  echo "⚙️ Using PM2 to manage process..."
  if pm2 list | grep -q dev-ops-dashboard; then
    pm2 restart dev-ops-dashboard
  else
    pm2 start npm --name "dev-ops-dashboard" -- start
  fi
  pm2 save
else
  echo "⚙️ Starting with nohup (background)..."
  nohup npm start > /dev/null 2>&1 &
fi

echo "✅ Deployment complete!"
