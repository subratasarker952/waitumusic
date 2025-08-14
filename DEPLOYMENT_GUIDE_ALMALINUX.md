# WaituMusic Platform Deployment Guide - AlmaLinux 9 with CyberPanel/OpenLiteSpeed

## Prerequisites

### System Requirements
- AlmaLinux 9 server with root access
- Minimum 4GB RAM, 2 CPU cores
- 50GB+ storage space
- Public IP address with DNS configured

### CyberPanel/OpenLiteSpeed Setup
- CyberPanel 2.3+ installed
- OpenLiteSpeed 1.7+ running
- Node.js 20+ support enabled
- PostgreSQL 15+ database server

## Step 1: Server Preparation

### 1.1 Update System
```bash
sudo dnf update -y
sudo dnf install -y curl wget git unzip
```

### 1.2 Install Node.js 20
```bash
# Install Node.js 20 LTS
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo dnf install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x
```

### 1.3 Install PM2 Process Manager
```bash
sudo npm install -g pm2
pm2 startup
# Follow the instructions provided by pm2 startup command
```

## Step 2: Database Setup

### 2.1 PostgreSQL Installation
```bash
# Install PostgreSQL 15
sudo dnf install -y postgresql postgresql-server postgresql-contrib

# Initialize and start PostgreSQL
sudo postgresql-setup --initdb
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

### 2.2 Create Database and User
```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user (replace with your preferred credentials)
CREATE DATABASE waitumusic_production;
CREATE USER waitumusic_user WITH PASSWORD 'your_secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE waitumusic_production TO waitumusic_user;
\q
```

### 2.3 Configure PostgreSQL Access
```bash
# Edit pg_hba.conf to allow local connections
sudo nano /var/lib/pgsql/data/pg_hba.conf

# Add this line before other rules:
# local   waitumusic_production   waitumusic_user                     md5

# Restart PostgreSQL
sudo systemctl restart postgresql
```

## Step 3: Application Deployment

### 3.1 Create Application Directory
```bash
# Create directory for the application
sudo mkdir -p /opt/waitumusic
sudo chown $USER:$USER /opt/waitumusic
cd /opt/waitumusic
```

### 3.2 Clone and Setup Application
```bash
# Upload your WaituMusic project files to /opt/waitumusic
# This can be done via git, scp, or file upload through CyberPanel

# Install dependencies
npm install --production

# Install TypeScript and build tools
npm install -g typescript tsx

# Build the application
npm run build
```

### 3.3 Environment Configuration
```bash
# Create production environment file
cat > .env.production << 'EOF'
# Database Configuration
DATABASE_URL=postgresql://waitumusic_user:your_secure_password_here@localhost:5432/waitumusic_production
PGHOST=localhost
PGPORT=5432
PGUSER=waitumusic_user
PGPASSWORD=your_secure_password_here
PGDATABASE=waitumusic_production

# Application Configuration
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# Security
JWT_SECRET=your_jwt_secret_here_minimum_32_characters
SESSION_SECRET=your_session_secret_here_minimum_32_characters

# Email Configuration (Optional)
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_email@domain.com
SMTP_PASS=your_email_password

# Demo Mode (set to false for production)
DEMO_MODE_ENABLED=false
EOF
```

## Step 4: Database Migration

### 4.1 Run Database Migrations
```bash
# Set environment
export NODE_ENV=production

# Push database schema
npm run db:push

# Verify database connection
node -e "
const { Pool } = require('@neondatabase/serverless');
const pool = new Pool({connectionString: process.env.DATABASE_URL});
pool.query('SELECT NOW()').then(r => console.log('DB Connected:', r.rows[0])).catch(console.error);
"
```

## Step 5: CyberPanel Configuration

### 5.1 Create Website in CyberPanel
1. Login to CyberPanel (https://your-server-ip:8090)
2. Go to "Websites" → "Create Website"
3. Fill in details:
   - Domain: your-domain.com
   - Email: admin@your-domain.com
   - Package: Default
   - Click "Create Website"

### 5.2 Configure Node.js Application
1. Go to "Websites" → "List Websites"
2. Click "Manage" for your domain
3. Go to "Node.js" tab
4. Configure:
   - Node.js Path: `/usr/bin/node`
   - Application Root: `/opt/waitumusic`
   - Startup File: `server/index.js`
   - Port: `3000`
5. Click "Save Changes"

### 5.3 Configure Reverse Proxy
1. In website management, go to "SSL" tab
2. Issue SSL certificate (Let's Encrypt recommended)
3. Go to "Rewrite Rules" and add:

```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]
ProxyPreserveHost On
ProxyRequests Off
```

## Step 6: Process Management with PM2

### 6.1 Create PM2 Ecosystem File
```bash
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'waitumusic-production',
    script: 'tsx',
    args: 'server/index.ts',
    cwd: '/opt/waitumusic',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000,
      HOST: '0.0.0.0'
    },
    max_memory_restart: '1G',
    error_file: '/var/log/waitumusic/error.log',
    out_file: '/var/log/waitumusic/out.log',
    log_file: '/var/log/waitumusic/combined.log',
    time: true,
    autorestart: true,
    watch: false,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
