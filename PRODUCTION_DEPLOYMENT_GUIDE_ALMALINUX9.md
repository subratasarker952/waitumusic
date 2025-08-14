# WaituMusic Production Deployment Guide - AlmaLinux 9 + CyberPanel

## Overview
Complete deployment guide for WaituMusic platform on AlmaLinux 9 with CyberPanel, optimized for zero SSL errors and perfect proxy configuration.

## Server Requirements
- AlmaLinux 9 minimal installation
- 4+ GB RAM (8 GB recommended)
- 50+ GB storage
- Root access
- Domain name pointed to server IP

## Phase 1: System Preparation

### 1.1 Update System
```bash
sudo dnf update -y
sudo dnf install -y wget curl git vim
```

### 1.2 Install CyberPanel
```bash
# Download and install CyberPanel
sh <(curl https://cyberpanel.net/install.sh || wget -O - https://cyberpanel.net/install.sh)

# During installation select:
# 1. Full Installation with OpenLiteSpeed
# 2. Install Memcached: Yes
# 3. Install Redis: Yes
# 4. Install PowerDNS: No (unless needed)
# 5. Install Postfix: Yes
# 6. Install Rainloop: No
```

### 1.3 Post-Installation Security
```bash
# Secure CyberPanel
sudo cyberpanel upgradePanel
sudo ufw enable
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 8090/tcp
```

## Phase 2: Node.js Environment Setup

### 2.1 Install Node.js 20 via NodeSource
```bash
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo dnf install -y nodejs
node --version  # Should show v20.x
npm --version
```

### 2.2 Install PM2 Process Manager
```bash
sudo npm install -g pm2
pm2 startup
# Follow the command output to enable PM2 startup
```

### 2.3 Install Database (PostgreSQL)
```bash
sudo dnf install -y postgresql postgresql-server postgresql-contrib
sudo postgresql-setup --initdb
sudo systemctl enable postgresql
sudo systemctl start postgresql

# Configure PostgreSQL
sudo -u postgres psql
```

```sql
-- In PostgreSQL shell:
CREATE DATABASE waitumusic;
CREATE USER waitumusic WITH ENCRYPTED PASSWORD 'your_secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE waitumusic TO waitumusic;
ALTER USER waitumusic CREATEDB;
\q
```

### 2.4 Configure PostgreSQL Authentication
```bash
sudo vim /var/lib/pgsql/data/pg_hba.conf
# Change the following lines:
# local   all             all                                     peer
# TO:
# local   all             all                                     md5

sudo systemctl restart postgresql
```

## Phase 3: Domain and SSL Configuration

### 3.1 Create Website in CyberPanel
1. Access CyberPanel: `https://your-server-ip:8090`
2. Login with admin credentials
3. Go to **Websites > Create Website**
4. Enter your domain (e.g., `waitumusic.com`)
5. Select email: `admin@waitumusic.com`
6. Package: Default
7. Click **Create Website**

### 3.2 SSL Certificate Configuration
```bash
# Install certbot for Let's Encrypt
sudo dnf install -y certbot

# Generate SSL certificate
sudo certbot certonly --webroot \
  -w /usr/local/lsws/Example/html/waitumusic.com/public_html \
  -d waitumusic.com \
  -d www.waitumusic.com \
  --email admin@waitumusic.com \
  --agree-tos \
  --non-interactive
```

### 3.3 Configure OpenLiteSpeed SSL
1. In CyberPanel: **SSL > Manage SSL**
2. Select your domain
3. **SSL Provider**: Let's Encrypt
4. Enable **Force HTTPS Redirect**
5. Click **Issue SSL**

## Phase 4: Application Deployment

### 4.1 Clone and Setup Application
```bash
# Navigate to website directory
cd /usr/local/lsws/Example/html/waitumusic.com/public_html

# Remove default files
sudo rm -rf *

# Clone application (replace with your repository)
sudo git clone https://github.com/your-username/waitumusic.git .

# Set ownership
sudo chown -R nobody:nogroup /usr/local/lsws/Example/html/waitumusic.com/

# Install dependencies
sudo -u nobody npm install --production
```

### 4.2 Environment Configuration
```bash
sudo -u nobody vim .env.production
```

