import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Mail, Send, Users, BarChart3, TestTube, Calendar, User, Globe, UserPlus, Filter, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

// Artist Subscriber Card Component with detailed subscriber management
function ArtistSubscriberCard({ artist }: { artist: Artist }) {
  const [showSubscribers, setShowSubscribers] = useState(false);
  
  const { data: subscriberCount, isLoading: countLoading } = useQuery<number>({
    queryKey: ['/api/subscribers/count', artist.userId],
    queryFn: () => apiRequest(`/api/subscribers/count/${artist.userId}`).then(res => res.json()).then(data => data.count || 0)
  });

  const { data: subscribers = [], isLoading: subscribersLoading } = useQuery({
    queryKey: ['/api/subscribers', artist.userId],
    queryFn: () => apiRequest(`/api/subscribers/${artist.userId}`).then(res => res.json()).then(data => data.subscribers || []),
    enabled: showSubscribers
  });

  const subscriberBadge = countLoading ? (
    <Badge variant="secondary">Checking...</Badge>
  ) : (
    <Badge variant={subscriberCount > 0 ? "default" : "secondary"}>
      {subscriberCount > 0 ? `${subscriberCount} Active Subscribers` : 'No Subscribers Yet'}
    </Badge>
  );

  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium">
            {artist.stageNames?.[0] || artist.fullName || `Artist ${artist.userId}`}
          </h4>
          <p className="text-sm text-gray-500">Managed Artist • Newsletter Subscribers</p>
        </div>
        <div className="flex items-center gap-2">
          {subscriberBadge}
          {subscriberCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSubscribers(!showSubscribers)}
            >
              {showSubscribers ? 'Hide' : 'View'} List
            </Button>
          )}
        </div>
      </div>
      
      {showSubscribers && subscriberCount > 0 && (
        <div className="mt-4 border-t pt-4">
          <h5 className="font-medium mb-3">Newsletter Subscribers ({subscriberCount})</h5>
          {subscribersLoading ? (
            <div className="text-center py-4">
              <Loader2 className="h-6 w-6 animate-spin mx-auto" />
              <p className="text-sm text-gray-500 mt-2">Loading subscriber details...</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {subscribers.map((subscriber: any) => (
                <div key={subscriber.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium text-sm">{subscriber.name || subscriber.email}</p>
                    <p className="text-xs text-gray-500">{subscriber.email}</p>
                  </div>
                  <div className="text-xs text-gray-400">
                    Subscribed: {new Date(subscriber.engagement_date).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {subscriberCount === 0 && (
        <div className="mt-4 border-t pt-4">
          <div className="text-center py-4 text-gray-500">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No newsletter subscribers yet</p>
            <p className="text-xs">Fans can subscribe to receive updates about this artist</p>
          </div>
        </div>
      )}
    </div>
  );
}

interface NewsletterStats {
  totalSent: number;
  openRate: number;
  clickRate: number;
  totalSubscribers: number;
  fanSubscribers: number;
  totalNewsletters: number;
  recentActivity: Array<{
    id: number;
    title: string;
    sentAt: string;
    recipients: number;
    openRate: number;
    sentCount: number;
    openCount: number;
    clickCount: number;
  }>;
  artistStats: Record<number, {
    subscriberCount: number;
    lastNewsletter: string;
  }>;
}

interface Artist {
  userId: number;
  stageNames: string[];
  isManaged: boolean;
  fullName?: string;
}

interface RecipientCategory {
  id: number;
  category_name: string;
  display_name: string;
  description: string;
}

interface MusicGenre {
  id: number;
  display_name: string;
  description: string;
  is_active: boolean;
}

interface IndustryRecipient {
  id: number;
  name: string;
  email: string;
  organization?: string;
  category: string;
  website?: string;
  is_active: boolean;
}

interface MediaItem {
  id: number;
  filename: string;
  url: string;
  type: 'image' | 'video' | 'document';
  title?: string;
}

interface ContentDistribution {
  id?: number;
  content_type: 'newsletter' | 'press-release';
  content_id: number;
  distribution_name?: string;
  selected_recipients: number[];
  target_genres: number[];
  target_categories: number[];
  fan_priority: boolean;
  assigned_media: MediaItem[];
  distribution_status: string;
}

export default function NewsletterManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [newsletterData, setNewsletterData] = useState({
    title: '',
    content: '',
    type: 'general',
    targetArtistId: '',
    scheduledFor: ''
  });
  
  const [testEmail, setTestEmail] = useState('');
  const [isScheduled, setIsScheduled] = useState(false);
  
  // Recipient management state
  const [selectedRecipients, setSelectedRecipients] = useState<number[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [fanPriority, setFanPriority] = useState(true);
  const [assignedMedia, setAssignedMedia] = useState<MediaItem[]>([]);
  const [showRecipientModal, setShowRecipientModal] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [recipientSearch, setRecipientSearch] = useState('');

  // Query newsletter statistics
  const { data: stats, isLoading: statsLoading } = useQuery<NewsletterStats>({
    queryKey: ['/api/newsletter/stats'],
    queryFn: () => apiRequest('/api/newsletter/stats').then(res => res.json())
  });

  // Query managed artists for targeting
  const { data: artists = [] } = useQuery<Artist[]>({
    queryKey: ['/api/artists'],
    queryFn: () => apiRequest('/api/artists').then(res => res.json())
  });

  // Query recipient categories
  const { data: categories = [] } = useQuery<RecipientCategory[]>({
    queryKey: ['/api/recipient-categories'],
    queryFn: () => apiRequest('/api/recipient-categories').then(res => res.json()).then(data => data.success ? data.data : [])
  });

  // Query music genres
  const { data: genres = [] } = useQuery<MusicGenre[]>({
    queryKey: ['/api/music-genres'],
    queryFn: () => apiRequest('/api/music-genres').then(res => res.json()).then(data => data.success ? data.data : [])
  });

  // Query industry recipients with search/filter
  const { data: recipients = [] } = useQuery<IndustryRecipient[]>({
    queryKey: ['/api/industry-recipients', recipientSearch, selectedCategories, selectedGenres],
    queryFn: () => {
      const params = new URLSearchParams();
      if (recipientSearch) params.append('search', recipientSearch);
      if (selectedCategories.length > 0) params.append('categoryId', selectedCategories[0].toString());
      if (selectedGenres.length > 0) params.append('genreId', selectedGenres[0].toString());
      
      return apiRequest(`/api/industry-recipients?${params}`).then(res => res.json()).then(data => data.success ? data.data : []);
    }
  });

  // Query newsletters with recipient data
  const { data: newslettersWithRecipients = [] } = useQuery({
    queryKey: ['/api/newsletters/with-recipients'],
    queryFn: () => apiRequest('/api/newsletters/with-recipients').then(res => res.json()).then(data => data.success ? data.data : [])
  });

  // Create newsletter mutation with recipient distribution
  const createNewsletterMutation = useMutation({
    mutationFn: async (data: any) => {
      // First create the newsletter
      const newsletter = await apiRequest('/api/newsletter/create', {
        method: 'POST',
        body: JSON.stringify(data)
      }).then(res => res.json());
      
      // Then create content distribution if recipients are selected
      if (selectedRecipients.length > 0 || selectedGenres.length > 0 || selectedCategories.length > 0) {
        const distributionData: ContentDistribution = {
          content_type: 'newsletter',
          content_id: newsletter.id,
          distribution_name: `${data.title} Distribution`,
          selected_recipients: selectedRecipients,
          target_genres: selectedGenres,
          target_categories: selectedCategories,
          fan_priority: fanPriority,
          assigned_media: assignedMedia,
          distribution_status: 'pending'
        };
        
        await apiRequest('/api/content-distribution', {
          method: 'POST',
          body: JSON.stringify(distributionData)
        });
      }
      
      return newsletter;
    },
    onSuccess: (data) => {
      toast({
        title: "Newsletter Success",
        description: data.message || "Newsletter created and distribution configured successfully!",
      });
      setNewsletterData({
        title: '',
        content: '',
        type: 'general',
        targetArtistId: '',
        scheduledFor: ''
      });
      setTestEmail('');
      setIsScheduled(false);
      setSelectedRecipients([]);
      setSelectedGenres([]);
      setSelectedCategories([]);
      setAssignedMedia([]);
      queryClient.invalidateQueries({ queryKey: ['/api/newsletter/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/newsletters/with-recipients'] });
    },
    onError: (error: any) => {
      toast({
        title: "Newsletter Error",
        description: error.message || "Failed to create newsletter",
        variant: "destructive",
      });
    }
  });

  // Test email mutation
  const testEmailMutation = useMutation({
    mutationFn: (email: string) => apiRequest('/api/newsletter/test', {
      method: 'POST',
      body: JSON.stringify({ email })
    }).then(res => res.json()),
    onSuccess: (data) => {
      toast({
        title: "Test Email Success",
        description: data.message,
      });
      setTestEmail('');
    },
    onError: (error: any) => {
      toast({
        title: "Test Email Failed",
        description: error.message || "Failed to send test email",
        variant: "destructive",
      });
    }
  });

  const handleCreateNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newsletterData.title || !newsletterData.content) {
      toast({
        title: "Validation Error",
        description: "Title and content are required",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      ...newsletterData,
      targetArtistId: newsletterData.targetArtistId ? parseInt(newsletterData.targetArtistId) : undefined,
      scheduledFor: newsletterData.scheduledFor || undefined
    };

    createNewsletterMutation.mutate(payload);
  };

  const handleTestEmail = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!testEmail) {
      toast({
        title: "Validation Error",
        description: "Test email address is required",
        variant: "destructive",
      });
      return;
    }

    testEmailMutation.mutate(testEmail);
  };

  const managedArtists = artists.filter(artist => artist.isManaged);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Mail className="h-6 w-6 text-emerald-600" />
        <h2 className="text-2xl font-bold text-gray-900">Newsletter Management</h2>
      </div>

      <Tabs defaultValue="create" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="create">Create Newsletter</TabsTrigger>
          <TabsTrigger value="stats">Analytics</TabsTrigger>
          <TabsTrigger value="test">Test Email</TabsTrigger>
          <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
        </TabsList>

        {/* Recipient Management Modal */}
        <Dialog open={showRecipientModal} onOpenChange={setShowRecipientModal}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Manage Newsletter Recipients</DialogTitle>
              <DialogDescription>
                Select recipient categories, genres, and specific industry contacts for your newsletter distribution.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Category Selection */}
              <div>
                <Label className="text-base font-medium">Recipient Categories</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category.id}`}
                        checked={selectedCategories.includes(category.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedCategories([...selectedCategories, category.id]);
                          } else {
                            setSelectedCategories(selectedCategories.filter(id => id !== category.id));
                          }
                        }}
                      />
                      <Label htmlFor={`category-${category.id}`} className="text-sm">
                        {category.display_name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Genre Selection */}
              <div>
                <Label className="text-base font-medium">Target Music Genres</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                  {genres.map((genre) => (
                    <div key={genre.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`genre-${genre.id}`}
                        checked={selectedGenres.includes(genre.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedGenres([...selectedGenres, genre.id]);
                          } else {
                            setSelectedGenres(selectedGenres.filter(id => id !== genre.id));
                          }
                        }}
                      />
                      <Label htmlFor={`genre-${genre.id}`} className="text-sm">
                        {genre.display_name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recipient Search and Selection */}
              <div>
                <Label className="text-base font-medium">Industry Recipients</Label>
                <div className="space-y-2 mt-2">
                  <Input
                    placeholder="Search recipients by name, organization, or email..."
                    value={recipientSearch}
                    onChange={(e) => setRecipientSearch(e.target.value)}
                  />
                  
                  <div className="max-h-60 overflow-y-auto border rounded-md p-2 space-y-1">
                    {recipients.map((recipient) => (
                      <div key={recipient.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`recipient-${recipient.id}`}
                            checked={selectedRecipients.includes(recipient.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedRecipients([...selectedRecipients, recipient.id]);
                              } else {
                                setSelectedRecipients(selectedRecipients.filter(id => id !== recipient.id));
                              }
                            }}
                          />
                          <div>
                            <p className="font-medium text-sm">{recipient.name}</p>
                            <p className="text-xs text-gray-500">{recipient.email}</p>
                            {recipient.organization && (
                              <p className="text-xs text-gray-400">{recipient.organization}</p>
                            )}
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {recipient.category}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Selected Recipients Summary */}
              {selectedRecipients.length > 0 && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="font-medium text-blue-900">
                    {selectedRecipients.length} recipient(s) selected
                  </p>
                  <p className="text-sm text-blue-700">
                    Newsletter will be sent to selected recipients plus any fans subscribed to artist newsletters.
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowRecipientModal(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowRecipientModal(false)}>
                Save Recipients
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Create & Send Newsletter
              </CardTitle>
              <CardDescription>
                Create newsletters for general audience or specific managed artists
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateNewsletter} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Newsletter Title</Label>
                    <Input
                      id="title"
                      value={newsletterData.title}
                      onChange={(e) => setNewsletterData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter newsletter title"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="type">Newsletter Type</Label>
                    <Select 
                      value={newsletterData.type} 
                      onValueChange={(value) => setNewsletterData(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            General Newsletter
                          </div>
                        </SelectItem>
                        <SelectItem value="artist-specific">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Artist-Specific
                          </div>
                        </SelectItem>
                        <SelectItem value="release-announcement">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            Release Announcement
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {newsletterData.type === 'artist-specific' && (
                  <div className="space-y-2">
                    <Label htmlFor="targetArtist">Target Artist</Label>
                    <Select 
                      value={newsletterData.targetArtistId} 
                      onValueChange={(value) => setNewsletterData(prev => ({ ...prev, targetArtistId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select managed artist" />
                      </SelectTrigger>
                      <SelectContent>
                        {managedArtists.map((artist) => (
                          <SelectItem key={artist.userId} value={artist.userId.toString()}>
                            {artist.stageNames?.[0] || artist.fullName || `Artist ${artist.userId}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="content">Newsletter Content (HTML supported)</Label>
                  <Textarea
                    id="content"
                    value={newsletterData.content}
                    onChange={(e) => setNewsletterData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Enter newsletter content... You can use HTML tags for formatting."
                    rows={10}
                    required
                  />
                  <p className="text-sm text-gray-500">
                    You can use HTML for formatting. Available placeholders: {'{{firstName}}'}, {'{{lastName}}'}, {'{{unsubscribeUrl}}'}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="schedule"
                    checked={isScheduled}
                    onCheckedChange={setIsScheduled}
                  />
                  <Label htmlFor="schedule">Schedule for later</Label>
                </div>

                {isScheduled && (
                  <div className="space-y-2">
                    <Label htmlFor="scheduledFor">Scheduled Date & Time</Label>
                    <Input
                      id="scheduledFor"
                      type="datetime-local"
                      value={newsletterData.scheduledFor}
                      onChange={(e) => setNewsletterData(prev => ({ ...prev, scheduledFor: e.target.value }))}
                      min={new Date().toISOString().slice(0, 16)}
                    />
                  </div>
                )}

                {/* Recipient Selection Section */}
                <div className="space-y-4 border-t pt-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">Newsletter Recipients</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowRecipientModal(true)}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Manage Recipients ({selectedRecipients.length})
                    </Button>
                  </div>
                  
                  {selectedCategories.length > 0 && (
                    <div>
                      <Label className="text-sm text-gray-600">Target Categories:</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {categories.filter(cat => selectedCategories.includes(cat.id)).map(cat => (
                          <Badge key={cat.id} variant="outline">
                            {cat.display_name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedGenres.length > 0 && (
                    <div>
                      <Label className="text-sm text-gray-600">Target Genres:</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {genres.filter(genre => selectedGenres.includes(genre.id)).map(genre => (
                          <Badge key={genre.id} variant="outline">
                            {genre.display_name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="fanPriority"
                      checked={fanPriority}
                      onCheckedChange={(checked) => setFanPriority(checked as boolean)}
                    />
                    <Label htmlFor="fanPriority" className="text-sm">
                      Send to fans first, then industry recipients
                    </Label>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={createNewsletterMutation.isPending}
                  className="w-full"
                >
                  {createNewsletterMutation.isPending ? (
                    'Processing...'
                  ) : isScheduled ? (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Schedule Newsletter
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Send className="h-4 w-4" />
                      Create & Send Now
                    </div>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsLoading ? '...' : stats?.totalSubscribers || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Active newsletter subscriptions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Newsletters</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsLoading ? '...' : stats?.totalNewsletters || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Newsletters sent successfully
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Email Server</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600">
                  Connected
                </div>
                <p className="text-xs text-muted-foreground">
                  mail.comeseetv.com active
                </p>
              </CardContent>
            </Card>
          </div>

          {stats?.recentNewsletters && stats.recentNewsletters.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Newsletters</CardTitle>
                <CardDescription>Latest newsletters sent to subscribers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.recentNewsletters.map((newsletter) => (
                    <div key={newsletter.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{newsletter.title}</h4>
                        <p className="text-sm text-gray-500">
                          Sent {new Date(newsletter.sentAt).toLocaleDateString()} to {newsletter.sentCount} subscribers
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline">{newsletter.openCount} opens</Badge>
                        <Badge variant="outline">{newsletter.clickCount} clicks</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="test" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                Test Email Functionality
              </CardTitle>
              <CardDescription>
                Send a test newsletter to verify email server connectivity and templates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTestEmail} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="testEmail">Test Email Address</Label>
                  <Input
                    id="testEmail"
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="Enter email address to receive test newsletter"
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  disabled={testEmailMutation.isPending}
                  className="w-full"
                >
                  {testEmailMutation.isPending ? (
                    'Sending Test Email...'
                  ) : (
                    <div className="flex items-center gap-2">
                      <TestTube className="h-4 w-4" />
                      Send Test Newsletter
                    </div>
                  )}
                </Button>
              </form>
              
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Test Email Information</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Tests mail.comeseetv.com server connectivity</li>
                  <li>• Sends welcome newsletter template</li>
                  <li>• Includes unsubscribe functionality</li>
                  <li>• Verifies email delivery and formatting</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscribers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Subscriber Management
              </CardTitle>
              <CardDescription>
                View and manage newsletter subscribers by artist interests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {managedArtists.map((artist) => (
                  <div key={artist.userId} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">
                          {artist.stageNames?.[0] || artist.fullName || `Artist ${artist.userId}`}
                        </h4>
                        <p className="text-sm text-gray-500">Managed Artist</p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p>Subscribers: {stats?.artistStats?.[artist.userId]?.subscriberCount || 0}</p>
                        <p>Last Newsletter: {stats?.artistStats?.[artist.userId]?.lastNewsletter || 'Never'}</p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {managedArtists.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No managed artists found. Only managed artists can have dedicated subscriber lists.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}