import { z } from "zod";
import DOMPurify from "isomorphic-dompurify";

/**
 * Comprehensive Security Input Validation and Sanitization
 * Protects against XSS, SQL injection, code injection, and other malicious attacks
 */

// Common malicious patterns to detect and block
const MALICIOUS_PATTERNS = [
  // Script tags and JavaScript
  /<script[^>]*>.*?<\/script>/gi,
  /javascript:/gi,
  /vbscript:/gi,
  /onload\s*=/gi,
  /onclick\s*=/gi,
  /onerror\s*=/gi,
  /onmouseover\s*=/gi,
  /onfocus\s*=/gi,
  /onblur\s*=/gi,
  
  // SQL injection patterns
  /union\s+select/gi,
  /drop\s+table/gi,
  /delete\s+from/gi,
  /update\s+.*\s+set/gi,
  /insert\s+into/gi,
  /exec\s*\(/gi,
  /execute\s*\(/gi,
  
  // Command injection
  /\|\s*nc\s/gi,
  /\|\s*netcat/gi,
  /\|\s*curl/gi,
  /\|\s*wget/gi,
  /\|\s*rm\s/gi,
  /\|\s*cat\s/gi,
  /\|\s*ls\s/gi,
  /&&\s*rm/gi,
  /;\s*rm/gi,
  
  // Path traversal
  /\.\.\//gi,
  /\.\.\\/gi,
  /%2e%2e%2f/gi,
  /%2e%2e\//gi,
  /\.\.%2f/gi,
  
  // Template injection
  /\{\{.*\}\}/gi,
  /\$\{.*\}/gi,
  /<\%.*\%>/gi,
  
  // File system access
  /file:\/\//gi,
  /ftp:\/\//gi,
  
  // Data URIs with executable content
  /data:\s*text\/html/gi,
  /data:\s*application\/javascript/gi,
];

// Email validation with security checks
const EMAIL_VALIDATION = z.string()
  .email("Invalid email format")
  .max(254, "Email too long")
  .refine((email) => {
    // Block disposable email domains (basic list)
    const disposableDomains = [
      'tempmail.org', '10minutemail.com', 'guerrillamail.com',
      'mailinator.com', 'trash-mail.com', 'throwaway.email'
    ];
    const domain = email.split('@')[1]?.toLowerCase();
    return !disposableDomains.includes(domain);
  }, "Disposable email addresses are not allowed")
  .refine((email) => {
    // Block obvious malicious patterns
    return !MALICIOUS_PATTERNS.some(pattern => pattern.test(email));
  }, "Invalid email content detected");

// Name validation with security checks
const NAME_VALIDATION = z.string()
  .min(1, "Name is required")
  .max(100, "Name too long")
  .refine((name) => {
    // Only allow letters, spaces, hyphens, apostrophes, and periods
    return /^[a-zA-Z\s\-'.]+$/.test(name);
  }, "Name contains invalid characters")
  .refine((name) => {
    // Block malicious patterns
    return !MALICIOUS_PATTERNS.some(pattern => pattern.test(name));
  }, "Invalid name content detected");

// Message/content validation with security checks
const MESSAGE_VALIDATION = z.string()
  .min(1, "Message is required")
  .max(5000, "Message too long")
  .refine((message) => {
    // Block malicious patterns
    return !MALICIOUS_PATTERNS.some(pattern => pattern.test(message));
  }, "Message contains potentially harmful content")
  .refine((message) => {
    // Block excessive special characters (potential obfuscation)
    const specialCharCount = (message.match(/[^a-zA-Z0-9\s.,!?;:'"()\-]/g) || []).length;
    const totalLength = message.length;
    return specialCharCount / totalLength < 0.3; // Less than 30% special chars
  }, "Message contains too many special characters");

// URL validation with security checks
const URL_VALIDATION = z.string()
  .url("Invalid URL format")
  .max(2048, "URL too long")
  .refine((url) => {
    // Only allow HTTP and HTTPS protocols
    return url.startsWith('http://') || url.startsWith('https://');
  }, "Only HTTP and HTTPS URLs are allowed")
  .refine((url) => {
    // Block malicious patterns
    return !MALICIOUS_PATTERNS.some(pattern => pattern.test(url));
  }, "URL contains potentially harmful content")
  .refine((url) => {
    try {
      const urlObj = new URL(url);
      // Block localhost and private IPs (SSRF protection)
      const hostname = urlObj.hostname.toLowerCase();
      const blockedHosts = [
        'localhost', '127.0.0.1', '0.0.0.0',
        '10.', '172.16.', '172.17.', '172.18.', '172.19.',
        '172.20.', '172.21.', '172.22.', '172.23.',
        '172.24.', '172.25.', '172.26.', '172.27.',
        '172.28.', '172.29.', '172.30.', '172.31.',
        '192.168.', '169.254.'
      ];
      return !blockedHosts.some(blocked => hostname.includes(blocked));
    } catch {
      return false;
    }
  }, "URL targets are not allowed");

// Phone number validation
const PHONE_VALIDATION = z.string()
  .max(20, "Phone number too long")
  .refine((phone) => {
    // Allow only digits, spaces, hyphens, parentheses, and plus sign
    return /^[\d\s\-\(\)\+]+$/.test(phone);
  }, "Phone number contains invalid characters")
  .optional();

// Slug validation for URLs
const SLUG_VALIDATION = z.string()
  .min(3, "Slug must be at least 3 characters")
  .max(50, "Slug too long")
  .refine((slug) => {
    // Only allow lowercase letters, numbers, and hyphens
    return /^[a-z0-9\-]+$/.test(slug);
  }, "Slug can only contain lowercase letters, numbers, and hyphens")
  .refine((slug) => {
    // Block reserved words
    const reserved = [
      'admin', 'api', 'www', 'mail', 'ftp', 'localhost',
      'root', 'test', 'staging', 'dev', 'demo', 'null',
      'undefined', 'void', 'nil', 'none', 'false', 'true'
    ];
    return !reserved.includes(slug);
  }, "Slug uses a reserved word");

/**
 * Sanitize HTML content while preserving safe formatting
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    RETURN_DOM_IMPORT: false,
    SANITIZE_DOM: true
  });
}

/**
 * Sanitize plain text by removing potentially dangerous content
 */
export function sanitizeText(text: string): string {
  // Remove null bytes and control characters
  let sanitized = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  // Normalize unicode
  sanitized = sanitized.normalize('NFKC');
  
  // Trim excessive whitespace
  sanitized = sanitized.trim().replace(/\s+/g, ' ');
  
  return sanitized;
}

/**
 * Validate and sanitize contact form data
 */
export const contactFormSchema = z.object({
  name: NAME_VALIDATION.transform(sanitizeText),
  email: EMAIL_VALIDATION.transform(sanitizeText),
  phone: PHONE_VALIDATION?.transform(sanitizeText),
  message: MESSAGE_VALIDATION.transform(sanitizeText),
  artistId: z.coerce.number().int().positive().optional(),
  source: z.string().max(100).optional().transform(val => val ? sanitizeText(val) : undefined),
  honeypot: z.string().max(0, "Bot detected").optional(), // Honeypot field
});

/**
 * Validate and sanitize newsletter subscription data
 */
export const newsletterSubscriptionSchema = z.object({
  email: EMAIL_VALIDATION.transform(sanitizeText),
  firstName: NAME_VALIDATION.optional().transform(val => val ? sanitizeText(val) : undefined),
  lastName: NAME_VALIDATION.optional().transform(val => val ? sanitizeText(val) : undefined),
  artistId: z.coerce.number().int().positive().optional(),
  source: z.string().max(100).optional().transform(val => val ? sanitizeText(val) : undefined),
  subscriptionType: z.enum(['general', 'artist_updates', 'newsletter']).default('general'),
  honeypot: z.string().max(0, "Bot detected").optional(), // Honeypot field
});

/**
 * Validate and sanitize website integration data
 */
export const websiteIntegrationSchema = z.object({
  slug: SLUG_VALIDATION.transform(sanitizeText),
  pageTitle: z.string().min(1).max(100).transform(sanitizeText),
  pageDescription: z.string().max(500).optional().transform(val => val ? sanitizeText(val) : undefined),
  customLinks: z.array(z.object({
    title: z.string().min(1).max(100).transform(sanitizeText),
    url: URL_VALIDATION,
    description: z.string().max(200).optional().transform(val => val ? sanitizeText(val) : undefined),
  })).max(20, "Too many custom links"),
});

/**
 * Rate limiting helper
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(ip: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
  const now = Date.now();
  const key = `${ip}`;
  
  const current = rateLimitMap.get(key);
  if (!current || now > current.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (current.count >= maxRequests) {
    return false;
  }
  
  current.count++;
  return true;
}

/**
 * Security middleware for protecting endpoints
 */
export function securityMiddleware(req: any, res: any, next: any) {
  // Check rate limiting
  const clientIp = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 'unknown';
  if (!checkRateLimit(clientIp)) {
    return res.status(429).json({ 
      success: false, 
      message: "Too many requests. Please try again later." 
    });
  }
  
  // Check for common attack headers
  const userAgent = req.get('User-Agent') || '';
  const suspiciousAgents = [
    'sqlmap', 'nikto', 'burp', 'nmap', 'masscan',
    'gobuster', 'dirbuster', 'wfuzz', 'ffuf'
  ];
  
  if (suspiciousAgents.some(agent => userAgent.toLowerCase().includes(agent))) {
    return res.status(403).json({ 
      success: false, 
      message: "Request blocked for security reasons." 
    });
  }
  
  // Block requests with suspicious headers
  const referer = req.get('Referer') || '';
  if (MALICIOUS_PATTERNS.some(pattern => pattern.test(referer))) {
    return res.status(403).json({ 
      success: false, 
      message: "Request blocked for security reasons." 
    });
  }
  
  next();
}

export type ContactFormData = z.infer<typeof contactFormSchema>;
export type NewsletterSubscriptionData = z.infer<typeof newsletterSubscriptionSchema>;
export type WebsiteIntegrationData = z.infer<typeof websiteIntegrationSchema>;