```env
# Production Environment Variables
NODE_ENV=production
PORT=3000

# Database Configuration
DATABASE_URL=postgresql://waitumusic:your_secure_password_here@localhost:5432/waitumusic
PGHOST=localhost
PGPORT=5432
PGUSER=waitumusic
PGPASSWORD=your_secure_password_here
PGDATABASE=waitumusic

# Security
JWT_SECRET=your_jwt_secret_here_minimum_32_characters
SESSION_SECRET=your_session_secret_here_minimum_32_characters

# Application URLs
FRONTEND_URL=https://waitumusic.com
BACKEND_URL=https://waitumusic.com

# Email Configuration (if using SendGrid)
SENDGRID_API_KEY=your_sendgrid_api_key_here
FROM_EMAIL=noreply@waitumusic.com

# Additional Security
COOKIE_SECURE=true
TRUST_PROXY=true
```

### 4.3 Database Migration
```bash
# Run database migrations
sudo -u nobody npm run db:push

# Seed initial data if needed
sudo -u nobody npm run seed
```

### 4.4 Build Application
```bash
# Build the application
sudo -u nobody npm run build
```

## Phase 5: Process Management Configuration

### 5.1 Create PM2 Ecosystem File
```bash
sudo -u nobody vim ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'waitumusic',
    script: 'server/index.ts',
    interpreter: 'node',
    interpreter_args: '--loader tsx',
    instances: 'max',
    exec_mode: 'cluster',
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/waitumusic/error.log',
    out_file: '/var/log/waitumusic/out.log',
    log_file: '/var/log/waitumusic/combined.log',
    time: true
  }]
};
```

### 5.2 Setup Logging Directory
```bash
sudo mkdir -p /var/log/waitumusic
sudo chown -R nobody:nogroup /var/log/waitumusic
```

### 5.3 Start Application with PM2
```bash
cd /usr/local/lsws/Example/html/waitumusic.com/public_html
sudo -u nobody pm2 start ecosystem.config.js
sudo -u nobody pm2 save
```

## Phase 6: OpenLiteSpeed Proxy Configuration

### 6.1 Configure Virtual Host
1. Access CyberPanel Admin
2. Go to **OpenLiteSpeed > Virtual Hosts**
3. Select your domain
4. Click **General** tab
5. Set **Document Root**: `/usr/local/lsws/Example/html/waitumusic.com/public_html/client/dist`

### 6.2 Setup Proxy Rules
1. Go to **Script Handler** tab
2. Add new handler:
   - **Suffixes**: `*`
   - **Type**: `Proxy`
   - **Location**: `http://127.0.0.1:3000`

### 6.3 Configure Rewrite Rules
1. Go to **Rewrite** tab
2. Enable rewrite: `Yes`
3. Add rewrite rules:

```apache
RewriteEngine On

# API routes - proxy to Node.js
RewriteRule ^/api/(.*) http://127.0.0.1:3000/api/$1 [P,L]

# Static assets - serve directly
RewriteRule ^/(assets|images|icons|manifest\.json|sw\.js|robots\.txt|favicon\.ico)(.*)$ /client/dist/$1$2 [L]

# All other routes - serve React app
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /client/dist/index.html [L]
```

### 6.4 Security Headers Configuration
1. Go to **Headers** tab
2. Add security headers:

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;
```

## Phase 7: Firewall and Security

### 7.1 Configure UFW
```bash
# Reset UFW to default
sudo ufw --force reset

# Default policies
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow essential services
sudo ufw allow ssh
sudo ufw allow 'OpenSSH'
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 8090/tcp  # CyberPanel

# Enable UFW
sudo ufw enable
```

### 7.2 Fail2Ban Installation
```bash
sudo dnf install -y epel-release
sudo dnf install -y fail2ban

# Configure fail2ban
sudo vim /etc/fail2ban/jail.local
```

```ini
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = ssh
logpath = /var/log/secure
maxretry = 3

[openlitespeed]
enabled = true
port = http,https
logpath = /usr/local/lsws/logs/access.log
maxretry = 10
```

```bash
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

## Phase 8: Monitoring and Maintenance

### 8.1 Setup Log Rotation
```bash
sudo vim /etc/logrotate.d/waitumusic
```

```
/var/log/waitumusic/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 nobody nogroup
    postrotate
        sudo -u nobody pm2 reload waitumusic
    endscript
}
```

