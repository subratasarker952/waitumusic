#!/bin/bash

# WaituMusic Platform - Backup and Restore Script
# Provides database backup, restore, and application backup functionality

set -e

# Configuration
APP_DIR="/opt/waitumusic"
BACKUP_DIR="/opt/waitumusic/backups"
LOG_FILE="/var/log/waitumusic/backup.log"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}✓${NC} $1"
    echo "$(date): $1" >> $LOG_FILE
}

print_error() {
    echo -e "${RED}✗${NC} $1"
    echo "$(date): ERROR: $1" >> $LOG_FILE
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
    echo "$(date): WARNING: $1" >> $LOG_FILE
}

# Load environment variables
if [[ -f "$APP_DIR/.env.production" ]]; then
    source $APP_DIR/.env.production
else
    print_error "Environment file not found at $APP_DIR/.env.production"
    exit 1
fi

# Create backup directory
mkdir -p $BACKUP_DIR

# Function to create database backup
backup_database() {
    local backup_name="${1:-$(date +%Y%m%d_%H%M%S)}"
    local backup_file="$BACKUP_DIR/db_waitumusic_$backup_name.sql"
    
    print_status "Creating database backup: $backup_name"
    
    # Extract database connection details from DATABASE_URL
    local db_host=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
    local db_port=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
    local db_name=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
    local db_user=$(echo $DATABASE_URL | sed -n 's/.*\/\/\([^:]*\):.*/\1/p')
    
    if PGPASSWORD=$PGPASSWORD pg_dump -h $db_host -p $db_port -U $db_user -d $db_name > $backup_file; then
        print_status "Database backup created successfully: $(basename $backup_file)"
        
        # Compress the backup
        gzip $backup_file
        print_status "Backup compressed: $(basename $backup_file).gz"
        
        # Clean old backups (keep last 30 days)
        find $BACKUP_DIR -name "db_waitumusic_*.sql.gz" -mtime +30 -delete
        print_status "Old backups cleaned (30+ days)"
        
        return 0
    else
        print_error "Database backup failed"
        return 1
    fi
}

# Function to restore database from backup
restore_database() {
    local backup_file="$1"
    
    if [[ ! -f "$backup_file" ]]; then
        print_error "Backup file not found: $backup_file"
        return 1
    fi
    
    print_warning "This will restore the database and OVERWRITE all current data!"
    read -p "Are you sure you want to continue? (yes/no): " confirm
    
    if [[ $confirm != "yes" ]]; then
        print_status "Database restore cancelled"
        return 0
    fi
    
    print_status "Stopping WaituMusic application..."
    pm2 stop waitumusic-production
    
    # Extract database connection details
    local db_host=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
    local db_port=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
    local db_name=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
    local db_user=$(echo $DATABASE_URL | sed -n 's/.*\/\/\([^:]*\):.*/\1/p')
    
    print_status "Restoring database from: $(basename $backup_file)"
    
    # Handle compressed files
    if [[ $backup_file == *.gz ]]; then
        if gunzip -c $backup_file | PGPASSWORD=$PGPASSWORD psql -h $db_host -p $db_port -U $db_user -d $db_name; then
            print_status "Database restored successfully"
        else
            print_error "Database restore failed"
            return 1
        fi
    else
        if PGPASSWORD=$PGPASSWORD psql -h $db_host -p $db_port -U $db_user -d $db_name < $backup_file; then
            print_status "Database restored successfully"
        else
            print_error "Database restore failed"
            return 1
        fi
    fi
    
    print_status "Starting WaituMusic application..."
    pm2 start waitumusic-production
    
    # Wait for application to start
    sleep 10
    
    # Health check
    if curl -f http://localhost:3000/api/demo-mode > /dev/null 2>&1; then
        print_status "Application restarted successfully after restore"
    else
        print_error "Application failed to start after restore"
        return 1
    fi
}

# Function to backup application files
backup_application() {
    local backup_name="${1:-$(date +%Y%m%d_%H%M%S)}"
    local backup_file="$BACKUP_DIR/app_waitumusic_$backup_name.tar.gz"
    
    print_status "Creating application backup: $backup_name"
    
    # Create application backup excluding node_modules and logs
    tar -czf $backup_file \
        --exclude='node_modules' \
        --exclude='dist' \
        --exclude='*.log' \
        --exclude='.git' \
        --exclude='backups' \
        -C /opt waitumusic/
    
    if [[ $? -eq 0 ]]; then
        print_status "Application backup created: $(basename $backup_file)"
        
        # Clean old application backups (keep last 7 days)
        find $BACKUP_DIR -name "app_waitumusic_*.tar.gz" -mtime +7 -delete
        print_status "Old application backups cleaned (7+ days)"
        
        return 0
    else
        print_error "Application backup failed"
        return 1
    fi
}

# Function to list available backups
list_backups() {
    print_status "Available backups:"
    echo ""
    echo "Database Backups:"
    ls -lh $BACKUP_DIR/db_waitumusic_*.sql.gz 2>/dev/null | awk '{print "  " $9 " (" $5 ", " $6 " " $7 " " $8 ")"}'
    
    echo ""
    echo "Application Backups:"
    ls -lh $BACKUP_DIR/app_waitumusic_*.tar.gz 2>/dev/null | awk '{print "  " $9 " (" $5 ", " $6 " " $7 " " $8 ")"}'
}

# Function to create full backup (database + application)
full_backup() {
    local backup_name="${1:-$(date +%Y%m%d_%H%M%S)}"
    
    print_status "Creating full backup: $backup_name"
    
    if backup_database $backup_name && backup_application $backup_name; then
        print_status "Full backup completed successfully"
        return 0
    else
        print_error "Full backup failed"
        return 1
    fi
}

# Main script logic
case "$1" in
    "backup-db")
        backup_database $2
        ;;
    "restore-db")
        if [[ -z "$2" ]]; then
            print_error "Usage: $0 restore-db <backup-file>"
            exit 1
        fi
        restore_database $2
        ;;
    "backup-app")
        backup_application $2
        ;;
    "full-backup")
        full_backup $2
        ;;
    "list")
        list_backups
        ;;
    *)
        echo "WaituMusic Platform - Backup and Restore Script"
        echo ""
        echo "Usage: $0 {backup-db|restore-db|backup-app|full-backup|list} [backup-name|backup-file]"
        echo ""
        echo "Commands:"
        echo "  backup-db [name]           - Create database backup"
        echo "  restore-db <file>          - Restore database from backup file"
        echo "  backup-app [name]          - Create application files backup"
        echo "  full-backup [name]         - Create full backup (database + application)"
        echo "  list                       - List available backups"
        echo ""
        echo "Examples:"
        echo "  $0 backup-db                    # Auto-named backup"
        echo "  $0 backup-db before_update      # Named backup"
        echo "  $0 restore-db /path/to/backup   # Restore from specific file"
        echo "  $0 full-backup weekly_backup    # Full system backup"
        echo "  $0 list                         # Show all backups"
        exit 1
        ;;
esac