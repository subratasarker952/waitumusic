/**
 * Centralized Authorization System
 * Single source of truth for all role-based access control
 */

// Role ID Constants
export const ROLE_IDS = {
  SUPERADMIN: 1,
  ADMIN: 2,
  STAR_TALENT: 3,
  RISING_ARTIST: 4,
  STUDIO_PRO: 5,
  SESSION_PLAYER: 6,
  INDUSTRY_EXPERT: 7,
  MUSIC_PROFESSIONAL: 8,
  MUSIC_LOVER: 9
} as const;

// Role Groups for easier management
export const ROLE_GROUPS = {
  ALL_USERS: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  ADMIN_ONLY: [1, 2],
  SUPERADMIN_ONLY: [1],
  TALENT: [3, 4],
  MUSICIANS: [5, 6],
  PROFESSIONALS: [7, 8],
  MANAGED_TALENT: [3, 5, 7], // Managed versions
  MANAGED_AND_ABOVE: [1, 2, 3, 5, 7], // Admin roles + managed talent
  PERFORMERS: [3, 4, 5, 6], // All performing roles
  INDUSTRY: [7, 8], // Industry professionals
  CONTENT_CREATORS: [3, 4, 5, 6, 7], // Can create content
  BOOKING_ENABLED: [1, 2, 3, 5, 7], // Can make bookings
  NON_FANS: [1, 2, 3, 4, 5, 6, 7, 8] // All users except fans
} as const;

// Page-specific authorization rules
export const PAGE_PERMISSIONS = {
  // Admin pages
  '/users': ROLE_GROUPS.ADMIN_ONLY,
  '/admin': ROLE_GROUPS.ADMIN_ONLY,
  '/comprehensive-workflow': ROLE_GROUPS.ADMIN_ONLY,
  '/system-management': ROLE_GROUPS.SUPERADMIN_ONLY,
  
  // Booking pages
  '/booking': ROLE_GROUPS.BOOKING_ENABLED,
  '/bookings': ROLE_GROUPS.BOOKING_ENABLED,
  
  // OppHub - Non-fan users only
  '/opphub': ROLE_GROUPS.NON_FANS,
  '/opphub-strategic': ROLE_GROUPS.NON_FANS,
  
  // General access
  '/dashboard': ROLE_GROUPS.ALL_USERS,
  '/artists': ROLE_GROUPS.ALL_USERS,
  '/store': ROLE_GROUPS.ALL_USERS,
  '/cart': ROLE_GROUPS.ALL_USERS,
  
  // Fan-only pages
  '/fan-dashboard': [ROLE_IDS.MUSIC_LOVER],
  
  // Content management
  '/merchandise': ROLE_GROUPS.CONTENT_CREATORS,
  '/newsletters': ROLE_GROUPS.CONTENT_CREATORS,
  '/splitsheets': ROLE_GROUPS.PERFORMERS,
  '/contracts': ROLE_GROUPS.CONTENT_CREATORS,
  '/technical-riders': ROLE_GROUPS.PERFORMERS,
  '/isrc': ROLE_GROUPS.CONTENT_CREATORS
} as const;

// API endpoint authorization rules
export const API_PERMISSIONS = {
  // Admin APIs
  '/api/admin/config': ROLE_GROUPS.SUPERADMIN_ONLY,
  '/api/admin/users': ROLE_GROUPS.ADMIN_ONLY,
  '/api/admin/dashboard-stats': ROLE_GROUPS.ADMIN_ONLY,
  '/api/admin/system-config': ROLE_GROUPS.ADMIN_ONLY,
  
  // Primary roles management
  '/api/primary-roles': ROLE_GROUPS.ADMIN_ONLY,
  
  // Booking management
  '/api/bookings': ROLE_GROUPS.BOOKING_ENABLED,
  '/api/booking-assignments': ROLE_GROUPS.ADMIN_ONLY,
  
  // OppHub APIs - Non-fan users only
  '/api/opphub': ROLE_GROUPS.NON_FANS,
  '/api/opportunities': ROLE_GROUPS.NON_FANS,
  '/api/opportunity-applications': ROLE_GROUPS.NON_FANS,
  '/api/opportunity-categories': ROLE_GROUPS.NON_FANS,
  '/api/opphub-subscriptions': ROLE_GROUPS.NON_FANS,
  '/api/market-intelligence': ROLE_GROUPS.NON_FANS,
  
  // Content management
  '/api/merchandise': ROLE_GROUPS.CONTENT_CREATORS,
  '/api/newsletters': ROLE_GROUPS.CONTENT_CREATORS,
  '/api/splitsheets': ROLE_GROUPS.PERFORMERS,
  '/api/contracts': ROLE_GROUPS.CONTENT_CREATORS,
  '/api/technical-riders': ROLE_GROUPS.PERFORMERS,
  '/api/isrc-codes': ROLE_GROUPS.CONTENT_CREATORS,
  
  // Currency and revenue (superadmin only)
  '/api/currencies': ROLE_GROUPS.SUPERADMIN_ONLY,
  '/api/revenue': ROLE_GROUPS.ADMIN_ONLY,
  
  // Analytics
  '/api/analytics': ROLE_GROUPS.ADMIN_ONLY,
  
  // General access
  '/api/artists': ROLE_GROUPS.ALL_USERS,
  '/api/songs': ROLE_GROUPS.ALL_USERS,
  '/api/albums': ROLE_GROUPS.ALL_USERS,
  '/api/user/profile': ROLE_GROUPS.ALL_USERS
} as const;