### 8.2 Automated Backups
```bash
sudo vim /usr/local/bin/waitumusic-backup.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/backup/waitumusic"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
pg_dump -h localhost -U waitumusic waitumusic | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Application backup
tar -czf $BACKUP_DIR/app_$DATE.tar.gz -C /usr/local/lsws/Example/html/waitumusic.com public_html

# Remove backups older than 30 days
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete
```

```bash
sudo chmod +x /usr/local/bin/waitumusic-backup.sh

# Add to crontab
sudo crontab -e
# Add: 0 2 * * * /usr/local/bin/waitumusic-backup.sh
```

### 8.3 Health Check Script
```bash
sudo vim /usr/local/bin/waitumusic-health.sh
```

```bash
#!/bin/bash
# Health check for WaituMusic

# Check if PM2 process is running
if ! sudo -u nobody pm2 list | grep -q "waitumusic.*online"; then
    echo "$(date): WaituMusic process is down, restarting..." >> /var/log/waitumusic/health.log
    sudo -u nobody pm2 restart waitumusic
fi

# Check if application responds
if ! curl -f -s http://localhost:3000/api/health > /dev/null; then
    echo "$(date): WaituMusic API not responding, restarting..." >> /var/log/waitumusic/health.log
    sudo -u nobody pm2 restart waitumusic
fi
```

```bash
sudo chmod +x /usr/local/bin/waitumusic-health.sh

# Add to crontab (check every 5 minutes)
sudo crontab -e
# Add: */5 * * * * /usr/local/bin/waitumusic-health.sh
```

## Phase 9: Final Configuration and Testing

### 9.1 Restart All Services
```bash
sudo systemctl restart lsws
sudo systemctl restart postgresql
sudo -u nobody pm2 restart all
```

### 9.2 Test SSL and Proxy
```bash
# Test SSL certificate
curl -I https://waitumusic.com

# Test API proxy
curl -I https://waitumusic.com/api/health

# Test static file serving
curl -I https://waitumusic.com/assets/logo.png
```

### 9.3 Performance Optimization
```bash
# Optimize OpenLiteSpeed
# In CyberPanel: Actions > Server Tuning
# Set appropriate values based on server resources

# Optimize PostgreSQL
sudo vim /var/lib/pgsql/data/postgresql.conf
# Adjust based on server resources:
# shared_buffers = 256MB
# effective_cache_size = 1GB
# work_mem = 4MB
# maintenance_work_mem = 64MB

sudo systemctl restart postgresql
```

## Troubleshooting Common Issues

### SSL Certificate Issues
```bash
# Check certificate status
sudo certbot certificates

# Renew certificates
sudo certbot renew --dry-run

# Force renewal if needed
sudo certbot renew --force-renewal
```

### Proxy Issues
```bash
# Check OpenLiteSpeed error logs
sudo tail -f /usr/local/lsws/logs/error.log

# Check application logs
sudo -u nobody pm2 logs waitumusic

# Restart OpenLiteSpeed
sudo systemctl restart lsws
```

### Database Connection Issues
```bash
# Test database connection
sudo -u postgres psql -d waitumusic -c "SELECT version();"

# Check PostgreSQL logs
sudo tail -f /var/lib/pgsql/data/log/postgresql-*.log
```

## Security Checklist
- [ ] SSL certificate installed and working
- [ ] HTTP to HTTPS redirect enabled
- [ ] Security headers configured
- [ ] Firewall rules applied
- [ ] Fail2ban configured
- [ ] Database secured with strong passwords
- [ ] Application running as non-root user
- [ ] Log rotation configured
- [ ] Automated backups enabled
- [ ] Health monitoring active

## Post-Deployment Verification
1. Visit `https://waitumusic.com` - should load without SSL warnings
2. Test API endpoints: `https://waitumusic.com/api/health`
3. Check mobile responsiveness
4. Verify all authentication flows work
5. Test booking and payment systems
6. Confirm email notifications work
7. Validate PWA installation capabilities

This deployment configuration ensures:
- Zero SSL errors with proper Let's Encrypt integration
- Perfect proxy configuration for API and static files
- Production-ready security and monitoring
- Automated maintenance and health checks
- Optimal performance for the WaituMusic platform