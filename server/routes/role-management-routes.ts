import { Router } from 'express';
import { db } from '../db';
import { roles, rolePermissions } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

const router = Router();

// Middleware for JWT authentication
const isAuthenticated = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }
  
  const jwt = require('jsonwebtoken');
  const JWT_SECRET = process.env.JWT_SECRET || "waitumusic-demo-secret-key-2025";
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; email: string; roleId: number };
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

// Middleware to check if user is admin
const isAdmin = async (req: any, res: any, next: any) => {
  if (!req.user || (req.user.roleId !== 1 && req.user.roleId !== 2)) {
    return res.status(403).json({ 
      error: 'Access denied',
      message: 'Your role does not have permission to manage roles' 
    });
  }
  next();
};

// Get all roles
router.get('/api/admin/roles', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const allRoles = await db.select().from(roles);
    res.json(allRoles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ message: 'Failed to fetch roles' });
  }
});

// Create new role
const createRoleSchema = z.object({
  name: z.string().min(1).max(50)
});

router.post('/api/admin/roles', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { name } = createRoleSchema.parse(req.body);
    
    // Check if role name already exists
    const existing = await db.select().from(roles).where(eq(roles.name, name));
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Role name already exists' });
    }
    
    const [newRole] = await db.insert(roles).values({
      name,
      isCustom: true
    }).returning();
    
    res.json(newRole);
  } catch (error) {
    console.error('Error creating role:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid role data', errors: error.errors });
    }
    res.status(500).json({ message: 'Failed to create role' });
  }
});

// Delete role
router.delete('/api/admin/roles/:roleId', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const roleId = parseInt(req.params.roleId);
    
    // Check if role is custom
    const [role] = await db.select().from(roles).where(eq(roles.id, roleId));
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    if (!role.isCustom) {
      return res.status(400).json({ message: 'Cannot delete default roles' });
    }
    
    // Delete permissions first
    await db.delete(rolePermissions).where(eq(rolePermissions.roleId, roleId));
    
    // Delete role
    await db.delete(roles).where(eq(roles.id, roleId));
    
    res.json({ message: 'Role deleted successfully' });
  } catch (error) {
    console.error('Error deleting role:', error);
    res.status(500).json({ message: 'Failed to delete role' });
  }
});

// Get permissions for a role
router.get('/api/admin/roles/:roleId/permissions', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const roleId = parseInt(req.params.roleId);
    const permissions = await db.select().from(rolePermissions).where(eq(rolePermissions.roleId, roleId));
    res.json(permissions);
  } catch (error) {
    console.error('Error fetching permissions:', error);
    res.status(500).json({ message: 'Failed to fetch permissions' });
  }
});

// Update permission
const updatePermissionSchema = z.object({
  permissionKey: z.string(),
  permissionValue: z.boolean()
});

router.put('/api/admin/roles/:roleId/permissions', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const roleId = parseInt(req.params.roleId);
    const { permissionKey, permissionValue } = updatePermissionSchema.parse(req.body);
    
    // Check if permission exists
    const existing = await db.select().from(rolePermissions)
      .where(and(
        eq(rolePermissions.roleId, roleId),
        eq(rolePermissions.permissionKey, permissionKey)
      ));
    
    if (existing.length > 0) {
      // Update existing permission
      await db.update(rolePermissions)
        .set({ 
          permissionValue,
          updatedAt: new Date()
        })
        .where(and(
          eq(rolePermissions.roleId, roleId),
          eq(rolePermissions.permissionKey, permissionKey)
        ));
    } else {
      // Create new permission
      await db.insert(rolePermissions).values({
        roleId,
        permissionKey,
        permissionValue
      });
    }
    
    res.json({ message: 'Permission updated successfully' });
  } catch (error) {
    console.error('Error updating permission:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid permission data', errors: error.errors });
    }
    res.status(500).json({ message: 'Failed to update permission' });
  }
});

// Helper endpoint to check a specific permission for the current user
router.get('/api/permissions/check/:permissionKey', isAuthenticated, async (req, res) => {
  try {
    const { permissionKey } = req.params;
    const userRoleId = req.user?.roleId;
    
    if (!userRoleId) {
      return res.json({ hasPermission: false });
    }
    
    const [permission] = await db.select().from(rolePermissions)
      .where(and(
        eq(rolePermissions.roleId, userRoleId),
        eq(rolePermissions.permissionKey, permissionKey)
      ));
    
    res.json({ 
      hasPermission: permission ? permission.permissionValue : false 
    });
  } catch (error) {
    console.error('Error checking permission:', error);
    res.status(500).json({ message: 'Failed to check permission' });
  }
});

export default router;