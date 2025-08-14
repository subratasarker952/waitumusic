#!/bin/bash

# WaituMusic Quick Fix Script for drizzle-kit Issues
# Run this to quickly resolve deployment issues

set -e

echo "🔧 WaituMusic Quick Fix - Resolving drizzle-kit Issues"
echo "===================================================="

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

# Check if we're in the right directory
if [[ ! -f "package.json" ]]; then
    print_error "package.json not found. Please run this script from /opt/waitumusic"
    exit 1
fi

print_status "Quick fix starting in: $(pwd)"

# 1. Install dependencies properly
print_status "Installing all dependencies (including dev dependencies)..."
npm install

# 2. Install drizzle-kit globally
print_status "Installing drizzle-kit globally..."
sudo npm install -g drizzle-kit@latest

# 3. Create .env.production if it doesn't exist
if [[ ! -f ".env.production" ]]; then
    print_warning "Creating .env.production from example..."
    if [[ -f ".env.production.example" ]]; then
        cp .env.production.example .env.production
        print_warning "Please edit .env.production with your actual database credentials"
        echo "nano .env.production"
    else
        print_error ".env.production.example not found"
    fi
fi

# 4. Load environment variables
if [[ -f ".env.production" ]]; then
    source .env.production
    print_status "Environment variables loaded"
else
    print_error "Please create .env.production with your database configuration"
    exit 1
fi

# 5. Test database connection
print_status "Testing database connection..."
if psql "$DATABASE_URL" -c "SELECT version();" 2>/dev/null; then
    print_status "Database connection successful"
else
    print_warning "Database connection failed. Trying manual migration..."
fi

# 6. Try multiple migration approaches
print_status "Running database migration..."

# Method 1: npm run db:push
if npm run db:push 2>/dev/null; then
    print_status "Migration successful with npm run db:push"
# Method 2: npx drizzle-kit push
elif npx drizzle-kit push 2>/dev/null; then
    print_status "Migration successful with npx drizzle-kit push"
# Method 3: Manual migration script
elif node scripts/manual-migration.js; then
    print_status "Migration successful with manual script"
else
    print_error "All migration methods failed"
    echo ""
    echo "Manual database setup required:"
    echo "1. sudo -u postgres psql"
    echo "2. CREATE DATABASE waitumusic_production;"
    echo "3. CREATE USER waitumusic_user WITH PASSWORD 'your_password';"
    echo "4. GRANT ALL PRIVILEGES ON DATABASE waitumusic_production TO waitumusic_user;"
    echo "5. \\q"
    echo "6. Update .env.production with correct credentials"
    exit 1
fi

# 7. Start application with PM2
print_status "Starting application with PM2..."

# Stop existing processes
pm2 delete waitumusic-production 2>/dev/null || true

# Start new process
pm2 start ecosystem.config.cjs --env production

# Save configuration
pm2 save

print_status "Setting up PM2 auto-start..."
pm2 startup systemd

# 8. Health check
print_status "Performing health check..."
sleep 10

if curl -f http://localhost:3000/api/demo-mode > /dev/null 2>&1; then
    print_status "Application is running and healthy!"
    
    echo ""
    echo "🎉 Quick Fix Complete!"
    echo "===================="
    echo ""
    echo "Application Status:"
    pm2 status
    echo ""
    echo "Next Steps:"
    echo "1. Configure reverse proxy in CyberPanel"
    echo "2. Point domain to localhost:3000"
    echo "3. Set up SSL certificate"
    echo ""
    echo "Useful Commands:"
    echo "• Check status: pm2 status"
    echo "• View logs: pm2 logs waitumusic-production"
    echo "• Restart: pm2 restart waitumusic-production"
    echo "• Monitor: pm2 monit"
    
else
    print_error "Application health check failed"
    echo ""
    echo "Check the logs:"
    pm2 logs waitumusic-production --lines 20
fi