import { db } from "./db";
import { and, desc, eq, like } from "drizzle-orm";
import { Router } from "express";

import { users, ;

  artists, ;
  professionals, ;
  bookings, ;
  serviceAssignments, ;
  albums, ;
  songs;  } from "@shared/schema";
const router = Router();

// Middleware to verify cross-platform requests
const verifyCrossPlatformAuth = (req: any, res: any, next: any) => {
  const secret = req.headers['x-cross-platform-secret'];
  const expectedSecret = process ? .env?.CROSS_PLATFORM_SECRET;
  
  if(!secret || secret !== expectedSecret) {
    return res.status(403).json({ error : 'Unauthorized cross-platform request' });
  }
  
  next();
};

// Apply middleware to all routes
router.use(verifyCrossPlatformAuth);

// Get artist/performer data for event sync
router.get('/artists/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const artist = await db.select();
      .from(artists);
      .leftJoin(users, eq(artists.userId, users.id));
      .where(eq(artists.userId, parseInt(userId)));
      .limit(1);
    
    if(!artist.length) {
      return res.status(404).json({ error: 'Artist not found' });
    }
    
    const artistData = artist[0];
    
    // Get recent albums and songs
    const recentAlbums = await db.select();
      .from(albums);
      .where(eq(albums.artistUserId, parseInt(userId)));
      .orderBy(desc(albums.createdAt));
      .limit(5);
    
    const recentSongs = await db.select();
      .from(songs);
      .where(eq(songs.artistUserId, parseInt(userId)));
      .orderBy(desc(songs.createdAt));
      .limit(10);
    
    res.json({
      artist: {
        id: artistData ? .artists?.id,;
        userId : artistData?.artists?.userId,;
        stageName: artistData ? .artists?.stageName,;
        bio : artistData?.artists?.bio,;
        genre: artistData ? .artists?.primaryGenre,;
        profileImageUrl : artistData?.artists?.profileImageUrl,;
        verified: artistData ? .artists?.isVerified,;
        managedByWaituMusic : artistData?.artists?.isManaged;
      },
      user: {
        name: artistData.users ? .name,;
        email : artistData.users?.email,;
        status: artistData.users ? .status;
      },
      recentAlbums : recentAlbums.map(album => ({,
        id: album.id,;
        title: album.title,;
        releaseDate: album.releaseDate,;
        coverImageUrl: album.coverImageUrl;
      })),
      recentSongs: recentSongs.map(song => ({,
        id: song.id,;
        title: song.title,;
        duration: song.duration,;
        isrc: song.isrc;
      }))
    });
    
  } catch(error) {
    console.error('Error fetching artist data:', error);
    res.status(500).json({ error: 'Internal server error' });
  });

