import { DatabaseStorage } from './storage';

const storage = new DatabaseStorage();

async function testLogin() {
  console.log('Testing superadmin login...');
  
  try {
    const user = await storage.getUserByEmail('superadmin@waitumusic.com');
    console.log('User found:', user ? 'YES' : 'NO');
    if (user) {
      console.log('User data:', {
        id: user.id,
        email: user.email,
        roleId: user.roleId,
        passwordHash: user.passwordHash ? 'HASH_EXISTS' : 'NO_HASH'
      });
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testLogin();
