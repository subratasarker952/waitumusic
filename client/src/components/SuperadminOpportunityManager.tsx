import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Eye, 
  Edit, 
  Trash2, 
  ExternalLink, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  DollarSign,
  Star,
  Shield,
  CheckCircle,
  AlertTriangle,
  Search
} from 'lucide-react';

interface Opportunity {
  id: number;
  title: string;
  description: string;
  source: string;
  url: string;
  deadline: string;
  amount: string;
  requirements: string;
  organizer_name?: string;
  contact_email?: string;
  contact_phone?: string;
  application_process?: string;
  credibility_score?: number;
  tags?: string;
  category_id?: number;
  location?: string;
  compensation_type?: string;
  verification_status?: string;
  discovery_method?: string;
  relevance_score?: number;
  created_at: string;
  updated_at: string;
}

export default function SuperadminOpportunityManager() {
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [credibilityFilter, setCredibilityFilter] = useState('all');
  
  const queryClient = useQueryClient();

  // Fetch opportunities
  const { data: opportunities = [], isLoading } = useQuery({
    queryKey: ['/api/opportunities'],
    queryFn: () => apiRequest('/api/opportunities')
  });

  // Ensure opportunities is always an array
  const opportunitiesArray = Array.isArray(opportunities) ? opportunities : [];

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['/api/opportunity-categories'],
    queryFn: () => apiRequest('/api/opportunity-categories')
  });

  // Update opportunity mutation
  const updateOpportunityMutation = useMutation({
    mutationFn: (data: { id: number; updates: Partial<Opportunity> }) =>
      apiRequest(`/api/opportunities/${data.id}`, {
        method: 'PATCH',
        body: data.updates
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/opportunities'] });
      setIsDetailModalOpen(false);
    }
  });

  // Delete opportunity mutation
  const deleteOpportunityMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest(`/api/opportunities/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/opportunities'] });
    }
  });

  // Filter opportunities - ensure opportunities is always an array
  const filteredOpportunities = opportunitiesArray.filter((opp: Opportunity) => {
    const matchesSearch = opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (opp.organizer_name || opp.source).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || opp.verification_status === statusFilter;
    
    const matchesCredibility = credibilityFilter === 'all' || 
      (credibilityFilter === 'high' && (opp.credibility_score || 0) >= 80) ||
      (credibilityFilter === 'medium' && (opp.credibility_score || 0) >= 60 && (opp.credibility_score || 0) < 80) ||
      (credibilityFilter === 'low' && (opp.credibility_score || 0) < 60);
    
    return matchesSearch && matchesStatus && matchesCredibility;
  });

  const getCredibilityBadge = (score: number = 0) => {
    if (score >= 80) return <Badge className="bg-green-100 text-green-800">High ({score})</Badge>;
    if (score >= 60) return <Badge className="bg-yellow-100 text-yellow-800">Medium ({score})</Badge>;
    return <Badge className="bg-red-100 text-red-800">Low ({score})</Badge>;
  };

  const getVerificationBadge = (status: string = 'pending') => {
    const badges = {
      'ai_verified': <Badge className="bg-blue-100 text-blue-800"><Shield className="w-3 h-3 mr-1" />AI Verified</Badge>,
      'manually_verified': <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Verified</Badge>,
      'pending': <Badge className="bg-gray-100 text-gray-800"><AlertTriangle className="w-3 h-3 mr-1" />Pending</Badge>,
      'flagged': <Badge className="bg-red-100 text-red-800">Flagged</Badge>
    };
    return badges[status] || badges['pending'];
  };

  const getCategoryName = (categoryId: number = 1) => {
    const category = categories.find((cat: any) => cat.id === categoryId);
    return category?.name || 'General';
  };

  const handleViewDetails = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity);
    setIsDetailModalOpen(true);
  };

  const handleUpdateCredibility = (opportunityId: number, newScore: number) => {
    updateOpportunityMutation.mutate({
      id: opportunityId,
      updates: { credibility_score: newScore }
    });
  };

  const handleUpdateVerification = (opportunityId: number, newStatus: string) => {
    updateOpportunityMutation.mutate({
      id: opportunityId,
      updates: { verification_status: newStatus }
    });
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading opportunities...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Opportunity Management</h2>
          <p className="text-gray-600">Review, verify, and manage discovered opportunities</p>
        </div>
        <div className="text-sm text-gray-500">
          {filteredOpportunities.length} of {opportunitiesArray.length} opportunities
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <Label htmlFor="search">Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="search"
              placeholder="Search opportunities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div>
          <Label>Verification Status</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="ai_verified">AI Verified</SelectItem>
              <SelectItem value="manually_verified">Manually Verified</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="flagged">Flagged</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Credibility Score</Label>
          <Select value={credibilityFilter} onValueChange={setCredibilityFilter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Scores</SelectItem>
              <SelectItem value="high">High (80+)</SelectItem>
              <SelectItem value="medium">Medium (60-79)</SelectItem>
              <SelectItem value="low">Low (&lt;60)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end">
          <Button variant="outline" className="w-full">
            <Eye className="w-4 h-4 mr-2" />
            Scan Status
          </Button>
        </div>
      </div>

      {/* Opportunities Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredOpportunities.map((opportunity: Opportunity) => (
          <Card key={opportunity.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg line-clamp-2">{opportunity.title}</CardTitle>
                <div className="flex gap-1">
                  {getCredibilityBadge(opportunity.credibility_score)}
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>{opportunity.organizer_name || opportunity.source}</span>
                {getVerificationBadge(opportunity.verification_status)}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-700 line-clamp-3">{opportunity.description}</p>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{opportunity.location || 'Various'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  <span>{opportunity.amount || '0'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(opportunity.deadline).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  <span>{getCategoryName(opportunity.category_id)}</span>
                </div>
              </div>

              {opportunity.tags && (
                <div className="flex flex-wrap gap-1">
                  {opportunity.tags.split(',').slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag.trim()}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" onClick={() => handleViewDetails(opportunity)}>
                  <Eye className="w-3 h-3 mr-1" />
                  Details
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <a href={opportunity.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Source
                  </a>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => deleteOpportunityMutation.mutate(opportunity.id)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed View Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedOpportunity && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">{selectedOpportunity.title}</DialogTitle>
                <div className="flex gap-2">
                  {getCredibilityBadge(selectedOpportunity.credibility_score)}
                  {getVerificationBadge(selectedOpportunity.verification_status)}
                </div>
              </DialogHeader>

              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="contact">Contact</TabsTrigger>
                  <TabsTrigger value="application">Application</TabsTrigger>
                  <TabsTrigger value="admin">Admin</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4">
                  <div>
                    <Label>Description</Label>
                    <p className="mt-1 p-3 bg-gray-50 rounded-md">{selectedOpportunity.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Source</Label>
                      <p className="mt-1">{selectedOpportunity.source}</p>
                    </div>
                    <div>
                      <Label>Organizer</Label>
                      <p className="mt-1">{selectedOpportunity.organizer_name || 'Not specified'}</p>
                    </div>
                    <div>
                      <Label>Location</Label>
                      <p className="mt-1">{selectedOpportunity.location || 'Various locations'}</p>
                    </div>
                    <div>
                      <Label>Compensation</Label>
                      <p className="mt-1">{selectedOpportunity.compensation_type} - {selectedOpportunity.amount}</p>
                    </div>
                  </div>

                  <div>
                    <Label>Requirements</Label>
                    <p className="mt-1 p-3 bg-gray-50 rounded-md">{selectedOpportunity.requirements}</p>
                  </div>
                </TabsContent>

                <TabsContent value="contact" className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <div>
                        <Label>Email</Label>
                        <p className="text-sm">{selectedOpportunity.contact_email || 'Not provided'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <div>
                        <Label>Phone</Label>
                        <p className="text-sm">{selectedOpportunity.contact_phone || 'Not provided'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <ExternalLink className="w-5 h-5 text-gray-400" />
                      <div>
                        <Label>Source URL</Label>
                        <a 
                          href={selectedOpportunity.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {selectedOpportunity.url}
                        </a>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="application" className="space-y-4">
                  <div>
                    <Label>Application Process</Label>
                    <div className="mt-1 p-3 bg-gray-50 rounded-md whitespace-pre-line">
                      {selectedOpportunity.application_process || 'No specific process provided'}
                    </div>
                  </div>

                  <div>
                    <Label>Deadline</Label>
                    <p className="mt-1">{new Date(selectedOpportunity.deadline).toLocaleDateString()}</p>
                  </div>

                  {selectedOpportunity.tags && (
                    <div>
                      <Label>Tags</Label>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {selectedOpportunity.tags.split(',').map((tag, index) => (
                          <Badge key={index} variant="secondary">
                            {tag.trim()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="admin" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Credibility Score</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-lg font-semibold">{selectedOpportunity.credibility_score}/100</span>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleUpdateCredibility(selectedOpportunity.id, Math.min((selectedOpportunity.credibility_score || 0) + 10, 100))}
                        >
                          +10
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleUpdateCredibility(selectedOpportunity.id, Math.max((selectedOpportunity.credibility_score || 0) - 10, 0))}
                        >
                          -10
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label>Verification Status</Label>
                      <Select 
                        value={selectedOpportunity.verification_status || 'pending'}
                        onValueChange={(value) => handleUpdateVerification(selectedOpportunity.id, value)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="ai_verified">AI Verified</SelectItem>
                          <SelectItem value="manually_verified">Manually Verified</SelectItem>
                          <SelectItem value="flagged">Flagged</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <Label>Discovery Method</Label>
                      <p className="mt-1">{selectedOpportunity.discovery_method}</p>
                    </div>
                    <div>
                      <Label>Relevance Score</Label>
                      <p className="mt-1">{selectedOpportunity.relevance_score}</p>
                    </div>
                    <div>
                      <Label>Created</Label>
                      <p className="mt-1">{new Date(selectedOpportunity.created_at).toLocaleString()}</p>
                    </div>
                    <div>
                      <Label>Updated</Label>
                      <p className="mt-1">{new Date(selectedOpportunity.updated_at).toLocaleString()}</p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}