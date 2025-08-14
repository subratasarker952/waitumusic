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
  RefreshCw, Shield, ExternalLink, ArrowRight
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
}

interface OpportunityApplication {
  id: number;
  opportunityId: number;
  applicantUserId: number;
  coverLetter: string;
  portfolioLinks: string[];
  additionalInfo?: string;
  status: 'pending' | 'under_review' | 'accepted' | 'rejected';
  appliedAt: string;
}

interface OppHubSubscription {
  id: number;
  userId: number;
  subscriptionTier: 'publisher' | 'representation' | 'full_management';
  status: 'active' | 'cancelled' | 'expired';
  startDate: string;
  endDate?: string;
  applicationsUsed: number;
  maxApplications: number;
}

const OppHub = ({ userRoleId, userId }: { userRoleId: number; userId: number }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState('discover');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [applicationForm, setApplicationForm] = useState({
    coverLetter: '',
    portfolioLinks: [''],
    additionalInfo: ''
  });

  // Check if user is managed (gets free access) or admin
  const isManagedUser = [1, 2, 3, 5, 7].includes(userRoleId); // superadmin, admin, managed_artist, managed_musician, managed_professional
  const isAdminUser = [1, 2].includes(userRoleId); // superadmin, admin

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

  const { data: myApplications = [], isLoading: applicationsLoading } = useQuery({
    queryKey: ['/api/opportunity-applications', userId],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/opportunity-applications?applicantUserId=${userId}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) return [];
        return await response.json() || [];
      } catch (error) {
        console.error('Failed to fetch applications:', error);
        return [];
      }
    }
  });

  const { data: subscription, isLoading: subscriptionLoading } = useQuery({
    queryKey: ['/api/opphub-subscriptions/my-subscription'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/opphub-subscriptions/my-subscription', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) return null;
        return await response.json();
      } catch (error) {
        console.error('Failed to fetch subscription:', error);
        return null;
      }
    },
    enabled: !isManagedUser
  });

  // Mutations
  const applyMutation = useMutation({
    mutationFn: (applicationData: any) => fetch('/api/opportunity-applications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(applicationData)
    }).then(res => res.json()),
    onSuccess: () => {
      toast({ title: 'Application submitted successfully!' });
      setShowApplicationModal(false);
      setApplicationForm({ coverLetter: '', portfolioLinks: [''], additionalInfo: '' });
      queryClient.invalidateQueries({ queryKey: ['/api/opportunity-applications'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Application failed',
        description: error.message || 'Something went wrong',
        variant: 'destructive'
      });
    }
  });

  const subscribeMutation = useMutation({
    mutationFn: (subscriptionData: any) => fetch('/api/opphub-subscriptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(subscriptionData)
    }).then(res => res.json()),
    onSuccess: () => {
      toast({ title: 'Subscription created successfully!' });
      queryClient.invalidateQueries({ queryKey: ['/api/opphub-subscriptions/my-subscription'] });
    }
  });

  // Get category name by ID
  const getCategoryName = (categoryId: number) => {
    const category = Array.isArray(categories) ? categories.find((cat: OpportunityCategory) => cat.id === categoryId) : null;
    return category?.name || 'General';
  };

  // Filter opportunities based on search and category
  const filteredOpportunities = Array.isArray(opportunities) ? opportunities.filter((opp: Opportunity) => {
    const matchesSearch = opp.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.organizerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.organizer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (Array.isArray(opp.tags) && opp.tags.some(tag => tag?.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesCategory = selectedCategory === 'all' || opp.categoryId?.toString() === selectedCategory;

    return matchesSearch && matchesCategory;
  }) : [];

  const getCategoryIcon = (iconName: string) => {
    const icons: { [key: string]: any } = {
      'Music': Music,
      'Trophy': Trophy,
      'Target': Target,
      'Globe': Globe,
      'Camera': Camera,
      'Film': Film,
      'Briefcase': Briefcase,
      'Users': Users,
      'Star': Star,
      'DollarSign': DollarSign,
      'Crown': Crown,
      'Zap': Zap,
      'Heart': Heart,
      'music': Music,
      'film': Film,
      'camera': Camera,
      'briefcase': Briefcase,
      'target': Target,
      'globe': Globe
    };
    return icons[iconName] || Target;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'under_review': return 'bg-blue-100 text-blue-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCompensationIcon = (type: string) => {
    switch (type) {
      case 'paid': return <DollarSign className="w-4 h-4 text-green-600" />;
      case 'revenue_share': return <TrendingUp className="w-4 h-4 text-blue-600" />;
      case 'exposure': return <Eye className="w-4 h-4 text-purple-600" />;
      default: return <Heart className="w-4 h-4 text-gray-600" />;
    }
  };

  const handleApply = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity);
    setShowApplicationModal(true);
  };

  const submitApplication = () => {
    if (!selectedOpportunity) return;

    applyMutation.mutate({
      opportunityId: selectedOpportunity.id,
      coverLetter: applicationForm.coverLetter,
      portfolioLinks: applicationForm.portfolioLinks.filter(link => link.trim()),
      additionalInfo: applicationForm.additionalInfo
    });
  };

  const subscriptionTiers = [
    {
      name: 'Catalyst',
      tier: 'essential',
      price: '$4.99/month',
      applications: 10,
      icon: <Zap className="w-6 h-6" />,
      features: [
        'Global opportunity discovery (42+ sources)',
        'Up to 10 guided applications monthly',
        'Basic application guidance',
        'Weekly opportunity alerts',
        'Email support (48-hour response)',
        'Booking system access for non-managed talent'
      ]
    },
    {
      name: 'Accelerator',
      tier: 'professional',
      price: '$9.99/month',
      applications: -1,
      icon: <Rocket className="w-6 h-6" />,
      features: [
        'All Catalyst features included',
        'Unlimited guided applications',
        'Advanced career recommendations',
        'Monthly social media strategy generation',
        'Priority opportunity matching',
        'Live chat support (4-hour response)',
        'Enhanced booking priority placement'
      ]
    },
    {
      name: 'Powerhouse',
      tier: 'enterprise',
      price: '$19.99/month',
      applications: -1,
      icon: <Diamond className="w-6 h-6" />,
      features: [
        'All Accelerator features included',
        'Custom data analysis and insights',
        'Dedicated account manager',
        'API access and integrations',
        'White-label dashboard options',
        '24/7 phone support (1-hour response)',
        'Advanced business forecasting',
        'Multi-artist management (up to 10 artists)',
        'Premium booking placement and priority'
      ]
    }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto mobile-container py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Rocket className="w-8 h-8 text-emerald-600" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
            OppHub Marketplace
          </h1>
          <Zap className="w-8 h-8 text-cyan-600" />
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Professional opportunity discovery for music industry professionals. Find festivals, grants, sync licensing, and collaboration opportunities.
        </p>

        {isManagedUser && (
          <Alert className="bg-gradient-to-r from-emerald-50 to-cyan-50 border-emerald-200">
            <Crown className="h-4 w-4" />
            <AlertDescription className="font-medium">
              As a managed user, you have unlimited access to all OppHub features at no additional cost!
            </AlertDescription>
          </Alert>
        )}

        {/* Dynamic Opportunity Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-700">Active Opportunities</p>
                  <p className="text-2xl font-bold text-emerald-900">
                    {Array.isArray(opportunities) ? opportunities.filter(o => o.status === 'active').length : 0}
                  </p>
                </div>
                <Zap className="h-8 w-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">This Week</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {Array.isArray(opportunities) ? opportunities.filter(o => {
                      const createdDate = new Date(o.createdAt);
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      return createdDate >= weekAgo;
                    }).length : 0}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700">Verified Sources</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {Array.isArray(opportunities) ? new Set(opportunities.filter(o => o.isVerified).map(o => o.organizerName || o.organizer)).size : 0}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-700">Total Views</p>
                  <p className="text-2xl font-bold text-orange-900">
                    {Array.isArray(opportunities) ? opportunities.reduce((sum, o) => sum + (o.viewCount || 0), 0).toLocaleString() : '0'}
                  </p>
                </div>
                <Eye className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
          <TabsTrigger value="discover" className="text-xs sm:text-sm py-2 px-1 sm:px-3">
            <Search className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Discover</span>
            <span className="sm:hidden">Find</span>
          </TabsTrigger>
          <TabsTrigger value="applications" className="text-xs sm:text-sm py-2 px-1 sm:px-3">
            <Send className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">My Applications</span>
            <span className="sm:hidden">Apps</span>
          </TabsTrigger>
          <TabsTrigger value="subscription" className="text-xs sm:text-sm py-2 px-1 sm:px-3">
            <Crown className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Subscription</span>
            <span className="sm:hidden">Plan</span>
          </TabsTrigger>
          <TabsTrigger value="smart-matches" className="text-xs sm:text-sm py-2 px-1 sm:px-3">
            <Zap className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Smart Matches</span>
            <span className="sm:hidden">Match</span>
          </TabsTrigger>
        </TabsList>

        {/* Discover Tab */}
        <TabsContent value="discover" className="space-y-6">
          {/* Search and Filter */}
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search opportunities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full mobile-input"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48 mobile-input">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.length>0 &&categories?.map((category: OpportunityCategory) => (
                  <SelectItem
                    key={category.id ?? `cat-${Math.random()}`}
                    value={category.id ? String(category.id) : `temp-${Math.random()}`}
                  >
                    {category.name || "Unnamed"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={() => {
                queryClient.invalidateQueries({ queryKey: ['/api/opportunities'] });
                toast({ title: 'Refreshing opportunities...', description: 'Scanning for new opportunities from verified sources' });
              }}
              variant="outline"
              className="flex items-center gap-2 px-4"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>

          {/* Scanner Status Banner */}
          <Alert className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="font-medium">🛡️ Anti-Dummy Protection Active</span>
                <span className="text-sm text-blue-700">
                  | Scanning {Array.isArray(opportunities) ? opportunities.length : 0} verified opportunities from authentic music industry sources
                </span>
                {Array.isArray(opportunities) && opportunities.length > 0 && (
                  <span className="text-xs text-blue-600">
                    Last updated: {new Date(Math.max(...opportunities.map(o => new Date(o.updatedAt || o.createdAt).getTime()))).toLocaleString()}
                  </span>
                )}
              </div>
            </AlertDescription>
          </Alert>

          {/* Category Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category: OpportunityCategory) => {
              const IconComponent = getCategoryIcon(category.icon);
              return (
                <Card
                  key={category.id}
                  className={`cursor-pointer transition-all hover:shadow-lg ${selectedCategory === category.id.toString() ? 'ring-2 ring-emerald-500' : ''
                    }`}
                  onClick={() => setSelectedCategory(category.id.toString())}
                >
                  <CardContent className="p-4 text-center">
                    <IconComponent className="w-8 h-8 mx-auto mb-2 text-emerald-600" />
                    <h3 className="font-medium text-sm">{category.name}</h3>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Opportunities Grid */}
          {opportunitiesLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Discovering opportunities...</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredOpportunities.map((opportunity: Opportunity) => (
                <Card key={opportunity.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="text-lg line-clamp-2">{opportunity.title || 'Untitled Opportunity'}</CardTitle>
                      {opportunity.isVerified && (
                        <Badge variant="secondary" className="ml-2 bg-emerald-100 text-emerald-700">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                        {getCategoryName(opportunity.categoryId)}
                      </Badge>
                      {opportunity.isRemote && (
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                          Remote
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 font-medium">{opportunity.organizerName || opportunity.organizer || 'Verified Music Industry Source'}</p>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-700 line-clamp-3">{opportunity.description || 'No description available'}</p>

                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(opportunity.tags) && opportunity.tags.slice(0, 3).map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="space-y-2 text-xs text-gray-600">
                      <div className="flex items-center gap-2">
                        {getCompensationIcon(opportunity.compensationType || opportunity.compensation || 'Professional Opportunity')}
                        <span className="capitalize">
                          {opportunity.compensationType || opportunity.compensation || 'Professional Opportunity'}
                        </span>
                        {(opportunity.compensationRange || opportunity.compensationAmount) && (
                          <span className="font-medium">({opportunity.compensationRange || opportunity.compensationAmount})</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        <span>Deadline: {
                          opportunity.applicationDeadline
                            ? new Date(opportunity.applicationDeadline).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })
                            : opportunity.eventDate
                              ? `Event: ${new Date(opportunity.eventDate).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}`
                              : 'Open Application'
                        }</span>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {opportunity.viewCount || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {opportunity.applicationCount || 0}
                        </span>
                        {opportunity.isVerified && (
                          <span className="flex items-center gap-1 text-emerald-600">
                            <CheckCircle className="w-3 h-3" />
                            <span className="text-xs">Verified</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {isManagedUser && opportunity.sourceUrl && (
                        <Button
                          onClick={() => window.open(opportunity.sourceUrl, '_blank')}
                          variant="outline"
                          className="flex-1 border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Page
                        </Button>
                      )}
                      <Button
                        onClick={() => handleApply(opportunity)}
                        className={`${isManagedUser && opportunity.sourceUrl ? 'flex-1' : 'w-full'} bg-gradient-to-r from-emerald-600 to-cyan-600`}
                        disabled={opportunity.applicationDeadline ? new Date(opportunity.applicationDeadline) < new Date() : false}
                      >
                        {opportunity.applicationDeadline && new Date(opportunity.applicationDeadline) < new Date() ? 'Deadline Passed' :
                          isManagedUser ? 'Quick Apply' : 'Apply Now'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!opportunitiesLoading && filteredOpportunities.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No opportunities found</h3>
              <p className="text-gray-600">Try adjusting your search or category filter.</p>
            </div>
          )}
        </TabsContent>

        {/* My Applications Tab */}
        <TabsContent value="applications" className="space-y-6">
          {applicationsLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading applications...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Array.isArray(myApplications) && myApplications.map((application: OpportunityApplication) => (
                <Card key={application.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold">Application #{application.id}</h3>
                        <p className="text-sm text-gray-600">
                          Applied {application.appliedAt ? new Date(application.appliedAt).toLocaleDateString() : 'Unknown date'}
                        </p>
                      </div>
                      <Badge className={getStatusColor(application.status)}>
                        {application.status ? application.status.replace('_', ' ') : 'Unknown'}
                      </Badge>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-700">{application.coverLetter || 'No cover letter provided'}</p>
                    </div>

                    {Array.isArray(application.portfolioLinks) && application.portfolioLinks.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium text-sm mb-2">Portfolio Links:</h4>
                        <div className="space-y-1">
                          {application.portfolioLinks.map((link, idx) => (
                            <a
                              key={idx}
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline block"
                            >
                              {link}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!applicationsLoading && (!Array.isArray(myApplications) || myApplications.length === 0) && (
            <div className="text-center py-12">
              <Send className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
              <p className="text-gray-600">Start applying to opportunities to see them here.</p>
            </div>
          )}
        </TabsContent>

        {/* Subscription Tab */}
        <TabsContent value="subscription" className="space-y-6">
          {isManagedUser ? (
            <Card className="bg-gradient-to-r from-emerald-50 to-cyan-50 border-emerald-200">
              <CardContent className="p-8 text-center">
                <Crown className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-emerald-900 mb-2">Managed User Benefits</h2>
                <p className="text-emerald-700 mb-4">
                  As a managed user, you enjoy unlimited access to all OppHub features:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="text-emerald-700">
                    <CheckCircle className="w-5 h-5 mx-auto mb-2" />
                    <strong>Unlimited Applications</strong>
                  </div>
                  <div className="text-emerald-700">
                    <CheckCircle className="w-5 h-5 mx-auto mb-2" />
                    <strong>Premium AI Matching</strong>
                  </div>
                  <div className="text-emerald-700">
                    <CheckCircle className="w-5 h-5 mx-auto mb-2" />
                    <strong>Personal Scout Service</strong>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {subscription ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Your Current Subscription</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Tier:</span>
                        <Badge className="capitalize">{subscription.subscriptionTier.replace('_', ' ')}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Applications Used:</span>
                        <span>{subscription.applicationsUsed} / {subscription.maxApplications}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Status:</span>
                        <Badge className={subscription.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {subscription.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6 md:grid-cols-3">
                  {subscriptionTiers.map((tier) => (
                    <Card key={tier.tier} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="text-center">
                        <div className="flex justify-center mb-2">
                          {tier.icon}
                        </div>
                        <CardTitle className="text-xl">{tier.name}</CardTitle>
                        <div className="text-3xl font-bold text-emerald-600">{tier.price}</div>
                        <div className="text-sm text-gray-600">
                          {tier.applications === -1 ? 'Unlimited applications' : `${tier.applications} monthly applications`}
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <ul className="space-y-2 text-sm">
                          {tier.features.map((feature, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-emerald-600" />
                              {feature}
                            </li>
                          ))}
                        </ul>

                        <Button
                          onClick={() => subscribeMutation.mutate({
                            subscriptionTier: tier.tier,
                            status: 'active',
                            startDate: new Date().toISOString(),
                            applicationsUsed: 0,
                            maxApplications: tier.applications
                          })}
                          className="w-full"
                          disabled={subscribeMutation.isPending}
                        >
                          Subscribe Now
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* Smart Matches Tab */}
        <TabsContent value="smart-matches" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                Smart Opportunity Matching
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Rocket className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Smart Matching Coming Soon</h3>
                <p className="text-gray-600 mb-4">
                  Our system will analyze your profile, music style, and career goals to find the perfect opportunities for you.
                </p>
                <Button variant="outline" disabled>
                  Enable Smart Matching
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Application Modal */}
      <Dialog open={showApplicationModal} onOpenChange={setShowApplicationModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Apply to Opportunity</DialogTitle>
            <DialogDescription>
              {selectedOpportunity?.title} by {selectedOpportunity?.organizer}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Cover Letter *</label>
              <Textarea
                placeholder="Tell them why you're perfect for this opportunity..."
                value={applicationForm.coverLetter}
                onChange={(e) => setApplicationForm(prev => ({ ...prev, coverLetter: e.target.value }))}
                className="min-h-32"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Portfolio Links</label>
              {applicationForm.portfolioLinks.map((link, idx) => (
                <Input
                  key={idx}
                  placeholder="https://your-portfolio.com"
                  value={link}
                  onChange={(e) => {
                    const newLinks = [...applicationForm.portfolioLinks];
                    newLinks[idx] = e.target.value;
                    setApplicationForm(prev => ({ ...prev, portfolioLinks: newLinks }));
                  }}
                  className="mt-2"
                />
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setApplicationForm(prev => ({
                  ...prev,
                  portfolioLinks: [...prev.portfolioLinks, '']
                }))}
                className="mt-2"
              >
                Add Another Link
              </Button>
            </div>

            <div>
              <label className="text-sm font-medium">Additional Information</label>
              <Textarea
                placeholder="Any additional details you'd like to share..."
                value={applicationForm.additionalInfo}
                onChange={(e) => setApplicationForm(prev => ({ ...prev, additionalInfo: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApplicationModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={submitApplication}
              disabled={!applicationForm.coverLetter.trim() || applyMutation.isPending}
              className="bg-gradient-to-r from-emerald-600 to-cyan-600"
            >
              {applyMutation.isPending ? 'Submitting...' : 'Submit Application'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OppHub;