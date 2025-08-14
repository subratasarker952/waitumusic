// Role-based permission system for unified dashboard access control
export interface DashboardPermission {
  id: string;
  name: string;
  description: string;
  category: 'management' | 'booking' | 'content' | 'analytics' | 'system' | 'marketing';
  level: 'read' | 'write' | 'admin';
}

export interface UserRole {
  id: string;
  name: string;
  displayName: string;
  description: string;
  isDefault: boolean;
  permissions: string[]; // Permission IDs
  inheritFrom?: string; // Base role to inherit from
}

// Define all available dashboard permissions
export const DASHBOARD_PERMISSIONS: DashboardPermission[] = [
  // Management permissions
  { id: 'view_user_management', name: 'View User Management', description: 'Access user management dashboard', category: 'management', level: 'read' },
  { id: 'edit_user_management', name: 'Edit User Management', description: 'Create, edit, and manage users', category: 'management', level: 'write' },
  { id: 'admin_user_management', name: 'Admin User Management', description: 'Full user administration including role changes', category: 'management', level: 'admin' },
  
  // Booking permissions
  { id: 'view_bookings', name: 'View Bookings', description: 'View booking information', category: 'booking', level: 'read' },
  { id: 'view_assigned_bookings', name: 'View Assigned Bookings', description: 'View bookings assigned to talent', category: 'booking', level: 'read' },
  { id: 'respond_to_bookings', name: 'Respond to Bookings', description: 'Approve, reject, or counter-offer bookings', category: 'booking', level: 'write' },
  { id: 'create_bookings', name: 'Create Bookings', description: 'Create new bookings', category: 'booking', level: 'write' },
  { id: 'manage_bookings', name: 'Manage Bookings', description: 'Edit and approve bookings', category: 'booking', level: 'write' },
  { id: 'admin_bookings', name: 'Admin Bookings', description: 'Full booking administration', category: 'booking', level: 'admin' },
  { id: 'view_technical_riders', name: 'View Technical Riders', description: 'Access technical rider system', category: 'booking', level: 'read' },
  { id: 'create_technical_riders', name: 'Create Technical Riders', description: 'Create and edit technical riders', category: 'booking', level: 'write' },
  { id: 'assignment_management', name: 'Assignment Management', description: 'Manage talent assignments', category: 'booking', level: 'write' },
  
  // Content permissions
  { id: 'view_content', name: 'View Content', description: 'View songs, albums, merchandise', category: 'content', level: 'read' },
  { id: 'upload_content', name: 'Upload Content', description: 'Upload songs, albums, media', category: 'content', level: 'write' },
  { id: 'manage_content', name: 'Manage Content', description: 'Edit and manage all content', category: 'content', level: 'write' },
  { id: 'admin_content', name: 'Admin Content', description: 'Full content administration', category: 'content', level: 'admin' },
  { id: 'manage_merchandise', name: 'Manage Merchandise', description: 'Create and manage merchandise', category: 'content', level: 'write' },
  { id: 'manage_contracts', name: 'Manage Contracts', description: 'Create and manage contracts', category: 'content', level: 'write' },
  { id: 'manage_splitsheets', name: 'Manage Splitsheets', description: 'Create and manage splitsheets', category: 'content', level: 'write' },
  
  // Analytics permissions
  { id: 'view_analytics', name: 'View Analytics', description: 'View basic analytics', category: 'analytics', level: 'read' },
  { id: 'advanced_analytics', name: 'Advanced Analytics', description: 'Access detailed analytics and reports', category: 'analytics', level: 'write' },
  { id: 'revenue_analytics', name: 'Revenue Analytics', description: 'View revenue and financial analytics', category: 'analytics', level: 'write' },
  { id: 'admin_analytics', name: 'Admin Analytics', description: 'Full analytics administration', category: 'analytics', level: 'admin' },
  
  // Marketing permissions
  { id: 'view_marketing', name: 'View Marketing', description: 'View marketing campaigns', category: 'marketing', level: 'read' },
  { id: 'create_campaigns', name: 'Create Campaigns', description: 'Create marketing campaigns', category: 'marketing', level: 'write' },
  { id: 'manage_newsletters', name: 'Manage Newsletters', description: 'Create and send newsletters', category: 'marketing', level: 'write' },
  { id: 'manage_press_releases', name: 'Manage Press Releases', description: 'Create and manage press releases', category: 'marketing', level: 'write' },
  { id: 'opphub_access', name: 'OppHub Access', description: 'Access opportunity marketplace', category: 'marketing', level: 'read' },
  { id: 'opphub_premium', name: 'OppHub Premium', description: 'Premium opportunity features', category: 'marketing', level: 'write' },
  
  // System permissions
  { id: 'view_system_config', name: 'View System Config', description: 'View system configuration', category: 'system', level: 'read' },
  { id: 'edit_system_config', name: 'Edit System Config', description: 'Modify system settings', category: 'system', level: 'write' },
  { id: 'admin_system_config', name: 'Admin System Config', description: 'Full system administration', category: 'system', level: 'admin' },
  { id: 'database_access', name: 'Database Access', description: 'Access database management', category: 'system', level: 'admin' },
  { id: 'security_audit', name: 'Security Audit', description: 'Access security and audit features', category: 'system', level: 'admin' },
];

