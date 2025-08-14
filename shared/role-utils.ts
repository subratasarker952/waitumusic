/**
 * Centralized Role Utilities
 * All scattered role-related logic consolidated here
 */

import { ROLE_GROUPS } from './authorization';

// Re-export ROLE_GROUPS for convenience
export { ROLE_GROUPS } from './authorization';

/**
 * Get creative role name for display purposes
 * DEPRECATED: Use API call to /api/roles or storage.getRoleName() instead
 * This function is maintained only for legacy compatibility
 */
export function getCreativeRoleName(roleId: number): string {
  console.warn('getCreativeRoleName is deprecated - use database-driven role fetching instead');
  // Fallback only - should be replaced with database calls
  const roleNames: Record<number, string> = {
    1: 'Platform Maestro',
    2: 'Music Director', 
    3: 'Star Talent',
    4: 'Rising Artist',
    5: 'Studio Pro',
    6: 'Session Player',
    7: 'Industry Expert',
    8: 'Music Professional',
    9: 'Music Lover'
  };
  
  return roleNames[roleId] || 'Unknown Role';
}

/**
 * Check if user is admin-level (superadmin or admin)
 */
export function isAdminLevel(roleId: number): boolean {
  return ROLE_GROUPS.ADMIN_ONLY.includes(roleId as any);
}

/**
 * Check if user can create bookings
 */
export function canCreateBookings(roleId: number): boolean {
  return ROLE_GROUPS.BOOKING_ENABLED.includes(roleId as any);
}

/**
 * Check if user is managed (has enhanced features)
 * DEPRECATED: Use storage.isUserManaged() instead for database-driven logic
 */
export function isManagedUser(roleId: number): boolean {
  console.warn('isManagedUser is deprecated - use storage.isUserManaged() instead');
  return [3, 5, 7].includes(roleId); // Star Talent, Studio Pro, Industry Expert
}

/**
 * Check if user can create content
 */
export function canCreateContent(roleId: number): boolean {
  return ROLE_GROUPS.CONTENT_CREATORS.includes(roleId as any);
}

/**
 * Get user permission level for debugging
 */
export function getUserPermissionLevel(roleId: number): string {
  if (roleId === 1) return 'Superadmin';
  if (roleId === 2) return 'Admin';
  if ([3, 4, 5].includes(roleId)) return 'Talent';
  if ([6, 7].includes(roleId)) return 'Professional';
  if (roleId === 8) return 'Industry Professional';
  if (roleId === 9) return 'Fan';
  return 'Unknown';
}

/**
 * Consolidated access control check
 * Used instead of scattered role checks throughout the codebase
 */
export function canUserAccess(userRoleId: number, requiredRoles: readonly number[]): boolean {
  return requiredRoles.includes(userRoleId);
}

/**
 * Check if user can access other user's data
 * Consolidates scattered ownership checks
 */
export function canAccessUserData(currentUserId: number, targetUserId: number, currentUserRoleId: number): boolean {
  // User can access their own data
  if (currentUserId === targetUserId) return true;
  
  // Admins can access anyone's data
  if (isAdminLevel(currentUserRoleId)) return true;
  
  return false;
}

/**
 * Get role-based navigation permissions
 * Consolidates scattered navigation logic
 */
export function getNavigationPermissions(roleId: number) {
  return {
    canViewDashboard: hasRole(roleId, ROLE_GROUPS.ALL_AUTHENTICATED),
    canViewAdmin: hasRole(roleId, ROLE_GROUPS.ADMIN_ONLY),
    canViewOpportunities: hasRole(roleId, ROLE_GROUPS.ALL_AUTHENTICATED),
    canCreateBookings: hasRole(roleId, ROLE_GROUPS.BOOKING_ENABLED),
    canManageContent: hasRole(roleId, ROLE_GROUPS.CONTENT_CREATORS),
    canViewAnalytics: hasRole(roleId, ROLE_GROUPS.ADMIN_ONLY)
  };
}