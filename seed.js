import { storage } from './server/storage.js';
import bcrypt from 'bcrypt';

async function seedManagedArtists() {
  console.log('Creating managed artists...');
  
  try {
    // Role ID for managed artist
    const managedArtistRoleId = 3;
    
    // Create Lí-Lí Octave
    const liliPasswordHash = await bcrypt.hash('secret123', 10);
    const liliUser = await storage.createUser({
      email: 'lilioctave@waitumusic.com',
      passwordHash: liliPasswordHash,
      fullName: 'Lianne Letang',
      roleId: managedArtistRoleId,
      status: 'active'
    });

    await storage.createUserProfile({
      userId: liliUser.id,
      bio: 'Caribbean Neo Soul Queen from Dominica with Dominican, Bajan, and Montserratian heritage.',
      phoneNumber: '+1-767-265-2833',
      websiteUrl: 'https://lilioctave.com'
    });

    await storage.createArtist({
      userId: liliUser.id,
      stageName: 'Lí-Lí Octave',
      genre: 'Caribbean Neo Soul',
      basePrice: '3500',
      isManaged: true,
      bookingFormPictureUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop&crop=face'
    });

    console.log('✅ Created Lí-Lí Octave');

    // Create JCro
    const jcroPasswordHash = await bcrypt.hash('secret123', 10);
    const jcroUser = await storage.createUser({
      email: 'jcro@waitumusic.com',
      passwordHash: jcroPasswordHash,
      fullName: 'Karlvin Deravariere',
      roleId: managedArtistRoleId,
      status: 'active'
    });

    await storage.createUserProfile({
      userId: jcroUser.id,
      bio: 'Afrobeats and Hip-Hop artist with Caribbean influences.',
      phoneNumber: '+1-767-555-0103'
    });

    await storage.createArtist({
      userId: jcroUser.id,
      stageName: 'JCro',
      genre: 'Afrobeats/Hip-Hop',
      basePrice: '2500',
      isManaged: true,
      bookingFormPictureUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face'
    });

    console.log('✅ Created JCro');

    // Create Janet Azzouz
    const janetPasswordHash = await bcrypt.hash('secret123', 10);
    const janetUser = await storage.createUser({
      email: 'janetazzouz@waitumusic.com',
      passwordHash: janetPasswordHash,
      fullName: 'Janet Azzouz',
      roleId: managedArtistRoleId,
      status: 'active'
    });

    await storage.createUserProfile({
      userId: janetUser.id,
      bio: 'Pop and R&B artist with powerful vocals and dynamic stage presence.',
      phoneNumber: '+1-767-555-0104'
    });

    await storage.createArtist({
      userId: janetUser.id,
      stageName: 'Janet Azzouz',
      genre: 'Pop/R&B',
      basePrice: '2800',
      isManaged: true,
      bookingFormPictureUrl: 'https://images.unsplash.com/photo-1494790108755-2616b9e37f2f?w=400&h=400&fit=crop&crop=face'
    });

    console.log('✅ Created Janet Azzouz');

    // Create Princess Trinidad
    const princessPasswordHash = await bcrypt.hash('secret123', 10);
    const princessUser = await storage.createUser({
      email: 'princesttrinidad@waitumusic.com',
      passwordHash: princessPasswordHash,
      fullName: 'Princess Trinidad',
      roleId: managedArtistRoleId,
      status: 'active'
    });

    await storage.createUserProfile({
      userId: princessUser.id,
      bio: 'Dancehall and Reggae artist representing Caribbean culture worldwide.',
      phoneNumber: '+1-767-555-0105'
    });

    await storage.createArtist({
      userId: princessUser.id,
      stageName: 'Princess Trinidad',
      genre: 'Dancehall/Reggae',
      basePrice: '3000',
      isManaged: true,
      bookingFormPictureUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face'
    });

    console.log('✅ Created Princess Trinidad');
    console.log('🎉 All managed artists created successfully!');
    
  } catch (error) {
    console.error('Error creating managed artists:', error);
  }
}

seedManagedArtists();