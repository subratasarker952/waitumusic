/**
 * Role-Based Dashboard Access Control System
 * Hierarchical access control for all platform features and configurations
 */

export interface AccessPermission {
  read: boolean;
  write: boolean;
  admin: boolean; // Can modify for others
}

export interface DashboardSection {
  id: string;
  name: string;
  icon: string;
  description: string;
  permission: AccessPermission;
  subsections?: DashboardSection[];
}

// Define user role hierarchy (higher number = more permissions)
export const USER_ROLE_HIERARCHY = {
  fan: 1,
  professional: 2,
  musician: 3,
  artist: 4,
  managed_musician: 5,
  managed_artist: 6,
  assigned_admin: 7,
  admin: 8,
  superadmin: 9
} as const;

export type UserRole = keyof typeof USER_ROLE_HIERARCHY;

// Base permission templates
const NO_ACCESS: AccessPermission = { read: false, write: false, admin: false };
const READ_ONLY: AccessPermission = { read: true, write: false, admin: false };
const READ_WRITE: AccessPermission = { read: true, write: true, admin: false };
const FULL_ACCESS: AccessPermission = { read: true, write: true, admin: true };

// Define dashboard sections with role-based access
export const DASHBOARD_SECTIONS: Record<UserRole, DashboardSection[]> = {
  // SUPERADMIN - Complete platform control
  superadmin: [
    {
      id: 'platform-config',
      name: 'Platform Configuration',
      icon: 'Settings',
      description: 'Control all platform settings, UI, and system behavior',
      permission: FULL_ACCESS,
      subsections: [
        {
          id: 'ui-config',
          name: 'UI/UX Configuration',
          icon: 'Eye',
          description: 'Toast duration, colors, spacing, animations',
          permission: FULL_ACCESS
        },
        {
          id: 'technical-rider-config',
          name: 'Technical Rider Configuration',
          icon: 'Monitor',
          description: 'Membership types, limits, auto-save settings',
          permission: FULL_ACCESS
        },
        {
          id: 'api-config',
          name: 'API Configuration',
          icon: 'Globe',
          description: 'Timeouts, cache settings, retry attempts',
          permission: FULL_ACCESS
        },
        {
          id: 'security-config',
          name: 'Security Configuration',
          icon: 'Shield',
          description: 'Session timeout, 2FA, login attempts',
          permission: FULL_ACCESS
        }
      ]
    },
    {
      id: 'user-management',
      name: 'User Management',
      icon: 'Users',
      description: 'Manage all user accounts, roles, and permissions',
      permission: FULL_ACCESS,
      subsections: [
        {
          id: 'role-assignment',
          name: 'Role Assignment',
          icon: 'UserCheck',
          description: 'Assign and modify user roles',
          permission: FULL_ACCESS
        },
        {
          id: 'access-control',
          name: 'Access Control',
          icon: 'Lock',
          description: 'Configure role-based permissions',
          permission: FULL_ACCESS
        }
      ]
    },
    {
      id: 'system-administration',
      name: 'System Administration',
      icon: 'Server',
      description: 'Database, backups, system health monitoring',
      permission: FULL_ACCESS
    },
    {
      id: 'analytics-overview',
      name: 'Analytics Overview',
      icon: 'BarChart3',
      description: 'Platform-wide analytics and performance metrics',
      permission: FULL_ACCESS
    }
  ],

  // ADMIN - Platform management without core system config
  admin: [
    {
      id: 'user-management',
      name: 'User Management',
      icon: 'Users',
      description: 'Manage user accounts and basic permissions',
      permission: READ_WRITE,
      subsections: [
        {
          id: 'user-approval',
          name: 'User Approval',
          icon: 'UserCheck',
          description: 'Approve new user registrations',
          permission: READ_WRITE
        }
      ]
    },
    {
      id: 'content-moderation',
      name: 'Content Moderation',
      icon: 'Shield',
      description: 'Review and moderate platform content',
      permission: READ_WRITE
    },
    {
      id: 'booking-oversight',
      name: 'Booking Oversight',
      icon: 'Calendar',
      description: 'Monitor and manage platform bookings',
      permission: READ_WRITE
    },
    {
      id: 'analytics-limited',
      name: 'Analytics',
      icon: 'BarChart3',
      description: 'View platform analytics and reports',
      permission: READ_ONLY
    }
  ],

  // ASSIGNED ADMIN - Specialized admin role
  assigned_admin: [
    {
      id: 'assigned-talent-management',
      name: 'Assigned Talent Management',
      icon: 'Users',
      description: 'Manage assigned artists and musicians',
      permission: READ_WRITE
    },
    {
      id: 'booking-management',
      name: 'Booking Management',
      icon: 'Calendar',
      description: 'Handle bookings for assigned talent',
      permission: READ_WRITE
    },
    {
      id: 'content-management',
      name: 'Content Management',
      icon: 'FileText',
      description: 'Manage content for assigned talent',
      permission: READ_WRITE
    }
  ],

  // MANAGED ARTIST - Enhanced artist features
  managed_artist: [
    {
      id: 'profile-management',
      name: 'Profile Management',
      icon: 'User',
      description: 'Manage your artist profile and information',
      permission: READ_WRITE,
      subsections: [
        {
          id: 'locked-fields',
          name: 'Managed Fields',
          icon: 'Lock',
          description: 'View locked fields (managed by admin)',
          permission: READ_ONLY
        }
      ]
    },
    {
      id: 'advanced-booking',
      name: 'Advanced Booking',
      icon: 'Calendar',
      description: 'Enhanced booking features and management',
      permission: READ_WRITE
    },
    {
      id: 'technical-rider',
      name: 'Technical Rider',
      icon: 'Monitor',
      description: 'Create and manage technical riders',
      permission: READ_WRITE
    },
    {
      id: 'analytics-personal',
      name: 'Performance Analytics',
      icon: 'TrendingUp',
      description: 'Advanced analytics for your performances',
      permission: READ_ONLY
    },
    {
      id: 'revenue-tracking',
      name: 'Revenue Tracking',
      icon: 'DollarSign',
      description: 'Track earnings and financial performance',
      permission: READ_ONLY
    }
  ],

  // ARTIST - Standard artist features
  artist: [
    {
      id: 'profile-management',
      name: 'Profile Management',
      icon: 'User',
      description: 'Manage your artist profile',
      permission: READ_WRITE
    },
    {
      id: 'basic-booking',
      name: 'Booking Management',
      icon: 'Calendar',
      description: 'Manage your bookings',
      permission: READ_WRITE
    },
    {
      id: 'music-catalog',
      name: 'Music Catalog',
      icon: 'Music',
      description: 'Upload and manage your music',
      permission: READ_WRITE
    },
    {
      id: 'basic-analytics',
      name: 'Basic Analytics',
      icon: 'BarChart3',
      description: 'View basic performance metrics',
      permission: READ_ONLY
    }
  ],

  // MANAGED MUSICIAN - Enhanced musician features
  managed_musician: [
    {
      id: 'profile-management',
      name: 'Profile Management',
      icon: 'User',
      description: 'Manage your musician profile',
      permission: READ_WRITE,
      subsections: [
        {
          id: 'locked-fields',
          name: 'Managed Fields',
          icon: 'Lock',
          description: 'View locked fields (managed by admin)',
          permission: READ_ONLY
        }
      ]
    },
    {
      id: 'advanced-booking',
      name: 'Advanced Booking',
      icon: 'Calendar',
      description: 'Enhanced booking and assignment features',
      permission: READ_WRITE
    },
    {
      id: 'session-management',
      name: 'Session Management',
      icon: 'Clock',
      description: 'Manage recording and performance sessions',
      permission: READ_WRITE
    },
    {
      id: 'collaboration-tools',
      name: 'Collaboration Tools',
      icon: 'Users',
      description: 'Connect with other musicians and artists',
      permission: READ_WRITE
    }
  ],

  // MUSICIAN - Standard musician features
  musician: [
    {
      id: 'profile-management',
      name: 'Profile Management',
      icon: 'User',
      description: 'Manage your musician profile',
      permission: READ_WRITE
    },
    {
      id: 'basic-booking',
      name: 'Booking Management',
      icon: 'Calendar',
      description: 'View and manage bookings',
      permission: READ_WRITE
    },
    {
      id: 'skill-showcase',
      name: 'Skill Showcase',
      icon: 'Award',
      description: 'Showcase your musical skills and instruments',
      permission: READ_WRITE
    }
  ],

  // PROFESSIONAL - Professional service features
  professional: [
    {
      id: 'profile-management',
      name: 'Profile Management',
      icon: 'User',
      description: 'Manage your professional profile',
      permission: READ_WRITE
    },
    {
      id: 'service-management',
      name: 'Service Management',
      icon: 'Briefcase',
      description: 'Manage your professional services',
      permission: READ_WRITE
    },
    {
      id: 'client-management',
      name: 'Client Management',
      icon: 'Users',
      description: 'Manage your clients and projects',
      permission: READ_WRITE
    },
    {
      id: 'booking-calendar',
      name: 'Booking Calendar',
      icon: 'Calendar',
      description: 'Manage your service bookings',
      permission: READ_WRITE
    }
  ],

  // FAN - Basic user features
  fan: [
    {
      id: 'profile-basic',
      name: 'Profile',
      icon: 'User',
      description: 'Manage your basic profile',
      permission: READ_WRITE
    },
    {
      id: 'music-discovery',
      name: 'Music Discovery',
      icon: 'Search',
      description: 'Discover and explore music',
      permission: READ_ONLY
    },
    {
      id: 'favorites',
      name: 'Favorites',
      icon: 'Heart',
      description: 'Manage your favorite artists and songs',
      permission: READ_WRITE
    },
    {
      id: 'purchase-history',
      name: 'Purchase History',
      icon: 'ShoppingBag',
      description: 'View your purchase history',
      permission: READ_ONLY
    }
  ]
};

