/**
 * Comprehensive Dashboard Integration Guide
 * Complete implementation of unified dashboard system with hierarchical access control
 */

export interface DashboardFeature {
  id: string;
  name: string;
  description: string;
  accessLevel: 'read' | 'write' | 'admin';
  configurable: boolean;
  delegatable: boolean;
}

export interface UserRoleMapping {
  roleId: number;
  roleName: string;
  hierarchyLevel: number;
  features: DashboardFeature[];
  configurableAspects: string[];
}

// Complete role hierarchy with feature mapping
export const COMPLETE_ROLE_HIERARCHY: UserRoleMapping[] = [
  {
    roleId: 1,
    roleName: 'superadmin',
    hierarchyLevel: 9,
    features: [
      {
        id: 'platform-configuration',
        name: 'Platform Configuration',
        description: 'Control all platform settings, UI configurations, and system behavior',
        accessLevel: 'admin',
        configurable: true,
        delegatable: true
      },
      {
        id: 'user-management',
        name: 'Complete User Management',
        description: 'Create, edit, delete, and manage all user accounts across all roles',
        accessLevel: 'admin',
        configurable: true,
        delegatable: true
      },
      {
        id: 'system-administration',
        name: 'System Administration',
        description: 'Database management, backups, security audits, performance monitoring',
        accessLevel: 'admin',
        configurable: true,
        delegatable: false
      },
      {
        id: 'global-analytics',
        name: 'Global Analytics',
        description: 'Platform-wide analytics, revenue tracking, user behavior analysis',
        accessLevel: 'admin',
        configurable: true,
        delegatable: true
      },
      {
        id: 'configuration-delegation',
        name: 'Configuration Delegation',
        description: 'Delegate specific configuration access to lower-tier users',
        accessLevel: 'admin',
        configurable: true,
        delegatable: false
      }
    ],
    configurableAspects: [
      'Toast durations and notification settings',
      'UI color schemes and branding',
      'Technical rider configurations',
      'API timeouts and retry settings',
      'Security parameters and session timeouts',
      'User role permissions and access levels',
      'Feature availability per user type',
      'Platform-wide content settings'
    ]
  },
  {
    roleId: 2,
    roleName: 'admin',
    hierarchyLevel: 8,
    features: [
      {
        id: 'user-oversight',
        name: 'User Oversight',
        description: 'Manage non-admin users, approve registrations, moderate content',
        accessLevel: 'write',
        configurable: true,
        delegatable: true
      },
      {
        id: 'booking-management',
        name: 'Booking Management',
        description: 'Oversee platform bookings, approve contracts, manage workflows',
        accessLevel: 'write',
        configurable: true,
        delegatable: true
      },
      {
        id: 'content-moderation',
        name: 'Content Moderation',
        description: 'Review and moderate user-generated content across platform',
        accessLevel: 'write',
        configurable: false,
        delegatable: true
      },
      {
        id: 'limited-analytics',
        name: 'Limited Analytics',
        description: 'View platform analytics without system administration access',
        accessLevel: 'read',
        configurable: false,
        delegatable: false
      }
    ],
    configurableAspects: [
      'Notification preferences for admin tasks',
      'Booking approval workflows',
      'Content moderation settings',
      'User registration approval criteria'
    ]
  },
  {
    roleId: 3, // Note: This covers both managed_artist and artist
    roleName: 'artist',
    hierarchyLevel: 4,
    features: [
      {
        id: 'profile-management',
        name: 'Artist Profile Management',
        description: 'Manage artist profile, stage names, music catalog',
        accessLevel: 'write',
        configurable: true,
        delegatable: false
      },
      {
        id: 'booking-calendar',
        name: 'Booking Calendar',
        description: 'Manage bookings, availability, and performance schedules',
        accessLevel: 'write',
        configurable: true,
        delegatable: false
      },
      {
        id: 'music-catalog',
        name: 'Music Catalog',
        description: 'Upload, manage, and distribute music content',
        accessLevel: 'write',
        configurable: true,
        delegatable: false
      },
      {
        id: 'revenue-tracking',
        name: 'Revenue Tracking',
        description: 'Track earnings from performances and music sales',
        accessLevel: 'read',
        configurable: false,
        delegatable: false
      }
    ],
    configurableAspects: [
      'Profile notification preferences',
      'Booking availability settings',
      'Music preview durations',
      'Fan engagement settings'
    ]
  },
  {
    roleId: 4,
    roleName: 'musician',
    hierarchyLevel: 3,
    features: [
      {
        id: 'session-management',
        name: 'Session Management',
        description: 'Manage session work, collaborations, and assignments',
        accessLevel: 'write',
        configurable: true,
        delegatable: false
      },
      {
        id: 'equipment-management',
        name: 'Equipment Management',
        description: 'Manage instruments, gear, and technical requirements',
        accessLevel: 'write',
        configurable: true,
        delegatable: false
      },
      {
        id: 'collaboration-tools',
        name: 'Collaboration Tools',
        description: 'Connect with artists and participate in projects',
        accessLevel: 'write',
        configurable: true,
        delegatable: false
      }
    ],
    configurableAspects: [
      'Session availability notifications',
      'Equipment sharing preferences',
      'Collaboration request settings'
    ]
  },
  {
    roleId: 5,
    roleName: 'professional',
    hierarchyLevel: 2,
    features: [
      {
        id: 'service-management',
        name: 'Professional Services',
        description: 'Manage consulting services, client relationships',
        accessLevel: 'write',
        configurable: true,
        delegatable: false
      },
      {
        id: 'client-portal',
        name: 'Client Portal',
        description: 'Manage client communications and project tracking',
        accessLevel: 'write',
        configurable: true,
        delegatable: false
      },
      {
        id: 'consultation-scheduling',
        name: 'Consultation Scheduling',
        description: 'Schedule and manage professional consultations',
        accessLevel: 'write',
        configurable: true,
        delegatable: false
      }
    ],
    configurableAspects: [
      'Client notification preferences',
      'Service availability settings',
      'Consultation scheduling preferences'
    ]
  },
  {
    roleId: 6,
    roleName: 'fan',
    hierarchyLevel: 1,
    features: [
      {
        id: 'music-discovery',
        name: 'Music Discovery',
        description: 'Discover and explore artists and music content',
        accessLevel: 'read',
        configurable: false,
        delegatable: false
      },
      {
        id: 'purchase-management',
        name: 'Purchase Management',
        description: 'Manage music purchases and downloads',
        accessLevel: 'write',
        configurable: true,
        delegatable: false
      },
      {
        id: 'fan-engagement',
        name: 'Fan Engagement',
        description: 'Follow artists, create playlists, and engage with content',
        accessLevel: 'write',
        configurable: true,
        delegatable: false
      }
    ],
    configurableAspects: [
      'Music recommendation preferences',
      'Purchase notification settings',
      'Artist follow notifications'
    ]
  }
];

