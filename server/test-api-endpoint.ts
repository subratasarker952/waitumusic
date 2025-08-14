import fetch from 'node-fetch';

async function testLoginEndpoint() {
  const url = 'http://localhost:5000/api/auth/login';
  const body = {
    email: 'superadmin@waitumusic.com',
    password: 'admin123'
  };

  console.log('Testing login endpoint:', url);
  console.log('Request body:', body);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', data);
  } catch (error) {
    console.error('Request failed:', error);
  }
}

testLoginEndpoint();
