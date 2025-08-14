#!/bin/bash

# WaituMusic Platform Deployment Script for AlmaLinux 9
# Run this script on your server to deploy the application

set -e  # Exit on any error

echo "🚀 Starting WaituMusic Platform Deployment..."
echo "============================================="

# Configuration
APP_DIR="/opt/waitumusic"
LOG_DIR="/var/log/waitumusic"
BACKUP_DIR="/opt/waitumusic/backups"
SERVICE_USER="waitumusic"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root for security reasons"
   exit 1
fi

# Check system requirements
print_status "Checking system requirements..."

# Check AlmaLinux version
if ! grep -q "AlmaLinux release 9" /etc/redhat-release 2>/dev/null; then
    print_warning "This script is designed for AlmaLinux 9"
fi

# Check available memory
MEMORY_GB=$(free -g | awk '/^Mem:/{print $2}')
if [[ $MEMORY_GB -lt 4 ]]; then
    print_warning "Recommended minimum 4GB RAM. Current: ${MEMORY_GB}GB"
fi

# Check disk space
DISK_GB=$(df -BG / | awk 'NR==2{print $4}' | sed 's/G//')
if [[ $DISK_GB -lt 20 ]]; then
    print_error "Insufficient disk space. Need at least 20GB available"
    exit 1
fi
print_status "System requirements check passed"

# Install Node.js if not present
if ! command -v node &> /dev/null; then
    print_status "Installing Node.js 20..."
    curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
    sudo dnf install -y nodejs
else
    NODE_VERSION=$(node --version | cut -d'.' -f1 | sed 's/v//')
    if [[ $NODE_VERSION -lt 18 ]]; then
        print_warning "Node.js version $NODE_VERSION detected. Upgrading to Node.js 20..."
        curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
        sudo dnf install -y nodejs
    fi
fi
print_status "Node.js $(node --version) installed"

# Install PM2 globally
if ! command -v pm2 &> /dev/null; then
    print_status "Installing PM2 process manager..."
    sudo npm install -g pm2
    print_status "PM2 installed successfully"
fi

# Create application directory
print_status "Setting up application directory..."
sudo mkdir -p $APP_DIR
sudo chown $USER:$USER $APP_DIR

# Create log directory
sudo mkdir -p $LOG_DIR
sudo chown $USER:$USER $LOG_DIR

# Create backup directory
mkdir -p $BACKUP_DIR

print_status "Directory structure created"

# Install application dependencies
if [[ -f "package.json" ]]; then
    print_status "Installing application dependencies..."
    cd $APP_DIR
    
    # Install all dependencies (including dev dependencies for drizzle-kit)
    npm install
    
    # Install global TypeScript and build tools if needed
    if ! command -v tsx &> /dev/null; then
        sudo npm install -g tsx typescript
    fi
    
    # Verify drizzle-kit is available
    if ! npx drizzle-kit --version &> /dev/null; then
        print_status "Installing drizzle-kit globally..."
        sudo npm install -g drizzle-kit
    fi
    
    print_status "Dependencies installed successfully"
else
    print_error "package.json not found. Please ensure the application files are in $APP_DIR"
    exit 1
fi

# Check for environment file
if [[ ! -f ".env.production" ]]; then
    print_warning "No .env.production file found"
    if [[ -f ".env.production.example" ]]; then
        print_status "Copying .env.production.example to .env.production"
        cp .env.production.example .env.production
        print_warning "Please edit .env.production with your actual configuration values"
    else
        print_error "No environment configuration found. Please create .env.production"
        exit 1
    fi
fi

# Database setup check
print_status "Checking database connectivity..."
if command -v psql &> /dev/null; then
    print_status "PostgreSQL client found"
else
    print_warning "PostgreSQL client not found. Installing..."
    sudo dnf install -y postgresql
fi

# Test database connection
if grep -q "DATABASE_URL" .env.production; then
    print_status "Database configuration found in environment"
else
    print_error "DATABASE_URL not found in .env.production"
    exit 1
fi

# Run database migrations
print_status "Running database migrations..."
export NODE_ENV=production

# Source environment variables for database connection
if [[ -f ".env.production" ]]; then
    source .env.production
    print_status "Environment variables loaded for database migration"
else
    print_error "No .env.production file found. Please create it with your database configuration"
    exit 1
fi

# Try database migration with multiple approaches
print_status "Attempting database migration with drizzle-kit..."

if npm run db:push 2>/dev/null; then
    print_status "Database migrations completed with npm run db:push"
elif npx drizzle-kit push 2>/dev/null; then
    print_status "Database migrations completed with npx drizzle-kit"
else
    print_warning "Drizzle-kit migration failed. Using manual migration script..."
    
    # Create manual migration script
    if node scripts/manual-migration.js; then
        print_status "Database schema created with manual migration script"
    else
        print_error "All migration methods failed. Please check:"
        echo "  1. DATABASE_URL is correctly set in .env.production"
        echo "  2. PostgreSQL server is running: sudo systemctl status postgresql"
        echo "  3. Database user has proper permissions"
        echo "  4. Database exists: sudo -u postgres psql -c '\l'"
        echo ""
        echo "Current DATABASE_URL (masked): ${DATABASE_URL:0:25}***"
        echo ""
        echo "Try manual database setup:"
        echo "  sudo -u postgres psql"
        echo "  CREATE DATABASE waitumusic_production;"
        echo "  CREATE USER waitumusic_user WITH PASSWORD 'your_password';"
        echo "  GRANT ALL PRIVILEGES ON DATABASE waitumusic_production TO waitumusic_user;"
        exit 1
    fi
fi

