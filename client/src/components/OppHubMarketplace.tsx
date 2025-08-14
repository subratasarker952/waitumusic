import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Search, Target, Trophy, Calendar, DollarSign, Users, 
  TrendingUp, Globe, Music, Camera, Film, Briefcase,
  Crown, Star, Clock, CheckCircle, AlertCircle, XCircle,
  Zap, Rocket, Diamond, Filter, Eye, Send, Heart,
  RefreshCw, Shield, ExternalLink, ArrowRight, Plus,
  Building, UserCheck, CreditCard, MapPin
} from 'lucide-react';

interface OpportunityCategory {
  id: number;
  name: string;
  description: string;
  icon: string;
  isActive: boolean;
}

interface Opportunity {
  id: number;
  title: string;
  description: string;
  categoryId: number;
  organizer?: string;
  organizerName?: string;
  organizerEmail?: string;
  organizerWebsite?: string;
  applicationDeadline?: string;
  eventDate?: string;
  location?: string;
  isRemote?: boolean;
  compensationType?: 'paid' | 'unpaid' | 'revenue_share' | 'exposure';
  compensation?: string;
  compensationRange?: string;
  compensationAmount?: string;
  requirements?: any;
  tags?: string[];
  status?: 'active' | 'draft' | 'published' | 'closed';
  isVerified?: boolean;
  viewCount?: number;
  applicationCount?: number;
  createdAt?: string;
  updatedAt?: string;
  sourceUrl?: string;
  createdBy?: number;
  findersFeePct?: number;
  industryType?: string;
}

interface MarketplaceSubscription {
  id: number;
  userId: number;
  subscriptionTier: 'publisher' | 'representation' | 'full_management';
  status: 'active' | 'cancelled' | 'expired';
  monthlyFee: number;
  discount: number;
  startDate: string;
  endDate?: string;
}

interface AgentProfile {
  id: number;
  userId: number;
  isManaged: boolean;
  specializations: string[];
  commissionRate: number;
  opportunitiesPosted: number;
  successRate: number;
}

