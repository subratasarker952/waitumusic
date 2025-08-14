import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, Users, Shield, Calendar, Music, User, Search, Heart, 
  ShoppingBag, Briefcase, Award, Clock, TrendingUp, DollarSign,
  Monitor, BarChart3, Server, Globe, Eye, Lock, UserCheck,
  FileText, Layers
} from 'lucide-react';
import { 
  DASHBOARD_SECTIONS, 
  getAccessibleSections, 
  canAccessAdminConfig, 
  getConfigurableSettings,
  hasAccess,
  type UserRole,
  type DashboardSection 
} from '@shared/role-access-control';
import UnifiedAdminConfigDashboard from './UnifiedAdminConfigDashboard';
import UserAccessLevelManager from './UserAccessLevelManager';
import SystemAdministrationTab from './SystemAdministrationTab';
import StatisticsTab from './StatisticsTab';

interface HierarchicalDashboardProps {
  user: {
    id: number;
    fullName: string;
    role: string;
    roleId: number;
    roleName: string;
  };
}

// Icon mapping for dashboard sections
const ICON_MAP: Record<string, React.ComponentType<any>> = {
  Settings, Users, Shield, Calendar, Music, User, Search, Heart,
  ShoppingBag, Briefcase, Award, Clock, TrendingUp, DollarSign,
  Monitor, BarChart3, Server, Globe, Eye, Lock, UserCheck,
  FileText, Layers
};

