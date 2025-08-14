#!/bin/bash

# SSL Certificate Fix Script for WaituMusic
# Resolves hostname mismatch errors for localhost connections

set -e

echo "🔒 SSL Certificate Fix for WaituMusic"
echo "===================================="

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

# Check current directory
APP_DIR="/opt/waitumusic"
if [[ ! -d "$APP_DIR" ]]; then
    APP_DIR=$(pwd)
    print_warning "Using current directory: $APP_DIR"
fi

cd "$APP_DIR"

# Load environment variables
if [[ -f ".env.production" ]]; then
    source .env.production
    print_status "Environment variables loaded"
else
    print_error "No .env.production file found"
    exit 1
fi

# Check if DATABASE_URL contains localhost
if [[ "$DATABASE_URL" == *"localhost"* ]]; then
    print_status "Localhost database detected - SSL fix required"
    
    # Update DATABASE_URL to disable SSL for localhost
    if [[ "$DATABASE_URL" != *"sslmode=disable"* ]]; then
        print_status "Adding sslmode=disable to DATABASE_URL"
        
        # Backup original .env.production
        cp .env.production .env.production.backup
        
        # Update DATABASE_URL
        if [[ "$DATABASE_URL" == *"?"* ]]; then
            # Already has query parameters
            sed -i 's|DATABASE_URL=\(.*\)|DATABASE_URL=\1\&sslmode=disable|' .env.production
        else
            # No query parameters yet
            sed -i 's|DATABASE_URL=\(.*\)|DATABASE_URL=\1?sslmode=disable|' .env.production
        fi
        
        print_status "DATABASE_URL updated with sslmode=disable"
    else
        print_status "DATABASE_URL already has sslmode=disable"
    fi
    
elif [[ "$DATABASE_URL" == *"neon.tech"* ]] || [[ "$DATABASE_URL" == *"amazonaws.com"* ]]; then
    print_status "External database detected - checking SSL configuration"
    
    # For external databases, ensure SSL is properly configured
    if [[ "$DATABASE_URL" != *"sslmode"* ]]; then
        print_status "Adding sslmode=require for external database"
        
        # Backup original .env.production
        cp .env.production .env.production.backup
        
        # Update DATABASE_URL
        if [[ "$DATABASE_URL" == *"?"* ]]; then
            sed -i 's|DATABASE_URL=\(.*\)|DATABASE_URL=\1\&sslmode=require|' .env.production
        else
            sed -i 's|DATABASE_URL=\(.*\)|DATABASE_URL=\1?sslmode=require|' .env.production
        fi
        
        print_status "DATABASE_URL updated with sslmode=require"
    fi
else
    print_warning "Unknown database type - manual SSL configuration may be needed"
fi

# Test database connection
print_status "Testing database connection with SSL fix..."

cat > test-connection.js << 'EOF'
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.production' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('localhost') 
        ? false
        : process.env.NODE_ENV === 'production' 
        ? { rejectUnauthorized: false }
        : false
});

async function testConnection() {
    try {
        const client = await pool.connect();
        console.log('✓ Database connection successful');
        const result = await client.query('SELECT NOW()');
        console.log('✓ Database query successful:', result.rows[0]);
        client.release();
        process.exit(0);
    } catch (error) {
        console.error('✗ Database connection failed:', error.message);
        process.exit(1);
    }
}

testConnection();
EOF

if node test-connection.js; then
    print_status "Database connection test passed!"
    rm test-connection.js
else
    print_error "Database connection test failed"
    rm test-connection.js
    
    print_warning "Additional troubleshooting options:"
    echo "1. Check if PostgreSQL is running: sudo systemctl status postgresql"
    echo "2. Verify database exists: sudo -u postgres psql -l"
    echo "3. Test manual connection: psql \"\$DATABASE_URL\""
    echo "4. Check firewall: sudo ufw status"
    exit 1
fi

# Restart application if PM2 is running
if pm2 list | grep -q "waitumusic-production"; then
    print_status "Restarting application with SSL fix..."
    pm2 restart waitumusic-production
    
    # Wait and check status
    sleep 5
    if pm2 list | grep -q "online"; then
        print_status "Application restarted successfully with SSL fix"
    else
        print_error "Application restart failed"
        pm2 logs waitumusic-production --lines 10
    fi
else
    print_warning "PM2 not running - SSL fix ready for next startup"
fi

print_status "SSL certificate fix complete!"
echo ""
echo "Summary of changes:"
echo "- Updated DATABASE_URL with appropriate SSL mode"
echo "- Database connection tested successfully"
echo "- Application configuration updated"
echo ""
echo "If issues persist, check logs: pm2 logs waitumusic-production"