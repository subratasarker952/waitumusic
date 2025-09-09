import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import StageNameManager from '@/components/StageNameManager';
import { Edit, Save, X, FileText, Plus, Trash2, Crown, Loader2, ArrowLeft } from 'lucide-react';
import { useLocation } from 'wouter';

export default function ProfileEditPage() {
  const { toast } = useToast();
  const { user, roles } = useAuth();
  const [, setLocation] = useLocation();

  // Roles array
  const userRoles = roles?.map(r => r.id) || [];

  // Utility
  const hasRole = (ids: number[]) => userRoles.some(r => ids.includes(r));

  // Flags
  const isAdmin = hasRole([1, 2]);
  const isSuperadmin = userRoles.includes(1);

  const isManagedArtist = userRoles.includes(3);
  const isArtist = userRoles.includes(4) || isManagedArtist;

  const isManagedMusician = userRoles.includes(5);
  const isMusician = userRoles.includes(6) || isManagedMusician;

  const isManagedProfessional = userRoles.includes(7);
  const isProfessional = userRoles.includes(8) || isManagedProfessional;

  const isFan = userRoles.includes(9);

  // Get user type
  const getUserType = (roleIds: number[]) => {
    if (roleIds.some(r => [3, 4].includes(r))) return "artist";
    if (roleIds.some(r => [5, 6].includes(r))) return "musician";
    if (roleIds.some(r => [7, 8].includes(r))) return "professional";
    if (roleIds.includes(9)) return "fan";
    return "unknown";
  };

  const userType = user ? getUserType(userRoles) : "unknown";

  const userSpecializations: string[] = [];

  // Fetch existing user requirements from database using proper query parameters
  const { data: existingHospitalityRequirements = [], isLoading: hospitalityLoading } = useQuery({
    queryKey: [`/api/users/${user?.id}/hospitality-requirements?includeDemo=true`],
    enabled: !!user?.id
  });

  const { data: existingTechnicalRequirements = [], isLoading: technicalLoading } = useQuery({
    queryKey: [`/api/users/${user?.id}/technical-requirements?includeDemo=true`],
    enabled: !!user?.id
  });

  const { data: existingPerformanceSpecs = [], isLoading: performanceLoading } = useQuery({
    queryKey: [`/api/users/${user?.id}/performance-specs?includeDemo=true`],
    enabled: !!user?.id
  });

  // PRO registration eligibility: Artists, Musicians, and Music-related Professionals
  const musicProfessionalTypes = [
    'background_vocalist', 'producer', 'arranger', 'composer', 'songwriter',
    'dj', 'music_director', 'sound_engineer', 'mixing_engineer', 'mastering_engineer',
    'music_producer', 'beat_maker', 'orchestrator', 'lyricist', 'jingle_writer'
  ];


  const isPROEligible = userType === 'artist' || userType === 'musician' ||
    (userType === 'professional' && userSpecializations.some(spec =>
      musicProfessionalTypes.includes(spec.toLowerCase().replace(/\s+/g, '_'))
    ));

  // Hospitality Requirements Access Control
  // Role IDs: 1=Superadmin, 2=Admin, 3=Managed Artist, 4=Artist, 5=Managed Musician, 6=Musician, 7=Managed Professional, 8=Professional, 9=Fan
  const managedUserRoles = [3, 5, 7]; // Managed Artist, Managed Musician, Managed Professional
  const nonManagedUserRoles = [4, 6, 8]; // Artist, Musician, Professional
  const excludedRoles = [1, 2, 9]; // Superadmin, Admin, Fan

  const isManaged = userRoles.some(r => managedUserRoles.includes(r));
  const isNonManaged = userRoles.some(r => nonManagedUserRoles.includes(r));
  const isExcluded = userRoles.some(r => excludedRoles.includes(r));

  const isEligibleForHospitality = !isExcluded && (isManaged || isNonManaged);
  // Subscription status (only for non-managed)
  const { data: subscriptionStatus } = useQuery({
    queryKey: ['/api/user/subscription-status'],
    enabled: isNonManaged
  });

  const hasAccess = isManaged || (isNonManaged && (subscriptionStatus as any)?.isActive);
  const hasHospitalityAccess = hasAccess;
  const hasTechnicalAccess = hasAccess;
  const hasPerformanceAccess = hasAccess;

  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    bio: '',
    stageName: userType === 'artist' ? (user?.fullName || user?.email?.split('@')[0] || '') : '',
    primaryGenre: (userType === 'artist' || userType === 'musician') ? '' : '',
    secondaryGenres: [] as string[],
    topGenres: [] as string[],
    instruments: userType === 'musician' ? '' : '',
    services: userType === 'professional' ? '' : '',
    websiteUrl: '',
    phoneNumber: '',
    // PRO Registration
    isRegisteredWithPRO: false,
    performingRightsOrganization: '',
    ipiNumber: '',
    socialMediaHandles: [] as { platform: string; handle: string }[],
    // Requirements
    technicalRequirements: [] as { id?: number; category: string; requirement: string; notes: string }[],
    hospitalityRequirements: [] as { id?: number; category: string; requirement: string; notes: string }[],
    performanceSpecs: [] as { id?: number; category: string; specification: string; notes: string }[]
  });

  // Populate form data when existing requirements are loaded
  useEffect(() => {
    console.log('Hospitality requirements loaded:', existingHospitalityRequirements);
    if ((existingHospitalityRequirements as any[]).length > 0) {
      const hospitalityData = (existingHospitalityRequirements as any[]).map((req: any) => ({
        id: req.id,
        category: req.requirement_type || 'Other',
        requirement: req.requirement_name || '',
        notes: req.specifications || ''
      }));

      console.log('Mapped hospitality data:', hospitalityData);
      setFormData(prev => ({
        ...prev,
        hospitalityRequirements: hospitalityData
      }));
    }
  }, [existingHospitalityRequirements]);

  useEffect(() => {
    console.log('Technical requirements loaded:', existingTechnicalRequirements);
    if ((existingTechnicalRequirements as any[]).length > 0) {
      const technicalData = (existingTechnicalRequirements as any[]).map((req: any) => ({
        id: req.id,
        category: req.requirement_type || 'Other',
        requirement: req.requirement_name || '',
        notes: req.specifications || ''
      }));

      console.log('Mapped technical data:', technicalData);
      setFormData(prev => ({
        ...prev,
        technicalRequirements: technicalData
      }));
    }
  }, [existingTechnicalRequirements]);

  useEffect(() => {
    console.log('Performance specs loaded:', existingPerformanceSpecs);
    if ((existingPerformanceSpecs as any[]).length > 0) {
      const performanceData = (existingPerformanceSpecs as any[]).map((spec: any) => ({
        id: spec.id,
        category: spec.spec_type || 'Other',
        specification: spec.spec_name || '',
        notes: spec.spec_value || ''
      }));

      console.log('Mapped performance data:', performanceData);
      setFormData(prev => ({
        ...prev,
        performanceSpecs: performanceData
      }));
    }
  }, [existingPerformanceSpecs]);

  const [newSocialHandle, setNewSocialHandle] = useState({ platform: '', handle: '' });
  const [availablePlatforms] = useState([
    'Instagram', 'TikTok', 'YouTube', 'Spotify', 'SoundCloud', 'Twitter',
    'Facebook', 'LinkedIn', 'Website', 'Portfolio', 'Apple Music', 'Deezer'
  ]);

  const [genreOptions] = useState([
    'Pop', 'Hip-Hop', 'R&B', 'Gospel', 'Caribbean', 'Afrobeats', 'Neo Soul',
    'Jazz', 'Blues', 'Country', 'Rock', 'Electronic', 'Folk', 'Reggae',
    'Dancehall', 'Soca', 'Calypso', 'Latin', 'World', 'Classical'
  ]);

  // Technical Requirements state
  const [newTechnicalReq, setNewTechnicalReq] = useState({ category: '', requirement: '', notes: '' });
  const [technicalCategories] = useState([
    'Audio Equipment', 'Instruments', 'Stage Setup', 'Lighting', 'Power Requirements',
    'Recording Equipment', 'Monitors', 'Microphones', 'Cables & Connections', 'Other'
  ]);

  // Hospitality Requirements state  
  const [newHospitalityReq, setNewHospitalityReq] = useState({ category: '', requirement: '', notes: '' });
  const [hospitalityCategories] = useState([
    'Dressing Room', 'Catering', 'Transportation', 'Accommodation', 'Security',
    'Guest List', 'Parking', 'Merchandise Space', 'Meet & Greet Area', 'Other'
  ]);

  // Performance Specifications state
  const [newPerformanceSpec, setNewPerformanceSpec] = useState({ category: '', specification: '', notes: '' });
  const [performanceCategories] = useState([
    'Setlist Requirements', 'Timing & Schedule', 'Special Effects', 'Costume Changes',
    'Backup Musicians', 'Rehearsal Needs', 'Sound Check', 'Performance Flow', 'Other'
  ]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Add functions for technical requirements
  const addTechnicalRequirement = () => {
    if (newTechnicalReq.category && newTechnicalReq.requirement) {
      setFormData(prev => ({
        ...prev,
        technicalRequirements: [...prev.technicalRequirements, { ...newTechnicalReq }]
      }));
      setNewTechnicalReq({ category: '', requirement: '', notes: '' });
      toast({ title: "Technical Requirement Added", description: "Technical requirement added to your profile" });
    }
  };

  const removeTechnicalRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      technicalRequirements: prev.technicalRequirements.filter((_, i) => i !== index)
    }));
    toast({ title: "Technical Requirement Removed", description: "Technical requirement removed from your profile" });
  };

  // Add functions for hospitality requirements
  const addHospitalityRequirement = () => {
    if (newHospitalityReq.category && newHospitalityReq.requirement) {
      setFormData(prev => ({
        ...prev,
        hospitalityRequirements: [...prev.hospitalityRequirements, { ...newHospitalityReq }]
      }));
      setNewHospitalityReq({ category: '', requirement: '', notes: '' });
      toast({ title: "Hospitality Requirement Added", description: "Hospitality requirement added to your profile" });
    }
  };

  const removeHospitalityRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      hospitalityRequirements: prev.hospitalityRequirements.filter((_, i) => i !== index)
    }));
    toast({ title: "Hospitality Requirement Removed", description: "Hospitality requirement removed from your profile" });
  };

  // Add functions for performance specifications
  const addPerformanceSpec = () => {
    if (newPerformanceSpec.category && newPerformanceSpec.specification) {
      setFormData(prev => ({
        ...prev,
        performanceSpecs: [...prev.performanceSpecs, { ...newPerformanceSpec }]
      }));
      setNewPerformanceSpec({ category: '', specification: '', notes: '' });
      toast({ title: "Performance Spec Added", description: "Performance specification added to your profile" });
    }
  };

  const removePerformanceSpec = (index: number) => {
    setFormData(prev => ({
      ...prev,
      performanceSpecs: prev.performanceSpecs.filter((_, i) => i !== index)
    }));
    toast({ title: "Performance Spec Removed", description: "Performance specification removed from your profile" });
  };

  const addSocialHandle = () => {
    if (newSocialHandle.platform && newSocialHandle.handle) {
      setFormData(prev => ({
        ...prev,
        socialMediaHandles: [...prev.socialMediaHandles, { ...newSocialHandle }]
      }));
      setNewSocialHandle({ platform: '', handle: '' });
      toast({ title: "Social Handle Added", description: "Social media handle added to your profile" });
    }
  };

  const removeSocialHandle = (index: number) => {
    setFormData(prev => ({
      ...prev,
      socialMediaHandles: prev.socialMediaHandles.filter((_, i) => i !== index)
    }));
    toast({ title: "Social Handle Removed", description: "Social media handle removed from your profile" });
  };

  const addGenreToSecondary = (genre: string) => {
    if (genre && genre !== formData.primaryGenre && !formData.secondaryGenres.includes(genre)) {
      setFormData(prev => ({
        ...prev,
        secondaryGenres: [...prev.secondaryGenres, genre]
      }));
      toast({ title: "Genre Added", description: `${genre} added to secondary genres` });
    }
  };

  const removeSecondaryGenre = (genre: string) => {
    setFormData(prev => ({
      ...prev,
      secondaryGenres: prev.secondaryGenres.filter(g => g !== genre),
      topGenres: prev.topGenres.filter(g => g !== genre)
    }));
    toast({ title: "Genre Removed", description: `${genre} removed from your genres` });
  };

  const toggleTopGenre = (genre: string) => {
    setFormData(prev => ({
      ...prev,
      topGenres: prev.topGenres.includes(genre)
        ? prev.topGenres.filter(g => g !== genre)
        : [...prev.topGenres, genre]
    }));
  };

  const handleSave = () => {
    toast({ title: "Profile Updated", description: "Your profile has been updated successfully" });
    setLocation('/dashboard');
  };

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to edit your profile</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => setLocation('/dashboard')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold">Edit Profile</h1>
        <p className="text-muted-foreground">Update your profile information and preferences</p>
      </div>

      <div className="space-y-8 bg-white rounded-lg border p-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder="Enter your full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                placeholder="Your phone number"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Tell us about yourself..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="websiteUrl">Website URL</Label>
            <Input
              id="websiteUrl"
              value={formData.websiteUrl}
              onChange={(e) => handleInputChange('websiteUrl', e.target.value)}
              placeholder="https://yourwebsite.com"
            />
          </div>
        </div>

        {/* Stage Name for Artists */}
        {userType === 'artist' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Artist Information</h2>
            <StageNameManager
              userType={userType as 'artist' | 'musician'}
              userId={user?.id}
              initialStageNames={formData.stageName ? [{ name: formData.stageName, isPrimary: true }] : []}
            />

          </div>
        )}

        {/* Genre Selection for Artists/Musicians */}
        {(userType === 'artist' || userType === 'musician') && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Musical Genres</h2>
            <div className="space-y-2">
              <Label htmlFor="primaryGenre">Primary Genre</Label>
              <Select
                value={formData.primaryGenre}
                onValueChange={(value) => handleInputChange('primaryGenre', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your primary genre" />
                </SelectTrigger>
                <SelectContent>
                  {genreOptions.map((genre) => (
                    <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Instruments for Musicians */}
        {userType === 'musician' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Instruments</h2>
            <div className="space-y-2">
              <Label htmlFor="instruments">Instruments You Play</Label>
              <Input
                id="instruments"
                value={formData.instruments}
                onChange={(e) => handleInputChange('instruments', e.target.value)}
                placeholder="e.g., Piano, Guitar, Drums"
              />
            </div>
          </div>
        )}

        {/* Services for Professionals */}
        {userType === 'professional' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Professional Services</h2>
            <div className="space-y-2">
              <Label htmlFor="services">Services You Offer</Label>
              <Input
                id="services"
                value={formData.services}
                onChange={(e) => handleInputChange('services', e.target.value)}
                placeholder="e.g., Music Production, Sound Engineering"
              />
            </div>
          </div>
        )}

        {/* Social Media Handles */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Social Media</h2>
          <p className="text-sm text-muted-foreground">
            Add your social media profiles for better discoverability
          </p>

          <div className="flex gap-2">
            <Select
              value={newSocialHandle.platform}
              onValueChange={(value) => setNewSocialHandle(prev => ({ ...prev, platform: value }))}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Platform" />
              </SelectTrigger>
              <SelectContent>
                {availablePlatforms.filter(platform =>
                  !formData.socialMediaHandles.some(handle => handle.platform === platform)
                ).map((platform) => (
                  <SelectItem key={platform} value={platform}>{platform}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="@username or URL"
              value={newSocialHandle.handle}
              onChange={(e) => setNewSocialHandle(prev => ({ ...prev, handle: e.target.value }))}
              className="flex-1"
            />
            <Button onClick={addSocialHandle} size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {formData.socialMediaHandles.length > 0 && (
            <div className="space-y-2">
              {formData.socialMediaHandles.map((handle, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{handle.platform}:</span>
                    <span className="text-muted-foreground">{handle.handle}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSocialHandle(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Technical Requirements Section - With subscription access control */}
        {isEligibleForHospitality && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                🎛️ Technical Requirements
              </h2>
              {isManaged && (
                <div className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-amber-500" />
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                    FREE
                  </span>
                </div>
              )}
              {isNonManaged && !hasTechnicalAccess && (
                <div className="flex items-center gap-2">
                  <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded-full">
                    SUBSCRIPTION REQUIRED
                  </span>
                </div>
              )}
            </div>

            <p className="text-sm text-muted-foreground">
              Define your technical specifications for auto-populating technical riders
            </p>

            {!hasTechnicalAccess && isNonManaged && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="h-5 w-5 text-orange-600" />
                  <h4 className="font-medium text-orange-900">Upgrade Required</h4>
                </div>
                <p className="text-sm text-orange-700 mb-3">
                  Technical requirements are available for managed users or with an active subscription.
                </p>
                <Button variant="outline" size="sm" className="border-orange-300 text-orange-700 hover:bg-orange-100">
                  Upgrade Now
                </Button>
              </div>
            )}

            {hasTechnicalAccess && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <Select
                    value={newTechnicalReq.category}
                    onValueChange={(value) => setNewTechnicalReq(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {technicalCategories.map((category) => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Requirement details"
                    value={newTechnicalReq.requirement}
                    onChange={(e) => setNewTechnicalReq(prev => ({ ...prev, requirement: e.target.value }))}
                  />
                  <div className="flex gap-2">
                    <Input
                      placeholder="Notes (optional)"
                      value={newTechnicalReq.notes}
                      onChange={(e) => setNewTechnicalReq(prev => ({ ...prev, notes: e.target.value }))}
                      className="flex-1"
                    />
                    <Button onClick={addTechnicalRequirement} size="icon">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {hasTechnicalAccess && formData.technicalRequirements.length > 0 && (
              <div className="space-y-2">
                {formData.technicalRequirements.map((req, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-blue-50">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-blue-800">{req.category}:</span>
                        <span className="text-blue-700">{req.requirement}</span>
                      </div>
                      {req.notes && (
                        <p className="text-sm text-blue-600 mt-1">Notes: {req.notes}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTechnicalRequirement(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Hospitality Requirements Section - With subscription access control */}
        {isEligibleForHospitality && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                🏨 Hospitality Requirements
              </h2>
              {isManaged && (
                <div className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-amber-500" />
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                    FREE
                  </span>
                </div>
              )}
              {isNonManaged && !hasHospitalityAccess && (
                <div className="flex items-center gap-2">
                  <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded-full">
                    SUBSCRIPTION REQUIRED
                  </span>
                </div>
              )}
            </div>

            <p className="text-sm text-muted-foreground">
              Define your hospitality needs for auto-populating technical riders
            </p>

            {!hasHospitalityAccess && isNonManaged && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="h-5 w-5 text-orange-600" />
                  <h4 className="font-medium text-orange-900">Upgrade Required</h4>
                </div>
                <p className="text-sm text-orange-700 mb-3">
                  Hospitality requirements are available for managed users or with an active subscription.
                </p>
                <Button variant="outline" size="sm" className="border-orange-300 text-orange-700 hover:bg-orange-100">
                  Upgrade Now
                </Button>
              </div>
            )}

            {hasHospitalityAccess && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <Select
                    value={newHospitalityReq.category}
                    onValueChange={(value) => setNewHospitalityReq(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {hospitalityCategories.map((category) => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Requirement details"
                    value={newHospitalityReq.requirement}
                    onChange={(e) => setNewHospitalityReq(prev => ({ ...prev, requirement: e.target.value }))}
                  />
                  <div className="flex gap-2">
                    <Input
                      placeholder="Notes (optional)"
                      value={newHospitalityReq.notes}
                      onChange={(e) => setNewHospitalityReq(prev => ({ ...prev, notes: e.target.value }))}
                      className="flex-1"
                    />
                    <Button onClick={addHospitalityRequirement} size="icon">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {hasHospitalityAccess && formData.hospitalityRequirements.length > 0 && (
              <div className="space-y-2">
                {formData.hospitalityRequirements.map((req, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-green-50">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-green-800">{req.category}:</span>
                        <span className="text-green-700">{req.requirement}</span>
                      </div>
                      {req.notes && (
                        <p className="text-sm text-green-600 mt-1">Notes: {req.notes}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeHospitalityRequirement(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Performance Specifications Section - With subscription access control */}
        {isEligibleForHospitality && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                🎭 Performance Specifications
              </h2>
              {isManaged && (
                <div className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-amber-500" />
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                    FREE
                  </span>
                </div>
              )}
              {isNonManaged && !hasPerformanceAccess && (
                <div className="flex items-center gap-2">
                  <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded-full">
                    SUBSCRIPTION REQUIRED
                  </span>
                </div>
              )}
            </div>

            <p className="text-sm text-muted-foreground">
              Define your performance requirements for auto-populating technical riders
            </p>

            {!hasPerformanceAccess && isNonManaged && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="h-5 w-5 text-orange-600" />
                  <h4 className="font-medium text-orange-900">Upgrade Required</h4>
                </div>
                <p className="text-sm text-orange-700 mb-3">
                  Performance specifications are available for managed users or with an active subscription.
                </p>
                <Button variant="outline" size="sm" className="border-orange-300 text-orange-700 hover:bg-orange-100">
                  Upgrade Now
                </Button>
              </div>
            )}

            {hasPerformanceAccess && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <Select
                    value={newPerformanceSpec.category}
                    onValueChange={(value) => setNewPerformanceSpec(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {performanceCategories.map((category) => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Specification details"
                    value={newPerformanceSpec.specification}
                    onChange={(e) => setNewPerformanceSpec(prev => ({ ...prev, specification: e.target.value }))}
                  />
                  <div className="flex gap-2">
                    <Input
                      placeholder="Notes (optional)"
                      value={newPerformanceSpec.notes}
                      onChange={(e) => setNewPerformanceSpec(prev => ({ ...prev, notes: e.target.value }))}
                      className="flex-1"
                    />
                    <Button onClick={addPerformanceSpec} size="icon">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {hasPerformanceAccess && formData.performanceSpecs.length > 0 && (
              <div className="space-y-2">
                {formData.performanceSpecs.map((spec, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-purple-50">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-purple-800">{spec.category}:</span>
                        <span className="text-purple-700">{spec.specification}</span>
                      </div>
                      {spec.notes && (
                        <p className="text-sm text-purple-600 mt-1">Notes: {spec.notes}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removePerformanceSpec(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PRO Registration Section - Only for eligible users */}
        {isPROEligible && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Performance Rights Organization (PRO)
            </h2>
            <p className="text-sm text-muted-foreground">
              Register with a PRO to collect royalties for your musical works and performances.
              PROs are open to creators worldwide.
            </p>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="pro-registered"
                  checked={formData.isRegisteredWithPRO}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isRegisteredWithPRO: checked }))}
                />
                <Label htmlFor="pro-registered">I am registered with a PRO</Label>
              </div>

              {formData.isRegisteredWithPRO && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                  <div className="space-y-2">
                    <Label htmlFor="pro-org">PRO Organization</Label>
                    <Select
                      value={formData.performingRightsOrganization}
                      onValueChange={(value) => handleInputChange('performingRightsOrganization', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select PRO" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ascap">ASCAP (USA)</SelectItem>
                        <SelectItem value="bmi">BMI (USA)</SelectItem>
                        <SelectItem value="sesac">SESAC (USA)</SelectItem>
                        <SelectItem value="socan">SOCAN (Canada)</SelectItem>
                        <SelectItem value="prs">PRS for Music (UK)</SelectItem>
                        <SelectItem value="gema">GEMA (Germany)</SelectItem>
                        <SelectItem value="sacem">SACEM (France)</SelectItem>
                        <SelectItem value="siae">SIAE (Italy)</SelectItem>
                        <SelectItem value="sgae">SGAE (Spain)</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ipi-number">IPI Number (Optional)</Label>
                    <Input
                      id="ipi-number"
                      value={formData.ipiNumber}
                      onChange={(e) => handleInputChange('ipiNumber', e.target.value)}
                      placeholder="e.g., 00123456789"
                    />
                    <p className="text-xs text-muted-foreground">
                      International Publisher Identifier (if you have one)
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button variant="outline" onClick={() => setLocation('/dashboard')}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}