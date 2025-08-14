import bcrypt from 'bcrypt';
import { storage } from './storage';

export async function seedDemoData() {
  console.log('🌱 Starting demo data seeding...');

  try {
    // Create role ID mappings based on schema
    const roleIds = {
      superadmin: 1,
      fan: 9,
      admin: 2,
      managed_artist: 3,
      professional: 7
    };

    // 0. Create demo superadmin user
    const superAdminPasswordHash = await bcrypt.hash('secret123', 10);
    const superAdminUser = await storage.createUser({
      email: 'superadmin@waitumusic.com',
      passwordHash: superAdminPasswordHash,
      fullName: 'Super Admin',
      roleId: roleIds.superadmin,
      status: 'active'
    });

    await storage.createUserProfile({
      userId: superAdminUser.id,
      bio: 'System super administrator for Wai\'tuMusic platform',
      phoneNumber: '+1-767-555-0099'
    });

    console.log('✅ Created superadmin user');

    // 1. Create demo admin user
    const adminPasswordHash = await bcrypt.hash('secret123', 10);
    const adminUser = await storage.createUser({
      email: 'admin@waitumusic.com',
      passwordHash: adminPasswordHash,
      fullName: 'Admin User',
      roleId: roleIds.admin,
      status: 'active'
    });

    await storage.createUserProfile({
      userId: adminUser.id,
      bio: 'System administrator for Wai\'tuMusic platform',
      phoneNumber: '+1-767-555-0100'
    });

    console.log('✅ Created admin user');

    // 2. Create demo fan user
    const fanPasswordHash = await bcrypt.hash('secret123', 10);
    const fanUser = await storage.createUser({
      email: 'fan@waitumusic.com',
      passwordHash: fanPasswordHash,
      fullName: 'Demo Fan',
      roleId: roleIds.fan,
      status: 'active'
    });

    await storage.createUserProfile({
      userId: fanUser.id,
      bio: 'Music enthusiast and Wai\'tuMusic fan',
      phoneNumber: '+1-767-555-0101'
    });

    console.log('✅ Created fan user');

    // 3. Create demo professional for consultations
    const professionalPasswordHash = await bcrypt.hash('secret123', 10);
    const professionalUser = await storage.createUser({
      email: 'consultant@waitumusic.com',
      passwordHash: professionalPasswordHash,
      fullName: 'Marcus Thompson',
      roleId: roleIds.professional,
      status: 'active'
    });

    await storage.createUserProfile({
      userId: professionalUser.id,
      bio: 'Senior music industry consultant specializing in artist development, contract negotiation, and career strategy. 15+ years experience working with Caribbean artists.',
      phoneNumber: '+1-767-555-0102'
    });

    await storage.createProfessional({
      userId: professionalUser.id,
      basePrice: '150',
      isManaged: true,
      bookingFormPictureUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
      services: JSON.stringify([
        'Artist Development',
        'Contract Negotiation',
        'Career Strategy',
        'Music Business Consulting',
        'Performance Coaching'
      ])
    });

    console.log('✅ Created professional consultant');

    // 4. Create Lí-Lí Octave (Caribbean Neo Soul artist from Dominica)
    const liliPasswordHash = await bcrypt.hash('secret123', 10);
    const liliUser = await storage.createUser({
      email: 'lilioctave@waitumusic.com',
      passwordHash: liliPasswordHash,
      fullName: 'Lianne Letang',
      roleId: roleIds.managed_artist,
      status: 'active'
    });

    await storage.createUserProfile({
      userId: liliUser.id,
      bio: 'Caribbean Neo Soul Queen from Dominica with Dominican, Bajan, and Montserratian heritage. Multi-talented artist with a remarkable four-octave vocal range who pioneered "Caribbean Neo Soul" - merging island rhythms with soulful storytelling. Also a certified massage therapist, curve model, and co-founder of LiiMiiX music collective. Performed at the 60th Anniversary of the International Trade Center in Geneva, Switzerland.',
      phoneNumber: '+1-767-265-2833',
      websiteUrl: 'https://lilioctave.com',
      socialLinks: JSON.stringify({
        instagram: '@lilioctave',
        website: 'https://lilioctave.com',
        spotify: 'https://open.spotify.com/artist/1PjLcGZis8YD4zNDvfqclZ'
      })
    });

    await storage.createArtist({
      userId: liliUser.id,
      stageName: 'Lí-Lí Octave',
      stageNames: ['Lí-Lí Octave', 'Caribbean Neo Soul Queen', 'Lianne Letang'],
      primaryGenre: 'Caribbean Neo Soul',
      topGenres: ['Neo Soul', 'R&B', 'Jazz'],
      secondaryGenres: ['Zouk', 'Kompa', 'Kadass', 'Reggaeton', 'Caribbean Fusion'],
      socialMediaHandles: [
        { platform: 'instagram', handle: '@lilioctave', url: 'https://instagram.com/lilioctave' },
        { platform: 'spotify', handle: 'Lí-Lí Octave', url: 'https://open.spotify.com/artist/1PjLcGZis8YD4zNDvfqclZ' },
        { platform: 'website', handle: 'lilioctave.com', url: 'https://lilioctave.com' },
        { platform: 'email', handle: 'waitumusic@gmail.com', url: 'mailto:waitumusic@gmail.com' }
      ],
      basePrice: '3500',
      managementTierId: 3, // Full Management
      isManaged: true,
      bookingFormPictureUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop&crop=face',
      performingRightsOrganization: 'ASCAP',
      ipiNumber: 'IPI-1234567890'
    });

    console.log('✅ Created Lí-Lí Octave');

    // 5. Create JCro (Christian/Gospel artist)
    const jcroPasswordHash = await bcrypt.hash('secret123', 10);
    const jcroUser = await storage.createUser({
      email: 'jcro@waitumusic.com',
      passwordHash: jcroPasswordHash,
      fullName: 'Karlvin Deravariere',
      roleId: roleIds.managed_artist,
      status: 'active'
    });

    await storage.createUserProfile({
      userId: jcroUser.id,
      bio: 'Christian recording artist known as "J Cro" dedicated to glorifying God and spreading the word through music. Known for powerful gospel performances and inspirational songwriting. Collaborates with fellow Dominican artists including Lí-Lí Octave.',
      phoneNumber: '+1-767-555-0202',
      socialLinks: JSON.stringify({
        facebook: 'JCro Music',
        apple_music: 'https://music.apple.com/us/artist/jcro/1375089196'
      })
    });

    await storage.createArtist({
      userId: jcroUser.id,
      stageName: 'JCro',
      stageNames: ['JCro', 'J Cro', 'Karlvin Deravariere'],
      primaryGenre: 'Afrobeats',
      topGenres: ['Hip-Hop', 'R&B', 'Gospel'],
      secondaryGenres: ['Dancehall', 'Caribbean Fusion', 'Contemporary Christian', 'West African'],
      socialMediaHandles: [
        { platform: 'soundcloud', handle: '@jcromuzic', url: 'https://soundcloud.com/jcromuzic' },
        { platform: 'email', handle: 'jc.unltd9@gmail.com', url: 'mailto:jc.unltd9@gmail.com' },
        { platform: 'apple_music', handle: 'JCro', url: 'https://music.apple.com/us/artist/jcro/1375089196' }
      ],
      basePrice: '2000',
      managementTierId: 2, // Representation
      isManaged: true,
      bookingFormPictureUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
      performingRightsOrganization: 'BMI',
      ipiNumber: 'IPI-2345678901'
    });

    console.log('✅ Created JCro');

    // 6. Create Janet Azzouz (Caribbean versatile artist from Dominica)
    const janetPasswordHash = await bcrypt.hash('secret123', 10);
    const janetUser = await storage.createUser({
      email: 'janetazzouz@waitumusic.com',
      passwordHash: janetPasswordHash,
      fullName: 'Janet Azzouz',
      roleId: roleIds.managed_artist,
      status: 'active'
    });

    await storage.createUserProfile({
      userId: janetUser.id,
      bio: 'Dominican singer-songwriter known as "De Angel". Versatile artist performing across Rock, Reggae, Dancehall, Calypso, Rap, Bouyon, Cadence/Zouk, and Soca. Started at 15 with hit "Ca c\'est La Vie".',
      phoneNumber: '+1-767-555-0203'
    });

    await storage.createArtist({
      userId: janetUser.id,
      stageName: 'Janet Azzouz',
      stageNames: ['Janet Azzouz', 'De Angel', 'Janet "De Angel" Azzouz'],
      primaryGenre: 'Soca',
      topGenres: ['Bouyon', 'Cadence-lypso', 'Reggae'],
      secondaryGenres: ['Dancehall', 'Calypso', 'Zouk', 'Rock', 'Rap', 'Caribbean Fusion'],
      socialMediaHandles: [
        { platform: 'website', handle: 'janetazzouz.com', url: 'http://www.janetazzouz.com' },
        { platform: 'apple_music', handle: 'Janet Azzouz', url: 'https://music.apple.com/gd/artist/janet-azzouz/1147414535' },
        { platform: 'deezer', handle: 'Janet Azzouz', url: 'https://www.deezer.com/en/artist/10912426' }
      ],
      basePrice: '2200',
      managementTierId: 2, // Representation
      isManaged: true,
      bookingFormPictureUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face',
      performingRightsOrganization: 'SOCAN',
      ipiNumber: 'IPI-3456789012'
    });

    console.log('✅ Created Janet Azzouz');

    // 7. Create Princess Trinidad (Caribbean fusion artist)
    const princessPasswordHash = await bcrypt.hash('secret123', 10);
    const princessUser = await storage.createUser({
      email: 'princesttrinidad@waitumusic.com',
      passwordHash: princessPasswordHash,
      fullName: 'Princess Trinidad',
      roleId: roleIds.managed_artist,
      status: 'active'
    });

    await storage.createUserProfile({
      userId: princessUser.id,
      bio: 'Caribbean fusion artist blending traditional Trinidadian sounds with contemporary R&B and pop. Known for powerful vocals and dynamic stage presence, representing the new generation of Caribbean music.',
      phoneNumber: '+1-767-555-0204'
    });

    await storage.createArtist({
      userId: princessUser.id,
      stageName: 'Princess Trinidad',
      stageNames: ['Princess Trinidad', 'Princess of Dancehall', 'Trinidad Princess'],
      primaryGenre: 'Dancehall',
      topGenres: ['Reggae', 'Trinibad', 'Soca'],
      secondaryGenres: ['Caribbean Fusion', 'R&B', 'Pop', 'Calypso', 'Afrobeats'],
      socialMediaHandles: [
        { platform: 'instagram', handle: '@princesstrinidad', url: 'https://instagram.com/princesstrinidad' },
        { platform: 'youtube', handle: 'Princess Trinidad', url: 'https://youtube.com/@princesstrinidad' },
        { platform: 'spotify', handle: 'Princess Trinidad', url: 'https://open.spotify.com/artist/princesstrinidad' }
      ],
      basePrice: '2300',
      managementTierId: 1, // Publisher
      isManaged: true,
      bookingFormPictureUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
      performingRightsOrganization: 'COTT',
      ipiNumber: 'IPI-4567890123'
    });

    console.log('✅ Created Princess Trinidad');

    // Add managed musicians with consultation services
    const musicianRole = 8; // managed_musician role

    // Create first managed musician - Jazz Drummer with consultation services
    const drummer1PasswordHash = await bcrypt.hash('secret123', 10);
    const drummer1User = await storage.createUser({
      email: 'michael.drums@waitumusic.com',
      passwordHash: drummer1PasswordHash,
      fullName: 'Michael Rodriguez',
      roleId: musicianRole,
      status: 'active'
    });

    await storage.createUserProfile({
      userId: drummer1User.id,
      bio: 'Professional jazz and fusion drummer with 12+ years experience. Specializes in Caribbean rhythms, Latin percussion, and modern jazz techniques. Available for sessions, performances, and music education.',
      phoneNumber: '+1-767-555-0301'
    });

    await storage.createMusician({
      userId: drummer1User.id,
      instruments: JSON.stringify(['Drums', 'Percussion', 'Congas']),
      basePrice: '200',
      isManaged: true,
      bookingFormPictureUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop&crop=face'
    });

    // Create second managed musician - Bassist with consultation services  
    const bassist1PasswordHash = await bcrypt.hash('secret123', 10);
    const bassist1User = await storage.createUser({
      email: 'sophia.bass@waitumusic.com',
      passwordHash: bassist1PasswordHash,
      fullName: 'Sophia Chen',
      roleId: musicianRole,
      status: 'active'
    });

    await storage.createUserProfile({
      userId: bassist1User.id,
      bio: 'Versatile bassist specializing in Caribbean, R&B, and contemporary music. Session musician and music educator with expertise in both electric and acoustic bass techniques.',
      phoneNumber: '+1-767-555-0302'
    });

    await storage.createMusician({
      userId: bassist1User.id,
      instruments: JSON.stringify(['Bass Guitar', 'Upright Bass', 'Fretless Bass']),
      basePrice: '175',
      isManaged: true,
      bookingFormPictureUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face'
    });

    // Create additional managed professional - Audio Engineer
    const engineer1PasswordHash = await bcrypt.hash('secret123', 10);
    const engineer1User = await storage.createUser({
      email: 'alex.engineer@waitumusic.com',
      passwordHash: engineer1PasswordHash,
      fullName: 'Alex Thompson',
      roleId: roleIds.professional,
      status: 'active'
    });

    await storage.createUserProfile({
      userId: engineer1User.id,
      bio: 'Grammy-nominated audio engineer and producer specializing in Caribbean music production. Expert in mixing, mastering, and studio setup consultation for independent artists.',
      phoneNumber: '+1-767-555-0303'
    });

    await storage.createProfessional({
      userId: engineer1User.id,
      basePrice: '125',
      isManaged: true,
      bookingFormPictureUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
      services: JSON.stringify([
        'Mixing & Mastering',
        'Studio Setup Consultation', 
        'Production Guidance',
        'Audio Equipment Selection'
      ])
    });

    console.log('✅ Created managed musicians and additional professional');

    // 8. Create authentic songs for the artists based on real releases
    await storage.createSong({
      title: 'Play on Venus (Live)',
      artistUserId: liliUser.id,
      isrcCode: 'USLI12024001',
      price: '1.99',
      isFree: false,
      durationSeconds: 245
    });

    await storage.createSong({
      title: 'Wait (For Your Love)',
      artistUserId: liliUser.id,
      isrcCode: 'USLI12024002',
      price: '1.99',
      isFree: false,
      durationSeconds: 210
    });

    await storage.createSong({
      title: 'Grandma\'s Kitchen',
      artistUserId: liliUser.id,
      isrcCode: 'USLI12024003',
      price: '1.99',
      isFree: false,
      durationSeconds: 195
    });

    await storage.createSong({
      title: 'Praise Zone',
      artistUserId: jcroUser.id,
      isrcCode: 'USJC12024001',
      price: '1.99',
      isFree: false,
      durationSeconds: 180
    });

    await storage.createSong({
      title: 'Anchored',
      artistUserId: jcroUser.id,
      isrcCode: 'USJC12024002',
      price: '1.99',
      isFree: false,
      durationSeconds: 190
    });

    await storage.createSong({
      title: 'Heating up de Place',
      artistUserId: janetUser.id,
      isrcCode: 'USJA12024001',
      price: '1.99',
      isFree: false,
      durationSeconds: 220
    });

    await storage.createSong({
      title: 'The Real Sewo',
      artistUserId: janetUser.id,
      isrcCode: 'USJA12024002',
      price: '1.99',
      isFree: false,
      durationSeconds: 185
    });

    await storage.createSong({
      title: 'Beat of my Heart',
      artistUserId: janetUser.id,
      isrcCode: 'USJA12024003',
      price: '1.99',
      isFree: false,
      durationSeconds: 205
    });

    await storage.createSong({
      title: 'Island Queen',
      artistUserId: princessUser.id,
      isrcCode: 'USPT12024001',
      price: '1.99',
      isFree: false,
      durationSeconds: 195
    });

    console.log('✅ Created sample songs');

    // 9. Create sample consultation bookings using the bookings table
    await storage.createBooking({
      bookerUserId: fanUser.id,
      primaryArtistUserId: professionalUser.id, // Professional acting as the "artist" for consultation
      eventName: 'Career Strategy Consultation',
      eventType: 'consultation',
      eventDate: new Date('2025-07-25T14:00:00Z'),
      venueName: 'Virtual Meeting',
      venueAddress: 'Online - Zoom',
      requirements: 'Need guidance on transitioning from independent to label artist, contract review assistance',
      status: 'confirmed',
      totalBudget: '150.00',
      isGuestBooking: false
    });

    await storage.createBooking({
      bookerUserId: null, // Guest booking
      primaryArtistUserId: professionalUser.id,
      eventName: 'Industry Insights Consultation',
      eventType: 'consultation',
      eventDate: new Date('2025-07-30T15:30:00Z'),
      venueName: 'Virtual Meeting',
      venueAddress: 'Online - Google Meet',
      requirements: 'Looking for guidance on music publishing and royalty management for Caribbean artists',
      status: 'pending',
      totalBudget: '150.00',
      isGuestBooking: true,
      guestName: 'Sarah Williams',
      guestEmail: 'sarah.williams@email.com',
      guestPhone: '+1-767-555-9999'
    });

    await storage.createBooking({
      bookerUserId: liliUser.id, // Artist booking consultation
      primaryArtistUserId: professionalUser.id,
      eventName: 'Contract Negotiation Session',
      eventType: 'consultation',
      eventDate: new Date('2025-08-05T10:00:00Z'),
      venueName: 'Wai\'tuMusic Office',
      venueAddress: 'Roseau, Dominica',
      requirements: 'Review upcoming recording contract, discuss publishing terms and advance structures',
      status: 'confirmed',
      totalBudget: '150.00',
      isGuestBooking: false
    });

    console.log('✅ Created sample consultation bookings');

    // 10. Create service categories
    const performanceCategory = await storage.createServiceCategory({
      name: 'Performance Services',
      description: 'Live performance and entertainment services'
    });

    const consultationCategory = await storage.createServiceCategory({
      name: 'Consultation Services', 
      description: 'Professional guidance and advisory services'
    });

    const productionCategory = await storage.createServiceCategory({
      name: 'Production Services',
      description: 'Music production and recording services'
    });

    console.log('✅ Created service categories');

    // 11. Create admin services (centrally managed)
    const livePerformanceService = await storage.createService({
      name: 'Live Performance',
      description: 'Professional live performance for events, concerts, and celebrations',
      basePrice: '2500.00',
      duration: 120, // 2 hours
      unit: 'performance',
      categoryId: performanceCategory.id,
      createdByUserId: adminUser.id
    });

    const businessConsultationService = await storage.createService({
      name: 'Business Consultation',
      description: 'Strategic business guidance for music industry professionals',
      basePrice: '150.00',
      duration: 60, // 1 hour
      unit: 'session',
      categoryId: consultationCategory.id,
      createdByUserId: adminUser.id
    });

    const studioRecordingService = await storage.createService({
      name: 'Studio Recording Session',
      description: 'Professional recording studio time with equipment and engineering',
      basePrice: '200.00',
      duration: 240, // 4 hours
      unit: 'session',
      categoryId: productionCategory.id,
      createdByUserId: adminUser.id
    });

    console.log('✅ Created admin services');

    // 13. Create user services for consultation (managed users offering their own services)
    // Lí-Lí Octave - Vocal Coaching (already exists, just reference existing one)
    await storage.createUserService({
      userId: liliUser.id,
      name: 'Vocal Coaching Session',
      description: 'Personalized vocal training focusing on Caribbean music styles',
      price: '100.00',
      duration: 90,
      unit: 'session',
      features: JSON.stringify(['One-on-one vocal training', 'Caribbean style techniques', 'Breathing exercises']),
      enableRating: true,
      categoryId: consultationCategory.id
    });

    // Michael Rodriguez (Drummer) - Rhythm Consultation  
    await storage.createUserService({
      userId: drummer1User.id,
      name: 'Caribbean Rhythm Masterclass',
      description: 'Learn authentic Caribbean drumming patterns and techniques',
      price: '85.00',
      duration: 60,
      unit: 'session',
      features: JSON.stringify(['Traditional rhythms', 'Modern applications', 'Practice methods']),
      enableRating: true,
      categoryId: consultationCategory.id
    });

    await storage.createUserService({
      userId: drummer1User.id,
      name: 'Music Production Consultation',
      description: 'Guidance on rhythm programming and percussion arrangement',
      price: '75.00',
      duration: 45,
      unit: 'session',
      features: JSON.stringify(['DAW programming', 'Percussion layering', 'Mix tips']),
      enableRating: true,
      categoryId: consultationCategory.id
    });

    // Sophia Chen (Bassist) - Bass Technique Consultation
    await storage.createUserService({
      userId: bassist1User.id,
      name: 'Bass Technique Workshop',
      description: 'Advanced bass playing techniques for Caribbean and contemporary music',
      price: '90.00',
      duration: 75,
      unit: 'session',
      features: JSON.stringify(['Slap bass techniques', 'Caribbean bass lines', 'Recording tips']),
      enableRating: true,
      categoryId: consultationCategory.id
    });

    // Alex Thompson (Audio Engineer) - Production Consultation
    await storage.createUserService({
      userId: engineer1User.id,
      name: 'Mix & Master Consultation',
      description: 'Professional mixing and mastering guidance for independent artists',
      price: '110.00',
      duration: 60,
      unit: 'session',
      features: JSON.stringify(['EQ techniques', 'Compression strategies', 'Caribbean music mixing']),
      enableRating: true,
      categoryId: consultationCategory.id
    });

    await storage.createUserService({
      userId: engineer1User.id,
      name: 'Home Studio Setup Consultation',
      description: 'Complete guidance on building your home recording studio',
      price: '95.00',
      duration: 90,
      unit: 'session',
      features: JSON.stringify(['Equipment selection', 'Room acoustics', 'Budget optimization']),
      enableRating: true,
      categoryId: consultationCategory.id
    });

    console.log('✅ Created user consultation services');

    // 12. Assign services to managed artists
    await storage.createServiceAssignment({
      serviceId: livePerformanceService.id,
      assignedUserId: liliUser.id,
      assignedPrice: '3500.00', // Premium pricing for Lí-Lí Octave
      userCommission: '2800.00', // 80% commission
      assignedByUserId: adminUser.id
    });

    await storage.createServiceAssignment({
      serviceId: livePerformanceService.id,
      assignedUserId: jcroUser.id,
      assignedPrice: '2800.00',
      userCommission: '2240.00', // 80% commission
      assignedByUserId: adminUser.id
    });

    await storage.createServiceAssignment({
      serviceId: businessConsultationService.id,
      assignedUserId: professionalUser.id,
      assignedPrice: '150.00',
      userCommission: '120.00', // 80% commission
      assignedByUserId: adminUser.id
    });

    console.log('✅ Created service assignments');

    // 13. Create user-defined services (artists create their own)
    await storage.createUserService({
      userId: liliUser.id,
      name: 'Vocal Coaching Session',
      description: 'Personalized vocal training focusing on Caribbean music styles and techniques',
      price: '100.00',
      duration: 90,
      unit: 'session',
      features: JSON.stringify([
        'One-on-one vocal training',
        'Caribbean style techniques',
        'Breathing and projection exercises',
        'Performance coaching',
        'Take-home practice materials'
      ]),
      enableRating: true,
      categoryId: consultationCategory.id
    });

    await storage.createUserService({
      userId: liliUser.id,
      name: 'Songwriting Workshop',
      description: 'Collaborative songwriting session for aspiring Caribbean artists',
      price: '75.00',
      duration: 120,
      unit: 'session',
      features: JSON.stringify([
        'Melody composition',
        'Lyric writing techniques',
        'Caribbean rhythm integration',
        'Demo recording',
        'Copyright guidance'
      ]),
      enableRating: true,
      categoryId: consultationCategory.id
    });

    await storage.createUserService({
      userId: jcroUser.id,
      name: 'Beat Production Workshop',
      description: 'Learn Afrobeats and hip-hop production techniques',
      price: '125.00',
      duration: 180,
      unit: 'session',
      features: JSON.stringify([
        'DAW software training',
        'Sample selection and manipulation',
        'Afrobeats rhythm patterns',
        'Mixing fundamentals',
        'Beat licensing guidance'
      ]),
      enableRating: true,
      categoryId: productionCategory.id
    });

    await storage.createUserService({
      userId: professionalUser.id,
      name: 'Contract Review Service',
      description: 'Professional review and analysis of music industry contracts',
      price: '200.00',
      duration: 60,
      unit: 'document',
      features: JSON.stringify([
        'Detailed contract analysis',
        'Risk assessment',
        'Negotiation recommendations',
        'Industry standard comparisons',
        'Written report with recommendations'
      ]),
      enableRating: true,
      categoryId: consultationCategory.id
    });

    console.log('✅ Created user-defined services');

    // 14. Create some service reviews
    await storage.createServiceReview({
      userServiceId: 1, // Vocal Coaching Session
      reviewerUserId: fanUser.id,
      rating: 5,
      review: 'Amazing vocal coaching session with Lí-Lí! Her expertise in Caribbean music styles is unmatched. Learned so much about breathing techniques and stage presence.'
    });

    await storage.createServiceReview({
      userServiceId: 2, // Songwriting Workshop
      reviewerUserId: fanUser.id,
      rating: 5,
      review: 'Incredible songwriting workshop. Lí-Lí helped me understand how to blend traditional Caribbean rhythms with modern songwriting. The demo recording was a bonus!'
    });

    console.log('✅ Created service reviews');

    // 15. Create store currencies for multi-currency support
    const storeCurrencies = [
      { code: 'USD', name: 'US Dollar', symbol: '$', exchangeRate: '1.00' },
      { code: 'XCD', name: 'Eastern Caribbean Dollar', symbol: 'EC$', exchangeRate: '2.70' },
      { code: 'EUR', name: 'Euro', symbol: '€', exchangeRate: '0.85' },
      { code: 'GBP', name: 'British Pound', symbol: '£', exchangeRate: '0.73' },
      { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', exchangeRate: '1.25' },
      { code: 'JPY', name: 'Japanese Yen', symbol: '¥', exchangeRate: '110.00' },
      { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', exchangeRate: '1.35' },
      { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', exchangeRate: '0.88' },
      { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', exchangeRate: '6.45' },
      { code: 'INR', name: 'Indian Rupee', symbol: '₹', exchangeRate: '74.50' },
      { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', exchangeRate: '5.20' }
    ];

    for (const currency of storeCurrencies) {
      await storage.createStoreCurrency({
        ...currency,
        isActive: true,
        lastUpdated: new Date()
      });
    }

    console.log('✅ Created store currencies');

    // 16. Create sample bundles for the store
    // Lí-Lí Octave Beginner Package
    const liliBeginnerBundle = await storage.createBundle({
      name: 'Lí-Lí Octave Beginner Package',
      description: 'Perfect starter package for new fans! Includes hit songs, vocal coaching session, and exclusive merchandise.',
      artistUserId: liliUser.id,
      createdById: superAdminUser.id,
      isActive: true
    });

    // Add bundle items
    await storage.createBundleItem({
      bundleId: liliBeginnerBundle.id,
      itemType: 'song',
      itemId: 6, // Play on Venus
      quantity: 1
    });

    await storage.createBundleItem({
      bundleId: liliBeginnerBundle.id,
      itemType: 'song',
      itemId: 7, // Caribbean Vibes
      quantity: 1
    });

    // Add discount condition for PPV viewers
    await storage.createDiscountCondition({
      bundleId: liliBeginnerBundle.id,
      conditionType: 'ppv_code',
      conditionValue: 'COMESETV2024',
      discountType: 'percentage',
      percentageAmount: '25.00',
      description: 'Special 25% discount for ComeSeeTv PPV viewers',
      isActive: true,
      validFrom: new Date('2024-01-01'),
      validUntil: new Date('2025-12-31'),
      usageLimit: 100,
      currentUsage: 0
    });

    // JCro Beat Production Bundle
    const jcroBeatBundle = await storage.createBundle({
      name: 'JCro Beat Production Masterclass',
      description: 'Complete Afrobeats production package with exclusive beats, workshop session, and production tools.',
      artistUserId: jcroUser.id,
      createdById: superAdminUser.id,
      isActive: true
    });

    // Add ticket ID discount condition
    await storage.createDiscountCondition({
      bundleId: jcroBeatBundle.id,
      conditionType: 'ticket_id',
      conditionValue: 'TNPSS2024',
      discountType: 'fixed',
      fixedAmount: '50.00',
      description: 'Special $50 discount for TicketnPass concert attendees',
      isActive: true,
      validFrom: new Date('2024-01-01'),
      validUntil: new Date('2025-12-31'),
      usageLimit: 50,
      currentUsage: 0
    });

    console.log('✅ Created sample bundles with discount conditions');

    // 17. Create fan engagement records for discount validation
    await storage.createFanEngagement({
      userId: fanUser.id,
      artistUserId: liliUser.id,
      engagementType: 'ppv_view',
      engagementValue: 'COMESETV2024',
      engagementDate: new Date()
    });

    await storage.createFanEngagement({
      userId: fanUser.id,
      artistUserId: jcroUser.id,
      engagementType: 'show_attendance',
      engagementValue: 'TNPSS2024',
      engagementDate: new Date('2024-06-15')
    });

    console.log('✅ Created fan engagement records');

    console.log('🎉 Demo data seeding completed successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('Superadmin: superadmin@waitumusic.com / secret123');
    console.log('Admin: admin@waitumusic.com / secret123');
    console.log('Fan: fan@waitumusic.com / secret123');
    console.log('Consultant: consultant@waitumusic.com / secret123');
    console.log('Lí-Lí Octave: lilioctave@waitumusic.com / secret123');
    console.log('JCro: jcro@waitumusic.com / secret123');
    console.log('Janet Azzouz: janetazzouz@waitumusic.com / secret123');
    console.log('Princess Trinidad: princesttrinidad@waitumusic.com / secret123');

  } catch (error) {
    console.error('❌ Error seeding demo data:', error);
    throw error;
  }
}

export async function clearExistingData() {
  console.log('🧹 Clearing existing demo data...');
  // Note: In a real app, you'd implement proper data clearing
  // For now, this is a placeholder for the seeding process
}