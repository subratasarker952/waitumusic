#!/usr/bin/env node

// WaituMusic Database Connection Test Script
// Tests various connection methods to diagnose network issues

const { Pool } = require('@neondatabase/serverless');
const { Client } = require('pg');
const fs = require('fs');

// Colors for output
const colors = {
  red: '\033[0;31m',
  green: '\033[0;32m',
  yellow: '\033[1;33m',
  blue: '\033[0;34m',
  nc: '\033[0m'
};

function print(message, color = 'nc') {
  console.log(`${colors[color]}${message}${colors.nc}`);
}

async function testConnection() {
  print('🔍 WaituMusic Database Connection Diagnostic', 'blue');
  print('===========================================', 'blue');
  
  // Load environment variables
  let envConfig = {};
  
  try {
    if (fs.existsSync('.env.production')) {
      const envFile = fs.readFileSync('.env.production', 'utf8');
      envFile.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
          envConfig[key.trim()] = value.trim();
        }
      });
      print('✓ Environment file loaded', 'green');
    } else {
      print('⚠ No .env.production file found', 'yellow');
      return;
    }
  } catch (error) {
    print(`✗ Error loading environment: ${error.message}`, 'red');
    return;
  }
  
  const databaseUrl = envConfig.DATABASE_URL || process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    print('✗ DATABASE_URL not found in environment', 'red');
    return;
  }
  
  // Parse DATABASE_URL
  let connectionConfig;
  try {
    const url = new URL(databaseUrl);
    connectionConfig = {
      host: url.hostname,
      port: url.port || 5432,
      database: url.pathname.slice(1),
      user: url.username,
      password: url.password
    };
    
    print(`📋 Connection Configuration:`, 'blue');
    print(`   Host: ${connectionConfig.host}`);
    print(`   Port: ${connectionConfig.port}`);
    print(`   Database: ${connectionConfig.database}`);
    print(`   User: ${connectionConfig.user}`);
    print(`   Password: ${'*'.repeat(connectionConfig.password?.length || 0)}`);
    print('');
    
  } catch (error) {
    print(`✗ Invalid DATABASE_URL format: ${error.message}`, 'red');
    return;
  }
  
  // Test 1: Basic pg Client connection
  print('🧪 Test 1: Basic PostgreSQL Client Connection', 'blue');
  try {
    const client = new Client({
      host: connectionConfig.host,
      port: connectionConfig.port,
      database: connectionConfig.database,
      user: connectionConfig.user,
      password: connectionConfig.password,
      connectionTimeoutMillis: 10000,
    });
    
    await client.connect();
    const result = await client.query('SELECT version()');
    print('✓ Basic client connection successful', 'green');
    print(`   PostgreSQL Version: ${result.rows[0].version.split(' ')[1]}`);
    await client.end();
    
  } catch (error) {
    print(`✗ Basic client connection failed: ${error.message}`, 'red');
    
    if (error.code === 'ECONNREFUSED') {
      print('   → PostgreSQL server is not running or not accepting connections', 'yellow');
      print('   → Try: sudo systemctl start postgresql', 'yellow');
    } else if (error.code === 'ENOTFOUND') {
      print('   → Host not found. Check your host configuration', 'yellow');
    } else if (error.message.includes('password authentication failed')) {
      print('   → Password authentication failed. Check credentials', 'yellow');
    } else if (error.message.includes('database') && error.message.includes('does not exist')) {
      print('   → Database does not exist. Create it first', 'yellow');
    }
  }
  
  // Test 2: Neon serverless connection (used by application)
  print('');
  print('🧪 Test 2: Neon Serverless Connection (Application Method)', 'blue');
  try {
    const pool = new Pool({
      connectionString: databaseUrl,
      connectionTimeoutMillis: 10000,
    });
    
    const result = await pool.query('SELECT NOW() as current_time');
    print('✓ Neon serverless connection successful', 'green');
    print(`   Current Time: ${result.rows[0].current_time}`);
    await pool.end();
    
  } catch (error) {
    print(`✗ Neon serverless connection failed: ${error.message}`, 'red');
    
    if (error.message.includes('Received network error or non-101 status code')) {
      print('   → This is the error you\'re experiencing!', 'yellow');
      print('   → Network connectivity issue or PostgreSQL not properly configured', 'yellow');
      print('   → Check firewall and PostgreSQL configuration', 'yellow');
    }
  }
  
  // Test 3: Connection pool test
  print('');
  print('🧪 Test 3: Connection Pool Test', 'blue');
  try {
    const { Pool: StandardPool } = require('pg');
    const pool = new StandardPool({
      host: connectionConfig.host,
      port: connectionConfig.port,
      database: connectionConfig.database,
      user: connectionConfig.user,
      password: connectionConfig.password,
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
    
    const result = await pool.query('SELECT current_database(), current_user');
    print('✓ Connection pool test successful', 'green');
    print(`   Database: ${result.rows[0].current_database}`);
    print(`   User: ${result.rows[0].current_user}`);
    await pool.end();
    
  } catch (error) {
    print(`✗ Connection pool test failed: ${error.message}`, 'red');
  }
  
  // Test 4: Database tables check
  print('');
  print('🧪 Test 4: Database Schema Check', 'blue');
  try {
    const client = new Client({
      host: connectionConfig.host,
      port: connectionConfig.port,
      database: connectionConfig.database,
      user: connectionConfig.user,
      password: connectionConfig.password,
    });
    
    await client.connect();
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    if (result.rows.length > 0) {
      print('✓ Database schema exists', 'green');
      print('   Tables found:');
      result.rows.forEach(row => {
        print(`     - ${row.table_name}`);
      });
    } else {
      print('⚠ No tables found in database (migration needed)', 'yellow');
    }
    
    await client.end();
    
  } catch (error) {
    print(`✗ Schema check failed: ${error.message}`, 'red');
  }
  
  // Diagnostic summary
  print('');
  print('📊 Diagnostic Summary & Recommendations', 'blue');
  print('=====================================', 'blue');
  
  if (databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1')) {
    print('🔧 Local PostgreSQL Configuration:');
    print('   1. Ensure PostgreSQL is running: sudo systemctl status postgresql');
    print('   2. Check PostgreSQL logs: sudo journalctl -u postgresql -f');
    print('   3. Verify pg_hba.conf allows connections: sudo cat /var/lib/pgsql/data/pg_hba.conf');
    print('   4. Test direct connection: psql -h localhost -U waitumusic_user -d waitumusic_production');
  }
  
  print('');
  print('🛠️ Quick Fixes to Try:');
  print('   1. Restart PostgreSQL: sudo systemctl restart postgresql');
  print('   2. Check firewall: sudo firewall-cmd --list-ports');
  print('   3. Verify database exists: sudo -u postgres psql -l | grep waitumusic');
  print('   4. Reset password: sudo -u postgres psql -c "ALTER USER waitumusic_user PASSWORD \'newpass\';"');
  print('');
  print('📞 If issues persist, run: ./scripts/database-setup.sh');
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  print(`Unhandled Rejection at: ${promise}, reason: ${reason}`, 'red');
});

// Run the test
testConnection().catch(error => {
  print(`Fatal error: ${error.message}`, 'red');
  process.exit(1);
});