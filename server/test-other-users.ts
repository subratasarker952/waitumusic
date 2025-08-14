import { DatabaseStorage } from './storage';
import bcrypt from 'bcrypt';

const storage = new DatabaseStorage();

async function testOtherUsers() {
  console.log('Checking other user accounts...\n');
  
  try {
    // Get a few other users
    const users = await storage.db.select().from(storage.schema.users).limit(5);
    
    for (const user of users) {
      console.log(`User: ${user.email} (Role: ${user.roleId}, Status: ${user.status})`);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testOtherUsers();
