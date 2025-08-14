import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
// Logging types for API security
enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

function logError(error: Error, severity: ErrorSeverity, context: any) {
  console.error(`[${severity.toUpperCase()}]`, error.message, context);
}

// API Security middleware for comprehensive protection

// Rate limiting configurations for different endpoints
export const apiRateLimiters = {
  // Strict rate limit for authentication endpoints
  auth: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
    message: 'Too many authentication attempts, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
  }),

  // Standard rate limit for general API endpoints
  standard: rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 60, // 60 requests per minute
    message: 'Too many requests, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
  }),

  // Relaxed rate limit for read-heavy endpoints
  read: rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute
    message: 'Too many requests, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
  }),

  // File upload rate limit
  upload: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 uploads per window
    message: 'Too many upload attempts, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
  })
};

// API key validation middleware
export function validateApiKey(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.headers['x-api-key'] as string;
  
  if (!apiKey) {
    return res.status(401).json({ message: 'API key required' });
  }

  // In production, validate against stored API keys
  if (process.env.NODE_ENV === 'production' && apiKey !== process.env.API_KEY) {
    logError(new Error('Invalid API key'), ErrorSeverity.WARNING, {
      endpoint: req.path,
      ip: req.ip
    });
    return res.status(401).json({ message: 'Invalid API key' });
  }

  next();
}

// Request validation middleware
export function validateRequest(req: Request, res: Response, next: NextFunction) {
  // Validate content-type for POST/PUT/PATCH requests
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.headers['content-type'];
    if (!contentType || !contentType.includes('application/json')) {
      return res.status(400).json({ 
        message: 'Content-Type must be application/json' 
      });
    }
  }

  // Validate request size
  const contentLength = parseInt(req.headers['content-length'] || '0');
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (contentLength > maxSize) {
    return res.status(413).json({ 
      message: 'Request entity too large' 
    });
  }

  next();
}

// Security headers middleware
export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  // Set security headers manually
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  
  // Content Security Policy
  res.setHeader('Content-Security-Policy', [
    "default-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "img-src 'self' data: https:",
    "connect-src 'self' https:",
    "font-src 'self' https: data:",
    "object-src 'none'",
    "media-src 'self'",
    "frame-src 'none'"
  ].join('; '));
  
  next();
}

// Input sanitization middleware
export function sanitizeInput(req: Request, res: Response, next: NextFunction) {
  // Recursively sanitize request body
  const sanitize = (obj: any): any => {
    if (typeof obj === 'string') {
      // Remove null bytes
      return obj.replace(/\0/g, '');
    } else if (Array.isArray(obj)) {
      return obj.map(sanitize);
    } else if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          // Sanitize keys too
          const sanitizedKey = key.replace(/\0/g, '');
          sanitized[sanitizedKey] = sanitize(obj[key]);
        }
      }
      return sanitized;
    }
    return obj;
  };

  if (req.body) {
    req.body = sanitize(req.body);
  }

  next();
}

// Combined API security middleware
export function apiSecurity() {
  return [
    securityHeaders,
    validateRequest,
    sanitizeInput
  ];
}