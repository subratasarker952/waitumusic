import React, { useState, useEffect } from 'react';
import { useNavigation } from '@/hooks/useNavigation';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Users, UserCheck, Calendar, Settings, Music, ShoppingBag, 
  FileText, BarChart, Megaphone, Search, Cog, Database,
  ChevronRight, Lock, Star
} from 'lucide-react';

// Import available admin components
import PlatformConfigurationTab from '@/components/admin/PlatformConfigurationTab';
import SystemAdministrationTab from '@/components/admin/SystemAdministrationTab';
import EnhancedNewsletterManagement from '@/components/admin/EnhancedNewsletterManagement';
import PressReleaseManagement from '@/components/admin/PressReleaseManagement';
import UserAccessLevelManager from '@/components/admin/UserAccessLevelManager';

// Import role-based access control
import { 
  getAvailableSections, 
  getUserPermissions, 
  hasPermission,
  DASHBOARD_SECTIONS,
  type DashboardSection 
} from '@shared/role-permissions';

// Import talent components
import { TalentBookingView } from '@/components/talent/TalentBookingView';

interface UnifiedDashboardProps {
  userRole: string;
  userId: number;
  isDemo?: boolean;
}

// Icon mapping for dynamic rendering
const ICON_MAP = {
  Users, UserCheck, Calendar, Settings, Music, ShoppingBag,
  FileText, BarChart, Megaphone, Search, Cog, Database
};

