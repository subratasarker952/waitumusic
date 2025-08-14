import React, { useState } from 'react';
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
  Search, MapPin, Calendar, DollarSign, Users, Clock, ExternalLink,
  Music, Camera, Film, Briefcase, Trophy, Globe, Star, Heart,
  Send, Eye, CheckCircle, AlertCircle, XCircle, Filter
} from 'lucide-react';

interface Opportunity {
  id: number;
  title: string;
  description: string;
  organizerName: string;
  organizerEmail?: string;
  organizerWebsite?: string;
  location: string;
  isRemote: boolean;
  eventDate?: string;
  applicationDeadline: string;
  compensationType: 'paid' | 'unpaid' | 'revenue_share' | 'exposure';
  compensation?: string;
  tags: string[];
  categoryId: number;
  viewCount: number;
  applicationCount: number;
  createdAt: string;
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

const OpportunitiesMarketplace = ({ userRoleId, userId }: { userRoleId: number; userId: number }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [compensationFilter, setCompensationFilter] = useState('all');
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [applicationForm, setApplicationForm] = useState({
    coverLetter: '',
    portfolioLinks: [''],
    additionalInfo: ''
  });
  
  // Create opportunity form state (for professionals only)
  const [createOpportunityForm, setCreateOpportunityForm] = useState({
    title: '',
    description: '',
    organizerName: '',
    organizerEmail: '',
    organizerWebsite: '',
    location: '',
    isRemote: false,
    eventDate: '',
    applicationDeadline: '',
    compensationType: 'paid' as 'paid' | 'unpaid' | 'revenue_share' | 'exposure',
    compensation: '',
    tags: '',
    categoryId: 1
  });
  
  const isProfessional = userRoleId === 8;

  // Fetch demo mode status
  const { data: demoModeData } = useQuery({
    queryKey: ['/api/demo-mode'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/demo-mode');
        if (!response.ok) return { demoMode: true };
        return await response.json();
      } catch (error) {
        return { demoMode: true };
      }
    }
  });

