#!/usr/bin/env node

/**
 * Comprehensive Platform Testing Script
 * Tests all critical user flows, authentication, and platform functionality
 */

import http from 'http';

const BASE_URL = 'http://localhost:5000';

// Test configuration
const TEST_USERS = [
  { email: 'superadmin@waitumusic.com', password: 'secret123', role: 'superadmin' },
  { email: 'admin@waitumusic.com', password: 'secret123', role: 'admin' },
  { email: 'lilioctave@waitumusic.com', password: 'secret123', role: 'managed_artist' },
  { email: 'fan@waitumusic.com', password: 'secret123', role: 'fan' },
  { email: 'jcro@waitumusic.com', password: 'secret123', role: 'managed_musician' },
  { email: 'consultant@waitumusic.com', password: 'secret123', role: 'consultant' }
];

const API_ENDPOINTS = [
  '/api/demo-mode',
  '/api/opportunities',
  '/api/artists',
  '/api/bookings',
  '/api/songs',
  '/api/users',
  '/api/dashboard-stats'
];

// Helper function to make HTTP requests
function makeRequest(path, method = 'GET', data = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({ status: res.statusCode, data: jsonBody });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Test authentication for all users
async function testAuthentication() {
  console.log('\n🔐 Testing Authentication for All Users...');
  const results = [];

  for (const user of TEST_USERS) {
    try {
      const response = await makeRequest('/api/auth/login', 'POST', {
        email: user.email,
        password: user.password
      });

      const success = response.status === 200 && response.data.token;
      results.push({
        user: user.role,
        email: user.email,
        status: success ? 'PASS' : 'FAIL',
        details: success ? 'Login successful' : `Failed: ${JSON.stringify(response.data)}`
      });

      console.log(`  ${success ? '✅' : '❌'} ${user.role}: ${success ? 'PASS' : 'FAIL'}`);
    } catch (error) { 
      results.push({
        user: user.role,
        email: user.email,
        status: 'FAIL',
        details: `Error: ${error.message}`
      });
      console.log(`  ❌ ${user.role}: FAIL - ${error.message}`);
    }
  }

  return results;
}

// Test API endpoints accessibility
async function testAPIEndpoints() {
  console.log('\n🌐 Testing API Endpoints...');
  const results = [];

  for (const endpoint of API_ENDPOINTS) {
    try {
      const response = await makeRequest(endpoint);
      const success = response.status < 400;
      
      results.push({
        endpoint,
        status: success ? 'PASS' : 'FAIL',
        httpStatus: response.status,
        details: success ? 'Accessible' : `HTTP ${response.status}`
      });

      console.log(`  ${success ? '✅' : '❌'} ${endpoint}: ${success ? 'PASS' : 'FAIL'} (${response.status})`);
    } catch (error) {
      results.push({
        endpoint,
        status: 'FAIL',
        httpStatus: 'ERROR',
        details: error.message
      });
      console.log(`  ❌ ${endpoint}: FAIL - ${error.message}`);
    }
  }

  return results;
}

// Test critical user flows with authentication
async function testUserFlows() {
  console.log('\n👥 Testing Critical User Flows...');
  
  // Test 1: User Registration Flow
  console.log('  Testing User Registration Flow...');
  try {
    const newUserData = {
      email: `test-${Date.now()}@waitumusic.com`,
      password: 'testpass123',
      fullName: 'Test User',
      roleId: 6 // fan role
    };

    const regResponse = await makeRequest('/api/register', 'POST', newUserData);
    const regSuccess = regResponse.status === 200 || regResponse.status === 201;
    console.log(`    ${regSuccess ? '✅' : '❌'} Registration: ${regSuccess ? 'PASS' : 'FAIL'}`);
  } catch (error) {
    console.log(`    ❌ Registration: FAIL - ${error.message}`);
  }

  // Test 2: Authenticated Opportunity Discovery
  console.log('  Testing OppHub Opportunity Discovery (Authenticated)...');
  try {
    // Get token first
    const loginResponse = await makeRequest('/api/auth/login', 'POST', {
      email: 'superadmin@waitumusic.com',
      password: 'secret123'
    });
    
    if (loginResponse.status === 200 && loginResponse.data.token) {
      const token = loginResponse.data.token;
      const oppResponse = await makeRequest('/api/opportunities', 'GET', null, token);
      const oppSuccess = oppResponse.status === 200;
      const oppCount = Array.isArray(oppResponse.data) ? oppResponse.data.length : 0;
      console.log(`    ${oppSuccess ? '✅' : '❌'} OppHub: ${oppSuccess ? 'PASS' : 'FAIL'} (${oppCount} opportunities)`);
    } else {
      console.log(`    ❌ OppHub: FAIL - Authentication failed`);
    }
  } catch (error) {
    console.log(`    ❌ OppHub: FAIL - ${error.message}`);
  }

  // Test 3: Artist Profile Access
  console.log('  Testing Artist Profile Access...');
  try {
    const artistResponse = await makeRequest('/api/artists');
    const artistSuccess = artistResponse.status === 200;
    const artistCount = Array.isArray(artistResponse.data) ? artistResponse.data.length : 0;
    console.log(`    ${artistSuccess ? '✅' : '❌'} Artist Profiles: ${artistSuccess ? 'PASS' : 'FAIL'} (${artistCount} artists)`);
  } catch (error) {
    console.log(`    ❌ Artist Profiles: FAIL - ${error.message}`);
  }

  // Test 4: Full Authentication Flow for Managed Artist
  console.log('  Testing Managed Artist Authentication Flow...');
  try {
    const loginResponse = await makeRequest('/api/auth/login', 'POST', {
      email: 'lilioctave@waitumusic.com',
      password: 'secret123'
    });
    
    if (loginResponse.status === 200 && loginResponse.data.token) {
      const token = loginResponse.data.token;
      
      // Test accessing user profile with token
      const profileResponse = await makeRequest('/api/user/profile', 'GET', null, token);
      const profileSuccess = profileResponse.status === 200;
      
      console.log(`    ${profileSuccess ? '✅' : '❌'} Managed Artist Flow: ${profileSuccess ? 'PASS' : 'FAIL'}`);
      
      if (profileSuccess && profileResponse.data) {
        console.log(`      - Artist: ${profileResponse.data.fullName}`);
        console.log(`      - Role ID: ${profileResponse.data.roleId}`);
      }
    } else {
      console.log(`    ❌ Managed Artist Flow: FAIL - Authentication failed`);
    }
  } catch (error) {
    console.log(`    ❌ Managed Artist Flow: FAIL - ${error.message}`);
  }
}

// Run comprehensive platform test
async function runComprehensiveTest() {
  console.log('🎯 WaituMusic Platform Comprehensive Testing');
  console.log('===========================================');

  const startTime = Date.now();

  // Run all tests
  const authResults = await testAuthentication();
  const apiResults = await testAPIEndpoints();
  await testUserFlows();

  // Generate summary
  const authPassed = authResults.filter(r => r.status === 'PASS').length;
  const authTotal = authResults.length;
  const apiPassed = apiResults.filter(r => r.status === 'PASS').length;
  const apiTotal = apiResults.length;

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  console.log('\n📊 TEST SUMMARY');
  console.log('===============');
  console.log(`Authentication: ${authPassed}/${authTotal} passed`);
  console.log(`API Endpoints: ${apiPassed}/${apiTotal} passed`);
  console.log(`Duration: ${duration} seconds`);

  // Identify critical issues
  const failedAuth = authResults.filter(r => r.status === 'FAIL');
  const failedAPIs = apiResults.filter(r => r.status === 'FAIL');

  if (failedAuth.length > 0) {
    console.log('\n❌ CRITICAL AUTHENTICATION ISSUES:');
    failedAuth.forEach(failure => {
      console.log(`  - ${failure.user} (${failure.email}): ${failure.details}`);
    });
  }

  if (failedAPIs.length > 0) {
    console.log('\n❌ FAILED API ENDPOINTS:');
    failedAPIs.forEach(failure => {
      console.log(`  - ${failure.endpoint}: ${failure.details}`);
    });
  }

  if (failedAuth.length === 0 && failedAPIs.length === 0) {
    console.log('\n✅ All critical systems operational!');
  }

  console.log('\n🎯 Test complete. Platform audit finished.');
}

// Run the test
runComprehensiveTest().catch(console.error);