EOF
```

### 6.2 Create Log Directory and Start Application
```bash
# Create log directory
sudo mkdir -p /var/log/waitumusic
sudo chown $USER:$USER /var/log/waitumusic

# Start application with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME
```

## Step 7: Firewall and Security

### 7.1 Configure Firewall
```bash
# Open necessary ports
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=443/tcp
sudo firewall-cmd --permanent --add-port=8090/tcp  # CyberPanel
sudo firewall-cmd --reload
```

### 7.2 Secure PostgreSQL
```bash
# Edit postgresql.conf for security
sudo nano /var/lib/pgsql/data/postgresql.conf

# Ensure these settings:
# listen_addresses = 'localhost'
# port = 5432
# max_connections = 100

sudo systemctl restart postgresql
```

## Step 8: Monitoring and Maintenance

### 8.1 Setup Log Rotation
```bash
sudo cat > /etc/logrotate.d/waitumusic << 'EOF'
/var/log/waitumusic/*.log {
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
```

### 8.2 Health Check Script
```bash
cat > /opt/waitumusic/health-check.sh << 'EOF'
#!/bin/bash
if curl -f http://localhost:3000/api/demo-mode > /dev/null 2>&1; then
    echo "$(date): WaituMusic is healthy"
else
    echo "$(date): WaituMusic is down, restarting..."
    pm2 restart waitumusic-production
fi
EOF

chmod +x /opt/waitumusic/health-check.sh

# Add to crontab for every 5 minutes
(crontab -l 2>/dev/null; echo "*/5 * * * * /opt/waitumusic/health-check.sh >> /var/log/waitumusic/health.log") | crontab -
```

## Step 9: Backup Configuration

### 9.1 Database Backup Script
```bash
cat > /opt/waitumusic/backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/waitumusic/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

pg_dump -h localhost -U waitumusic_user -d waitumusic_production > $BACKUP_DIR/waitumusic_$DATE.sql

# Keep only last 7 days of backups
find $BACKUP_DIR -name "waitumusic_*.sql" -mtime +7 -delete
EOF

chmod +x /opt/waitumusic/backup-db.sh

# Add to crontab for daily backup at 2 AM
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/waitumusic/backup-db.sh") | crontab -
```

## Step 10: Final Verification

### 10.1 Test Application
```bash
# Check PM2 status
pm2 status

# Check application logs
pm2 logs waitumusic-production

# Test API endpoints
curl http://localhost:3000/api/demo-mode
curl https://your-domain.com/api/demo-mode
```

### 10.2 Performance Optimization
```bash
# Enable gzip compression in OpenLiteSpeed
# Go to CyberPanel → OpenLiteSpeed → Actions → Edit
# Under "Tuning" tab, enable gzip compression

# Set appropriate memory limits
echo "vm.max_map_count=262144" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

## Troubleshooting

### Common Issues and Solutions

1. **Port 3000 already in use**:
   ```bash
   sudo lsof -i :3000
   pm2 kill
   pm2 start ecosystem.config.js --env production
   ```

2. **Database connection failed**:
   ```bash
   sudo systemctl status postgresql
   sudo -u postgres psql -c "\l"  # List databases
   ```

3. **SSL certificate issues**:
   - Use CyberPanel's SSL management
   - Ensure DNS points to your server
   - Check firewall allows ports 80/443

4. **High memory usage**:
   - Adjust PM2 instances in ecosystem.config.js
   - Monitor with: `pm2 monit`

5. **Application won't start**:
   ```bash
   # Check logs
   pm2 logs waitumusic-production --lines 100
   
   # Check environment variables
   pm2 show waitumusic-production
   ```

## Post-Deployment Checklist

- [ ] Application accessible via domain
- [ ] SSL certificate installed and working
- [ ] Database connections working
- [ ] PM2 process running and auto-restart enabled
- [ ] Logs being written correctly
- [ ] Backup scripts working
- [ ] Health check monitoring active
- [ ] Firewall properly configured
- [ ] Demo mode disabled for production
- [ ] Email configuration tested (if applicable)

## Production URLs

After successful deployment, your WaituMusic platform will be available at:
- Main site: `https://your-domain.com`
- API health check: `https://your-domain.com/api/demo-mode`
- Admin panel: `https://your-domain.com/dashboard` (login required)

## Maintenance Commands

```bash
# Restart application
pm2 restart waitumusic-production

# View logs
pm2 logs waitumusic-production

# Update application
cd /opt/waitumusic
git pull  # or upload new files
npm install --production
pm2 restart waitumusic-production

# Monitor performance
pm2 monit

# Database backup (manual)
/opt/waitumusic/backup-db.sh
```

This deployment guide provides a production-ready setup for the WaituMusic Platform on AlmaLinux 9 with CyberPanel/OpenLiteSpeed, including security, monitoring, and maintenance procedures.