# Setup PM2 ecosystem
if [[ -f "ecosystem.config.cjs" ]]; then
    print_status "PM2 ecosystem configuration found"
elif [[ -f "ecosystem.config.js" ]]; then
    print_status "Converting ecosystem.config.js to .cjs format..."
    mv ecosystem.config.js ecosystem.config.cjs
else
    print_error "ecosystem.config file not found"
    exit 1
fi

# Stop existing PM2 processes (including errored ones)
print_status "Cleaning up any existing PM2 instances..."
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true
pm2 kill 2>/dev/null || true

# Wait for cleanup
sleep 3

# Ensure tsx is available
if ! command -v tsx &> /dev/null; then
    print_status "Installing tsx globally..."
    sudo npm install -g tsx
fi

# Start application with PM2
print_status "Starting WaituMusic application (single instance mode)..."
pm2 start ecosystem.config.cjs --env production

# Wait for startup and verify
sleep 10

if pm2 list | grep -q "online"; then
    print_status "Application started successfully"
    pm2 save
    print_status "PM2 configuration saved"
else
    print_error "Application failed to start. Check logs:"
    pm2 logs waitumusic-production --lines 20
    exit 1
fi

# Setup PM2 startup script
if ! systemctl is-enabled pm2-$USER &> /dev/null; then
    print_status "Setting up PM2 startup script..."
    pm2 startup systemd -u $USER --hp $HOME
    print_warning "Please run the command shown above as sudo to complete PM2 startup setup"
fi

# Setup log rotation
print_status "Setting up log rotation..."
sudo tee /etc/logrotate.d/waitumusic > /dev/null << EOF
$LOG_DIR/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 644 $USER $USER
    postrotate
        pm2 reload waitumusic-production
    endscript
}
EOF

# Create health check script
print_status "Setting up health monitoring..."
tee $APP_DIR/health-check.sh > /dev/null << 'EOF'
#!/bin/bash
HEALTH_URL="http://localhost:3000/api/demo-mode"
LOG_FILE="/var/log/waitumusic/health.log"

if curl -f $HEALTH_URL > /dev/null 2>&1; then
    echo "$(date): WaituMusic is healthy" >> $LOG_FILE
else
    echo "$(date): WaituMusic is down, restarting..." >> $LOG_FILE
    pm2 restart waitumusic-production
    sleep 10
    if curl -f $HEALTH_URL > /dev/null 2>&1; then
        echo "$(date): WaituMusic restarted successfully" >> $LOG_FILE
    else
        echo "$(date): WaituMusic restart failed" >> $LOG_FILE
    fi
fi
EOF

chmod +x $APP_DIR/health-check.sh

# Add health check to crontab if not already present
if ! crontab -l 2>/dev/null | grep -q "health-check.sh"; then
    (crontab -l 2>/dev/null; echo "*/5 * * * * $APP_DIR/health-check.sh") | crontab -
    print_status "Health check monitoring enabled (every 5 minutes)"
fi

# Create backup script
print_status "Setting up database backup..."
tee $APP_DIR/backup-db.sh > /dev/null << 'EOF'
#!/bin/bash
source /opt/waitumusic/.env.production
BACKUP_DIR="/opt/waitumusic/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Extract database connection details
DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
DB_USER=$(echo $DATABASE_URL | sed -n 's/.*\/\/\([^:]*\):.*/\1/p')

# Create backup
PGPASSWORD=$PGPASSWORD pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME > $BACKUP_DIR/waitumusic_$DATE.sql

if [[ $? -eq 0 ]]; then
    echo "$(date): Database backup created: waitumusic_$DATE.sql" >> /var/log/waitumusic/backup.log
    # Keep only last 7 days of backups
    find $BACKUP_DIR -name "waitumusic_*.sql" -mtime +7 -delete
else
    echo "$(date): Database backup failed" >> /var/log/waitumusic/backup.log
fi
EOF

chmod +x $APP_DIR/backup-db.sh

# Add backup to crontab if not already present
if ! crontab -l 2>/dev/null | grep -q "backup-db.sh"; then
    (crontab -l 2>/dev/null; echo "0 2 * * * $APP_DIR/backup-db.sh") | crontab -
    print_status "Daily database backup enabled (2 AM)"
fi

# Final health check
print_status "Performing final application health check..."
sleep 10  # Wait for application to fully start

if curl -f http://localhost:3000/api/demo-mode > /dev/null 2>&1; then
    print_status "Application is running and healthy!"
else
    print_error "Application health check failed"
    print_status "Checking PM2 status..."
    pm2 status
    print_status "Checking application logs..."
    pm2 logs waitumusic-production --lines 20
    exit 1
fi

# Display deployment summary
echo ""
echo "🎉 WaituMusic Platform Deployment Complete!"
echo "==========================================="
echo ""
echo "Application Status:"
echo "  • Directory: $APP_DIR"
echo "  • Process Manager: PM2"
echo "  • Logs: $LOG_DIR"
echo "  • Backups: $BACKUP_DIR"
echo "  • Local URL: http://localhost:3000"
echo ""
echo "Next Steps:"
echo "  1. Configure CyberPanel reverse proxy to point to localhost:3000"
echo "  2. Set up SSL certificate through CyberPanel"
echo "  3. Update DNS to point to your server"
echo "  4. Edit .env.production with your actual values"
echo "  5. Test the application at your domain"
echo ""
echo "Management Commands:"
echo "  • View status: pm2 status"
echo "  • View logs: pm2 logs waitumusic-production"
echo "  • Restart app: pm2 restart waitumusic-production"
echo "  • Monitor: pm2 monit"
echo ""
print_status "Deployment script completed successfully!"