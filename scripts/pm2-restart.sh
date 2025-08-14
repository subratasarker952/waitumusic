#!/bin/bash

# PM2 Restart Script for WaituMusic - Fixes errored instances
# Use this when PM2 shows errored instances with multiple restarts

set -e

echo "🔄 PM2 Restart Script for WaituMusic"
echo "==================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Navigate to application directory
cd /opt/waitumusic

print_status "Current PM2 status:"
pm2 list

# Stop and clean all errored instances
print_status "Stopping and cleaning all PM2 processes..."
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true
pm2 kill 2>/dev/null || true

# Wait for cleanup
sleep 5

# Ensure tsx is available
if ! command -v tsx &> /dev/null; then
    print_status "Installing tsx globally..."
    sudo npm install -g tsx
fi

# Load environment variables
if [[ -f ".env.production" ]]; then
    source .env.production
    print_status "Environment variables loaded"
else
    print_error "No .env.production file found"
    exit 1
fi

# Start fresh instance
print_status "Starting fresh PM2 instance..."
pm2 start ecosystem.config.cjs --env production

# Wait for startup
print_status "Waiting for application startup..."
sleep 15

# Check status
if pm2 list | grep -q "online"; then
    print_status "Application is now running successfully!"
    
    # Save configuration
    pm2 save
    print_status "PM2 configuration saved"
    
    # Set up auto-start
    if ! pm2 startup | grep -q "already"; then
        print_status "Setting up PM2 auto-start..."
        pm2 startup systemd
    fi
    
    echo ""
    print_status "Final PM2 status:"
    pm2 list
    
    echo ""
    print_status "Application health check:"
    if curl -f http://localhost:3000/api/demo-mode > /dev/null 2>&1; then
        print_status "Application is healthy and responding!"
        echo "Access your application at: http://localhost:3000"
    else
        print_warning "Application started but health check failed"
        echo "Check logs: pm2 logs waitumusic-production"
    fi
    
else
    print_error "Application failed to start"
    echo ""
    echo "Recent logs:"
    pm2 logs waitumusic-production --lines 30
    echo ""
    echo "Troubleshooting steps:"
    echo "1. Check environment variables: cat .env.production"
    echo "2. Test database connection: node scripts/connection-test.js"
    echo "3. Run database setup: ./scripts/database-setup.sh"
    echo "4. Check if port 3000 is available: sudo lsof -i :3000"
fi