// Define default user roles with their permissions
export const DEFAULT_USER_ROLES: UserRole[] = [
  {
    id: 'fan',
    name: 'fan',
    displayName: 'Fan',
    description: 'General platform user with basic access',
    isDefault: true,
    permissions: [
      'view_content',
      'view_bookings', // Can view public booking info
      'opphub_access'
    ]
  },
  {
    id: 'professional',
    name: 'professional',
    displayName: 'Professional',
    description: 'Independent professional user',
    isDefault: true,
    permissions: [
      'view_content',
      'view_bookings',
      'view_assigned_bookings',
      'respond_to_bookings',
      'create_bookings',
      'view_technical_riders',
      'view_analytics',
      'opphub_access',
      'view_marketing'
    ]
  },
  {
    id: 'managed_professional',
    name: 'managed_professional',
    displayName: 'Managed Professional',
    description: 'Professionally managed service provider',
    isDefault: true,
    inheritFrom: 'professional',
    permissions: [
      'view_content',
      'view_bookings',
      'view_assigned_bookings',
      'respond_to_bookings',
      'create_bookings',
      'manage_bookings',
      'view_technical_riders',
      'create_technical_riders',
      'view_analytics',
      'advanced_analytics',
      'opphub_access',
      'opphub_premium',
      'view_marketing',
      'create_campaigns'
    ]
  },
  {
    id: 'musician',
    name: 'musician',
    displayName: 'Musician',
    description: 'Independent musician',
    isDefault: true,
    permissions: [
      'view_content',
      'upload_content',
      'view_bookings',
      'view_assigned_bookings',
      'respond_to_bookings',
      'create_bookings',
      'view_technical_riders',
      'create_technical_riders',
      'view_analytics',
      'manage_merchandise',
      'manage_contracts',
      'manage_splitsheets',
      'opphub_access',
      'view_marketing'
    ]
  },
  {
    id: 'managed_musician',
    name: 'managed_musician',
    displayName: 'Managed Musician',
    description: 'Professionally managed musician',
    isDefault: true,
    inheritFrom: 'musician',
    permissions: [
      'view_content',
      'upload_content',
      'manage_content',
      'view_bookings',
      'view_assigned_bookings',
      'respond_to_bookings',
      'create_bookings',
      'manage_bookings',
      'view_technical_riders',
      'create_technical_riders',
      'assignment_management',
      'view_analytics',
      'advanced_analytics',
      'revenue_analytics',
      'manage_merchandise',
      'manage_contracts',
      'manage_splitsheets',
      'opphub_access',
      'opphub_premium',
      'view_marketing',
      'create_campaigns',
      'manage_newsletters',
      'manage_press_releases'
    ]
  },
  {
    id: 'artist',
    name: 'artist',
    displayName: 'Artist',
    description: 'Independent artist',
    isDefault: true,
    inheritFrom: 'musician',
    permissions: [
      'view_content',
      'upload_content',
      'view_bookings',
      'view_assigned_bookings',
      'respond_to_bookings',
      'create_bookings',
      'view_technical_riders',
      'create_technical_riders',
      'view_analytics',
      'manage_merchandise',
      'manage_contracts',
      'manage_splitsheets',
      'opphub_access',
      'view_marketing'
    ]
  },
  {
    id: 'managed_artist',
    name: 'managed_artist',
    displayName: 'Managed Artist',
    description: 'Professionally managed artist',
    isDefault: true,
    inheritFrom: 'artist',
    permissions: [
      'view_content',
      'upload_content',
      'manage_content',
      'view_bookings',
      'view_assigned_bookings',
      'respond_to_bookings',
      'create_bookings',
      'manage_bookings',
      'view_technical_riders',
      'create_technical_riders',
      'assignment_management',
      'view_analytics',
      'advanced_analytics',
      'revenue_analytics',
      'manage_merchandise',
      'manage_contracts',
      'manage_splitsheets',
      'opphub_access',
      'opphub_premium',
      'view_marketing',
      'create_campaigns',
      'manage_newsletters',
      'manage_press_releases'
    ]
  },
  {
    id: 'admin',
    name: 'admin',
    displayName: 'Admin',
    description: 'Platform administrator',
    isDefault: true,
    permissions: [
      'view_user_management',
      'edit_user_management',
      'view_content',
      'upload_content',
      'manage_content',
      'admin_content',
      'view_bookings',
      'create_bookings',
      'manage_bookings',
      'admin_bookings',
      'view_technical_riders',
      'create_technical_riders',
      'assignment_management',
      'view_analytics',
      'advanced_analytics',
      'revenue_analytics',
      'admin_analytics',
      'manage_merchandise',
      'manage_contracts',
      'manage_splitsheets',
      'opphub_access',
      'opphub_premium',
      'view_marketing',
      'create_campaigns',
      'manage_newsletters',
      'manage_press_releases',
      'view_system_config',
      'edit_system_config'
    ]
  },
  {
    id: 'assigned_admin',
    name: 'assigned_admin',
    displayName: 'Assigned Admin',
    description: 'Admin with specific talent assignments',
    isDefault: true,
    inheritFrom: 'admin',
    permissions: [
      'view_user_management',
      'edit_user_management',
      'view_content',
      'upload_content',
      'manage_content',
      'view_bookings',
      'create_bookings',
      'manage_bookings',
      'admin_bookings',
      'view_technical_riders',
      'create_technical_riders',
      'assignment_management',
      'view_analytics',
      'advanced_analytics',
      'revenue_analytics',
      'manage_merchandise',
      'manage_contracts',
      'manage_splitsheets',
      'opphub_access',
      'opphub_premium',
      'view_marketing',
      'create_campaigns',
      'manage_newsletters',
      'manage_press_releases'
    ]
  },
  {
    id: 'superadmin',
    name: 'superadmin',
    displayName: 'Superadmin',
    description: 'Full system access and control',
    isDefault: true,
    permissions: DASHBOARD_PERMISSIONS.map(p => p.id) // All permissions
  }
];