// Helper functions
export function hasPermission(userRoleId: number, allowedRoles: readonly number[]): boolean {
  return allowedRoles.includes(userRoleId);
}

export function getPagePermissions(path: string): readonly number[] {
  // Remove query parameters and fragments
  const cleanPath = path.split('?')[0].split('#')[0];
  
  // Check exact match first
  if (PAGE_PERMISSIONS[cleanPath as keyof typeof PAGE_PERMISSIONS]) {
    return PAGE_PERMISSIONS[cleanPath as keyof typeof PAGE_PERMISSIONS];
  }
  
  // Check for dynamic routes
  if (cleanPath.startsWith('/artist/')) return ROLE_GROUPS.ALL_USERS;
  if (cleanPath.startsWith('/booking/')) return ROLE_GROUPS.BOOKING_ENABLED;
  if (cleanPath.startsWith('/admin/')) return ROLE_GROUPS.ADMIN_ONLY;
  
  // Default to all users for unlisted pages
  return ROLE_GROUPS.ALL_USERS;
}

export function getApiPermissions(endpoint: string): readonly number[] {
  // Remove query parameters
  const cleanEndpoint = endpoint.split('?')[0];
  
  // Check exact match first
  if (API_PERMISSIONS[cleanEndpoint as keyof typeof API_PERMISSIONS]) {
    return API_PERMISSIONS[cleanEndpoint as keyof typeof API_PERMISSIONS];
  }
  
  // Check for dynamic routes
  if (cleanEndpoint.startsWith('/api/admin/')) return ROLE_GROUPS.ADMIN_ONLY;
  if (cleanEndpoint.startsWith('/api/bookings/')) return ROLE_GROUPS.BOOKING_ENABLED;
  if (cleanEndpoint.startsWith('/api/opphub/')) return ROLE_GROUPS.NON_FANS;
  if (cleanEndpoint.startsWith('/api/opportunity')) return ROLE_GROUPS.NON_FANS;
  if (cleanEndpoint.startsWith('/api/artists/')) return ROLE_GROUPS.ALL_USERS;
  if (cleanEndpoint.startsWith('/api/user/')) return ROLE_GROUPS.ALL_USERS;
  
  // Default to admin only for unlisted API endpoints (secure by default)
  return ROLE_GROUPS.ADMIN_ONLY;
}

// Validation functions
export function canAccessPage(userRoleId: number, path: string): boolean {
  const allowedRoles = getPagePermissions(path);
  return hasPermission(userRoleId, allowedRoles);
}

export function canAccessApi(userRoleId: number, endpoint: string): boolean {
  const allowedRoles = getApiPermissions(endpoint);
  return hasPermission(userRoleId, allowedRoles);
}

// Role validation for middleware
export function requireRole(allowedRoles: readonly number[]) {
  return (req: any, res: any, next: any) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const userRoleId = req.user.roleId;
    if (!hasPermission(userRoleId, allowedRoles)) {
      console.log('Role check:', {
        userId: req.user.userId,
        userRoleId,
        userRole: req.user.roleName || 'Unknown',
        requiredRoles: Array.from(allowedRoles)
      });
      console.log('Role check failed: insufficient permissions. User role ID:', userRoleId, 'Required:', Array.from(allowedRoles));
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    next();
  };
}

export default {
  ROLE_IDS,
  ROLE_GROUPS,
  PAGE_PERMISSIONS,
  API_PERMISSIONS,
  hasPermission,
  getPagePermissions,
  getApiPermissions,
  canAccessPage,
  canAccessApi,
  requireRole
};