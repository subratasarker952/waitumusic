import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Mail, Users, Plus, Send, Calendar, BarChart3, Globe, Building2, Star, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface Curator {
  id?: number;
  name: string;
  email: string;
  organization?: string;
  website?: string;
  socialMediaHandles?: Array<{ platform: string; handle: string }>;
  genres?: string[];
  regions?: string[];
  platforms?: string[];
  audienceSize?: number;
  influenceScore?: number;
  preferredContactMethod?: string;
  submissionGuidelines?: string;
  responseRate?: number;
  averageResponseTime?: number;
  relationshipStatus?: string;
  lastContactedAt?: string;
  totalSubmissions?: number;
  successfulPlacements?: number;
}

interface CuratorSubmission {
  id?: number;
  curatorId: number;
  songId?: number;
  albumId?: number;
  releaseType: string;
  submissionDate: string;
  submissionStrategy: string;
  daysSinceRelease: number;
  subject: string;
  message: string;
  personalizedNote?: string;
  status: string;
  curatorResponse?: string;
  responseDate?: string;
  placementUrl?: string;
  followUpCount: number;
  linkClicks: number;
  // Curator info joined
  curatorName?: string;
  curatorEmail?: string;
  curatorOrganization?: string;
}

interface CuratorManagementProps {
  releaseType?: 'songs' | 'albums';
  releaseId?: number;
  releaseName?: string;
  artistName?: string;
}

