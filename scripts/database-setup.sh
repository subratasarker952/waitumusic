#!/bin/bash

# WaituMusic Database Setup and Connection Test Script
# Comprehensive database setup for AlmaLinux 9

set -e

echo "🔧 WaituMusic Database Setup and Connection Test"
echo "==============================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Check if PostgreSQL is installed
check_postgresql() {
    print_info "Checking PostgreSQL installation..."
    
    if command -v psql &> /dev/null; then
        print_status "PostgreSQL client found"
        psql --version
    else
        print_warning "PostgreSQL client not found. Installing..."
        sudo dnf install -y postgresql postgresql-server postgresql-contrib
        
        # Initialize PostgreSQL if needed
        if [[ ! -d "/var/lib/pgsql/data" ]] || [[ ! -f "/var/lib/pgsql/data/PG_VERSION" ]]; then
            print_status "Initializing PostgreSQL database..."
            sudo postgresql-setup --initdb
        fi
        
        # Start and enable PostgreSQL
        sudo systemctl enable postgresql
        sudo systemctl start postgresql
        print_status "PostgreSQL installed and started"
    fi
}

# Check PostgreSQL service status
check_service() {
    print_info "Checking PostgreSQL service status..."
    
    if sudo systemctl is-active postgresql &> /dev/null; then
        print_status "PostgreSQL service is running"
    else
        print_warning "PostgreSQL service is not running. Starting..."
        sudo systemctl start postgresql
        sleep 5
        
        if sudo systemctl is-active postgresql &> /dev/null; then
            print_status "PostgreSQL service started successfully"
        else
            print_error "Failed to start PostgreSQL service"
            sudo systemctl status postgresql
            exit 1
        fi
    fi
}

# Create database and user
setup_database() {
    print_info "Setting up WaituMusic database and user..."
    
    # Check if database exists
    if sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw waitumusic_production; then
        print_status "Database 'waitumusic_production' already exists"
    else
        print_status "Creating database 'waitumusic_production'..."
        sudo -u postgres createdb waitumusic_production
    fi
    
    # Check if user exists
    if sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='waitumusic_user'" | grep -q 1; then
        print_status "User 'waitumusic_user' already exists"
    else
        print_status "Creating user 'waitumusic_user'..."
        
        # Prompt for password
        echo "Enter password for waitumusic_user (or press Enter for default 'waitu123'):"
        read -s db_password
        if [[ -z "$db_password" ]]; then
            db_password="waitu123"
        fi
        
        sudo -u postgres psql -c "CREATE USER waitumusic_user WITH PASSWORD '$db_password';"
        print_status "User 'waitumusic_user' created with provided password"
    fi
    
    # Grant privileges
    print_status "Granting privileges..."
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE waitumusic_production TO waitumusic_user;"
    sudo -u postgres psql -c "ALTER USER waitumusic_user CREATEDB;"
    
    # Store password for environment file
    export DB_PASSWORD="$db_password"
}

# Configure PostgreSQL for local connections
configure_postgresql() {
    print_info "Configuring PostgreSQL for local connections..."
    
    # Backup original files
    sudo cp /var/lib/pgsql/data/pg_hba.conf /var/lib/pgsql/data/pg_hba.conf.backup 2>/dev/null || true
    sudo cp /var/lib/pgsql/data/postgresql.conf /var/lib/pgsql/data/postgresql.conf.backup 2>/dev/null || true
    
    # Configure pg_hba.conf for local connections
    if ! sudo grep -q "waitumusic_production" /var/lib/pgsql/data/pg_hba.conf; then
        print_status "Adding local connection rule to pg_hba.conf..."
        echo "local   waitumusic_production   waitumusic_user                     md5" | sudo tee -a /var/lib/pgsql/data/pg_hba.conf > /dev/null
    fi
    
    # Ensure local connections are allowed
    sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = 'localhost'/" /var/lib/pgsql/data/postgresql.conf
    
    # Restart PostgreSQL to apply changes
    print_status "Restarting PostgreSQL to apply configuration changes..."
    sudo systemctl restart postgresql
    sleep 5
}

