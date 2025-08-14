/**
 * Configuration API Routes - Real Control Endpoints
 * Provides complete configuration management with database persistence
 */

import { Request, Response } from 'express';
import { storage } from './storage';
import { requireRole, ROLE_GROUPS } from '@shared/authorization-middleware';

// Simple auth check function for configuration routes
function requireAuth(req: Request) {
  if (!req.user) {
    throw new Error('Authentication required');
  }
  return req.user;
}

export const configurationRoutes = {
  
  /**
   * GET /api/admin/configuration
   * Get current platform configuration
   */
  async getPlatformConfiguration(req: Request, res: Response) {
    try {
      const user = requireAuth(req);
      
      // Only superadmin can access full configuration
      if (user.roleId !== 1) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      const config = await storage.getPlatformConfiguration();
      res.json(config);
    } catch (error) {
      console.error('Error fetching platform configuration:', error);
      res.status(500).json({ error: 'Failed to fetch configuration' });
    }
  },

  /**
   * PUT /api/admin/configuration
   * Update platform configuration
   */
  async updatePlatformConfiguration(req: Request, res: Response) {
    try {
      const user = requireAuth(req);
      
      // Only superadmin can update configuration
      if (user.roleId !== 1) {
        return res.status(403).json({ error: 'Only superadmin can update configuration' });
      }

      const { config, changeDescription } = req.body;
      
      if (!config) {
        return res.status(400).json({ error: 'Configuration data required' });
      }

      const success = await storage.updatePlatformConfiguration(
        config,
        user.userId,
        changeDescription
      );

      if (success) {
        res.json({ success: true, message: 'Configuration updated successfully' });
      } else {
        res.status(500).json({ error: 'Failed to update configuration' });
      }
    } catch (error) {
      console.error('Error updating platform configuration:', error);
      res.status(500).json({ error: 'Failed to update configuration' });
    }
  },

  /**
   * GET /api/admin/configuration/history
   * Get configuration change history
   */
  async getConfigurationHistory(req: Request, res: Response) {
    try {
      const user = requireAuth(req);
      
      // Only superadmin and admin can view history
      if (user.roleId !== 1 && user.roleId !== 2) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      const limit = parseInt(req.query.limit as string) || 50;
      const history = await storage.getConfigurationHistory(limit);
      
      res.json(history);
    } catch (error) {
      console.error('Error fetching configuration history:', error);
      res.status(500).json({ error: 'Failed to fetch configuration history' });
    }
  },

  /**
   * POST /api/admin/configuration/delegation
   * Create configuration delegation
   */
  async createConfigurationDelegation(req: Request, res: Response) {
    try {
      const user = requireAuth(req);
      
      // Only superadmin can create delegations
      if (user.roleId !== 1) {
        return res.status(403).json({ error: 'Only superadmin can create delegations' });
      }

      const { delegatedTo, configurationAspects, permissions, expiresAt } = req.body;
      
      if (!delegatedTo || !configurationAspects || !permissions) {
        return res.status(400).json({ 
          error: 'Delegated user, aspects, and permissions required' 
        });
      }

      const success = await storage.createConfigurationDelegation(
        user.userId,
        delegatedTo,
        configurationAspects,
        permissions,
        expiresAt ? new Date(expiresAt) : undefined
      );

      if (success) {
        res.json({ success: true, message: 'Delegation created successfully' });
      } else {
        res.status(500).json({ error: 'Failed to create delegation' });
      }
    } catch (error) {
      console.error('Error creating configuration delegation:', error);
      res.status(500).json({ error: 'Failed to create delegation' });
    }
  },

  /**
   * GET /api/admin/configuration/delegations/:userId
   * Get user's delegated configuration aspects
   */
  async getUserDelegatedAspects(req: Request, res: Response) {
    try {
      const user = requireAuth(req);
      const targetUserId = parseInt(req.params.userId);
      
      // Users can view their own delegations, superadmin can view any
      if (user.roleId !== 1 && user.userId !== targetUserId) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      const aspects = await storage.getUserDelegatedAspects(targetUserId);
      res.json({ aspects });
    } catch (error) {
      console.error('Error fetching user delegated aspects:', error);
      res.status(500).json({ error: 'Failed to fetch delegated aspects' });
    }
  },

  /**
   * PUT /api/admin/configuration/ui-element
   * Update specific UI element configuration
   */
  async updateUIElement(req: Request, res: Response) {
    try {
      const user = requireAuth(req);
      
      // Only superadmin can update UI elements
      if (user.roleId !== 1) {
        return res.status(403).json({ error: 'Only superadmin can update UI elements' });
      }

      const { elementPath, value, changeDescription } = req.body;
      
      if (!elementPath || value === undefined) {
        return res.status(400).json({ error: 'Element path and value required' });
      }

      // Get current config and update specific element
      const currentConfig = await storage.getPlatformConfiguration();
      
      // Navigate to the element using path (e.g., "ui.toasts.duration")
      const pathArray = elementPath.split('.');
      let configSection: any = currentConfig;
      
      // Navigate to parent object
      for (let i = 0; i < pathArray.length - 1; i++) {
        if (!configSection[pathArray[i]]) {
          configSection[pathArray[i]] = {};
        }
        configSection = configSection[pathArray[i]];
      }
      
      // Set the value
      configSection[pathArray[pathArray.length - 1]] = value;

      const success = await storage.updatePlatformConfiguration(
        currentConfig,
        user.userId,
        changeDescription || `Updated ${elementPath} to ${value}`
      );

      if (success) {
        res.json({ 
          success: true, 
          message: `UI element ${elementPath} updated successfully`,
          newValue: value 
        });
      } else {
        res.status(500).json({ error: 'Failed to update UI element' });
      }
    } catch (error) {
      console.error('Error updating UI element:', error);
      res.status(500).json({ error: 'Failed to update UI element' });
    }
  }
};