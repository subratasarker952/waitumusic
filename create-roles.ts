
import { db, sql } from './server/db.js';

async function createRoles() {
  const roles = [
    { id: 1, name: 'superadmin' },
    { id: 2, name: 'admin' }, 
    { id: 3, name: 'managed_artist' },
    { id: 6, name: 'artist' },
    { id: 7, name: 'professional' },
    { id: 8, name: 'managed_musician' },
    { id: 9, name: 'fan' }
  ];

  console.log('Creating basic roles...');
  for (const role of roles) {
    try {
      await sql`INSERT INTO roles (id, name) VALUES (${role.id}, ${role.name}) ON CONFLICT (id) DO NOTHING`;
      console.log(`✅ Created role: ${role.id} - ${role.name}`);
    } catch (error) {
      console.log(`ℹ️ Role ${role.name} might already exist:`, error);
    }
  }

  console.log('Roles creation completed');
  process.exit(0);
}

createRoles();