# Test database connection
test_connection() {
    print_info "Testing database connection..."
    
    local test_passed=false
    
    # Test with different connection methods
    print_info "Testing connection with psql..."
    
    if PGPASSWORD="$DB_PASSWORD" psql -h localhost -U waitumusic_user -d waitumusic_production -c "SELECT version();" 2>/dev/null; then
        print_status "Direct psql connection successful"
        test_passed=true
    else
        print_warning "Direct psql connection failed"
    fi
    
    # Test with DATABASE_URL format
    local database_url="postgresql://waitumusic_user:$DB_PASSWORD@localhost:5432/waitumusic_production"
    
    if psql "$database_url" -c "SELECT NOW() as current_time;" 2>/dev/null; then
        print_status "DATABASE_URL connection successful"
        test_passed=true
    else
        print_warning "DATABASE_URL connection failed"
    fi
    
    if [[ "$test_passed" == "true" ]]; then
        print_status "Database connection test passed!"
        
        # Create environment file
        create_env_file "$database_url"
    else
        print_error "Database connection tests failed"
        print_info "Troubleshooting steps:"
        echo "1. Check PostgreSQL logs: sudo journalctl -u postgresql"
        echo "2. Verify service status: sudo systemctl status postgresql"
        echo "3. Check configuration: sudo cat /var/lib/pgsql/data/pg_hba.conf"
        exit 1
    fi
}

# Create .env.production file
create_env_file() {
    local database_url="$1"
    
    print_info "Creating .env.production file..."
    
    cat > .env.production << EOF
# WaituMusic Platform - Production Environment
# Database Configuration
DATABASE_URL=$database_url
PGHOST=localhost
PGPORT=5432
PGUSER=waitumusic_user
PGPASSWORD=$DB_PASSWORD
PGDATABASE=waitumusic_production

# Application Configuration
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# Security Configuration (CHANGE THESE IN PRODUCTION!)
JWT_SECRET=$(openssl rand -hex 32)
SESSION_SECRET=$(openssl rand -hex 32)

# Demo Mode Configuration
DEMO_MODE_ENABLED=false

# Email Configuration (Optional)
# SMTP_HOST=your_smtp_host
# SMTP_PORT=587
# SMTP_USER=your_email@domain.com
# SMTP_PASS=your_email_password

# Domain Configuration
DOMAIN=localhost
CORS_ORIGIN=http://localhost:3000
EOF
    
    chmod 600 .env.production
    print_status ".env.production file created with secure permissions"
}

# Run database migration
run_migration() {
    print_info "Running database migration..."
    
    # Load environment variables
    source .env.production
    
    # Try multiple migration approaches
    if node scripts/manual-migration.js; then
        print_status "Database schema created successfully with manual migration"
    elif npm run db:push 2>/dev/null; then
        print_status "Database migration completed with drizzle-kit"
    else
        print_error "Database migration failed"
        echo "Manual setup may be required"
        return 1
    fi
}

# Main execution
main() {
    print_info "Starting comprehensive database setup..."
    
    # Ensure we're in the right directory
    if [[ ! -f "package.json" ]]; then
        print_error "package.json not found. Please run this script from /opt/waitumusic"
        exit 1
    fi
    
    check_postgresql
    check_service
    setup_database
    configure_postgresql
    test_connection
    run_migration
    
    echo ""
    print_status "Database setup completed successfully!"
    echo ""
    echo "Database Information:"
    echo "  - Database: waitumusic_production"
    echo "  - User: waitumusic_user"
    echo "  - Host: localhost"
    echo "  - Port: 5432"
    echo ""
    echo "Next steps:"
    echo "1. Start the application: pm2 start ecosystem.config.js --env production"
    echo "2. Test the application: curl http://localhost:3000/api/demo-mode"
    echo "3. Configure reverse proxy in CyberPanel"
    echo ""
    echo "Environment file created: .env.production"
    echo "Connection string: postgresql://waitumusic_user:***@localhost:5432/waitumusic_production"
}

# Run main function
main "$@"