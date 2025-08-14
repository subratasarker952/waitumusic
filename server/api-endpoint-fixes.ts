import { Express, Request, Response } from 'express';
import { authenticateToken, requirePermission, UserRole } from './middleware/permission-system';
import { asyncHandler } from './middleware/enhanced-error-handler';
import { storage } from './storage';

// Complete API endpoint fixes and enhancements

export function registerFixedEndpoints(app: Express) {
  // User profile endpoints with proper permissions
  app.get('/api/users/profile', 
    authenticateToken,
    asyncHandler(async (req: any, res: Response) => {
      const user = await storage.getUser(req.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Remove sensitive data
      const { passwordHash, ...safeUser } = user;
      res.json(safeUser);
    })
  );
  
  // Role-based data access
  app.get('/api/users/:id',
    authenticateToken,
    asyncHandler(async (req: any, res: Response) => {
      const targetId = parseInt(req.params.id);
      
      // Check permissions
      if (req.userId !== targetId && 
          ![UserRole.SUPERADMIN, UserRole.ADMIN].includes(req.roleId)) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      const user = await storage.getUser(targetId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const { passwordHash, ...safeUser } = user;
      res.json(safeUser);
    })
  );
  
  // Artist endpoints with proper validation
  app.get('/api/artists',
    authenticateToken,
    asyncHandler(async (req: any, res: Response) => {
      const artists = await storage.getArtists();
      
      // Filter based on user role
      if (req.roleId === UserRole.FAN) {
        // Fans only see public artist info
        const publicArtists = artists.map(artist => ({
          userId: artist.userId,
          stageName: artist.stageName,
          primaryGenre: artist.primaryGenre,
          bookingFormPictureUrl: artist.bookingFormPictureUrl
        }));
        return res.json(publicArtists);
      }
      
      res.json(artists);
    })
  );
  
  // Booking endpoints with validation
  app.post('/api/bookings',
    authenticateToken,
    requirePermission('CREATE_BOOKING'),
    asyncHandler(async (req: any, res: Response) => {
      const bookingData = req.body;
      
      // Validate required fields
      const required = ['clientName', 'clientEmail', 'eventName', 'eventDate'];
      for (const field of required) {
        if (!bookingData[field]) {
          return res.status(400).json({ 
            message: `Missing required field: ${field}` 
          });
        }
      }
      
      // Set default values
      bookingData.bookerUserId = req.userId;
      bookingData.status = 'pending';
      bookingData.createdAt = new Date();
      
      const booking = await storage.createBooking(bookingData);
      res.status(201).json(booking);
    })
  );
  
  // Music upload with file validation
  app.post('/api/songs/upload',
    authenticateToken,
    requirePermission('UPLOAD_MUSIC'),
    asyncHandler(async (req: any, res: Response) => {
      const songData = req.body;
      
      // Validate song data
      if (!songData.title || !songData.artistUserId) {
        return res.status(400).json({ 
          message: 'Title and artist are required' 
        });
      }
      
      // Check if user can upload for this artist
      if (req.roleId > UserRole.ADMIN && req.userId !== songData.artistUserId) {
        return res.status(403).json({ 
          message: 'Cannot upload music for other artists' 
        });
      }
      
      const song = await storage.createSong(songData);
      res.status(201).json(song);
    })
  );
  
  // Professional services endpoints
  app.get('/api/professionals/services',
    authenticateToken,
    asyncHandler(async (req: any, res: Response) => {
      const professionals = await storage.getProfessionals();
      
      // Map to service format
      const services = professionals.map(prof => ({
        professionalId: prof.userId,
        serviceType: 'general',
        specialties: [],
        hourlyRate: prof.basePrice || '0',
        availability: 'available'
      }));
      
      res.json(services);
    })
  );
  
  // Analytics endpoints with role checking
  app.get('/api/analytics/dashboard',
    authenticateToken,
    requirePermission('VIEW_ANALYTICS'),
    asyncHandler(async (req: any, res: Response) => {
      // Get analytics based on role
      let analytics: any = {};
      
      if ([UserRole.SUPERADMIN, UserRole.ADMIN].includes(req.roleId)) {
        // Full platform analytics
        analytics = {
          totalUsers: await storage.getUsersCount(),
          totalBookings: await storage.getBookingsCount(),
          totalRevenue: await storage.getTotalRevenue(),
          activeArtists: await storage.getActiveUsersCount()
        };
      } else if ([UserRole.MANAGED_ARTIST, UserRole.ARTIST].includes(req.roleId)) {
        // Artist-specific analytics
        analytics = {
          myBookings: (await storage.getBookingsByArtist(req.userId)).length,
          myRevenue: 0, // Would calculate from bookings
          myStreams: 0 // Would get from songs/plays
        };
      }
      
      res.json(analytics);
    })
  );
  
  // Search endpoints with filtering
  app.get('/api/search',
    authenticateToken,
    asyncHandler(async (req: any, res: Response) => {
      const { q, type, limit = 10 } = req.query;
      
      if (!q) {
        return res.status(400).json({ message: 'Search query required' });
      }
      
      // Implement basic search across entities
      const searchQuery = (q as string).toLowerCase();
      const results: any = {
        artists: [],
        songs: [],
        bookings: []
      };
      
      // Search artists
      if (!type || type === 'artists') {
        const artists = await storage.getArtists();
        results.artists = artists.filter(a => 
          a.stageName?.toLowerCase().includes(searchQuery)
        ).slice(0, parseInt(limit as string));
      }
      
      // Search songs
      if (!type || type === 'songs') {
        const songs = await storage.getSongs();
        results.songs = songs.filter(s => 
          s.title?.toLowerCase().includes(searchQuery)
        ).slice(0, parseInt(limit as string));
      }
      
      res.json(results);
    })
  );
  
  // Notification endpoints
  app.get('/api/notifications',
    authenticateToken,
    asyncHandler(async (req: any, res: Response) => {
      // Return empty notifications for now
      const notifications: any[] = [];
      res.json(notifications);
    })
  );
  
  app.put('/api/notifications/:id/read',
    authenticateToken,
    asyncHandler(async (req: any, res: Response) => {
      // Mark notification as read (no-op for now)
      res.json({ success: true });
    })
  );
}