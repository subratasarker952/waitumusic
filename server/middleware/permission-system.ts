import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { storage } from '../storage';

// Enhanced permission system middleware

export interface AuthenticatedRequest extends Request {
  userId?: number;
  user?: any;
  roleId?: number;
}

// Role definitions
export enum UserRole {
  SUPERADMIN = 1,
  ADMIN = 2,
  MANAGED_ARTIST = 3,
  ARTIST = 4,
  MANAGED_MUSICIAN = 5,
  MUSICIAN = 6,
  MANAGED_PROFESSIONAL = 7,
  PROFESSIONAL = 8,
  FAN = 9
}

// Role hierarchy for permission inheritance
const roleHierarchy: Record<number, number[]> = {
  [UserRole.SUPERADMIN]: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  [UserRole.ADMIN]: [2, 3, 4, 5, 6, 7, 8, 9],
  [UserRole.MANAGED_ARTIST]: [3, 4],
  [UserRole.ARTIST]: [4],
  [UserRole.MANAGED_MUSICIAN]: [5, 6],
  [UserRole.MUSICIAN]: [6],
  [UserRole.MANAGED_PROFESSIONAL]: [7, 8],
  [UserRole.PROFESSIONAL]: [8],
  [UserRole.FAN]: [9]
};

// Permission definitions
export const permissions = {
  // Admin permissions
  MANAGE_USERS: [UserRole.SUPERADMIN, UserRole.ADMIN],
  MANAGE_CONTENT: [UserRole.SUPERADMIN, UserRole.ADMIN],
  MANAGE_BOOKINGS: [UserRole.SUPERADMIN, UserRole.ADMIN],
  MANAGE_SYSTEM: [UserRole.SUPERADMIN],
  
  // Artist permissions
  CREATE_MUSIC: [UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.MANAGED_ARTIST, UserRole.ARTIST],
  EDIT_OWN_PROFILE: [1, 2, 3, 4, 5, 6, 7, 8, 9], // All roles
  
  // Booking permissions
  CREATE_BOOKING: [UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.MANAGED_ARTIST, UserRole.ARTIST],
  VIEW_OWN_BOOKINGS: [3, 4, 5, 6, 7, 8], // Artists, Musicians, Professionals
  
  // Music permissions
  UPLOAD_MUSIC: [UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.MANAGED_ARTIST, UserRole.ARTIST],
  VIEW_MUSIC: [1, 2, 3, 4, 5, 6, 7, 8, 9], // All roles
  
  // Professional permissions
  OFFER_SERVICES: [UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.MANAGED_PROFESSIONAL, UserRole.PROFESSIONAL],
  
  // Analytics permissions
  VIEW_ANALYTICS: [UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.MANAGED_ARTIST, UserRole.ARTIST]
};

// JWT authentication middleware
export async function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
    req.userId = decoded.userId;
    
    // Get user details
    const user = await storage.getUser(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    req.user = user;
    req.roleId = user.roleId;
    
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

// Permission check middleware
export function requirePermission(permission: keyof typeof permissions) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.roleId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const allowedRoles = permissions[permission];
    if (!allowedRoles.includes(req.roleId)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    
    next();
  };
}

// Role check middleware
export function requireRole(roles: UserRole[]) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.roleId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    if (!roles.includes(req.roleId)) {
      return res.status(403).json({ message: 'Insufficient role privileges' });
    }
    
    next();
  };
}

// Admin check middleware
export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.roleId || ![UserRole.SUPERADMIN, UserRole.ADMIN].includes(req.roleId)) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}

// Check if user has permission
export function hasPermission(roleId: number, permission: keyof typeof permissions): boolean {
  const allowedRoles = permissions[permission];
  return allowedRoles.includes(roleId);
}

// Check if user can access resource
export function canAccessResource(userRoleId: number, resourceOwnerId: number, currentUserId: number): boolean {
  // Superadmin and Admin can access everything
  if ([UserRole.SUPERADMIN, UserRole.ADMIN].includes(userRoleId)) {
    return true;
  }
  
  // User can access their own resources
  if (resourceOwnerId === currentUserId) {
    return true;
  }
  
  // Check role hierarchy
  const userHierarchy = roleHierarchy[userRoleId] || [];
  return userHierarchy.includes(userRoleId);
}

// Management tier permission check
export function hasManagementAccess(user: any): boolean {
  const managedRoles = [
    UserRole.MANAGED_ARTIST,
    UserRole.MANAGED_MUSICIAN,
    UserRole.MANAGED_PROFESSIONAL
  ];
  
  return managedRoles.includes(user.roleId) || 
         [UserRole.SUPERADMIN, UserRole.ADMIN].includes(user.roleId);
}