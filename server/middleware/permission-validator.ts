import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';
import { getUserPermissions } from '@shared/role-permissions';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        email: string;
        roleId: number;
      };
    }
  }
}

// Role mapping
const roleNames: { [key: number]: string } = {
  1: 'superadmin',
  2: 'admin',
  3: 'managed_artist',
  4: 'artist',
  5: 'managed_musician',
  6: 'musician',
  7: 'managed_professional',
  8: 'professional',
  9: 'fan'
};

// Permission validation middleware
export function requirePermission(permission: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const user = await storage.getUser(req.user.userId);
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      const roleName = roleNames[user.roleId];
      if (!roleName) {
        return res.status(403).json({ error: 'Invalid role' });
      }
      
      const userPermissions = getUserPermissions(roleName);
      
      if (!userPermissions.includes(permission)) {
        return res.status(403).json({ 
          error: 'Insufficient permissions',
          required: permission,
          message: `You don't have permission to ${permission.replace(/_/g, ' ')}`
        });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({ error: 'Permission validation failed' });
    }
  };
}

// Check if user has any of the specified permissions
export function requireAnyPermission(...permissions: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const user = await storage.getUser(req.user.userId);
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      const roleName = roleNames[user.roleId];
      if (!roleName) {
        return res.status(403).json({ error: 'Invalid role' });
      }
      
      const userPermissions = getUserPermissions(roleName);
      
      const hasAnyPermission = permissions.some(permission => 
        userPermissions.includes(permission)
      );

      if (!hasAnyPermission) {
        return res.status(403).json({ 
          error: 'Insufficient permissions',
          required: permissions,
          message: 'You need at least one of the required permissions'
        });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({ error: 'Permission validation failed' });
    }
  };
}

// Check if user has all of the specified permissions
export function requireAllPermissions(...permissions: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const user = await storage.getUser(req.user.userId);
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      const roleName = roleNames[user.roleId];
      if (!roleName) {
        return res.status(403).json({ error: 'Invalid role' });
      }
      
      const userPermissions = getUserPermissions(roleName);
      
      const missingPermissions = permissions.filter(permission => 
        !userPermissions.includes(permission)
      );

      if (missingPermissions.length > 0) {
        return res.status(403).json({ 
          error: 'Insufficient permissions',
          missing: missingPermissions,
          message: 'You need all of the required permissions'
        });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({ error: 'Permission validation failed' });
    }
  };
}

// Check if user is in specific role groups
export function requireRole(...roleIds: (number | number[])[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const user = await storage.getUser(req.user.userId);
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      // Flatten the roleIds array in case it's passed as requireRole([1,2]) instead of requireRole(1,2)
      const allowedRoles = roleIds.flat() as number[];
      
      if (!allowedRoles.includes(user.roleId)) {
        return res.status(403).json({ 
          error: 'Access denied',
          message: 'Your role does not have access to this resource'
        });
      }

      next();
    } catch (error) {
      console.error('Role check error:', error);
      return res.status(500).json({ error: 'Role validation failed' });
    }
  };
}

// Check if user is admin (roleId 1 or 2)
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  return requireRole(1, 2)(req, res, next);
}

// Check if user is managed (roleId 1, 2, 3, 5, 7)
export function requireManaged(req: Request, res: Response, next: NextFunction) {
  return requireRole(1, 2, 3, 5, 7)(req, res, next);
}

// Check if user owns the resource or is admin
export function requireOwnershipOrAdmin(resourceUserIdField: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const user = await storage.getUser(req.user.userId);
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      // Admins can access anything
      if ([1, 2].includes(user.roleId)) {
        return next();
      }

      // Check ownership
      const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
      if (parseInt(resourceUserId) !== user.id) {
        return res.status(403).json({ 
          error: 'Access denied',
          message: 'You can only access your own resources'
        });
      }

      next();
    } catch (error) {
      console.error('Ownership check error:', error);
      return res.status(500).json({ error: 'Ownership validation failed' });
    }
  };
}