// Quick test to verify configuration system is working
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

async function testConfigurationAPI() {
  console.log('🧪 Testing Configuration API...');
  
  try {
    // Test getting platform configuration
    console.log('1. Testing GET /api/admin/configuration');
    const response = await fetch(`${BASE_URL}/api/admin/configuration`, {
      headers: {
        'Authorization': 'Bearer test-token' // Would use real token in production
      }
    });
    
    if (response.ok) {
      const config = await response.json();
      console.log('✅ Configuration fetched successfully');
      console.log('📊 Configuration keys:', Object.keys(config));
    } else {
      console.log('❌ Configuration fetch failed:', response.status);
    }
    
    // Test getting configuration history
    console.log('2. Testing GET /api/admin/configuration/history');
    const historyResponse = await fetch(`${BASE_URL}/api/admin/configuration/history`, {
      headers: {
        'Authorization': 'Bearer test-token'
      }
    });
    
    if (historyResponse.ok) {
      const history = await historyResponse.json();
      console.log('✅ Configuration history fetched successfully');
      console.log('📊 History entries:', history.length);
    } else {
      console.log('❌ Configuration history fetch failed:', historyResponse.status);
    }
    
    console.log('🎉 Configuration API test completed');
    
  } catch (error) {
    console.error('❌ Configuration API test failed:', error.message);
  }
}

// Run the test
testConfigurationAPI();