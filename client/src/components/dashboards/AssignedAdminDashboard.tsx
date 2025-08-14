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

// Icons
import { 
  Users, Music, DollarSign, Calendar, FileText, Settings,
  TrendingUp, MessageSquare, Shield, Award, Eye, Edit,
  CheckCircle, XCircle, Clock, Star, Download, Upload
} from 'lucide-react';

interface AssignedTalent {
  id: number;
  fullName: string;
  email: string;
  role: string;
  managementTier: string;
  lastActive: string;
  totalRevenue: number;
  activeBookings: number;
  pendingApprovals: number;
}

interface BookingApproval {
  id: number;
  talentName: string;
  eventName: string;
  eventDate: string;
  amount: number;
  status: 'pending' | 'approved' | 'declined';
  requiresApproval: boolean;
}

interface ContentApproval {
  id: number;
  talentName: string;
  contentType: 'song' | 'album' | 'press_release';
  title: string;
  status: 'pending' | 'approved' | 'declined';
  createdAt: string;
}

export default function AssignedAdminDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTalent, setSelectedTalent] = useState<AssignedTalent | null>(null);

  // Mock user ID for now - in real implementation this would come from auth context
  const currentUserId = 2; // Admin user ID

  // Fetch assigned talent users
  const { data: assignedTalent, isLoading: talentLoading } = useQuery({
    queryKey: ['/api/admin/assigned-talent', currentUserId],
    queryFn: async () => {
      const response = await apiRequest(`/api/admin/assigned-talent/${currentUserId}`);
      return response as AssignedTalent[];
    }
  });

  // Fetch pending approvals
  const { data: pendingBookings } = useQuery({
    queryKey: ['/api/admin/pending-bookings', currentUserId],
    queryFn: async () => {
      const response = await apiRequest(`/api/admin/pending-bookings/${currentUserId}`);
      return response as BookingApproval[];
    }
  });

  const { data: pendingContent } = useQuery({
    queryKey: ['/api/admin/pending-content', currentUserId],
    queryFn: async () => {
      const response = await apiRequest(`/api/admin/pending-content/${currentUserId}`);
      return response as ContentApproval[];
    }
  });

  // Fetch analytics for assigned talent
  const { data: talentAnalytics } = useQuery({
    queryKey: ['/api/admin/talent-analytics', currentUserId],
    queryFn: async () => {
      const response = await apiRequest(`/api/admin/talent-analytics/${currentUserId}`);
      return response;
    }
  });

  // Approval mutations
  const approveBookingMutation = useMutation({
    mutationFn: async ({ bookingId, approved }: { bookingId: number; approved: boolean }) => {
      return apiRequest(`/api/admin/approve-booking/${bookingId}`, {
        method: 'POST',
        body: JSON.stringify({ approved }),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Booking approval updated" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pending-bookings'] });
    }
  });

  const approveContentMutation = useMutation({
    mutationFn: async ({ contentId, approved }: { contentId: number; approved: boolean }) => {
      return apiRequest(`/api/admin/approve-content/${contentId}`, {
        method: 'POST',
        body: JSON.stringify({ approved }),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Content approval updated" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pending-content'] });
    }
  });

  // Revenue update mutation
  const updatePricingMutation = useMutation({
    mutationFn: async ({ talentId, pricing }: { talentId: number; pricing: any }) => {
      return apiRequest(`/api/admin/talent-pricing/${talentId}`, {
        method: 'PATCH',
        body: JSON.stringify(pricing),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Pricing updated successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/assigned-talent'] });
    }
  });

  const TalentOverviewCard = ({ talent }: { talent: AssignedTalent }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{talent.fullName}</CardTitle>
          <Badge variant="outline" className="capitalize">
            {talent.managementTier}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{talent.role}</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">${talent.totalRevenue.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Total Revenue</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{talent.activeBookings}</p>
            <p className="text-xs text-muted-foreground">Active Bookings</p>
          </div>
        </div>
        
        {talent.pendingApprovals > 0 && (
          <div className="flex items-center justify-center p-2 bg-yellow-50 rounded-lg mb-3">
            <Clock className="w-4 h-4 text-yellow-600 mr-2" />
            <span className="text-sm text-yellow-800">
              {talent.pendingApprovals} pending approval{talent.pendingApprovals > 1 ? 's' : ''}
            </span>
          </div>
        )}

        <div className="flex space-x-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1">
                <Eye className="w-4 h-4 mr-1" />
                View Details
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
              <DialogHeader>
                <DialogTitle>{talent.fullName} - Detailed Overview</DialogTitle>
              </DialogHeader>
              <TalentDetailModal talent={talent} />
            </DialogContent>
          </Dialog>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1">
                <Settings className="w-4 h-4 mr-1" />
                Manage
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Manage {talent.fullName}</DialogTitle>
              </DialogHeader>
              <TalentManagementModal talent={talent} onUpdate={updatePricingMutation.mutate} />
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );

  const TalentDetailModal = ({ talent }: { talent: AssignedTalent }) => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Email</Label>
          <p className="text-sm">{talent.email}</p>
        </div>
        <div>
          <Label>Last Active</Label>
          <p className="text-sm">{new Date(talent.lastActive).toLocaleDateString()}</p>
        </div>
        <div>
          <Label>Management Tier</Label>
          <Badge variant="outline" className="capitalize">{talent.managementTier}</Badge>
        </div>
        <div>
          <Label>Role</Label>
          <p className="text-sm capitalize">{talent.role.replace('_', ' ')}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <p className="text-xl font-bold">${talent.totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Total Revenue</p>
        </div>
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <p className="text-xl font-bold">{talent.activeBookings}</p>
          <p className="text-xs text-muted-foreground">Active Bookings</p>
        </div>
        <div className="text-center p-4 bg-yellow-50 rounded-lg">
          <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
          <p className="text-xl font-bold">{talent.pendingApprovals}</p>
          <p className="text-xs text-muted-foreground">Pending Approvals</p>
        </div>
      </div>
    </div>
  );

  const TalentManagementModal = ({ talent, onUpdate }: { talent: AssignedTalent; onUpdate: Function }) => {
    const [basePrice, setBasePrice] = useState('');
    const [discountPercentage, setDiscountPercentage] = useState('');
    const [notes, setNotes] = useState('');

    const handleSubmit = () => {
      onUpdate({
        talentId: talent.id,
        pricing: {
          basePrice: parseFloat(basePrice) || 0,
          discountPercentage: parseInt(discountPercentage) || 0,
          notes
        }
      });
    };

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="basePrice">Base Price ($)</Label>
            <Input
              id="basePrice"
              type="number"
              value={basePrice}
              onChange={(e) => setBasePrice(e.target.value)}
              placeholder="Enter base price"
            />
          </div>
          <div>
            <Label htmlFor="discount">Discount Percentage</Label>
            <Input
              id="discount"
              type="number"
              value={discountPercentage}
              onChange={(e) => setDiscountPercentage(e.target.value)}
              placeholder="0-100"
              max="100"
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="notes">Management Notes</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add management notes..."
            rows={3}
          />
        </div>
        
        <Button onClick={handleSubmit} className="w-full">
          Update Pricing & Settings
        </Button>
      </div>
    );
  };

  const ApprovalCard = ({ booking, onApprove }: { booking: BookingApproval; onApprove: Function }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="font-medium">{booking.eventName}</h4>
            <p className="text-sm text-muted-foreground">{booking.talentName}</p>
          </div>
          <Badge variant={booking.status === 'pending' ? 'default' : booking.status === 'approved' ? 'secondary' : 'destructive'}>
            {booking.status}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm">{new Date(booking.eventDate).toLocaleDateString()}</span>
          <span className="font-bold text-green-600">${booking.amount.toLocaleString()}</span>
        </div>
        
        {booking.status === 'pending' && (
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => onApprove({ bookingId: booking.id, approved: true })}
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => onApprove({ bookingId: booking.id, approved: false })}
            >
              <XCircle className="w-4 h-4 mr-1" />
              Decline
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (talentLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Assigned Talent Management</h1>
          <p className="text-muted-foreground">
            Managing {assignedTalent?.length || 0} assigned talent user{assignedTalent?.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          Admin Dashboard
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">{assignedTalent?.length || 0}</p>
            <p className="text-xs text-muted-foreground">Assigned Talent</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">{(pendingBookings?.length || 0) + (pendingContent?.length || 0)}</p>
            <p className="text-xs text-muted-foreground">Pending Approvals</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">
              ${assignedTalent?.reduce((sum, talent) => sum + talent.totalRevenue, 0).toLocaleString() || '0'}
            </p>
            <p className="text-xs text-muted-foreground">Total Revenue</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">
              {assignedTalent?.reduce((sum, talent) => sum + talent.activeBookings, 0) || 0}
            </p>
            <p className="text-xs text-muted-foreground">Active Bookings</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assignedTalent?.map((talent) => (
              <TalentOverviewCard key={talent.id} talent={talent} />
            ))}
          </div>
          
          {(!assignedTalent || assignedTalent.length === 0) && (
            <Card>
              <CardContent className="text-center py-8">
                <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No Assigned Talent</h3>
                <p className="text-muted-foreground">
                  You currently have no talent users assigned to you. Contact your superadmin to get assignments.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="bookings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Booking Approvals</CardTitle>
              <p className="text-sm text-muted-foreground">
                Review and approve bookings for your assigned talent
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingBookings?.map((booking) => (
                  <ApprovalCard
                    key={booking.id}
                    booking={booking}
                    onApprove={approveBookingMutation.mutate}
                  />
                ))}
              </div>
              
              {(!pendingBookings || pendingBookings.length === 0) && (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No pending booking approvals</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Approvals</CardTitle>
              <p className="text-sm text-muted-foreground">
                Review and approve content releases for your assigned talent
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingContent?.map((content) => (
                  <Card key={content.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{content.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {content.talentName} • {content.contentType}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => approveContentMutation.mutate({ contentId: content.id, approved: true })}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => approveContentMutation.mutate({ contentId: content.id, approved: false })}
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
              
              {(!pendingContent || pendingContent.length === 0) && (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No pending content approvals</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {assignedTalent?.map((talent) => (
                    <div key={talent.id} className="flex items-center justify-between p-2 border rounded">
                      <span className="font-medium">{talent.fullName}</span>
                      <span className="text-green-600 font-bold">
                        ${talent.totalRevenue.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Booking Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {assignedTalent?.map((talent) => (
                    <div key={talent.id} className="flex items-center justify-between p-2 border rounded">
                      <span className="font-medium">{talent.fullName}</span>
                      <span className="text-blue-600 font-bold">
                        {talent.activeBookings} active
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Admin Settings</CardTitle>
              <p className="text-sm text-muted-foreground">
                Configure your assigned admin preferences
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email alerts for pending approvals
                  </p>
                </div>
                <Switch />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-approve Low-value Bookings</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically approve bookings under $500
                  </p>
                </div>
                <Switch />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Weekly Reports</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive weekly performance summaries
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}