// Configuration delegation rules
export const DELEGATION_RULES = {
  // Superadmin can delegate any configuration to any user
  superadmin: {
    canDelegate: ['all'],
    canReceiveFrom: [],
    restrictions: []
  },
  
  // Admin can delegate limited configurations to users they oversee
  admin: {
    canDelegate: ['notifications', 'booking', 'content-preferences'],
    canReceiveFrom: ['superadmin'],
    restrictions: ['system-administration', 'user-role-management']
  },
  
  // Assigned admin has very limited delegation capabilities
  assigned_admin: {
    canDelegate: ['booking'],
    canReceiveFrom: ['superadmin', 'admin'],
    restrictions: ['system-configuration', 'user-management']
  },
  
  // Managed users can receive delegated configurations but cannot delegate
  managed_artist: {
    canDelegate: [],
    canReceiveFrom: ['superadmin', 'admin', 'assigned_admin'],
    restrictions: []
  },
  
  managed_musician: {
    canDelegate: [],
    canReceiveFrom: ['superadmin', 'admin', 'assigned_admin'],
    restrictions: []
  },
  
  // Standard users have no delegation capabilities
  artist: {
    canDelegate: [],
    canReceiveFrom: [],
    restrictions: []
  },
  
  musician: {
    canDelegate: [],
    canReceiveFrom: [],
    restrictions: []
  },
  
  professional: {
    canDelegate: [],
    canReceiveFrom: [],
    restrictions: []
  },
  
  fan: {
    canDelegate: [],
    canReceiveFrom: [],
    restrictions: []
  }
};

