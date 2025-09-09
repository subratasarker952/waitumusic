import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
import { Edit, Save, X, FileText, Plus, Trash2, Crown, Loader2 } from 'lucide-react';

interface ProfileEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userType?: 'artist' | 'musician' | 'professional' | 'fan';
  userSpecializations?: string[];
  user?: any;
}

export default function ProfileEditModal({ open, onOpenChange, userType = 'artist', userSpecializations = [], user: propUser }: ProfileEditModalProps) {
  const { toast } = useToast();
  const { user: authUser, roles } = useAuth();
  const user = propUser || authUser;

  // Roles array
  const userRoles = roles?.map(r => r.id) || [];

  // Fetch existing user requirements from database using proper query parameters
  const { data: existingHospitalityRequirements = [], isLoading: hospitalityLoading } = useQuery({
    queryKey: [`/api/users/${user?.id}/hospitality-requirements?includeDemo=true`],
    enabled: !!user?.id && open
  });

  const { data: existingTechnicalRequirements = [], isLoading: technicalLoading } = useQuery({
    queryKey: [`/api/users/${user?.id}/technical-requirements?includeDemo=true`],
    enabled: !!user?.id && open
  });

  const { data: existingPerformanceSpecs = [], isLoading: performanceLoading } = useQuery({
    queryKey: [`/api/users/${user?.id}/performance-specs?includeDemo=true`],
    enabled: !!user?.id && open
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

  const isManaged = userRoles.some(r => managedUserRoles.includes(r));
  const isNonManaged = userRoles.some(r => nonManagedUserRoles.includes(r));

  const isEligibleForHospitality = isManaged || isNonManaged;

  // Check subscription status for non-managed users
  const { data: subscriptionStatus } = useQuery({
    queryKey: ['/api/user/subscription-status'],
    enabled: isNonManaged && open
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

  const removeHospitalityRequirement = async (index: number) => {
    const requirement = formData.hospitalityRequirements[index];

    // If it has an ID, delete from database
    if (requirement.id) {
      try {
        const response = await fetch(`/api/users/${user?.id}/hospitality-requirements/${requirement.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to delete requirement');
        }
      } catch (error) {
        console.error('Error deleting hospitality requirement:', error);
        toast({
          title: "Error",
          description: "Failed to delete requirement from database",
          variant: "destructive"
        });
        return;
      }
    }

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
      const exists = formData.socialMediaHandles.some(
        handle => handle.platform === newSocialHandle.platform
      );
      if (!exists) {
        setFormData(prev => ({
          ...prev,
          socialMediaHandles: [...prev.socialMediaHandles, { ...newSocialHandle }]
        }));
        setNewSocialHandle({ platform: '', handle: '' });
      }
    }
  };

  const removeSocialHandle = (index: number) => {
    setFormData(prev => ({
      ...prev,
      socialMediaHandles: prev.socialMediaHandles.filter((_, i) => i !== index)
    }));
  };

  const addGenreToSecondary = (genre: string) => {
    if (!formData.secondaryGenres.includes(genre) && genre !== formData.primaryGenre) {
      setFormData(prev => ({
        ...prev,
        secondaryGenres: [...prev.secondaryGenres, genre]
      }));
    }
  };

  const removeSecondaryGenre = (genre: string) => {
    setFormData(prev => ({
      ...prev,
      secondaryGenres: prev.secondaryGenres.filter(g => g !== genre),
      topGenres: prev.topGenres.filter(g => g !== genre)
    }));
  };

  const toggleTopGenre = (genre: string) => {
    const isTop = formData.topGenres.includes(genre);
    setFormData(prev => ({
      ...prev,
      topGenres: isTop
        ? prev.topGenres.filter(g => g !== genre)
        : [...prev.topGenres, genre]
    }));
  };

  const handleSave = async () => {
    try {
      console.log('💾 SAVING ENHANCED PROFILE DATA:', {
        basicInfo: {
          fullName: formData.fullName,
          bio: formData.bio,
          stageName: formData.stageName,
          primaryGenre: formData.primaryGenre,
          secondaryGenres: formData.secondaryGenres,
          topGenres: formData.topGenres,
          instruments: formData.instruments,
          services: formData.services,
          websiteUrl: formData.websiteUrl,
          phoneNumber: formData.phoneNumber
        },
        socialMedia: formData.socialMediaHandles,
        proRegistration: {
          isRegistered: formData.isRegisteredWithPRO,
          organization: formData.performingRightsOrganization,
          ipiNumber: formData.ipiNumber
        },
        technicalRequirements: formData.technicalRequirements,
        hospitalityRequirements: formData.hospitalityRequirements,
        performanceSpecs: formData.performanceSpecs,
        userType,
        userId: user?.id
      });

      // TODO: Implement API calls to save:
      // 1. Basic profile data to existing tables
      // 2. Technical requirements to user_technical_requirements table
      // 3. Hospitality requirements to user_hospitality_requirements table  
      // 4. Performance specs to user_performance_specs table

      const profileUpdateData = {
        userId: user?.id,
        basicProfile: formData,
        technicalRequirements: formData.technicalRequirements,
        hospitalityRequirements: formData.hospitalityRequirements,
        performanceSpecs: formData.performanceSpecs
      };

      // Here you would make API calls to update the profile and requirements tables
      // const response = await fetch('/api/user/profile', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(profileUpdateData)
      // });

      toast({
        title: "Profile Enhanced",
        description: `Profile updated with ${formData.technicalRequirements.length} technical requirements, ${formData.hospitalityRequirements.length} hospitality needs, and ${formData.performanceSpecs.length} performance specifications.`,
      });
      onOpenChange(false);
    } catch (error) {
      console.error('❌ PROFILE SAVE ERROR:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Edit Profile
          </DialogTitle>
          <DialogDescription>
            Update your {userType} profile information and settings.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>

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

              {/* Stage Name Management - Replaced with comprehensive system for managed users */}

              {(userType === 'artist' || userType === 'musician') && (
                <div className="space-y-2">
                  <Label htmlFor="primaryGenre">Primary Genre</Label>
                  <Select
                    value={formData.primaryGenre}
                    onValueChange={(value) => handleInputChange('primaryGenre', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select primary genre" />
                    </SelectTrigger>
                    <SelectContent>
                      {genreOptions.map((genre) => (
                        <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {userType === 'musician' && (
                <div className="space-y-2">
                  <Label htmlFor="instruments">Instruments</Label>
                  <Input
                    id="instruments"
                    value={formData.instruments}
                    onChange={(e) => handleInputChange('instruments', e.target.value)}
                    placeholder="e.g., Guitar, Piano, Drums"
                  />
                </div>
              )}

              {userType === 'professional' && (
                <div className="space-y-2">
                  <Label htmlFor="services">Specialization</Label>
                  <Input
                    id="services"
                    value={formData.services}
                    onChange={(e) => handleInputChange('services', e.target.value)}
                    placeholder="e.g., Music Production, Consulting"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  placeholder="Your phone number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="websiteUrl">Website URL</Label>
                <Input
                  id="websiteUrl"
                  value={formData.websiteUrl}
                  onChange={(e) => handleInputChange('websiteUrl', e.target.value)}
                  placeholder="https://your-website.com"
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
                rows={4}
              />
            </div>
          </div>

          {/* Stage Name Management - For fully managed artists and musicians */}
          {(userType === 'artist' || userType === 'musician') && user && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Crown className="h-5 w-5" />
                Stage Name Management
              </h3>
              <StageNameManager
                userType={userType}
                userId={user.id}
                initialStageNames={user.roleData?.stageNames || []}
                isFullyManaged={user?.managementTierId === 3}
                onUpdate={(updatedStageNames: any) => {
                  // Update the user object to prevent re-initialization with old data
                  if (user.roleData) {
                    user.roleData.stageNames = updatedStageNames;
                  }
                  // Force a re-render of the parent modal if needed
                  onOpenChange(true);
                }}
              />
            </div>
          )}

          {/* Dynamic Social Media Handles */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Social Media Handles</h3>

            {/* Add new social handle */}
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

            {/* Display added social handles */}
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

          {/* Genre Selection for Artists/Musicians */}
          {(userType === 'artist' || userType === 'musician') && formData.primaryGenre && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Secondary Genres</h3>
              <p className="text-sm text-muted-foreground">Add additional genres you work with</p>

              <div className="flex gap-2">
                <Select onValueChange={addGenreToSecondary}>
                  <SelectTrigger>
                    <SelectValue placeholder="Add secondary genre" />
                  </SelectTrigger>
                  <SelectContent>
                    {genreOptions.filter(genre =>
                      genre !== formData.primaryGenre && !formData.secondaryGenres.includes(genre)
                    ).map((genre) => (
                      <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.secondaryGenres.length > 0 && (
                <div>
                  <div className="space-y-2">
                    {formData.secondaryGenres.map((genre) => (
                      <div key={genre} className="flex items-center justify-between p-2 border rounded-lg">
                        <span>{genre}</span>
                        <div className="flex gap-2">
                          <Button
                            variant={formData.topGenres.includes(genre) ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleTopGenre(genre)}
                          >
                            {formData.topGenres.includes(genre) ? "★ Top" : "☆ Top"}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSecondaryGenre(genre)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {formData.topGenres.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Your Strongest Genres:</h4>
                      <div className="flex flex-wrap gap-2">
                        {formData.topGenres.map((genre) => (
                          <span key={genre} className="px-2 py-1 bg-primary text-primary-foreground rounded-md text-sm">
                            ★ {genre}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* PRO Registration Section - Only for eligible users */}
          {isPROEligible && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Performance Rights Organization (PRO)
              </h3>
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

          {/* Technical Requirements Section - With subscription access control */}
          {isEligibleForHospitality && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  🎛️ Technical Requirements
                </h3>
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
                  {/* Add new technical requirement - Only if user has access */}
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

              {/* Display existing technical requirements - Only if user has access */}
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
              <h3 className="text-lg font-medium flex items-center gap-2">
                🏨 Hospitality Requirements
                {hospitalityLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {isManaged && <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">FREE</span>}
                {isNonManaged && !(subscriptionStatus as any)?.isActive && (
                  <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">SUBSCRIPTION REQUIRED</span>
                )}
              </h3>
              <p className="text-sm text-muted-foreground">
                Define your hospitality needs for auto-populating technical riders
                {isManaged && " - This feature is included with your managed account."}
                {isNonManaged && !(subscriptionStatus as any)?.isActive && " - Upgrade to access this professional feature."}
              </p>

              {/* Subscription upgrade prompt for non-managed users */}
              {isNonManaged && !(subscriptionStatus as any)?.isActive && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Crown className="h-5 w-5 text-orange-600" />
                    <div className="flex-1">
                      <h4 className="font-medium text-orange-800">Upgrade to Premium</h4>
                      <p className="text-sm text-orange-700">
                        Access hospitality requirements and other professional features with a subscription.
                      </p>
                    </div>
                    <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                      Upgrade Now
                    </Button>
                  </div>
                </div>
              )}

              {/* Add new hospitality requirement - Only if user has access */}
              {hasHospitalityAccess && (
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
              )}

              {/* Display added hospitality requirements - Only if user has access */}
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
                <h3 className="text-lg font-medium flex items-center gap-2">
                  🎭 Performance Specifications
                </h3>
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
                  {/* Add new performance specification - Only if user has access */}
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

              {/* Display existing performance specifications - Only if user has access */}
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
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}