// Helper functions for permission checking with circular dependency protection
export function hasPermission(userRole: string, requiredPermission: string, customRoles?: UserRole[], visited: Set<string> = new Set()): boolean {
  const roles = customRoles || DEFAULT_USER_ROLES;
  const role = roles.find(r => r.name === userRole);
  
  if (!role) {
    console.warn(`Role not found: ${userRole}`);
    return false;
  }

  // Prevent infinite loops in role inheritance
  if (visited.has(userRole)) {
    console.error(`Circular dependency detected in role inheritance: ${userRole}`);
    return false;
  }
  
  visited.add(userRole);
  
  // Check direct permissions
  if (role.permissions.includes(requiredPermission)) return true;
  
  // Check inherited permissions
  if (role.inheritFrom) {
    return hasPermission(role.inheritFrom, requiredPermission, roles, visited);
  }
  
  return false;
}

export function getUserPermissions(userRole: string, customRoles?: UserRole[]): string[] {
  const roles = customRoles || DEFAULT_USER_ROLES;
  const role = roles.find(r => r.name === userRole);
  if (!role) return [];
  
  let permissions = [...role.permissions];
  
  // Add inherited permissions
  if (role.inheritFrom) {
    const inheritedPermissions = getUserPermissions(role.inheritFrom, roles);
    permissions = [...new Set([...permissions, ...inheritedPermissions])];
  }
  
  return permissions;
}

