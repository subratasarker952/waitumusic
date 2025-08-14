import { Pool } from '@neondatabase/serverless';
import ws from 'ws';

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  webSocketConstructor: ws
});

const sampleOpportunities = [
  {
    title: "Nashville Songwriter Showcase - Spring 2025",
    description: "Seeking original singer-songwriters for our monthly showcase at The Bluebird Cafe. Perfect for emerging artists looking to gain exposure in Nashville's music scene.",
    organizer_name: "Nashville Music Collective",
    organizer_email: "bookings@nashvillecollective.com",
    location: "Nashville, TN",
    event_date: "2025-04-15 19:00:00",
    application_deadline: "2025-03-15 23:59:59",
    compensation: "Exposure + merchandise sales",
    tags: JSON.stringify(["songwriter", "acoustic", "nashville", "showcase", "original-music"]),
    status: "published",
    source_type: "manual",
    is_verified: true,
    is_remote: false,
    compensation_type: "exposure"
  },
  {
    title: "R&B Vocalist Needed for Studio Album",
    description: "Grammy-nominated producer seeking powerful R&B vocalist for upcoming album project. Must have professional studio experience and strong vocal range.",
    organizer_name: "Platinum Records Studio",
    organizer_email: "sessions@platinumstudio.com", 
    location: "Los Angeles, CA",
    event_date: "2025-05-01 10:00:00",
    application_deadline: "2025-04-01 23:59:59",
    compensation: "$2,500 - $5,000",
    tags: JSON.stringify(["rb", "vocalist", "studio", "professional", "album"]),
    status: "published", 
    source_type: "manual",
    is_verified: true,
    is_remote: false,
    compensation_type: "paid"
  },
  {
    title: "Caribbean Music Festival 2025 - Artist Submissions",
    description: "Annual Caribbean Music Festival accepting applications for main stage performances. Celebrating Caribbean culture and music from reggae to soca to calypso.",
    organizer_name: "Caribbean Cultural Foundation",
    organizer_email: "artists@caribbeanfest.org",
    location: "Miami, FL", 
    event_date: "2025-07-20 14:00:00",
    application_deadline: "2025-05-01 23:59:59",
    compensation: "$1,500 + travel allowance",
    tags: JSON.stringify(["caribbean", "festival", "reggae", "soca", "calypso", "live-performance"]),
    status: "published",
    source_type: "manual", 
    is_verified: true,
    is_remote: false,
    compensation_type: "paid"
  },
  {
    title: "Sync Licensing Opportunity - Netflix Original Series",
    description: "Music supervisor seeking original tracks for upcoming Netflix series. Looking for contemporary pop, indie, and electronic music. Must own master rights.",
    organizer_name: "Soundtrack Media Group",
    organizer_email: "licensing@soundtrackmedia.com",
    location: "Remote",
    application_deadline: "2025-04-30 23:59:59", 
    compensation: "$5,000 - $15,000 per placement",
    tags: JSON.stringify(["sync", "licensing", "netflix", "pop", "indie", "electronic"]),
    status: "published",
    source_type: "manual",
    is_verified: true,
    is_remote: true,
    compensation_type: "paid"
  },
  {
    title: "Gospel Music Competition - $10,000 Grand Prize",
    description: "Annual gospel music competition open to solo artists and groups. Multiple categories including traditional, contemporary, and urban gospel.",
    organizer_name: "National Gospel Music Awards",
    organizer_email: "submissions@gospelmusicawards.org",
    location: "Atlanta, GA",
    event_date: "2025-06-15 18:00:00",
    application_deadline: "2025-04-15 23:59:59",
    compensation: "$10,000 grand prize + recording contract",
    tags: JSON.stringify(["gospel", "competition", "traditional", "contemporary", "urban-gospel"]),
    status: "published",
    source_type: "manual",
    is_verified: true,
    is_remote: false,
    compensation_type: "paid"
  },
  {
    title: "Wedding Band Guitarist - Regular Weekend Gigs",
    description: "Established wedding band seeks reliable guitarist for regular weekend performances. Must be versatile across genres and have professional equipment.",
    organizer_name: "Elegant Events Entertainment",
    organizer_email: "musicians@elegantevents.com",
    location: "New York, NY Area",
    application_deadline: "2025-05-15 23:59:59",
    compensation: "$300-500 per gig",
    tags: JSON.stringify(["guitarist", "wedding", "band", "weekend", "versatile"]),
    status: "published",
    source_type: "manual",
    is_verified: true,
    is_remote: false,
    compensation_type: "paid"
  }
];

async function seedOpportunities() {
  const client = await pool.connect();
  
  try {
    console.log('🌱 Starting opportunities seeding...');
    
    // First check if opportunities table exists, if not create basic structure
    await client.query(`
      CREATE TABLE IF NOT EXISTS opportunities (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        organizer_name TEXT NOT NULL,
        organizer_email TEXT,
        organizer_website TEXT,
        location TEXT,
        event_date TIMESTAMP,
        application_deadline TIMESTAMP,
        compensation TEXT,
        compensation_amount TEXT,
        compensation_type TEXT DEFAULT 'unpaid',
        tags JSONB DEFAULT '[]',
        status TEXT DEFAULT 'published',
        source_type TEXT DEFAULT 'manual',
        source_url TEXT,
        view_count INTEGER DEFAULT 0,
        application_count INTEGER DEFAULT 0,
        is_verified BOOLEAN DEFAULT false,
        is_featured BOOLEAN DEFAULT false,
        is_remote BOOLEAN DEFAULT false,
        created_by INTEGER,
        verified_by INTEGER,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Clear existing opportunities for clean start
    await client.query('DELETE FROM opportunities WHERE source_type = $1', ['manual']);
    
    // Insert sample opportunities
    for (const opp of sampleOpportunities) {
      await client.query(`
        INSERT INTO opportunities (
          title, description, organizer_name, organizer_email, location,
          event_date, application_deadline, compensation, tags, status,
          source_type, is_verified, is_remote, compensation_type
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      `, [
        opp.title, opp.description, opp.organizer_name, opp.organizer_email,
        opp.location, opp.event_date, opp.application_deadline, opp.compensation,
        opp.tags, opp.status, opp.source_type, opp.is_verified, opp.is_remote,
        opp.compensation_type
      ]);
    }
    
    console.log(`✅ Successfully seeded ${sampleOpportunities.length} opportunities`);
    
    // Verify insertion
    const result = await client.query('SELECT COUNT(*) as count FROM opportunities WHERE source_type = $1', ['manual']);
    console.log(`📊 Total opportunities in database: ${result.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Error seeding opportunities:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the seeding
seedOpportunities().catch(console.error);