// Component mapping for available admin components and dashboard sections
const COMPONENT_MAP = {
  // Available admin components
  PlatformConfigurationTab,
  SystemAdministrationTab,
  EnhancedNewsletterManagement,
  PressReleaseManagement,
  UserAccessLevelManager,
  
  // Dashboard section components that render properly separated tabs
  UserManagementTab: ({ userRole, userId }: { userRole: string; userId: number }) => (
    <div className="p-6">
      <UserAccessLevelManager userRole={userRole} userId={userId} />
    </div>
  ),
  PlatformConfigTab: ({ userRole, userId }: { userRole: string; userId: number }) => (
    <PlatformConfigurationTab userRole={userRole} userId={userId} />
  ),
  SystemAdminTab: ({ userRole, userId }: { userRole: string; userId: number }) => (
    <SystemAdministrationTab userRole={userRole} userId={userId} />
  ),
  MarketingTab: ({ userRole, userId }: { userRole: string; userId: number }) => (
    <div className="p-6">
      <EnhancedNewsletterManagement userRole={userRole} userId={userId} />
      <div className="mt-6">
        <PressReleaseManagement userRole={userRole} userId={userId} />
      </div>
    </div>
  ),
  
  // Legacy SuperadminDashboard integration for missing components
  AssignmentManagementTab: ({ userRole, userId }: { userRole: string; userId: number }) => {
    return (
      <Card className="m-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Assignment Management
          </CardTitle>
          <CardDescription>
            Manage talent assignments and booking workflows
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => {
            window.location.href = '/assignments';
          }}>
            Open Assignment Management
          </Button>
        </CardContent>
      </Card>
    );
  },
  
  BookingManagementTab: ({ userRole, userId }: { userRole: string; userId: number }) => {
    return (
      <Card className="m-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Booking Management
          </CardTitle>
          <CardDescription>
            View and manage bookings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => {
            window.location.href = '/booking';
          }}>
            Open Booking Management
          </Button>
        </CardContent>
      </Card>
    );
  },
  
  TechnicalRiderTab: ({ userRole, userId }: { userRole: string; userId: number }) => {
    return (
      <Card className="m-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Technical Riders
          </CardTitle>
          <CardDescription>
            Create and manage technical riders for performances
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => {
            window.location.href = '/comprehensive-booking-workflow';
          }}>
            Open Technical Rider System
          </Button>
        </CardContent>
      </Card>
    );
  },
  
  ContentManagementTab: ({ userRole, userId }: { userRole: string; userId: number }) => {
    return (
      <Card className="m-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Content Management
          </CardTitle>
          <CardDescription>
            Manage songs, albums, and media content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Button onClick={() => {
              window.location.href = '/songs';
            }} className="w-full justify-start">
              Manage Songs
            </Button>
            <Button onClick={() => {
              window.location.href = '/albums';
            }} className="w-full justify-start">
              Manage Albums
            </Button>
            <Button onClick={() => {
              window.location.href = '/artists';
            }} className="w-full justify-start">
              Manage Artists
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  },
  
  MerchandiseTab: ({ userRole, userId }: { userRole: string; userId: number }) => {
    return (
      <Card className="m-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Merchandise Management
          </CardTitle>
          <CardDescription>
            Manage merchandise and products - redirects to SuperadminDashboard media tab
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => {
            window.location.href = '/dashboard?tab=media';
          }}>
            Open Merchandise Management
          </Button>
        </CardContent>
      </Card>
    );
  },

  // Talent-specific dashboard components
  TalentBookingsTab: ({ userRole, userId }: { userRole: string; userId: number }) => (
    <TalentBookingView />
  ),
  
  ContractsTab: ({ userRole, userId }: { userRole: string; userId: number }) => {
    return (
      <Card className="m-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Contracts Management
          </CardTitle>
          <CardDescription>
            View and manage contracts - redirects to SuperadminDashboard applications tab
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => {
            window.location.href = '/dashboard?tab=applications';
          }}>
            Open Contracts Management
          </Button>
        </CardContent>
      </Card>
    );
  },
  
  AnalyticsTab: ({ userRole, userId }: { userRole: string; userId: number }) => {
    return (
      <Card className="m-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            Analytics & Revenue
          </CardTitle>
          <CardDescription>
            View analytics and revenue data - redirects to SuperadminDashboard revenue tab
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => {
            window.location.href = '/dashboard?tab=revenue';
          }}>
            Open Analytics Dashboard
          </Button>
        </CardContent>
      </Card>
    );
  },
  
  OppHubTab: ({ userRole, userId }: { userRole: string; userId: number }) => {
    return (
      <Card className="m-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            OppHub Scanner
          </CardTitle>
          <CardDescription>
            Access opportunity marketplace - redirects to SuperadminDashboard OppHub tab
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => {
            window.location.href = '/dashboard?tab=opphub';
          }}>
            Open OppHub Scanner
          </Button>
        </CardContent>
      </Card>
    );
  },
  
  DatabaseManagementTab: ({ userRole, userId }: { userRole: string; userId: number }) => {
    return (
      <Card className="m-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Management
          </CardTitle>
          <CardDescription>
            Database administration and management - redirects to SuperadminDashboard system tab
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => {
            window.location.href = '/dashboard?tab=system';
          }}>
            Open Database Management
          </Button>
        </CardContent>
      </Card>
    );
  }
};

