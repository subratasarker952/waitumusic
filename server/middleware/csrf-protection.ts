import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

// CSRF token storage (in production, use Redis or database)
const csrfTokens = new Map<string, { token: string; expires: number }>();

// Generate CSRF token
export const generateCSRFToken = (sessionId: string): string => {
  const token = crypto.randomBytes(32).toString('hex');
  const expires = Date.now() + (4 * 60 * 60 * 1000); // 4 hours
  
  csrfTokens.set(sessionId, { token, expires });
  
  // Clean up expired tokens
  cleanupExpiredTokens();
  
  return token;
};

// Validate CSRF token
export const validateCSRFToken = (sessionId: string, token: string): boolean => {
  const stored = csrfTokens.get(sessionId);
  
  if (!stored) return false;
  if (stored.expires < Date.now()) {
    csrfTokens.delete(sessionId);
    return false;
  }
  
  return stored.token === token;
};

// Clean up expired tokens
const cleanupExpiredTokens = () => {
  const now = Date.now();
  for (const [sessionId, data] of csrfTokens.entries()) {
    if (data.expires < now) {
      csrfTokens.delete(sessionId);
    }
  }
};

// CSRF middleware
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  // Skip CSRF for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  
  // Skip CSRF for API keys (if implemented)
  if (req.headers['x-api-key']) {
    return next();
  }
  
  // Check for JWT token first (preferred method)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    // User is authenticated with JWT - skip CSRF protection
    return next();
  }
  
  // Fallback to session ID for legacy support
  const sessionId = (req as any).session?.id || req.headers['x-session-id'] as string;
  
  if (!sessionId) {
    return res.status(403).json({
      error: 'No session',
      message: 'Authentication required for this operation'
    });
  }
  
  // Get CSRF token from header or body
  const token = req.headers['x-csrf-token'] as string || req.body._csrf;
  
  if (!token) {
    return res.status(403).json({
      error: 'Missing CSRF token',
      message: 'CSRF token required for this operation'
    });
  }
  
  // Validate token
  if (!validateCSRFToken(sessionId, token)) {
    return res.status(403).json({
      error: 'Invalid CSRF token',
      message: 'CSRF token validation failed'
    });
  }
  
  next();
};

// Endpoint to get CSRF token
export const getCSRFToken = (req: Request, res: Response) => {
  // Check for JWT token first
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    // For JWT authenticated users, return a simple token
    return res.json({ csrfToken: 'jwt-authenticated' });
  }
  
  const sessionId = (req as any).session?.id || req.headers['x-session-id'] as string;
  
  if (!sessionId) {
    return res.status(400).json({
      error: 'No session',
      message: 'Authentication required to generate CSRF token'
    });
  }
  
  const token = generateCSRFToken(sessionId);
  
  res.json({ csrfToken: token });
};

// Double submit cookie pattern (alternative approach)
export const doubleSubmitCookie = (req: Request, res: Response, next: NextFunction) => {
  // Skip for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  
  const cookieToken = req.cookies['csrf-token'];
  const headerToken = req.headers['x-csrf-token'];
  
  if (!cookieToken || !headerToken) {
    return res.status(403).json({
      error: 'Missing CSRF token',
      message: 'CSRF protection requires both cookie and header tokens'
    });
  }
  
  if (cookieToken !== headerToken) {
    return res.status(403).json({
      error: 'CSRF token mismatch',
      message: 'Cookie and header CSRF tokens do not match'
    });
  }
  
  next();
};

// Set CSRF cookie
export const setCSRFCookie = (req: Request, res: Response, next: NextFunction) => {
  if (!req.cookies || !req.cookies['csrf-token']) {
    const token = crypto.randomBytes(32).toString('hex');
    res.cookie('csrf-token', token, {
      httpOnly: false, // Must be accessible by JavaScript
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 4 * 60 * 60 * 1000 // 4 hours
    });
  }
  next();
};