import fetch from 'node-fetch';

async function testDemoLoginNow() {
  const url = 'http://localhost:5000/api/auth/login';
  const body = {
    email: 'demo.superadmin@waitumusic.com',
    password: 'demo123'
  };

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
    console.log('Response:', data);
  } catch (error) {
    console.error('Request failed:', error);
  }
}

testDemoLoginNow();
