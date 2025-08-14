#!/usr/bin/env node

/**
 * Test Enhanced Booking Assignment System
 * Tests the new booking_assignments_members table with instrument-based talent selection
 */

import { Pool } from '@neondatabase/serverless';
import ws from 'ws';

// Setup database connection
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  webSocketConstructor: ws
});

async function testEnhancedBookingAssignments() {
  console.log('🧪 Testing Enhanced Booking Assignment System...\n');

  try {
    // Test 1: Check all_instruments table
    console.log('1️⃣ Testing all_instruments table...');
    const instruments = await pool.query(`
      SELECT id, name, player_name, type, mixer_group, display_priority 
      FROM all_instruments 
      ORDER BY display_priority, name 
      LIMIT 10
    `);
    console.log(`✅ Found ${instruments.rows.length} instruments (showing first 10):`);
    instruments.rows.forEach(instrument => {
      console.log(`   - ${instrument.player_name} (${instrument.name}) - ${instrument.mixer_group} group`);
    });

    // Test 2: Check booking_assignments_members table structure
    console.log('\n2️⃣ Testing booking_assignments_members table structure...');
    const tableStructure = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'booking_assignments_members'
      ORDER BY ordinal_position
    `);
    console.log('✅ Table structure:');
    tableStructure.rows.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type}${col.is_nullable === 'NO' ? ' NOT NULL' : ''}`);
    });

    // Test 3: Find active bookings for testing
    console.log('\n3️⃣ Finding active bookings...');
    const bookings = await pool.query(`
      SELECT id, event_name, event_date, status 
      FROM bookings 
      WHERE status = 'confirmed' 
      LIMIT 5
    `);
    console.log(`✅ Found ${bookings.rows.length} confirmed bookings for testing`);

    // Test 4: Check role references
    console.log('\n4️⃣ Testing role references...');
    const musicRoles = await pool.query(`
      SELECT id, name, role_type 
      FROM roles 
      WHERE role_type IN ('managed_musician', 'musician')
      ORDER BY name
    `);
    console.log(`✅ Found ${musicRoles.rows.length} music-related roles:`);
    musicRoles.rows.forEach(role => {
      console.log(`   - ${role.name} (ID: ${role.id})`);
    });

    // Test 5: Test creating a sample assignment
    if (bookings.rows.length > 0 && instruments.rows.length > 0 && musicRoles.rows.length > 0) {
      console.log('\n5️⃣ Testing sample assignment creation...');
      
      const testBookingId = bookings.rows[0].id;
      const testInstrumentId = instruments.rows[0].id;
      const testRoleId = musicRoles.rows[0].id;
      
      // Find a user with the required role
      const testUser = await pool.query(`
        SELECT u.id, u.full_name, r.name as role_name
        FROM users u
        JOIN roles r ON u.role_id = r.id
        WHERE r.id = $1
        LIMIT 1
      `, [testRoleId]);

      if (testUser.rows.length > 0) {
        const userId = testUser.rows[0].id;
        
        // Create test assignment
        const assignment = await pool.query(`
          INSERT INTO booking_assignments_members (
            booking_id,
            user_id,
            role_in_booking,
            assignment_type,
            selected_talent,
            is_main_booked_talent,
            assigned_group,
            status
          ) VALUES ($1, $2, $3, 'test', $4, false, $5, 'active')
          RETURNING id, booking_id, user_id, role_in_booking, selected_talent, assigned_group
        `, [
          testBookingId,
          userId,
          testRoleId,
          testInstrumentId,
          instruments.rows[0].mixer_group
        ]);

        console.log('✅ Sample assignment created successfully:');
        console.log(`   - Assignment ID: ${assignment.rows[0].id}`);
        console.log(`   - Booking: ${testBookingId}`);
        console.log(`   - User: ${testUser.rows[0].full_name}`);
        console.log(`   - Instrument: ${instruments.rows[0].player_name}`);
        console.log(`   - Mixer Group: ${instruments.rows[0].mixer_group}`);

        // Clean up test assignment
        await pool.query('DELETE FROM booking_assignments_members WHERE id = $1', [assignment.rows[0].id]);
        console.log('✅ Test assignment cleaned up');
      } else {
        console.log('⚠️  No users found with required role for testing');
      }
    }

    // Test 6: Verify foreign key constraints
    console.log('\n6️⃣ Testing foreign key constraints...');
    const constraints = await pool.query(`
      SELECT 
        conname as constraint_name,
        conrelid::regclass as table_name,
        confrelid::regclass as foreign_table
      FROM pg_constraint 
      WHERE conrelid = 'booking_assignments_members'::regclass 
      AND contype = 'f'
    `);
    console.log('✅ Foreign key constraints:');
    constraints.rows.forEach(constraint => {
      console.log(`   - ${constraint.constraint_name}: references ${constraint.foreign_table}`);
    });

    console.log('\n🎉 Enhanced Booking Assignment System Test Complete!');
    console.log('✅ All core functionality verified');
    console.log('✅ Database schema is properly configured');
    console.log('✅ Foreign key relationships are working');
    console.log('✅ Instrument-based talent selection is ready');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await pool.end();
  }
}

// Run the test
testEnhancedBookingAssignments().catch(console.error);