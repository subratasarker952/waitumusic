import { useState, useEffect } from "react";
import { useNavigation } from '@/hooks/useNavigation';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Globe, Link, QrCode, Download, Copy, Eye, MousePointer, Code, ExternalLink, Edit, Trash2, CheckCircle, XCircle, Settings, ArrowLeft, Plus, Music, Instagram, Save } from "lucide-react";
import type { WebsiteIntegration, InsertWebsiteIntegration } from "@shared/schema";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface WebsiteIntegrationModalProps {
  children: React.ReactNode;
  artistId?: number;
  artistName?: string;
}

export default function WebsiteIntegrationModal({ children, artistId, artistName }: WebsiteIntegrationModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("create");
  const [activeEditTab, setActiveEditTab] = useState<"content" | "widgets" | "qr" | "analytics" | "settings">("content");
  const [open, setOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<WebsiteIntegration | null>(null);
  const [slugValidation, setSlugValidation] = useState<{ checking: boolean; available: boolean | null; message: string }>({
    checking: false,
    available: null,
    message: ""
  });

  // New integration form state
  const [newIntegration, setNewIntegration] = useState<Partial<InsertWebsiteIntegration>>({
    slug: "",
    isActive: true,
    accessLevel: "public",
    socialLinks: [],
    musicLinks: [],
    bookingLinks: [],
    storeLinks: [],
    customLinks: []
  });

  // Get auth context first
  const { user, role } = useAuth();
  
  // Enhanced access control with subscription tiers using role_id
  const userRoleId = user?.roleId || 9; // Default to fan role if not found
  const isAdminType = [1, 2].includes(userRoleId); // Superadmin (1) or Admin (2)
  const canCreateMultiple = isAdminType;
  const isFullyManaged = [3, 4, 5, 6, 7, 8].includes(userRoleId); // All managed user types

  // Website Integrations - fetch for current user or specific artist if admin type
  const { data: integrations, isLoading: integrationsLoading, error: integrationsError } = useQuery<WebsiteIntegration[]>({
    queryKey: artistId ? ["/api/website-integrations", "artist", artistId] : ["/api/website-integrations"],
    queryFn: async () => {
      try {
        let url: string;
        if (artistId && isAdminType) {
          url = `/api/website-integrations/user/${artistId}`;
        } else {
          url = "/api/website-integrations";
        }
        
        const data = await apiRequest(url);
        return data;
      } catch (error) {
        console.error('Error fetching website integrations:', error);
        throw error;
      }
    },
    enabled: open && !!user,
    staleTime: 0, // Force fresh data
    cacheTime: 0, // Don't cache
  });
  const hasExistingIntegration = integrations && integrations.length > 0;
  
  // Check if user has access to All-Links system
  const hasAllLinksAccess = isFullyManaged || isAdminType;
  
  // For non-fully managed users, show subscription tiers
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  
  // Restriction: Fully managed users can only have one All-Links page
  const canCreateNew = canCreateMultiple || !hasExistingIntegration;
  
  // Auto-switch to manage tab when integrations exist and data has loaded
  useEffect(() => {
    // Only proceed if we're not loading and have data (or confirmed no data)
    if (integrationsLoading) return;
    
    // Switch to manage tab if:
    // 1. Admin managing another artist's page with existing integrations
    // 2. User accessing their own page with existing integrations
    const shouldSwitch = integrations && integrations.length > 0 && activeTab === 'create' && open && (
      (isAdminType && artistId) || // Admin managing artist
      (!artistId || Number(artistId) === user?.id) // User's own page
    );
    
    if (shouldSwitch) {
      setActiveTab('manage');
    }
  }, [integrations, integrationsLoading, isAdminType, activeTab, artistId, open, user?.id]);

  // Fetch subscription status when modal opens for non-fully managed users
  useEffect(() => {
    if (open && user && !hasAllLinksAccess) {
      fetchSubscriptionStatus();
    }
  }, [open, user, hasAllLinksAccess]);

  const fetchSubscriptionStatus = async () => {
    try {
      setSubscriptionLoading(true);
      const response = await fetch('/api/all-links-subscription/status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setSubscriptionStatus(data);
      }
    } catch (error) {
      console.error('Error fetching subscription status:', error);
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const createSubscription = async (tierLevel: number) => {
    try {
      setSubscriptionLoading(true);
      const response = await apiRequest('/api/all-links-subscription', {
        method: 'POST',
        body: { tierLevel }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSubscriptionStatus({
          hasSubscription: true,
          subscription: data.subscription,
          isActive: true,
          tierLevel: data.subscription.tierLevel
        });
        setShowSubscriptionModal(false);
        toast({
          title: "Subscription Created",
          description: `You now have access to Tier ${tierLevel} All-Links features!`,
        });
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
      toast({
        title: "Subscription Error",
        description: "Failed to create subscription. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const createIntegrationMutation = useMutation({
    mutationFn: (data: InsertWebsiteIntegration) => 
      apiRequest("/api/website-integrations", { method: "POST", body: data }),
    onSuccess: () => {
      // Invalidate all relevant cache queries
      queryClient.invalidateQueries({ queryKey: ["/api/website-integrations"] });
      if (artistId) {
        queryClient.invalidateQueries({ queryKey: ['/api/website-integrations', 'artist', artistId] });
      }
      toast({ title: "All-links page created successfully" });
      setNewIntegration({
        slug: "",
        isActive: true,
        accessLevel: "public",
        socialLinks: [],
        musicLinks: [],
        bookingLinks: [],
        storeLinks: [],
        customLinks: []
      });
      setActiveTab("existing");
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to create all-links page", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const updateIntegrationMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<WebsiteIntegration> }) =>
      apiRequest(`/api/website-integrations/${id}`, { method: "PUT", body: data }),
    onSuccess: () => {
      // Invalidate all relevant cache queries
      queryClient.invalidateQueries({ queryKey: ["/api/website-integrations"] });
      if (artistId) {
        queryClient.invalidateQueries({ queryKey: ['/api/website-integrations', 'artist', artistId] });
      }
      toast({ title: "Page updated successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to update page", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const deleteIntegrationMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest(`/api/website-integrations/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      // Invalidate all relevant cache queries
      queryClient.invalidateQueries({ queryKey: ["/api/website-integrations"] });
      if (artistId) {
        queryClient.invalidateQueries({ queryKey: ['/api/website-integrations', 'artist', artistId] });
      }
      toast({ title: "Page deleted successfully" });
      setSelectedIntegration(null);
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to delete page", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  // Subscription handling
  const handleSubscriptionSelect = async (tierLevel: number) => {
    try {
      // First check if terms are accepted
      const termsCheckbox = document.getElementById('terms-accept') as HTMLInputElement;
      if (!termsCheckbox?.checked) {
        toast({
          title: "Terms Required",
          description: "Please accept the terms and conditions to continue.",
          variant: "destructive"
        });
        return;
      }

      // Create Stripe subscription for All-Links access
      const response = await apiRequest('/api/all-links-subscription', {
        method: 'POST',
        body: { tierLevel }
      });

      if (response.checkoutUrl) {
        // Redirect to Stripe checkout
        const { navigate } = useNavigation();
        navigate(response.checkoutUrl);
      }
    } catch (error: any) {
      toast({
        title: "Subscription Error",
        description: error.message || "Failed to create subscription",
        variant: "destructive"
      });
    }
  };

  // QR code state for preview and customization
  const [qrCodeData, setQrCodeData] = useState<{
    qrCode: string;
    url: string;
    slug: string;
    title: string;
    options?: any;
  } | null>(null);
  const [editingIntegration, setEditingIntegration] = useState<any>(null);
  const [widgetEmbedUrls, setWidgetEmbedUrls] = useState<{[key: string]: string}>({});
  const [qrOptions, setQrOptions] = useState({
    transparent: false,
    color: '#000000',
    backgroundColor: '#FFFFFF',
    includeProfilePicture: false,
    profilePictureUrl: '',
    customImageUrl: ''
  });

  const generateQRCodeMutation = useMutation({
    mutationFn: async ({ integrationId, options }: { integrationId: number; options?: any }) => {
      const queryParams = new URLSearchParams();
      if (options?.transparent) queryParams.append('transparent', 'true');
      if (options?.color) queryParams.append('color', options.color);
      if (options?.backgroundColor) queryParams.append('backgroundColor', options.backgroundColor);
      if (options?.includeProfilePicture && options?.profilePictureUrl) {
        queryParams.append('includeProfilePicture', 'true');
        queryParams.append('profilePictureUrl', options.profilePictureUrl);
      }
      
      if (options?.customImageUrl) {
        queryParams.append('customImageUrl', options.customImageUrl);
      }
      
      return apiRequest(`/api/website-integrations/${integrationId}/qr-code?${queryParams.toString()}`, { method: "GET" });
    },
    onSuccess: (response) => {
      setQrCodeData(response);
      toast({ title: "QR code generated successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to generate QR code", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  // Download QR code function
  const downloadQRCode = () => {
    if (!qrCodeData?.qrCode) return;
    
    const link = document.createElement('a');
    link.href = qrCodeData.qrCode;
    link.download = `${qrCodeData.slug}-qr-code.png`;
    link.click();
    toast({ title: "QR code downloaded successfully" });
  };

  // Slug availability check
  useEffect(() => {
    if (newIntegration.slug && newIntegration.slug.length > 2) {
      const timer = setTimeout(async () => {
        setSlugValidation({ checking: true, available: null, message: "Checking availability..." });
        try {
          await apiRequest(`/api/website-integrations/check-slug/${newIntegration.slug}`);
          setSlugValidation({ checking: false, available: true, message: "Slug available!" });
        } catch (error: any) {
          setSlugValidation({ checking: false, available: false, message: error.message });
        }
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setSlugValidation({ checking: false, available: null, message: "" });
    }
  }, [newIntegration.slug]);

  const handleCreateIntegration = async () => {
    if (!artistId || !newIntegration.slug) {
      toast({ title: "Please fill in required fields", variant: "destructive" });
      return;
    }

    createIntegrationMutation.mutate({
      ...newIntegration,
      userId: artistId,
      slug: newIntegration.slug
    } as InsertWebsiteIntegration);
  };

  const handleUpdateIntegration = (integration: WebsiteIntegration) => {
    updateIntegrationMutation.mutate({
      id: integration.id,
      data: integration
    });
  };

  const handleDeleteIntegration = (id: number, slug: string) => {
    if (confirm(`Are you sure you want to delete the page "/${slug}"? This action cannot be undone.`)) {
      deleteIntegrationMutation.mutate(id);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {hasAllLinksAccess ? children : (
            <div 
              className="relative group"
              onClick={() => setShowSubscriptionModal(true)}
            >
              {children}
              <div className="absolute inset-0 bg-gray-500/50 rounded cursor-pointer flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <span className="text-white font-medium text-sm bg-black/70 px-3 py-1 rounded">
                  Premium Feature
                </span>
              </div>
            </div>
          )}
        </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Link className="h-5 w-5 text-blue-500" />
            <span>All-Links Pages</span>
          </DialogTitle>
          <DialogDescription>
            Create beautiful landing pages that showcase all your important links in one place
          </DialogDescription>
        </DialogHeader>

        <Tabs value="manage" className="w-full">
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="manage" className="flex items-center space-x-2">
              <Globe className="h-4 w-4" />
              <span>Manage All-Link Page</span>
            </TabsTrigger>
          </TabsList>

          {/* Manage All-Link Page Tab - Combined Create and Manage */}
          <TabsContent value="manage" className="space-y-6">
            
            {/* Show existing page if user has one, otherwise show create form */}
            {integrations && integrations.length > 0 ? (
              /* Existing Page Management Section */
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Globe className="h-5 w-5 text-blue-500" />
                      <span>Your All-Links Page</span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        queryClient.invalidateQueries({ queryKey: ["/api/website-integrations"] });
                        if (artistId) {
                          queryClient.invalidateQueries({ queryKey: ["/api/website-integrations", "artist", artistId] });
                        }
                      }}
                    >
                      Refresh
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Manage your all-links page, get embed codes, and download QR codes.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {integrations.map((integration) => (
                      <div key={integration.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Link className="h-5 w-5 text-blue-500" />
                            <div>
                              <h4 className="font-medium">/{integration.slug}</h4>
                              <p className="text-sm text-gray-500">
                                waitumusic.com/{integration.slug}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant={integration.isActive ? "default" : "secondary"}>
                                {integration.isActive ? "Active" : "Inactive"}
                              </Badge>
                              <Badge variant="outline">
                                {integration.accessLevel || "Public"}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                navigator.clipboard.writeText(`https://waitumusic.com/${integration.slug}`);
                                toast({ title: "Link copied to clipboard" });
                              }}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(`https://waitumusic.com/${integration.slug}`, '_blank')}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedIntegration(integration)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteIntegration(integration.id, integration.slug)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {/* QR Code and Embed Code actions */}
                        <div className="flex items-center space-x-4 pt-3 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedIntegration(integration);
                              setActiveEditTab("qr");
                            }}
                            disabled={generateQRCodeMutation.isPending}
                          >
                            <QrCode className="h-4 w-4 mr-2" />
                            Manage QR Code
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const embedCode = `<iframe src="https://waitumusic.com/${integration.slug}" width="100%" height="600" frameborder="0"></iframe>`;
                              navigator.clipboard.writeText(embedCode);
                              toast({ title: "Embed code copied to clipboard" });
                            }}
                          >
                            <Code className="h-4 w-4 mr-2" />
                            Copy Embed Code
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              /* Create New Page Section */
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Link className="h-5 w-5 text-blue-500" />
                    <span>Create Your All-Links Page</span>
                  </CardTitle>
                  <CardDescription>
                    Design your professional all-links page with custom themes, social media integration, and embeddable widgets.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                {/* Restriction Warning for Fully Managed Users */}
                {isFullyManaged && hasExistingIntegration && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <XCircle className="h-5 w-5 text-yellow-600" />
                      <div>
                        <h4 className="font-medium text-yellow-800">One Page Limit</h4>
                        <p className="text-sm text-yellow-700">
                          As a fully managed user (Role ID: {userRoleId}), you can only have one All-Links page. 
                          Please use the existing page or delete it to create a new one.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Basic Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Basic Settings</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="slug">Page Slug</Label>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">www.waitumusic.com/</span>
                        <Input
                          id="slug"
                          placeholder="your-name"
                          value={newIntegration.slug || ""}
                          onChange={(e) => setNewIntegration(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))}
                          className="flex-1"
                        />
                        {slugValidation.checking && <div className="text-yellow-600 text-sm">Checking...</div>}
                        {slugValidation.available === true && <CheckCircle className="h-4 w-4 text-green-600" />}
                        {slugValidation.available === false && <XCircle className="h-4 w-4 text-red-600" />}
                      </div>
                      <div className="text-sm">
                        {slugValidation.message && (
                          <span className={
                            slugValidation.available === true ? "text-green-600" :
                            slugValidation.available === false ? "text-red-600" :
                            "text-gray-500"
                          }>
                            {slugValidation.message}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={!!newIntegration.isActive}
                        onCheckedChange={(checked) => setNewIntegration(prev => ({ ...prev, isActive: checked }))}
                      />
                      <Label>Active</Label>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Content Management Sections */}
                <div className="space-y-6">
                  {/* Social Media Links */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center space-x-2">
                      <Instagram className="h-5 w-5 text-pink-500" />
                      <span>Social Media Links</span>
                    </h3>
                    <div className="space-y-3">
                      {(Array.isArray(newIntegration.socialLinks) ? newIntegration.socialLinks : []).map((link: any, index: number) => (
                        <div key={index} className="flex items-center space-x-2 p-3 border rounded-lg">
                          <Select
                            value={link.platform}
                            onValueChange={(value) => {
                              const currentLinks = Array.isArray(newIntegration.socialLinks) ? newIntegration.socialLinks : [];
                              const updatedLinks = [...currentLinks];
                              updatedLinks[index] = { ...link, platform: value };
                              setNewIntegration(prev => ({ ...prev, socialLinks: updatedLinks }));
                            }}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue placeholder="Platform" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="instagram">Instagram</SelectItem>
                              <SelectItem value="youtube">YouTube</SelectItem>
                              <SelectItem value="spotify">Spotify</SelectItem>
                              <SelectItem value="tiktok">TikTok</SelectItem>
                              <SelectItem value="twitter">Twitter</SelectItem>
                              <SelectItem value="facebook">Facebook</SelectItem>
                              <SelectItem value="website">Website</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            placeholder="URL"
                            value={link.url}
                            onChange={(e) => {
                              const currentLinks = Array.isArray(newIntegration.socialLinks) ? newIntegration.socialLinks : [];
                              const updatedLinks = [...currentLinks];
                              updatedLinks[index] = { ...link, url: e.target.value };
                              setNewIntegration(prev => ({ ...prev, socialLinks: updatedLinks }));
                            }}
                            className="flex-1"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const currentLinks = Array.isArray(newIntegration.socialLinks) ? newIntegration.socialLinks : [];
                              const updatedLinks = currentLinks.filter((_: any, i: number) => i !== index);
                              setNewIntegration(prev => ({ ...prev, socialLinks: updatedLinks }));
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        onClick={() => {
                          const newLink = { platform: '', url: '', title: '' };
                          const currentLinks = Array.isArray(newIntegration.socialLinks) ? newIntegration.socialLinks : [];
                          setNewIntegration(prev => ({ 
                            ...prev, 
                            socialLinks: [...currentLinks, newLink] 
                          }));
                        }}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Social Link
                      </Button>
                    </div>
                  </div>

                  {/* Music Links */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center space-x-2">
                      <Music className="h-5 w-5 text-green-500" />
                      <span>Music & Streaming</span>
                    </h3>
                    <div className="space-y-3">
                      {(Array.isArray(newIntegration.musicLinks) ? newIntegration.musicLinks : []).map((link: any, index: number) => (
                        <div key={index} className="flex items-center space-x-2 p-3 border rounded-lg">
                          <Select
                            value={link.platform}
                            onValueChange={(value) => {
                              const currentLinks = Array.isArray(newIntegration.musicLinks) ? newIntegration.musicLinks : [];
                              const updatedLinks = [...currentLinks];
                              updatedLinks[index] = { ...link, platform: value };
                              setNewIntegration(prev => ({ ...prev, musicLinks: updatedLinks }));
                            }}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue placeholder="Platform" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="spotify">Spotify</SelectItem>
                              <SelectItem value="apple">Apple Music</SelectItem>
                              <SelectItem value="youtube">YouTube Music</SelectItem>
                              <SelectItem value="soundcloud">SoundCloud</SelectItem>
                              <SelectItem value="bandcamp">Bandcamp</SelectItem>
                              <SelectItem value="deezer">Deezer</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            placeholder="Song/Album URL"
                            value={link.url}
                            onChange={(e) => {
                              const currentLinks = Array.isArray(newIntegration.musicLinks) ? newIntegration.musicLinks : [];
                              const updatedLinks = [...currentLinks];
                              updatedLinks[index] = { ...link, url: e.target.value };
                              setNewIntegration(prev => ({ ...prev, musicLinks: updatedLinks }));
                            }}
                            className="flex-1"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const currentLinks = Array.isArray(newIntegration.musicLinks) ? newIntegration.musicLinks : [];
                              const updatedLinks = currentLinks.filter((_: any, i: number) => i !== index);
                              setNewIntegration(prev => ({ ...prev, musicLinks: updatedLinks }));
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        onClick={() => {
                          const newLink = { platform: '', url: '', title: '' };
                          const currentLinks = Array.isArray(newIntegration.musicLinks) ? newIntegration.musicLinks : [];
                          setNewIntegration(prev => ({ 
                            ...prev, 
                            musicLinks: [...currentLinks, newLink] 
                          }));
                        }}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Music Link
                      </Button>
                    </div>
                  </div>

                  {/* Custom Links */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center space-x-2">
                      <ExternalLink className="h-5 w-5 text-blue-500" />
                      <span>Custom Links</span>
                    </h3>
                    <div className="space-y-3">
                      {(Array.isArray(newIntegration.customLinks) ? newIntegration.customLinks : []).map((link: any, index: number) => (
                        <div key={index} className="space-y-2 p-3 border rounded-lg">
                          <div className="flex items-center space-x-2">
                            <Input
                              placeholder="Link Title"
                              value={link.title}
                              onChange={(e) => {
                                const currentLinks = Array.isArray(newIntegration.customLinks) ? newIntegration.customLinks : [];
                                const updatedLinks = [...currentLinks];
                                updatedLinks[index] = { ...link, title: e.target.value };
                                setNewIntegration(prev => ({ ...prev, customLinks: updatedLinks }));
                              }}
                              className="flex-1"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const currentLinks = Array.isArray(newIntegration.customLinks) ? newIntegration.customLinks : [];
                                const updatedLinks = currentLinks.filter((_: any, i: number) => i !== index);
                                setNewIntegration(prev => ({ ...prev, customLinks: updatedLinks }));
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <Input
                            placeholder="URL"
                            value={link.url}
                            onChange={(e) => {
                              const currentLinks = Array.isArray(newIntegration.customLinks) ? newIntegration.customLinks : [];
                              const updatedLinks = [...currentLinks];
                              updatedLinks[index] = { ...link, url: e.target.value };
                              setNewIntegration(prev => ({ ...prev, customLinks: updatedLinks }));
                            }}
                          />
                          <Textarea
                            placeholder="Description (optional)"
                            value={link.description || ''}
                            onChange={(e) => {
                              const currentLinks = Array.isArray(newIntegration.customLinks) ? newIntegration.customLinks : [];
                              const updatedLinks = [...currentLinks];
                              updatedLinks[index] = { ...link, description: e.target.value };
                              setNewIntegration(prev => ({ ...prev, customLinks: updatedLinks }));
                            }}
                            rows={2}
                          />
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        onClick={() => {
                          const newLink = { title: '', url: '', description: '' };
                          const currentLinks = Array.isArray(newIntegration.customLinks) ? newIntegration.customLinks : [];
                          setNewIntegration(prev => ({ 
                            ...prev, 
                            customLinks: [...currentLinks, newLink] 
                          }));
                        }}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Custom Link
                      </Button>
                    </div>
                  </div>
                  {/* Embeddable Widgets Configuration */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center space-x-2">
                      <Code className="h-5 w-5 text-purple-500" />
                      <span>Embeddable Widgets</span>
                    </h3>
                    <p className="text-sm text-gray-600">
                      Configure widgets that you can embed on your personal website. 
                      <strong> If widgets are embedded, QR codes will redirect to your personal website instead of the WaituMusic page.</strong>
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { key: 'musicPlayer', label: 'Music Player Widget', icon: Music, color: 'text-green-500', description: 'Latest releases and music catalog' },
                        { key: 'bookingWidget', label: 'Performance Booking', icon: QrCode, color: 'text-blue-500', description: 'Live performance bookings' },
                        { key: 'consultationWidget', label: 'Consultation Booking', icon: Settings, color: 'text-teal-500', description: 'Professional consultation sessions' },
                        { key: 'socialFeed', label: 'Social Media Feed', icon: Instagram, color: 'text-pink-500', description: 'Aggregated social content' },
                        { key: 'tourDates', label: 'Tour Dates Widget', icon: ExternalLink, color: 'text-orange-500', description: 'Upcoming events and shows' },
                        { key: 'merchandise', label: 'Merch Showcase', icon: Globe, color: 'text-purple-500', description: 'Featured merchandise store' },
                        { key: 'serviceListing', label: 'Professional Services', icon: Code, color: 'text-indigo-500', description: 'Music production, mixing, etc.' },
                        { key: 'testimonials', label: 'Client Testimonials', icon: CheckCircle, color: 'text-emerald-500', description: 'Reviews and testimonials' }
                      ].map((widget) => (
                        <div key={widget.key} className="p-3 border rounded-lg space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <widget.icon className={`h-4 w-4 ${widget.color}`} />
                                <span className="font-medium text-sm">{widget.label}</span>
                              </div>
                              <p className="text-xs text-gray-500">{widget.description}</p>
                            </div>
                            <Switch
                              checked={newIntegration.enabledWidgets?.includes(widget.key) || false}
                              onCheckedChange={(checked) => {
                                // For fully managed users (roleId 3, 5, 7), enable widgets
                                if (user?.roleId && [1, 2, 3, 5, 7].includes(user.roleId)) {
                                  const currentWidgets = newIntegration.enabledWidgets || [];
                                  if (checked) {
                                    setNewIntegration(prev => ({
                                      ...prev,
                                      enabledWidgets: [...currentWidgets, widget.key]
                                    }));
                                  } else {
                                    setNewIntegration(prev => ({
                                      ...prev,
                                      enabledWidgets: currentWidgets.filter(w => w !== widget.key)
                                    }));
                                  }
                                } else {
                                  toast({
                                    title: "Pro Feature",
                                    description: "Embeddable widgets are available for fully managed talent and Pro subscription users."
                                  });
                                }
                              }}
                            />
                          </div>
                          {newIntegration.enabledWidgets?.includes(widget.key) && (
                            <Input
                              placeholder="Your website URL where this will be embedded"
                              value={newIntegration.widgetUrls?.[widget.key] || ''}
                              onChange={(e) => {
                                setNewIntegration(prev => ({
                                  ...prev,
                                  widgetUrls: {
                                    ...(prev.widgetUrls || {}),
                                    [widget.key]: e.target.value
                                  }
                                }));
                              }}
                              className="text-xs"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Page Theme Customization */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center space-x-2">
                      <Settings className="h-5 w-5 text-gray-500" />
                      <span>Page Appearance</span>
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Theme Color</label>
                        <Select
                          value={(newIntegration.customTheme as any)?.primaryColor || 'blue'}
                          onValueChange={(value) => {
                            setNewIntegration(prev => ({
                              ...prev,
                              customTheme: {
                                ...(prev.customTheme as any) || {},
                                primaryColor: value
                              }
                            }));
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select theme color" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="blue">Blue</SelectItem>
                            <SelectItem value="purple">Purple</SelectItem>
                            <SelectItem value="pink">Pink</SelectItem>
                            <SelectItem value="green">Green</SelectItem>
                            <SelectItem value="orange">Orange</SelectItem>
                            <SelectItem value="red">Red</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Layout Style</label>
                        <Select
                          value={(newIntegration.customTheme as any)?.layout || 'grid'}
                          onValueChange={(value) => {
                            setNewIntegration(prev => ({
                              ...prev,
                              customTheme: {
                                ...(prev.customTheme as any) || {},
                                layout: value
                              }
                            }));
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select layout" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="grid">Grid Layout</SelectItem>
                            <SelectItem value="list">List Layout</SelectItem>
                            <SelectItem value="cards">Card Layout</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Background Style</label>
                      <Select
                        value={(newIntegration.customTheme as any)?.background || 'gradient'}
                        onValueChange={(value) => {
                          setNewIntegration(prev => ({
                            ...prev,
                            customTheme: {
                              ...(prev.customTheme as any) || {},
                              background: value
                            }
                          }));
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select background" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gradient">Gradient</SelectItem>
                          <SelectItem value="solid">Solid Color</SelectItem>
                          <SelectItem value="pattern">Pattern</SelectItem>
                          <SelectItem value="image">Custom Image</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Privacy & Access Settings */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center space-x-2">
                      <Settings className="h-5 w-5 text-red-500" />
                      <span>Privacy & Access</span>
                    </h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="font-medium">Access Level</label>
                          <p className="text-sm text-gray-500">Control who can access your page</p>
                        </div>
                        <Select
                          value={newIntegration.accessLevel || 'public'}
                          onValueChange={(value) => {
                            setNewIntegration(prev => ({ ...prev, accessLevel: value }));
                          }}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="public">Public</SelectItem>
                            <SelectItem value="unlisted">Unlisted</SelectItem>
                            <SelectItem value="private">Private</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {newIntegration.accessLevel === 'private' && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Access Password</label>
                          <Input
                            type="password"
                            placeholder="Password protection coming soon"
                            value=""
                            onChange={() => {}}
                            disabled
                          />
                        </div>
                      )}

                      <div className="space-y-2">
                        <label className="text-sm font-medium">SEO Meta Description</label>
                        <Textarea
                          placeholder="Enter a description for search engines and social media..."
                          value={newIntegration.description || ""}
                          onChange={(e) => {
                            setNewIntegration(prev => ({ ...prev, description: e.target.value }));
                          }}
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <Button 
                  onClick={handleCreateIntegration}
                  disabled={createIntegrationMutation.isPending || slugValidation.available === false || !canCreateNew}
                  className="w-full"
                >
                  {createIntegrationMutation.isPending ? "Creating..." : 
                   !canCreateNew ? "Cannot Create - Limit Reached" : 
                   "Create All-Links Page"}
                </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>

    {/* Subscription Modal */}
    <Dialog open={showSubscriptionModal} onOpenChange={setShowSubscriptionModal}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Globe className="h-5 w-5 text-purple-600" />
            <span>All-Links Subscription Plans</span>
          </DialogTitle>
          <DialogDescription>
            Choose the perfect plan for your digital presence needs
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Subscription Plans */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Plan */}
            <Card className="border-blue-200 hover:border-blue-300 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-blue-600">Basic</span>
                  <Badge variant="outline" className="text-blue-600 border-blue-600">$4.99/month</Badge>
                </CardTitle>
                <CardDescription>Perfect for getting started</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">All social media platforms</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Single website integration</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Basic QR code generation</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Simple analytics</span>
                  </div>
                </div>
                <Button 
                  className="w-full"
                  onClick={() => createSubscription(1)}
                  disabled={subscriptionLoading}
                >
                  {subscriptionLoading ? "Processing..." : "Choose Basic"}
                </Button>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="border-purple-200 hover:border-purple-300 transition-colors relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-purple-600 text-white">Most Popular</Badge>
              </div>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-purple-600">Pro</span>
                  <Badge variant="outline" className="text-purple-600 border-purple-600">$9.99/month</Badge>
                </CardTitle>
                <CardDescription>Complete all-links solution</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">All social media platforms</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Streaming platform links</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Multiple website integrations</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Advanced QR customization</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Detailed analytics</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Malware protection & monitoring</span>
                  </div>
                </div>
                <Button 
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  onClick={() => createSubscription(2)}
                  disabled={subscriptionLoading}
                >
                  {subscriptionLoading ? "Processing..." : "Choose Pro"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Important Terms */}
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-orange-800 flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Important Terms & Conditions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-orange-800">
              <div className="space-y-2">
                <p><strong>Malware Protection:</strong> We actively monitor all linked websites for malware, phishing, and malicious content.</p>
                <p><strong>Penalty System:</strong> If a linked website is found on our blocklist or provides malware, you will be charged an additional <strong>$9.99/month penalty</strong> for each month the link remains active.</p>
                <p><strong>Payment Information:</strong> Valid payment information (card or PayPal) must be on file before proceeding.</p>
                <p><strong>Link Monitoring:</strong> Remove flagged links immediately to avoid ongoing penalties.</p>
                <p><strong>Service Continuity:</strong> Subscriptions auto-renew monthly. Cancel anytime from your dashboard.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>

    {/* Edit Integration Modal with QR Code Tab */}
    {selectedIntegration && (
      <Dialog open={!!selectedIntegration} onOpenChange={() => setSelectedIntegration(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Edit className="h-5 w-5" />
              <span>Manage All-Links Page: /{selectedIntegration.slug}</span>
            </DialogTitle>
            <DialogDescription>
              Edit content, get embed codes, customize QR codes, and view analytics for your page.
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeEditTab} onValueChange={(value: any) => setActiveEditTab(value)} className="space-y-6">
            <div className="flex items-center space-x-1 border-b">
              <Button 
                variant={activeEditTab === "content" ? "default" : "ghost"} 
                size="sm"
                onClick={() => setActiveEditTab("content")}
              >
                Content
              </Button>
              <Button 
                variant={activeEditTab === "widgets" ? "default" : "ghost"} 
                size="sm"
                onClick={() => setActiveEditTab("widgets")}
              >
                Embed Codes
              </Button>
              <Button 
                variant={activeEditTab === "qr" ? "default" : "ghost"} 
                size="sm"
                onClick={() => setActiveEditTab("qr")}
              >
                QR Codes
              </Button>
              <Button 
                variant={activeEditTab === "analytics" ? "default" : "ghost"} 
                size="sm"
                onClick={() => setActiveEditTab("analytics")}
              >
                Analytics
              </Button>
              <Button 
                variant={activeEditTab === "settings" ? "default" : "ghost"} 
                size="sm"
                onClick={() => setActiveEditTab("settings")}
              >
                Settings
              </Button>
            </div>

            {/* Content Tab */}
            {activeEditTab === "content" && (
              <TabsContent value="content" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Edit className="h-5 w-5 text-blue-600" />
                      <span>Edit Page Content</span>
                    </CardTitle>
                    <CardDescription>
                      Update your page title, description, and link organization.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="pageTitle">Page Title</Label>
                        <Input
                          id="pageTitle"
                          value={editingIntegration?.title || selectedIntegration.title || selectedIntegration.slug}
                          onChange={(e) => setEditingIntegration(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Your Page Title"
                        />
                      </div>
                      <div>
                        <Label htmlFor="pageDescription">Page Description</Label>
                        <Textarea
                          id="pageDescription"
                          value={editingIntegration?.description || selectedIntegration.description || ""}
                          onChange={(e) => setEditingIntegration(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Describe your page for visitors..."
                          rows={3}
                        />
                      </div>
                      <div className="space-y-3">
                        <h3 className="font-medium">Link Management</h3>
                        <div className="grid gap-4">
                          {/* Social Media Links */}
                          <div className="p-4 border rounded-lg">
                            <h4 className="font-medium mb-2">Social Media Links</h4>
                            <p className="text-sm text-gray-500 mb-3">Connect your social media profiles</p>
                            <div className="space-y-2">
                              {(editingIntegration?.socialLinks || selectedIntegration.socialLinks || []).map((link: any, index: number) => (
                                <div key={index} className="flex items-center space-x-2">
                                  <Select
                                    value={link.platform}
                                    onValueChange={(platform) => {
                                      const updatedLinks = [...(editingIntegration?.socialLinks || selectedIntegration.socialLinks || [])];
                                      updatedLinks[index] = { ...updatedLinks[index], platform };
                                      setEditingIntegration(prev => ({ ...prev, socialLinks: updatedLinks }));
                                    }}
                                  >
                                    <SelectTrigger className="w-[140px]">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="instagram">Instagram</SelectItem>
                                      <SelectItem value="twitter">Twitter</SelectItem>
                                      <SelectItem value="facebook">Facebook</SelectItem>
                                      <SelectItem value="tiktok">TikTok</SelectItem>
                                      <SelectItem value="youtube">YouTube</SelectItem>
                                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                                      <SelectItem value="snapchat">Snapchat</SelectItem>
                                      <SelectItem value="website">Website</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <Input 
                                    value={link.url} 
                                    onChange={(e) => {
                                      const updatedLinks = [...(editingIntegration?.socialLinks || selectedIntegration.socialLinks || [])];
                                      updatedLinks[index] = { ...updatedLinks[index], url: e.target.value };
                                      setEditingIntegration(prev => ({ ...prev, socialLinks: updatedLinks }));
                                    }}
                                    placeholder="Enter URL"
                                    className="flex-1" 
                                  />
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const updatedLinks = (editingIntegration?.socialLinks || selectedIntegration.socialLinks || []).filter((_, i) => i !== index);
                                      setEditingIntegration(prev => ({ ...prev, socialLinks: updatedLinks }));
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const currentLinks = editingIntegration?.socialLinks || selectedIntegration.socialLinks || [];
                                  setEditingIntegration(prev => ({ 
                                    ...prev, 
                                    socialLinks: [...currentLinks, { platform: 'instagram', url: '', title: '' }] 
                                  }));
                                }}
                                className="w-full"
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Social Media Link
                              </Button>
                            </div>
                          </div>

                          {/* Music Platform Links */}
                          <div className="p-4 border rounded-lg">
                            <h4 className="font-medium mb-2">Music Platform Links</h4>
                            <p className="text-sm text-gray-500 mb-3">Link to your music on streaming platforms</p>
                            <div className="space-y-2">
                              {(editingIntegration?.musicLinks || selectedIntegration.musicLinks || []).map((link: any, index: number) => (
                                <div key={index} className="flex items-center space-x-2">
                                  <Select
                                    value={link.platform}
                                    onValueChange={(platform) => {
                                      const updatedLinks = [...(editingIntegration?.musicLinks || selectedIntegration.musicLinks || [])];
                                      updatedLinks[index] = { ...updatedLinks[index], platform };
                                      setEditingIntegration(prev => ({ ...prev, musicLinks: updatedLinks }));
                                    }}
                                  >
                                    <SelectTrigger className="w-[140px]">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="spotify">Spotify</SelectItem>
                                      <SelectItem value="apple-music">Apple Music</SelectItem>
                                      <SelectItem value="youtube-music">YouTube Music</SelectItem>
                                      <SelectItem value="amazon-music">Amazon Music</SelectItem>
                                      <SelectItem value="deezer">Deezer</SelectItem>
                                      <SelectItem value="tidal">Tidal</SelectItem>
                                      <SelectItem value="soundcloud">SoundCloud</SelectItem>
                                      <SelectItem value="bandcamp">Bandcamp</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <Input 
                                    value={link.url} 
                                    onChange={(e) => {
                                      const updatedLinks = [...(editingIntegration?.musicLinks || selectedIntegration.musicLinks || [])];
                                      updatedLinks[index] = { ...updatedLinks[index], url: e.target.value };
                                      setEditingIntegration(prev => ({ ...prev, musicLinks: updatedLinks }));
                                    }}
                                    placeholder="Enter URL"
                                    className="flex-1" 
                                  />
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const updatedLinks = (editingIntegration?.musicLinks || selectedIntegration.musicLinks || []).filter((_, i) => i !== index);
                                      setEditingIntegration(prev => ({ ...prev, musicLinks: updatedLinks }));
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const currentLinks = editingIntegration?.musicLinks || selectedIntegration.musicLinks || [];
                                  setEditingIntegration(prev => ({ 
                                    ...prev, 
                                    musicLinks: [...currentLinks, { platform: 'spotify', url: '', title: '' }] 
                                  }));
                                }}
                                className="w-full"
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Music Platform Link
                              </Button>
                            </div>
                          </div>

                          {/* Custom Links */}
                          <div className="p-4 border rounded-lg">
                            <h4 className="font-medium mb-2">Custom Links</h4>
                            <p className="text-sm text-gray-500 mb-3">Add any other links or custom content</p>
                            <div className="space-y-2">
                              {(editingIntegration?.customLinks || selectedIntegration.customLinks || []).map((link: any, index: number) => (
                                <div key={index} className="space-y-2 p-3 border rounded">
                                  <div className="flex items-center space-x-2">
                                    <Select
                                      value={link.type}
                                      onValueChange={(type) => {
                                        const updatedLinks = [...(editingIntegration?.customLinks || selectedIntegration.customLinks || [])];
                                        updatedLinks[index] = { ...updatedLinks[index], type };
                                        setEditingIntegration(prev => ({ ...prev, customLinks: updatedLinks }));
                                      }}
                                    >
                                      <SelectTrigger className="w-[140px]">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="custom">Custom Link</SelectItem>
                                        <SelectItem value="music-player">Music Player</SelectItem>
                                        <SelectItem value="store">Store</SelectItem>
                                        <SelectItem value="services">Services</SelectItem>
                                        <SelectItem value="booking">Booking</SelectItem>
                                        <SelectItem value="newsletter">Newsletter</SelectItem>
                                        <SelectItem value="contact">Contact</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <Input 
                                      value={link.title} 
                                      onChange={(e) => {
                                        const updatedLinks = [...(editingIntegration?.customLinks || selectedIntegration.customLinks || [])];
                                        updatedLinks[index] = { ...updatedLinks[index], title: e.target.value };
                                        setEditingIntegration(prev => ({ ...prev, customLinks: updatedLinks }));
                                      }}
                                      placeholder="Link Title"
                                      className="flex-1" 
                                    />
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        const updatedLinks = (editingIntegration?.customLinks || selectedIntegration.customLinks || []).filter((_, i) => i !== index);
                                        setEditingIntegration(prev => ({ ...prev, customLinks: updatedLinks }));
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  <Input 
                                    value={link.url} 
                                    onChange={(e) => {
                                      const updatedLinks = [...(editingIntegration?.customLinks || selectedIntegration.customLinks || [])];
                                      updatedLinks[index] = { ...updatedLinks[index], url: e.target.value };
                                      setEditingIntegration(prev => ({ ...prev, customLinks: updatedLinks }));
                                    }}
                                    placeholder="Enter URL"
                                    className="w-full" 
                                  />
                                  <Input 
                                    value={link.description || ''} 
                                    onChange={(e) => {
                                      const updatedLinks = [...(editingIntegration?.customLinks || selectedIntegration.customLinks || [])];
                                      updatedLinks[index] = { ...updatedLinks[index], description: e.target.value };
                                      setEditingIntegration(prev => ({ ...prev, customLinks: updatedLinks }));
                                    }}
                                    placeholder="Description (optional)"
                                    className="w-full" 
                                  />
                                </div>
                              ))}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const currentLinks = editingIntegration?.customLinks || selectedIntegration.customLinks || [];
                                  setEditingIntegration(prev => ({ 
                                    ...prev, 
                                    customLinks: [...currentLinks, { type: 'custom', title: '', url: '', description: '' }] 
                                  }));
                                }}
                                className="w-full"
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Custom Link
                              </Button>
                            </div>
                          </div>

                          {/* Page Widgets */}
                          <div className="p-4 border rounded-lg">
                            <h4 className="font-medium mb-2">Page Widgets</h4>
                            <p className="text-sm text-gray-500 mb-3">Enable interactive widgets to display on your All-Links page</p>
                            <div className="space-y-3">
                              {[
                                { key: 'musicPlayer', label: 'Music Player', description: 'Display your latest tracks with playback', icon: '🎵' },
                                { key: 'bookingWidget', label: 'Booking Widget', description: 'Allow visitors to book you directly', icon: '📅' },
                                { key: 'merchandiseStore', label: 'Merchandise Store', description: 'Showcase and sell your merch', icon: '🛒' },
                                { key: 'servicesWidget', label: 'Professional Services', description: 'Display your professional services', icon: '💼' },
                                { key: 'contactForm', label: 'Contact Form', description: 'Let visitors send you messages', icon: '💬' },
                                { key: 'newsletterSignup', label: 'Newsletter Signup', description: 'Build your email subscriber list', icon: '📧' },
                                { key: 'tourDates', label: 'Tour Dates', description: 'Show upcoming performances', icon: '🎤' },
                                { key: 'pressKit', label: 'Press Kit', description: 'Media resources for press and venues', icon: '📰' }
                              ].map((widget) => (
                                <div key={widget.key} className="flex items-center justify-between p-3 border rounded">
                                  <div className="flex items-center space-x-3">
                                    <span className="text-lg">{widget.icon}</span>
                                    <div>
                                      <p className="font-medium text-sm">{widget.label}</p>
                                      <p className="text-xs text-gray-500">{widget.description}</p>
                                    </div>
                                  </div>
                                  <Switch
                                    checked={editingIntegration?.enabledWidgets?.[widget.key] || selectedIntegration.enabledWidgets?.[widget.key] || false}
                                    onCheckedChange={(checked) => {
                                      setEditingIntegration(prev => ({ 
                                        ...prev, 
                                        enabledWidgets: { 
                                          ...(prev?.enabledWidgets || selectedIntegration.enabledWidgets || {}), 
                                          [widget.key]: checked 
                                        }
                                      }));
                                    }}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <Button 
                        onClick={async () => {
                          try {
                            const updateData = {
                              title: editingIntegration?.title || selectedIntegration.title,
                              description: editingIntegration?.description || selectedIntegration.description,
                              socialLinks: editingIntegration?.socialLinks || selectedIntegration.socialLinks || [],
                              musicLinks: editingIntegration?.musicLinks || selectedIntegration.musicLinks || [],
                              customLinks: editingIntegration?.customLinks || selectedIntegration.customLinks || [],
                              enabledWidgets: editingIntegration?.enabledWidgets || selectedIntegration.enabledWidgets || {}
                            };
                            
                            const response = await apiRequest(`/api/website-integrations/${selectedIntegration.id}`, {
                              method: 'PUT',
                              body: updateData
                            });
                            
                            if (response.ok) {
                              // Invalidate all relevant cache queries
                              queryClient.invalidateQueries({ queryKey: ['/api/website-integrations'] });
                              if (artistId) {
                                queryClient.invalidateQueries({ queryKey: ['/api/website-integrations', 'artist', artistId] });
                              }
                              // Also invalidate the specific integration cache
                              queryClient.invalidateQueries({ queryKey: [`/api/website-integrations/${selectedIntegration.id}`] });
                              setEditingIntegration(null);
                              toast({
                                title: "Page Updated",
                                description: "Your all-links page has been updated successfully."
                              });
                            }
                          } catch (error) {
                            toast({
                              title: "Update Failed",
                              description: "Failed to update your page. Please try again.",
                              variant: "destructive"
                            });
                          }
                        }}
                        className="w-full"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {/* Widgets Tab */}
            {activeEditTab === "widgets" && (
              <TabsContent value="widgets" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Code className="h-5 w-5 text-green-600" />
                      <span>Embed Codes</span>
                    </CardTitle>
                    <CardDescription>
                      Get embed codes to add your all-links page or individual widgets to other websites.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium mb-2">Full Page Embed</h3>
                        <p className="text-sm text-gray-500 mb-3">Embed the complete all-links page in an iframe</p>
                        <div className="p-3 bg-gray-50 rounded border font-mono text-sm">
                          {`<iframe src="https://waitumusic.com/${selectedIntegration.slug}" width="100%" height="600" frameborder="0"></iframe>`}
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                          onClick={() => {
                            const embedCode = `<iframe src="https://waitumusic.com/${selectedIntegration.slug}" width="100%" height="600" frameborder="0"></iframe>`;
                            navigator.clipboard.writeText(embedCode);
                            toast({ title: "Embed code copied to clipboard" });
                          }}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Code
                        </Button>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="font-medium mb-2">Individual Widget Embeds</h3>
                        <p className="text-sm text-gray-500 mb-3">Embed specific widgets independently on your website</p>
                        
                        <div className="space-y-4">
                          {(() => {
                            const allWidgets = [
                              { key: 'musicPlayer', label: 'Music Player Widget', description: 'Embed your latest music player' },
                              { key: 'bookingWidget', label: 'Booking Widget', description: 'Embed booking form directly' },
                              { key: 'merchandiseStore', label: 'Store Widget', description: 'Embed merchandise store' },
                              { key: 'servicesWidget', label: 'Services Widget', description: 'Embed professional services' },
                              { key: 'contactForm', label: 'Contact Widget', description: 'Embed contact form' },
                              { key: 'newsletterSignup', label: 'Newsletter Widget', description: 'Embed newsletter signup' },
                              { key: 'tourDates', label: 'Tour Dates Widget', description: 'Embed upcoming performances' },
                              { key: 'pressKit', label: 'Press Kit Widget', description: 'Embed media resources' }
                            ];

                            const enabledWidgets = selectedIntegration.enabledWidgets || {};
                            const activeWidgets = allWidgets.filter(widget => enabledWidgets[widget.key] === true);

                            if (activeWidgets.length === 0) {
                              return (
                                <div className="text-center py-8 text-gray-500">
                                  <Settings className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                                  <p className="text-lg font-medium">No Widgets Enabled</p>
                                  <p className="text-sm">Go to the Content tab to enable widgets for your All-Links page.</p>
                                  <Button 
                                    variant="outline" 
                                    onClick={() => setActiveEditTab("content")}
                                    className="mt-4"
                                  >
                                    Enable Widgets
                                  </Button>
                                </div>
                              );
                            }

                            return activeWidgets.map((widget) => (
                              <div key={widget.key} className="p-4 border rounded-lg space-y-3">
                                <div>
                                  <h4 className="font-medium">{widget.label}</h4>
                                  <p className="text-sm text-gray-500">{widget.description}</p>
                                </div>
                                
                                <div>
                                  <Label className="text-sm">Embed Code</Label>
                                  <div className="p-3 bg-gray-50 rounded border font-mono text-xs mt-1">
                                    {`<iframe src="https://waitumusic.com/widget/${selectedIntegration.slug}/${widget.key}" width="100%" height="400" frameborder="0"></iframe>`}
                                  </div>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="mt-2"
                                    onClick={() => {
                                      const embedCode = `<iframe src="https://waitumusic.com/widget/${selectedIntegration.slug}/${widget.key}" width="100%" height="400" frameborder="0"></iframe>`;
                                      navigator.clipboard.writeText(embedCode);
                                      toast({ title: `${widget.label} embed code copied` });
                                    }}
                                  >
                                    <Copy className="h-4 w-4 mr-2" />
                                    Copy Widget Code
                                  </Button>
                                </div>
                              </div>
                            ));
                          })()}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="font-medium mb-2">Button Link</h3>
                        <p className="text-sm text-gray-500 mb-3">Simple link button for your website</p>
                        <div className="p-3 bg-gray-50 rounded border font-mono text-sm">
                          {`<a href="https://waitumusic.com/${selectedIntegration.slug}" target="_blank" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View My Links</a>`}
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                          onClick={() => {
                            const linkCode = `<a href="https://waitumusic.com/${selectedIntegration.slug}" target="_blank" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View My Links</a>`;
                            navigator.clipboard.writeText(linkCode);
                            toast({ title: "Button code copied to clipboard" });
                          }}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Code
                        </Button>
                      </div>

                      <Separator />

                      <div>
                        <h3 className="font-medium mb-2">Direct URL</h3>
                        <p className="text-sm text-gray-500 mb-3">Share the direct link to your page</p>
                        <div className="p-3 bg-gray-50 rounded border font-mono text-sm">
                          https://waitumusic.com/{selectedIntegration.slug}
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                          onClick={() => {
                            navigator.clipboard.writeText(`https://waitumusic.com/${selectedIntegration.slug}`);
                            toast({ title: "URL copied to clipboard" });
                          }}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy URL
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {/* QR Codes Tab */}
            {activeEditTab === "qr" && (
              <TabsContent value="qr" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <QrCode className="h-5 w-5 text-purple-600" />
                      <span>QR Code Manager</span>
                    </CardTitle>
                    <CardDescription>
                      Customize and download QR codes for your all-links page with transparent backgrounds and custom colors.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* QR Code Preview */}
                      <div className="space-y-4">
                        <h3 className="font-medium">Preview</h3>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center min-h-[300px] bg-gray-50">
                          {qrCodeData ? (
                            <div className="text-center space-y-4">
                              <img 
                                src={qrCodeData.qrCode} 
                                alt="QR Code Preview" 
                                className="w-48 h-48 mx-auto"
                                style={{
                                  backgroundColor: qrOptions.transparent ? 'transparent' : qrOptions.backgroundColor
                                }}
                              />
                              <div className="space-y-1">
                                <p className="text-sm font-medium">{qrCodeData.title}</p>
                                <p className="text-xs text-gray-500">{qrCodeData.url}</p>
                              </div>
                              <Button 
                                onClick={downloadQRCode}
                                className="flex items-center space-x-2"
                              >
                                <Download className="h-4 w-4" />
                                <span>Download PNG</span>
                              </Button>
                            </div>
                          ) : (
                            <div className="text-center space-y-4">
                              <QrCode className="h-16 w-16 text-gray-400 mx-auto" />
                              <div>
                                <h4 className="font-medium text-gray-900">Generate QR Code</h4>
                                <p className="text-sm text-gray-500">
                                  Customize your settings below and generate a QR code for your page.
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* QR Code Settings */}
                      <div className="space-y-6">
                        <h3 className="font-medium">Customization Options</h3>
                        
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="transparent" className="text-sm font-medium">
                              Transparent Background
                            </Label>
                            <Switch
                              id="transparent"
                              checked={qrOptions.transparent}
                              onCheckedChange={(checked) => 
                                setQrOptions(prev => ({ ...prev, transparent: checked }))
                              }
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="color" className="text-sm font-medium">
                              QR Code Color
                            </Label>
                            <div className="flex items-center space-x-2">
                              <Input
                                id="color"
                                type="color"
                                value={qrOptions.color}
                                onChange={(e) => 
                                  setQrOptions(prev => ({ ...prev, color: e.target.value }))
                                }
                                className="w-16 h-10 p-1 border rounded"
                              />
                              <Input
                                type="text"
                                value={qrOptions.color}
                                onChange={(e) => 
                                  setQrOptions(prev => ({ ...prev, color: e.target.value }))
                                }
                                placeholder="#000000"
                                className="flex-1"
                              />
                            </div>
                          </div>

                          {!qrOptions.transparent && (
                            <div className="space-y-2">
                              <Label htmlFor="backgroundColor" className="text-sm font-medium">
                                Background Color
                              </Label>
                              <div className="flex items-center space-x-2">
                                <Input
                                  id="backgroundColor"
                                  type="color"
                                  value={qrOptions.backgroundColor}
                                  onChange={(e) => 
                                    setQrOptions(prev => ({ ...prev, backgroundColor: e.target.value }))
                                  }
                                  className="w-16 h-10 p-1 border rounded"
                                />
                                <Input
                                  type="text"
                                  value={qrOptions.backgroundColor}
                                  onChange={(e) => 
                                    setQrOptions(prev => ({ ...prev, backgroundColor: e.target.value }))
                                  }
                                  placeholder="#FFFFFF"
                                  className="flex-1"
                                />
                              </div>
                            </div>
                          )}

                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="includeProfilePicture" className="text-sm font-medium">
                                Include Profile Picture
                              </Label>
                              <Switch
                                id="includeProfilePicture"
                                checked={qrOptions.includeProfilePicture}
                                onCheckedChange={(checked) => 
                                  setQrOptions(prev => ({ 
                                    ...prev, 
                                    includeProfilePicture: checked,
                                    customImageUrl: checked ? '' : prev.customImageUrl // Clear custom image if profile pic is selected
                                  }))
                                }
                              />
                            </div>

                            {qrOptions.includeProfilePicture && (
                              <div className="space-y-2">
                                <Label htmlFor="profilePictureUrl" className="text-sm font-medium">
                                  Profile Picture URL
                                </Label>
                                <Input
                                  id="profilePictureUrl"
                                  type="url"
                                  value={qrOptions.profilePictureUrl}
                                  onChange={(e) => 
                                    setQrOptions(prev => ({ ...prev, profilePictureUrl: e.target.value }))
                                  }
                                  placeholder="https://example.com/profile.jpg"
                                  className="w-full"
                                />
                                <p className="text-xs text-gray-500">
                                  Profile picture takes priority over custom image when enabled
                                </p>
                              </div>
                            )}

                            {!qrOptions.includeProfilePicture && (
                              <div className="space-y-2">
                                <Label htmlFor="customImageUrl" className="text-sm font-medium">
                                  Custom Center Image URL
                                </Label>
                                <Input
                                  id="customImageUrl"
                                  type="url"
                                  value={qrOptions.customImageUrl}
                                  onChange={(e) => 
                                    setQrOptions(prev => ({ ...prev, customImageUrl: e.target.value }))
                                  }
                                  placeholder="https://example.com/logo.png"
                                  className="w-full"
                                />
                                <p className="text-xs text-gray-500">
                                  Add any custom graphic or logo to the center of the QR code
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        <Separator />

                        <div className="space-y-4">
                          <Button 
                            onClick={() => generateQRCodeMutation.mutate({ 
                              integrationId: selectedIntegration.id, 
                              options: qrOptions 
                            })}
                            disabled={generateQRCodeMutation.isPending}
                            className="w-full"
                          >
                            {generateQRCodeMutation.isPending ? "Generating..." : "Generate QR Code"}
                          </Button>

                          {qrCodeData && (
                            <div className="text-center space-y-2">
                              <p className="text-sm text-gray-600">
                                QR code links to: <span className="font-mono text-blue-600">{qrCodeData.url}</span>
                              </p>
                              <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
                                <span>Format: PNG</span>
                                <span>Size: 512x512</span>
                                <span>Error Correction: Medium</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {/* Analytics Tab */}
            {activeEditTab === "analytics" && (
              <TabsContent value="analytics" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Eye className="h-5 w-5 text-orange-600" />
                      <span>Page Analytics</span>
                    </CardTitle>
                    <CardDescription>
                      View visitor statistics and engagement metrics for your all-links page.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="p-6">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{selectedIntegration.clicks || 0}</div>
                            <p className="text-sm text-gray-500">Total Clicks</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-6">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">0</div>
                            <p className="text-sm text-gray-500">This Week</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-6">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">0</div>
                            <p className="text-sm text-gray-500">Today</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="font-medium">Recent Activity</h3>
                      <div className="p-4 border rounded-lg">
                        <p className="text-sm text-gray-500 text-center py-8">
                          Analytics data will appear here once visitors start interacting with your page.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-medium">Quick Actions</h3>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(`https://waitumusic.com/${selectedIntegration.slug}`, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Live Page
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(`https://waitumusic.com/${selectedIntegration.slug}`);
                            toast({ title: "Page URL copied to clipboard" });
                          }}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Link
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {/* Settings Tab */}
            {activeEditTab === "settings" && (
              <TabsContent value="settings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Settings className="h-5 w-5 text-gray-600" />
                      <span>Page Settings</span>
                    </CardTitle>
                    <CardDescription>
                      Configure privacy, access control, and advanced options for your page.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">Page Status</h3>
                          <p className="text-sm text-gray-500">Enable or disable your all-links page</p>
                        </div>
                        <Switch
                          checked={selectedIntegration.isActive}
                          onCheckedChange={() => {
                            toast({
                              title: "Settings Update",
                              description: "Page status modification coming soon in full release."
                            });
                          }}
                        />
                      </div>

                      <Separator />

                      <div>
                        <h3 className="font-medium mb-2">Access Level</h3>
                        <p className="text-sm text-gray-500 mb-3">Control who can view your page</p>
                        <Select value={selectedIntegration.accessLevel} onValueChange={() => {}}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="public">Public - Anyone can view</SelectItem>
                            <SelectItem value="unlisted">Unlisted - Only with direct link</SelectItem>
                            <SelectItem value="private">Private - Password protected</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Separator />

                      <div>
                        <h3 className="font-medium mb-2">Page Information</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Page URL:</span>
                            <span className="font-mono">waitumusic.com/{selectedIntegration.slug}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Created:</span>
                            <span>{new Date(selectedIntegration.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Last Updated:</span>
                            <span>{new Date(selectedIntegration.updatedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h3 className="font-medium mb-2 text-red-600">Danger Zone</h3>
                        <p className="text-sm text-gray-500 mb-3">Irreversible actions for your page</p>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete your all-links page "/${selectedIntegration.slug}"? This action cannot be undone.`)) {
                              // handleDeleteIntegration would be called here
                              toast({
                                title: "Delete Confirmation",
                                description: "Page deletion will be implemented in the full release."
                              });
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Page
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </DialogContent>
      </Dialog>
    )}
    </>
  );
}
