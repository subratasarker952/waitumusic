/**
 * Consolidated Patterns - All Scattered Logic Centralized Here
 * This file eliminates all scattered patterns found throughout the codebase
 */

// Authorization imports
export * from './authorization';
export * from './authorization-middleware';
export * from './role-utils';

/**
 * Consolidated API Response Pattern
 * Replaces scattered response formatting
 */
export interface StandardApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: string;
}

export function createSuccessResponse<T>(data: T, message?: string): StandardApiResponse<T> {
  return {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString()
  };
}

export function createErrorResponse(error: string, data?: any): StandardApiResponse {
  return {
    success: false,
    error,
    data,
    timestamp: new Date().toISOString()
  };
}

/**
 * Consolidated User Type Checks
 * Replaces scattered user type validation
 */
export function getUserType(roleId: number): 'admin' | 'talent' | 'professional' | 'fan' | 'unknown' {
  if ([1, 2].includes(roleId)) return 'admin';
  if ([3, 4, 5].includes(roleId)) return 'talent';
  if ([6, 7, 8].includes(roleId)) return 'professional';
  if (roleId === 9) return 'fan';
  return 'unknown';
}

/**
 * Consolidated Permission Check Pattern
 * Replaces all scattered permission validation
 */
export function checkPermission(userRoleId: number, requiredPermission: string): boolean {
  const permissions: Record<string, number[]> = {
    'admin.full': [1],
    'admin.basic': [1, 2],
    'content.create': [1, 2, 3, 4, 5],
    'content.manage': [1, 2],
    'booking.create': [1, 2, 3, 4, 5, 6, 7, 8, 9],
    'booking.manage': [1, 2],
    'user.edit': [1, 2],
    'profile.edit': [1, 2, 3, 4, 5, 6, 7, 8, 9],
    'analytics.view': [1, 2],
    'system.manage': [1]
  };
  
  return permissions[requiredPermission]?.includes(userRoleId) || false;
}

/**
 * Consolidated Error Handler Pattern
 * Replaces scattered error handling
 */
export function handleApiError(error: unknown, context: string = 'API'): StandardApiResponse {
  console.error(`${context} Error:`, error);
  
  if (error instanceof Error) {
    return createErrorResponse(error.message);
  }
  
  return createErrorResponse('An unexpected error occurred');
}

/**
 * Consolidated Database Query Pattern
 * Standardizes database interaction patterns
 */
export interface QueryOptions {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

export function buildQueryOptions(options: Partial<QueryOptions>): QueryOptions {
  return {
    limit: options.limit || 50,
    offset: options.offset || 0,
    sortBy: options.sortBy || 'id',
    sortOrder: options.sortOrder || 'desc',
    filters: options.filters || {}
  };
}

/**
 * Consolidated Validation Pattern
 * Replaces scattered validation logic
 */
export function validateUserId(userId: any): number {
  const id = parseInt(userId, 10);
  if (isNaN(id) || id <= 0) {
    throw new Error('Invalid user ID');
  }
  return id;
}

export function validateRoleId(roleId: any): number {
  const id = parseInt(roleId, 10);
  if (isNaN(id) || id < 1 || id > 9) {
    throw new Error('Invalid role ID');
  }
  return id;
}

/**
 * Consolidated Date Pattern
 * Standardizes date handling across the platform
 */
export function formatTimestamp(date: Date = new Date()): string {
  return date.toISOString();
}

export function parseTimestamp(timestamp: string): Date {
  return new Date(timestamp);
}

/**
 * Consolidated Cache Keys Pattern
 * Standardizes cache key generation
 */
export function generateCacheKey(type: string, id?: string | number, filters?: string): string {
  const parts = [type];
  if (id !== undefined) parts.push(String(id));
  if (filters) parts.push(filters);
  return parts.join(':');
}

/**
 * Master Pattern Export
 * Single import point for all consolidated patterns
 */
export const ConsolidatedPatterns = {
  // Authorization
  ROLE_GROUPS,
  hasRole,
  requireRole,
  
  // Role Utils
  getCreativeRoleName,
  isAdminLevel,
  canCreateBookings,
  canCreateContent,
  
  // API Responses
  createSuccessResponse,
  createErrorResponse,
  handleApiError,
  
  // User Management
  getUserType,
  checkPermission,
  validateUserId,
  validateRoleId,
  
  // Query Building
  buildQueryOptions,
  
  // Cache Management
  generateCacheKey,
  
  // Date Handling
  formatTimestamp,
  parseTimestamp
};