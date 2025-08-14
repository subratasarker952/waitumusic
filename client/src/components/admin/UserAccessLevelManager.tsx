import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Users, Shield, Crown, Music, Briefcase, Heart, 
  Search, Edit, Eye, Settings, UserCheck, Plus, 
  UserPlus, Trash2, Copy, AlertTriangle, Palette,
  BarChart3 as BarChart, Database, Mail, FileText,
  Calendar, Upload, Clock, DollarSign
} from 'lucide-react';
import { DASHBOARD_PERMISSIONS } from '@shared/role-permissions';

interface User {
  id: number;
  email: string;
  fullName: string;
  role: number;
  managedStatus?: string;
  userType?: string;
  subType?: string;
}

interface CustomRole {
  id: string;
  name: string;
  displayName: string;
  description: string;
  permissions: string[];
  inheritFrom?: string;
  isDefault: boolean;
  createdBy?: number;
  createdAt?: string;
}

interface CreateRoleData {
  name: string;
  displayName: string;
  description: string;
  permissions: string[];
  inheritFrom?: string;
}

interface RoleAssignment {
  userId: number;
  roleId: string;
  assignedBy: number;
  assignedAt: string;
  expiresAt?: string;
}

interface UserAccessLevelManagerProps {
  userRole: string;
  userId: number;
}