export default function UnifiedDashboard({ userRole, userId, isDemo = false }: UnifiedDashboardProps) {
  const [activeTab, setActiveTab] = useState<string>('');
  // Fetch roles from database instead of using hardcoded values
  const { data: dbRoles } = useQuery({
    queryKey: ['/api/roles'],
  });

  // Fetch user's custom roles if any
  const { data: userCustomRoles } = useQuery({
    queryKey: ['/api/admin/custom-roles', userId],
    enabled: hasPermission(userRole, 'admin_user_management')
  });

  // Get available sections for this user role using database roles
  const customRoles = Array.isArray(dbRoles) ? dbRoles : [];
  const availableSections = getAvailableSections(userRole, customRoles);
  const userPermissions = getUserPermissions(userRole, customRoles);
  
  // Set default active tab to first available section
  useEffect(() => {
    if (availableSections.length > 0 && !activeTab) {
      setActiveTab(availableSections[0].id);
    }
  }, [availableSections, activeTab]);

  // Get role display info
  // Find role info from database data instead of hardcoded values
  const roleInfo = Array.isArray(dbRoles) ? dbRoles.find((r: any) => r.name === userRole) : null;
  const totalPermissions = userPermissions.length;

  // Group sections by category for better organization
  const sectionsByCategory = availableSections.reduce((acc, section) => {
    if (!acc[section.category]) {
      acc[section.category] = [];
    }
    acc[section.category].push(section);
    return acc;
  }, {} as Record<string, DashboardSection[]>);

  // Render individual section component
  const renderSectionComponent = (section: DashboardSection) => {
    const Component = COMPONENT_MAP[section.component as keyof typeof COMPONENT_MAP];
    
    if (!Component) {
      return (
        <Card className="m-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              {section.name}
            </CardTitle>
            <CardDescription>
              Component "{section.component}" needs to be mapped to existing legacy component
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This section is available for your role but the component mapping needs to be completed.
              Required permissions: {section.requiredPermissions.join(', ')}
            </p>
          </CardContent>
        </Card>
      );
    }

    return <Component userRole={userRole} userId={userId} />;
  };

  // Category color mapping
  const categoryColors = {
    management: 'bg-blue-500',
    booking: 'bg-green-500', 
    content: 'bg-purple-500',
    analytics: 'bg-orange-500',
    marketing: 'bg-pink-500',
    system: 'bg-red-500'
  };

  if (availableSections.length === 0) {
    return (
      <Card className="m-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Access Restricted
          </CardTitle>
          <CardDescription>
            No dashboard sections available for role: {roleInfo?.displayName || userRole}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Contact an administrator to request additional permissions or upgrade your account.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Dashboard Header */}
      <div className="border-b bg-card">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Unified Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back! Access your personalized platform features.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="flex items-center gap-2">
                <Star className="h-3 w-3" />
                {roleInfo?.displayName || userRole}
              </Badge>
              <Badge variant="secondary">
                {totalPermissions} permissions
              </Badge>
              {isDemo && (
                <Badge variant="destructive">Demo Account</Badge>
              )}
            </div>
          </div>
          
          {/* Role summary */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(sectionsByCategory).map(([category, sections]) => (
              <div key={category} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${categoryColors[category as keyof typeof categoryColors]}`} />
                <span className="text-sm font-medium capitalize">{category}</span>
                <Badge variant="outline" className="text-xs">
                  {sections.length}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Tab Navigation */}
        <div className="border-b bg-muted/50">
          <div className="px-6">
            <TabsList className="h-12 w-full justify-start overflow-x-auto">
              {availableSections.map((section) => {
                const Icon = ICON_MAP[section.icon as keyof typeof ICON_MAP] || Settings;
                return (
                  <TabsTrigger 
                    key={section.id} 
                    value={section.id}
                    className="flex items-center gap-2 min-w-fit"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{section.name}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>
        </div>

        {/* Tab Contents */}
        <div className="flex-1">
          {availableSections.map((section) => (
            <TabsContent key={section.id} value={section.id} className="m-0">
              {renderSectionComponent(section)}
            </TabsContent>
          ))}
        </div>
      </Tabs>

      {/* Quick Actions Footer */}
      <div className="border-t bg-card p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Dashboard sections: {availableSections.length} • 
            Total permissions: {totalPermissions} •
            Role: {roleInfo?.displayName || userRole}
          </div>
          
          <div className="flex items-center gap-2">
            {hasPermission(userRole, 'view_system_config', customRoles) && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setActiveTab('system_config')}
              >
                <Cog className="h-4 w-4 mr-2" />
                Settings
              </Button>
            )}
            
            {hasPermission(userRole, 'admin_user_management', customRoles) && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setActiveTab('user_management')}
              >
                <Users className="h-4 w-4 mr-2" />
                Manage Users
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}