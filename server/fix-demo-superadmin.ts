import bcrypt from 'bcrypt';
import { db } from './db';
import * as schema from '@shared/schema';
import { eq } from 'drizzle-orm';

async function fixDemoSuperadmin() {
  console.log('Fixing demo superadmin password...');
  
  try {
    // Generate correct hash for 'demo123'
    const correctHash = await bcrypt.hash('demo123', 10);
    console.log('Generated new hash for demo123');
    
    // Update the demo superadmin password
    const result = await db
      .update(schema.users)
      .set({ passwordHash: correctHash })
      .where(eq(schema.users.email, 'demo.superadmin@waitumusic.com'));
    
    console.log('✅ Demo superadmin password updated successfully');
    console.log('You can now login with:');
    console.log('Email: demo.superadmin@waitumusic.com');
    console.log('Password: demo123');
  } catch (error) {
    console.error('Error:', error);
  }
  
  process.exit(0);
}

fixDemoSuperadmin();
