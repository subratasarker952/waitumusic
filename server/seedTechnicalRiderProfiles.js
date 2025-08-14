import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq } from 'drizzle-orm';
import { artists, musicians } from '../shared/schema.js';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined');
}

const client = postgres(DATABASE_URL);
const db = drizzle(client);

// Authentic technical rider profiles for managed artists
const artistTechnicalProfiles = {
  'Lí-Lí Octave': {
    bandMembers: [
      { role: 'Drummer', name: 'Michaj Smith', instruments: ['DW Fusion Kit', 'Meinl Byzance Cymbals'], isPrimary: true },
      { role: 'Bass', name: 'Anika Luke-Balthazar', instruments: ['Aguilar AG 4J Bass', '5-String Fender'], isPrimary: true },
      { role: 'Guitar', name: 'Benton Julius', instruments: ['Fender Stratocaster', 'Gibson Les Paul'], isPrimary: false },
      { role: 'Keyboard', name: 'Dean Vidal', instruments: ['Nord Stage 3', 'Yamaha CP88'], isPrimary: false },
      { role: 'Background Vocalist (Tenor)', name: 'Vernella Williams', instruments: ['Vocals', 'Percussion'], isPrimary: false },
      { role: 'Background Vocalist (Soprano)', name: 'Josea Massicot-Daniel', instruments: ['Vocals'], isPrimary: false }
    ],
    equipmentRequirements: [
      { category: 'Amplification', items: ['Aguilar AG 500 Bass Head', 'Fender Twin Reverb', 'DW Collector Series Kit'], specifications: 'Professional grade amplification with backup units available' },
      { category: 'Monitoring', items: ['In-ear monitors for all members', 'Wedge monitors (backup)', 'Personal monitor mixes'], specifications: 'Individual monitor control essential' },
      { category: 'Recording', items: ['Multi-track recording capability', 'Professional microphone setup'], specifications: 'For live album recording if requested' }
    ],
    stageRequirements: {
      stageSize: '24\' x 16\' minimum',
      powerRequirements: '220V/30A dedicated circuits',
      backlineNeeds: ['Full drum riser', 'Bass amp isolation', 'Guitar amp positioning'],
      monitorRequirements: 'Individual IEM systems for all 6 members',
      lightingNeeds: 'Professional concert lighting with color temperature control'
    },
    hospitalityRequirements: [
      { item: 'Bottled water', specifications: 'Room temperature, 2 cases', required: true },
      { item: 'Fresh fruit juice', specifications: 'Orange preferred, pulp-free', required: true },
      { item: 'Tea service', specifications: 'Herbal variety with honey and lemon', required: false },
      { item: 'Coffee service', specifications: 'Premium blend, hot throughout event', required: false },
      { item: 'Quiet dressing room', specifications: 'Mirrors, seating for 8, climate controlled', required: true },
      { item: 'Internet access', specifications: 'High-speed WiFi for streaming and communication', required: true }
    ],
    travelRequirements: {
      accommodationType: '4-star hotel minimum',
      dietaryRestrictions: ['Caribbean cuisine preferred', 'Vegetarian options required'],
      transportationNeeds: 'Ground transportation for 8 people including equipment',
      additionalPersonnel: 2,
      specialAccommodations: ['Customs clearance assistance', 'Instrument insurance coverage']
    },
    performanceSpecs: {
      setupTime: '3 hours minimum',
      soundcheckDuration: '90 minutes with full band',
      performanceDurations: { 'solo': '45 minutes', '4_piece': '75 minutes', 'full_band': '90 minutes' },
      intermissionNeeds: true,
      encorePolicy: '2-song encore standard',
      dressRoomRequirements: ['6 individual stations', 'Full-length mirrors', 'Costume hanging area']
    },
    technicalContacts: {
      soundEngineer: 'Marcus Thompson (Tour Manager)',
      lightingTechnician: 'External contractor preferred',
      stageManager: 'Venue provided',
      tourManager: 'Marcus Thompson (+1-767-XXX-XXXX)'
    }
  },
  'JCro': {
    bandMembers: [
      { role: 'Drummer', name: 'Marcus Thompson', instruments: ['Electronic Kit', 'Acoustic Backup'], isPrimary: true },
      { role: 'Bass', name: 'Kevin Williams', instruments: ['Fender Jazz', 'Electric'], isPrimary: true },
      { role: 'Guitar', name: 'Alex Johnson', instruments: ['Electric Guitar', 'Effects Pedals'], isPrimary: true },
      { role: 'Keyboard', name: 'Sarah Mitchell', instruments: ['Digital Workstation', 'Synthesizer'], isPrimary: false }
    ],
    hospitalityRequirements: [
      { item: 'Bottled water', specifications: 'Cold, sports bottles preferred', required: true },
      { item: 'Energy drinks', specifications: 'Red Bull or similar', required: false },
      { item: 'Fresh fruit platter', specifications: 'High-energy fruits', required: true },
      { item: 'Coffee service', specifications: 'Espresso machine preferred', required: false },
      { item: 'Private dressing area', specifications: 'Hip-hop culture friendly space', required: true }
    ],
    performanceSpecs: {
      setupTime: '2 hours',
      soundcheckDuration: '45 minutes',
      performanceDurations: { 'solo': '30 minutes', '4_piece': '60 minutes', 'full_band': '75 minutes' },
      intermissionNeeds: false,
      encorePolicy: 'Crowd dependent',
      dressRoomRequirements: ['Modern amenities', 'Sound system for warm-up']
    }
  },
  'Janet Azzouz': {
    bandMembers: [
      { role: 'Drummer', name: 'David Rodriguez', instruments: ['Acoustic Kit', 'R&B Setup'], isPrimary: true },
      { role: 'Bass', name: 'Lisa Chen', instruments: ['Upright Bass', 'Electric Bass'], isPrimary: true },
      { role: 'Guitar', name: 'Michael Brown', instruments: ['Jazz Guitar', 'Acoustic'], isPrimary: true },
      { role: 'Background Vocalist', name: 'Emma Davis', instruments: ['Vocals', 'Harmonies'], isPrimary: false }
    ],
    hospitalityRequirements: [
      { item: 'Bottled water', specifications: 'Room temperature, pH balanced', required: true },
      { item: 'Herbal tea selection', specifications: 'Throat coat and chamomile', required: true },
      { item: 'Fresh fruit and vegetable platter', specifications: 'Organic preferred', required: true },
      { item: 'Quiet warming-up space', specifications: 'Piano access for vocal warm-ups', required: true },
      { item: 'Full-length mirror', specifications: 'Well-lit dressing area', required: true }
    ],
    performanceSpecs: {
      setupTime: '2.5 hours',
      soundcheckDuration: '60 minutes',
      performanceDurations: { 'solo': '40 minutes', '4_piece': '70 minutes', 'full_band': '85 minutes' },
      intermissionNeeds: true,
      encorePolicy: 'Intimate setting dependent'
    }
  },
  'Princess Trinidad': {
    bandMembers: [
      { role: 'Drummer', name: 'Carlos Mendez', instruments: ['Reggae Kit', 'Steel Pan'], isPrimary: true },
      { role: 'Bass', name: 'Jasmine Thompson', instruments: ['Reggae Bass', 'Fender'], isPrimary: true },
      { role: 'Guitar', name: 'Andre Williams', instruments: ['Reggae Guitar', 'Rhythm'], isPrimary: true },
      { role: 'Keyboard', name: 'Natasha Joseph', instruments: ['Organ', 'Caribbean Sounds'], isPrimary: false }
    ],
    hospitalityRequirements: [
      { item: 'Bottled water', specifications: 'Cold spring water', required: true },
      { item: 'Coconut water', specifications: 'Fresh or premium brand', required: true },
      { item: 'Fresh tropical fruit', specifications: 'Mango, pineapple, papaya', required: true },
      { item: 'Caribbean-style refreshments', specifications: 'Traditional snacks', required: false },
      { item: 'Sound system for warm-up', specifications: 'Bluetooth connectivity', required: true }
    ],
    performanceSpecs: {
      setupTime: '2 hours',
      soundcheckDuration: '45 minutes',
      performanceDurations: { 'solo': '35 minutes', '4_piece': '65 minutes', 'full_band': '80 minutes' },
      intermissionNeeds: false,
      encorePolicy: 'Reggae tradition - extended jams'
    }
  }
};

// Seed the technical rider profiles
async function seedTechnicalRiderProfiles() {
  try {
    console.log('Seeding technical rider profiles...');
    
    for (const [stageName, profile] of Object.entries(artistTechnicalProfiles)) {
      console.log(`Updating ${stageName} technical rider profile...`);
      
      // Update artist with technical rider profile
      await db.update(artists)
        .set({ 
          technicalRiderProfile: profile 
        })
        .where(eq(artists.stageName, stageName));
        
      console.log(`✓ Updated ${stageName} profile`);
    }
    
    console.log('All technical rider profiles seeded successfully!');
  } catch (error) {
    console.error('Error seeding technical rider profiles:', error);
  } finally {
    process.exit(0);
  }
}

seedTechnicalRiderProfiles();