export function CuratorManagement({ releaseType, releaseId, releaseName, artistName }: CuratorManagementProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [curators, setCurators] = useState<Curator[]>([]);
  const [submissions, setSubmissions] = useState<CuratorSubmission[]>([]);
  const [activeTab, setActiveTab] = useState<'curators' | 'submissions' | 'campaigns'>('curators');
  const [loading, setLoading] = useState(false);
  
  const [newCurator, setNewCurator] = useState<Curator>({
    name: '',
    email: '',
    organization: '',
    website: '',
    socialMediaHandles: [],
    genres: [],
    regions: [],
    platforms: [],
    audienceSize: undefined,
    influenceScore: 50,
    preferredContactMethod: 'email',
    submissionGuidelines: '',
    relationshipStatus: 'new'
  });

  const [newSubmission, setNewSubmission] = useState<Partial<CuratorSubmission>>({
    releaseType: releaseType === 'songs' ? 'single' : 'album',
    submissionStrategy: 'post_fan_release',
    daysSinceRelease: 7,
    subject: '',
    message: '',
    personalizedNote: '',
    followUpCount: 0,
    linkClicks: 0
  });

  // Load curators and submissions when modal opens
  useEffect(() => {
    if (isOpen) {
      loadCurators();
      if (releaseType && releaseId) {
        loadSubmissions();
      }
    }
  }, [isOpen, releaseType, releaseId]);

  const loadCurators = async () => {
    setLoading(true);
    try {
      const response = await apiRequest('/api/curators');
      setCurators(response || []);
    } catch (error) {
      console.error('Error loading curators:', error);
      toast({
        title: "Error",
        description: "Failed to load curators",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSubmissions = async () => {
    if (!releaseType || !releaseId) return;
    
    try {
      const response = await apiRequest(`/api/releases/${releaseType}/${releaseId}/curator-submissions`);
      setSubmissions(response || []);
    } catch (error) {
      console.error('Error loading submissions:', error);
      toast({
        title: "Error",
        description: "Failed to load submissions",
        variant: "destructive"
      });
    }
  };

  const createCurator = async () => {
    try {
      const curator = await apiRequest('/api/curators', {
        method: 'POST',
        body: newCurator
      });
      
      setCurators(prev => [...prev, curator]);
      setNewCurator({
        name: '',
        email: '',
        organization: '',
        website: '',
        socialMediaHandles: [],
        genres: [],
        regions: [],
        platforms: [],
        audienceSize: undefined,
        influenceScore: 50,
        preferredContactMethod: 'email',
        submissionGuidelines: '',
        relationshipStatus: 'new'
      });
      
      toast({
        title: "Curator Added",
        description: "New curator has been added to the database"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add curator",
        variant: "destructive"
      });
    }
  };

  const submitToLorator = async (curator: Curator) => {
    if (!releaseType || !releaseId) {
      toast({
        title: "No Release Selected",
        description: "Please select a specific release to submit to curators",
        variant: "destructive"
      });
      return;
    }

    try {
      const submission = {
        ...newSubmission,
        curatorId: curator.id,
        submissionDate: new Date().toISOString(),
        subject: newSubmission.subject || `New ${releaseType === 'songs' ? 'Single' : 'Album'}: ${releaseName} by ${artistName}`,
        message: newSubmission.message || generateDefaultMessage(curator)
      };

      await apiRequest(`/api/releases/${releaseType}/${releaseId}/curator-submissions`, {
        method: 'POST',
        body: submission
      });

      await loadSubmissions();
      
      toast({
        title: "Submission Sent",
        description: `Submission sent to ${curator.name}`
      });
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Failed to submit to curator",
        variant: "destructive"
      });
    }
  };

  const generateDefaultMessage = (curator: Curator) => {
    return `Hello ${curator.name},

I hope this email finds you well. I'm writing to introduce you to our latest ${releaseType === 'songs' ? 'single' : 'album'} "${releaseName}" by ${artistName}.

${releaseType === 'songs' ? 'This track' : 'This album'} represents a unique blend of ${curator.genres?.slice(0, 2).join(' and ') || 'contemporary music'}, and I believe it would resonate well with your audience.

Key highlights:
- ${releaseType === 'songs' ? 'Single' : 'Album'}: ${releaseName}
- Artist: ${artistName}
- Release Strategy: ${newSubmission.submissionStrategy === 'post_fan_release' ? 'Post-fan release' : 'Pre-release exclusive'}

I've attached the ${releaseType === 'songs' ? 'track' : 'album'} for your consideration. If you'd like any additional materials or have specific requirements, please let me know.

Thank you for your time and consideration.

Best regards,
Wai'tuMusic Team`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'opened': return 'bg-yellow-100 text-yellow-800';
      case 'responded': return 'bg-green-100 text-green-800';
      case 'declined': return 'bg-red-100 text-red-800';
      case 'placed': return 'bg-emerald-100 text-emerald-800';
      case 'no_response': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <Mail className="h-4 w-4" />;
      case 'opened': return <AlertCircle className="h-4 w-4" />;
      case 'responded': return <CheckCircle className="h-4 w-4" />;
      case 'declined': return <XCircle className="h-4 w-4" />;
      case 'placed': return <Star className="h-4 w-4" />;
      case 'no_response': return <Clock className="h-4 w-4" />;
      default: return <Mail className="h-4 w-4" />;
    }
  };

  const getRelationshipColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-yellow-100 text-yellow-800';
      case 'responsive': return 'bg-green-100 text-green-800';
      case 'partner': return 'bg-emerald-100 text-emerald-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Users className="h-4 w-4 mr-2" />
          Curator Distribution
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Curator Distribution Management</DialogTitle>
          {releaseName && (
            <p className="text-sm text-gray-600">
              Managing submissions for "{releaseName}" by {artistName}
            </p>
          )}
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab as any} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="curators">
              <Users className="h-4 w-4 mr-2" />
              Curators
            </TabsTrigger>
            <TabsTrigger value="submissions">
              <Send className="h-4 w-4 mr-2" />
              Submissions
            </TabsTrigger>
            <TabsTrigger value="campaigns">
              <BarChart3 className="h-4 w-4 mr-2" />
              Campaigns
            </TabsTrigger>
          </TabsList>

          <TabsContent value="curators" className="space-y-4">
            {/* Add New Curator */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Plus className="h-5 w-5 mr-2" />
                  Add New Curator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="curatorName">Name/Company</Label>
                    <Input
                      id="curatorName"
                      value={newCurator.name}
                      onChange={(e) => setNewCurator(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Curator or publication name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="curatorEmail">Email</Label>
                    <Input
                      id="curatorEmail"
                      type="email"
                      value={newCurator.email}
                      onChange={(e) => setNewCurator(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="curator@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="organization">Organization</Label>
                    <Input
                      id="organization"
                      value={newCurator.organization}
                      onChange={(e) => setNewCurator(prev => ({ ...prev, organization: e.target.value }))}
                      placeholder="Blog, Radio Station, etc."
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={newCurator.website}
                      onChange={(e) => setNewCurator(prev => ({ ...prev, website: e.target.value }))}
                      placeholder="https://example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="audienceSize">Audience Size</Label>
                    <Input
                      id="audienceSize"
                      type="number"
                      value={newCurator.audienceSize || ''}
                      onChange={(e) => setNewCurator(prev => ({ ...prev, audienceSize: parseInt(e.target.value) || undefined }))}
                      placeholder="10000"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="guidelines">Submission Guidelines</Label>
                  <Textarea
                    id="guidelines"
                    value={newCurator.submissionGuidelines}
                    onChange={(e) => setNewCurator(prev => ({ ...prev, submissionGuidelines: e.target.value }))}
                    placeholder="Special requirements, preferred formats, contact preferences..."
                    rows={2}
                  />
                </div>
                <Button onClick={createCurator} disabled={!newCurator.name || !newCurator.email}>
                  Add Curator
                </Button>
              </CardContent>
            </Card>

            {/* Existing Curators */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {curators.map((curator) => (
                <Card key={curator.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{curator.name}</CardTitle>
                        {curator.organization && (
                          <p className="text-sm text-gray-600 flex items-center mt-1">
                            <Building2 className="h-3 w-3 mr-1" />
                            {curator.organization}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getRelationshipColor(curator.relationshipStatus || 'new')}>
                          {curator.relationshipStatus || 'new'}
                        </Badge>
                        {curator.influenceScore && (
                          <Badge variant="outline">
                            <Star className="h-3 w-3 mr-1" />
                            {curator.influenceScore}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-gray-600">
                        <Mail className="h-3 w-3 mr-2" />
                        {curator.email}
                      </div>
                      {curator.website && (
                        <div className="flex items-center text-gray-600">
                          <Globe className="h-3 w-3 mr-2" />
                          <a href={curator.website} target="_blank" rel="noopener noreferrer" 
                             className="text-blue-600 hover:underline">
                            {curator.website}
                          </a>
                        </div>
                      )}
                      {curator.audienceSize && (
                        <div className="flex items-center text-gray-600">
                          <Users className="h-3 w-3 mr-2" />
                          {curator.audienceSize.toLocaleString()} audience
                        </div>
                      )}
                    </div>

                    {/* Submission Stats */}
                    <div className="mt-3 pt-3 border-t grid grid-cols-3 gap-2 text-xs text-center">
                      <div>
                        <div className="font-medium">{curator.totalSubmissions || 0}</div>
                        <div className="text-gray-500">Sent</div>
                      </div>
                      <div>
                        <div className="font-medium">{curator.successfulPlacements || 0}</div>
                        <div className="text-gray-500">Placed</div>
                      </div>
                      <div>
                        <div className="font-medium">
                          {curator.totalSubmissions ? 
                           Math.round(((curator.successfulPlacements || 0) / curator.totalSubmissions) * 100) : 0}%
                        </div>
                        <div className="text-gray-500">Success</div>
                      </div>
                    </div>

                    {releaseType && releaseId && (
                      <div className="mt-3 pt-3 border-t">
                        <Button 
                          size="sm" 
                          className="w-full" 
                          onClick={() => submitToLorator(curator)}
                        >
                          <Send className="h-3 w-3 mr-2" />
                          Submit Release
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="submissions" className="space-y-4">
            {releaseType && releaseId ? (
              <div className="space-y-4">
                {/* Submission Form */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Customize Submission</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="strategy">Submission Strategy</Label>
                        <Select 
                          value={newSubmission.submissionStrategy} 
                          onValueChange={(value) => setNewSubmission(prev => ({ ...prev, submissionStrategy: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="post_fan_release">Post Fan Release</SelectItem>
                            <SelectItem value="pre_release">Pre-Release</SelectItem>
                            <SelectItem value="exclusive">Exclusive Preview</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="daysSince">Days Since Release</Label>
                        <Input
                          id="daysSince"
                          type="number"
                          value={newSubmission.daysSinceRelease}
                          onChange={(e) => setNewSubmission(prev => ({ ...prev, daysSinceRelease: parseInt(e.target.value) }))}
                          min="0"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="subject">Email Subject</Label>
                      <Input
                        id="subject"
                        value={newSubmission.subject}
                        onChange={(e) => setNewSubmission(prev => ({ ...prev, subject: e.target.value }))}
                        placeholder={`New ${releaseType === 'songs' ? 'Single' : 'Album'}: ${releaseName} by ${artistName}`}
                      />
                    </div>
                    <div>
                      <Label htmlFor="message">Email Message</Label>
                      <Textarea
                        id="message"
                        value={newSubmission.message}
                        onChange={(e) => setNewSubmission(prev => ({ ...prev, message: e.target.value }))}
                        placeholder="Write your personalized message here..."
                        rows={6}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Existing Submissions */}
                <div className="space-y-3">
                  {submissions.map((submission) => (
                    <Card key={submission.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-medium">{submission.curatorName}</h3>
                            <p className="text-sm text-gray-600">{submission.curatorOrganization}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={getStatusColor(submission.status)}>
                              {getStatusIcon(submission.status)}
                              <span className="ml-1">{submission.status}</span>
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {submission.daysSinceRelease} days post-release
                            </span>
                          </div>
                        </div>

                        <div className="text-sm space-y-1 mb-3">
                          <div><strong>Subject:</strong> {submission.subject}</div>
                          <div><strong>Sent:</strong> {new Date(submission.submissionDate).toLocaleDateString()}</div>
                          {submission.responseDate && (
                            <div><strong>Responded:</strong> {new Date(submission.responseDate).toLocaleDateString()}</div>
                          )}
                        </div>

                        {submission.curatorResponse && (
                          <div className="mt-3 p-3 bg-gray-50 rounded">
                            <strong>Response:</strong>
                            <p className="mt-1">{submission.curatorResponse}</p>
                          </div>
                        )}

                        {submission.placementUrl && (
                          <div className="mt-3 p-3 bg-green-50 rounded">
                            <strong>Placement:</strong>
                            <a href={submission.placementUrl} target="_blank" rel="noopener noreferrer"
                               className="text-green-600 hover:underline ml-2">
                              {submission.placementUrl}
                            </a>
                          </div>
                        )}

                        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                          <span>Follow-ups: {submission.followUpCount}</span>
                          <span>Link clicks: {submission.linkClicks}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {submissions.length === 0 && (
                    <Card>
                      <CardContent className="pt-6 text-center text-gray-500">
                        <Send className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No submissions yet for this release</p>
                        <p className="text-sm">Use the Curators tab to submit to music curators</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center text-gray-500">
                  <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No specific release selected</p>
                  <p className="text-sm">Please open this from a specific song or album to manage submissions</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="campaigns" className="space-y-4">
            <Card>
              <CardContent className="pt-6 text-center text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Email Campaigns</p>
                <p className="text-sm">Bulk email campaign management coming soon</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}