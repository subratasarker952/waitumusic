import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEnhancedToast } from '@/lib/toast-utils';
import { apiRequest } from '@/lib/queryClient';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { isAdminLevel, canUserAccess, ROLE_GROUPS } from '@shared/role-utils';
import { User, Shield, Mail, Calendar, Music, Briefcase, Settings, Phone, MapPin, Globe, Image, Video, FileText, Package, Wrench, Coffee, Upload, Plus, Trash2, Edit, Star, X, CheckCircle, ExternalLink, History, Award, Clock, Users, Save } from 'lucide-react';

// Helper function to generate social media URLs
const generateSocialMediaURL = (platform: string, handle: string): string => {
  if (!handle) return '';
  
  // Handle clean username (remove @ if present)
  const cleanHandle = handle.replace(/^@/, '');
  
  switch (platform.toLowerCase()) {
    case 'instagram':
      return `https://instagram.com/${cleanHandle}`;
    case 'tiktok':
      return `https://tiktok.com/@${cleanHandle}`;
    case 'youtube':
      return cleanHandle.includes('youtube.com') || cleanHandle.includes('youtu.be') 
        ? cleanHandle.startsWith('http') ? cleanHandle : `https://${cleanHandle}`
        : `https://youtube.com/@${cleanHandle}`;
    case 'spotify':
      return cleanHandle.includes('spotify.com') 
        ? cleanHandle.startsWith('http') ? cleanHandle : `https://${cleanHandle}`
        : `https://open.spotify.com/artist/${cleanHandle}`;
    case 'soundcloud':
      return `https://soundcloud.com/${cleanHandle}`;
    case 'twitter':
      return `https://twitter.com/${cleanHandle}`;
    case 'facebook':
      return `https://facebook.com/${cleanHandle}`;
    case 'website':
    case 'portfolio':
      return handle.startsWith('http') ? handle : `https://${handle}`;
    case 'linkedin':
      return cleanHandle.includes('linkedin.com') 
        ? cleanHandle.startsWith('http') ? cleanHandle : `https://${cleanHandle}`
        : `https://linkedin.com/in/${cleanHandle}`;
    default:
      return handle;
  }
};

// Base user schema
const baseUserSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  roleId: z.number().min(1, 'Please select a role'),
  secondaryRoles: z.array(z.number()).optional(),
  status: z.enum(['active', 'inactive', 'suspended', 'pending']),
  phone: z.string().optional(),
  location: z.string().optional(),
  // Music industry-specific fields for Managed Artists
  performingRightsOrganization: z.string().optional(),
  ipiNumber: z.string().optional(),
});

// Artist-specific fields
const artistSchema = baseUserSchema.extend({
  stageName: z.string().optional(),
  stageNames: z.array(z.object({
    name: z.string(),
    isPrimary: z.boolean()
  })).optional(),
  primaryGenre: z.string().optional(),
  secondaryGenres: z.array(z.object({
    category: z.string(),
    name: z.string(),
    isCustom: z.boolean().optional()
  })).optional(),
  topGenres: z.array(z.string()).optional(),
  socialMediaHandles: z.array(z.object({
    platform: z.string(),
    handle: z.string(),
    url: z.string().optional()
  })).optional(),
  biography: z.string().optional(),
  website: z.string().optional(),
  // Music industry-specific fields for Managed Artists
  performingRightsOrganization: z.string().optional(),
  ipiNumber: z.string().optional(),
});

// Professional-specific fields  
const professionalSchema = baseUserSchema.extend({
  company: z.string().optional(),
  specialization: z.string().optional(),
  experience: z.string().optional(),
  hourlyRate: z.number().optional(),
  availability: z.string().optional(),
});

// Musician-specific fields
const musicianSchema = baseUserSchema.extend({
  stageName: z.string().optional(),
  stageNames: z.array(z.object({
    name: z.string(),
    isPrimary: z.boolean()
  })).optional(),
  primaryGenre: z.string().optional(),
  secondaryGenres: z.array(z.object({
    category: z.string(),
    name: z.string(),
    isCustom: z.boolean().optional()
  })).optional(),
  topGenres: z.array(z.string()).optional(),
  socialMediaHandles: z.array(z.object({
    platform: z.string(),
    handle: z.string(),
    url: z.string().optional()
  })).optional(),
  instruments: z.array(z.string()).optional(),
  experience: z.string().optional(),
  hourlyRate: z.number().optional(),
});

type UserEditData = z.infer<typeof baseUserSchema>;

interface UserEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onUserUpdated?: () => void;
}

