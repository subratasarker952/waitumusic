#!/bin/bash

# Quick SSL Fix for WaituMusic - Resolves certificate hostname mismatch
# Run this when you get "Host: localhost. is not in the cert's altnames" error

set -e

echo "🔒 Quick SSL Certificate Fix"
echo "=========================="

# Navigate to application directory
if [[ -d "/opt/waitumusic" ]]; then
    cd /opt/waitumusic
    echo "✓ Found application directory: /opt/waitumusic"
elif [[ -f "package.json" ]]; then
    echo "✓ Using current directory: $(pwd)"
else
    echo "✗ Cannot find WaituMusic application"
    exit 1
fi

# Check if .env.production exists
if [[ ! -f ".env.production" ]]; then
    if [[ -f ".env.production.example" ]]; then
        echo "✓ Copying .env.production.example to .env.production"
        cp .env.production.example .env.production
    else
        echo "✗ No environment file found"
        exit 1
    fi
fi

# Fix DATABASE_URL for localhost SSL issue
echo "✓ Fixing DATABASE_URL for SSL compatibility..."

# Backup original file
cp .env.production .env.production.ssl-backup

# Check current DATABASE_URL
source .env.production

if [[ "$DATABASE_URL" == *"localhost"* ]]; then
    echo "✓ Localhost database detected - adding sslmode=disable"
    
    if [[ "$DATABASE_URL" != *"sslmode=disable"* ]]; then
        # Add sslmode=disable for localhost
        if [[ "$DATABASE_URL" == *"?"* ]]; then
            # Has query parameters
            sed -i 's|DATABASE_URL=\(.*\)|DATABASE_URL=\1\&sslmode=disable|' .env.production
        else
            # No query parameters
            sed -i 's|DATABASE_URL=\(.*\)|DATABASE_URL=\1?sslmode=disable|' .env.production
        fi
        echo "✓ Updated DATABASE_URL with sslmode=disable"
    else
        echo "✓ DATABASE_URL already has sslmode=disable"
    fi
else
    echo "✓ External database detected - configuring SSL for production"
    
    if [[ "$DATABASE_URL" != *"sslmode"* ]]; then
        # Add sslmode=require for external databases
        if [[ "$DATABASE_URL" == *"?"* ]]; then
            sed -i 's|DATABASE_URL=\(.*\)|DATABASE_URL=\1\&sslmode=require|' .env.production
        else
            sed -i 's|DATABASE_URL=\(.*\)|DATABASE_URL=\1?sslmode=require|' .env.production
        fi
        echo "✓ Updated DATABASE_URL with sslmode=require"
    fi
fi

# Test the fix
echo "✓ Testing database connection..."

# Create simple connection test
cat > /tmp/ssl-test.js << 'EOF'
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.production' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

pool.connect()
    .then(client => {
        console.log('✓ Database connection successful');
        return client.query('SELECT NOW()');
    })
    .then(result => {
        console.log('✓ Database query successful');
        process.exit(0);
    })
    .catch(error => {
        console.error('✗ Connection failed:', error.message);
        process.exit(1);
    });
EOF

if node /tmp/ssl-test.js; then
    echo "✓ SSL fix successful - database connection working"
    rm /tmp/ssl-test.js
    
    # Restart application if it's running
    if command -v pm2 &> /dev/null && pm2 list | grep -q "waitumusic-production"; then
        echo "✓ Restarting application..."
        pm2 restart waitumusic-production
        
        sleep 5
        if pm2 list | grep -q "online"; then
            echo "✓ Application restarted successfully"
        else
            echo "⚠ Application restart may have issues - check logs: pm2 logs"
        fi
    fi
    
    echo ""
    echo "✅ SSL Certificate Fix Complete!"
    echo "Your application should now connect to the database without SSL errors."
    
else
    echo "✗ SSL fix failed - connection still not working"
    rm /tmp/ssl-test.js
    echo ""
    echo "Additional troubleshooting:"
    echo "1. Check if PostgreSQL is running: sudo systemctl status postgresql"
    echo "2. Verify database exists: sudo -u postgres psql -l"
    echo "3. Check firewall settings: sudo ufw status"
    exit 1
fi