// Utility functions for access control
export const hasAccess = (userRole: UserRole, sectionId: string, accessType: keyof AccessPermission): boolean => {
  const sections = DASHBOARD_SECTIONS[userRole];
  
  const findSection = (sections: DashboardSection[], id: string): DashboardSection | null => {
    for (const section of sections) {
      if (section.id === id) return section;
      if (section.subsections) {
        const found = findSection(section.subsections, id);
        if (found) return found;
      }
    }
    return null;
  };

  const section = findSection(sections, sectionId);
  return section ? section.permission[accessType] : false;
};

export const getAccessibleSections = (userRole: UserRole): DashboardSection[] => {
  return DASHBOARD_SECTIONS[userRole] || [];
};

export const canAccessAdminConfig = (userRole: UserRole): boolean => {
  return USER_ROLE_HIERARCHY[userRole] >= USER_ROLE_HIERARCHY.superadmin;
};

export const getConfigurableSettings = (userRole: UserRole): string[] => {
  switch (userRole) {
    case 'superadmin':
      return ['ui', 'technicalRider', 'api', 'forms', 'animations', 'booking', 'notifications', 'security'];
    case 'admin':
      return ['notifications', 'booking']; // Limited configuration access
    case 'assigned_admin':
      return ['booking']; // Very limited access
    case 'managed_artist':
    case 'managed_musician':
      return ['notifications']; // Personal notification preferences only
    default:
      return []; // No configuration access
  }
};

// Configuration delegation system
export const getDelegatedConfigAccess = (adminRole: UserRole, targetRole: UserRole): string[] => {
  if (USER_ROLE_HIERARCHY[adminRole] < USER_ROLE_HIERARCHY.admin) {
    return []; // No delegation rights
  }

  if (adminRole === 'superadmin') {
    // Superadmin can delegate any configuration to any user
    return getConfigurableSettings(targetRole);
  }

  if (adminRole === 'admin') {
    // Admin can delegate limited settings to lower-tier users
    const allowedDelegations = ['notifications', 'booking'];
    return getConfigurableSettings(targetRole).filter(setting => allowedDelegations.includes(setting));
  }

  return [];
};