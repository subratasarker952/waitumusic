/**
 * Centralized Authorization Management System
 * Controls all API endpoint permissions and role-based access
 */

export interface EndpointPermission {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  allowedRoles: number[];
  description: string;
  category: 'user' | 'admin' | 'content' | 'booking' | 'system' | 'analytics';
  isPublic?: boolean;
  requiresAuth?: boolean;
}

export interface AuthorizationRule {
  id: string;
  name: string;
  category: string;
  endpoints: EndpointPermission[];
  isActive: boolean;
  lastModified: Date;
  modifiedBy: number;
}

// Master authorization configuration
export const MASTER_AUTHORIZATION_CONFIG: AuthorizationRule[] = [
  {
    id: 'user-management',
    name: 'User Management',
    category: 'admin',
    isActive: true,
    lastModified: new Date(),
    modifiedBy: 1,
    endpoints: [
      {
        endpoint: '/api/users',
        method: 'GET',
        allowedRoles: [1, 2], // Superadmin, Admin
        description: 'List all users',
        category: 'admin'
      },
      {
        endpoint: '/api/users/:id',
        method: 'GET',
        allowedRoles: [1, 2],
        description: 'Get specific user',
        category: 'admin'
      },
      {
        endpoint: '/api/users',
        method: 'POST',
        allowedRoles: [1, 2],
        description: 'Create new user',
        category: 'admin'
      },
      {
        endpoint: '/api/users/:id',
        method: 'PUT',
        allowedRoles: [1, 2],
        description: 'Update user',
        category: 'admin'
      },
      {
        endpoint: '/api/users/:id',
        method: 'DELETE',
        allowedRoles: [1],
        description: 'Delete user (superadmin only)',
        category: 'admin'
      }
    ]
  },
  {
    id: 'website-integrations',
    name: 'Website Integrations',
    category: 'content',
    isActive: true,
    lastModified: new Date(),
    modifiedBy: 1,
    endpoints: [
      {
        endpoint: '/api/website-integrations',
        method: 'GET',
        allowedRoles: [1, 2, 3, 5], // Superadmin, Admin, Star Talent, Studio Pro
        description: 'Get user website integrations',
        category: 'content'
      },
      {
        endpoint: '/api/website-integrations',
        method: 'POST',
        allowedRoles: [1, 2, 3, 5],
        description: 'Create website integration',
        category: 'content'
      },
      {
        endpoint: '/api/website-integrations/:id',
        method: 'PATCH',
        allowedRoles: [1, 2, 3, 5],
        description: 'Update website integration',
        category: 'content'
      },
      {
        endpoint: '/api/website-integrations/:id',
        method: 'DELETE',
        allowedRoles: [1, 2, 3, 5],
        description: 'Delete website integration',
        category: 'content'
      }
    ]
  },
  {
    id: 'booking-management',
    name: 'Booking Management',
    category: 'booking',
    isActive: true,
    lastModified: new Date(),
    modifiedBy: 1,
    endpoints: [
      {
        endpoint: '/api/bookings',
        method: 'GET',
        allowedRoles: [1, 2, 3, 4, 5, 6, 7, 8], // All except Music Lover
        description: 'Get user bookings',
        category: 'booking'
      },
      {
        endpoint: '/api/bookings',
        method: 'POST',
        allowedRoles: [1, 2, 3, 4, 5, 6, 7, 8, 9], // All roles including guests
        description: 'Create booking',
        category: 'booking'
      },
      {
        endpoint: '/api/bookings/:id/approve',
        method: 'POST',
        allowedRoles: [1, 2], // Admin approval only
        description: 'Approve booking',
        category: 'booking'
      }
    ]
  },
  {
    id: 'analytics-access',
    name: 'Analytics Access',
    category: 'analytics',
    isActive: true,
    lastModified: new Date(),
    modifiedBy: 1,
    endpoints: [
      {
        endpoint: '/api/admin/analytics',
        method: 'GET',
        allowedRoles: [1, 2],
        description: 'Platform analytics',
        category: 'analytics'
      },
      {
        endpoint: '/api/analytics/user',
        method: 'GET',
        allowedRoles: [1, 2, 3, 5, 7], // Managed users get analytics
        description: 'User analytics',
        category: 'analytics'
      }
    ]
  },
  {
    id: 'system-administration',
    name: 'System Administration',
    category: 'system',
    isActive: true,
    lastModified: new Date(),
    modifiedBy: 1,
    endpoints: [
      {
        endpoint: '/api/admin/config',
        method: 'GET',
        allowedRoles: [1, 2],
        description: 'Get system configuration',
        category: 'system'
      },
      {
        endpoint: '/api/admin/config',
        method: 'POST',
        allowedRoles: [1],
        description: 'Update system configuration',
        category: 'system'
      },
      {
        endpoint: '/api/admin/database-backup',
        method: 'POST',
        allowedRoles: [1],
        description: 'Create database backup',
        category: 'system'
      }
    ]
  }
];

// Authorization helper functions
export class AuthorizationManager {
  private static config = MASTER_AUTHORIZATION_CONFIG;

  static getAllRules(): AuthorizationRule[] {
    return this.config.filter(rule => rule.isActive);
  }

  static getRuleById(id: string): AuthorizationRule | undefined {
    return this.config.find(rule => rule.id === id);
  }

  static getEndpointPermissions(endpoint: string, method: string): number[] {
    for (const rule of this.config) {
      if (!rule.isActive) continue;
      
      const endpointConfig = rule.endpoints.find(ep => 
        ep.endpoint === endpoint && ep.method === method
      );
      
      if (endpointConfig) {
        return endpointConfig.allowedRoles;
      }
    }
    
    // Default: only superadmin for unlisted endpoints
    return [1];
  }

  static updateRule(id: string, updates: Partial<AuthorizationRule>): boolean {
    const ruleIndex = this.config.findIndex(rule => rule.id === id);
    if (ruleIndex === -1) return false;

    this.config[ruleIndex] = {
      ...this.config[ruleIndex],
      ...updates,
      lastModified: new Date()
    };
    
    return true;
  }

  static addRule(rule: AuthorizationRule): void {
    this.config.push(rule);
  }

  static removeRule(id: string): boolean {
    const ruleIndex = this.config.findIndex(rule => rule.id === id);
    if (ruleIndex === -1) return false;

    this.config.splice(ruleIndex, 1);
    return true;
  }

  static getRulesByCategory(category: string): AuthorizationRule[] {
    return this.config.filter(rule => rule.category === category && rule.isActive);
  }

  static getEndpointsByRole(roleId: number): EndpointPermission[] {
    const endpoints: EndpointPermission[] = [];
    
    for (const rule of this.config) {
      if (!rule.isActive) continue;
      
      for (const endpoint of rule.endpoints) {
        if (endpoint.allowedRoles.includes(roleId)) {
          endpoints.push(endpoint);
        }
      }
    }
    
    return endpoints;
  }
}

// Export for use in middleware
export function getRequiredRoles(endpoint: string, method: string): number[] {
  return AuthorizationManager.getEndpointPermissions(endpoint, method);
}