import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';

// Icons
import { 
  Users, Music, DollarSign, Calendar, FileText, Settings,
  TrendingUp, MessageSquare, Shield, Award, Eye, Edit, Download,
  CheckCircle, XCircle, Clock, Star, Upload, Database, BarChart3,
  Mail, Newspaper, UserCheck, Globe, Headphones, CreditCard
} from 'lucide-react';

// Modal Components
import UserManagementModal from './modals/UserManagementModal';
import ContentModerationModal from './modals/ContentModerationModal';
import SystemConfigurationModal from './modals/SystemConfigurationModal';
import RevenueManagementModal from './modals/RevenueManagementModal';
import BookingApprovalModal from './modals/BookingApprovalModal';
import AnalyticsModal from './modals/AnalyticsModal';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  monthlyRevenue: number;
  pendingApprovals: number;
  activeBookings: number;
  contentItems: number;
  systemHealth: number;
}

interface PendingItem {
  id: number;
  type: 'booking' | 'content' | 'user' | 'payout';
  title: string;
  user: string;
  date: string;
  amount?: number;
  status: 'pending' | 'urgent';
}

export default function ComprehensiveAdminDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Fetch admin dashboard stats
  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/admin/dashboard-stats'],
    queryFn: async () => {
      const response = await apiRequest('/api/admin/dashboard-stats');
      return response as AdminStats;
    }
  });

  // Fetch pending items requiring admin attention
  const { data: pendingItems } = useQuery({
    queryKey: ['/api/admin/pending-items'],
    queryFn: async () => {
      const response = await apiRequest('/api/admin/pending-items');
      return response as PendingItem[];
    }
  });

  const openModal = (modalType: string, item?: any) => {
    setSelectedItem(item);
    setActiveModal(modalType);
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedItem(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Control Center</h1>
          <p className="text-muted-foreground">
            Comprehensive platform management and oversight dashboard
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-green-600">
            System Health: {stats?.systemHealth || 0}%
          </Badge>
          <Button onClick={() => openModal('system-config')} variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            System Config
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => openModal('user-management')}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{stats?.totalUsers || 0}</p>
                <p className="text-xs text-green-600">
                  {stats?.activeUsers || 0} active today
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => openModal('revenue-management')}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">${(stats?.totalRevenue || 0).toLocaleString()}</p>
                <p className="text-xs text-green-600">
                  +${(stats?.monthlyRevenue || 0).toLocaleString()} this month
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => openModal('booking-approvals')}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Approvals</p>
                <p className="text-2xl font-bold">{stats?.pendingApprovals || 0}</p>
                <p className="text-xs text-orange-600">
                  {stats?.activeBookings || 0} active bookings
                </p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => openModal('analytics')}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Content Items</p>
                <p className="text-2xl font-bold">{stats?.contentItems || 0}</p>
                <p className="text-xs text-purple-600">
                  Songs, albums, media
                </p>
              </div>
              <Music className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Management Sections */}
      <Tabs defaultValue="platform-oversight" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="platform-oversight">Platform Oversight</TabsTrigger>
          <TabsTrigger value="content-management">Content Management</TabsTrigger>
          <TabsTrigger value="user-administration">User Administration</TabsTrigger>
          <TabsTrigger value="system-operations">System Operations</TabsTrigger>
        </TabsList>

        {/* Platform Oversight Tab */}
        <TabsContent value="platform-oversight" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => openModal('booking-approvals')}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Booking Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Review and approve booking requests, manage pricing, and oversee event scheduling
                </p>
                <Button variant="outline" className="w-full">
                  <Eye className="w-4 h-4 mr-2" />
                  View Bookings
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => openModal('revenue-management')}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-green-600" />
                  Financial Oversight
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Monitor revenue streams, manage payouts, and oversee commission structures
                </p>
                <Button variant="outline" className="w-full">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Finances
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => openModal('content-moderation')}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="w-5 h-5 text-purple-600" />
                  Content Moderation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Review user-generated content, enforce community guidelines, and manage reports
                </p>
                <Button variant="outline" className="w-full">
                  <UserCheck className="w-4 h-4 mr-2" />
                  Review Content
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => openModal('talent-management')}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-600" />
                  Talent Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Oversee managed artists, review management applications, and track performance
                </p>
                <Button variant="outline" className="w-full">
                  <Award className="w-4 h-4 mr-2" />
                  Manage Talent
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => openModal('analytics')}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-600" />
                  Platform Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Advanced analytics, user behavior insights, and performance metrics
                </p>
                <Button variant="outline" className="w-full">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Analytics
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => openModal('communication-center')}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-pink-600" />
                  Communication Center
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Manage newsletters, press releases, and platform communications
                </p>
                <Button variant="outline" className="w-full">
                  <Mail className="w-4 h-4 mr-2" />
                  Communications
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Content Management Tab */}
        <TabsContent value="content-management" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => openModal('media-library')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Headphones className="w-5 h-5" />
                  Media Library Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Oversee music uploads, manage media files, and ensure content quality
                </p>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Music className="w-4 h-4 mr-2" />
                    Audio Files ({stats?.contentItems || 0})
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    Documents & Contracts
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => openModal('content-approval')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Content Approval Queue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Review pending content submissions and manage approval workflows
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Pending Reviews</span>
                    <Badge variant="secondary">{stats?.pendingApprovals || 0}</Badge>
                  </div>
                  <Button className="w-full">
                    Review Queue
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* User Administration Tab */}
        <TabsContent value="user-administration" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => openModal('user-management')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  User Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Users</span>
                    <span className="font-medium">{stats?.totalUsers || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Active Today</span>
                    <span className="font-medium text-green-600">{stats?.activeUsers || 0}</span>
                  </div>
                  <Button variant="outline" className="w-full mt-3">
                    Manage Users
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => openModal('role-management')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Role & Permissions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Manage user roles, permissions, and access levels
                </p>
                <Button variant="outline" className="w-full">
                  Configure Roles
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => openModal('security-monitoring')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Security Monitoring
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Monitor security events, manage access logs, and review alerts
                </p>
                <Button variant="outline" className="w-full">
                  Security Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* System Operations Tab */}
        <TabsContent value="system-operations" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => openModal('system-config')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  System Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">System Health</span>
                    <Badge variant="outline" className="text-green-600">
                      {stats?.systemHealth || 0}%
                    </Badge>
                  </div>
                  <Progress value={stats?.systemHealth || 0} className="h-2" />
                  <Button variant="outline" className="w-full">
                    Configure System
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => openModal('database-management')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Database Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Backup, restore, and optimize database operations
                </p>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Export Data
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    <Upload className="w-4 h-4 mr-2" />
                    Import Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Platform Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pendingItems?.slice(0, 5).map((item) => (
              <div 
                key={item.id} 
                className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                onClick={() => openModal(`${item.type}-detail`, item)}
              >
                <div className="flex items-center gap-3">
                  <Badge variant={item.status === 'urgent' ? 'destructive' : 'secondary'}>
                    {item.type}
                  </Badge>
                  <div>
                    <p className="font-medium text-sm">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.user} • {item.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {item.amount && (
                    <span className="text-sm font-medium">${item.amount.toLocaleString()}</span>
                  )}
                  <Button size="sm" variant="outline">
                    Review
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modal Renderers */}
      {activeModal === 'user-management' && (
        <UserManagementModal 
          isOpen={true} 
          onClose={closeModal}
          selectedUser={selectedItem}
        />
      )}
      
      {activeModal === 'content-moderation' && (
        <ContentModerationModal 
          isOpen={true} 
          onClose={closeModal}
          selectedContent={selectedItem}
        />
      )}
      
      {activeModal === 'system-config' && (
        <SystemConfigurationModal 
          isOpen={true} 
          onClose={closeModal}
        />
      )}
      
      {activeModal === 'revenue-management' && (
        <RevenueManagementModal 
          isOpen={true} 
          onClose={closeModal}
        />
      )}
      
      {activeModal === 'booking-approvals' && (
        <BookingApprovalModal 
          isOpen={true} 
          onClose={closeModal}
          selectedBooking={selectedItem}
        />
      )}
      
      {activeModal === 'analytics' && (
        <AnalyticsModal 
          isOpen={true} 
          onClose={closeModal}
        />
      )}
    </div>
  );
}