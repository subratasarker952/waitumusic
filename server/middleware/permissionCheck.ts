import { Request, Response, NextFunction } from 'express';
import { hasPermission } from '@shared/role-permissions';

// Middleware to check if user has required permission
export function requirePermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;
    
    if (!userRole) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!hasPermission(userRole, permission)) {
      return res.status(403).json({ 
        message: 'Insufficient permissions',
        required: permission,
        userRole: userRole
      });
    }

    next();
  };
}

// Middleware to check multiple permissions (user needs ANY of them)
export function requireAnyPermission(permissions: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;
    
    if (!userRole) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const hasAnyPermission = permissions.some(permission => 
      hasPermission(userRole, permission)
    );

    if (!hasAnyPermission) {
      return res.status(403).json({ 
        message: 'Insufficient permissions',
        required: permissions,
        userRole: userRole
      });
    }

    next();
  };
}

// Middleware to check multiple permissions (user needs ALL of them)
export function requireAllPermissions(permissions: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;
    
    if (!userRole) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const hasAllPermissions = permissions.every(permission => 
      hasPermission(userRole, permission)
    );

    if (!hasAllPermissions) {
      return res.status(403).json({ 
        message: 'Insufficient permissions',
        required: permissions,
        userRole: userRole
      });
    }

    next();
  };
}