const UserAccessLevelManager: React.FC<UserAccessLevelManagerProps> = ({ userRole, userId }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // User management state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');

  // Fetch roles from database
  const { data: dbRoles = [] } = useQuery({
    queryKey: ['/api/roles'],
    enabled: userRole === 'superadmin' || userRole === 'admin'
  });
  
  // Role creation state
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false);
  const [newRole, setNewRole] = useState<CreateRoleData>({
    name: '',
    displayName: '',
    description: '',
    permissions: [],
    inheritFrom: undefined
  });
  
  // Role assignment state
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [isAssignRoleOpen, setIsAssignRoleOpen] = useState(false);
  const [assignmentRoleId, setAssignmentRoleId] = useState<string>('');

  // Data fetching - disable caching for immediate updates
  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ['/api/users/all-with-permissions'],
    staleTime: 0,
    gcTime: 0,
  });

  const { data: customRoles = [], isLoading: rolesLoading } = useQuery<CustomRole[]>({
    queryKey: ['/api/admin/custom-roles'],
    staleTime: 0,
    gcTime: 0,
  });

  const { data: roleAssignments = [], isLoading: assignmentsLoading } = useQuery<RoleAssignment[]>({
    queryKey: ['/api/admin/role-assignments'],
    staleTime: 0,
    gcTime: 0,
  });



  // Mutations
  const createRoleMutation = useMutation({
    mutationFn: (roleData: CreateRoleData) => 
      apiRequest('/api/admin/roles', {
        method: 'POST',
        body: JSON.stringify(roleData)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/custom-roles'] });
      toast({ title: "Role created successfully" });
      setIsCreateRoleOpen(false);
      setNewRole({
        name: '',
        displayName: '',
        description: '',
        permissions: [],
        inheritFrom: undefined
      });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to create role", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  const assignRoleMutation = useMutation({
    mutationFn: ({ userId, roleId }: { userId: number; roleId: string }) => 
      apiRequest(`/api/admin/users/${userId}/assign-role`, {
        method: 'POST',
        body: JSON.stringify({ roleId })
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users/all-with-permissions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/role-assignments'] });
      toast({ title: "Role assigned successfully" });
      setIsAssignRoleOpen(false);
      setSelectedUserId(null);
      setAssignmentRoleId('');
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to assign role", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  const deleteRoleMutation = useMutation({
    mutationFn: (roleId: string) => 
      apiRequest(`/api/admin/roles/${roleId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/custom-roles'] });
      toast({ title: "Role deleted successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to delete role", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  const getRoleInfo = (roleId: number, managedStatus?: string, userType?: string) => {
    // Find role from database data
    const dbRole = Array.isArray(dbRoles) ? dbRoles.find((role: any) => role.id === roleId) : null;
    
    // Icon mapping based on role ID
    const iconMap: Record<number, any> = {
      1: Crown,
      2: Shield,
      3: Music,
      4: Music,
      5: Music,
      6: Music,
      7: Briefcase,
      8: Briefcase,
      9: Heart
    };

    // Color mapping based on role ID
    const colorMap: Record<number, string> = {
      1: 'bg-purple-500',
      2: 'bg-blue-500',
      3: 'bg-emerald-500',
      4: 'bg-green-500',
      5: 'bg-teal-500',
      6: 'bg-blue-400',
      7: 'bg-orange-500',
      8: 'bg-amber-500',
      9: 'bg-pink-500'
    };

    // Access level mapping based on role ID
    const accessMap: Record<number, string> = {
      1: 'Complete System Control',
      2: 'Platform Management',
      3: 'Managed Artist Features',
      4: 'Music Creation & Performance',
      5: 'Session & Collaboration',
      6: 'Session Music Support',
      7: 'Industry Services',
      8: 'Professional Services',
      9: 'Basic User Features'
    };

    const role = {
      name: dbRole?.name || 'Unknown Role',
      icon: iconMap[roleId] || Heart,
      color: colorMap[roleId] || 'bg-gray-500',
      access: accessMap[roleId] || 'Basic Features'
    };
    
    // Enhanced role info based on managed status
    if (managedStatus === 'fully_managed') {
      return {
        ...role,
        name: `Managed ${role.name}`,
        color: 'bg-gradient-to-r from-purple-500 to-pink-500',
        access: `${role.access} + Full Management Benefits`
      };
    }

    if (managedStatus === 'partially_managed') {
      return {
        ...role,
        name: `Partially Managed ${role.name}`,
        color: 'bg-gradient-to-r from-blue-500 to-purple-500',
        access: `${role.access} + Limited Management Benefits`
      };
    }

    return role;
  };

  const getAccessLevelDetails = (roleId: number, managedStatus?: string) => {
    const accessMatrix = {
      1: ['All System Features', 'User Management', 'Financial Controls', 'Database Access', 'Security Settings'],
      2: ['User Management', 'Content Moderation', 'Booking Oversight', 'Newsletter Management', 'Limited System Config'],
      3: ['Full Music Upload', 'Professional Booking', 'Merchandise Creation', 'Technical Riders', 'Revenue Analytics', 'Management Integration'],
      4: ['Music Upload', 'Booking Management', 'Merchandise Creation', 'Technical Riders', 'Revenue Analytics'],
      5: ['Session Booking', 'Collaboration Tools', 'Equipment Management', 'Performance History'],
      6: ['Session Support', 'Collaboration Tools', 'Equipment Setup', 'Performance Support'],
      7: ['Service Profiles', 'Consultation Booking', 'Portfolio Management', 'Client Management', 'Revenue Tools'],
      8: ['Professional Services', 'Business Tools', 'Client Management', 'Industry Analytics'],
      9: ['Artist Discovery', 'Music Streaming', 'Event Booking', 'Merchandise Shopping', 'Basic Profile']
    };

    let baseAccess = accessMatrix[roleId as keyof typeof accessMatrix] || accessMatrix[9];

    if (managedStatus === 'fully_managed') {
      baseAccess = [...baseAccess, 'Priority Support', 'Advanced Analytics', 'Marketing Tools', 'Revenue Optimization'];
    } else if (managedStatus === 'partially_managed') {
      baseAccess = [...baseAccess, 'Enhanced Analytics', 'Marketing Assistance'];
    }

    return baseAccess;
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role.toString() === filterRole;
    return matchesSearch && matchesRole;
  });

  const usersByRole = filteredUsers.reduce((acc, user) => {
    const key = user.role;
    if (!acc[key]) acc[key] = [];
    acc[key].push(user);
    return acc;
  }, {} as Record<number, User[]>);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading User Access Levels...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  // Helper functions for role creation
  const handlePermissionToggle = (permissionId: string) => {
    setNewRole(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  const handleCreateRole = () => {
    if (!newRole.name || !newRole.displayName) {
      toast({ 
        title: "Validation error", 
        description: "Role name and display name are required",
        variant: "destructive" 
      });
      return;
    }
    createRoleMutation.mutate(newRole);
  };

  const handleAssignRole = () => {
    if (!selectedUserId || !assignmentRoleId) {
      toast({ 
        title: "Validation error", 
        description: "Please select both user and role",
        variant: "destructive" 
      });
      return;
    }
    assignRoleMutation.mutate({ userId: selectedUserId, roleId: assignmentRoleId });
  };

  if (isLoading || rolesLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading User Management...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            User Management & Role Administration
          </CardTitle>
        </CardHeader>
      </Card>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            User Overview
          </TabsTrigger>
          <TabsTrigger value="create-role" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Role
          </TabsTrigger>
          <TabsTrigger value="assign-roles" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Assign Roles
          </TabsTrigger>
          <TabsTrigger value="role-management" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Role Management
          </TabsTrigger>
        </TabsList>

        {/* User Overview Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Access Level Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <Input
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"

              />
            </div>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {Array.isArray(dbRoles) && dbRoles.map((role: any) => (
                  <SelectItem key={role.id} value={role.id.toString()}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Access Overview</TabsTrigger>
              <TabsTrigger value="detailed">Detailed Permissions</TabsTrigger>
              <TabsTrigger value="management">Management Status</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {Object.entries(usersByRole).map(([roleId, roleUsers]) => {
                const roleInfo = getRoleInfo(parseInt(roleId));
                const IconComponent = roleInfo.icon;

                return (
                  <Card key={roleId}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <IconComponent className="h-5 w-5" />
                        {roleInfo.name} ({roleUsers.length} users)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-3">
                        {roleUsers.map((user) => {
                          const userRoleInfo = getRoleInfo(user.role, user.managedStatus);
                          return (
                            <div key={user.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${userRoleInfo.color}`} />
                                <div>
                                  <p className="font-medium">{user.fullName}</p>
                                  <p className="text-sm text-muted-foreground">{user.email}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{userRoleInfo.name}</Badge>
                                <Button size="sm" variant="ghost">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="ghost">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </TabsContent>

            <TabsContent value="detailed" className="space-y-4">
              {filteredUsers.map((user) => {
                const roleInfo = getRoleInfo(user.role, user.managedStatus);
                const accessDetails = getAccessLevelDetails(user.role, user.managedStatus);
                const IconComponent = roleInfo.icon;

                return (
                  <Card key={user.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <IconComponent className="h-5 w-5" />
                          {user.fullName}
                        </div>
                        <Badge className={roleInfo.color}>{roleInfo.name}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2">Access Level</h4>
                          <p className="text-sm text-muted-foreground mb-3">{roleInfo.access}</p>
                          <div className="flex flex-wrap gap-1">
                            {accessDetails.map((access) => (
                              <Badge key={access} variant="secondary" className="text-xs">
                                {access}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Account Details</h4>
                          <p className="text-sm text-muted-foreground mb-1">Email: {user.email}</p>
                          <p className="text-sm text-muted-foreground mb-1">User ID: {user.id}</p>
                          {user.managedStatus && (
                            <p className="text-sm text-muted-foreground">
                              Status: {user.managedStatus.replace('_', ' ')}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </TabsContent>

            <TabsContent value="management" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Fully Managed</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-600 mb-1">
                      {users.filter(u => [3, 5, 7].includes(u.role)).length}
                    </div>
                    <p className="text-xs text-muted-foreground">Complete management benefits</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Partially Managed</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {users.filter(u => u.managedStatus === 'partially_managed' || (u.managedStatus && u.managedStatus.includes('partial'))).length}
                    </div>
                    <p className="text-xs text-muted-foreground">Limited management benefits</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Unmanaged</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-600 mb-1">
                      {users.filter(u => [4, 6, 8, 9].includes(u.role)).length}
                    </div>
                    <p className="text-xs text-muted-foreground">Standard platform access</p>
                  </CardContent>
                </Card>
              </div>

              {/* Per-Admin Granular Permission Controls */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Per-Admin Granular Permission Controls
                  </CardTitle>
                  <CardDescription>
                    Configure individual administrative permissions for each administrator with toggleable access controls
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Admin Selection */}
                  <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                    <Label className="font-medium">Select Administrator:</Label>
                    <Select value={selectedUserId?.toString() || ''} onValueChange={(value) => setSelectedUserId(parseInt(value))}>
                      <SelectTrigger className="w-64">
                        <SelectValue placeholder="Choose admin to configure" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.filter(u => u.role === 1 || u.role === 2).map((admin) => (
                          <SelectItem key={admin.id} value={admin.id.toString()}>
                            {admin.fullName} ({admin.role === 1 ? 'SuperAdmin' : 'Admin'})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedUserId && (
                    <div className="space-y-6">
                      {/* Dashboard Modal Controls */}
                      <div>
                        <h4 className="font-medium mb-4 flex items-center gap-2">
                          <Crown className="h-4 w-4" />
                          Dashboard Modal Access Control (11+ Modals)
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <Card className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Music className="h-4 w-4" />
                                <span className="font-medium text-sm">Stage Plot Designer</span>
                              </div>
                              <Switch defaultChecked />
                            </div>
                            <p className="text-xs text-muted-foreground">Professional stage layout design tools</p>
                          </Card>

                          <Card className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Settings className="h-4 w-4" />
                                <span className="font-medium text-sm">32-Port Mixer Config</span>
                              </div>
                              <Switch defaultChecked />
                            </div>
                            <p className="text-xs text-muted-foreground">Audio mixer configuration interface</p>
                          </Card>

                          <Card className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Music className="h-4 w-4" />
                                <span className="font-medium text-sm">Setlist Manager</span>
                              </div>
                              <Switch defaultChecked />
                            </div>
                            <p className="text-xs text-muted-foreground">Performance setlist creation tools</p>
                          </Card>

                          <Card className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                <span className="font-medium text-sm">User Management Modal</span>
                              </div>
                              <Switch defaultChecked />
                            </div>
                            <p className="text-xs text-muted-foreground">Advanced user creation/editing interface</p>
                          </Card>

                          <Card className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                <span className="font-medium text-sm">Content Management</span>
                              </div>
                              <Switch defaultChecked />
                            </div>
                            <p className="text-xs text-muted-foreground">Platform content moderation tools</p>
                          </Card>

                          <Card className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Database className="h-4 w-4" />
                                <span className="font-medium text-sm">Database Config</span>
                              </div>
                              <Switch defaultChecked />
                            </div>
                            <p className="text-xs text-muted-foreground">Database management interface</p>
                          </Card>

                          <Card className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                <span className="font-medium text-sm">Email Config</span>
                              </div>
                              <Switch defaultChecked />
                            </div>
                            <p className="text-xs text-muted-foreground">Email system configuration</p>
                          </Card>

                          <Card className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Settings className="h-4 w-4" />
                                <span className="font-medium text-sm">System Config</span>
                              </div>
                              <Switch defaultChecked />
                            </div>
                            <p className="text-xs text-muted-foreground">Core system settings management</p>
                          </Card>

                          <Card className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Shield className="h-4 w-4" />
                                <span className="font-medium text-sm">Security Audit</span>
                              </div>
                              <Switch defaultChecked />
                            </div>
                            <p className="text-xs text-muted-foreground">Security monitoring and auditing</p>
                          </Card>

                          <Card className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <BarChart className="h-4 w-4" />
                                <span className="font-medium text-sm">Performance Monitor</span>
                              </div>
                              <Switch defaultChecked />
                            </div>
                            <p className="text-xs text-muted-foreground">System performance analytics</p>
                          </Card>

                          <Card className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Music className="h-4 w-4" />
                                <span className="font-medium text-sm">Media Management</span>
                              </div>
                              <Switch defaultChecked />
                            </div>
                            <p className="text-xs text-muted-foreground">Media library and upload management</p>
                          </Card>
                        </div>
                      </div>

                      <Separator />

                      {/* SuperAdmin Dashboard Tab Controls */}
                      <div>
                        <h4 className="font-medium mb-4 flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          SuperAdmin Dashboard Tab Access (8+ Tabs)
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <Card className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                <span className="font-medium text-sm">User Management</span>
                              </div>
                              <Switch defaultChecked />
                            </div>
                            <p className="text-xs text-muted-foreground">Complete user account management</p>
                          </Card>

                          <Card className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <UserPlus className="h-4 w-4" />
                                <span className="font-medium text-sm">Assignment Management</span>
                              </div>
                              <Switch defaultChecked />
                            </div>
                            <p className="text-xs text-muted-foreground">Talent and role assignments</p>
                          </Card>

                          <Card className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Search className="h-4 w-4" />
                                <span className="font-medium text-sm">OppHub Scanner</span>
                              </div>
                              <Switch defaultChecked />
                            </div>
                            <p className="text-xs text-muted-foreground">Opportunity scanning and analysis</p>
                          </Card>

                          <Card className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <BarChart className="h-4 w-4" />
                                <span className="font-medium text-sm">Analytics & Revenue</span>
                              </div>
                              <Switch defaultChecked />
                            </div>
                            <p className="text-xs text-muted-foreground">Platform analytics and revenue tracking</p>
                          </Card>

                          <Card className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Database className="h-4 w-4" />
                                <span className="font-medium text-sm">Database Management</span>
                              </div>
                              <Switch defaultChecked />
                            </div>
                            <p className="text-xs text-muted-foreground">Database operations and backups</p>
                          </Card>

                          <Card className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                <span className="font-medium text-sm">Email & Communication</span>
                              </div>
                              <Switch defaultChecked />
                            </div>
                            <p className="text-xs text-muted-foreground">Newsletter and press release management</p>
                          </Card>

                          <Card className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Palette className="h-4 w-4" />
                                <span className="font-medium text-sm">Frontend Settings</span>
                              </div>
                              <Switch defaultChecked />
                            </div>
                            <p className="text-xs text-muted-foreground">WYSIWYG UI controls and branding</p>
                          </Card>

                          <Card className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Shield className="h-4 w-4" />
                                <span className="font-medium text-sm">Security & Antivirus</span>
                              </div>
                              <Switch defaultChecked />
                            </div>
                            <p className="text-xs text-muted-foreground">Security monitoring and protection</p>
                          </Card>
                        </div>
                      </div>

                      <Separator />

                      {/* Platform Feature Toggles */}
                      <div>
                        <h4 className="font-medium mb-4 flex items-center gap-2">
                          <Settings className="h-4 w-4" />
                          Platform-Wide Feature Controls
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <Card className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Eye className="h-4 w-4" />
                                <span className="font-medium text-sm">Demo Mode Control</span>
                              </div>
                              <Switch defaultChecked />
                            </div>
                            <p className="text-xs text-muted-foreground">Enable/disable demo account visibility</p>
                          </Card>

                          <Card className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <UserPlus className="h-4 w-4" />
                                <span className="font-medium text-sm">User Registration</span>
                              </div>
                              <Switch defaultChecked />
                            </div>
                            <p className="text-xs text-muted-foreground">Control new user registration</p>
                          </Card>

                          <Card className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span className="font-medium text-sm">Booking System</span>
                              </div>
                              <Switch defaultChecked />
                            </div>
                            <p className="text-xs text-muted-foreground">Enable/disable booking functionality</p>
                          </Card>

                          <Card className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4" />
                                <span className="font-medium text-sm">Maintenance Mode</span>
                              </div>
                              <Switch />
                            </div>
                            <p className="text-xs text-muted-foreground">Platform maintenance mode toggle</p>
                          </Card>

                          <Card className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Upload className="h-4 w-4" />
                                <span className="font-medium text-sm">File Uploads</span>
                              </div>
                              <Switch defaultChecked />
                            </div>
                            <p className="text-xs text-muted-foreground">Control file upload capabilities</p>
                          </Card>

                          <Card className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                <span className="font-medium text-sm">Email System</span>
                              </div>
                              <Switch defaultChecked />
                            </div>
                            <p className="text-xs text-muted-foreground">Email functionality control</p>
                          </Card>

                          <Card className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <BarChart className="h-4 w-4" />
                                <span className="font-medium text-sm">Analytics System</span>
                              </div>
                              <Switch defaultChecked />
                            </div>
                            <p className="text-xs text-muted-foreground">Platform analytics collection</p>
                          </Card>

                          <Card className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Search className="h-4 w-4" />
                                <span className="font-medium text-sm">OppHub Scanner</span>
                              </div>
                              <Switch defaultChecked />
                            </div>
                            <p className="text-xs text-muted-foreground">Opportunity scanning functionality</p>
                          </Card>
                        </div>
                      </div>

                      <Separator />

                      {/* Advanced System Overrides */}
                      <div>
                        <h4 className="font-medium mb-4 flex items-center gap-2">
                          <Crown className="h-4 w-4" />
                          Advanced System Override Controls
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <Card className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Settings className="h-4 w-4" />
                                <span className="font-medium text-sm">Toast Duration Override</span>
                              </div>
                              <Switch defaultChecked />
                            </div>
                            <p className="text-xs text-muted-foreground">Control toast timing (100ms-10000ms)</p>
                          </Card>

                          <Card className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4" />
                                <span className="font-medium text-sm">Platform Fee Control</span>
                              </div>
                              <Switch defaultChecked />
                            </div>
                            <p className="text-xs text-muted-foreground">Adjust platform commission rates</p>
                          </Card>

                          <Card className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Upload className="h-4 w-4" />
                                <span className="font-medium text-sm">File Size Limits</span>
                              </div>
                              <Switch defaultChecked />
                            </div>
                            <p className="text-xs text-muted-foreground">Configure upload size restrictions</p>
                          </Card>

                          <Card className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span className="font-medium text-sm">API Timeout Settings</span>
                              </div>
                              <Switch defaultChecked />
                            </div>
                            <p className="text-xs text-muted-foreground">Adjust API response timeouts</p>
                          </Card>

                          <Card className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Database className="h-4 w-4" />
                                <span className="font-medium text-sm">Database Backup Frequency</span>
                              </div>
                              <Switch defaultChecked />
                            </div>
                            <p className="text-xs text-muted-foreground">Control automated backup schedule</p>
                          </Card>

                          <Card className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4" />
                                <span className="font-medium text-sm">Emergency Shutdown</span>
                              </div>
                              <Switch />
                            </div>
                            <p className="text-xs text-muted-foreground">Emergency platform shutdown control</p>
                          </Card>
                        </div>
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Permission Template Actions</h4>
                          <p className="text-sm text-muted-foreground">Manage permission sets for this administrator</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">Save as Template</Button>
                          <Button variant="outline" size="sm">Load Template</Button>
                          <Button size="sm">Apply Changes</Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </TabsContent>

    {/* Create Role Tab */}
    <TabsContent value="create-role">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create Custom Role
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="role-name">Role Name *</Label>
                <Input
                  id="role-name"
                  placeholder="e.g., content_manager"
                  value={newRole.name}
                  onChange={(e) => setNewRole(prev => ({ ...prev, name: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Internal identifier (lowercase, underscores only)
                </p>
              </div>
              
              <div>
                <Label htmlFor="display-name">Display Name *</Label>
                <Input
                  id="display-name"
                  placeholder="e.g., Content Manager"
                  value={newRole.displayName}
                  onChange={(e) => setNewRole(prev => ({ ...prev, displayName: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe this role's purpose and responsibilities..."
                  value={newRole.description}
                  onChange={(e) => setNewRole(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="inherit-from">Inherit From</Label>
                <Select 
                  value={newRole.inheritFrom || ''} 
                  onValueChange={(value) => setNewRole(prev => ({ 
                    ...prev, 
                    inheritFrom: value || undefined 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select base role (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No inheritance</SelectItem>
                    {Array.isArray(dbRoles) && (dbRoles as any[]).map((role: any) => (
                      <SelectItem key={role.id} value={role.id.toString()}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label>Permissions</Label>
              <div className="border rounded-lg p-4 max-h-96 overflow-y-auto space-y-3">
                {Object.entries(
                  DASHBOARD_PERMISSIONS.reduce((acc, permission) => {
                    if (!acc[permission.category]) acc[permission.category] = [];
                    acc[permission.category].push(permission);
                    return acc;
                  }, {} as Record<string, typeof DASHBOARD_PERMISSIONS[0][]>)
                ).map(([category, permissions]) => (
                  <div key={category}>
                    <h4 className="font-medium capitalize mb-2">{category}</h4>
                    <div className="space-y-2 pl-2">
                      {permissions.map((permission) => (
                        <div key={permission.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={permission.id}
                            checked={newRole.permissions.includes(permission.id)}
                            onCheckedChange={() => handlePermissionToggle(permission.id)}
                          />
                          <Label htmlFor={permission.id} className="text-sm">
                            {permission.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button 
              onClick={handleCreateRole}
              disabled={createRoleMutation.isPending}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              {createRoleMutation.isPending ? 'Creating...' : 'Create Role'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setNewRole({
                name: '',
                displayName: '',
                description: '',
                permissions: [],
                inheritFrom: undefined
              })}
            >
              Clear Form
            </Button>
          </div>
        </CardContent>
      </Card>
    </TabsContent>

    {/* Assign Roles Tab */}
    <TabsContent value="assign-roles">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Assign Roles to Users
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Select User</Label>
              <Select 
                value={selectedUserId?.toString() || ''} 
                onValueChange={(value) => setSelectedUserId(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose user to assign role" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.fullName} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Select Role</Label>
              <Select 
                value={assignmentRoleId} 
                onValueChange={setAssignmentRoleId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose role to assign" />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(dbRoles) && dbRoles.map((role: any) => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {role.name}
                    </SelectItem>
                  ))}
                  {Array.isArray(customRoles) && customRoles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button 
            onClick={handleAssignRole}
            disabled={assignRoleMutation.isPending}
            className="flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            {assignRoleMutation.isPending ? 'Assigning...' : 'Assign Role'}
          </Button>
        </CardContent>
      </Card>
    </TabsContent>

    {/* Role Management Tab */}
    <TabsContent value="role-management">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Custom Role Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {customRoles.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No custom roles created yet. Use the "Create Role" tab to add custom roles.
              </p>
            ) : (
              customRoles.map((role) => (
                <Card key={role.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg">{role.displayName}</h3>
                        <p className="text-sm text-muted-foreground">{role.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{role.permissions.length} permissions</Badge>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => deleteRoleMutation.mutate(role.id)}
                          disabled={deleteRoleMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.map((permissionId) => {
                        const permission = DASHBOARD_PERMISSIONS.find(p => p.id === permissionId);
                        return (
                          <Badge key={permissionId} variant="secondary" className="text-xs">
                            {permission?.name || permissionId}
                          </Badge>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  </Tabs>


</div>
  );
};

export default UserAccessLevelManager;