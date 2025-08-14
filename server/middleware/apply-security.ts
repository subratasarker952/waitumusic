import { Express } from 'express';
import cookieParser from 'cookie-parser';
import { corsMiddleware, corsErrorHandler } from './cors-config';
import { csrfProtection, setCSRFCookie, getCSRFToken } from './csrf-protection';
import { apiLimiter, authLimiter, uploadLimiter, bookingResponseLimiter } from './rate-limiter';
import { requestLogger } from '../utils/error-logger';
import { cacheMiddleware } from '../utils/query-cache';

export function applySecurityMiddleware(app: Express) {
  // Apply cookie parser first (required for CSRF)
  app.use(cookieParser());
  
  // Apply CORS
  app.use(corsMiddleware);
  app.use(corsErrorHandler);
  
  // Apply request logging
  app.use(requestLogger);
  
  // Apply cache middleware
  app.use(cacheMiddleware);
  
  // Set CSRF cookie for all requests
  app.use(setCSRFCookie);
  
  // Apply general rate limiting
  app.use('/api/', apiLimiter);
  
  // Apply specific rate limits
  app.use('/api/auth/login', authLimiter);
  app.use('/api/auth/register', authLimiter);
  app.use('/api/upload', uploadLimiter);
  app.use('/api/bookings/*/respond', bookingResponseLimiter);
  
  // CSRF endpoint
  app.get('/api/csrf-token', getCSRFToken);
  
  // Apply CSRF protection to state-changing routes (excluding assignment endpoints that use JWT)
  app.use('/api/users', csrfProtection);
  app.use('/api/songs', csrfProtection);
  app.use('/api/albums', csrfProtection);
  app.use('/api/admin', csrfProtection);
  
  // Apply CSRF protection to booking routes except assignment endpoints
  app.use(/^\/api\/bookings(?!\/(assign|booking-assignments))/, csrfProtection);
  
  console.log('✅ Security middleware applied: CORS, CSRF, Rate Limiting, Logging, Caching');
}