// Dashboard section visibility rules
export const DASHBOARD_VISIBILITY = {
  // What each role can see in other users' dashboards
  superadmin: {
    canView: ['all'],
    canModify: ['all'],
    canDelegate: ['all']
  },
  
  admin: {
    canView: ['artist', 'musician', 'professional', 'fan'],
    canModify: ['artist', 'musician', 'professional', 'fan'],
    canDelegate: ['notifications', 'booking']
  },
  
  assigned_admin: {
    canView: ['assigned_users_only'],
    canModify: ['assigned_users_only'],
    canDelegate: ['booking']
  },
  
  // Managed users have enhanced visibility of their own data
  managed_artist: {
    canView: ['own_data', 'enhanced_analytics'],
    canModify: ['own_profile', 'own_preferences'],
    canDelegate: []
  },
  
  managed_musician: {
    canView: ['own_data', 'enhanced_analytics'],
    canModify: ['own_profile', 'own_preferences'],
    canDelegate: []
  },
  
  // Standard users have basic visibility
  artist: {
    canView: ['own_data', 'basic_analytics'],
    canModify: ['own_profile', 'own_preferences'],
    canDelegate: []
  },
  
  musician: {
    canView: ['own_data', 'basic_analytics'],
    canModify: ['own_profile', 'own_preferences'],
    canDelegate: []
  },
  
  professional: {
    canView: ['own_data', 'client_data'],
    canModify: ['own_profile', 'own_services'],
    canDelegate: []
  },
  
  fan: {
    canView: ['own_data', 'public_content'],
    canModify: ['own_profile'],
    canDelegate: []
  }
};

// Utility functions for dashboard integration
export const getDelegateableFeatures = (userRole: string): string[] => {
  const roleConfig = DELEGATION_RULES[userRole as keyof typeof DELEGATION_RULES];
  return roleConfig?.canDelegate || [];
};

export const canReceiveDelegation = (fromRole: string, toRole: string): boolean => {
  const toRoleConfig = DELEGATION_RULES[toRole as keyof typeof DELEGATION_RULES];
  if (!toRoleConfig) return false;
  const canReceiveFrom = toRoleConfig.canReceiveFrom;
  return canReceiveFrom.includes(fromRole) || canReceiveFrom.includes('all');
};

export const getConfigurableAspects = (userRole: string): string[] => {
  const roleMapping = COMPLETE_ROLE_HIERARCHY.find(r => r.roleName === userRole);
  return roleMapping?.configurableAspects || [];
};

export const hasFeatureAccess = (userRole: string, featureId: string, accessType: 'read' | 'write' | 'admin'): boolean => {
  const roleMapping = COMPLETE_ROLE_HIERARCHY.find(r => r.roleName === userRole);
  if (!roleMapping) return false;
  
  const feature = roleMapping.features.find(f => f.id === featureId);
  if (!feature) return false;
  
  const accessLevels = ['read', 'write', 'admin'];
  const requiredLevel = accessLevels.indexOf(accessType);
  const userLevel = accessLevels.indexOf(feature.accessLevel);
  
  return userLevel >= requiredLevel;
};