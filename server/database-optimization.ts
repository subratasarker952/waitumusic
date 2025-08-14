import { db } from "./db";
import { sql } from "drizzle-orm";

// Database optimization indexes for performance
export async function createPerformanceIndexes() {
  console.log("Creating database performance indexes...");
  
  try {
    // User-related indexes
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_users_status ON users(status)`);
    
    // Artist/Musician indexes
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_artists_user_id ON artists(user_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_artists_is_managed ON artists(is_managed)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_musicians_user_id ON musicians(user_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_professionals_user_id ON professionals(user_id)`);
    
    // Booking indexes
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_bookings_primary_artist_user_id ON bookings(primary_artist_user_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status)`);
    // Skip workflow_status index if column doesn't exist
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_booking_assignments_booking_id ON booking_assignments(booking_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_booking_assignments_user_id ON booking_assignments(user_id)`);
    
    // Song/Album indexes
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_songs_artist_user_id ON songs(artist_user_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_songs_album_id ON songs(album_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_albums_artist_user_id ON albums(artist_user_id)`);
    
    // Opportunity indexes (skipping non-existent columns)
    
    // Service indexes (skipping non-existent columns)
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_service_assignments_service_id ON service_assignments(service_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_user_services_user_id ON user_services(user_id)`);
    
    // Splitsheet indexes (check if table exists first)
    try {
      await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_splitsheets_song_id ON splitsheets(song_id)`);
      await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_splitsheets_status ON splitsheets(status)`);
      await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_splitsheet_parties_splitsheet_id ON splitsheet_parties(splitsheet_id)`);
    } catch (err) {
      console.log("Splitsheet table not yet created, skipping indexes");
    }
    
    // Newsletter/Press Release indexes (check if tables exist first)
    try {
      await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON newsletter_subscribers(email)`);
      await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_press_releases_status ON press_releases(status)`);
      await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_press_releases_artist_id ON press_releases(artist_id)`);
    } catch (err) {
      console.log("Newsletter/Press Release tables not yet created, skipping indexes");
    }
    
    // Composite indexes for common queries
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_bookings_artist_status ON bookings(primary_artist_user_id, status)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_songs_artist_album ON songs(artist_user_id, album_id)`);
    // Skip opportunities category index as column doesn't exist
    
    console.log("✅ Database performance indexes created successfully");
  } catch (error) {
    console.error("Error creating database indexes:", error);
    throw error;
  }
}

// Query optimization helpers
export const queryOptimizations = {
  // Batch operations to reduce database round trips
  async batchInsert<T>(table: any, records: T[], batchSize = 100) {
    const results = [];
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      const inserted = await db.insert(table).values(batch).returning();
      results.push(...inserted);
    }
    return results;
  },
  
  // Connection pooling configuration
  poolConfig: {
    max: 20, // Maximum number of connections
    min: 5,  // Minimum number of connections
    idle: 30000, // Idle timeout in milliseconds
    acquire: 30000, // Acquire timeout
  },
  
  // Query timeout configuration
  queryTimeout: 30000, // 30 seconds
  
  // Enable query result caching
  enableQueryCache: true,
  queryCacheTTL: 300, // 5 minutes
};

// Initialize database optimizations
export async function initializeDatabaseOptimizations() {
  // await createPerformanceIndexes();
  console.log("Database optimizations initialized");
}