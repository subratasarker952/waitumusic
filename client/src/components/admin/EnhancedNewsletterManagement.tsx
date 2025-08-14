import React, { useState } from 'react';

interface EnhancedNewsletterManagementProps {
  userRole: string;
  userId: number;
}
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Mail, Send, Users, BarChart3, UserPlus, Filter, Image as ImageIcon, Loader2, X, Plus, Upload, Download, Image, Video, FileText, Save } from 'lucide-react';
import MediaAssignmentModal from '@/components/modals/MediaAssignmentModal';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface NewsletterStats {
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
  phone?: string;
  address?: string;
  is_active: boolean;
}

interface MediaItem {
  id: number;
  name: string;
  type: string;
  size: string;
  url: string;
  title?: string;
}

// CSV Bulk Upload Modal
function CSVUploadModal({ 
  isOpen, 
  onClose, 
  onUpload 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onUpload: (recipients: Partial<IndustryRecipient>[]) => void;
}) {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<string[][]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const rows = text.split('\n').map(row => row.split(',').map(cell => cell.trim()));
        setCsvPreview(rows.slice(0, 5)); // Show first 5 rows for preview
      };
      reader.readAsText(file);
    }
  };

  const processCsvFile = async () => {
    if (!csvFile) return;
    
    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const rows = text.split('\n').map(row => row.split(',').map(cell => cell.trim()));
      const headers = rows[0];
      const dataRows = rows.slice(1).filter(row => row.length >= 2 && row[0] && row[1]);
      
      const recipients: Partial<IndustryRecipient>[] = dataRows.map(row => ({
        name: row[0] || '',
        email: row[1] || '',
        organization: row[2] || '',
        category: row[3] || 'general',
        website: row[4] || '',
        phone: row[5] || '',
        address: row[6] || ''
      }));
      
      onUpload(recipients);
      setIsProcessing(false);
      onClose();
    };
    reader.readAsText(csvFile);
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload Recipients from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file to add multiple recipients. Default category will be "general" if not specified.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* CSV Template Download */}
          <div className="flex justify-center">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                const headers = ['Name', 'Email', 'Organization', 'Category', 'Website', 'Phone', 'Address'];
                const sampleData = [
                  ['John Smith', 'john@radiostation.com', 'Power 105.1 FM', 'radio_stations', 'https://power105.com', '+1-555-0101', '123 Radio Ave, NYC'],
                  ['Sarah Johnson', 'sarah@musicblog.com', 'Indie Music Weekly', 'music_blogs', 'https://indiemusicweekly.com', '+1-555-0102', '456 Blog St, LA'],
                  ['Mike Davis', 'mike@festival.org', 'Summer Music Festival', 'festival_organizers', 'https://summerfest.org', '+1-555-0103', '789 Event Blvd, Chicago']
                ];
                
                const csvContent = [headers, ...sampleData]
                  .map(row => row.map(cell => `"${cell}"`).join(','))
                  .join('\n');
                
                const blob = new Blob([csvContent], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'recipient_template.csv';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Download CSV Template
            </Button>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button onClick={() => fileInputRef.current?.click()}>
              Select CSV File
            </Button>
            <p className="text-sm text-gray-600 mt-2">
              Expected format: Name, Email, Organization, Category, Website, Phone, Address
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Category defaults to "general" if not specified
            </p>
          </div>

          {csvPreview.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Preview (First 5 rows):</h4>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <tbody>
                    {csvPreview.map((row, index) => (
                      <tr key={index} className={index === 0 ? 'bg-gray-50 font-medium' : ''}>
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex} className="px-2 py-1 border-r">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={processCsvFile} 
              disabled={!csvFile || isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Upload Recipients'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Add new recipient component
function AddRecipientModal({ 
  isOpen, 
  onClose, 
  onAdd 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onAdd: (recipient: Partial<IndustryRecipient>) => void;
}) {
  const [newRecipient, setNewRecipient] = useState<Partial<IndustryRecipient>>({
    name: '',
    email: '',
    organization: '',
    category: 'general', // Set default category
    website: '',
    phone: '',
    address: ''
  });

  const { data: categories = [] } = useQuery<RecipientCategory[]>({
    queryKey: ['/api/recipient-categories'],
    queryFn: () => apiRequest('/api/recipient-categories').then(res => res.json()).then(data => data.success ? data.data : [])
  });

  const handleSubmit = () => {
    if (newRecipient.name && newRecipient.email && newRecipient.category) {
      onAdd(newRecipient);
      setNewRecipient({
        name: '',
        email: '',
        organization: '',
        category: 'general', // Keep default as general
        website: '',
        phone: '',
        address: ''
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Recipient</DialogTitle>
          <DialogDescription>
            Add a new industry contact to your recipient database
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={newRecipient.name || ''}
              onChange={(e) => setNewRecipient(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Contact's full name"
            />
          </div>
          
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={newRecipient.email || ''}
              onChange={(e) => setNewRecipient(prev => ({ ...prev, email: e.target.value }))}
              placeholder="contact@example.com"
            />
          </div>
          
          <div>
            <Label htmlFor="organization">Organization</Label>
            <Input
              id="organization"
              value={newRecipient.organization || ''}
              onChange={(e) => setNewRecipient(prev => ({ ...prev, organization: e.target.value }))}
              placeholder="Company or organization name"
            />
          </div>
          
          <div>
            <Label htmlFor="category">Category</Label>
            <Select
              value={newRecipient.category || ''}
              onValueChange={(value) => setNewRecipient(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.category_name}>
                    {category.display_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="website">Website (Optional)</Label>
            <Input
              id="website"
              value={newRecipient.website || ''}
              onChange={(e) => setNewRecipient(prev => ({ ...prev, website: e.target.value }))}
              placeholder="https://website.com"
            />
          </div>
          
          <div>
            <Label htmlFor="phone">Phone (Optional)</Label>
            <Input
              id="phone"
              value={newRecipient.phone || ''}
              onChange={(e) => setNewRecipient(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="+1 (555) 123-4567"
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              <Plus className="h-4 w-4 mr-2" />
              Add Recipient
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function EnhancedNewsletterManagement({ userRole, userId }: EnhancedNewsletterManagementProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [newsletterData, setNewsletterData] = useState({
    title: '',
    content: '',
    type: 'general',
    targetArtistId: '',
    scheduledFor: ''
  });
  
  const [isScheduled, setIsScheduled] = useState(false);
  const [selectedRecipients, setSelectedRecipients] = useState<number[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [fanPriority, setFanPriority] = useState(true);
  const [assignedMedia, setAssignedMedia] = useState<MediaItem[]>([]);
  const [showRecipientModal, setShowRecipientModal] = useState(false);
  const [showAddRecipientModal, setShowAddRecipientModal] = useState(false);
  const [showCSVUploadModal, setShowCSVUploadModal] = useState(false);
  const [showMediaAssignmentModal, setShowMediaAssignmentModal] = useState(false);
  const [recipientSearch, setRecipientSearch] = useState('');

  // Query newsletter statistics
  const { data: stats, isLoading: statsLoading } = useQuery<NewsletterStats>({
    queryKey: ['/api/newsletter/stats'],
    queryFn: () => apiRequest('/api/newsletter/stats').then(res => res.json()),
    select: (data) => ({
      totalSubscribers: data?.totalSubscribers || 0,
      fanSubscribers: data?.fanSubscribers || 0,
      totalNewsletters: data?.totalNewsletters || 0,
      recentActivity: data?.recentActivity || [],
      artistStats: data?.artistStats || {}
    })
  });

  // Query managed artists
  const { data: managedArtists = [] } = useQuery<Artist[]>({
    queryKey: ['/api/artists'],
    queryFn: () => apiRequest('/api/artists').then(res => res.json()).then(artists => 
      artists.filter((artist: Artist) => artist.isManaged)
    )
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

  // Add new recipient mutation
  const addRecipientMutation = useMutation({
    mutationFn: async (recipient: Partial<IndustryRecipient>) => {
      const response = await apiRequest('/api/industry-recipients', {
        method: 'POST',
        body: JSON.stringify(recipient)
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/industry-recipients'] });
      toast({
        title: "Recipient Added",
        description: "New industry contact has been added to your database"
      });
    }
  });

  // Bulk upload recipients mutation
  const bulkUploadMutation = useMutation({
    mutationFn: async (recipients: Partial<IndustryRecipient>[]) => {
      const response = await apiRequest('/api/industry-recipients/bulk', {
        method: 'POST',
        body: JSON.stringify({ recipients })
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/industry-recipients'] });
      toast({
        title: "Bulk Upload Complete",
        description: `${data.count} recipients have been added to your database`
      });
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Newsletter Management</h2>
          <p className="text-muted-foreground">
            Create and manage newsletters with shared recipient lists for managed artists
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowAddRecipientModal(true)}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add Recipient
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowCSVUploadModal(true)}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload CSV
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="create">Create Newsletter</TabsTrigger>
          <TabsTrigger value="recipients">Recipients ({recipients.length})</TabsTrigger>
          <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create Newsletter</CardTitle>
              <CardDescription>
                Create newsletters with media attachments and targeted recipient distribution
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Newsletter Form */}
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="title">Newsletter Title</Label>
                  <Input
                    id="title"
                    value={newsletterData.title}
                    onChange={(e) => setNewsletterData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter newsletter title"
                  />
                </div>
                
                <div>
                  <Label htmlFor="content">Content</Label>
                  <div className="border rounded-md">
                    <ReactQuill
                      theme="snow"
                      value={newsletterData.content}
                      onChange={(content) => setNewsletterData(prev => ({ ...prev, content }))}
                      placeholder="Enter newsletter content with rich formatting..."
                      modules={{
                        toolbar: [
                          [{ 'header': [1, 2, 3, false] }],
                          ['bold', 'italic', 'underline', 'strike'],
                          [{ 'color': [] }, { 'background': [] }],
                          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                          [{ 'align': [] }],
                          ['link', 'image'],
                          ['clean']
                        ],
                      }}
                      formats={[
                        'header', 'bold', 'italic', 'underline', 'strike',
                        'color', 'background', 'list', 'bullet', 'align',
                        'link', 'image'
                      ]}
                      style={{ minHeight: '200px' }}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="type">Newsletter Type</Label>
                  <Select
                    value={newsletterData.type}
                    onValueChange={(value) => setNewsletterData(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Newsletter</SelectItem>
                      <SelectItem value="artist-specific">Artist-Specific</SelectItem>
                      <SelectItem value="industry">Industry Update</SelectItem>
                      <SelectItem value="promotional">Promotional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {newsletterData.type === 'artist-specific' && (
                  <div>
                    <Label htmlFor="targetArtist">Target Artist</Label>
                    <Select
                      value={newsletterData.targetArtistId}
                      onValueChange={(value) => setNewsletterData(prev => ({ ...prev, targetArtistId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select artist" />
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
              </div>
              
              {/* Media Assignment Section */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-medium">Media Attachments</h4>
                    <p className="text-sm text-muted-foreground">
                      Assign images, videos, and documents to this newsletter
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setShowMediaAssignmentModal(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Assign Media
                  </Button>
                </div>
                
                {/* Assigned Media Preview */}
                {assignedMedia.length > 0 ? (
                  <div className="grid gap-3">
                    {assignedMedia.map((media) => (
                      <div key={media.id} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center space-x-3">
                          {media.type === 'image' && <Image className="h-5 w-5 text-blue-500" />}
                          {media.type === 'video' && <Video className="h-5 w-5 text-green-500" />}
                          {media.type === 'document' && <FileText className="h-5 w-5 text-orange-500" />}
                          <div>
                            <p className="font-medium text-sm">{media.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {media.type} • {media.size}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setAssignedMedia(prev => prev.filter(m => m.id !== media.id))}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground border-2 border-dashed rounded">
                    <Image className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No media assigned</p>
                    <p className="text-xs">Click "Assign Media" to add images, videos, or documents</p>
                  </div>
                )}
              </div>
              
              {/* Distribution Settings */}
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-4">Distribution Settings</h4>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="fanPriority"
                      checked={fanPriority}
                      onCheckedChange={(checked) => setFanPriority(checked === true)}
                    />
                    <Label htmlFor="fanPriority" className="text-sm">
                      Send to fans first (priority distribution)
                    </Label>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Selected Recipients: {selectedRecipients.length}</Label>
                    <p className="text-xs text-muted-foreground">
                      Go to Recipients tab to select industry contacts
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isScheduled"
                      checked={isScheduled}
                      onCheckedChange={(checked) => setIsScheduled(checked === true)}
                    />
                    <Label htmlFor="isScheduled" className="text-sm">
                      Schedule for later
                    </Label>
                  </div>
                  
                  {isScheduled && (
                    <div>
                      <Label htmlFor="scheduledFor">Schedule Date</Label>
                      <Input
                        id="scheduledFor"
                        type="datetime-local"
                        value={newsletterData.scheduledFor}
                        onChange={(e) => setNewsletterData(prev => ({ ...prev, scheduledFor: e.target.value }))}
                      />
                    </div>
                  )}
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex gap-3">
                <Button className="flex-1">
                  <Mail className="h-4 w-4 mr-2" />
                  {isScheduled ? 'Schedule Newsletter' : 'Send Now'}
                </Button>
                <Button variant="outline">
                  <Save className="h-4 w-4 mr-2" />
                  Save Draft
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalSubscribers || 0}</div>
                <p className="text-xs text-muted-foreground">
                  +{stats?.fanSubscribers || 0} fan subscribers
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Industry Recipients</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{recipients.length}</div>
                <p className="text-xs text-muted-foreground">
                  +{categories.length} categories
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Newsletters</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalNewsletters || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Sent this month
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Managed Artists</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{managedArtists.length}</div>
                <p className="text-xs text-muted-foreground">
                  Active newsletter senders
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Newsletter Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentActivity.map((newsletter) => (
                    <div key={newsletter.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{newsletter.title}</p>
                        <p className="text-sm text-muted-foreground">
                          Sent {new Date(newsletter.sentAt).toLocaleDateString()} • {newsletter.recipients} recipients
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{(newsletter.openRate * 100).toFixed(1)}% open rate</p>
                        <p className="text-xs text-muted-foreground">
                          {newsletter.openCount}/{newsletter.sentCount} opened
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No recent newsletter activity</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recipients" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Industry Recipients Database</CardTitle>
              <CardDescription>
                Manage shared recipient lists for newsletters and press releases. Recipients can be filtered by category and genre.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search and Filter */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search recipients by name, organization, or email..."
                    value={recipientSearch}
                    onChange={(e) => setRecipientSearch(e.target.value)}
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowRecipientModal(true)}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </div>

              {/* Recipients List */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {recipients.map((recipient) => (
                  <div key={recipient.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <Checkbox
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
                        <p className="font-medium">{recipient.name}</p>
                        <p className="text-sm text-gray-500">{recipient.email}</p>
                        {recipient.organization && (
                          <p className="text-xs text-gray-400">{recipient.organization}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {recipient.category}
                      </Badge>
                      {recipient.phone && (
                        <Badge variant="secondary" className="text-xs">
                          Phone
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {recipients.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No recipients found</p>
                  <p className="text-sm">Add industry contacts to build your recipient database</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscribers" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Subscriber Management</CardTitle>
                <CardDescription>
                  View and manage newsletter subscribers by artist interests. Fans can subscribe to specific managed artists.
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
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Recipient Modal */}
      <AddRecipientModal
        isOpen={showAddRecipientModal}
        onClose={() => setShowAddRecipientModal(false)}
        onAdd={(recipient) => addRecipientMutation.mutate(recipient)}
      />

      {/* CSV Upload Modal */}
      <CSVUploadModal
        isOpen={showCSVUploadModal}
        onClose={() => setShowCSVUploadModal(false)}
        onUpload={(recipients) => bulkUploadMutation.mutate(recipients)}
      />

      {/* Media Assignment Modal */}
      <MediaAssignmentModal
        isOpen={showMediaAssignmentModal}
        onClose={() => setShowMediaAssignmentModal(false)}
        assignedMedia={assignedMedia}
        onAssignMedia={setAssignedMedia}
      />
    </div>
  );
}