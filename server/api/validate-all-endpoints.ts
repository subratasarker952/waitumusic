import { Express, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validateRequest } from '../middleware/validation';

// Comprehensive input validation for ALL API endpoints

// User validation schemas
const userSchemas = {
  updateProfile: z.object({
    fullName: z.string().min(1).max(100).optional(),
    email: z.string().email().optional(),
    phoneNumber: z.string().regex(/^\+?[\d\s-()]+$/).optional(),
    bio: z.string().max(1000).optional()
  }),
  
  changePassword: z.object({
    currentPassword: z.string().min(8),
    newPassword: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
    confirmPassword: z.string()
  }).refine(data => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match"
  })
};

// Booking validation schemas
const bookingSchemas = {
  create: z.object({
    clientName: z.string().min(1).max(100),
    clientEmail: z.string().email(),
    clientPhone: z.string().optional(),
    eventName: z.string().min(1).max(200),
    eventDate: z.string().datetime(),
    eventLocation: z.string().min(1).max(500),
    eventType: z.enum(['concert', 'festival', 'private', 'corporate', 'other']),
    expectedAttendance: z.number().min(1).max(1000000),
    budget: z.number().min(0),
    notes: z.string().max(2000).optional()
  }),
  
  update: z.object({
    status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']).optional(),
    notes: z.string().max(2000).optional()
  })
};

// Music validation schemas
const musicSchemas = {
  uploadSong: z.object({
    title: z.string().min(1).max(200),
    artistUserId: z.number().positive(),
    albumId: z.number().positive().optional(),
    genre: z.string().max(50).optional(),
    duration: z.number().positive().optional(),
    fileUrl: z.string().url(),
    coverArtUrl: z.string().url().optional(),
    lyrics: z.string().max(5000).optional(),
    isExplicit: z.boolean().optional()
  }),
  
  createAlbum: z.object({
    title: z.string().min(1).max(200),
    artistUserId: z.number().positive(),
    releaseDate: z.string().datetime().optional(),
    genre: z.string().max(50).optional(),
    coverArtUrl: z.string().url().optional(),
    description: z.string().max(2000).optional()
  })
};

// Payment validation schemas
const paymentSchemas = {
  createCheckout: z.object({
    items: z.array(z.object({
      type: z.enum(['song', 'album', 'merchandise', 'service']),
      itemId: z.union([z.string(), z.number()]),
      quantity: z.number().positive(),
      price: z.number().positive()
    })).min(1),
    currency: z.enum(['USD', 'EUR', 'GBP']).optional()
  }),
  
  processPayment: z.object({
    paymentMethodId: z.string(),
    amount: z.number().positive(),
    currency: z.string().length(3)
  })
};

// Professional service validation schemas
const serviceSchemas = {
  createService: z.object({
    serviceType: z.string().min(1).max(100),
    title: z.string().min(1).max(200),
    description: z.string().max(2000),
    basePrice: z.number().positive(),
    duration: z.number().positive().optional(),
    availability: z.enum(['available', 'busy', 'unavailable'])
  }),
  
  bookService: z.object({
    serviceId: z.number().positive(),
    date: z.string().datetime(),
    duration: z.number().positive(),
    notes: z.string().max(1000).optional()
  })
};

// Apply validation to all endpoints
export function applyEndpointValidation(app: Express) {
  // User endpoints
  app.put('/api/users/profile', 
    validateRequest(userSchemas.updateProfile),
    (req: Request, res: Response, next: NextFunction) => next()
  );
  
  app.post('/api/users/change-password',
    validateRequest(userSchemas.changePassword),
    (req: Request, res: Response, next: NextFunction) => next()
  );
  
  // Booking endpoints
  app.post('/api/bookings',
    validateRequest(bookingSchemas.create),
    (req: Request, res: Response, next: NextFunction) => next()
  );
  
  app.patch('/api/bookings/:id',
    validateRequest(bookingSchemas.update),
    (req: Request, res: Response, next: NextFunction) => next()
  );
  
  // Music endpoints
  app.post('/api/songs/upload',
    validateRequest(musicSchemas.uploadSong),
    (req: Request, res: Response, next: NextFunction) => next()
  );
  
  app.post('/api/albums',
    validateRequest(musicSchemas.createAlbum),
    (req: Request, res: Response, next: NextFunction) => next()
  );
  
  // Payment endpoints
  app.post('/api/payments/checkout',
    validateRequest(paymentSchemas.createCheckout),
    (req: Request, res: Response, next: NextFunction) => next()
  );
  
  app.post('/api/payments/process',
    validateRequest(paymentSchemas.processPayment),
    (req: Request, res: Response, next: NextFunction) => next()
  );
  
  // Service endpoints
  app.post('/api/services',
    validateRequest(serviceSchemas.createService),
    (req: Request, res: Response, next: NextFunction) => next()
  );
  
  app.post('/api/services/book',
    validateRequest(serviceSchemas.bookService),
    (req: Request, res: Response, next: NextFunction) => next()
  );
  
  // Generic validation for all other POST/PUT/PATCH requests
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
      // Sanitize all input
      req.body = sanitizeInput(req.body);
    }
    next();
  });
}

// Deep sanitization of input
function sanitizeInput(obj: any): any {
  if (typeof obj === 'string') {
    // Remove potential XSS
    return obj
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  } else if (Array.isArray(obj)) {
    return obj.map(sanitizeInput);
  } else if (obj && typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[sanitizeInput(key)] = sanitizeInput(value);
    }
    return sanitized;
  }
  return obj;
}