export default function HierarchicalDashboard({ user }: HierarchicalDashboardProps) {
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] = useState<string>('');
  const [userRole, setUserRole] = useState<UserRole>('fan');
  const [detectedRoleName, setDetectedRoleName] = useState<string>('fan');

  // Fetch roles from database
  const { data: dbRoles } = useQuery({
    queryKey: ['/api/roles'],
  });

  // Force cache invalidation and fresh data on mount
  useEffect(() => {
    // Invalidate all admin-related queries to force fresh data
    queryClient.invalidateQueries({ queryKey: ['/api/admin'] });
    queryClient.invalidateQueries({ queryKey: ['/api/users'] });
    queryClient.invalidateQueries({ queryKey: ['/api/roles'] });
    queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
  }, [queryClient]);

  // Map user role to system role
  useEffect(() => {
    console.log('🔍 HIERARCHICAL DASHBOARD: User role debugging');
    console.log('🔍 User object:', user);
    console.log('🔍 user.roleId:', user.roleId);
    console.log('🔍 dbRoles:', dbRoles);
    
    // Don't proceed if we don't have role data yet
    if (!dbRoles || !Array.isArray(dbRoles)) {
      console.log('🔍 Waiting for role data to load...');
      return;
    }
    
    // Simple roleId to role mapping
    let detectedRole: UserRole = 'fan';
    let displayName = 'fan';
    
    // Use database-driven role mapping instead of hardcoded switch
    const role = dbRoles.find((r: any) => r.id === user.roleId);
    console.log('🔍 Found role in database:', role);
    
    if (role) {
      // Map database role names to internal UserRole types
      const roleName = role.name.toLowerCase().replace(/\s+/g, '_');
      console.log('🔍 Processing role name:', roleName);
      
      if (roleName.includes('superadmin')) {
        detectedRole = 'superadmin';
        displayName = 'superadmin';
      } else if (roleName.includes('admin')) {
        detectedRole = 'admin';
        displayName = 'admin';
      } else if (roleName.includes('managed') && roleName.includes('artist')) {
        detectedRole = 'managed_artist';
        displayName = 'managed_artist';
      } else if (roleName.includes('artist')) {
        detectedRole = 'artist';
        displayName = 'artist';
      } else if (roleName.includes('managed') && roleName.includes('musician')) {
        detectedRole = 'managed_musician';
        displayName = 'managed_musician';
      } else if (roleName.includes('musician')) {
        detectedRole = 'musician';
        displayName = 'musician';
      } else if (roleName.includes('professional')) {
        detectedRole = 'professional';
        displayName = 'professional';
      } else {
        detectedRole = 'fan';
        displayName = 'fan';
      }
    } else {
      console.log('🔍 No role found in database for roleId:', user.roleId);
      detectedRole = 'fan';
      displayName = 'fan';
    }
    
    console.log('🔍 Detected role:', detectedRole);
    
    setUserRole(detectedRole);
    setDetectedRoleName(displayName);
    
    // Set default active section
    const accessibleSections = getAccessibleSections(detectedRole);
    console.log('🔍 Accessible sections:', accessibleSections.length);
    
    if (accessibleSections.length > 0) {
      setActiveSection(accessibleSections[0].id);
    }
  }, [user.roleId, dbRoles]);

  const accessibleSections = getAccessibleSections(userRole);
  const configurableSettings = getConfigurableSettings(userRole);
  const hasAdminConfigAccess = canAccessAdminConfig(userRole);

  const renderIcon = (iconName: string, className: string = "h-5 w-5") => {
    const IconComponent = ICON_MAP[iconName];
    return IconComponent ? <IconComponent className={className} /> : <Settings className={className} />;
  };

  const renderSectionContent = (section: DashboardSection) => {
    // Special handling for platform configuration (superadmin only)
    if (section.id === 'platform-config' && hasAdminConfigAccess) {
      return <UnifiedAdminConfigDashboard />;
    }

    // Default section content based on section type
    switch (section.id) {
      case 'user-management':
        return (
          <div key={`user-management-${Date.now()}`} className="p-6">
            <UserAccessLevelManager userRole={detectedRoleName} userId={user.id} />
          </div>
        );

      case 'system-administration':
        return (
          <div key={`system-administration-${Date.now()}`} className="p-6">
            <SystemAdministrationTab userRole={detectedRoleName} userId={user.id} />
          </div>
        );

      case 'analytics':
        return (
          <div key={`analytics-${Date.now()}`} className="p-6">
            <StatisticsTab userRole={detectedRoleName} userId={user.id} />
          </div>
        );

      case 'profile-management':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {renderIcon('User')}
                  Your Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Full Name</label>
                    <p className="mt-1 text-sm">{user.fullName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Role</label>
                    <div className="mt-1">
                      <Badge variant="secondary">{user.roleName}</Badge>
                      {(userRole === 'managed_artist' || userRole === 'managed_musician') && (
                        <Badge variant="outline" className="ml-2">Managed</Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                {(userRole === 'managed_artist' || userRole === 'managed_musician') && (
                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      {renderIcon('Lock', 'h-4 w-4')}
                      <span className="text-sm font-medium">Managed Account</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Some profile fields are managed by your assigned administrator and cannot be edited directly.
                    </p>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button onClick={() => {
                    // Navigate to profile edit or open modal
                    console.log('Edit Profile clicked');
                    // TODO: Implement profile edit functionality
                  }}>Edit Profile</Button>
                  {hasAccess(userRole, 'locked-fields', 'read') && (
                    <Button variant="outline" onClick={() => {
                      console.log('View Locked Fields clicked');
                      // TODO: Implement locked fields view
                    }}>View Locked Fields</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'booking-management':
      case 'advanced-booking':
      case 'basic-booking':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">All time</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-xs text-muted-foreground">Next 30 days</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2</div>
                  <p className="text-xs text-muted-foreground">Awaiting approval</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$2,450</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>
            </div>
            
            {section.id === 'advanced-booking' && (
              <Card>
                <CardHeader>
                  <CardTitle>Advanced Booking Features</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button 
                      className="justify-start h-auto p-4"
                      onClick={() => {
                        console.log('Technical Rider clicked');
                        // TODO: Navigate to technical rider creation
                      }}
                    >
                      {renderIcon('Monitor', 'h-5 w-5 mr-2')}
                      <div className="text-left">
                        <div className="font-medium">Technical Rider</div>
                        <div className="text-sm text-muted-foreground">Create detailed technical requirements</div>
                      </div>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="justify-start h-auto p-4"
                      onClick={() => {
                        console.log('Performance Analytics clicked');
                        // TODO: Navigate to performance analytics
                      }}
                    >
                      {renderIcon('TrendingUp', 'h-5 w-5 mr-2')}
                      <div className="text-left">
                        <div className="font-medium">Performance Analytics</div>
                        <div className="text-sm text-muted-foreground">View detailed performance metrics</div>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 'analytics-overview':
      case 'analytics-limited':
      case 'analytics-personal':
      case 'basic-analytics':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Page Views</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1,234</div>
                  <p className="text-xs text-muted-foreground">+12% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Engagement</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">87%</div>
                  <p className="text-xs text-muted-foreground">Average engagement rate</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">
                    {section.id === 'analytics-overview' ? 'Platform Users' : 'Profile Views'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {section.id === 'analytics-overview' ? '23' : '456'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {section.id === 'analytics-overview' ? 'Total active users' : 'This month'}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">
                    {section.id === 'analytics-overview' ? 'Revenue' : 'Bookings'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {section.id === 'analytics-overview' ? '$12,345' : '8'}
                  </div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {renderIcon(section.icon)}
                {section.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{section.description}</p>
              <div className="flex items-center gap-2">
                <Badge variant={hasAccess(userRole, section.id, 'write') ? 'default' : 'secondary'}>
                  {hasAccess(userRole, section.id, 'admin') ? 'Full Access' : 
                   hasAccess(userRole, section.id, 'write') ? 'Read/Write' : 'Read Only'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  if (accessibleSections.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">No dashboard sections available for your role.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <div className="text-muted-foreground">
            Welcome back, {user.fullName} • Role: <Badge variant="secondary">{user.roleName || detectedRoleName}</Badge>
          </div>
        </div>
        
        {configurableSettings.length > 0 && (
          <Badge variant="outline" className="flex items-center gap-1">
            {renderIcon('Settings', 'h-3 w-3')}
            {configurableSettings.length} configurable settings
          </Badge>
        )}
      </div>

      <Tabs value={activeSection} onValueChange={(value) => {
        // Force immediate cache invalidation when switching tabs
        queryClient.invalidateQueries({ queryKey: ['/api/admin'] });
        queryClient.invalidateQueries({ queryKey: ['/api/users'] });
        queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
        setActiveSection(value);
      }} className="space-y-6">
        <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${Math.min(accessibleSections.length, 6)}, minmax(0, 1fr))` }}>
          {accessibleSections.slice(0, 6).map((section) => (
            <TabsTrigger key={section.id} value={section.id} className="flex items-center gap-2">
              {renderIcon(section.icon, 'h-4 w-4')}
              <span className="hidden sm:inline">{section.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {accessibleSections.map((section) => (
          <TabsContent key={section.id} value={section.id}>
            {renderSectionContent(section)}
          </TabsContent>
        ))}
      </Tabs>

      {/* Role-specific feature highlights */}
      {(userRole === 'managed_artist' || userRole === 'managed_musician') && (
        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
              {renderIcon('Award')}
              Managed Account Benefits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                {renderIcon('TrendingUp', 'h-4 w-4 text-green-600')}
                <span className="text-sm">Advanced Analytics</span>
              </div>
              <div className="flex items-center gap-2">
                {renderIcon('DollarSign', 'h-4 w-4 text-green-600')}
                <span className="text-sm">Revenue Tracking</span>
              </div>
              <div className="flex items-center gap-2">
                {renderIcon('Users', 'h-4 w-4 text-green-600')}
                <span className="text-sm">Dedicated Support</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}