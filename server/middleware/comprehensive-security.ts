import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

// Comprehensive security middleware for complete platform protection

// CSRF Token Management
const csrfTokens = new Map<string, { token: string; expires: number }>();

export function generateCSRFToken(sessionId: string): string {
  const token = crypto.randomBytes(32).toString('hex');
  const expires = Date.now() + 3600000; // 1 hour
  csrfTokens.set(sessionId, { token, expires });
  return token;
}

export function validateCSRFToken(sessionId: string, token: string): boolean {
  const stored = csrfTokens.get(sessionId);
  if (!stored) return false;
  
  // Clean up expired tokens
  if (stored.expires < Date.now()) {
    csrfTokens.delete(sessionId);
    return false;
  }
  
  return stored.token === token;
}

// SQL Injection Prevention
export function sanitizeSQL(input: string): string {
  // Remove common SQL injection patterns
  const dangerous = [
    /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b)/gi,
    /(--|#|\/\*|\*\/)/g,
    /(\x00|\x1a)/g,
    /('|"|`)/g
  ];
  
  let sanitized = input;
  dangerous.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });
  
  return sanitized.trim();
}

// XSS Prevention
export function sanitizeHTML(input: string): string {
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };
  
  return input.replace(/[&<>"'\/]/g, (s) => htmlEntities[s] || s);
}

// Request Body Sanitization
export function deepSanitize(obj: any): any {
  if (typeof obj === 'string') {
    return sanitizeHTML(sanitizeSQL(obj));
  } else if (Array.isArray(obj)) {
    return obj.map(deepSanitize);
  } else if (obj && typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      const sanitizedKey = sanitizeHTML(key);
      sanitized[sanitizedKey] = deepSanitize(value);
    }
    return sanitized;
  }
  return obj;
}

// IP Rate Limiting
const ipRequests = new Map<string, { count: number; resetTime: number }>();

export function checkIPRateLimit(
  ip: string, 
  maxRequests: number = 100, 
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const record = ipRequests.get(ip);
  
  if (!record || record.resetTime < now) {
    ipRequests.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (record.count >= maxRequests) {
    return false;
  }
  
  record.count++;
  return true;
}

// Security Headers Middleware
export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // XSS Protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Content Type Options
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Strict Transport Security
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions Policy
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Content Security Policy
  res.setHeader('Content-Security-Policy', [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https:",
    "media-src 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; '));
  
  next();
}

// Input Validation Middleware
export function validateInput(req: Request, res: Response, next: NextFunction) {
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /\.\.\//g, // Directory traversal
    /<script/gi, // Script tags
    /javascript:/gi, // JavaScript protocol
    /on\w+\s*=/gi, // Event handlers
    /\x00/g // Null bytes
  ];
  
  const checkSuspicious = (str: string): boolean => {
    return suspiciousPatterns.some(pattern => pattern.test(str));
  };
  
  // Validate URL
  if (checkSuspicious(req.url)) {
    return res.status(400).json({ message: 'Invalid request URL' });
  }
  
  // Validate headers
  for (const [key, value] of Object.entries(req.headers)) {
    if (typeof value === 'string' && checkSuspicious(value)) {
      return res.status(400).json({ message: 'Invalid request headers' });
    }
  }
  
  // Sanitize body
  if (req.body) {
    req.body = deepSanitize(req.body);
  }
  
  next();
}

// Complete Security Middleware Stack
export function comprehensiveSecurity() {
  return [
    securityHeaders,
    validateInput,
    (req: Request, res: Response, next: NextFunction) => {
      // IP Rate Limiting
      const ip = req.ip || req.connection.remoteAddress || '';
      if (!checkIPRateLimit(ip)) {
        return res.status(429).json({ message: 'Too many requests' });
      }
      next();
    }
  ];
}