const OppHubMarketplace = ({ userRole, userId }: { userRole: string; userId: number }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState('discover');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [applicationForm, setApplicationForm] = useState({
    coverLetter: '',
    portfolioLinks: [''],
    additionalInfo: ''
  });

  // User type checks
  const isTalentUser = ['artist', 'musician', 'professional', 'managed_artist', 'managed_musician', 'managed_professional'].includes(userRole);
  const isAgentUser = userRole === 'professional'; // Agents are Professional sub-type
  // Use API to determine if user is managed based on role ID  
  const { data: userProfile } = useQuery({ queryKey: ['/api/user/profile'] });
  const { data: roles = [] } = useQuery({
    queryKey: ['/api/roles'],
    enabled: !!userProfile
  });
  
  const currentRole = (roles as any[]).find((role: any) => role.id === userProfile?.user?.roleId);
  const isManagedUser = currentRole?.isManaged || ['superadmin', 'admin'].includes(userRole);
  const isAdminUser = ['superadmin', 'admin'].includes(userRole);

  // Calculate subscription discount based on management tier
  const getSubscriptionDiscount = () => {
    if (userRole.includes('managed')) return 100; // Free access for fully managed
    if (userRole === 'representation') return 50; // 50% discount for representation tier
    if (userRole === 'publisher') return 10; // 10% discount for publisher tier
    return 0; // No discount for unmanaged users
  };

  // API Queries
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['/api/opportunity-categories'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/opportunity-categories', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) return [];
        return await response.json() || [];
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        return [];
      }
    }
  });

  const { data: opportunities = [], refetch: refetchOpportunities, isLoading: opportunitiesLoading } = useQuery({
    queryKey: ['/api/opportunities', selectedCategory],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (selectedCategory !== 'all') params.append('categoryId', selectedCategory);
        params.append('status', 'published');
        params.append('isVerified', 'true');
        
        const response = await fetch(`/api/opportunities?${params}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) return [];
        return await response.json() || [];
      } catch (error) {
        console.error('Failed to fetch opportunities:', error);
        return [];
      }
    }
  });

  const { data: subscription } = useQuery({
    queryKey: ['/api/marketplace/subscription', userId],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/marketplace/subscription/${userId}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) return null;
        return await response.json();
      } catch (error) {
        console.error('Failed to fetch subscription:', error);
        return null;
      }
    },
    enabled: isTalentUser
  });

  const { data: agentProfile } = useQuery({
    queryKey: ['/api/marketplace/agent-profile', userId],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/marketplace/agent-profile/${userId}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) return null;
        return await response.json();
      } catch (error) {
        console.error('Failed to fetch agent profile:', error);
        return null;
      }
    },
    enabled: isAgentUser
  });

  // Mutations
  const createOpportunityMutation = useMutation({
    mutationFn: async (opportunityData: any) => {
      const response = await fetch('/api/marketplace/opportunities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(opportunityData)
      });
      if (!response.ok) throw new Error('Failed to create opportunity');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Opportunity posted successfully!' });
      refetchOpportunities();
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to post opportunity', variant: 'destructive' });
    }
  });

  const applyToOpportunityMutation = useMutation({
    mutationFn: async (applicationData: any) => {
      const response = await fetch('/api/marketplace/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(applicationData)
      });
      if (!response.ok) throw new Error('Failed to submit application');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Application submitted successfully!' });
      setShowApplicationModal(false);
      setApplicationForm({ coverLetter: '', portfolioLinks: [''], additionalInfo: '' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to submit application', variant: 'destructive' });
    }
  });

  // Filter opportunities
  const filteredOpportunities = opportunities.filter((opp: Opportunity) => {
    const matchesCategory = selectedCategory === 'all' || opp.categoryId?.toString() === selectedCategory;
    const matchesSearch = !searchQuery || 
      opp.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.organizerName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryIcon = (categoryName: string) => {
    const iconMap: { [key: string]: any } = {
      'Music': Music,
      'Acting': Camera,
      'Film': Film,
      'Television': Film,
      'Modeling': Camera,
      'Voice-over': Music,
      'Dance': Trophy,
      'Theater': Trophy,
      'Writing': Briefcase,
      'Digital Content': Globe,
      'Collaborations': Users,
      'Competitions': Trophy,
      'Grants & Funding': DollarSign,
      'Music Festivals': Music,
      'PRO Services': Building,
      'Showcases': Star,
      'Sync Licensing': Globe
    };
    return iconMap[categoryName] || Target;
  };

  const renderDiscoveryTab = () => (
    <div className="space-y-6">
      {/* Marketplace Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <div className="relative">
            <Globe className="w-8 h-8 text-blue-600" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            OppHub Marketplace
          </h2>
          <Star className="w-6 h-6 text-yellow-500" />
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Comprehensive opportunities marketplace connecting talent users with professional agents across all creative industries
        </p>
      </div>

      {/* Subscription Status for Talent Users */}
      {isTalentUser && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CreditCard className="w-5 h-5 text-blue-600" />
                <div>
                  <h4 className="font-semibold text-blue-900">Marketplace Access</h4>
                  <p className="text-sm text-blue-700">
                    {subscription ? 
                      `Active subscription - ${subscription.subscriptionTier} tier` :
                      'No active subscription'
                    }
                  </p>
                </div>
              </div>
              {!subscription && (
                <Button 
                  onClick={() => setShowSubscriptionModal(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Subscribe Now
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search opportunities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger>
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category: OpportunityCategory) => (
              <SelectItem key={category.id} value={category.id.toString()}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button 
          onClick={() => refetchOpportunities()} 
          variant="outline"
          className="flex items-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Opportunities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {opportunitiesLoading ? (
          <div className="col-span-full text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading opportunities...</p>
          </div>
        ) : filteredOpportunities.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No opportunities found matching your criteria</p>
          </div>
        ) : (
          filteredOpportunities.map((opportunity: Opportunity) => {
            const category = categories.find((cat: OpportunityCategory) => cat.id === opportunity.categoryId);
            const IconComponent = getCategoryIcon(category?.name || '');
            
            return (
              <Card key={opportunity.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <IconComponent className="w-5 h-5 text-blue-600" />
                      <Badge variant="secondary">{category?.name || 'General'}</Badge>
                    </div>
                    {opportunity.isVerified && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                  <CardTitle className="text-lg">{opportunity.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4 line-clamp-3">{opportunity.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    {opportunity.organizerName && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Building className="w-4 h-4 text-gray-400" />
                        <span>{opportunity.organizerName}</span>
                      </div>
                    )}
                    {opportunity.location && (
                      <div className="flex items-center space-x-2 text-sm">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>{opportunity.location}</span>
                        {opportunity.isRemote && <Badge variant="outline">Remote</Badge>}
                      </div>
                    )}
                    {opportunity.applicationDeadline && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>Deadline: {new Date(opportunity.applicationDeadline).toLocaleDateString()}</span>
                      </div>
                    )}
                    {opportunity.compensation && (
                      <div className="flex items-center space-x-2 text-sm">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <span>{opportunity.compensation}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedOpportunity(opportunity);
                          setShowApplicationModal(true);
                        }}
                        disabled={!subscription && !isManagedUser}
                      >
                        Apply Now
                      </Button>
                      {(isManagedUser || isAdminUser) && opportunity.sourceUrl && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(opportunity.sourceUrl, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          View Page
                        </Button>
                      )}
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <Eye className="w-4 h-4" />
                      <span>{opportunity.viewCount || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );

  const renderAgentDashboard = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">Agent Dashboard</h3>
          <p className="text-gray-600">Manage your opportunities and commissions</p>
        </div>
        <Button onClick={() => setShowAgentModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Post Opportunity
        </Button>
      </div>

      {agentProfile && (
        <Card>
          <CardHeader>
            <CardTitle>Agent Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{agentProfile.opportunitiesPosted}</div>
                <div className="text-sm text-gray-600">Opportunities Posted</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{agentProfile.successRate}%</div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{agentProfile.commissionRate}%</div>
                <div className="text-sm text-gray-600">Commission Rate</div>
              </div>
              <div className="text-center">
                <Badge variant={agentProfile.isManaged ? "default" : "secondary"}>
                  {agentProfile.isManaged ? "Managed Agent" : "Standard Agent"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Agent's Posted Opportunities */}
      <Card>
        <CardHeader>
          <CardTitle>Your Posted Opportunities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Target className="w-12 h-12 mx-auto mb-4" />
            <p>No opportunities posted yet</p>
            <Button className="mt-4" onClick={() => setShowAgentModal(true)}>
              Post Your First Opportunity
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="discover">Discover Opportunities</TabsTrigger>
          {isAgentUser && <TabsTrigger value="agent">Agent Dashboard</TabsTrigger>}
          {isAdminUser && <TabsTrigger value="admin">Admin Panel</TabsTrigger>}
        </TabsList>

        <TabsContent value="discover">
          {renderDiscoveryTab()}
        </TabsContent>

        {isAgentUser && (
          <TabsContent value="agent">
            {renderAgentDashboard()}
          </TabsContent>
        )}

        {isAdminUser && (
          <TabsContent value="admin">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold">Marketplace Administration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6 text-center">
                    <Users className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                    <div className="text-2xl font-bold">{opportunities.length}</div>
                    <div className="text-sm text-gray-600">Active Opportunities</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <UserCheck className="w-8 h-8 mx-auto mb-2 text-green-600" />
                    <div className="text-2xl font-bold">0</div>
                    <div className="text-sm text-gray-600">Active Agents</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <CreditCard className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                    <div className="text-2xl font-bold">0</div>
                    <div className="text-sm text-gray-600">Active Subscriptions</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <DollarSign className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
                    <div className="text-2xl font-bold">$0</div>
                    <div className="text-sm text-gray-600">Monthly Revenue</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        )}
      </Tabs>

      {/* Application Modal */}
      <Dialog open={showApplicationModal} onOpenChange={setShowApplicationModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Apply to Opportunity</DialogTitle>
            <DialogDescription>
              Submit your application for "{selectedOpportunity?.title}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Cover Letter</label>
              <Textarea
                placeholder="Explain why you're the perfect fit for this opportunity..."
                value={applicationForm.coverLetter}
                onChange={(e) => setApplicationForm(prev => ({ ...prev, coverLetter: e.target.value }))}
                rows={4}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Portfolio Links</label>
              <Input
                placeholder="https://your-portfolio.com"
                value={applicationForm.portfolioLinks[0]}
                onChange={(e) => setApplicationForm(prev => ({ 
                  ...prev, 
                  portfolioLinks: [e.target.value] 
                }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Additional Information</label>
              <Textarea
                placeholder="Any additional information you'd like to share..."
                value={applicationForm.additionalInfo}
                onChange={(e) => setApplicationForm(prev => ({ ...prev, additionalInfo: e.target.value }))}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApplicationModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (selectedOpportunity) {
                  applyToOpportunityMutation.mutate({
                    opportunityId: selectedOpportunity.id,
                    ...applicationForm
                  });
                }
              }}
              disabled={applyToOpportunityMutation.isPending}
            >
              {applyToOpportunityMutation.isPending ? 'Submitting...' : 'Submit Application'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Subscription Modal */}
      <Dialog open={showSubscriptionModal} onOpenChange={setShowSubscriptionModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Marketplace Subscription</DialogTitle>
            <DialogDescription>
              Choose your subscription tier to access opportunities
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <Card className="border-2 border-blue-200">
                <CardContent className="p-4">
                  <h4 className="font-semibold">Standard Access</h4>
                  <p className="text-2xl font-bold">$49.99/month</p>
                  <p className="text-sm text-gray-600">Full marketplace access</p>
                  {getSubscriptionDiscount() > 0 && (
                    <Badge className="mt-2">{getSubscriptionDiscount()}% Discount Applied</Badge>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubscriptionModal(false)}>
              Cancel
            </Button>
            <Button>Subscribe Now</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OppHubMarketplace;