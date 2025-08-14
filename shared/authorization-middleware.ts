/**
 * Express middleware utilities for centralized authorization
 */

import { Request, Response, NextFunction } from 'express';
import { requireRole as createRequireRole } from './authorization';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        roleId: number;
        email: string;
        roleName?: string;
      };
    }
  }
}

/**
 * Create a middleware function that requires specific roles
 * This is a wrapper around the requireRole function from authorization.ts
 * to provide better typing and error handling for Express
 */
export function requireRole(allowedRoles: readonly number[]) {
  return createRequireRole(allowedRoles);
}

// Export all authorization constants and functions for convenience
export * from './authorization';