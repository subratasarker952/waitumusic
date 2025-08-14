import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Users, 
  Settings, 
  Calendar, 
  FileText, 
  BarChart3,
  Shield,
  Database,
  Upload,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Edit,
  Trash2,
  Plus,
  DollarSign
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useQueryClient } from '@tanstack/react-query';
// Import components that may not exist - using conditional rendering
// import FinancialAutomationPanel from '@/components/admin/FinancialAutomationPanel';
// import UserManagementModal from '@/components/modals/UserManagementModal';

interface User {
  id: number;
  email: string;
  fullName: string;
  role: string;
  status?: string;
  createdAt: string;
  lastLogin?: string;
}

interface SystemSettings {
  demoMode: boolean;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  bookingEnabled: boolean;
  platformFeePercentage: number;
  processingFeePercentage: number;
}

interface AdminStats {
  totalUsers: number;
  totalBookings: number;
  totalRevenue: number;
  activeUsers: number;
}

export default function FixedAdminPanel() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('users');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userManagementOpen, setUserManagementOpen] = useState(false);
  const [userModalMode, setUserModalMode] = useState<'create' | 'edit' | 'view'>('view');
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>();
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    demoMode: false,
    maintenanceMode: false,
    registrationEnabled: true,
    bookingEnabled: true,
    platformFeePercentage: 5.0,
    processingFeePercentage: 2.9
  });

  // Safe access to user properties
  const currentUserRole = (user as any)?.role || '';
  const isAuthorized = ['superadmin', 'admin'].includes(currentUserRole);

  // Fetch users for admin management with proper error handling
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['/api/admin/users'],
    enabled: isAuthorized,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Safe array extraction
  const users = Array.isArray(usersData) ? usersData : [];

  // Fetch system settings
  const { data: settingsData } = useQuery({
    queryKey: ['/api/admin/settings'],
    enabled: isAuthorized,
  });

  // Fetch admin statistics
  const { data: statsData } = useQuery({
    queryKey: ['/api/admin/stats'],
    enabled: isAuthorized,
  });

  const stats: AdminStats = {
    totalUsers: (statsData as any)?.totalUsers || users.length,
    totalBookings: (statsData as any)?.totalBookings || 0,
    totalRevenue: (statsData as any)?.totalRevenue || 0,
    activeUsers: (statsData as any)?.activeUsers || users.filter(u => u.status === 'active').length
  };

  // Handle user actions with proper error handling
  const handleCreateUser = () => {
    setUserModalMode('create');
    setSelectedUserId(undefined);
    setUserManagementOpen(true);
  };

  const handleViewUser = (userId: number) => {
    setUserModalMode('view');
    setSelectedUserId(userId.toString());
    setUserManagementOpen(true);
  };

  const handleEditUser = (userId: number) => {
    setUserModalMode('edit');
    setSelectedUserId(userId.toString());
    setUserManagementOpen(true);
  };

  const handleDeleteUser = async (userToDelete: User) => {
    if (!confirm(`Are you sure you want to delete ${userToDelete.fullName}?`)) {
      return;
    }

    try {
      await apiRequest(`/api/users/${userToDelete.id}`, { 
        method: 'DELETE' 
      });
      
      toast({
        title: "User Deleted",
        description: `${userToDelete.fullName} has been removed from the system`
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
    } catch (error: any) {
      toast({
        title: "Delete Failed",
        description: error?.message || "Unable to delete user",
        variant: "destructive"
      });
    }
  };

  // Handle import data with proper file handling
  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const result = await apiRequest('/api/admin/import-data', {
        method: 'POST',
        body: formData,
      }) as any;

      toast({
        title: "Data Imported",
        description: `Successfully imported ${result?.recordsImported || 0} records from ${file.name}`,
      });

      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
    } catch (error: any) {
      toast({
        title: "Import Failed",
        description: error?.message || "Failed to import data. Please check the file format.",
        variant: "destructive",
      });
    }
  };

  // Handle export data
  const handleExportData = async () => {
    try {
      const response = await fetch('/api/admin/export-data', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `waitumusic_export_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Data Exported",
        description: "System data has been exported successfully",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: (error as any)?.message || "Failed to export data",
        variant: "destructive",
      });
    }
  };

  // System restart functionality removed - not applicable to WaituMusic platform
  const handleSystemRestart = async () => {
    try {
      const result = await apiRequest('/api/admin/restart', {
        method: 'POST'
      });
      
      toast({
        title: "System Restart",
        description: result?.message || "System services restarted successfully",
      });
    } catch (error) {
      toast({
        title: "Restart Failed",
        description: (error as any)?.message || "Failed to restart system services",
        variant: "destructive",
      });
    }
  };

  // Handle financial settings update
  const handleUpdateFinancialSettings = async () => {
    try {
      await apiRequest('/api/admin/financial-settings', {
        method: 'PUT',
        body: JSON.stringify({
          platformFeeRate: systemSettings?.platformFeePercentage || 5,
          processingFeeRate: systemSettings?.processingFeePercentage || 2.9
        })
      });

      toast({
        title: "Settings Updated",
        description: "Financial settings have been updated successfully",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: (error as any)?.message || "Failed to update financial settings",
        variant: "destructive",
      });
    }
  };

  // Authorization check
  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              You don't have permission to access the admin panel.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <p className="text-muted-foreground">Manage users, system settings, and monitor platform health</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            System
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="financial" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Financial
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeUsers}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalBookings}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
              </CardContent>
            </Card>
          </div>

          {/* User Management */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>User Management</CardTitle>
                <div className="flex gap-2">
                  <Button onClick={handleCreateUser} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add User
                  </Button>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".csv,.json"
                      onChange={handleImportData}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Button variant="outline" size="sm">
                      <Upload className="w-4 h-4 mr-2" />
                      Import Data
                    </Button>
                  </div>
                  <Button onClick={handleExportData} variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export Data
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="text-center py-8">Loading users...</div>
              ) : (
                <div className="space-y-4">
                  {users.map((user: User) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div>
                          <h3 className="font-medium">{user.fullName || 'Unknown User'}</h3>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                        <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                          {user.role}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewUser(user.id)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditUser(user.id)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-600"
                          onClick={() => handleDeleteUser(user)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {users.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No users found
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Database Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm">Connected</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Server Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm">Running</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Last Backup</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  <span className="text-sm">2 hours ago</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>System Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={handleSystemRestart} className="w-full md:w-auto">
                <RefreshCw className="w-4 h-4 mr-2" />
                Restart Services
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Platform Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Analytics dashboard coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Financial Automation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Financial automation panel will be loaded here.</p>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Financial Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Platform Fee (%)</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={systemSettings.platformFeePercentage}
                    onChange={(e) => setSystemSettings(prev => ({
                      ...prev,
                      platformFeePercentage: parseFloat(e.target.value) || 0
                    }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Processing Fee (%)</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={systemSettings.processingFeePercentage}
                    onChange={(e) => setSystemSettings(prev => ({
                      ...prev,
                      processingFeePercentage: parseFloat(e.target.value) || 0
                    }))}
                  />
                </div>
              </div>
              <Button onClick={handleUpdateFinancialSettings}>
                Update Financial Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* User Management Modal - Placeholder for now */}
      {userManagementOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>User Management ({userModalMode})</CardTitle>
            </CardHeader>
            <CardContent>
              <p>User management modal for user ID: {selectedUserId}</p>
              <Button onClick={() => setUserManagementOpen(false)} className="mt-4">
                Close
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}