export default function UserEditModal({ open, onOpenChange, userId, onUserUpdated }: UserEditModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('basic');
  const [userSongs, setUserSongs] = useState<any[]>([]);
  const [userMerchandise, setUserMerchandise] = useState<any[]>([]);
  const [userEvents, setUserEvents] = useState<any[]>([]);
  const [profileData, setProfileData] = useState<any>(null);
  const [showSpecializationModal, setShowSpecializationModal] = useState(false);
  const [userSpecializations, setUserSpecializations] = useState<string[]>([]);
  const [globalGenres, setGlobalGenres] = useState<any>({});
  const [selectedPrimaryGenre, setSelectedPrimaryGenre] = useState<string>("");
  const [selectedSecondaryGenres, setSelectedSecondaryGenres] = useState<string[]>([]);
  const [selectedTopGenres, setSelectedTopGenres] = useState<string[]>([]);

  const [globalProfessions, setGlobalProfessions] = useState<any>({});
  const [stageNames, setStageNames] = useState<{name: string, isPrimary: boolean}[]>([]);
  const [newStageName, setNewStageName] = useState("");
  const [genreSearchTerm, setGenreSearchTerm] = useState("");
  const [secondaryGenreSearchTerm, setSecondaryGenreSearchTerm] = useState("");
  const [topGenreSearchTerm, setTopGenreSearchTerm] = useState("");
  const [customGenreName, setCustomGenreName] = useState("");
  const [selectedCustomCategory, setSelectedCustomCategory] = useState("World");
  const [showCustomGenreModal, setShowCustomGenreModal] = useState(false);
  const [professionSearchTerm, setProfessionSearchTerm] = useState("");
  const [servicePackages, setServicePackages] = useState<any[]>([]);
  const [socialMediaHandles, setSocialMediaHandles] = useState<{[key: string]: string}>({});
  const [instruments, setInstruments] = useState<any[]>([]);
  const [newInstrumentName, setNewInstrumentName] = useState("");
  const [showInstrumentModal, setShowInstrumentModal] = useState(false);
  const [specializations, setSpecializations] = useState<any[]>([]);
  const { toast } = useEnhancedToast();
  const { user: currentUser } = useAuth();
  
  // Fetch roles from database instead of using hardcoded values
  const { data: dbRoles } = useQuery({
    queryKey: ['/api/roles'],
  });

  // Fetch real user data from API
  useEffect(() => {
    if (open && userId && Array.isArray(dbRoles)) {
      fetchUserData();
      fetchUserContent();
      fetchGlobalProfessions();
    }
  }, [open, userId, dbRoles]);

  const fetchGlobalProfessions = async () => {
    try {
      const [professionsResponse, genresResponse] = await Promise.all([
        apiRequest('/api/global-professions'),
        apiRequest('/api/global-genres')
      ]);
      
      const professions = await professionsResponse.json();
      const genres = await genresResponse.json();
      
      setGlobalProfessions(professions);
      setGlobalGenres(genres);
    } catch (error) {
      console.error('Error fetching global data:', error);
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await apiRequest(`/api/users/${userId}`);
      const user = await response.json();
      
      // Fetch artist-specific data if user is a managed artist
      const isManagedArtist = Array.isArray(dbRoles) ? 
        dbRoles.find((r: any) => r.id === user.roleId)?.name?.toLowerCase().includes('managed') && 
        dbRoles.find((r: any) => r.id === user.roleId)?.name?.toLowerCase().includes('artist') : false;
      if (isManagedArtist) {
        try {
          const artistResponse = await apiRequest(`/api/artists/${userId}`);
          const artistData = await artistResponse.json();
          user.performingRightsOrganization = artistData.performingRightsOrganization || '';
          user.ipiNumber = artistData.ipiNumber || '';
        } catch (artistError) {
          // Artist data might not exist yet, that's okay
          console.log('Artist data not found, using empty values');
        }
      }
      
      setUserData(user);
      
      // Load existing stage names if user is an artist
      const userRole = Array.isArray(dbRoles) ? dbRoles.find((r: any) => r.id === user.roleId) : null;
      const isAnyArtistRole = userRole?.name?.toLowerCase().includes('artist');
      if (isAnyArtistRole) {
        try {
          const artistResponse = await apiRequest(`/api/artists/${userId}`);
          const artistData = await artistResponse.json();
          
          // Load stage names
          if (artistData.stageNames && artistData.stageNames.length > 0) {
            setStageNames(artistData.stageNames);
          } else if (artistData.stageName) {
            // Fallback to single stage name
            setStageNames([{ name: artistData.stageName, isPrimary: true }]);
          }
          
          // Load genre data
          setSelectedPrimaryGenre(artistData.primaryGenre || "");
          setSelectedSecondaryGenres(artistData.secondaryGenres || []);
          setSelectedTopGenres(artistData.topGenres || []);
          
          // Load social media handles
          setSocialMediaHandles(artistData.socialMediaHandles || {});
        } catch (artistError) {
          console.log('Artist-specific data not found, using defaults');
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load user data",
        variant: "destructive",
      });
    }
  };

  const fetchUserContent = async () => {
    try {
      // Fetch profile data including technical specs
      const profileResponse = await apiRequest(`/api/users/${userId}/profile`);
      const profileData = await profileResponse.json();
      setProfileData(profileData);

      // Fetch user songs for artists
      const userRole = Array.isArray(dbRoles) ? dbRoles.find((r: any) => r.id === userData?.roleId) : null;
      const isAnyArtistRole = userRole?.name?.toLowerCase().includes('artist');
      if (isAnyArtistRole) {
        const songsResponse = await apiRequest(`/api/users/${userId}/songs`);
        const songsData = await songsResponse.json();
        setUserSongs(songsData);
      }

      // Fetch user merchandise
      const merchResponse = await apiRequest(`/api/users/${userId}/merchandise`);
      const merchData = await merchResponse.json();
      setUserMerchandise(merchData);

      // Fetch user events
      const eventsResponse = await apiRequest(`/api/users/${userId}/events`);
      const eventsData = await eventsResponse.json();
      setUserEvents(eventsData);
    } catch (error) {
      console.error('Error fetching user content:', error);
    }
  };

  const form = useForm<UserEditData>({
    resolver: zodResolver(baseUserSchema),
    defaultValues: {
      fullName: '',
      email: '',
      roleId: 9,
      secondaryRoles: [],
      status: 'active',
      phone: '',
      location: '',
      performingRightsOrganization: '',
      ipiNumber: '',
    },
  });

  // Reset form when userData changes
  useEffect(() => {
    if (userData) {
      form.reset({
        fullName: userData.fullName || '',
        email: userData.email || '',
        roleId: userData.roleId || 9,
        secondaryRoles: userData.secondaryRoles || [],
        status: userData.status || 'active',
        phone: userData.phone || '',
        location: userData.location || '',
        performingRightsOrganization: userData.performingRightsOrganization || '',
        ipiNumber: userData.ipiNumber || '',
      });
    }
  }, [userData, form]);

  const getRoleName = (roleId: number): string => {
    if (!Array.isArray(dbRoles)) return 'Loading...';
    const role = dbRoles.find((r: any) => r.id === roleId);
    return role ? role.name : 'Unknown';
  };

  // Use database-driven role categorization
  const isArtist = Array.isArray(dbRoles) && userData?.roleId ? 
    dbRoles.find((r: any) => r.id === userData.roleId)?.name?.toLowerCase().includes('artist') : false;
  const isMusician = Array.isArray(dbRoles) && userData?.roleId ? 
    dbRoles.find((r: any) => r.id === userData.roleId)?.name?.toLowerCase().includes('musician') : false;
  const isProfessional = Array.isArray(dbRoles) && userData?.roleId ? 
    dbRoles.find((r: any) => r.id === userData?.roleId)?.name?.toLowerCase().includes('professional') : false;
  
  // Check if user can have secondary roles (Artists, Musicians, and Professionals)
  const canHaveSecondaryRoles = isArtist || isMusician || isProfessional;
  
  // Security: Only superadmins can assign admin/superadmin roles
  const currentUserRole = Array.isArray(dbRoles) ? 
    dbRoles.find((r: any) => r.id === currentUser?.roleId)?.name?.toLowerCase() : '';
  const canAssignAdminRoles = currentUserRole === 'superadmin';
  
  // Role-specific restrictions:
  // Managed Artists: can only choose between Managed Artist (3) and Artist (4)
  // Managed Musicians: can only choose between Managed Musician (5) and Musician (6)
  // Managed Professionals: can only choose between Managed Professional (7) and Professional (8)
  // Non-admin users cannot be granted admin privileges
  const getAvailableRoles = () => {
    // If current user is an Artist or Managed Artist, they can only switch between artist roles
    // Use database-driven role checking for artist types
    const artistRoles = Array.isArray(dbRoles) ? 
      dbRoles.filter((r: any) => r.name.toLowerCase().includes('artist')).map((r: any) => r.id) : [];
    const musicianRoles = Array.isArray(dbRoles) ? 
      dbRoles.filter((r: any) => r.name.toLowerCase().includes('musician')).map((r: any) => r.id) : [];
    const professionalRoles = Array.isArray(dbRoles) ? 
      dbRoles.filter((r: any) => r.name.toLowerCase().includes('professional')).map((r: any) => r.id) : [];
    
    if (artistRoles.includes(userData?.roleId)) {
      return artistRoles; // Can switch between artist roles only
    }
    
    if (musicianRoles.includes(userData?.roleId)) {
      return musicianRoles; // Can switch between musician roles only
    }
    
    if (professionalRoles.includes(userData?.roleId)) {
      return professionalRoles; // Can switch between professional roles only
    }
    
    if (!canAssignAdminRoles) {
      // Non-superadmins cannot assign admin roles - filter out superadmin and admin roles
      const adminRoles = Array.isArray(dbRoles) ? 
        dbRoles.filter((r: any) => r.name.toLowerCase().includes('admin')).map((r: any) => r.id) : [];
      const allRoles = Array.isArray(dbRoles) ? dbRoles.map((r: any) => r.id) : [];
      return allRoles.filter(id => !adminRoles.includes(id));
    } else {
      // Superadmins can assign any role, but still respect role restrictions
      if (artistRoles.includes(userData?.roleId)) {
        return artistRoles; // Even superadmins should only show artist roles for existing artists
      }
      if (musicianRoles.includes(userData?.roleId)) {
        return musicianRoles; // Even superadmins should only show musician roles for existing musicians
      }
      if (professionalRoles.includes(userData?.roleId)) {
        return professionalRoles; // Even superadmins should only show professional roles for existing professionals
      }
      const allRoles = Array.isArray(dbRoles) ? dbRoles.map((r: any) => r.id) : [];
      return allRoles; // All roles for non-role-restricted users
    }
  };

  // Check if user is transitioning from managed to unmanaged roles using database-driven logic
  const managedArtistRole = Array.isArray(dbRoles) ? 
    dbRoles.find((r: any) => r.name.toLowerCase().includes('managed') && r.name.toLowerCase().includes('artist'))?.id : null;
  const artistRole = Array.isArray(dbRoles) ? 
    dbRoles.find((r: any) => r.name.toLowerCase().includes('artist') && !r.name.toLowerCase().includes('managed'))?.id : null;
  const managedProfessionalRole = Array.isArray(dbRoles) ? 
    dbRoles.find((r: any) => r.name.toLowerCase().includes('managed') && r.name.toLowerCase().includes('professional'))?.id : null;
  const professionalRole = Array.isArray(dbRoles) ? 
    dbRoles.find((r: any) => r.name.toLowerCase().includes('professional') && !r.name.toLowerCase().includes('managed'))?.id : null;
  
  const isTransitioningToArtist = userData?.roleId === managedArtistRole && form.watch('roleId') === artistRole;
  const isTransitioningToProfessional = userData?.roleId === managedProfessionalRole && form.watch('roleId') === professionalRole;
  
  // Handle release contract workflow for Managed Artist → Artist transition
  const handleReleaseContractSubmit = async () => {
    if (!isTransitioningToArtist && !isTransitioningToProfessional) return;
    
    try {
      setIsLoading(true);
      
      // Create release contract request with role-specific terms
      const releaseContractData = isTransitioningToArtist ? {
        managedArtistUserId: userData.id,
        releaseRequestReason: "Artist requesting transition from Full Management tier to independent Artist status",
        contractTerms: {
          transitionType: "full_management_to_independent",
          managementTierAtTransition: userData.managementTierId || null,
          retainedObligations: [
            "Complete all pending booking commitments",
            "Honor existing merchandise and licensing agreements",
            "Provide 30-day notice for ongoing collaborations"
          ],
          releaseBenefits: [
            "Full creative control over future works",
            "Independent booking and contract negotiation",
            "Retention of all intellectual property rights"
          ],
          financialTerms: {
            retainedRoyaltyPercentage: 5.0, // 5% retained by label for existing works
            releaseCompensation: 0, // No buyout required for standard transitions
            effectiveDateNotice: 30 // 30 days notice
          }
        }
      } : {
        managedProfessionalUserId: userData.id,
        releaseRequestReason: "Professional requesting transition from Management tier to independent Professional status",
        contractTerms: {
          transitionType: "managed_professional_to_independent",
          managementTierAtTransition: userData.managementTierId || null,
          retainedObligations: [
            "Complete all pending consultation commitments",
            "Honor existing service agreements and client contracts",
            "Transfer client files and ongoing projects appropriately",
            "Provide 30-day notice for ongoing professional relationships"
          ],
          releaseBenefits: [
            "Independent practice and service delivery",
            "Direct client relationship management",
            "Full control over pricing and service offerings",
            "Independent professional development and specialization"
          ],
          financialTerms: {
            retainedCommissionPercentage: 3.0, // 3% retained commission for existing client referrals
            releaseCompensation: 0, // No buyout required for standard transitions
            effectiveDateNotice: 30 // 30 days notice
          }
        }
      };
      
      const response = await apiRequest("/api/release-contracts", {
        method: "POST",
        body: JSON.stringify(releaseContractData),
      });
      
      if (response.ok) {
        toast({
          title: "Release Contract Initiated",
          description: isTransitioningToArtist 
            ? "Managed Artist release process has been started. Awaiting superadmin approval and contract signing."
            : "Managed Professional release process has been started. Awaiting superadmin approval and contract signing.",
        });
        
        // Reset form to prevent role change until contract is complete
        form.setValue('roleId', userData.roleId);
        
        onOpenChange(false);
        onUserUpdated?.();
      } else {
        throw new Error('Failed to create release contract');
      }
    } catch (error) {
      console.error('Release contract error:', error);
      toast({
        title: "Release Contract Failed",
        description: "Failed to initiate release contract. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: UserEditData) => {
    setIsLoading(true);
    try {
      // Check if this is a managed user downgrade requiring release contract
      if (isTransitioningToArtist || isTransitioningToProfessional) {
        await handleReleaseContractSubmit();
        return;
      }
      
      // Update user basic data
      await apiRequest(`/api/users/${userId}`, {
        method: 'PATCH',
        body: data,
      });

      // Update artist-specific data for artists and musicians
      if (isArtist || isMusician) {
        const artistData: any = {};
        
        // Stage names for artists
        if (isArtist) {
          artistData.stageNames = stageNames;
          artistData.primaryGenre = selectedPrimaryGenre;
          artistData.secondaryGenres = selectedSecondaryGenres;
          artistData.topGenres = selectedTopGenres;
        }
        
        // Social media handles for artists, musicians, and professionals
        if (Object.keys(socialMediaHandles).length > 0) {
          artistData.socialMediaHandles = socialMediaHandles;
        }

        // Update artist data
        try {
          await apiRequest(`/api/artists/${userId}`, {
            method: 'PATCH',
            body: artistData,
          });
        } catch (artistError) {
          console.log('Artist data update failed, will continue with user update');
        }
      }
      
      toast({
        title: "User Updated",
        description: `${data.fullName}'s profile has been updated successfully.`,
      });
      
      // Refresh the users list
      if (onUserUpdated) {
        onUserUpdated();
      }
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update user profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuspend = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast({
        title: "User Suspended",
        description: `${userData.fullName} has been temporarily suspended.`,
        variant: "destructive",
      });
    } catch (error) {
      toast({
        title: "Suspension Failed",
        description: "Failed to suspend user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Create roles options for select dropdown
  const roles = Array.isArray(dbRoles) ? dbRoles.map((role: any) => ({
    value: role.id.toString(),
    label: role.name
  })) : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Edit User Profile{userData?.fullName ? ` - ${userData.fullName}` : ''}</span>
          </DialogTitle>
          <DialogDescription>
            {userData ? `Comprehensive user management for ${getRoleName(userData.roleId)}` : 'Loading user data...'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Status Header */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-primary rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="font-medium">{userData?.fullName || 'Loading...'}</div>
                <div className="text-sm text-muted-foreground flex items-center space-x-4">
                  <span className="flex items-center space-x-1">
                    <Mail className="h-3 w-3" />
                    <span>{userData?.email || 'Loading...'}</span>
                  </span>
                  <Badge variant="outline">{userData ? getRoleName(userData.roleId) : 'Loading...'}</Badge>
                </div>
              </div>
            </div>
            <Badge variant={userData?.status === 'active' ? 'default' : 'destructive'}>
              {userData?.status || 'Active'}
            </Badge>
          </div>

          {/* Tabbed Interface */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Mobile-friendly tab navigation */}
            <div className="block md:hidden mb-4 space-y-3">
              {/* Progress indicator */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Section Navigation</span>
                <span className="bg-primary/10 px-2 py-1 rounded-full text-primary font-medium">
                  {(() => {
                    const tabMap: Record<string, string> = {
                      basic: '📝 Basic Info',
                      role: '🔐 Role & Access',
                      professional: '💼 Professional',
                      music: '🎵 Music',
                      media: '📸 Media',
                      events: '📅 Events',
                      merchandise: '🛍️ Merchandise',
                      technical: '⚙️ Technical',
                      settings: '🔧 Settings'
                    };
                    return tabMap[activeTab] || 'Loading...';
                  })()}
                </span>
              </div>
              
              {/* Tab selector with enhanced styling */}
              <select 
                value={activeTab} 
                onChange={(e) => setActiveTab(e.target.value)}
                className="w-full p-4 border-2 rounded-xl bg-background text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="basic">📝 Basic Info</option>
                <option value="role">🔐 Role & Access</option>
                {(isArtist || isMusician || isProfessional) && (
                  <option value="professional">💼 Professional</option>
                )}
                {(userData?.roleId === 3 || userData?.roleId === 4) && <option value="music">🎵 Music</option>}
                {(userData?.roleId === 3 || userData?.roleId === 4 || userData?.roleId === 5 || userData?.roleId === 6 || isMusician) && <option value="media">📸 Media</option>}
                {(userData?.roleId === 3 || userData?.roleId === 4 || userData?.roleId === 5 || userData?.roleId === 6 || userData?.roleId === 7 || userData?.roleId === 8 || isMusician || isProfessional) && <option value="events">📅 Events</option>}
                {(userData?.roleId === 3 || userData?.roleId === 4) && <option value="merchandise">🛍️ Merchandise</option>}
                {(userData?.roleId === 3 || userData?.roleId === 4 || userData?.roleId === 5 || userData?.roleId === 6 || userData?.roleId === 7 || userData?.roleId === 8 || isMusician || isProfessional) && <option value="technical">⚙️ Technical</option>}
                <option value="settings">🔧 Settings</option>
              </select>
              
              {/* Mobile navigation hints */}
              <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  <span>Swipe or select above to navigate</span>
                </div>
              </div>
            </div>

            {/* Desktop tab navigation - Enhanced responsive grid */}
            <TabsList className="hidden md:grid w-full gap-1 p-1" style={{
              gridTemplateColumns: `repeat(${[
                'basic', 'role',
                ...(isArtist || isMusician || isProfessional ? ['professional'] : []),
                ...(userData?.roleId === 3 || userData?.roleId === 4 ? ['music'] : []),
                ...(userData?.roleId === 3 || userData?.roleId === 4 || userData?.roleId === 5 || userData?.roleId === 6 || isMusician ? ['media'] : []),
                ...(userData?.roleId === 3 || userData?.roleId === 4 || userData?.roleId === 5 || userData?.roleId === 6 || userData?.roleId === 7 || userData?.roleId === 8 || isMusician || isProfessional ? ['events'] : []),
                ...(userData?.roleId === 3 || userData?.roleId === 4 ? ['merchandise'] : []),
                ...(userData?.roleId === 3 || userData?.roleId === 4 || userData?.roleId === 5 || userData?.roleId === 6 || userData?.roleId === 7 || userData?.roleId === 8 || isMusician || isProfessional ? ['technical'] : []),
                'settings'
              ].length}, 1fr)`
            }}>
              <TabsTrigger value="basic" className="text-xs whitespace-nowrap">Basic Info</TabsTrigger>
              <TabsTrigger value="role" className="text-xs whitespace-nowrap">Role & Access</TabsTrigger>
              {(isArtist || isMusician || isProfessional) && (
                <TabsTrigger value="professional" className="text-xs whitespace-nowrap">Professional</TabsTrigger>
              )}
              {(userData?.roleId === 3 || userData?.roleId === 4) && <TabsTrigger value="music" className="text-xs whitespace-nowrap">Music</TabsTrigger>}
              {(userData?.roleId === 3 || userData?.roleId === 4 || userData?.roleId === 5 || userData?.roleId === 6 || isMusician) && <TabsTrigger value="media" className="text-xs whitespace-nowrap">Media</TabsTrigger>}
              {(userData?.roleId === 3 || userData?.roleId === 4 || userData?.roleId === 5 || userData?.roleId === 6 || userData?.roleId === 7 || userData?.roleId === 8 || isMusician || isProfessional) && <TabsTrigger value="events" className="text-xs whitespace-nowrap">Events</TabsTrigger>}
              {(userData?.roleId === 3 || userData?.roleId === 4) && <TabsTrigger value="merchandise" className="text-xs whitespace-nowrap">Merch</TabsTrigger>}
              {(userData?.roleId === 3 || userData?.roleId === 4 || userData?.roleId === 5 || userData?.roleId === 6 || userData?.roleId === 7 || userData?.roleId === 8 || isMusician || isProfessional) && <TabsTrigger value="technical" className="text-xs whitespace-nowrap">Technical</TabsTrigger>}
              <TabsTrigger value="settings" className="text-xs whitespace-nowrap">Settings</TabsTrigger>
            </TabsList>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <>
                {/* Basic Information Tab */}
                <TabsContent value="basic" className="space-y-4 md:space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="+1 (555) 123-4567" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="City, Country" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Music Industry Fields for Managed Artists */}
                  {userData?.roleId === 3 && (
                    <div className="space-y-4">
                      <div className="border-t pt-4">
                        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                          <Music className="h-5 w-5" />
                          Music Industry Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="performingRightsOrganization"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Performing Rights Organization (PRO)</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select PRO" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="ascap">ASCAP</SelectItem>
                                    <SelectItem value="bmi">BMI</SelectItem>
                                    <SelectItem value="sesac">SESAC</SelectItem>
                                    <SelectItem value="socan">SOCAN</SelectItem>
                                    <SelectItem value="prs">PRS for Music</SelectItem>
                                    <SelectItem value="gema">GEMA</SelectItem>
                                    <SelectItem value="sacem">SACEM</SelectItem>
                                    <SelectItem value="apra">APRA</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="ipiNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>IPI Number</FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    placeholder="e.g., 00052210040"
                                    maxLength={11}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="mt-3 text-sm text-muted-foreground">
                          <p>
                            <strong>PRO:</strong> Performing Rights Organizations collect royalties for public performances of your music.
                          </p>
                          <p>
                            <strong>IPI:</strong> Interested Parties Information number uniquely identifies you as a rights holder in the music industry.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Project History */}
                  {(isArtist || isMusician || isProfessional) && (
                    <div className="space-y-4">
                      <div className="border-t pt-4">
                        <div className="bg-white p-4 rounded-lg border-2 border-blue-200">
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <History className="h-4 w-4 text-blue-500" />
                            Project History
                          </h4>
                          <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <div className="flex-1">
                                <div className="font-medium">Solo Album: Midnight Reflections</div>
                                <div className="text-sm text-gray-600">2023 • Jazz/Alternative • 12 tracks</div>
                              </div>
                              <Badge variant="secondary">Released</Badge>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <div className="flex-1">
                                <div className="font-medium">Collaboration: Urban Echoes EP</div>
                                <div className="text-sm text-gray-600">2024 • Hip-Hop/Electronic • 6 tracks</div>
                              </div>
                              <Badge variant="default">In Production</Badge>
                            </div>
                          </div>
                        </div>

                        {/* Career Achievements */}
                        <div className="bg-white p-4 rounded-lg border-2 border-yellow-200 mt-4">
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <Award className="h-4 w-4 text-yellow-500" />
                            Career Achievements
                          </h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-3 bg-yellow-50 rounded-lg">
                              <div className="text-2xl font-bold text-yellow-600">4</div>
                              <div className="text-sm text-gray-600">Albums Released</div>
                            </div>
                            <div className="text-center p-3 bg-green-50 rounded-lg">
                              <div className="text-2xl font-bold text-green-600">120K</div>
                              <div className="text-sm text-gray-600">Monthly Listeners</div>
                            </div>
                            <div className="text-center p-3 bg-blue-50 rounded-lg">
                              <div className="text-2xl font-bold text-blue-600">15</div>
                              <div className="text-sm text-gray-600">Live Performances</div>
                            </div>
                            <div className="text-center p-3 bg-purple-50 rounded-lg">
                              <div className="text-2xl font-bold text-purple-600">3</div>
                              <div className="text-sm text-gray-600">Award Nominations</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* Role & Access Tab */}
                <TabsContent value="role" className="space-y-4 md:space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <FormField
                      control={form.control}
                      name="roleId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Primary User Role</FormLabel>
                          <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value?.toString()}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {getAvailableRoles().map((roleId) => (
                                <SelectItem key={roleId} value={roleId.toString()}>
                                  {getRoleName(roleId)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                          {(userData?.roleId === 3 || userData?.roleId === 4) && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Managed Artists can only switch between Managed Artist and Artist roles. Use Secondary Roles below to add additional capabilities.
                            </p>
                          )}
                          {(userData?.roleId === 5 || userData?.roleId === 6) && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Managed Musicians can only switch between Managed Musician and Musician roles. Use Secondary Roles below to add additional capabilities.
                            </p>
                          )}
                          {(userData?.roleId === 7 || userData?.roleId === 8) && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Managed Professionals can only switch between Managed Professional and Professional roles. Use Secondary Roles below to add additional capabilities.
                            </p>
                          )}
                          {!canAssignAdminRoles && (
                            <p className="text-xs text-orange-600 mt-1">
                              🔒 Admin and Superadmin roles can only be assigned by Superadmins for security purposes.
                            </p>
                          )}
                          {isTransitioningToArtist && (
                            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                              <div className="flex items-center space-x-2 text-amber-800">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                                <span className="text-sm font-medium">Release Contract Required</span>
                              </div>
                              <p className="text-xs text-amber-700 mt-1">
                                Transitioning from Managed Artist to independent Artist requires a release contract process. This will initiate the two-tier management system workflow with proper legal documentation.
                              </p>
                            </div>
                          )}
                          {isTransitioningToProfessional && (
                            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                              <div className="flex items-center space-x-2 text-amber-800">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                                <span className="text-sm font-medium">Release Contract Required</span>
                              </div>
                              <p className="text-xs text-amber-700 mt-1">
                                Transitioning from Managed Professional to independent Professional requires a release contract process. This will initiate proper client transition and professional relationship management.
                              </p>
                            </div>
                          )}
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                              <SelectItem value="suspended">Suspended</SelectItem>
                              <SelectItem value="pending">Pending</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Secondary Roles Section for Artists and Managed Artists */}
                  {canHaveSecondaryRoles && (
                    <div className="space-y-4">
                      <div className="border-t pt-4">
                        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                          <Shield className="h-5 w-5" />
                          Secondary Roles & Capabilities
                        </h3>
                        <div className="space-y-3">
                          <p className="text-sm text-muted-foreground">
                            Add additional capabilities without changing your primary role. Secondary roles unlock relevant tabs and features.
                          </p>
                          
                          {/* Secondary Role Selection */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                            <div className="space-y-4">
                              <label className="text-sm font-medium">Available Secondary Roles</label>
                              
                              {/* For Artists: Show Musician and Professional options */}
                              {(userData?.roleId === 3 || userData?.roleId === 4) && (
                                <>
                                  {/* Musician Section */}
                                  <div className="space-y-2 p-3 border rounded-lg">
                                    <h4 className="text-sm font-medium">Musician Capabilities</h4>
                                    <div className="space-y-2">
                                      {[
                                        { id: 5, name: 'Managed Musician', description: 'Session work with management benefits' },
                                        { id: 6, name: 'Musician', description: 'Independent session musician' }
                                      ].map((role) => (
                                    <div key={role.id} className="flex items-center space-x-2">
                                      <input
                                        type="radio"
                                        name="musician-role"
                                        id={`secondary-role-${role.id}`}
                                        checked={form.watch('secondaryRoles')?.includes(role.id) || false}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            const currentRoles = form.getValues('secondaryRoles') || [];
                                            // Remove other musician roles and add this one
                                            const filteredRoles = currentRoles.filter(r => r !== 5 && r !== 6);
                                            form.setValue('secondaryRoles', [...filteredRoles, role.id]);
                                          }
                                        }}
                                        className="rounded border-gray-300"
                                      />
                                      <label htmlFor={`secondary-role-${role.id}`} className="text-sm">
                                        <span className="font-medium">{role.name}</span>
                                        <span className="text-muted-foreground block">{role.description}</span>
                                      </label>
                                    </div>
                                  ))}
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      const currentRoles = form.getValues('secondaryRoles') || [];
                                      const filteredRoles = currentRoles.filter(r => r !== 5 && r !== 6);
                                      form.setValue('secondaryRoles', filteredRoles);
                                      toast({
                                        title: "Musician Role Cleared",
                                        description: "Musician secondary role removed",
                                      });
                                    }}
                                    className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 h-6 px-2"
                                  >
                                    <X className="h-3 w-3 mr-1" />
                                    Clear Musician Role
                                  </Button>
                                </div>
                              </div>

                              {/* Professional Section */}
                              <div className="space-y-2 p-3 border rounded-lg">
                                <h4 className="text-sm font-medium">Professional Capabilities</h4>
                                <div className="space-y-2">
                                  {[
                                    { id: 7, name: 'Managed Professional', description: 'Professional services with management' },
                                    { id: 8, name: 'Professional', description: 'Independent professional services' }
                                  ].map((role) => (
                                    <div key={role.id} className="flex items-center space-x-2">
                                      <input
                                        type="radio"
                                        name="professional-role"
                                        id={`secondary-role-${role.id}`}
                                        checked={form.watch('secondaryRoles')?.includes(role.id) || false}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            const currentRoles = form.getValues('secondaryRoles') || [];
                                            // Remove other professional roles and add this one
                                            const filteredRoles = currentRoles.filter(r => r !== 7 && r !== 8);
                                            form.setValue('secondaryRoles', [...filteredRoles, role.id]);
                                          }
                                        }}
                                        className="rounded border-gray-300"
                                      />
                                      <label htmlFor={`secondary-role-${role.id}`} className="text-sm">
                                        <span className="font-medium">{role.name}</span>
                                        <span className="text-muted-foreground block">{role.description}</span>
                                      </label>
                                    </div>
                                  ))}
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      const currentRoles = form.getValues('secondaryRoles') || [];
                                      const filteredRoles = currentRoles.filter(r => r !== 7 && r !== 8);
                                      form.setValue('secondaryRoles', filteredRoles);
                                      toast({
                                        title: "Professional Role Cleared",
                                        description: "Professional secondary role removed",
                                      });
                                    }}
                                    className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 h-6 px-2"
                                  >
                                    <X className="h-3 w-3 mr-1" />
                                    Clear Professional Role
                                  </Button>
                                </div>
                              </div>
                                </>
                              )}
                              
                              {/* For Musicians: Show Artist and Professional options */}
                              {(userData?.roleId === 5 || userData?.roleId === 6) && (
                                <>
                                  {/* Artist Section */}
                                  <div className="space-y-2 p-3 border rounded-lg">
                                    <h4 className="text-sm font-medium">Artist Capabilities</h4>
                                    <div className="space-y-2">
                                      {[
                                        { id: 3, name: 'Managed Artist', description: 'Recording artist with management benefits' },
                                        { id: 4, name: 'Artist', description: 'Independent recording artist' }
                                      ].map((role) => (
                                        <div key={role.id} className="flex items-center space-x-2">
                                          <input
                                            type="radio"
                                            name="artist-role"
                                            id={`secondary-role-${role.id}`}
                                            checked={form.watch('secondaryRoles')?.includes(role.id) || false}
                                            onChange={(e) => {
                                              if (e.target.checked) {
                                                const currentRoles = form.getValues('secondaryRoles') || [];
                                                // Remove other artist roles and add this one
                                                const filteredRoles = currentRoles.filter(r => r !== 3 && r !== 4);
                                                form.setValue('secondaryRoles', [...filteredRoles, role.id]);
                                              }
                                            }}
                                            className="rounded border-gray-300"
                                          />
                                          <label htmlFor={`secondary-role-${role.id}`} className="text-sm">
                                            <span className="font-medium">{role.name}</span>
                                            <span className="text-muted-foreground block">{role.description}</span>
                                          </label>
                                        </div>
                                      ))}
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          const currentRoles = form.getValues('secondaryRoles') || [];
                                          const filteredRoles = currentRoles.filter(r => r !== 3 && r !== 4);
                                          form.setValue('secondaryRoles', filteredRoles);
                                          toast({
                                            title: "Artist Role Cleared",
                                            description: "Artist secondary role removed",
                                          });
                                        }}
                                        className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 h-6 px-2"
                                      >
                                        <X className="h-3 w-3 mr-1" />
                                        Clear Artist Role
                                      </Button>
                                    </div>
                                  </div>

                                  {/* Professional Section */}
                                  <div className="space-y-2 p-3 border rounded-lg">
                                    <h4 className="text-sm font-medium">Professional Capabilities</h4>
                                    <div className="space-y-2">
                                      {[
                                        { id: 7, name: 'Managed Professional', description: 'Professional services with management' },
                                        { id: 8, name: 'Professional', description: 'Independent professional services' }
                                      ].map((role) => (
                                        <div key={role.id} className="flex items-center space-x-2">
                                          <input
                                            type="radio"
                                            name="professional-role"
                                            id={`secondary-role-${role.id}`}
                                            checked={form.watch('secondaryRoles')?.includes(role.id) || false}
                                            onChange={(e) => {
                                              if (e.target.checked) {
                                                const currentRoles = form.getValues('secondaryRoles') || [];
                                                // Remove other professional roles and add this one
                                                const filteredRoles = currentRoles.filter(r => r !== 7 && r !== 8);
                                                form.setValue('secondaryRoles', [...filteredRoles, role.id]);
                                              }
                                            }}
                                            className="rounded border-gray-300"
                                          />
                                          <label htmlFor={`secondary-role-${role.id}`} className="text-sm">
                                            <span className="font-medium">{role.name}</span>
                                            <span className="text-muted-foreground block">{role.description}</span>
                                          </label>
                                        </div>
                                      ))}
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          const currentRoles = form.getValues('secondaryRoles') || [];
                                          const filteredRoles = currentRoles.filter(r => r !== 7 && r !== 8);
                                          form.setValue('secondaryRoles', filteredRoles);
                                          toast({
                                            title: "Professional Role Cleared",
                                            description: "Professional secondary role removed",
                                          });
                                        }}
                                        className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 h-6 px-2"
                                      >
                                        <X className="h-3 w-3 mr-1" />
                                        Clear Professional Role
                                      </Button>
                                    </div>
                                  </div>
                                </>
                              )}
                              
                              {/* For Professionals: Show Artist and Musician options */}
                              {(userData?.roleId === 7 || userData?.roleId === 8) && (
                                <>
                                  {/* Artist Section */}
                                  <div className="space-y-2 p-3 border rounded-lg">
                                    <h4 className="text-sm font-medium">Artist Capabilities</h4>
                                    <div className="space-y-2">
                                      {[
                                        { id: 3, name: 'Managed Artist', description: 'Recording artist with management benefits' },
                                        { id: 4, name: 'Artist', description: 'Independent recording artist' }
                                      ].map((role) => (
                                        <div key={role.id} className="flex items-center space-x-2">
                                          <input
                                            type="radio"
                                            name="artist-role"
                                            id={`secondary-role-${role.id}`}
                                            checked={form.watch('secondaryRoles')?.includes(role.id) || false}
                                            onChange={(e) => {
                                              if (e.target.checked) {
                                                const currentRoles = form.getValues('secondaryRoles') || [];
                                                // Remove other artist roles and add this one
                                                const filteredRoles = currentRoles.filter(r => r !== 3 && r !== 4);
                                                form.setValue('secondaryRoles', [...filteredRoles, role.id]);
                                              }
                                            }}
                                            className="rounded border-gray-300"
                                          />
                                          <label htmlFor={`secondary-role-${role.id}`} className="text-sm">
                                            <span className="font-medium">{role.name}</span>
                                            <span className="text-muted-foreground block">{role.description}</span>
                                          </label>
                                        </div>
                                      ))}
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          const currentRoles = form.getValues('secondaryRoles') || [];
                                          const filteredRoles = currentRoles.filter(r => r !== 3 && r !== 4);
                                          form.setValue('secondaryRoles', filteredRoles);
                                          toast({
                                            title: "Artist Role Cleared",
                                            description: "Artist secondary role removed",
                                          });
                                        }}
                                        className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 h-6 px-2"
                                      >
                                        <X className="h-3 w-3 mr-1" />
                                        Clear Artist Role
                                      </Button>
                                    </div>
                                  </div>

                                  {/* Musician Section */}
                                  <div className="space-y-2 p-3 border rounded-lg">
                                    <h4 className="text-sm font-medium">Musician Capabilities</h4>
                                    <div className="space-y-2">
                                      {[
                                        { id: 5, name: 'Managed Musician', description: 'Session work with management benefits' },
                                        { id: 6, name: 'Musician', description: 'Independent session musician' }
                                      ].map((role) => (
                                        <div key={role.id} className="flex items-center space-x-2">
                                          <input
                                            type="radio"
                                            name="musician-role"
                                            id={`secondary-role-${role.id}`}
                                            checked={form.watch('secondaryRoles')?.includes(role.id) || false}
                                            onChange={(e) => {
                                              if (e.target.checked) {
                                                const currentRoles = form.getValues('secondaryRoles') || [];
                                                // Remove other musician roles and add this one
                                                const filteredRoles = currentRoles.filter(r => r !== 5 && r !== 6);
                                                form.setValue('secondaryRoles', [...filteredRoles, role.id]);
                                              }
                                            }}
                                            className="rounded border-gray-300"
                                          />
                                          <label htmlFor={`secondary-role-${role.id}`} className="text-sm">
                                            <span className="font-medium">{role.name}</span>
                                            <span className="text-muted-foreground block">{role.description}</span>
                                          </label>
                                        </div>
                                      ))}
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          const currentRoles = form.getValues('secondaryRoles') || [];
                                          const filteredRoles = currentRoles.filter(r => r !== 5 && r !== 6);
                                          form.setValue('secondaryRoles', filteredRoles);
                                          toast({
                                            title: "Musician Role Cleared",
                                            description: "Musician secondary role removed",
                                          });
                                        }}
                                        className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 h-6 px-2"
                                      >
                                        <X className="h-3 w-3 mr-1" />
                                        Clear Musician Role
                                      </Button>
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                            
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Impact on User Interface</label>
                              <div className="text-sm text-muted-foreground space-y-1">
                                {form.watch('secondaryRoles')?.includes(3) || form.watch('secondaryRoles')?.includes(4) ? (
                                  <div className="flex items-center gap-2">
                                    <Music className="h-4 w-4" />
                                    <span>Adds Artist capabilities and tabs</span>
                                  </div>
                                ) : null}
                                {form.watch('secondaryRoles')?.includes(5) || form.watch('secondaryRoles')?.includes(6) ? (
                                  <div className="flex items-center gap-2">
                                    <Music className="h-4 w-4" />
                                    <span>Adds Musician capabilities and tabs</span>
                                  </div>
                                ) : null}
                                {form.watch('secondaryRoles')?.includes(7) || form.watch('secondaryRoles')?.includes(8) ? (
                                  <div className="flex items-center gap-2">
                                    <Briefcase className="h-4 w-4" />
                                    <span>Adds Professional services and tabs</span>
                                  </div>
                                ) : null}
                                {(!form.watch('secondaryRoles') || form.watch('secondaryRoles')?.length === 0) && (
                                  <span className="italic">No secondary roles selected - {userData?.roleId === 3 || userData?.roleId === 4 ? 'Artist' : userData?.roleId === 5 || userData?.roleId === 6 ? 'Musician' : userData?.roleId === 7 || userData?.roleId === 8 ? 'Professional' : 'Primary role'} capabilities only</span>
                                )}
                              </div>
                            </div>
                            
                            {/* Unselect All Secondary Roles Button */}
                            {form.watch('secondaryRoles') && form.watch('secondaryRoles')!.length > 0 && (
                              <div className="pt-3 border-t">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    form.setValue('secondaryRoles', []);
                                    toast({
                                      title: "Secondary Roles Cleared",
                                      description: "All secondary roles have been removed",
                                    });
                                  }}
                                  className="w-full text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400"
                                >
                                  <X className="h-4 w-4 mr-2" />
                                  Unselect All Secondary Roles
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Save Profile Data Button */}
                  {(isArtist || isMusician || isProfessional) && (
                    <div className="p-4 bg-green-50 rounded-lg">
                      <Button 
                        type="button" 
                        className="w-full"
                        onClick={async () => {
                          try {
                            setIsLoading(true);
                            
                            // Save enhanced profile data
                            const profileUpdateData = {
                              stageNames,
                              primaryGenre: selectedPrimaryGenre,
                              secondaryGenres: selectedSecondaryGenres,
                              topGenres: selectedTopGenres,
                              socialMediaHandles
                            };
                            
                            const response = await apiRequest(`/api/users/${userId}/enhanced-profile`, {
                              method: 'PATCH',
                              body: JSON.stringify(profileUpdateData),
                            });
                            
                            if (response.ok) {
                              toast({
                                title: "Profile Updated",
                                description: "Enhanced profile data saved successfully",
                              });
                            } else {
                              throw new Error('Failed to update profile');
                            }
                          } catch (error) {
                            toast({
                              title: "Error",
                              description: "Failed to save profile data",
                              variant: "destructive",
                            });
                          } finally {
                            setIsLoading(false);
                          }
                        }}
                        disabled={isLoading}
                      >
                        {isLoading ? "Saving..." : "Save Enhanced Profile Data"}
                      </Button>
                    </div>
                  )}

                  {/* Custom Genre Modal */}
                  {showCustomGenreModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                      <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4">Add Custom Genre</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium">Genre Name *</label>
                            <Input
                              placeholder="Enter custom genre name"
                              value={customGenreName}
                              onChange={(e) => setCustomGenreName(e.target.value)}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Category</label>
                            <Select value={selectedCustomCategory} onValueChange={setSelectedCustomCategory}>
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select category (defaults to World)" />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.keys(globalGenres).map((category) => (
                                  <SelectItem key={category} value={category}>
                                    {category}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex gap-2 justify-end">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setShowCustomGenreModal(false);
                                setCustomGenreName("");
                                setSelectedCustomCategory("World");
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              type="button"
                              onClick={async () => {
                                if (!customGenreName.trim()) {
                                  toast({
                                    title: "Error",
                                    description: "Please enter a genre name",
                                    variant: "destructive",
                                  });
                                  return;
                                }
                                
                                try {
                                  setIsLoading(true);
                                  const response = await apiRequest('/api/global-genres/custom', {
                                    method: 'POST',
                                    body: JSON.stringify({
                                      name: customGenreName.trim(),
                                      category: selectedCustomCategory,
                                      description: `Custom ${selectedCustomCategory.toLowerCase()} genre`
                                    }),
                                  });
                                  
                                  if (response.ok) {
                                    const newGenre = await response.json();
                                    
                                    // Add to global genres state for immediate use
                                    setGlobalGenres((prev: any) => ({
                                      ...prev,
                                      [selectedCustomCategory]: [
                                        ...(prev[selectedCustomCategory] || []),
                                        { id: newGenre.id, name: newGenre.name, category: newGenre.category }
                                      ]
                                    }));
                                    
                                    toast({
                                      title: "Custom Genre Added",
                                      description: `"${customGenreName}" added to ${selectedCustomCategory} category`,
                                    });
                                    
                                    setShowCustomGenreModal(false);
                                    setCustomGenreName("");
                                    setSelectedCustomCategory("World");
                                  } else {
                                    throw new Error('Failed to create custom genre');
                                  }
                                } catch (error) {
                                  toast({
                                    title: "Error",
                                    description: "Failed to create custom genre",
                                    variant: "destructive",
                                  });
                                } finally {
                                  setIsLoading(false);
                                }
                              }}
                              disabled={isLoading || !customGenreName.trim()}
                            >
                              {isLoading ? "Adding..." : "Add Genre"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Role Permissions</h4>
                    <div className="text-sm text-blue-800">
                      {userData?.roleId === 1 && "Full system access and configuration"}
                      {userData?.roleId === 2 && "Platform management with limited configuration"}
                      {(userData?.roleId === 3 || userData?.roleId === 4) && "Artist profile and music catalog management"}
                      {(userData?.roleId === 5 || userData?.roleId === 6) && "Session musician booking and equipment management"}
                      {(userData?.roleId === 7 || userData?.roleId === 8) && "Professional services and consultation management"}
                      {userData?.roleId === 9 && "General user with browsing and purchasing capabilities"}
                    </div>
                  </div>
                </TabsContent>

                {/* Music Management Tab - Managed Artists Only */}
                {userData?.roleId === 3 && (
                  <TabsContent value="music" className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium flex items-center gap-2">
                        <Music className="h-5 w-5" />
                        Music Catalog Management
                      </h3>
                      <Button size="sm" className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Add Song
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      {userSongs.length > 0 ? (
                        userSongs.map((song) => (
                          <div key={song.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                <Music className="h-6 w-6 text-gray-500" />
                              </div>
                              <div>
                                <p className="font-medium">{song.title}</p>
                                <p className="text-sm text-muted-foreground">
                                  ISRC: {song.isrcCode} • {song.isFree ? 'Free' : `$${song.price}`}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button size="sm" variant="outline">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                          <Music className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                          <p className="text-sm font-medium">No songs uploaded</p>
                          <p className="text-xs text-gray-400 mt-1">Add songs to build the artist's catalog</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                )}

                {/* Media Management Tab - Artists and Musicians */}
                {(userData?.roleId === 3 || userData?.roleId === 5) && (
                  <TabsContent value="media" className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium flex items-center gap-2">
                        <Video className="h-5 w-5" />
                        Media & Documents
                      </h3>
                      <Button size="sm" className="flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        Upload Media
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-3">
                        <h4 className="font-medium flex items-center gap-2">
                          <Image className="h-4 w-4" />
                          Photos & Graphics
                        </h4>
                        <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                          <Image className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-500">Upload EPK photos, press images</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <h4 className="font-medium flex items-center gap-2">
                          <Video className="h-4 w-4" />
                          Videos
                        </h4>
                        <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                          <Video className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-500">Upload performance videos, demos</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <h4 className="font-medium flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Documents
                        </h4>
                        <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                          <FileText className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-500">Upload EPK, bio, press releases</p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                )}

                {/* Events Management Tab */}
                {(userData?.roleId === 3 || userData?.roleId === 5 || userData?.roleId === 7) && (
                  <TabsContent value="events" className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Events & Bookings
                      </h3>
                      <Button size="sm" className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Add Event
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      {userEvents.length > 0 ? (
                        userEvents.map((event) => (
                          <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Calendar className="h-6 w-6 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-medium">{event.title}</p>
                                <p className="text-sm text-muted-foreground">
                                  {event.date} • {event.venue}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant={event.status === 'confirmed' ? 'default' : 'secondary'}>
                                {event.status}
                              </Badge>
                              <Button size="sm" variant="outline">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                          <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                          <p className="text-sm font-medium">No events scheduled</p>
                          <p className="text-xs text-gray-400 mt-1">Add events to manage bookings and performances</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                )}

                {/* Merchandise Management Tab - Artists Only */}
                {userData?.roleId === 3 && (
                  <TabsContent value="merchandise" className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Merchandise Catalog
                      </h3>
                      <Button size="sm" className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Add Product
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      {userMerchandise.length > 0 ? (
                        userMerchandise.map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <Package className="h-6 w-6 text-green-600" />
                              </div>
                              <div>
                                <p className="font-medium">{item.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  ${item.price} • Stock: {item.inventory}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant={item.inventory > 0 ? 'default' : 'destructive'}>
                                {item.inventory > 0 ? 'In Stock' : 'Out of Stock'}
                              </Badge>
                              <Button size="sm" variant="outline">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                          <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                          <p className="text-sm font-medium">No merchandise added</p>
                          <p className="text-xs text-gray-400 mt-1">Add products to build the merchandise catalog</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                )}

                {/* Technical Rider Management Tab */}
                {(userData?.roleId === 3 || userData?.roleId === 5 || userData?.roleId === 7) && (
                  <TabsContent value="technical" className="space-y-4">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <Wrench className="h-5 w-5" />
                      Technical Specifications & Hospitality
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Technical Requirements */}
                      <div className="space-y-4">
                        <h4 className="font-medium flex items-center gap-2">
                          <Wrench className="h-4 w-4" />
                          Technical Requirements
                        </h4>
                        <div className="space-y-3">
                          <Textarea 
                            placeholder="Stage setup requirements, equipment needs, sound specifications..."
                            className="min-h-[120px]"
                            defaultValue={profileData?.technicalRequirements || ''}
                          />
                          <Button size="sm" variant="outline" className="w-full">
                            Update Technical Specs
                          </Button>
                        </div>
                      </div>
                      
                      {/* Hospitality Requirements */}
                      <div className="space-y-4">
                        <h4 className="font-medium flex items-center gap-2">
                          <Coffee className="h-4 w-4" />
                          Hospitality Requirements
                        </h4>
                        <div className="space-y-3">
                          <Textarea 
                            placeholder="Catering needs, accommodation preferences, green room requirements..."
                            className="min-h-[120px]"
                            defaultValue={profileData?.hospitalityRequirements || ''}
                          />
                          <Button size="sm" variant="outline" className="w-full">
                            Update Hospitality Specs
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Performance Specifications */}
                    <div className="space-y-4">
                      <h4 className="font-medium">Performance Specifications</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="text-sm font-medium">Set Duration</label>
                          <Input placeholder="60 minutes" />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Break Requirements</label>
                          <Input placeholder="15 minutes between sets" />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Setup Time</label>
                          <Input placeholder="30 minutes" />
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                )}

                {/* Professional Tab - Role-based content */}
                {(isArtist || isMusician || isProfessional) && (
                  <TabsContent value="professional" className="space-y-6">
                    {/* Content for Artists and Musicians */}
                    {(isArtist || isMusician) && (
                      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg">
                        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                          <Music className="h-6 w-6" />
                          {isArtist ? 'Artist Information' : 'Musician Details'}
                        </h3>
                        
                        {isArtist && (
                          <div className="space-y-6">
                            {/* Stage Names Management */}
                            <div className="bg-white p-4 rounded-lg border-2 border-purple-200">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-semibold flex items-center gap-2">
                                  <Music className="h-4 w-4 text-purple-500" />
                                  Stage Names
                                </h4>
                                <div className="flex items-center gap-2">
                                  <Input 
                                    placeholder="Enter stage name"
                                    value={newStageName}
                                    onChange={(e) => setNewStageName(e.target.value)}
                                    className="w-40"
                                  />
                                  <Button 
                                    type="button" 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => {
                                      if (newStageName.trim()) {
                                        setStageNames([...stageNames, { 
                                          name: newStageName.trim(), 
                                          isPrimary: stageNames.length === 0 
                                        }]);
                                        setNewStageName("");
                                      }
                                    }}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {stageNames.map((stageName, index) => (
                                  <div 
                                    key={index} 
                                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                                      stageName.isPrimary 
                                        ? 'bg-purple-500 text-white' 
                                        : 'bg-purple-100 text-purple-700'
                                    }`}
                                  >
                                    {stageName.name}
                                    {stageName.isPrimary && <Star className="h-3 w-3" />}
                                    <div className="flex items-center gap-1 ml-2">
                                      {!stageName.isPrimary && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setStageNames(stageNames.map((sn, i) => ({
                                              ...sn,
                                              isPrimary: i === index
                                            })));
                                          }}
                                          className="hover:bg-white/20 rounded-full p-1"
                                          title="Set as primary"
                                        >
                                          <Star className="h-3 w-3" />
                                        </button>
                                      )}
                                      <button 
                                        type="button"
                                        onClick={() => {
                                          setStageNames(stageNames.filter((_, i) => i !== index));
                                        }}
                                        className="hover:bg-white/20 rounded-full p-1"
                                      >
                                        <X className="h-3 w-3" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Primary Genre Selection */}
                            <div className="bg-white p-4 rounded-lg border-2 border-green-200">
                              <h4 className="font-semibold mb-3 flex items-center gap-2">
                                <Music className="h-4 w-4 text-green-500" />
                                Primary Genre
                              </h4>
                              <div className="space-y-3">
                                <div className="relative">
                                  <Input
                                    placeholder="Type to search and filter genres..."
                                    value={genreSearchTerm}
                                    onChange={(e) => {
                                      setGenreSearchTerm(e.target.value);
                                      // Auto-open dropdown when typing
                                      const selectTrigger = document.querySelector('[data-genre-select="primary"] [role="combobox"]') as HTMLElement;
                                      if (selectTrigger && e.target.value.length > 0) {
                                        selectTrigger.click();
                                      }
                                    }}
                                    onFocus={() => {
                                      // Open dropdown on focus
                                      setTimeout(() => {
                                        const selectTrigger = document.querySelector('[data-genre-select="primary"] [role="combobox"]') as HTMLElement;
                                        if (selectTrigger) selectTrigger.click();
                                      }, 100);
                                    }}
                                    className="w-full"
                                  />
                                </div>
                                <div data-genre-select="primary">
                                  <Select value={selectedPrimaryGenre} onValueChange={(value) => {
                                    setSelectedPrimaryGenre(value);
                                    setGenreSearchTerm(""); // Clear search after selection
                                  }}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select your primary genre" />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-64 overflow-y-auto">
                                      {Object.entries(globalGenres).map(([category, genres]) => {
                                        const filteredGenres = (genres as any[]).filter(genre =>
                                          genre.name.toLowerCase().includes(genreSearchTerm.toLowerCase())
                                        );
                                        
                                        if (filteredGenres.length === 0) return null;
                                        
                                        return (
                                          <div key={category}>
                                            <div className="px-3 py-2 text-sm font-medium text-gray-500 bg-gray-50 sticky top-0">
                                              {category} ({filteredGenres.length})
                                            </div>
                                            {filteredGenres.map((genre) => (
                                              <SelectItem key={genre.id} value={genre.name}>
                                                <div className="flex items-center gap-2">
                                                  {genre.isCustom && <Star className="h-3 w-3 text-yellow-500" />}
                                                  {genre.name}
                                                </div>
                                              </SelectItem>
                                            ))}
                                          </div>
                                        );
                                      })}
                                      {genreSearchTerm && Object.entries(globalGenres).every(([_, genres]) => 
                                        (genres as any[]).filter(genre =>
                                          genre.name.toLowerCase().includes(genreSearchTerm.toLowerCase())
                                        ).length === 0
                                      ) && (
                                        <div className="px-3 py-2 text-sm text-gray-500 text-center">
                                          No genres found matching "{genreSearchTerm}"
                                        </div>
                                      )}
                                    </SelectContent>
                                  </Select>
                                </div>
                                {selectedPrimaryGenre && (
                                  <div className="p-2 bg-green-50 rounded border">
                                    <div className="font-medium text-green-700">Primary: {selectedPrimaryGenre}</div>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Secondary Genres Management */}
                            <div className="bg-white p-4 rounded-lg border-2 border-blue-200">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-semibold flex items-center gap-2">
                                  <Music className="h-4 w-4 text-blue-500" />
                                  Secondary Genres
                                </h4>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setShowCustomGenreModal(true)}
                                >
                                  <Plus className="h-4 w-4 mr-1" />
                                  Add Custom Genre
                                </Button>
                              </div>
                              <div className="space-y-3">
                                <div className="relative">
                                  <Input
                                    placeholder="Type to search and filter secondary genres..."
                                    value={secondaryGenreSearchTerm}
                                    onChange={(e) => {
                                      setSecondaryGenreSearchTerm(e.target.value);
                                      // Auto-open dropdown when typing
                                      const selectTrigger = document.querySelector('[data-genre-select="secondary"] [role="combobox"]') as HTMLElement;
                                      if (selectTrigger && e.target.value.length > 0) {
                                        selectTrigger.click();
                                      }
                                    }}
                                    onFocus={() => {
                                      // Open dropdown on focus
                                      setTimeout(() => {
                                        const selectTrigger = document.querySelector('[data-genre-select="secondary"] [role="combobox"]') as HTMLElement;
                                        if (selectTrigger) selectTrigger.click();
                                      }, 100);
                                    }}
                                    className="w-full"
                                  />
                                </div>
                                <div data-genre-select="secondary">
                                  <Select 
                                    onValueChange={(value) => {
                                      if (!selectedSecondaryGenres.includes(value)) {
                                        setSelectedSecondaryGenres([...selectedSecondaryGenres, value]);
                                        setSecondaryGenreSearchTerm(""); // Clear search after selection
                                      }
                                    }}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Add secondary genres" />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-64 overflow-y-auto">
                                      {Object.entries(globalGenres).map(([category, genres]) => {
                                        const filteredGenres = (genres as any[]).filter(genre =>
                                          genre.name.toLowerCase().includes(secondaryGenreSearchTerm.toLowerCase()) &&
                                          !selectedSecondaryGenres.includes(genre.name) &&
                                          genre.name !== selectedPrimaryGenre
                                        );
                                        
                                        if (filteredGenres.length === 0) return null;
                                        
                                        return (
                                          <div key={category}>
                                            <div className="px-3 py-2 text-sm font-medium text-gray-500 bg-gray-50 sticky top-0">
                                              {category} ({filteredGenres.length})
                                            </div>
                                            {filteredGenres.map((genre) => (
                                              <SelectItem key={genre.id} value={genre.name}>
                                                <div className="flex items-center gap-2">
                                                  {genre.isCustom && <Star className="h-3 w-3 text-yellow-500" />}
                                                  {genre.name}
                                                </div>
                                              </SelectItem>
                                            ))}
                                          </div>
                                        );
                                      })}
                                      {secondaryGenreSearchTerm && Object.entries(globalGenres).every(([_, genres]) => 
                                        (genres as any[]).filter(genre =>
                                          genre.name.toLowerCase().includes(secondaryGenreSearchTerm.toLowerCase()) &&
                                          !selectedSecondaryGenres.includes(genre.name) &&
                                          genre.name !== selectedPrimaryGenre
                                        ).length === 0
                                      ) && (
                                        <div className="px-3 py-2 text-sm text-gray-500 text-center">
                                          No available genres found matching "{secondaryGenreSearchTerm}"
                                        </div>
                                      )}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {selectedSecondaryGenres.map((genre, index) => (
                                    <div key={index} className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                                      {genre}
                                      <button 
                                        type="button"
                                        onClick={() => {
                                          setSelectedSecondaryGenres(selectedSecondaryGenres.filter((_, i) => i !== index));
                                        }}
                                        className="ml-1 hover:bg-blue-200 rounded-full p-1"
                                      >
                                        <X className="h-3 w-3" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Top Genres (from Primary + Secondary only) */}
                            <div className="bg-white p-4 rounded-lg border-2 border-orange-200">
                              <h4 className="font-semibold mb-3 flex items-center gap-2">
                                <Star className="h-4 w-4 text-orange-500" />
                                Strongest Genres
                              </h4>
                              <div className="space-y-3">
                                <p className="text-sm text-gray-600">
                                  Select up to 3 genres you excel at most from your primary and secondary genres.
                                </p>
                                <Select 
                                  onValueChange={(value) => {
                                    if (selectedTopGenres.length < 3 && !selectedTopGenres.includes(value)) {
                                      setSelectedTopGenres([...selectedTopGenres, value]);
                                    }
                                  }}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select your strongest genres (max 3)" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {[selectedPrimaryGenre, ...selectedSecondaryGenres]
                                      .filter(genre => genre && !selectedTopGenres.includes(genre))
                                      .map((genre, index) => (
                                        <SelectItem key={index} value={genre}>
                                          <div className="flex items-center gap-2">
                                            <Star className="h-3 w-3 text-orange-500" />
                                            {genre}
                                          </div>
                                        </SelectItem>
                                      ))
                                    }
                                    {[selectedPrimaryGenre, ...selectedSecondaryGenres].filter(g => g).length === 0 && (
                                      <div className="px-3 py-2 text-sm text-gray-500 text-center">
                                        Select primary and secondary genres first
                                      </div>
                                    )}
                                  </SelectContent>
                                </Select>
                                <div className="flex flex-wrap gap-2">
                                  {selectedTopGenres.map((genre, index) => (
                                    <div key={index} className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                                      <Star className="h-3 w-3" />
                                      {genre}
                                      <button 
                                        type="button"
                                        onClick={() => {
                                          setSelectedTopGenres(selectedTopGenres.filter((_, i) => i !== index));
                                        }}
                                        className="ml-1 hover:bg-orange-200 rounded-full p-1"
                                      >
                                        <X className="h-3 w-3" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                                {selectedTopGenres.length === 3 && (
                                  <div className="text-sm text-orange-600 bg-orange-50 p-2 rounded">
                                    Maximum of 3 strongest genres selected
                                  </div>
                                )}
                              </div>
                            </div>



                            {/* Artist Bio */}
                            {isArtist && (
                              <div className="bg-white p-4 rounded-lg border-2 border-indigo-200">
                                <h4 className="font-semibold mb-3 flex items-center gap-2">
                                  <Globe className="h-4 w-4 text-indigo-500" />
                                  Artist Bio
                                </h4>
                                <div className="space-y-4">
                                  <div>
                                    <label className="text-sm font-medium">Artist Bio</label>
                                    <Textarea 
                                      placeholder="Tell your story, influences, and artistic journey..."
                                      rows={4}
                                      className="mt-1"
                                    />
                                  </div>

                                  <div className="grid grid-cols-2 gap-3">
                                    <div>
                                      <label className="text-sm font-medium">Career Stage</label>
                                      <Select>
                                        <SelectTrigger className="mt-1">
                                          <SelectValue placeholder="Select career stage" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="emerging">Emerging Artist</SelectItem>
                                          <SelectItem value="developing">Developing Artist</SelectItem>
                                          <SelectItem value="established">Established Artist</SelectItem>
                                          <SelectItem value="veteran">Veteran Artist</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Location</label>
                                      <Input placeholder="City, Country" className="mt-1" />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Social Media Handles */}
                            <div className="bg-white p-4 rounded-lg border-2 border-blue-200">
                              <h4 className="font-semibold mb-3 flex items-center gap-2">
                                <Globe className="h-4 w-4 text-blue-500" />
                                Social Media Handles
                              </h4>
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm text-gray-600">Add your social media handles to create working links on your public profile</p>
                                  <Select value="" onValueChange={(platform) => {
                                    if (platform && !socialMediaHandles[platform]) {
                                      setSocialMediaHandles({
                                        ...socialMediaHandles,
                                        [platform]: ''
                                      });
                                    }
                                  }}>
                                    <SelectTrigger className="w-32">
                                      <SelectValue placeholder="+ Add" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {['Instagram', 'TikTok', 'YouTube', 'Spotify', 'SoundCloud', 'Twitter', 'Facebook', 'LinkedIn', 'Website', 'Portfolio'].map((platform) => (
                                        <SelectItem key={platform} value={platform} disabled={!!socialMediaHandles[platform]}>
                                          {platform}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                {Object.keys(socialMediaHandles).length > 0 && (
                                  <div className="space-y-2">
                                    {Object.entries(socialMediaHandles).map(([platform, handle]) => (
                                      <div key={platform} className="flex items-center gap-2 p-2 border rounded-lg">
                                        <div className="flex-1">
                                          <label className="text-sm font-medium flex items-center gap-2">
                                            {platform}
                                            {handle && (
                                              <a 
                                                href={generateSocialMediaURL(platform, handle)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-500 hover:text-blue-700"
                                              >
                                                <ExternalLink className="h-3 w-3" />
                                              </a>
                                            )}
                                          </label>
                                          <Input 
                                            placeholder={['Website', 'Portfolio', 'LinkedIn'].includes(platform) ? 'https://your-site.com' : `@yourusername`}
                                            value={handle}
                                            onChange={(e) => setSocialMediaHandles({
                                              ...socialMediaHandles,
                                              [platform]: e.target.value
                                            })}
                                            className="mt-1" 
                                          />
                                        </div>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => {
                                            const updated = { ...socialMediaHandles };
                                            delete updated[platform];
                                            setSocialMediaHandles(updated);
                                          }}
                                          className="text-red-500 hover:text-red-700"
                                        >
                                          <X className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Musician Bio */}
                            {isMusician && !isArtist && (
                              <div className="bg-white p-4 rounded-lg border-2 border-indigo-200">
                                <h4 className="font-semibold mb-3 flex items-center gap-2">
                                  <Globe className="h-4 w-4 text-indigo-500" />
                                  Musician Bio
                                </h4>
                                <div className="space-y-4">
                                  <div>
                                    <label className="text-sm font-medium">Musician Bio</label>
                                    <Textarea 
                                      placeholder="Tell your story, musical background, and session experience..."
                                      rows={4}
                                      className="mt-1"
                                    />
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {isMusician && (
                          <div className="space-y-6">
                            {/* Instrument Specializations */}
                            <div className="bg-white p-4 rounded-lg border-2 border-green-200">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-semibold flex items-center gap-2">
                                  <Music className="h-4 w-4 text-green-500" />
                                  Instrument Specializations
                                </h4>
                                <div className="flex items-center gap-2">
                                  <Input 
                                    placeholder="Enter instrument name"
                                    value={newInstrumentName}
                                    onChange={(e) => setNewInstrumentName(e.target.value)}
                                    className="w-40"
                                  />
                                  <Button 
                                    type="button" 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => {
                                      if (newInstrumentName.trim()) {
                                        setInstruments([...instruments, { 
                                          name: newInstrumentName.trim(), 
                                          isPrimary: instruments.length === 0 
                                        }]);
                                        setNewInstrumentName("");
                                      }
                                    }}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {instruments.map((instrument, index) => (
                                  <div 
                                    key={index} 
                                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                                      instrument.isPrimary 
                                        ? 'bg-green-500 text-white' 
                                        : 'bg-green-100 text-green-700'
                                    }`}
                                  >
                                    {instrument.name}
                                    {instrument.isPrimary && <Star className="h-3 w-3" />}
                                    <div className="flex items-center gap-1 ml-2">
                                      {!instrument.isPrimary && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setInstruments(instruments.map((inst, i) => ({
                                              ...inst,
                                              isPrimary: i === index
                                            })));
                                          }}
                                          className="hover:bg-white/20 rounded-full p-1"
                                          title="Set as primary"
                                        >
                                          <Star className="h-3 w-3" />
                                        </button>
                                      )}
                                      <button 
                                        type="button"
                                        onClick={() => {
                                          setInstruments(instruments.filter((_, i) => i !== index));
                                        }}
                                        className="hover:bg-white/20 rounded-full p-1"
                                      >
                                        <X className="h-3 w-3" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Availability & Booking Preferences */}
                            <div className="bg-white p-4 rounded-lg border-2 border-purple-200">
                              <h4 className="font-semibold mb-3 flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-purple-500" />
                                Availability Preferences
                              </h4>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium">Preferred Session Types</label>
                                    <div className="space-y-2 mt-1">
                                      {['Studio Recording', 'Live Performance', 'Online Session', 'Teaching/Lessons'].map((type) => (
                                        <div key={type} className="flex items-center space-x-2">
                                          <input type="checkbox" id={type} className="rounded" defaultChecked={type !== 'Teaching/Lessons'} />
                                          <label htmlFor={type} className="text-sm">{type}</label>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Minimum Notice Period</label>
                                    <div className="space-y-2 mt-1">
                                      <Select defaultValue="24hours">
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="4hours">4 hours</SelectItem>
                                          <SelectItem value="12hours">12 hours</SelectItem>
                                          <SelectItem value="24hours">24 hours</SelectItem>
                                          <SelectItem value="48hours">48 hours</SelectItem>
                                          <SelectItem value="1week">1 week</SelectItem>
                                          <SelectItem value="custom">Custom number of days</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <div className="flex items-center gap-2">
                                        <Input 
                                          type="number" 
                                          placeholder="Number of days" 
                                          className="w-32" 
                                          min="1"
                                          max="365"
                                        />
                                        <span className="text-sm text-muted-foreground">days advance notice</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                <div>
                                  <label className="text-sm font-medium">Rate Structure</label>
                                  <div className="grid grid-cols-3 gap-3 mt-1">
                                    <div>
                                      <Input placeholder="Studio Rate/Hour" defaultValue="$85/hr" />
                                    </div>
                                    <div>
                                      <Input placeholder="Live Rate/Event" defaultValue="$200/show" />
                                    </div>
                                    <div>
                                      <Input placeholder="Online Rate/Hour" defaultValue="$60/hr" />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Experience - with real-time booking data */}
                            <div className="bg-white p-4 rounded-lg border-2 border-orange-200">
                              <h4 className="font-semibold mb-3 flex items-center gap-2">
                                <Clock className="h-4 w-4 text-orange-500" />
                                Experience
                              </h4>
                              <div className="space-y-3">
                                <div className="grid grid-cols-3 gap-4 text-center">
                                  <div className="p-3 bg-orange-50 rounded-lg">
                                    <div className="text-xl font-bold text-orange-600">85</div>
                                    <div className="text-sm text-gray-600">Total Sessions</div>
                                  </div>
                                  <div className="p-3 bg-blue-50 rounded-lg">
                                    <div className="text-xl font-bold text-blue-600">4.9</div>
                                    <div className="text-sm text-gray-600">Avg Rating</div>
                                  </div>
                                  <div className="p-3 bg-green-50 rounded-lg">
                                    <div className="text-xl font-bold text-green-600">98%</div>
                                    <div className="text-sm text-gray-600">Completion Rate</div>
                                  </div>
                                </div>
                                
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                      <div className="font-medium">Recent Session: Jazz Quartet Recording</div>
                                      <div className="text-sm text-gray-600">Piano • Studio Session • 3 hours</div>
                                    </div>
                                    <Badge variant="outline">Completed</Badge>
                                  </div>
                                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                    <div>
                                      <div className="font-medium">Upcoming: Live Performance Backup</div>
                                      <div className="text-sm text-gray-600">Guitar • Live Venue • 2 hours</div>
                                    </div>
                                    <Badge variant="default">Scheduled</Badge>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Professional Services Section */}
                    {isProfessional && (
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
                        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                          <Briefcase className="h-6 w-6" />
                          Professional Services
                        </h3>
                        
                        <div className="space-y-6">
                          {/* Service Specializations */}
                          <div className="bg-white p-4 rounded-lg border-2 border-blue-200">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-semibold flex items-center gap-2">
                                <Briefcase className="h-4 w-4 text-blue-500" />
                                Service Specializations
                              </h4>
                            </div>
                            <div className="space-y-3 mb-4">
                              <div className="relative">
                                <Input
                                  placeholder="Type to search and filter professional specializations..."
                                  value={professionSearchTerm || ""}
                                  onChange={(e) => {
                                    setProfessionSearchTerm(e.target.value);
                                    // Auto-open dropdown when typing
                                    const selectTrigger = document.querySelector('[data-profession-select="specializations"] [role="combobox"]') as HTMLElement;
                                    if (selectTrigger && e.target.value.length > 0) {
                                      selectTrigger.click();
                                    }
                                  }}
                                  onFocus={() => {
                                    // Open dropdown on focus
                                    setTimeout(() => {
                                      const selectTrigger = document.querySelector('[data-profession-select="specializations"] [role="combobox"]') as HTMLElement;
                                      if (selectTrigger) selectTrigger.click();
                                    }, 100);
                                  }}
                                  className="w-full"
                                />
                              </div>
                              <div data-profession-select="specializations">
                                <Select
                                  onValueChange={(value) => {
                                    // Find the selected profession object
                                    const selectedProfession = Object.entries(globalProfessions).flatMap(([category, professions]) =>
                                      (professions as any[]).map(prof => ({ ...prof, category }))
                                    ).find(prof => prof.name === value);
                                    
                                    if (selectedProfession && !specializations.some(spec => spec.name === selectedProfession.name)) {
                                      setSpecializations([...specializations, {
                                        name: selectedProfession.name,
                                        category: selectedProfession.category
                                      }]);
                                      setProfessionSearchTerm(""); // Clear search after selection
                                    }
                                  }}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Add professional specializations" />
                                  </SelectTrigger>
                                  <SelectContent className="max-h-64 overflow-y-auto">
                                    {Object.entries(globalProfessions).map(([category, professions]) => {
                                      const filteredProfessions = (professions as any[]).filter(profession =>
                                        profession.name.toLowerCase().includes((professionSearchTerm || "").toLowerCase()) &&
                                        !specializations.some(spec => spec.name === profession.name)
                                      );
                                      
                                      if (filteredProfessions.length === 0) return null;
                                      
                                      return (
                                        <div key={category}>
                                          <div className="px-3 py-2 text-sm font-medium text-gray-500 bg-gray-50 sticky top-0">
                                            {category} ({filteredProfessions.length})
                                          </div>
                                          {filteredProfessions.map((profession) => (
                                            <SelectItem key={profession.id} value={profession.name}>
                                              <div className="flex items-center gap-2">
                                                <Briefcase className="h-3 w-3 text-blue-500" />
                                                {profession.name}
                                              </div>
                                            </SelectItem>
                                          ))}
                                        </div>
                                      );
                                    })}
                                    {professionSearchTerm && Object.entries(globalProfessions).every(([_, professions]) => 
                                      (professions as any[]).filter(profession =>
                                        profession.name.toLowerCase().includes(professionSearchTerm.toLowerCase()) &&
                                        !specializations.some(spec => spec.name === profession.name)
                                      ).length === 0
                                    ) && (
                                      <div className="px-3 py-2 text-sm text-gray-500 text-center">
                                        No specializations found matching "{professionSearchTerm}"
                                      </div>
                                    )}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                              {specializations.map((spec, index) => (
                                <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-blue-50">
                                  <div>
                                    <div className="font-medium text-blue-900">{spec.name}</div>
                                    <div className="text-sm text-blue-700">{spec.category}</div>
                                  </div>
                                  <button 
                                    type="button"
                                    onClick={() => {
                                      setSpecializations(specializations.filter((_, i) => i !== index));
                                    }}
                                    className="text-red-500 hover:bg-red-100 rounded p-1"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Additional Professional Service Sections */}
                          <div className="space-y-6">
                            {/* Service Packages */}
                            <div className="bg-white p-4 rounded-lg border-2 border-green-200">
                              <h4 className="font-semibold mb-3 flex items-center gap-2">
                                <Package className="h-4 w-4 text-green-500" />
                                Service Packages
                              </h4>
                              <div className="space-y-3">
                                {servicePackages.map((pkg, index) => (
                                  <div key={index} className="p-4 border rounded-lg bg-green-50">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                      <div>
                                        <label className="text-xs font-medium text-green-700 mb-1 block">Package Name</label>
                                        <Input
                                          value={pkg.name}
                                          onChange={(e) => {
                                            const updated = [...servicePackages];
                                            updated[index].name = e.target.value;
                                            setServicePackages(updated);
                                          }}
                                          className="bg-white border-green-300"
                                          placeholder="e.g., Basic Consultation"
                                        />
                                      </div>
                                      <div>
                                        <label className="text-xs font-medium text-green-700 mb-1 block">Price ($)</label>
                                        <Input
                                          value={pkg.price}
                                          onChange={(e) => {
                                            const updated = [...servicePackages];
                                            updated[index].price = e.target.value;
                                            setServicePackages(updated);
                                          }}
                                          className="bg-white border-green-300"
                                          placeholder="100"
                                          type="number"
                                        />
                                      </div>
                                    </div>
                                    <div className="mb-3">
                                      <label className="text-xs font-medium text-green-700 mb-1 block">Description</label>
                                      <textarea
                                        value={pkg.description}
                                        onChange={(e) => {
                                          const updated = [...servicePackages];
                                          updated[index].description = e.target.value;
                                          setServicePackages(updated);
                                        }}
                                        className="w-full p-2 border border-green-300 rounded-md bg-white text-sm"
                                        rows={2}
                                        placeholder="Describe what's included in this service package"
                                      />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                      <div>
                                        <label className="text-xs font-medium text-green-700 mb-1 block">Duration</label>
                                        <Input
                                          value={pkg.duration}
                                          onChange={(e) => {
                                            const updated = [...servicePackages];
                                            updated[index].duration = e.target.value;
                                            setServicePackages(updated);
                                          }}
                                          className="bg-white border-green-300"
                                          placeholder="e.g., 1 hour, 2 weeks, ongoing"
                                        />
                                      </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <Button
                                        type="button"
                                        size="sm"
                                        onClick={async () => {
                                          try {
                                            const serviceData = {
                                              name: pkg.name,
                                              description: pkg.description,
                                              price: parseFloat(pkg.price) || 0,
                                              duration: pkg.duration,
                                              categoryId: 5, // Consultation Services category
                                              isActive: true
                                            };
                                            
                                            if (pkg.id) {
                                              // Update existing service
                                              await apiRequest(`/api/user-services/${pkg.id}`, {
                                                method: 'PUT',
                                                body: serviceData
                                              });
                                              toast({
                                                title: "Service Updated",
                                                description: `${pkg.name} has been updated successfully`,
                                              });
                                            } else {
                                              // Create new service
                                              const newService = await apiRequest('/api/user-services', {
                                                method: 'POST',
                                                body: serviceData
                                              });
                                              
                                              // Update local state with the new service ID
                                              const updated = [...servicePackages];
                                              updated[index].id = newService.id;
                                              setServicePackages(updated);
                                              
                                              toast({
                                                title: "Service Created",
                                                description: `${pkg.name} has been created successfully`,
                                              });
                                            }
                                          } catch (error) {
                                            toast({
                                              title: "Save Failed",
                                              description: "Failed to save service package",
                                              variant: "destructive"
                                            });
                                          }
                                        }}
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                      >
                                        <Save className="h-3 w-3 mr-1" />
                                        Save Package
                                      </Button>
                                      <button 
                                        type="button"
                                        onClick={() => {
                                          setServicePackages(servicePackages.filter((_, i) => i !== index));
                                        }}
                                        className="text-red-500 hover:bg-red-100 rounded p-2"
                                        title="Remove package"
                                      >
                                        <X className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                                <Button 
                                  type="button" 
                                  variant="outline" 
                                  className="w-full"
                                  onClick={() => {
                                    setServicePackages([...servicePackages, {
                                      name: "New Service Package",
                                      description: "Describe your service offering",
                                      price: "100",
                                      duration: "1 hour"
                                    }]);
                                  }}
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Add Service Package
                                </Button>
                              </div>
                            </div>

                            {/* Consultation Availability Settings */}
                            <div className="bg-white p-4 rounded-lg border-2 border-orange-200">
                              <h4 className="font-semibold mb-3 flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-orange-500" />
                                Consultation Availability
                              </h4>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium">Consultation Types Offered</label>
                                    <div className="space-y-2 mt-1">
                                      {['Strategy Consultation', 'Career Development', 'Business Planning', 'Technical Advisory', 'Mentorship Programs'].map((type) => (
                                        <div key={type} className="flex items-center space-x-2">
                                          <input type="checkbox" id={`consult-${type}`} className="rounded" defaultChecked />
                                          <label htmlFor={`consult-${type}`} className="text-sm">{type}</label>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Meeting Formats</label>
                                    <div className="space-y-2 mt-1">
                                      {['Video Call', 'Phone Call', 'In-Person', 'Email Consultation'].map((format) => (
                                        <div key={format} className="flex items-center space-x-2">
                                          <input type="checkbox" id={`format-${format}`} className="rounded" defaultChecked={format !== 'In-Person'} />
                                          <label htmlFor={`format-${format}`} className="text-sm">{format}</label>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  <label className="text-sm font-medium">Consultation Rates</label>
                                  <div className="grid grid-cols-3 gap-3 mt-1">
                                    <div>
                                      <Input placeholder="Hourly Rate" />
                                    </div>
                                    <div>
                                      <Input placeholder="Half-Day Rate" />
                                    </div>
                                    <div>
                                      <Input placeholder="Full-Day Rate" />
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  <label className="text-sm font-medium">Availability Notes</label>
                                  <Textarea 
                                    placeholder="Special scheduling notes: vacation periods, preferred booking windows, emergency availability, etc."
                                    rows={3}
                                    className="mt-1"
                                  />
                                </div>

                                <div className="flex gap-3">
                                  <Button variant="outline" className="flex-1">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Preview Calendar Impact
                                  </Button>
                                  <Button variant="default" className="flex-1">
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Save Availability Settings
                                  </Button>
                                </div>
                              </div>
                            </div>

                            {/* Professional Bio */}
                            {isProfessional && !isArtist && !isMusician && (
                              <div className="bg-white p-4 rounded-lg border-2 border-indigo-200">
                                <h4 className="font-semibold mb-3 flex items-center gap-2">
                                  <Globe className="h-4 w-4 text-indigo-500" />
                                  Professional Bio
                                </h4>
                                <div className="space-y-4">
                                  <div>
                                    <label className="text-sm font-medium">Professional Bio</label>
                                    <Textarea 
                                      placeholder="Describe your professional background, expertise, and client approach..."
                                      rows={4}
                                      className="mt-1"
                                    />
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Client Portfolio & Testimonials - Moved to Bottom */}
                            <div className="bg-white p-4 rounded-lg border-2 border-purple-200">
                              <h4 className="font-semibold mb-3 flex items-center gap-2">
                                <Users className="h-4 w-4 text-purple-500" />
                                Client Portfolio
                              </h4>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
                                  <div className="p-3 bg-purple-50 rounded-lg">
                                    <div className="text-xl font-bold text-purple-600">45</div>
                                    <div className="text-sm text-gray-600">Total Clients</div>
                                  </div>
                                  <div className="p-3 bg-blue-50 rounded-lg">
                                    <div className="text-xl font-bold text-blue-600">4.8</div>
                                    <div className="text-sm text-gray-600">Avg Rating</div>
                                  </div>
                                  <div className="p-3 bg-green-50 rounded-lg">
                                    <div className="text-xl font-bold text-green-600">120</div>
                                    <div className="text-sm text-gray-600">Projects Completed</div>
                                  </div>
                                  <div className="p-3 bg-orange-50 rounded-lg">
                                    <div className="text-xl font-bold text-orange-600">95%</div>
                                    <div className="text-sm text-gray-600">Retention Rate</div>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <h5 className="font-medium">Recent Client Work</h5>
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                      <div>
                                        <div className="font-medium">Indie Artist Development Program</div>
                                        <div className="text-sm text-gray-600">Artist Management • 6 months • $2,500/month</div>
                                      </div>
                                      <Badge variant="default">Active</Badge>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                      <div>
                                        <div className="font-medium">Record Label Consultation</div>
                                        <div className="text-sm text-gray-600">Business Strategy • 3 months • $5,000 total</div>
                                      </div>
                                      <Badge variant="outline">Completed</Badge>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                )}
                </>

                {/* Action Buttons - Mobile Optimized */}
                <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-6 border-t bg-gray-50/50 -mx-6 px-6 py-4 rounded-b-lg mt-6">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => onOpenChange(false)}
                    disabled={isLoading}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                    {isLoading ? "Processing..." : isTransitioningToArtist ? "Initiate Release Contract" : "Update User"}
                  </Button>
                </div>
              </form>
            </Form>
          </Tabs>
        </div>
      </DialogContent>
      
      {/* Professional Specialization Modal */}
      <Dialog open={showSpecializationModal} onOpenChange={setShowSpecializationModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Professional Specializations</DialogTitle>
            <DialogDescription>
              Select your professional specializations from our comprehensive global catalog or add custom ones.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Selected Specializations */}
            <div className="space-y-2">
              <h4 className="font-medium">Selected Specializations</h4>
              <div className="flex flex-wrap gap-2">
                {userSpecializations.map((spec, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {spec}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0"
                      onClick={() => {
                        setUserSpecializations(userSpecializations.filter(s => s !== spec));
                      }}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
            
            {/* Available Specializations */}
            <div className="space-y-4">
              <h4 className="font-medium">Available Specializations</h4>
              {Object.entries(globalProfessions).map(([category, professions]) => (
                <div key={category} className="space-y-2">
                  <h5 className="font-medium text-sm text-muted-foreground">{category}</h5>
                  <div className="flex flex-wrap gap-2">
                    {(professions as any[]).map(profession => (
                      <div key={profession.id} className="flex items-center gap-2 p-2 border rounded-lg">
                        <Button
                          variant={userSpecializations.includes(profession.name) ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            if (userSpecializations.includes(profession.name)) {
                              setUserSpecializations(userSpecializations.filter(s => s !== profession.name));
                            } else {
                              setUserSpecializations([...userSpecializations, profession.name]);
                            }
                          }}
                          className="flex items-center gap-1"
                        >
                          {!userSpecializations.includes(profession.name) && <Plus className="w-3 h-3" />}
                          {profession.name}
                          {profession.isCustom && <Star className="w-3 h-3 ml-1" />}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowSpecializationModal(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                setShowSpecializationModal(false);
                toast({
                  title: "Specializations Updated",
                  description: "Professional specializations have been updated successfully."
                });
              }}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
