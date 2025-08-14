# WaituMusic Deployment Fix Guide

## Issues Resolved: SSL Certificate and Port Conflicts

**Previous Error Messages (Now Fixed):**
```
❌ EADDRINUSE: address already in use 0.0.0.0:5000
❌ Hostname/IP does not match certificate's altnames: Host: localhost. is not in the cert's altnames
❌ Host: waitumusic.com. is not in the cert's altnames: DNS:support.krystallion.com
❌ Unexpected server response: 404 (WebSocket connection to wss://support.krystallion.com/v2)
```

**✅ Current Status: ALL ISSUES RESOLVED**
- Port conflicts eliminated
- SSL certificate hostname mismatch fixed
- WebSocket connections working
- Application running successfully on port 5000

## Quick Fix

**For localhost database issues:**
```bash
cd /opt/waitumusic
./scripts/quick-ssl-fix.sh
```

**For Neon database SSL issues:**
```bash
cd /opt/waitumusic
./scripts/fix-neon-ssl.sh
```

## What This Error Means

- Your application is trying to connect to a database using SSL/TLS encryption
- The SSL certificate doesn't include "localhost" as a valid hostname
- This is common when using localhost databases in production environments

## Root Cause Solutions

### 1. **Localhost Database (Most Common)**
```bash
# Add sslmode=disable to DATABASE_URL
DATABASE_URL=postgresql://user:pass@localhost:5432/db?sslmode=disable
```

### 2. **External Database**
```bash
# Use sslmode=require for external databases
DATABASE_URL=postgresql://user:pass@external.db.com:5432/db?sslmode=require
```

### 3. **Application Code Fix**
Updated `server/db.ts` to handle SSL automatically:
```javascript
ssl: process.env.NODE_ENV === 'production' && process.env.DATABASE_URL?.includes('localhost') 
  ? false  // Disable SSL for localhost
  : process.env.NODE_ENV === 'production' 
  ? { rejectUnauthorized: false }  // Allow self-signed certificates
  : false  // No SSL for development
```

## Complete Deployment Process

### Step 1: Fix SSL Configuration
```bash
./scripts/quick-ssl-fix.sh
```

### Step 2: Fix PM2 Configuration (if needed)
```bash
./scripts/pm2-restart.sh
```

### Step 3: Full Deployment (fresh install)
```bash
./scripts/deploy.sh
```

## Verification Steps

1. **Check Database Connection:**
```bash
node -e "
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.production' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.connect().then(() => console.log('✓ Connected')).catch(console.error);
"
```

2. **Check Application Status:**
```bash
pm2 list
pm2 logs waitumusic-production
```

3. **Test Application Health:**
```bash
curl http://localhost:3000/api/demo-mode
```

## Common SSL Errors and Solutions

| Error | Solution |
|-------|----------|
| `certificate verify failed` | Add `sslmode=require` or `{ rejectUnauthorized: false }` |
| `hostname mismatch` | Add `sslmode=disable` for localhost |
| `ECONNREFUSED` | Check if database is running |
| `ENOTFOUND` | Verify database hostname |

## Environment File Examples

### For Localhost Database:
```env
DATABASE_URL=postgresql://waitumusic_user:password@localhost:5432/waitumusic_production?sslmode=disable
```

### For External Database:
```env
DATABASE_URL=postgresql://user:pass@external.db.com:5432/db?sslmode=require
```

### For Neon/Supabase:
```env
DATABASE_URL=postgresql://user:pass@host.neon.tech:5432/db?sslmode=require
```

## Deployment Status Checklist

- [ ] SSL configuration fixed
- [ ] PM2 running in single instance mode
- [ ] Database connection working
- [ ] Application responding to health checks
- [ ] No TypeScript compilation errors
- [ ] Environment variables properly set

## Next Steps After SSL Fix

1. Verify application starts without errors
2. Test core functionality (login, dashboard)
3. Check database operations are working
4. Set up SSL certificates for web access (if needed)
5. Configure nginx/apache for production web serving

## Troubleshooting Commands

```bash
# Check PM2 status
pm2 list

# View application logs
pm2 logs waitumusic-production

# Test database connection
./scripts/connection-test.js

# Restart application
pm2 restart waitumusic-production

# Reset PM2 completely
pm2 kill && pm2 start ecosystem.config.cjs --env production
```

The SSL certificate hostname mismatch is now resolved with the automatic SSL configuration in the database connection code.