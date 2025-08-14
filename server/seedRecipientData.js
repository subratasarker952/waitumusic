// Seed data for recipient management system
import { db } from './db.ts';
import { recipientCategories, musicGenres, industryRecipients } from '../shared/schema.ts';

async function seedRecipientData() {
  console.log('🎯 Seeding recipient management data...');

  try {
    // Seed Recipient Categories (Industry Types)
    const categories = [
      { name: 'general', displayName: 'General', description: 'General industry contacts', priority: 5, isActive: true },
      { name: 'radio_stations', displayName: 'Radio Stations', description: 'FM/AM radio stations and programs', priority: 3, isActive: true },
      { name: 'tv_networks', displayName: 'TV Networks', description: 'Television networks and music programs', priority: 4, isActive: true },
      { name: 'music_blogs', displayName: 'Music Blogs', description: 'Online music blogs and review sites', priority: 5, isActive: true },
      { name: 'podcast_hosts', displayName: 'Podcast Hosts', description: 'Music podcast hosts and producers', priority: 6, isActive: true },
      { name: 'music_journalists', displayName: 'Music Journalists', description: 'Music journalists and writers', priority: 7, isActive: true },
      { name: 'playlist_curators', displayName: 'Playlist Curators', description: 'Spotify, Apple Music, and independent playlist curators', priority: 2, isActive: true },
      { name: 'festival_organizers', displayName: 'Festival Organizers', description: 'Music festival and event organizers', priority: 8, isActive: true },
      { name: 'booking_agents', displayName: 'Booking Agents', description: 'Professional booking agents and agencies', priority: 9, isActive: true },
      { name: 'record_labels', displayName: 'Record Labels', description: 'Independent and major record labels', priority: 10, isActive: true },
      { name: 'music_supervisors', displayName: 'Music Supervisors', description: 'Film, TV, and commercial music supervisors', priority: 11, isActive: true },
      { name: 'streaming_platforms', displayName: 'Streaming Platforms', description: 'Digital streaming platform contacts', priority: 2, isActive: true }
    ];

    console.log('📻 Creating recipient categories...');
    await db.insert(recipientCategories).values(categories).onConflictDoNothing();

    // Seed Music Genres
    const genres = [
      { name: 'gospel', displayName: 'Gospel', description: 'Traditional and contemporary gospel music', isActive: true },
      { name: 'caribbean', displayName: 'Caribbean', description: 'Caribbean music including reggae, dancehall, soca', isActive: true },
      { name: 'afrobeats', displayName: 'Afrobeats', description: 'African and Afrobeats music', isActive: true },
      { name: 'hip_hop', displayName: 'Hip-Hop', description: 'Hip-hop and rap music', isActive: true },
      { name: 'rnb', displayName: 'R&B', description: 'Rhythm and blues music', isActive: true },
      { name: 'pop', displayName: 'Pop', description: 'Popular music', isActive: true },
      { name: 'neo_soul', displayName: 'Neo Soul', description: 'Neo soul and contemporary R&B', isActive: true },
      { name: 'reggae', displayName: 'Reggae', description: 'Reggae and roots music', isActive: true },
      { name: 'dancehall', displayName: 'Dancehall', description: 'Dancehall and modern Caribbean', isActive: true },
      { name: 'soca', displayName: 'Soca', description: 'Soca and carnival music', isActive: true },
      { name: 'jazz', displayName: 'Jazz', description: 'Jazz and contemporary jazz', isActive: true },
      { name: 'world_music', displayName: 'World Music', description: 'World and international music', isActive: true },
      { name: 'electronic', displayName: 'Electronic', description: 'Electronic and dance music', isActive: true },
      { name: 'rock', displayName: 'Rock', description: 'Rock and alternative music', isActive: true },
      { name: 'country', displayName: 'Country', description: 'Country and folk music', isActive: true }
    ];

    console.log('🎵 Creating music genres...');
    await db.insert(musicGenres).values(genres).onConflictDoNothing();

    // Seed Sample Industry Recipients (Gospel/Caribbean focused for managed artists)
    const sampleRecipients = [
      {
        name: 'Gospel Music Association',
        category_id: 1, // Radio Stations
        email: 'submissions@gospelmusic.org',
        contact_person: 'Music Director',
        website: 'https://gospelmusic.org',
        preferred_genres: [1], // Gospel
        organization_type: 'association',
        audience_size: 50000,
        influence: 9,
        preferred_file_formats: ['mp3', 'wav'],
        submission_guidelines: 'Submit high-quality recordings with press kit',
        relationship_type: 'partner',
        response_rate: 85.5,
        status: 'active',
        source: 'manual',
        added_by: 1,
        notes: 'Leading gospel music organization, excellent for gospel releases'
      },
      {
        name: 'Caribbean Music Network',
        category_id: 3, // Music Blogs
        email: 'music@caribbeannetwork.com',
        contact_person: 'Editorial Team',
        website: 'https://caribbeanmusicnetwork.com',
        preferred_genres: [2, 8, 9], // Caribbean, Reggae, Dancehall
        organization_type: 'network',
        audience_size: 75000,
        influence: 8,
        preferred_file_formats: ['mp3'],
        submission_guidelines: 'Include artist bio and high-res photos',
        relationship_type: 'contact',
        response_rate: 72.3,
        status: 'active',
        source: 'manual',
        added_by: 1,
        notes: 'Excellent coverage for Caribbean artists'
      },
      {
        name: 'Urban Gospel Radio',
        category_id: 1, // Radio Stations
        email: 'programming@urbangospel.fm',
        contact_person: 'Program Director',
        website: 'https://urbangospel.fm',
        preferred_genres: [1, 5, 7], // Gospel, R&B, Neo Soul
        organization_type: 'station',
        audience_size: 125000,
        influence: 9,
        preferred_file_formats: ['mp3', 'wav'],
        submission_guidelines: 'Radio-ready versions with clean edits',
        relationship_type: 'partner',
        response_rate: 90.2,
        status: 'active',
        source: 'manual',
        added_by: 1,
        notes: 'Perfect for gospel and neo soul crossover artists'
      },
      {
        name: 'Island Vibes Playlist',
        category_id: 6, // Playlist Curators
        email: 'curator@islandvibes.music',
        contact_person: 'Music Curator',
        website: 'https://open.spotify.com/playlist/islandvibes',
        preferred_genres: [2, 8, 9, 10], // Caribbean, Reggae, Dancehall, Soca
        organization_type: 'independent',
        audience_size: 45000,
        influence: 7,
        preferred_file_formats: ['mp3'],
        submission_guidelines: 'Submit via SubmitHub or direct email',
        relationship_type: 'contact',
        response_rate: 65.8,
        status: 'active',
        source: 'manual',
        added_by: 1,
        notes: 'Growing playlist focused on Caribbean music'
      }
    ];

    console.log('🏢 Creating sample industry recipients...');
    await db.insert(industryRecipients).values(sampleRecipients).onConflictDoNothing();

    console.log('✅ Recipient management seed data created successfully!');
    console.log('📊 Created:');
    console.log(`   - ${categories.length} recipient categories`);
    console.log(`   - ${genres.length} music genres`);
    console.log(`   - ${sampleRecipients.length} sample industry recipients`);

  } catch (error) {
    console.error('❌ Error seeding recipient data:', error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedRecipientData()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { seedRecipientData };