  // Fetch opportunities based on demo mode
  const { data: opportunities = [], isLoading: opportunitiesLoading } = useQuery({
    queryKey: ['/api/opportunities', demoModeData?.demoMode],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        params.append('status', 'published');
        params.append('isVerified', 'true');
        
        // Filter based on demo mode
        if (demoModeData?.demoMode) {
          params.append('is_demo', 'true');
        } else {
          params.append('is_demo', 'false');
        }
        
        const response = await fetch(`/api/opportunities?${params}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) return [];
        return await response.json() || [];
      } catch (error) {
        console.error('Failed to fetch opportunities:', error);
        return [];
      }
    },
    enabled: !!demoModeData
  });

  // Fetch user's applications based on demo mode
  const { data: myApplications = [] } = useQuery({
    queryKey: ['/api/opportunity-applications', userId, demoModeData?.demoMode],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        params.append('applicantUserId', userId.toString());
        
        // Filter based on demo mode
        if (demoModeData?.demoMode) {
          params.append('is_demo', 'true');
        } else {
          params.append('is_demo', 'false');
        }
        
        const response = await fetch(`/api/opportunity-applications?${params}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) return [];
        return await response.json() || [];
      } catch (error) {
        console.error('Failed to fetch applications:', error);
        return [];
      }
    },
    enabled: !!demoModeData
  });

  // Apply to opportunity mutation
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

  // Create opportunity mutation (for professionals only)
  const createOpportunityMutation = useMutation({
    mutationFn: (opportunityData: any) => fetch('/api/opportunities', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        ...opportunityData,
        tags: opportunityData.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean),
        isDemo: demoModeData?.demoMode || false,
        createdBy: userId
      })
    }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/opportunities'] });
      setCreateOpportunityForm({
        title: '',
        description: '',
        organizerName: '',
        organizerEmail: '',
        organizerWebsite: '',
        location: '',
        isRemote: false,
        eventDate: '',
        applicationDeadline: '',
        compensationType: 'paid',
        compensation: '',
        tags: '',
        categoryId: 1
      });
      toast({ title: "Opportunity created successfully!" });
      setSelectedTab('browse');
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create opportunity",
        description: error.message || "Please try again later",
        variant: "destructive"
      });
    }
  });

  // Filter opportunities
  const filteredOpportunities = opportunities.filter((opp: Opportunity) => {
    const matchesSearch = opp.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.organizerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.tags?.some(tag => tag?.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesLocation = locationFilter === 'all' || 
      (locationFilter === 'remote' && opp.isRemote) ||
      (locationFilter === 'in-person' && !opp.isRemote) ||
      opp.location?.toLowerCase().includes(locationFilter.toLowerCase());
    
    const matchesCompensation = compensationFilter === 'all' || opp.compensationType === compensationFilter;
    
    return matchesSearch && matchesLocation && matchesCompensation;
  });

  const getCompensationDisplay = (opp: Opportunity) => {
    switch (opp.compensationType) {
      case 'paid': return { text: opp.compensation || 'Paid', color: 'text-green-600', bg: 'bg-green-50' };
      case 'revenue_share': return { text: 'Revenue Share', color: 'text-blue-600', bg: 'bg-blue-50' };
      case 'exposure': return { text: 'Exposure', color: 'text-purple-600', bg: 'bg-purple-50' };
      default: return { text: 'Volunteer', color: 'text-gray-600', bg: 'bg-gray-50' };
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      under_review: 'bg-blue-100 text-blue-800', 
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const hasApplied = (opportunityId: number) => {
    return myApplications.some((app: OpportunityApplication) => app.opportunityId === opportunityId);
  };

  const handleApply = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity);
    setShowApplicationModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short', 
      day: 'numeric'
    });
  };

  const isDeadlinePassed = (deadline: string) => {
    return new Date(deadline) < new Date();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
            Music Industry Opportunities
          </h1>
          {demoModeData?.demoMode && (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
              Demo Mode
            </Badge>
          )}
        </div>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Discover gigs, collaborations, competitions, and career opportunities in the music industry. 
          Browse real opportunities posted by venues, labels, producers, and industry professionals.
          {demoModeData?.demoMode && (
            <span className="block mt-2 text-sm text-yellow-600 dark:text-yellow-400">
              Currently showing demo opportunities for testing and exploration.
            </span>
          )}
        </p>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className={`grid w-full ${isProfessional ? 'grid-cols-3' : 'grid-cols-2'}`}>
          <TabsTrigger value="browse" className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            Browse Opportunities
          </TabsTrigger>
          <TabsTrigger value="applications" className="flex items-center gap-2">
            <Send className="w-4 h-4" />
            My Applications ({myApplications.length})
          </TabsTrigger>
          {isProfessional && (
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Create Opportunity
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="browse" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search opportunities..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    <SelectItem value="remote">Remote</SelectItem>
                    <SelectItem value="in-person">In Person</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={compensationFilter} onValueChange={setCompensationFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Compensation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="revenue_share">Revenue Share</SelectItem>
                    <SelectItem value="exposure">Exposure</SelectItem>
                    <SelectItem value="unpaid">Volunteer</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={() => {
                  setSearchQuery('');
                  setLocationFilter('all');
                  setCompensationFilter('all');
                }}>
                  <Filter className="w-4 h-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Opportunities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {opportunitiesLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))
            ) : filteredOpportunities.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-xl text-gray-500 mb-2">No opportunities found</p>
                <p className="text-gray-400">Try adjusting your search filters</p>
              </div>
            ) : (
              filteredOpportunities.map((opportunity: Opportunity) => {
                const compensation = getCompensationDisplay(opportunity);
                const applied = hasApplied(opportunity.id);
                const expired = isDeadlinePassed(opportunity.applicationDeadline);
                
                return (
                  <Card key={opportunity.id} className="hover:shadow-lg transition-shadow duration-200">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <h3 className="text-lg font-semibold line-clamp-2">{opportunity.title}</h3>
                          <Badge className={`${compensation.bg} ${compensation.color} border-0`}>
                            {compensation.text}
                          </Badge>
                        </div>

                        <p className="text-gray-600 text-sm line-clamp-3">{opportunity.description}</p>

                        <div className="space-y-2 text-sm text-gray-500">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span>{opportunity.organizerName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{opportunity.isRemote ? 'Remote' : opportunity.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>Apply by {formatDate(opportunity.applicationDeadline)}</span>
                          </div>
                        </div>

                        {opportunity.tags && opportunity.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {opportunity.tags.slice(0, 3).map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {opportunity.tags.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{opportunity.tags.length - 3} more
                              </Badge>
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-4 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {opportunity.viewCount || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <Send className="w-3 h-3" />
                              {opportunity.applicationCount || 0} applied
                            </span>
                          </div>
                          
                          {applied ? (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Applied
                            </Badge>
                          ) : expired ? (
                            <Badge variant="secondary" className="bg-red-100 text-red-800">
                              <XCircle className="w-3 h-3 mr-1" />
                              Expired
                            </Badge>
                          ) : (
                            <Button 
                              size="sm" 
                              onClick={() => handleApply(opportunity)}
                              disabled={applyMutation.isPending}
                            >
                              Apply Now
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        <TabsContent value="applications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>My Applications</CardTitle>
            </CardHeader>
            <CardContent>
              {myApplications.length === 0 ? (
                <div className="text-center py-8">
                  <Send className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-xl text-gray-500 mb-2">No applications yet</p>
                  <p className="text-gray-400">Browse opportunities and start applying!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myApplications.map((application: OpportunityApplication) => {
                    const opportunity = opportunities.find((opp: Opportunity) => opp.id === application.opportunityId);
                    if (!opportunity) return null;

                    return (
                      <div key={application.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium">{opportunity.title}</h4>
                          <Badge className={getStatusBadge(application.status)}>
                            {application.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{opportunity.organizerName}</p>
                        <p className="text-xs text-gray-500">
                          Applied on {formatDate(application.appliedAt)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Create Opportunity Tab (Professionals Only) */}
        {isProfessional && (
          <TabsContent value="create" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Create New Opportunity
                </CardTitle>
                <p className="text-gray-600">Post a new opportunity to the marketplace for other professionals to discover.</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Opportunity Title *</label>
                    <Input
                      placeholder="e.g., Lead Guitarist Needed for Tour"
                      value={createOpportunityForm.title}
                      onChange={(e) => setCreateOpportunityForm(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Organizer Name *</label>
                    <Input
                      placeholder="Your name or organization"
                      value={createOpportunityForm.organizerName}
                      onChange={(e) => setCreateOpportunityForm(prev => ({ ...prev, organizerName: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Description *</label>
                  <Textarea
                    placeholder="Describe the opportunity, requirements, and what you're looking for..."
                    value={createOpportunityForm.description}
                    onChange={(e) => setCreateOpportunityForm(prev => ({ ...prev, description: e.target.value }))}
                    className="min-h-[120px]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Contact Email *</label>
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={createOpportunityForm.organizerEmail}
                      onChange={(e) => setCreateOpportunityForm(prev => ({ ...prev, organizerEmail: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Website (Optional)</label>
                    <Input
                      placeholder="https://your-website.com"
                      value={createOpportunityForm.organizerWebsite}
                      onChange={(e) => setCreateOpportunityForm(prev => ({ ...prev, organizerWebsite: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Location</label>
                    <Input
                      placeholder="City, State or Remote"
                      value={createOpportunityForm.location}
                      onChange={(e) => setCreateOpportunityForm(prev => ({ ...prev, location: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Event Date (Optional)</label>
                    <Input
                      type="date"
                      value={createOpportunityForm.eventDate}
                      onChange={(e) => setCreateOpportunityForm(prev => ({ ...prev, eventDate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Application Deadline *</label>
                    <Input
                      type="date"
                      value={createOpportunityForm.applicationDeadline}
                      onChange={(e) => setCreateOpportunityForm(prev => ({ ...prev, applicationDeadline: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Compensation Type *</label>
                    <Select 
                      value={createOpportunityForm.compensationType} 
                      onValueChange={(value: 'paid' | 'unpaid' | 'revenue_share' | 'exposure') => 
                        setCreateOpportunityForm(prev => ({ ...prev, compensationType: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="unpaid">Volunteer/Unpaid</SelectItem>
                        <SelectItem value="revenue_share">Revenue Share</SelectItem>
                        <SelectItem value="exposure">Exposure/Experience</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {createOpportunityForm.compensationType === 'paid' && (
                    <div>
                      <label className="text-sm font-medium mb-2 block">Compensation Details</label>
                      <Input
                        placeholder="e.g., $500/day, $50/hour"
                        value={createOpportunityForm.compensation}
                        onChange={(e) => setCreateOpportunityForm(prev => ({ ...prev, compensation: e.target.value }))}
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isRemote"
                    checked={createOpportunityForm.isRemote}
                    onChange={(e) => setCreateOpportunityForm(prev => ({ ...prev, isRemote: e.target.checked }))}
                    className="rounded"
                  />
                  <label htmlFor="isRemote" className="text-sm font-medium">Remote opportunity</label>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Tags (comma-separated)</label>
                  <Input
                    placeholder="e.g., guitar, rock, touring, experienced"
                    value={createOpportunityForm.tags}
                    onChange={(e) => setCreateOpportunityForm(prev => ({ ...prev, tags: e.target.value }))}
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedTab('browse')}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => createOpportunityMutation.mutate(createOpportunityForm)}
                    disabled={
                      !createOpportunityForm.title.trim() || 
                      !createOpportunityForm.description.trim() || 
                      !createOpportunityForm.organizerName.trim() ||
                      !createOpportunityForm.organizerEmail.trim() ||
                      !createOpportunityForm.applicationDeadline ||
                      createOpportunityMutation.isPending
                    }
                  >
                    {createOpportunityMutation.isPending ? 'Creating...' : 'Create Opportunity'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Application Modal */}
      <Dialog open={showApplicationModal} onOpenChange={setShowApplicationModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Apply to {selectedOpportunity?.title}</DialogTitle>
            <DialogDescription>
              Complete your application to {selectedOpportunity?.organizerName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Cover Letter *</label>
              <Textarea
                placeholder="Tell them why you're perfect for this opportunity..."
                value={applicationForm.coverLetter}
                onChange={(e) => setApplicationForm(prev => ({ ...prev, coverLetter: e.target.value }))}
                className="min-h-[120px]"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Portfolio Links</label>
              {applicationForm.portfolioLinks.map((link, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input
                    placeholder="https://your-portfolio-link.com"
                    value={link}
                    onChange={(e) => {
                      const newLinks = [...applicationForm.portfolioLinks];
                      newLinks[index] = e.target.value;
                      setApplicationForm(prev => ({ ...prev, portfolioLinks: newLinks }));
                    }}
                  />
                  {index === applicationForm.portfolioLinks.length - 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setApplicationForm(prev => ({ 
                        ...prev, 
                        portfolioLinks: [...prev.portfolioLinks, ''] 
                      }))}
                    >
                      Add Link
                    </Button>
                  )}
                </div>
              ))}
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Additional Information</label>
              <Textarea
                placeholder="Any additional details you'd like to share..."
                value={applicationForm.additionalInfo}
                onChange={(e) => setApplicationForm(prev => ({ ...prev, additionalInfo: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowApplicationModal(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (!selectedOpportunity) return;
                applyMutation.mutate({
                  opportunityId: selectedOpportunity.id,
                  coverLetter: applicationForm.coverLetter,
                  portfolioLinks: applicationForm.portfolioLinks.filter(link => link.trim()),
                  additionalInfo: applicationForm.additionalInfo
                });
              }}
              disabled={!applicationForm.coverLetter.trim() || applyMutation.isPending}
            >
              {applyMutation.isPending ? 'Submitting...' : 'Submit Application'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OpportunitiesMarketplace;