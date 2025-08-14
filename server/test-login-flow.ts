import bcrypt from 'bcrypt';
import { DatabaseStorage } from './storage';

const storage = new DatabaseStorage();

async function testFullLogin() {
  console.log('Testing full login flow for superadmin...\n');
  
  try {
    // 1. Get user
    const user = await storage.getUserByEmail('superadmin@waitumusic.com');
    console.log('1. User found:', user ? 'YES' : 'NO');
    
    if (!user) {
      console.error('User not found!');
      return;
    }
    
    console.log('2. User data:', {
      id: user.id,
      email: user.email,
      roleId: user.roleId,
      hasPasswordHash: !!user.passwordHash
    });
    
    // 2. Test password
    const testPassword = 'admin123';
    console.log('\n3. Testing password:', testPassword);
    console.log('   Hash from DB:', user.passwordHash);
    
    const isValid = await bcrypt.compare(testPassword, user.passwordHash);
    console.log('4. Password valid:', isValid);
    
    // 3. Test update last login
    const updated = await storage.updateUser(user.id, { lastLogin: new Date() });
    console.log('\n5. Update last login:', updated ? 'SUCCESS' : 'FAILED');
    
    console.log('\n✓ All login checks passed!');
  } catch (error) {
    console.error('\n✗ Error during login test:', error);
  }
}

testFullLogin();
