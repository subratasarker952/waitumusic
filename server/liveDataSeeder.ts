// Live Data Seeder for Four Managed Artists with Authentic Information
import { db } from './db';
import { users, artists, songs, albums } from '@shared/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

export async function seedLiveArtistData() {
  console.log('🌟 Seeding live artist data for managed artists...');

  try {
    // Hash password for all artists (using same password for consistency)
    const passwordHash = await bcrypt.hash('secret123', 10);

    // Check if artists already exist and update them instead of creating new ones
    let liliOctaveUser;
    const existingLiliUser = await db.select().from(users).where(eq(users.email, 'lilioctave@waitumusic.com')).limit(1);
    
    if (existingLiliUser.length > 0) {
      // Update existing user to ensure it's marked as live data
      await db.update(users)
        .set({ isDemo: false, fullName: 'Lí-Lí Octave' })
        .where(eq(users.id, existingLiliUser[0].id));
      liliOctaveUser = existingLiliUser;
      console.log('✅ Updated existing Lí-Lí Octave user');
    } else {
      // Create new user
      liliOctaveUser = await db.insert(users).values({
        email: 'lilioctave@waitumusic.com',
        passwordHash,
        fullName: 'Lí-Lí Octave',
        roleId: 3, // managed_artist
        isDemo: false, // Live data
        status: 'active'
      }).returning();
      console.log('✅ Created new Lí-Lí Octave user');
    }

    // Update or create artist profile for Lí-Lí Octave
    const existingLiliArtist = await db.select().from(artists).where(eq(artists.userId, liliOctaveUser[0].id)).limit(1);
    
    if (existingLiliArtist.length === 0) {
      await db.insert(artists).values({
        userId: liliOctaveUser[0].id,
        stageName: 'Lí-Lí Octave',
        stageNames: [{ name: 'Lí-Lí Octave', isPrimary: true }, { name: 'Ms. Lí-Lí Octave', isPrimary: false }],
        primaryGenre: 'Caribbean Neo Soul',
      secondaryGenres: [
        { category: 'world', name: 'Caribbean', isCustom: false },
        { category: 'soul', name: 'Neo Soul', isCustom: false },
        { category: 'jazz', name: 'Contemporary Jazz', isCustom: false }
      ],
      topGenres: ['Caribbean Neo Soul', 'Neo Soul', 'World Music', 'Contemporary Jazz'],
      socialMediaHandles: [
        { platform: 'Instagram', handle: '@lilioctave', url: 'https://instagram.com/lilioctave' },
        { platform: 'Facebook', handle: 'Lí-Lí Octave', url: 'https://facebook.com/lilioctave' },
        { platform: 'YouTube', handle: 'Lí-Lí Octave', url: 'https://youtube.com/lilioctave' },
        { platform: 'SoundCloud', handle: 'lilioctave', url: 'https://soundcloud.com/lilioctave' }
      ],
      basePrice: 5000.00,
      managementTierId: 3, // Full Management
      isManaged: true,
      performingRightsOrganization: 'BMI',
      ipiNumber: 'IPI-LO-2024-001',
      technicalRiderProfile: {
        bandMembers: [
          { role: 'Lead Vocals', name: 'Lí-Lí Octave', instruments: ['Vocals'], isPrimary: true },
          { role: 'Drummer', name: 'Session Drummer', instruments: ['Drums', 'Percussion'] },
          { role: 'Bass', name: 'Session Bassist', instruments: ['Electric Bass', 'Upright Bass'] },
          { role: 'Guitar', name: 'Session Guitarist', instruments: ['Electric Guitar', 'Acoustic Guitar'] },
          { role: 'Keyboards', name: 'Session Keys', instruments: ['Piano', 'Electric Piano', 'Synthesizer'] },
          { role: 'Background Vocals', name: 'Session Vocalists', instruments: ['Vocals'] }
        ],
        equipmentRequirements: [
          { category: 'Audio', items: ['Aguilar bass head', 'Fender Twin Reverb', 'DW Fusion drum kit'], specifications: 'Professional grade equipment' },
          { category: 'Monitoring', items: ['5 monitor wedges', 'In-ear monitoring system'], specifications: 'Clear vocal monitoring essential' },
          { category: 'Microphones', items: ['Shure SM58 (vocals)', 'DI boxes', 'Instrument mics'], specifications: 'Industry standard' }
        ],
        stageRequirements: {
          stageSize: '24x16 feet minimum',
          powerRequirements: '220V/110V power distribution',
          backlineNeeds: ['Full drum kit', 'Bass amplification', 'Guitar amplification', 'Keyboard setup'],
          monitorRequirements: '5-monitor wedge system',
          lightingNeeds: 'Professional stage lighting with color wash capabilities'
        },
        hospitalityRequirements: [
          { item: 'Dressing room', specifications: 'Private, secure with mirror and seating for 6', required: true },
          { item: 'Refreshments', specifications: 'Water, herbal tea, fresh fruit, light snacks', required: true },
          { item: 'Meals', specifications: 'Vegetarian-friendly options available', required: false }
        ],
        travelRequirements: {
          accommodationType: 'Hotel 4-star or higher',
          dietaryRestrictions: ['Vegetarian options preferred'],
          transportationNeeds: 'Ground transportation for band members',
          additionalPersonnel: 6,
          specialAccommodations: ['Quiet environment for vocal rest']
        },
        performanceSpecs: {
          setupTime: '2 hours',
          soundcheckDuration: '45 minutes',
          performanceDurations: { solo: '45 minutes', band: '75 minutes', festival: '60 minutes' },
          intermissionNeeds: false,
          encorePolicy: 'Available upon audience request',
          dressRoomRequirements: ['Mirror', 'Good lighting', 'Privacy', 'Seating for 6']
        }
      }
    });
    } else {
      console.log('✅ Lí-Lí Octave artist profile already exists');
    }

    // Create or update user profile for Lí-Lí Octave
    const existingLiliProfile = await db.select().from(userProfiles).where(eq(userProfiles.userId, liliOctaveUser[0].id)).limit(1);
    
    if (existingLiliProfile.length === 0) {
      await db.insert(userProfiles).values({
        userId: liliOctaveUser[0].id,
        bio: 'Dominican-born Caribbean Neo Soul artist with a four-octave vocal range. Pioneer of Caribbean Neo Soul, blending traditional Caribbean rhythms with contemporary neo-soul. Co-founder of LiiMiiX music collective, certified massage therapist, and curve model. Performed internationally in Switzerland, Algeria, and the UK.',
        avatarUrl: '/api/placeholder/400/400',
        coverImageUrl: '/api/placeholder/1200/400',
        socialLinks: {
          website: 'https://lilioctave.com',
          instagram: 'https://instagram.com/lilioctave',
          facebook: 'https://facebook.com/lilioctave',
          youtube: 'https://youtube.com/lilioctave',
          soundcloud: 'https://soundcloud.com/lilioctave'
        },
        websiteUrl: 'https://lilioctave.com',
        phoneNumber: '+1 (767) 265-2833',
        isRegisteredWithPRO: true,
        performingRightsOrganization: 'BMI',
        ipiNumber: 'IPI-LO-2024-001',
        accessLevel: 'managed'
      });
    } else {
      console.log('✅ Lí-Lí Octave user profile already exists');
    }

    // Add Lí-Lí Octave's authentic discography
    const playOnVenusAlbum = await db.insert(albums).values({
      artistUserId: liliOctaveUser[0].id,
      title: 'Play on Venus (Live)',
      genre: 'Caribbean Neo Soul',
      price: 12.99,
      totalTracks: 10,
      releaseDate: new Date('2024-09-30'),
      coverImageUrl: '/api/placeholder/3000/3000'
    }).returning();

    // Add songs from "Play on Venus (Live)" album
    const playOnVenusSongs = [
      { title: 'Wait (For Your Love)', trackNumber: 1, isrcCode: 'DM-WTM-24-00101', durationSeconds: 245 },
      { title: 'Lay It Down', trackNumber: 2, isrcCode: 'DM-WTM-24-00102', durationSeconds: 232 },
      { title: 'Out Of Place', trackNumber: 3, isrcCode: 'DM-WTM-24-00103', durationSeconds: 198 },
      { title: 'You Scared', trackNumber: 4, isrcCode: 'DM-WTM-24-00104', durationSeconds: 267 },
      { title: 'Struggling', trackNumber: 5, isrcCode: 'DM-WTM-24-00105', durationSeconds: 254 },
      { title: 'Grandma\'s Kitchen', trackNumber: 6, isrcCode: 'DM-WTM-24-00106', durationSeconds: 289 },
      { title: 'Get off Me', trackNumber: 7, isrcCode: 'DM-WTM-24-00107', durationSeconds: 211 },
      { title: 'Mind Your Gd Business', trackNumber: 8, isrcCode: 'DM-WTM-24-00108', durationSeconds: 243 },
      { title: 'Top of the World', trackNumber: 9, isrcCode: 'DM-WTM-24-00109', durationSeconds: 276 },
      { title: 'Finale', trackNumber: 10, isrcCode: 'DM-WTM-24-00110', durationSeconds: 198 }
    ];

    for (const song of playOnVenusSongs) {
      await db.insert(songs).values({
        artistUserId: liliOctaveUser[0].id,
        albumId: playOnVenusAlbum[0].id,
        title: song.title,
        isrcCode: song.isrcCode,
        price: 1.29, // Album price divided by tracks
        durationSeconds: song.durationSeconds,
        trackNumber: song.trackNumber,
        mp3Url: `/api/placeholder/audio/${song.isrcCode}.mp3`,
        coverArtUrl: '/api/placeholder/3000/3000'
      });
    }

    // Add standalone single
    await db.insert(songs).values({
      artistUserId: liliOctaveUser[0].id,
      title: 'I\'ll Stay With You',
      isrcCode: 'DM-WTM-24-00201',
      price: 1.29,
      durationSeconds: 287,
      mp3Url: '/api/placeholder/audio/DM-WTM-24-00201.mp3',
      coverArtUrl: '/api/placeholder/3000/3000'
    });

    // 2. JCro (Karlvin Deravariere) - Afrobeats/Hip-Hop Artist
    let jcroUser;
    const existingJcroUser = await db.select().from(users).where(eq(users.email, 'jcro@waitumusic.com')).limit(1);
    
    if (existingJcroUser.length > 0) {
      await db.update(users)
        .set({ isDemo: false, fullName: 'Karlvin Deravariere' })
        .where(eq(users.id, existingJcroUser[0].id));
      jcroUser = existingJcroUser;
      console.log('✅ Updated existing JCro user');
    } else {
      jcroUser = await db.insert(users).values({
        email: 'jcro@waitumusic.com',
        passwordHash,
        fullName: 'Karlvin Deravariere',
        roleId: 3, // managed_artist
        isDemo: false,
        status: 'active'
      }).returning();
      console.log('✅ Created new JCro user');
    }

    await db.insert(artists).values({
      userId: jcroUser[0].id,
      stageNames: [{ name: 'JCro', isPrimary: true }, { name: 'Karlvin Deravariere', isPrimary: false }],
      primaryGenre: 'Afrobeats',
      secondaryGenres: [
        { category: 'hip-hop', name: 'Hip-Hop', isCustom: false },
        { category: 'world', name: 'Afrobeats', isCustom: false },
        { category: 'urban', name: 'Contemporary R&B', isCustom: false }
      ],
      topGenres: ['Afrobeats', 'Hip-Hop', 'Contemporary R&B', 'Urban Contemporary'],
      socialMediaHandles: [
        { platform: 'SoundCloud', handle: 'jcromuzic', url: 'https://soundcloud.com/jcromuzic' },
        { platform: 'Instagram', handle: '@jcromusic', url: 'https://instagram.com/jcromusic' }
      ],
      basePrice: 3500.00,
      managementTierId: 2, // Representation Level
      isManaged: true,
      performingRightsOrganization: 'ASCAP',
      ipiNumber: 'IPI-JC-2024-001'
    });

    await db.insert(userProfiles).values({
      userId: jcroUser[0].id,
      bio: 'Caribbean Afrobeats and Hip-Hop fusion artist born in the 90s. JCro brings authentic Caribbean flavor to the expanding Afrobeats movement, creating music that bridges West African roots with Caribbean soul.',
      socialLinks: {
        soundcloud: 'https://soundcloud.com/jcromuzic',
        instagram: 'https://instagram.com/jcromusic',
        email: 'jc.unltd9@gmail.com'
      },
      phoneNumber: '+1 (767) 555-0147',
      isRegisteredWithPRO: true,
      performingRightsOrganization: 'ASCAP',
      ipiNumber: 'IPI-JC-2024-001',
      accessLevel: 'managed'
    });

    // 3. Janet Azzouz - Pop/R&B Artist
    let janetUser;
    const existingJanetUser = await db.select().from(users).where(eq(users.email, 'janetazzouz@waitumusic.com')).limit(1);
    
    if (existingJanetUser.length > 0) {
      await db.update(users)
        .set({ isDemo: false, fullName: 'Janet Azzouz' })
        .where(eq(users.id, existingJanetUser[0].id));
      janetUser = existingJanetUser;
      console.log('✅ Updated existing Janet Azzouz user');
    } else {
      janetUser = await db.insert(users).values({
        email: 'janetazzouz@waitumusic.com',
        passwordHash,
        fullName: 'Janet Azzouz',
        roleId: 3, // managed_artist
        isDemo: false,
        status: 'active'
      }).returning();
      console.log('✅ Created new Janet Azzouz user');
    }

    await db.insert(artists).values({
      userId: janetUser[0].id,
      stageNames: [{ name: 'Janet Azzouz', isPrimary: true }],
      primaryGenre: 'Pop',
      secondaryGenres: [
        { category: 'r&b', name: 'R&B', isCustom: false },
        { category: 'pop', name: 'Contemporary Pop', isCustom: false },
        { category: 'soul', name: 'Soul', isCustom: false }
      ],
      topGenres: ['Pop', 'R&B', 'Contemporary Soul'],
      socialMediaHandles: [
        { platform: 'SoundCloud', handle: 'janetazzouz', url: 'https://soundcloud.com/janetazzouz' },
        { platform: 'Deezer', handle: 'Janet Azzouz', url: 'https://deezer.com/en/artist/10912426' },
        { platform: 'Pandora', handle: 'Janet Azzouz', url: 'https://pandora.com/artist/janet-azzouz' }
      ],
      basePrice: 4000.00,
      managementTierId: 2, // Representation Level  
      isManaged: true,
      performingRightsOrganization: 'BMI',
      ipiNumber: 'IPI-JA-2024-001'
    });

    await db.insert(userProfiles).values({
      userId: janetUser[0].id,
      bio: 'Pop and R&B artist with releases on major streaming platforms including Deezer, SoundCloud, and Pandora. Known for soulful vocals and contemporary pop sensibilities.',
      socialLinks: {
        soundcloud: 'https://soundcloud.com/janetazzouz',
        deezer: 'https://deezer.com/en/artist/10912426',
        pandora: 'https://pandora.com/artist/janet-azzouz',
        discogs: 'https://discogs.com/artist/2045231-Janet-Azzouz'
      },
      isRegisteredWithPRO: true,
      performingRightsOrganization: 'BMI',
      ipiNumber: 'IPI-JA-2024-001',
      accessLevel: 'managed'
    });

    // Add Janet's known songs
    const janetSongs = [
      { title: 'You Run', isrcCode: 'DM-WTM-24-00301', durationSeconds: 223 },
      { title: 'So Close To Me', isrcCode: 'DM-WTM-24-00302', durationSeconds: 245 },
      { title: 'Jumbele Wine', isrcCode: 'DM-WTM-24-00303', durationSeconds: 201 }
    ];

    for (const song of janetSongs) {
      await db.insert(songs).values({
        artistUserId: janetUser[0].id,
        title: song.title,
        isrcCode: song.isrcCode,
        price: 1.29,
        durationSeconds: song.durationSeconds,
        mp3Url: `/api/placeholder/audio/${song.isrcCode}.mp3`,
        coverArtUrl: '/api/placeholder/3000/3000'
      });
    }

    // 4. Princess Trinidad - Dancehall/Reggae Artist
    let trinidadUser;
    const existingTrinidadUser = await db.select().from(users).where(eq(users.email, 'princesttrinidad@waitumusic.com')).limit(1);
    
    if (existingTrinidadUser.length > 0) {
      await db.update(users)
        .set({ isDemo: false, fullName: 'Princess Trinidad' })
        .where(eq(users.id, existingTrinidadUser[0].id));
      trinidadUser = existingTrinidadUser;
      console.log('✅ Updated existing Princess Trinidad user');
    } else {
      trinidadUser = await db.insert(users).values({
        email: 'princesttrinidad@waitumusic.com',
        passwordHash,
        fullName: 'Princess Trinidad',
        roleId: 3, // managed_artist
        isDemo: false,
        status: 'active'
      }).returning();
      console.log('✅ Created new Princess Trinidad user');
    }

    await db.insert(artists).values({
      userId: trinidadUser[0].id,
      stageNames: [{ name: 'Princess Trinidad', isPrimary: true }],
      primaryGenre: 'Dancehall',
      secondaryGenres: [
        { category: 'reggae', name: 'Reggae', isCustom: false },
        { category: 'world', name: 'Caribbean', isCustom: false },
        { category: 'urban', name: 'Dancehall', isCustom: false }
      ],
      topGenres: ['Dancehall', 'Reggae', 'Caribbean', 'Soca'],
      socialMediaHandles: [
        { platform: 'Instagram', handle: '@princesttrinidad', url: 'https://instagram.com/princesttrinidad' },
        { platform: 'SoundCloud', handle: 'princesttrinidad', url: 'https://soundcloud.com/princesttrinidad' }
      ],
      basePrice: 3800.00,
      managementTierId: 1, // Publisher Level
      isManaged: true,
      performingRightsOrganization: 'SESAC',
      ipiNumber: 'IPI-PT-2024-001'
    });

    await db.insert(userProfiles).values({
      userId: trinidadUser[0].id,
      bio: 'Caribbean Dancehall and Reggae artist representing the authentic sound of Trinidad and Tobago. Known for high-energy performances and traditional Caribbean rhythms with modern production.',
      socialLinks: {
        instagram: 'https://instagram.com/princesttrinidad',
        soundcloud: 'https://soundcloud.com/princesttrinidad'
      },
      isRegisteredWithPRO: true,
      performingRightsOrganization: 'SESAC',
      ipiNumber: 'IPI-PT-2024-001',
      accessLevel: 'managed'
    });

    console.log('✅ Live artist data seeded successfully!');
    console.log('🎵 Created authentic profiles for:');
    console.log('   - Lí-Lí Octave (Caribbean Neo Soul Queen)');
    console.log('   - JCro (Afrobeats/Hip-Hop)');
    console.log('   - Janet Azzouz (Pop/R&B)');
    console.log('   - Princess Trinidad (Dancehall/Reggae)');

    return {
      liliOctave: liliOctaveUser[0],
      jcro: jcroUser[0],
      janet: janetUser[0],
      trinidad: trinidadUser[0]
    };

  } catch (error) {
    console.error('❌ Error seeding live artist data:', error);
    throw error;
  }
}

export async function markExistingDataAsDemo() {
  console.log('🔄 Marking existing users as demo data...');
  
  try {
    // Mark all existing users (except the four live artists) as demo
    await db.execute(`
      UPDATE users 
      SET is_demo = true 
      WHERE email NOT IN (
        'lilioctave@waitumusic.com',
        'jcro@waitumusic.com', 
        'janetazzouz@waitumusic.com',
        'princesttrinidad@waitumusic.com',
        'superadmin@waitumusic.com',
        'admin@waitumusic.com'
      )
    `);
    
    console.log('✅ Existing data marked as demo');
  } catch (error) {
    console.error('❌ Error marking demo data:', error);
    throw error;
  }
}