export function getPermissionsByCategory(userRole: string, category: DashboardPermission['category'], customRoles?: UserRole[]): DashboardPermission[] {
  const userPermissions = getUserPermissions(userRole, customRoles);
  return DASHBOARD_PERMISSIONS.filter(p => 
    p.category === category && userPermissions.includes(p.id)
  );
}

// Dashboard section mapping
export interface DashboardSection {
  id: string;
  name: string;
  icon: string;
  component: string;
  requiredPermissions: string[];
  category: string;
  order: number;
}

export const DASHBOARD_SECTIONS: DashboardSection[] = [
  // Talent sections
  {
    id: 'talent_bookings',
    name: 'My Bookings',
    icon: 'Calendar',
    component: 'TalentBookingsTab',
    requiredPermissions: ['view_assigned_bookings'],
    category: 'booking',
    order: 1
  },
  // Management sections
  {
    id: 'user_management',
    name: 'User Management',
    icon: 'Users',
    component: 'UserManagementTab',
    requiredPermissions: ['view_user_management'],
    category: 'management',
    order: 2
  },
  {
    id: 'assignment_management',
    name: 'Assignment Management',
    icon: 'UserCheck',
    component: 'AssignmentManagementTab', 
    requiredPermissions: ['assignment_management'],
    category: 'management',
    order: 2
  },
  
  // Booking sections
  {
    id: 'booking_management',
    name: 'Booking Management',
    icon: 'Calendar',
    component: 'BookingManagementTab',
    requiredPermissions: ['view_bookings'],
    category: 'booking',
    order: 3
  },
  {
    id: 'technical_riders',
    name: 'Technical Riders',
    icon: 'Settings',
    component: 'TechnicalRiderTab',
    requiredPermissions: ['view_technical_riders'],
    category: 'booking',
    order: 4
  },
  
  // Content sections
  {
    id: 'content_management',
    name: 'Content Management',
    icon: 'Music',
    component: 'ContentManagementTab',
    requiredPermissions: ['view_content'],
    category: 'content',
    order: 5
  },
  {
    id: 'merchandise',
    name: 'Merchandise',
    icon: 'ShoppingBag',
    component: 'MerchandiseTab',
    requiredPermissions: ['manage_merchandise'],
    category: 'content',
    order: 6
  },
  {
    id: 'contracts',
    name: 'Contracts',
    icon: 'FileText',
    component: 'ContractsTab',
    requiredPermissions: ['manage_contracts'],
    category: 'content',
    order: 7
  },
  
  // Analytics sections
  {
    id: 'analytics',
    name: 'Statistics',
    icon: 'BarChart3',
    component: 'StatisticsTab',
    requiredPermissions: ['view_analytics'],
    category: 'analytics',
    order: 8
  },
  
  // Marketing sections
  {
    id: 'marketing',
    name: 'Marketing & Promotion',
    icon: 'Megaphone',
    component: 'MarketingTab',
    requiredPermissions: ['view_marketing'],
    category: 'marketing',
    order: 10
  },
  {
    id: 'opphub',
    name: 'OppHub Scanner',
    icon: 'Search',
    component: 'OppHubTab',
    requiredPermissions: ['opphub_access'],
    category: 'marketing',
    order: 11
  },
  
  // System sections - properly organized content
  {
    id: 'platform_configuration',
    name: 'Platform Configuration',
    icon: 'Cog',
    component: 'PlatformConfigTab',
    requiredPermissions: ['view_system_config'],
    category: 'system',
    order: 12
  },
  {
    id: 'system_administration',
    name: 'System Administration',
    icon: 'Database',
    component: 'SystemAdminTab',
    requiredPermissions: ['admin_system_config'],
    category: 'system',
    order: 13
  }
];

export function getAvailableSections(userRole: string, customRoles?: UserRole[]): DashboardSection[] {
  const userPermissions = getUserPermissions(userRole, customRoles);
  
  return DASHBOARD_SECTIONS
    .filter(section => {
      // Check if user has any of the required permissions
      return section.requiredPermissions.some(permission => 
        userPermissions.includes(permission)
      );
    })
    .sort((a, b) => a.order - b.order);
}