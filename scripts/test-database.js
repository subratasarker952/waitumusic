// Test database connectivity
import dotenv from 'dotenv';
import pkg from 'pg';
const { Pool } = pkg;

dotenv.config();

async function testDatabaseConnection() {
    console.log('🔍 Testing database connection...');

    // if (!process.env.DATABASE_URL) {
    //     console.error('❌ DATABASE_URL not found in environment');
    //     process.exit(1);
    // }

    // console.log(`📍 Database URL: ${process.env.DATABASE_URL.substring(0, 30)}...`);

    // const connectionString = "postgresql://waitumusic_user:waitumusicpassword@localhost:5432/waitumusic_production?sslmode=disable";
    const connectionString = "postgresql://waitumusic_user:NewPassword123!@localhost:5432/waitumusic_production";

    const pool = new Pool({
      connectionString,
      ssl: connectionString.includes('localhost')
        ? false
        : {
            rejectUnauthorized: false,
            checkServerIdentity: () => undefined
          }
    });

    try {
        console.log('🔗 Attempting connection...');
        const client = await pool.connect();

        console.log('✅ Database connection successful');

        const result = await client.query('SELECT NOW() as current_time, version() as db_version');
        console.log('✅ Query executed successfully');
        console.log(`⏰ Current time: ${result.rows[0].current_time}`);
        console.log(`🗄️  Database: ${result.rows[0].db_version.split(' ')[0]}`);

        // Test a simple query to verify our schema
        try {
            const userCount = await client.query('SELECT COUNT(*) as count FROM users');
            console.log(`👥 Users in database: ${userCount.rows[0].count}`);
        } catch (schemaErr) {
            console.log('⚠️  Schema tables may not exist yet (normal for fresh deployment)');
        }

        client.release();
        await pool.end();

        console.log('✅ Database test completed successfully');
        process.exit(0);

    } catch (error) {
        console.error('❌ Database connection failed:');
        console.error(`   Error: ${error.message}`);

        if (error.message.includes('certificate')) {
            console.error('   🔒 This appears to be an SSL certificate issue');
        }
        if (error.message.includes('timeout')) {
            console.error('   ⏱️  This appears to be a connection timeout issue');
        }
        if (error.message.includes('ENOTFOUND')) {
            console.error('   🌐 This appears to be a DNS/hostname issue');
        }

        await pool.end();
        process.exit(1);
    }
}

testDatabaseConnection();