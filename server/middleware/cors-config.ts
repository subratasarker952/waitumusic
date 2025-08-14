import cors from 'cors';
import { Request } from 'express';

// CORS configuration with security best practices
const corsOptions: cors.CorsOptions = {
  // Dynamic origin validation
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (like mobile apps, Postman)
    if (!origin) {
      return callback(null, true);
    }
    
    // In development, allow all origins for Vite
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // Allowed origins
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5000',
      'http://localhost:5173',
      'https://waitumusic.replit.app',
      'https://*.replit.app', // Allow all Replit subdomains
      'https://waitumusic.com',
      'https://www.waitumusic.com',
      process.env.FRONTEND_URL,
      process.env.ALLOWED_ORIGIN
    ].filter(Boolean);
    
    // Check if origin matches allowed patterns
    const isAllowed = allowedOrigins.some(allowed => {
      if (!allowed) return false;
      
      // Handle wildcard domains - fix the Replit subdomain matching
      if (allowed.includes('*')) {
        // More permissive pattern for Replit subdomains
        if (allowed === 'https://*.replit.app' && origin.endsWith('.replit.app')) {
          return true;
        }
        const pattern = allowed.replace(/\*/g, '.*').replace(/\./g, '\\.');
        const regex = new RegExp(`^${pattern}$`);
        return regex.test(origin);
      }
      
      return allowed === origin;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  
  // Allowed methods
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  
  // Allowed headers
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'X-CSRF-Token',
    'X-Session-ID'
  ],
  
  // Expose headers to client
  exposedHeaders: [
    'X-Total-Count',
    'X-Page-Count',
    'X-Current-Page',
    'X-Per-Page',
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset'
  ],
  
  // Allow credentials (cookies, authorization headers)
  credentials: true,
  
  // Cache preflight response for 24 hours
  maxAge: 86400,
  
  // Success status for legacy browsers
  optionsSuccessStatus: 200
};

// Create CORS middleware instance
export const corsMiddleware = cors(corsOptions);

// Custom CORS error handler
export const corsErrorHandler = (err: any, req: Request, res: any, next: any) => {
  if (err && err.message === 'Not allowed by CORS') {
    res.status(403).json({
      error: 'CORS Policy Violation',
      message: 'Origin not allowed',
      origin: req.headers.origin
    });
  } else {
    next(err);
  }
};