#!/usr/bin/env node

/**
 * Comprehensive Role-Based Access Control Verification
 * Tests actual user access across all major platform components
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

// Test users for each role type (using actual demo users from database)
const TEST_USERS = {
  superadmin: { email: 'demo.superadmin@waitumusic.com', password: 'secret123', expectedRoleId: 1 },
  admin: { email: 'kay.louisy@waitumusic.com', password: 'secret123', expectedRoleId: 2 },
  managed_artist: { email: 'demo.fm.luna.soul@waitumusic.com', password: 'secret123', expectedRoleId: 3 },
  artist: { email: 'demo.rp.nova.pop@waitumusic.com', password: 'secret123', expectedRoleId: 4 },
  managed_musician: { email: 'demo.fm.maya.bass@waitumusic.com', password: 'secret123', expectedRoleId: 5 },
  musician: { email: 'demo.um.session.sax@waitumusic.com', password: 'secret123', expectedRoleId: 6 },
  managed_professional: { email: 'demo.fm.sage.audio@waitumusic.com', password: 'secret123', expectedRoleId: 7 },
  professional: { email: 'demo.rp.blaze.producer@waitumusic.com', password: 'secret123', expectedRoleId: 8 },
  fan: { email: 'demo.um.concert.fan@waitumusic.com', password: 'secret123', expectedRoleId: 9 }
};

// Critical API endpoints to test
const API_ENDPOINTS = [
  // Admin-only endpoints
  { url: '/api/admin/users', expectedRoles: [1, 2] },
  { url: '/api/admin/config', expectedRoles: [1] },
  { url: '/api/admin/dashboard-stats', expectedRoles: [1, 2] },
  
  // Booking endpoints
  { url: '/api/bookings', expectedRoles: [1, 2, 3, 5, 7] },
  { url: '/api/booking-assignments', expectedRoles: [1, 2] },
  
  // OppHub endpoints (non-fan users only)
  { url: '/api/opphub/opportunities', expectedRoles: [1, 2, 3, 4, 5, 6, 7, 8] },
  { url: '/api/opphub/scan', expectedRoles: [1, 2, 3, 4, 5, 6, 7, 8] },
  
  // Content management
  { url: '/api/merchandise', expectedRoles: [3, 4, 5, 6, 7] },
  { url: '/api/splitsheets', expectedRoles: [3, 4, 5, 6] },
  { url: '/api/technical-riders', expectedRoles: [3, 4, 5, 6] },
  { url: '/api/newsletters', expectedRoles: [3, 4, 5, 6, 7] },
  
  // General access
  { url: '/api/artists', expectedRoles: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
  { url: '/api/user/profile', expectedRoles: [1, 2, 3, 4, 5, 6, 7, 8, 9] }
];

async function login(user) {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email, password: user.password })
    });
    
    if (!response.ok) {
      throw new Error(`Login failed for ${user.email}: ${response.status}`);
    }
    
    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error(`❌ Login failed for ${user.email}:`, error.message);
    return null;
  }
}

async function testApiAccess(endpoint, token, userRole, expectedRoles) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint.url}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const shouldHaveAccess = expectedRoles.includes(userRole);
    const hasAccess = response.status !== 401 && response.status !== 403;
    
    if (shouldHaveAccess === hasAccess) {
      return { success: true, status: response.status, hasAccess };
    } else {
      return { 
        success: false, 
        status: response.status, 
        hasAccess, 
        shouldHaveAccess,
        error: `Access mismatch: expected ${shouldHaveAccess ? 'allowed' : 'denied'}, got ${hasAccess ? 'allowed' : 'denied'}`
      };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function runComprehensiveTest() {
  console.log('🔐 Starting Comprehensive Role-Based Access Control Test\n');
  
  const results = {
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    userResults: {},
    endpointResults: {}
  };
  
  // Test each user role
  for (const [roleName, userData] of Object.entries(TEST_USERS)) {
    console.log(`\n📋 Testing ${roleName.toUpperCase()} (Role ID: ${userData.expectedRoleId})`);
    console.log(`   Email: ${userData.email}`);
    
    const token = await login(userData);
    if (!token) {
      console.log(`   ❌ Could not obtain token for ${roleName}`);
      results.userResults[roleName] = { error: 'Login failed', tests: [] };
      continue;
    }
    
    console.log(`   ✅ Login successful`);
    
    const userTests = [];
    
    // Test each endpoint for this user
    for (const endpoint of API_ENDPOINTS) {
      const testResult = await testApiAccess(endpoint, token, userData.expectedRoleId, endpoint.expectedRoles);
      results.totalTests++;
      
      if (testResult.success) {
        results.passedTests++;
        console.log(`   ✅ ${endpoint.url}: ${testResult.hasAccess ? 'ALLOWED' : 'DENIED'} (correct)`);
      } else {
        results.failedTests++;
        console.log(`   ❌ ${endpoint.url}: ${testResult.error}`);
        console.log(`      Status: ${testResult.status}, Has Access: ${testResult.hasAccess}`);
      }
      
      userTests.push({
        endpoint: endpoint.url,
        result: testResult,
        expectedRoles: endpoint.expectedRoles,
        userRole: userData.expectedRoleId
      });
    }
    
    results.userResults[roleName] = {
      roleId: userData.expectedRoleId,
      email: userData.email,
      loginSuccess: true,
      tests: userTests
    };
  }
  
  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('🎯 TEST RESULTS SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total Tests: ${results.totalTests}`);
  console.log(`Passed: ${results.passedTests} (${((results.passedTests / results.totalTests) * 100).toFixed(1)}%)`);
  console.log(`Failed: ${results.failedTests} (${((results.failedTests / results.totalTests) * 100).toFixed(1)}%)`);
  
  // Failed tests details
  if (results.failedTests > 0) {
    console.log('\n❌ FAILED TESTS:');
    for (const [roleName, userData] of Object.entries(results.userResults)) {
      if (userData.tests) {
        for (const test of userData.tests) {
          if (!test.result.success) {
            console.log(`   ${roleName} -> ${test.endpoint}: ${test.result.error}`);
          }
        }
      }
    }
  }
  
  // Endpoint-specific analysis
  console.log('\n📊 ENDPOINT ACCESS MATRIX:');
  const endpointMatrix = {};
  for (const endpoint of API_ENDPOINTS) {
    endpointMatrix[endpoint.url] = {
      expectedRoles: endpoint.expectedRoles,
      actualAccess: []
    };
    
    for (const [roleName, userData] of Object.entries(results.userResults)) {
      if (userData.tests) {
        const test = userData.tests.find(t => t.endpoint === endpoint.url);
        if (test && test.result.hasAccess) {
          endpointMatrix[endpoint.url].actualAccess.push(userData.roleId);
        }
      }
    }
    
    const expected = endpoint.expectedRoles.sort().join(',');
    const actual = endpointMatrix[endpoint.url].actualAccess.sort().join(',');
    const matches = expected === actual;
    
    console.log(`   ${matches ? '✅' : '❌'} ${endpoint.url}`);
    console.log(`      Expected roles: [${expected}]`);
    console.log(`      Actual access:  [${actual}]`);
  }
  
  return results;
}

// Run the test
runComprehensiveTest()
  .then(results => {
    console.log('\n🏁 Test completed');
    process.exit(results.failedTests > 0 ? 1 : 0);
  })
  .catch(error => {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  });

export { runComprehensiveTest };