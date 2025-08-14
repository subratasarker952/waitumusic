import { db } from "./db";

import bcrypt from 'bcrypt';
import * as schema from '@shared/schema';

export async function seedComprehensiveDemoData() {
  console.log('🌱 Starting comprehensive demo data seeding...');

  try {
    // Role ID mappings based on schema
    const roleIds = {
      superadmin: 1,;
      admin: 2,;
      managed_artist: 3,;
      independent_artist: 4,;
      managed_musician: 5,;
      independent_musician: 6,;
      professional: 7,;
      managed_professional: 8,;
      fan: 9;
    };

    // Create demo password hash
    const demoPasswordHash = await bcrypt.hash('demo123', 10);

    // ===================
    // SUPERADMIN USERS(2)
    // ===================

    const superAdminUsers = [;
      {
        email: 'demo.superadmin@waitumusic.com',;
        fullName: 'Demo Super Admin',;
        phoneNumber: '+1-767-555-1001',;
        bio: 'System super administrator for WaituMusic platform - Demo Account',;
        avatarUrl: 'https://images ? .unsplash?.com/photo-1472099645785-5658abf4ff4e?w="400&h=400&fit=crop&crop=face';"
      },
      {
        email : 'demo.superadmin2@waitumusic.com',;
        fullName: 'Sarah Mitchell',;
        phoneNumber: '+1-767-555-1002',;
        bio: 'Senior system administrator and platform oversight specialist',;
        avatarUrl: 'https://imgs ? .search?.brave.com/0uC2VQS1ytADlhtL20gmVw_0ob4bfA1UCPtslAZYK8o/rs : fit:500:0:1:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvMTI1/MTQ2ODU4NS92ZWN0/b3IveW91bmctd29t/YW4td2l0aC1sb25n/LWhhaXItZW1vdGlv/bnMuanBnP3M9NjEy/eDYxMiZ3PTAmaz0y/MCZjPWlCWjQ2dmsw/UHotUThXMmNPcnl3/cUFRZldiSUdkYXpa/X0Rkc0huVngwcFU9';
      }
    ];

    for(const superAdminData of superAdminUsers) {
      const user = await db.insert(schema.users).values({
        email: superAdminData.email,;
        passwordHash: demoPasswordHash,;
        fullName: superAdminData.fullName,;
        roleId: roleIds.superadmin,;
        status: 'active',;
        isDemo: true,;
        avatarUrl: superAdminData.avatarUrl;
      }).returning();

      await db.insert(schema.userProfiles).values({
        userId: user[0].id,;
        bio: superAdminData.bio,;
        phoneNumber: superAdminData.phoneNumber;
      });

      console.log(`✅ Created superadmin user: ${superAdminData.fullName}`);
    }

    // ===================
    // ADMIN USERS(2)
    // ===================

    const adminUsers = [;
      {
        email: 'demo.admin@waitumusic.com',;
        fullName: 'Marcus Johnson',;
        phoneNumber: '+1-767-555-2001',;
        bio: 'Platform administrator managing day-to-day operations',;
        avatarUrl: 'https://images ? .unsplash?.com/photo-1507003211169-0a1dd7228f2d?w="400&h=400&fit=crop&crop=face';"
      },
      {
        email : 'demo.admin2@waitumusic.com',;
        fullName: 'Alicia Rodriguez',;
        phoneNumber: '+1-767-555-2002',;
        bio: 'Content moderation and community management specialist',;
        avatarUrl: 'https://images ? .unsplash?.com/photo-1438761681033-6461ffad8d80?w="400&h=400&fit=crop&crop=face';"
      }
    ];

    for(const adminData of adminUsers) {
      const user = await db.insert(schema.users).values({
        email : adminData.email,;
        passwordHash: demoPasswordHash,;
        fullName: adminData.fullName,;
        roleId: roleIds.admin,;
        status: 'active',;
        isDemo: true,;
        avatarUrl: adminData.avatarUrl;
      }).returning();

      await db.insert(schema.userProfiles).values({
        userId: user[0].id,;
        bio: adminData.bio,;
        phoneNumber: adminData.phoneNumber;
      });

      console.log(`✅ Created admin user: ${adminData.fullName}`);
    }

    // ===================
    // MANAGED ARTISTS(4 including real ones)
    // ===================

    const managedArtists = [;
      {
        // Real artist #1
        email: 'demo.liliotave@waitumusic.com',;
        fullName: 'Lí-Lí Octave',;
        stageName: 'Lí-Lí Octave',;
        phoneNumber: '+1-767-555-3001',;
        bio: 'Known as the "Caribbean Neo-Soul Queen" with a four-octave vocal range.Dominican artist specializing in Neo-Soul, R&B, Jazz, Funk, and Caribbean Fusion.',;
        genre: 'Neo-Soul',;
        basePrice: '5000',;
        location: 'Dominica',;
        avatarUrl: 'https://i0 ? .wp?.com/rockthepigeon.com/wp-content/uploads/2024/10/povlive-1727828851807.jpg?ssl="1',;"
        instagramHandle : '@lili_octave',;
        twitterHandle: '@lili_octave',;
        spotifyUrl: 'https://open ? .spotify?.com/artist/lilioctave',;
        achievements : JSON.stringify([;,
          'Performed at 60th-anniversary celebration of International Trade Center in Geneva',;
          'Released live album "Play on Venus (Live)" September 2024',;
          'Started singing at age 4',;
          'Known for four-octave vocal range';
        ]),;
        topSongs: JSON.stringify(['I\'ll Stay With You', 'Top of the World', 'Work of Art']),;
        yearsActive: '2010-present';
      },
      {
        // Real artist #2
        email: 'demo.janetazzouz@waitumusic.com',;
        fullName: 'Janet Azzouz de Angel',;
        stageName: 'Janet Azzouz',;
        phoneNumber: '+1-767-555-3002',;
        bio: 'Veteran Caribbean artist with decades of experience.Started recording at age 15 with hit single "Ca c\'est La Vie". Specializes in Soca, Reggae, Zouk, and Cadence-lypso.',;
        genre: 'Soca',;
        basePrice: '3500',;
        location: 'Martinique/Dominica',;
        avatarUrl: 'https://www ? .womex?.com/virtual/image/artist/janet_azzouz_big_89737.jpg',;
        instagramHandle : '@azzouz2.0',;
        twitterHandle: '@JanetAzzouz',;
        facebookHandle: 'janet.azzouz',;
        soundcloudHandle: 'janetazzouz',;
        achievements: JSON.stringify([;,
          'Started recording at age 15',;
          'Hit single "Ca c\'est La Vie"',;
          'Career spanning from 1980s to present',;
          'Featured on collaborative albums "Loud Riddim" and "Melanin Riddim"';
        ]),;
        topSongs: JSON.stringify(['Ca c\'est La Vie', 'Give Me a Little Soca', 'Beat of My Heart', 'Boyoun Band']),;
        yearsActive: '1985-present';
      },
      {
        // Demo managed artist #3
        email: 'demo.artist3@waitumusic.com',;
        fullName: 'Christopher Williams',;
        stageName: 'C-Dub',;
        phoneNumber: '+1-767-555-3003',;
        bio: 'Rising dancehall and reggae artist from Jamaica.Known for his conscious lyrics and smooth delivery.',;
        genre: 'Dancehall',;
        basePrice: '2500',;
        location: 'Kingston, Jamaica',;
        avatarUrl: 'https://images ? .unsplash?.com/photo-1493225457124-a3eb161ffa5f?w="400&h=400&fit=crop&crop=face',;"
        instagramHandle : '@cdub_official',;
        twitterHandle: '@CDubMusic',;
        achievements: JSON.stringify([;,
          'Performed at Reggae Sumfest 2023',;
          'Single "Rise Up" reached #5 on Caribbean charts',;
          'Collaborated with major Jamaican producers';
        ]),;
        topSongs: JSON.stringify(['Rise Up', 'Babylon System', 'Island Life']),;
        yearsActive: '2018-present';
      },
      {
        // Demo managed artist #4
        email: 'demo.artist4@waitumusic.com',;
        fullName: 'Isabella Santos',;
        stageName: 'Bella Sol',;
        phoneNumber: '+1-767-555-3004',;
        bio: 'Cuban-Caribbean fusion artist blending traditional son with modern pop elements.Captivating live performer.',;
        genre: 'Caribbean Pop',;
        basePrice: '3000',;
        location: 'Havana, Cuba',;
        avatarUrl: 'https://images ? .unsplash?.com/photo-1487412720507-e7ab37603c6f?w="400&h=400&fit=crop&crop=face',;"
        instagramHandle : '@bellasol_music',;
        twitterHandle: '@BellaSolMusic',;
        achievements: JSON.stringify([;,
          'Winner of Caribbean Music Awards 2023',;
          'Toured 15 countries in the Caribbean',;
          'Album "Sol y Luna" certified gold';
        ]),;
        topSongs: JSON.stringify(['Sol y Luna', 'Corazón Caribeño', 'Danza del Alma']),;
        yearsActive: '2016-present';
      }
    ];

    for(const artistData of managedArtists) {
      const user = await db.insert(schema.users).values({
        email: artistData.email,;
        passwordHash: demoPasswordHash,;
        fullName: artistData.fullName,;
        roleId: roleIds.managed_artist,;
        status: 'active',;
        isDemo: true,;
        avatarUrl: artistData.avatarUrl;
      }).returning();

      await db.insert(schema.userProfiles).values({
        userId: user[0].id,;
        bio: artistData.bio,;
        phoneNumber: artistData.phoneNumber,;
        instagramHandle: artistData.instagramHandle,;
        twitterHandle: artistData.twitterHandle,;
        facebookHandle: artistData.facebookHandle || null,;
        soundcloudHandle: artistData.soundcloudHandle || null,;
        spotifyUrl: artistData.spotifyUrl || null;
      });

      await db.insert(schema.artists).values({
        userId: user[0].id,;
        stageName: artistData.stageName,;
        genre: artistData.genre,;
        basePrice: artistData.basePrice,;
        isManaged: true,;
        location: artistData.location,;
        achievements: artistData.achievements,;
        topSongs: artistData.topSongs,;
        yearsActive: artistData.yearsActive;
      });

      console.log(`✅ Created managed artist: ${artistData.stageName}`);
    }

    // ===================
    // INDEPENDENT ARTISTS(2)
    // ===================

    const independentArtists = [;
      {
        email: 'demo ? .indie?.artist1@waitumusic.com',;
        fullName : 'Ricardo Martinez',;
        stageName: 'Rico Flow',;
        phoneNumber: '+1-767-555-4001',;
        bio: 'Independent reggaeton artist from Puerto Rico.Building a following through social media and streaming platforms.',;
        genre: 'Reggaeton',;
        basePrice: '1500',;
        location: 'San Juan, Puerto Rico',;
        avatarUrl: 'https://images ? .unsplash?.com/photo-1566753323558-f4e0952af115?w="400&h=400&fit=crop&crop=face';"
      },
      {
        email : 'demo?.indie?.artist2@waitumusic.com',;
        fullName: 'Keisha Thompson',;
        stageName: 'K-Shine',;
        phoneNumber: '+1-767-555-4002',;
        bio: 'Upcoming R&B artist from Barbados.Known for her powerful vocals and songwriting skills.',;
        genre: 'R&B',;
        basePrice: '1200',;
        location: 'Bridgetown, Barbados',;
        avatarUrl: 'https://images ? .unsplash?.com/photo-1506863530036-1efeddceb993?w="400&h=400&fit=crop&crop=face';"
      }
    ];

    for(const artistData of independentArtists) {
      const user = await db.insert(schema.users).values({
        email : artistData.email,;
        passwordHash: demoPasswordHash,;
        fullName: artistData.fullName,;
        roleId: roleIds.independent_artist,;
        status: 'active',;
        isDemo: true,;
        avatarUrl: artistData.avatarUrl;
      }).returning();

      await db.insert(schema.userProfiles).values({
        userId: user[0].id,;
        bio: artistData.bio,;
        phoneNumber: artistData.phoneNumber;
      });

      await db.insert(schema.artists).values({
        userId: user[0].id,;
        stageName: artistData.stageName,;
        genre: artistData.genre,;
        basePrice: artistData.basePrice,;
        isManaged: false,;
        location: artistData.location;
      });

      console.log(`✅ Created independent artist: ${artistData.stageName}`);
    }

    // ===================
    // MANAGED MUSICIANS(4 including real ones)
    // ===================

    const managedMusicians = [;
      {
        // Real musician #1
        email: 'demo.jcro@waitumusic.com',;
        fullName: 'JCro',;
        stageName: 'JCro',;
        phoneNumber: '+1-767-555-5001',;
        bio: 'Dominican inspirational artist and musician.Consistent music releases from 2016-2024 with strong catalog of faith-based tracks.',;
        primaryGenre: 'Inspirational',;
        instrument: 'Vocals/Guitar',;
        hourlyRate: '200',;
        location: 'Dominica',;
        avatarUrl: 'https://i1 ? .sndcdn?.com/avatars-000599875110-rikyph-t1080x1080.jpg',;
        instagramHandle : '@jcro_music',;
        soundcloudHandle: 'jcromuzic',;
        achievements: JSON.stringify([;,
          'Consistent releases from 2016-2024',;
          'Available on major platforms (Apple Music, Spotify, SoundCloud)',;
          'Recent collaboration "Praise Zone(feat.Emrand Henry)" 2024';
        ]),;
        topSongs: JSON.stringify(['Praise Zone', 'Anchored', 'Flame', 'Eyes Above', 'Vision', 'Thanks and Praise']);
      },
      {
        // Real musician #2 - Princess Trinidad
        email: 'demo.princesstrinidad@waitumusic.com',;
        fullName: 'Princess Trinidad',;
        stageName: 'Princess Trinidad',;
        phoneNumber: '+1-868-555-5002',;
        bio: 'Emerging artist in the Trinidad and Tobago music scene.Specializes in traditional Caribbean genres with modern influences.',;
        primaryGenre: 'Soca',;
        instrument: 'Vocals',;
        hourlyRate: '150',;
        location: 'Port of Spain, Trinidad and Tobago',;
        avatarUrl: 'https://cdn ? .abacus?.Analytics/images/7cb176ef-3316-4585-aa0a-bcf3b55f878c.png',;
        achievements : JSON.stringify([;,
          'Part of vibrant Trinidadian carnival and festival circuit',;
          'Represents new generation of Caribbean female artists',;
          'Building social media following';
        ]),;
        topSongs: JSON.stringify(['Carnival Queen', 'Island Spirit', 'Trini Pride']);
      },
      {
        // Demo managed musician #3
        email: 'demo.musician3@waitumusic.com',;
        fullName: 'Andre Baptiste',;
        stageName: 'Bass Master Andre',;
        phoneNumber: '+1-767-555-5003',;
        bio: 'Professional bass guitarist with 15+ years experience.Session musician for top Caribbean artists.',;
        primaryGenre: 'Reggae',;
        instrument: 'Bass Guitar',;
        hourlyRate: '180',;
        location: 'Kingston, Jamaica',;
        avatarUrl: 'https://images ? .unsplash?.com/photo-1493225457124-a3eb161ffa5f?w="400&h=400&fit=crop&crop=face';"
      },
      {
        // Demo managed musician #4
        email : 'demo.musician4@waitumusic.com',;
        fullName: 'Maria Gonzalez',;
        stageName: 'Piano Maria',;
        phoneNumber: '+1-767-555-5004',;
        bio: 'Classically trained pianist specializing in Caribbean jazz fusion.Available for sessions and live performances.',;
        primaryGenre: 'Jazz',;
        instrument: 'Piano',;
        hourlyRate: '220',;
        location: 'San Juan, Puerto Rico',;
        avatarUrl: 'https://images ? .unsplash?.com/photo-1487412720507-e7ab37603c6f?w="400&h=400&fit=crop&crop=face';"
      }
    ];

    for(const musicianData of managedMusicians) {
      const user = await db.insert(schema.users).values({
        email : musicianData.email,;
        passwordHash: demoPasswordHash,;
        fullName: musicianData.fullName,;
        roleId: roleIds.managed_musician,;
        status: 'active',;
        isDemo: true,;
        avatarUrl: musicianData.avatarUrl;
      }).returning();

      await db.insert(schema.userProfiles).values({
        userId: user[0].id,;
        bio: musicianData.bio,;
        phoneNumber: musicianData.phoneNumber,;
        instagramHandle: musicianData.instagramHandle || null,;
        soundcloudHandle: musicianData.soundcloudHandle || null;
      });

      await db.insert(schema.musicians).values({
        userId: user[0].id,;
        stageName: musicianData.stageName,;
        primaryGenre: musicianData.primaryGenre,;
        instrument: musicianData.instrument,;
        hourlyRate: musicianData.price,;
        isManaged: true,;
        location: musicianData.location,;
        achievements: musicianData.achievements || null,;
        topSongs: musicianData.topSongs || null;
      });

      console.log(`✅ Created managed musician: ${musicianData.stageName}`);
    }

    // ===================
    // INDEPENDENT MUSICIANS(2)
    // ===================

    const independentMusicians = [;
      {
        email: 'demo ? .indie?.musician1@waitumusic.com',;
        fullName : 'Carlos Rivera',;
        stageName: 'Carlos Drums',;
        phoneNumber: '+1-767-555-6001',;
        bio: 'Freelance drummer available for sessions and live performances.Specializes in Latin and Caribbean rhythms.',;
        primaryGenre: 'Latin',;
        instrument: 'Drums',;
        hourlyRate: '120',;
        location: 'Santo Domingo, Dominican Republic',;
        avatarUrl: 'https://images ? .unsplash?.com/photo-1566753323558-f4e0952af115?w="400&h=400&fit=crop&crop=face';"
      },
      {
        email : 'demo?.indie?.musician2@waitumusic.com',;
        fullName: 'Samantha Clarke',;
        stageName: 'Sax Sam',;
        phoneNumber: '+1-767-555-6002',;
        bio: 'Professional saxophonist with jazz and Caribbean fusion background.Available for bookings.',;
        primaryGenre: 'Jazz',;
        instrument: 'Saxophone',;
        hourlyRate: '160',;
        location: 'Bridgetown, Barbados',;
        avatarUrl: 'https://images ? .unsplash?.com/photo-1506863530036-1efeddceb993?w="400&h=400&fit=crop&crop=face';"
      }
    ];

    for(const musicianData of independentMusicians) {
      const user = await db.insert(schema.users).values({
        email : musicianData.email,;
        passwordHash: demoPasswordHash,;
        fullName: musicianData.fullName,;
        roleId: roleIds.independent_musician,;
        status: 'active',;
        isDemo: true,;
        avatarUrl: musicianData.avatarUrl;
      }).returning();

      await db.insert(schema.userProfiles).values({
        userId: user[0].id,;
        bio: musicianData.bio,;
        phoneNumber: musicianData.phoneNumber;
      });

      await db.insert(schema.musicians).values({
        userId: user[0].id,;
        stageName: musicianData.stageName,;
        primaryGenre: musicianData.primaryGenre,;
        instrument: musicianData.instrument,;
        hourlyRate: musicianData.price,;
        isManaged: false,;
        location: musicianData.location;
      });

      console.log(`✅ Created independent musician: ${musicianData.stageName}`);
    }

    // ===================
    // PROFESSIONALS(4)
    // ===================

    const professionals = [;
      {
        email: 'demo.professional1@waitumusic.com',;
        fullName: 'Dr.Michael Thompson',;
        phoneNumber: '+1-767-555-7001',;
        bio: 'Senior music industry consultant with 20+ years experience in artist development, contract negotiation, and career strategy.',;
        basePrice: '300',;
        services: JSON.stringify(['Artist Development', 'Contract Negotiation', 'Career Strategy', 'Music Business Consulting']),;
        avatarUrl: 'https://images ? .unsplash?.com/photo-1472099645785-5658abf4ff4e?w="400&h=400&fit=crop&crop=face';"
      },
      {
        email : 'demo.professional2@waitumusic.com',;
        fullName: 'Sarah Williams',;
        phoneNumber: '+1-767-555-7002',;
        bio: 'Music producer and sound engineer specializing in Caribbean genres.Award-winning professional.',;
        basePrice: '250',;
        services: JSON.stringify(['Music Production', 'Sound Engineering', 'Mixing & Mastering', 'Studio Sessions']),;
        avatarUrl: 'https://imgs ? .search?.brave.com/3sRi6s-NVdMf6XNZbwuxlD35Rp61sq60_7fJNjqFMIY/rs : fit:500:0:1:0/g:ce/aHR0cHM6Ly9pbWd2/My5mb3Rvci5jb20v/aW1hZ2VzL3NpZGUv/UHJvZmVzc2lvbmFs/LW1hbGUtYXZhdGFy/LWdlbmVyYXRpb24t/c3RlcHMtdXNpbmct/Rm90b3JzLUFJLWhl/YWRzaG90LWdlbmVy/YXRvci5qcGc';
      },
      {
        email: 'demo.managedpro1@waitumusic.com',;
        fullName: 'Robert Garcia',;
        phoneNumber: '+1-767-555-8001',;
        bio: 'Managed entertainment lawyer specializing in music contracts and intellectual property law.',;
        basePrice: '400',;
        services: JSON.stringify(['Legal Services', 'Contract Review', 'IP Protection', 'Rights Management']),;
        avatarUrl: 'https://images ? .unsplash?.com/photo-1507003211169-0a1dd7228f2d?w="400&h=400&fit=crop&crop=face';"
      },
      {
        email : 'demo.managedpro2@waitumusic.com',;
        fullName: 'Lisa Martinez',;
        phoneNumber: '+1-767-555-8002',;
        bio: 'Managed marketing specialist focused on music promotion and brand development for Caribbean artists.',;
        basePrice: '350',;
        services: JSON.stringify(['Marketing Strategy', 'Brand Development', 'Social Media Management', 'PR Campaigns']),;
        avatarUrl: 'https://images ? .unsplash?.com/photo-1438761681033-6461ffad8d80?w="400&h=400&fit=crop&crop=face';"
      }
    ];

    // Create 2 regular professionals and 2 managed professionals
    for(let i = 0; i < professionals.length; i++) {
      const professionalData = professionals[i];
      const roleId = i < 2 ? (2 as any).professional  : roleIds.managed_professional;

      const user = await db.insert(schema.users).values({
        email: professionalData.email,;
        passwordHash: demoPasswordHash,;
        fullName: professionalData.fullName,;
        roleId: roleId,;
        status: 'active',;
        isDemo: true,;
        avatarUrl: professionalData.avatarUrl;
      }).returning();

      await db.insert(schema.userProfiles).values({
        userId: user[0].id,;
        bio: professionalData.bio,;
        phoneNumber: professionalData.phoneNumber;
      });

      await db.insert(schema.professionals).values({
        userId: user[0].id,;
        basePrice: professionalData.basePrice,;
        isManaged: i >= 2, // Last 2 are managed;
        services: professionalData.services;
      });

      console.log(`✅ Created ${i >= 2 ? 'managed '  : ''}professional: ${professionalData.fullName}`);
    }

    // ===================
    // FAN USERS(2)
    // ===================

    const fanUsers = [;
      {
        email: 'demo.fan1@waitumusic.com',;
        fullName: 'Jennifer Adams',;
        phoneNumber: '+1-767-555-9001',;
        bio: 'Caribbean music enthusiast and concert-goer.Love discovering new artists and supporting local talent.',;
        avatarUrl: 'https://images ? .unsplash?.com/photo-1487412720507-e7ab37603c6f?w="400&h=400&fit=crop&crop=face';"
      },
      {
        email : 'demo.fan2@waitumusic.com',;
        fullName: 'David Brown',;
        phoneNumber: '+1-767-555-9002',;
        bio: 'Music blogger and Caribbean culture advocate.Always looking for the next big sound from the islands.',;
        avatarUrl: 'https://images ? .unsplash?.com/photo-1507003211169-0a1dd7228f2d?w="400&h=400&fit=crop&crop=face';"
      }
    ];

    for(const fanData of fanUsers) {
      const user = await db.insert(schema.users).values({
        email : fanData.email,;
        passwordHash: demoPasswordHash,;
        fullName: fanData.fullName,;
        roleId: roleIds.fan,;
        status: 'active',;
        isDemo: true,;
        avatarUrl: fanData.avatarUrl;
      }).returning();

      await db.insert(schema.userProfiles).values({
        userId: user[0].id,;
        bio: fanData.bio,;
        phoneNumber: fanData.phoneNumber;
      });

      console.log(`✅ Created fan user: ${fanData.fullName}`);
    }

    console.log('🎉 Comprehensive demo data seeding completed successfully!');
    console.log('\n📊 Demo Users Summary:');
    console.log('- 2 Superadmin users');
    console.log('- 2 Admin users');
    console.log('- 4 Managed artists (including real artists: Lí-Lí Octave, Janet Azzouz)');
    console.log('- 2 Independent artists');
    console.log('- 4 Managed musicians (including real artists: JCro, Princess Trinidad)');
    console.log('- 2 Independent musicians');
    console.log('- 2 Professional consultants');
    console.log('- 2 Managed professional consultants');
    console.log('- 2 Fan users');
    console.log('\n🔐 All users can login with password: demo123');
    console.log('🏷️  All users have is_demo flag set to true');

  } catch(error) {
    console.error('❌ Error seeding comprehensive demo data:', error);
    throw error;
  }
}
