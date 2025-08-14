import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Globe, 
  Shield, 
  TrendingUp, 
  Search,
  Plus,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Users,
  DollarSign,
  Building,
  Lightbulb,
  UserCheck,
  Activity,
  Star,
  Crown,
  Music,
  Camera,
  Film,
  Trophy,
  Briefcase,
  Eye,
  ExternalLink,
  RefreshCw,
  CreditCard,
  MapPin,
  Calendar
} from 'lucide-react';

interface OppHubMarketplaceProps {
  userRole: string;
  userId: number;
}

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

export default function OppHubMarketplace({ userRole, userId }: OppHubMarketplaceProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState('overview');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showOpportunityModal, setShowOpportunityModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  // User type checks
  const isTalentUser = ['artist', 'musician', 'professional', 'managed_artist', 'managed_musician', 'managed_professional'].includes(userRole);
  const isAgentUser = userRole === 'professional';
  const isManagedUser = ['managed_artist', 'managed_musician', 'managed_professional', 'superadmin', 'admin'].includes(userRole);
  const isAdmin = ['superadmin', 'admin'].includes(userRole);

  // API Queries for marketplace functionality
  const { data: opportunities = [], refetch: refetchOpportunities } = useQuery({
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

  const { data: categories = [] } = useQuery({
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

  return (
    <div className="space-y-6">
      {/* OppHub Marketplace Header */}
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

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <Globe className="w-4 h-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="opportunities" className="flex items-center space-x-2">
            <Target className="w-4 h-4" />
            <span className="hidden sm:inline">Opportunities</span>
          </TabsTrigger>
          {isAgentUser && (
            <TabsTrigger value="agent" className="flex items-center space-x-2">
              <UserCheck className="w-4 h-4" />
              <span className="hidden sm:inline">Agent Panel</span>
            </TabsTrigger>
          )}
          {isAdmin && (
            <TabsTrigger value="admin" className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Admin</span>
            </TabsTrigger>
          )}
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Subscription Status for Talent Users */}
          {isTalentUser && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CreditCard className="w-6 h-6 text-blue-600" />
                    <div>
                      <h4 className="font-semibold text-blue-900">Marketplace Access</h4>
                      <p className="text-sm text-blue-700">
                        {subscription ? 
                          `Active subscription - ${subscription.subscriptionTier} tier` :
                          'No active subscription - Subscribe to access opportunities'
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

          {/* Recent Opportunities Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Eye className="w-5 h-5 text-gray-600" />
                  <span>Recent Opportunities</span>
                </div>
                <Button 
                  onClick={() => refetchOpportunities()} 
                  variant="outline" 
                  size="sm"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {opportunities.slice(0, 5).map((opportunity: Opportunity) => {
                  const category = categories.find((cat: OpportunityCategory) => cat.id === opportunity.categoryId);
                  const IconComponent = getCategoryIcon(category?.name || '');
                  
                  return (
                    <div key={opportunity.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <IconComponent className="w-5 h-5 text-blue-600" />
                        <div>
                          <h4 className="font-medium">{opportunity.title}</h4>
                          <p className="text-sm text-gray-600">{category?.name || 'General'}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {opportunity.isVerified && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                        <Badge variant="outline">{opportunity.compensationType || 'TBD'}</Badge>
                        {isManagedUser && opportunity.sourceUrl && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={opportunity.sourceUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-3 h-3 mr-1" />
                              View Page
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
                {opportunities.length === 0 && (
                  <div className="text-center py-6 text-gray-500">
                    <Target className="w-8 h-8 mx-auto mb-2" />
                    <p>No opportunities available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Opportunities Tab */}
        <TabsContent value="opportunities" className="space-y-6">
          {/* Category Filter */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-gray-500" />
              <Input
                placeholder="Search opportunities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category: OpportunityCategory) => (
                  <SelectItem key={category.id} value={category.id?category.id.toString():`category-${Math.random()}`}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Opportunities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {opportunities
              .filter((opp: Opportunity) => 
                searchQuery === '' || 
                opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                opp.description?.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((opportunity: Opportunity) => {
                const category = categories.find((cat: OpportunityCategory) => cat.id === opportunity.categoryId);
                const IconComponent = getCategoryIcon(category?.name || '');
                
                return (
                  <Card key={opportunity.id} className="border-2 hover:border-blue-200 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <IconComponent className="w-5 h-5 text-blue-600" />
                          <Badge variant="outline">{category?.name || 'General'}</Badge>
                        </div>
                        {opportunity.isVerified && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                      
                      <h4 className="font-semibold mb-2">{opportunity.title}</h4>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {opportunity.description}
                      </p>
                      
                      <div className="space-y-2 text-xs text-gray-500">
                        {opportunity.location && (
                          <div className="flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {opportunity.location}
                            {opportunity.isRemote && (
                              <Badge variant="secondary" className="ml-2 text-xs">Remote OK</Badge>
                            )}
                          </div>
                        )}
                        {opportunity.applicationDeadline && (
                          <div className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            Deadline: {new Date(opportunity.applicationDeadline).toLocaleDateString()}
                          </div>
                        )}
                        {opportunity.compensationType && (
                          <div className="flex items-center">
                            <DollarSign className="w-3 h-3 mr-1" />
                            {opportunity.compensationType.replace('_', ' ')}
                            {opportunity.compensation && `: ${opportunity.compensation}`}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <Eye className="w-3 h-3" />
                          <span>{opportunity.viewCount || 0}</span>
                          <Users className="w-3 h-3 ml-2" />
                          <span>{opportunity.applicationCount || 0}</span>
                        </div>
                        <div className="flex space-x-2">
                          {isManagedUser && opportunity.sourceUrl && (
                            <Button size="sm" variant="outline" asChild>
                              <a href={opportunity.sourceUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-3 h-3 mr-1" />
                                View
                              </a>
                            </Button>
                          )}
                          <Button size="sm">
                            Apply
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
          
          {opportunities.length === 0 && (
            <div className="text-center py-12">
              <Target className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">No opportunities found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search criteria or check back later</p>
              <Button onClick={() => refetchOpportunities()}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Opportunities
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Agent Panel Tab */}
        {isAgentUser && (
          <TabsContent value="agent" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold">Agent Dashboard</h3>
                <p className="text-gray-600">Manage your opportunities and commissions</p>
              </div>
              <Button onClick={() => setShowOpportunityModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Post Opportunity
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6 text-center">
                  <Target className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <div className="text-2xl font-bold">0</div>
                  <div className="text-sm text-gray-600">Opportunities Posted</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-600" />
                  <div className="text-2xl font-bold">0%</div>
                  <div className="text-sm text-gray-600">Success Rate</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <DollarSign className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                  <div className="text-2xl font-bold">0%</div>
                  <div className="text-sm text-gray-600">Commission Rate</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Crown className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
                  <div className="text-2xl font-bold">Standard</div>
                  <div className="text-sm text-gray-600">Agent Status</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Your Posted Opportunities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Target className="w-12 h-12 mx-auto mb-4" />
                  <p>No opportunities posted yet</p>
                  <Button className="mt-4" onClick={() => setShowOpportunityModal(true)}>
                    Post Your First Opportunity
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Admin Panel Tab */}
        {isAdmin && (
          <TabsContent value="admin" className="space-y-6">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold">Marketplace Administration</h3>
              <div className="text-center py-8 text-gray-500">
                <Building className="w-12 h-12 mx-auto mb-4" />
                <p>Admin controls coming soon</p>
              </div>
            </div>
          </TabsContent>
        )}
      </Tabs>

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
            <Card className="border-2 border-blue-200">
              <CardContent className="p-4">
                <h4 className="font-semibold">Standard Access</h4>
                <p className="text-2xl font-bold">$49.99/month</p>
                <p className="text-sm text-gray-600">Full marketplace access</p>
                {isManagedUser && (
                  <Badge className="mt-2">Management Tier Discount Applied</Badge>
                )}
              </CardContent>
            </Card>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubscriptionModal(false)}>
              Cancel
            </Button>
            <Button>Subscribe Now</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Opportunity Posting Modal */}
      <Dialog open={showOpportunityModal} onOpenChange={setShowOpportunityModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Post New Opportunity</DialogTitle>
            <DialogDescription>
              Create a new opportunity for talent users to apply to
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Opportunity Title</label>
              <Input placeholder="Enter opportunity title..." />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Textarea
                placeholder="Describe the opportunity..."
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category: OpportunityCategory) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Compensation Type</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="unpaid">Unpaid</SelectItem>
                    <SelectItem value="revenue_share">Revenue Share</SelectItem>
                    <SelectItem value="exposure">Exposure</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOpportunityModal(false)}>
              Cancel
            </Button>
            <Button>Post Opportunity</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
