#!/bin/bash

# Kill all WaituMusic processes and free up ports

echo "🔄 Killing existing WaituMusic processes..."

# Kill PM2 processes
if command -v pm2 &> /dev/null; then
    echo "Stopping PM2 processes..."
    pm2 delete waitumusic-production 2>/dev/null || true
    pm2 kill 2>/dev/null || true
fi

# Kill any node/tsx processes related to waitumusic
echo "Killing Node.js processes..."
pkill -f "waitumusic" 2>/dev/null || true
pkill -f "tsx.*server" 2>/dev/null || true
pkill -f "npm.*dev" 2>/dev/null || true

# Kill processes using port 5000
echo "Freeing port 5000..."
fuser -k 5000/tcp 2>/dev/null || true

# Kill processes using port 3000
echo "Freeing port 3000..."
fuser -k 3000/tcp 2>/dev/null || true

sleep 2

# Check if ports are free
echo "Checking port status..."
if lsof -i :5000 >/dev/null 2>&1; then
    echo "⚠ Port 5000 still in use"
    lsof -i :5000
else
    echo "✓ Port 5000 is free"
fi

if lsof -i :3000 >/dev/null 2>&1; then
    echo "⚠ Port 3000 still in use"
    lsof -i :3000
else
    echo "✓ Port 3000 is free"
fi

echo "✅ Process cleanup complete"