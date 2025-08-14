import { storage } from './server/storage.ts';
import bcrypt from 'bcrypt';

async function seedComprehensiveDemoData() {
  console.log('🌱 Starting comprehensive demo data seeding...');
  
  try {
    // Role ID mappings
    const roleIds = {
      superadmin: 1,
      admin: 2,
      managed_artist: 3,
      independent_artist: 4,
      managed_musician: 5,
      independent_musician: 6,
      professional: 7,
      managed_professional: 8,
      fan: 9
    };

    // Create demo password hash
    const demoPasswordHash = await bcrypt.hash('demo123', 10);

    // ===================
    // SUPERADMIN USERS (2)
    // ===================

    const superAdminUsers = [
      {
        email: 'demo.superadmin@waitumusic.com',
        fullName: 'Demo Super Admin',
        phoneNumber: '+1-767-555-1001',
        bio: 'System super administrator for WaituMusic platform - Demo Account'
      },
      {
        email: 'demo.superadmin2@waitumusic.com',
        fullName: 'Sarah Mitchell',
        phoneNumber: '+1-767-555-1002',
        bio: 'Senior system administrator and platform oversight specialist'
      }
    ];

    for (const superAdminData of superAdminUsers) {
      const user = await storage.createUser({
        email: superAdminData.email,
        passwordHash: demoPasswordHash,
        fullName: superAdminData.fullName,
        roleId: roleIds.superadmin,
        status: 'active',
        isDemo: true
      });

      await storage.createUserProfile({
        userId: user.id,
        bio: superAdminData.bio,
        phoneNumber: superAdminData.phoneNumber
      });

      console.log(`✅ Created superadmin user: ${superAdminData.fullName}`);
    }

    // ===================
    // ADMIN USERS (2)
    // ===================

    const adminUsers = [
      {
        email: 'demo.admin@waitumusic.com',
        fullName: 'Marcus Johnson',
        phoneNumber: '+1-767-555-2001',
        bio: 'Platform administrator managing day-to-day operations'
      },
      {
        email: 'demo.admin2@waitumusic.com',
        fullName: 'Alicia Rodriguez',
        phoneNumber: '+1-767-555-2002',
        bio: 'Content moderation and community management specialist'
      }
    ];

    for (const adminData of adminUsers) {
      const user = await storage.createUser({
        email: adminData.email,
        passwordHash: demoPasswordHash,
        fullName: adminData.fullName,
        roleId: roleIds.admin,
        status: 'active',
        isDemo: true
      });

      await storage.createUserProfile({
        userId: user.id,
        bio: adminData.bio,
        phoneNumber: adminData.phoneNumber
      });

      console.log(`✅ Created admin user: ${adminData.fullName}`);
    }

    // ===================
    // MANAGED ARTISTS (4 including real ones)
    // ===================
    const managedArtists = [
      {
        // Real artist #1
        email: 'demo.liliotave@waitumusic.com',
        fullName: 'Lí-Lí Octave',
        stageName: 'Lí-Lí Octave',
        phoneNumber: '+1-767-555-3001',
        bio: 'Known as the "Caribbean Neo-Soul Queen" with a four-octave vocal range. Dominican artist specializing in Neo-Soul, R&B, Jazz, Funk, and Caribbean Fusion.',
        genre: 'Neo-Soul',
        basePrice: '5000',
        location: 'Dominica',
        bookingFormPictureUrl: 'https://i0.wp.com/rockthepigeon.com/wp-content/uploads/2024/10/povlive-1727828851807.jpg?ssl=1',
        websiteUrl: 'https://lilioctave.com'
      },
      {
        // Real artist #2
        email: 'demo.janetazzouz@waitumusic.com',
        fullName: 'Janet Azzouz de Angel',
        stageName: 'Janet Azzouz',
        phoneNumber: '+1-767-555-3002',
        bio: 'Veteran Caribbean artist with decades of experience. Started recording at age 15 with hit single "Ca c\'est La Vie". Specializes in Soca, Reggae, Zouk, and Cadence-lypso.',
        genre: 'Soca',
        basePrice: '3500',
        location: 'Martinique/Dominica',
        bookingFormPictureUrl: 'https://www.womex.com/virtual/image/artist/janet_azzouz_big_89737.jpg'
      },
      {
        // Demo managed artist #3
        email: 'demo.artist3@waitumusic.com',
        fullName: 'Christopher Williams',
        stageName: 'C-Dub',
        phoneNumber: '+1-767-555-3003',
        bio: 'Rising dancehall and reggae artist from Jamaica. Known for his conscious lyrics and smooth delivery.',
        genre: 'Dancehall',
        basePrice: '2500',
        location: 'Kingston, Jamaica',
        bookingFormPictureUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop&crop=face'
      },
      {
        // Demo managed artist #4
        email: 'demo.artist4@waitumusic.com',
        fullName: 'Isabella Santos',
        stageName: 'Bella Sol',
        phoneNumber: '+1-767-555-3004',
        bio: 'Cuban-Caribbean fusion artist blending traditional son with modern pop elements. Captivating live performer.',
        genre: 'Caribbean Pop',
        basePrice: '3000',
        location: 'Havana, Cuba',
        bookingFormPictureUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop&crop=face'
      }
    ];

    for (const artistData of managedArtists) {
      const user = await storage.createUser({
        email: artistData.email,
        passwordHash: demoPasswordHash,
        fullName: artistData.fullName,
        roleId: roleIds.managed_artist,
        status: 'active',
        isDemo: true
      });

      await storage.createUserProfile({
        userId: user.id,
        bio: artistData.bio,
        phoneNumber: artistData.phoneNumber,
        websiteUrl: artistData.websiteUrl || null
      });

      await storage.createArtist({
        userId: user.id,
        stageName: artistData.stageName,
        genre: artistData.genre,
        basePrice: artistData.basePrice,
        isManaged: true,
        bookingFormPictureUrl: artistData.bookingFormPictureUrl
      });

      console.log(`✅ Created managed artist: ${artistData.stageName}`);
    }

    // ===================
    // INDEPENDENT ARTISTS (2)
    // ===================

    const independentArtists = [
      {
        email: 'demo.indie.artist1@waitumusic.com',
        fullName: 'Ricardo Martinez',
        stageName: 'Rico Flow',
        phoneNumber: '+1-767-555-4001',
        bio: 'Independent reggaeton artist from Puerto Rico. Building a following through social media and streaming platforms.',
        genre: 'Reggaeton',
        basePrice: '1500',
        bookingFormPictureUrl: 'https://images.unsplash.com/photo-1566753323558-f4e0952af115?w=400&h=400&fit=crop&crop=face'
      },
      {
        email: 'demo.indie.artist2@waitumusic.com',
        fullName: 'Keisha Thompson',
        stageName: 'K-Shine',
        phoneNumber: '+1-767-555-4002',
        bio: 'Upcoming R&B artist from Barbados. Known for her powerful vocals and songwriting skills.',
        genre: 'R&B',
        basePrice: '1200',
        bookingFormPictureUrl: 'https://images.unsplash.com/photo-1506863530036-1efeddceb993?w=400&h=400&fit=crop&crop=face'
      }
    ];

    for (const artistData of independentArtists) {
      const user = await storage.createUser({
        email: artistData.email,
        passwordHash: demoPasswordHash,
        fullName: artistData.fullName,
        roleId: roleIds.independent_artist,
        status: 'active',
        isDemo: true
      });

      await storage.createUserProfile({
        userId: user.id,
        bio: artistData.bio,
        phoneNumber: artistData.phoneNumber
      });

      await storage.createArtist({
        userId: user.id,
        stageName: artistData.stageName,
        genre: artistData.genre,
        basePrice: artistData.basePrice,
        isManaged: false,
        bookingFormPictureUrl: artistData.bookingFormPictureUrl
      });

      console.log(`✅ Created independent artist: ${artistData.stageName}`);
    }

    // ===================
    // MANAGED MUSICIANS (4 including real ones)
    // ===================

    const managedMusicians = [
      {
        // Real musician #1
        email: 'demo.jcro@waitumusic.com',
        fullName: 'JCro',
        stageName: 'JCro',
        phoneNumber: '+1-767-555-5001',
        bio: 'Dominican inspirational artist and musician. Consistent music releases from 2016-2024 with strong catalog of faith-based tracks.',
        primaryGenre: 'Inspirational',
        instrument: 'Vocals/Guitar',
        hourlyRate: '200',
        bookingFormPictureUrl: 'https://i1.sndcdn.com/avatars-000599875110-rikyph-t1080x1080.jpg'
      },
      {
        // Real musician #2 - Princess Trinidad
        email: 'demo.princesstrinidad@waitumusic.com',
        fullName: 'Princess Trinidad',
        stageName: 'Princess Trinidad',
        phoneNumber: '+1-868-555-5002',
        bio: 'Emerging artist in the Trinidad and Tobago music scene. Specializes in traditional Caribbean genres with modern influences.',
        primaryGenre: 'Soca',
        instrument: 'Vocals',
        hourlyRate: '150',
        bookingFormPictureUrl: 'https://cdn.abacus.Analytics/images/7cb176ef-3316-4585-aa0a-bcf3b55f878c.png'
      },
      {
        // Demo managed musician #3
        email: 'demo.musician3@waitumusic.com',
        fullName: 'Andre Baptiste',
        stageName: 'Bass Master Andre',
        phoneNumber: '+1-767-555-5003',
        bio: 'Professional bass guitarist with 15+ years experience. Session musician for top Caribbean artists.',
        primaryGenre: 'Reggae',
        instrument: 'Bass Guitar',
        hourlyRate: '180',
        bookingFormPictureUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop&crop=face'
      },
      {
        // Demo managed musician #4
        email: 'demo.musician4@waitumusic.com',
        fullName: 'Maria Gonzalez',
        stageName: 'Piano Maria',
        phoneNumber: '+1-767-555-5004',
        bio: 'Classically trained pianist specializing in Caribbean jazz fusion. Available for sessions and live performances.',
        primaryGenre: 'Jazz',
        instrument: 'Piano',
        hourlyRate: '220',
        bookingFormPictureUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop&crop=face'
      }
    ];

    for (const musicianData of managedMusicians) {
      const user = await storage.createUser({
        email: musicianData.email,
        passwordHash: demoPasswordHash,
        fullName: musicianData.fullName,
        roleId: roleIds.managed_musician,
        status: 'active',
        isDemo: true
      });

      await storage.createUserProfile({
        userId: user.id,
        bio: musicianData.bio,
        phoneNumber: musicianData.phoneNumber
      });

      await storage.createMusician({
        userId: user.id,
        stageName: musicianData.stageName,
        primaryGenre: musicianData.primaryGenre,
        instrument: musicianData.instrument,
        hourlyRate: musicianData.price,
        isManaged: true,
        bookingFormPictureUrl: musicianData.bookingFormPictureUrl
      });

      console.log(`✅ Created managed musician: ${musicianData.stageName}`);
    }

    // ===================
    // INDEPENDENT MUSICIANS (2)
    // ===================

    const independentMusicians = [
      {
        email: 'demo.indie.musician1@waitumusic.com',
        fullName: 'Carlos Rivera',
        stageName: 'Carlos Drums',
        phoneNumber: '+1-767-555-6001',
        bio: 'Freelance drummer available for sessions and live performances. Specializes in Latin and Caribbean rhythms.',
        primaryGenre: 'Latin',
        instrument: 'Drums',
        hourlyRate: '120',
        bookingFormPictureUrl: 'https://images.unsplash.com/photo-1566753323558-f4e0952af115?w=400&h=400&fit=crop&crop=face'
      },
      {
        email: 'demo.indie.musician2@waitumusic.com',
        fullName: 'Samantha Clarke',
        stageName: 'Sax Sam',
        phoneNumber: '+1-767-555-6002',
        bio: 'Professional saxophonist with jazz and Caribbean fusion background. Available for bookings.',
        primaryGenre: 'Jazz',
        instrument: 'Saxophone',
        hourlyRate: '160',
        bookingFormPictureUrl: 'https://images.unsplash.com/photo-1506863530036-1efeddceb993?w=400&h=400&fit=crop&crop=face'
      }
    ];

    for (const musicianData of independentMusicians) {
      const user = await storage.createUser({
        email: musicianData.email,
        passwordHash: demoPasswordHash,
        fullName: musicianData.fullName,
        roleId: roleIds.independent_musician,
        status: 'active',
        isDemo: true
      });

      await storage.createUserProfile({
        userId: user.id,
        bio: musicianData.bio,
        phoneNumber: musicianData.phoneNumber
      });

      await storage.createMusician({
        userId: user.id,
        stageName: musicianData.stageName,
        primaryGenre: musicianData.primaryGenre,
        instrument: musicianData.instrument,
        hourlyRate: musicianData.price,
        isManaged: false,
        bookingFormPictureUrl: musicianData.bookingFormPictureUrl
      });

      console.log(`✅ Created independent musician: ${musicianData.stageName}`);
    }

    // ===================
    // PROFESSIONALS (4)
    // ===================

    const professionals = [
      {
        email: 'demo.professional1@waitumusic.com',
        fullName: 'Dr. Michael Thompson',
        phoneNumber: '+1-767-555-7001',
        bio: 'Senior music industry consultant with 20+ years experience in artist development, contract negotiation, and career strategy.',
        basePrice: '300',
        bookingFormPictureUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face'
      },
      {
        email: 'demo.professional2@waitumusic.com',
        fullName: 'Sarah Williams',
        phoneNumber: '+1-767-555-7002',
        bio: 'Music producer and sound engineer specializing in Caribbean genres. Award-winning professional.',
        basePrice: '250',
        bookingFormPictureUrl: 'https://imgs.search.brave.com/n1nGt6kLVxoeipH9on81wnkaD2fADhj2M6jSL7ZDNJ8/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9zdG9y/YWdlLmdvb2dsZWFw/aXMuY29tL2hlYWRz/aG90cHJvLXB1Ymxp/Yy1jb250ZW50L2hl/YWRzaG90cHJvL3Jl/dmlld3MvNjg0OTBk/MjNmNGE3NDIwNzJi/M2M4ZjYxLTY4NDkx/YmJiYTQ3ODA1MmZj/OTgyMTc2NC5wbmc_/WC1Hb29nLUFsZ29y/aXRobT1HT09HNC1S/U0EtU0hBMjU2Jlgt/R29vZy1DcmVkZW50/aWFsPWhlYWRzaG90/cHJvLWJhY2tlbmQt/cHJvZHVjdGlvbkBl/Y28tc3Bhbi00NTE1/MDAtdTguaWFtLmdz/ZXJ2aWNlYWNjb3Vu/dC5jb20vMjAyNTA4/MDYvYXV0by9zdG9y/YWdlL2dvb2c0X3Jl/cXVlc3QmWC1Hb29n/LURhdGU9MjAyNTA4/MDZUMDAxMDAxWiZY/LUdvb2ctRXhwaXJl/cz01MTg0MDAmWC1H/b29nLVNpZ25lZEhl/YWRlcnM9aG9zdCZY/LUdvb2ctU2lnbmF0/dXJlPWFjMDAxODYx/OWMxNjk3YjM5YjBi/MjBiYTRmNGI3Nzcy/OGNmYTczMDUxMzE1/NTVjZjdmZTFjM2Q0/NjJhMzA0N2ZjNGI5/ODVhNTdkN2UwMDE4/ZmZiODg4MmQyNmE1/MTE0ODAwNDFiZjk5/ODRkNjBhNTc1NTNh/N2RhMDRjZDcxN2Fk/NzkwNDExZTQ3ZjE0/M2RiOTJmNTUyMDM2/MWQzYjM1NzhiNzRj/ZGVhY2E1ODYwZGQ4/OWVjNzdkN2Y0YjA4/NGM5Yzk5NjBiZTg4/MDRhMzcwMjY3OTc4/MjM5OWVlZDc0ODM2/NDMwNzFiZmExOTcy/MGUzYWE2ZjRmMmZk/YzY2ZTYzZDY1NDNk/MzkxYWNhN2I1ZTg2/YTdhZDBiNzRmN2Zl/YWNiOGRhZmI1YzY3/MmFjMDNmYWQ1NTQy/MDEyZjU0Y2ZhNzFk/OGMwODlmNWJkMjc1/ZjRmNjQxMGQ2YmY5/YzAxZmI0MzE5Njkw/MWYwN2JlYzY2Mjc4/Mjg2MzIzNmVkZDBi/OTY3YmQ0MGY5ZDk5/M2E0NDkxNjA1ZTky/ZjFkYzZlZTdjNjli/NDY0MDk2NjZmMTM2/YTRjMTczMjQ0NTNj/OWQ2NzFlM2Q0ZTgy/ZmYzODk0YmUyMjU2/MGRlOTE2MWU2Y2Mw/NmZkNjRmYWZjOWQw/YjkxOGE0MzEwNmI2/NjU1ZWQ1ZWZjYWJm'
      },
      {
        email: 'demo.managedpro1@waitumusic.com',
        fullName: 'Robert Garcia',
        phoneNumber: '+1-767-555-8001',
        bio: 'Managed entertainment lawyer specializing in music contracts and intellectual property law.',
        basePrice: '400',
        bookingFormPictureUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face'
      },
      {
        email: 'demo.managedpro2@waitumusic.com',
        fullName: 'Lisa Martinez',
        phoneNumber: '+1-767-555-8002',
        bio: 'Managed marketing specialist focused on music promotion and brand development for Caribbean artists.',
        basePrice: '350',
        bookingFormPictureUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face'
      }
    ];

    // Create 2 regular professionals and 2 managed professionals
    for (let i = 0; i < professionals.length; i++) {
      const professionalData = professionals[i];
      const roleId = i < 2 ? roleIds.professional : roleIds.managed_professional;

      const user = await storage.createUser({
        email: professionalData.email,
        passwordHash: demoPasswordHash,
        fullName: professionalData.fullName,
        roleId: roleId,
        status: 'active',
        isDemo: true
      });

      await storage.createUserProfile({
        userId: user.id,
        bio: professionalData.bio,
        phoneNumber: professionalData.phoneNumber
      });

      await storage.createProfessional({
        userId: user.id,
        basePrice: professionalData.basePrice,
        isManaged: i >= 2, // Last 2 are managed
        bookingFormPictureUrl: professionalData.bookingFormPictureUrl
      });

      console.log(`✅ Created ${i >= 2 ? 'managed ' : ''}professional: ${professionalData.fullName}`);
    }

    // ===================
    // FAN USERS (2)
    // ===================

    const fanUsers = [
      {
        email: 'demo.fan1@waitumusic.com',
        fullName: 'Jennifer Adams',
        phoneNumber: '+1-767-555-9001',
        bio: 'Caribbean music enthusiast and concert-goer. Love discovering new artists and supporting local talent.'
      },
      {
        email: 'demo.fan2@waitumusic.com',
        fullName: 'David Brown',
        phoneNumber: '+1-767-555-9002',
        bio: 'Music blogger and Caribbean culture advocate. Always looking for the next big sound from the islands.'
      }
    ];

    for (const fanData of fanUsers) {
      const user = await storage.createUser({
        email: fanData.email,
        passwordHash: demoPasswordHash,
        fullName: fanData.fullName,
        roleId: roleIds.fan,
        status: 'active',
        isDemo: true
      });

      await storage.createUserProfile({
        userId: user.id,
        bio: fanData.bio,
        phoneNumber: fanData.phoneNumber
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

  } catch (error) {
    console.error('❌ Error seeding comprehensive demo data:', error);
    throw error;
  }
}

// Run the seeding function
seedComprehensiveDemoData().then(() => {
  console.log('✅ Demo data seeding completed successfully!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Demo data seeding failed:', error);
  process.exit(1);
});