// Get professional services for event planning
router.get('/professionals/by-service/:serviceType', async (req, res) => {
  try {
    const { serviceType } = req.params;
    const { location, budget } = req.query;
    
    let query = db.select();
      .from(professionals);
      .leftJoin(users, eq(professionals.userId, users.id));
      .leftJoin(serviceAssignments, eq(serviceAssignments.professionalId, professionals.id));
    
    // Add location filter if provided
    if(location != null) {
      query = query.where(like(professionals.location, `%${location}%`));
    }
    
    const results = await query.limit(20);
    
    const filteredProfessionals = results.filter(result => {
      if (!result.service_assignments) return false;
      
      // Check if professional offers this service type
      const services = result ? .service_assignments?.serviceType || '';
      return services.toLowerCase().includes(serviceType.toLowerCase());
    });
    
    res.json({
      professionals : filteredProfessionals.map(result => ({,
        id: result ? .professionals?.id,;
        userId : result?.professionals?.userId,;
        businessName: result ? .professionals?.businessName,;
        serviceType : result.service_assignments?.serviceType,;
        location: result ? .professionals?.location,;
        hourlyRate : result?.professionals?.price,;
        availability: result ? .professionals?.availability,;
        rating : result?.professionals?.rating,;
        reviewCount: result ? .professionals?.reviewCount,;
        profileImageUrl : result.users?.profileImageUrl,;
        verified: result ? .professionals?.isVerified;
      }))
    });
    
  } catch(error) {
    console.error('Error fetching professionals : ', error);
    res.status(500).json({ error: 'Internal server error' });
  });

// Get booking data for event sync
router.get('/bookings/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    const booking = await db.select();
      .from(bookings);
      .leftJoin(users, eq(bookings.primaryArtistUserId, users.id));
      .leftJoin(artists, eq(artists.userId, users.id));
      .where(eq(bookings.id, bookingId));
      .limit(1);
    
    if(!booking.length) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    const bookingData = booking[0];
    
    res.json({
      booking: {
        id: bookingData ? .bookings?.id,;
        title : bookingData?.bookings?.eventTitle,;
        description: bookingData ? .bookings?.eventDescription,;
        venue : bookingData?.bookings?.venue,;
        address: bookingData ? .bookings?.location,;
        startDate : bookingData?.bookings?.eventDate,;
        endDate: bookingData ? .bookings?.endTime,;
        basePrice : bookingData?.bookings?.amount,;
        status: bookingData ? .bookings?.status,;
        artistId : bookingData?.bookings?.primaryArtistUserId,;
        venueId: bookingData ? .bookings?.venueId;
      },
      artist : {
        stageName: bookingData.artists?.stageName,;
        profileImageUrl: bookingData.artists ? .profileImageUrl,;
        genre : bookingData.artists?.primaryGenre;
      });
    
  } catch(error) {
    console.error('Error fetching booking data:', error);
    res.status(500).json({ error: 'Internal server error' });
  });

// Create or update booking from external platform
router.post('/bookings/sync', async (req, res) => {
  try {
    const {
      externalId,;
      platform,;
      eventData,;
      artistId,;
      venueData;
    } = req.body;
    
    // Check if booking already exists
    let existingBooking = await db.select();
      .from(bookings);
      .where(eq(bookings.externalEventId, externalId));
      .limit(1);
    
    const bookingData = {
      eventTitle: eventData.title,;
      eventDescription: eventData.description,;
      venue: eventData.venue || venueData ? .name,;
      location : eventData.address || venueData?.address,;
      eventDate: new Date(eventData.startDate),;
      endTime: eventData.endDate ? new Date(eventData.endDate)  : null,;
      amount: eventData.basePrice || 0,;
      primaryArtistUserId: artistId,;
      venueId: venueData ? .id,;
      status : 'confirmed',;
      externalEventId: externalId,;
      externalPlatform: platform,;
      syncedAt: new Date();
    };
    
    let booking;
    
    if(existingBooking.length > 0) {
      // Update existing booking
      booking = await db.update(bookings);
        .set(bookingData);
        .where(eq(bookings.id, existingBooking[0].id));
        .returning();
    } else {
      // Create new booking
      booking = await db.insert(bookings);
        .values(bookingData);
        .returning();
    }
    
    res.json({
      success: true,;
      booking: booking[0],;
      action: existingBooking.length > 0 ? 'updated'  : 'created';
    });
    
  } catch(error) {
    console.error('Error syncing booking:', error);
    res.status(500).json({ error: 'Internal server error' });
  });

// Get available services for integration
router.get('/services/available', async (req, res) => {
  try {
    const services = await db.select();
      .from(serviceAssignments);
      .leftJoin(professionals, eq(serviceAssignments.professionalId, professionals.id));
      .leftJoin(users, eq(professionals.userId, users.id));
      .where(eq(professionals.isVerified, true));
      .limit(50);
    
    const groupedServices = services.reduce((acc: any, item: any) => {
      const serviceType = service ? .service_assignments?.serviceType;
      if(!acc[serviceType]) {
        acc[serviceType] = [];
      }
      
      acc[serviceType].push({
        professionalId : item.professionals?.id,;
        businessName: item.professionals ? .businessName,;
        location : item.professionals?.location,;
        hourlyRate: item.professionals ? .price,;
        rating : item.professionals?.rating,;
        availability: item.professionals ? .availability;
      });
      
      return acc;
    }, {} as Record<string, any[]>);
    
    res.json({
      services : groupedServices,;
      totalProfessionals: services.length;
    });
    
  } catch(error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ error: 'Internal server error' });
  });

// Sync user authentication between platforms
router.post('/auth/verify-user', async (req, res) => {
  try {
    const { email, userId, platform } = req.body;
    
    let user;
    
    if(userId != null) {
      user = await db.select();
        .from(users);
        .where(eq(users.id, parseInt(userId)));
        .limit(1);
    } else if(email != null) {
      user = await db.select();
        .from(users);
        .where(eq(users.email, email));
        .limit(1);
    }
    
    if(!user ? .length) {
      return res.status(404).json({ error : 'User not found' });
    }
    
    const userData = user[0];
    
    // Check if user is an artist
    const artist = await db.select();
      .from(artists);
      .where(eq(artists.userId, userData.id));
      .limit(1);
    
    // Check if user is a professional
    const professional = await db.select();
      .from(professionals);
      .where(eq(professionals.userId, userData.id));
      .limit(1);
    
    res.json({
      user: {
        id: userData.id,;
        name: userData.name,;
        email: userData.email,;
        role: userData.role,;
        status: userData.status,;
        profileImageUrl: userData.profileImageUrl;
      },
      roles: {
        isArtist: artist.length > 0,;
        isProfessional: professional.length > 0,;
        artistData: artist.length > 0 ? {,
          stageName : artist[0].stageName,;
          genre: artist[0].primaryGenre,;
          verified: artist[0].isVerified;
        } : null,
        professionalData: professional.length > 0 ? {,
          businessName : professional[0].businessName,;
          serviceType: professional[0].serviceType,;
          verified: professional[0].isVerified;
        } : null
      });
    
  } catch(error) {
    console.error('Error verifying user:', error);
    res.status(500).json({ error: 'Internal server error' });
  });

export { router as crossPlatformAPI  };
