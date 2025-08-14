import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [key: string]: {
    count: number;
    firstRequest: number;
  };
}

const store: RateLimitStore = {};

export function createRateLimit(options: {
  windowMs: number;
  max: number;
  message?: string;
}) {
  const { windowMs, max, message = 'Too many requests' } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();

    if (!store[key]) {
      store[key] = {
        count: 1,
        firstRequest: now
      };
      return next();
    }

    const timeWindow = store[key].firstRequest + windowMs;
    
    if (now > timeWindow) {
      // Reset window
      store[key] = {
        count: 1,
        firstRequest: now
      };
      return next();
    }

    if (store[key].count >= max) {
      return res.status(429).json({ 
        message,
        retryAfter: Math.ceil((timeWindow - now) / 1000)
      });
    }

    store[key].count++;
    next();
  };
}

// Talent response rate limiting
export const talentResponseRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 responses per 15 minutes
  message: 'Too many booking responses. Please wait before submitting another response.'
});

// General API rate limiting
export const generalRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  message: 'Too many API requests. Please slow down.'
});