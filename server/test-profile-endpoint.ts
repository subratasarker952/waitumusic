import fetch from 'node-fetch';

async function testProfileEndpoint() {
  // First login to get token
  const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: 'superadmin@waitumusic.com',
      password: 'admin123'
    })
  });

  const loginData = await loginResponse.json();
  console.log('Login successful, token received');

  // Now test profile endpoint
  const profileResponse = await fetch('http://localhost:5000/api/user/profile', {
    headers: {
      'Authorization': `Bearer ${loginData.token}`
    }
  });

  console.log('Profile response status:', profileResponse.status);
  const profileData = await profileResponse.json();
  console.log('Profile data:', JSON.stringify(profileData, null, 2));
}

testProfileEndpoint().catch(console.error);
