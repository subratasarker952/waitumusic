import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, X, Star, Music, Users, Globe, Music2, Check, Calendar } from 'lucide-react';

interface ProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userRole: string;
  onProfileUpdated?: () => void;
}

const socialPlatforms = [
  { name: 'Instagram', icon: Globe, urlPrefix: 'https://instagram.com/' },
  { name: 'Twitter', icon: Globe, urlPrefix: 'https://twitter.com/' },
  { name: 'YouTube', icon: Globe, urlPrefix: 'https://youtube.com/' },
  { name: 'Spotify', icon: Music2, urlPrefix: 'https://spotify.com/' },
  { name: 'Facebook', icon: Globe, urlPrefix: 'https://facebook.com/' },
  { name: 'TikTok', icon: Globe, urlPrefix: 'https://tiktok.com/' },
  { name: 'SoundCloud', icon: Music2, urlPrefix: 'https://soundcloud.com/' },
];

export default function EnhancedProfileModal({ open, onOpenChange, userId, userRole, onProfileUpdated }: ProfileModalProps) {
  const [loading, setLoading] = useState(false);
  const [globalGenres, setGlobalGenres] = useState<any>({});
  const [globalProfessions, setGlobalProfessions] = useState<any>({});
  const [profileData, setProfileData] = useState<any>({
    stageName: '',
    stageNames: [],
    primaryGenre: '',
    secondaryGenres: [],
    topGenres: [],
    socialMediaHandles: [],
    instruments: [],
    biography: '',
    website: '',
    // Booking rates
    basePrice: '',
    idealPerformanceRate: '',
    idealServiceRate: '',
    minimumAcceptableRate: '',
    // Role management for technical rider integration
    performanceRoles: [],
    professionalRoles: [],
    primaryRole: '',
    skillsAndInstruments: [],
    serviceCapabilities: [],
    // Professional fields
    specializations: [],
    topSpecializations: [],
    availability: {
      availabilityType: 'weekdays',
      excludeHolidays: false,
      country: 'US',
      customDays: [],
      timeZone: 'UTC',
      startTime: '09:00',
      endTime: '17:00'
    }
  });
  const [newStageName, setNewStageName] = useState('');
  const [newSocialHandle, setNewSocialHandle] = useState({ platform: '', handle: '', url: '' });
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedTopGenres, setSelectedTopGenres] = useState<string[]>([]);
  const [customGenre, setCustomGenre] = useState({ category: '', name: '', description: '' });
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>([]);
  const [selectedTopSpecializations, setSelectedTopSpecializations] = useState<string[]>([]);
  const [customProfession, setCustomProfession] = useState({ category: '', name: '', description: '' });
  const { toast } = useToast();

  const isArtistOrMusician = userRole === 'artist' || userRole === 'managed_artist' || userRole === 'musician' || userRole === 'managed_musician';
  const isProfessional = userRole === 'professional' || userRole === 'managed_professional';

  useEffect(() => {
    if (open && userId && (isArtistOrMusician || isProfessional)) {
      fetchProfileData();
      if (isArtistOrMusician) {
        fetchGlobalGenres();
      }
      if (isProfessional) {
        fetchGlobalProfessions();
      }
    }
  }, [open, userId, userRole]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      let endpoint;
      if (userRole === 'artist' || userRole === 'managed_artist') {
        endpoint = `/api/artists/${userId}`;
      } else if (userRole === 'musician' || userRole === 'managed_musician') {
        endpoint = `/api/musicians/${userId}`;
      } else if (userRole === 'professional' || userRole === 'managed_professional') {
        endpoint = `/api/professionals/${userId}`;
      }
      
      if (!endpoint) return;
      
      const response = await apiRequest(endpoint);
      const data = await response.json();
      
      setProfileData({
        stageName: data.stageName || '',
        stageNames: data.stageNames || [],
        primaryGenre: data.primaryGenre || '',
        secondaryGenres: data.secondaryGenres || [],
        topGenres: data.topGenres || [],
        socialMediaHandles: data.socialMediaHandles || [],
        instruments: data.instruments || [],
        biography: data.biography || '',
        website: data.website || '',
        // Booking rates
        basePrice: data.basePrice || '',
        idealPerformanceRate: data.idealPerformanceRate || data.idealServiceRate || '',
        idealServiceRate: data.idealServiceRate || '',
        minimumAcceptableRate: data.minimumAcceptableRate || '',
        // Role management for technical rider integration
        performanceRoles: data.performanceRoles || [],
        professionalRoles: data.professionalRoles || [],
        primaryRole: data.primaryRole || '',
        skillsAndInstruments: data.skillsAndInstruments || data.instruments || [],
        serviceCapabilities: data.serviceCapabilities || [],
        // Professional fields
        specializations: data.specializations || [],
        topSpecializations: data.topSpecializations || [],
        availability: data.availability || {
          availabilityType: 'weekdays',
          excludeHolidays: false,
          country: 'US',
          customDays: [],
          timeZone: 'UTC',
          startTime: '09:00',
          endTime: '17:00'
        }
      });
      
      setSelectedTopGenres(data.topGenres || []);
      setSelectedTopSpecializations(data.topSpecializations || []);
    } catch (error) {
      console.error('Error fetching profile data:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchGlobalGenres = async () => {
    try {
      const response = await apiRequest('/api/global-genres');
      const genres = await response.json();
      setGlobalGenres(genres);
    } catch (error) {
      console.error('Error fetching global genres:', error);
    }
  };

  const fetchGlobalProfessions = async () => {
    try {
      const response = await apiRequest('/api/global-professions');
      const professions = await response.json();
      setGlobalProfessions(professions);
    } catch (error) {
      console.error('Error fetching global professions:', error);
    }
  };

  const addStageName = () => {
    if (newStageName.trim()) {
      const newStageNames = [...profileData.stageNames, { 
        name: newStageName.trim(), 
        isPrimary: profileData.stageNames.length === 0 
      }];
      setProfileData({ ...profileData, stageNames: newStageNames });
      setNewStageName('');
    }
  };

  const removeStageName = (index: number) => {
    const newStageNames = profileData.stageNames.filter((_: any, i: number) => i !== index);
    setProfileData({ ...profileData, stageNames: newStageNames });
  };

  const setPrimaryStageName = (index: number) => {
    const newStageNames = profileData.stageNames.map((stage: any, i: number) => ({
      ...stage,
      isPrimary: i === index
    }));
    setProfileData({ ...profileData, stageNames: newStageNames });
  };

  const addSocialHandle = () => {
    if (newSocialHandle.platform && newSocialHandle.handle) {
      const platform = socialPlatforms.find(p => p.name === newSocialHandle.platform);
      const fullUrl = platform?.urlPrefix + newSocialHandle.handle;
      
      const newHandles = [...profileData.socialMediaHandles, {
        platform: newSocialHandle.platform,
        handle: newSocialHandle.handle,
        url: fullUrl
      }];
      
      setProfileData({ ...profileData, socialMediaHandles: newHandles });
      setNewSocialHandle({ platform: '', handle: '', url: '' });
    }
  };

  const removeSocialHandle = (index: number) => {
    const newHandles = profileData.socialMediaHandles.filter((_: any, i: number) => i !== index);
    setProfileData({ ...profileData, socialMediaHandles: newHandles });
  };

  const addGenreToSecondary = (category: string, genreName: string, isCustom = false) => {
    const genreExists = profileData.secondaryGenres.some((g: any) => g.category === category && g.name === genreName);
    if (!genreExists) {
      const newGenres = [...profileData.secondaryGenres, { category, name: genreName, isCustom }];
      setProfileData({ ...profileData, secondaryGenres: newGenres });
    }
  };

  const removeSecondaryGenre = (index: number) => {
    const newGenres = profileData.secondaryGenres.filter((_: any, i: number) => i !== index);
    setProfileData({ ...profileData, secondaryGenres: newGenres });
  };

  const addCustomGenre = async () => {
    if (customGenre.category && customGenre.name) {
      try {
        const response = await fetch('/api/global-genres/custom', { 
          method: 'POST',
          body: JSON.stringify(customGenre),
          headers: { 'Content-Type': 'application/json' }
        });
        const newGenre = await response.json();
        
        // Add to secondary genres
        addGenreToSecondary(customGenre.category, customGenre.name, true);
        
        // Refresh global genres
        await fetchGlobalGenres();
        
        setCustomGenre({ category: '', name: '', description: '' });
        
        toast({
          title: "Success",
          description: "Custom genre added successfully"
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to add custom genre",
          variant: "destructive"
        });
      }
    }
  };

  const toggleTopGenre = (genre: string) => {
    const newTopGenres = selectedTopGenres.includes(genre)
      ? selectedTopGenres.filter(g => g !== genre)
      : [...selectedTopGenres, genre];
    
    setSelectedTopGenres(newTopGenres);
    setProfileData({ ...profileData, topGenres: newTopGenres });
  };

  const saveProfile = async () => {
    try {
      setLoading(true);
      
      let endpoint;
      let dataToSave = { ...profileData };
      
      if (userRole === 'artist' || userRole === 'managed_artist') {
        endpoint = `/api/artists/${userId}`;
        dataToSave.topGenres = selectedTopGenres;
      } else if (userRole === 'musician' || userRole === 'managed_musician') {
        endpoint = `/api/musicians/${userId}`;
        dataToSave.topGenres = selectedTopGenres;
      } else if (userRole === 'professional' || userRole === 'managed_professional') {
        endpoint = `/api/professionals/${userId}`;
        dataToSave.specializations = selectedSpecializations;
        dataToSave.topSpecializations = selectedTopSpecializations;
        
        // Save availability settings separately
        if (profileData.availability) {
          await fetch('/api/professional-availability', {
            method: 'POST',
            body: JSON.stringify({
              userId: userId,
              ...profileData.availability
            }),
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }
      
      if (!endpoint) return;
      
      await fetch(endpoint, {
        method: 'PATCH',
        body: JSON.stringify(dataToSave),
        headers: { 'Content-Type': 'application/json' }
      });
      
      toast({
        title: "Success",
        description: "Profile updated successfully"
      });
      
      if (onProfileUpdated) {
        onProfileUpdated();
      }
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isArtistOrMusician && !isProfessional) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Enhanced Profile Management</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue={isArtistOrMusician ? "stage-names" : "specializations"} className="w-full">
          <TabsList className={`grid w-full ${isArtistOrMusician ? 'grid-cols-7' : 'grid-cols-6'}`}>
            {isArtistOrMusician && (
              <>
                <TabsTrigger value="stage-names">Stage Names</TabsTrigger>
                <TabsTrigger value="genres">Genres</TabsTrigger>
                <TabsTrigger value="top-genres">Top Genres</TabsTrigger>
                <TabsTrigger value="social">Social Media</TabsTrigger>
                <TabsTrigger value="roles">Roles</TabsTrigger>
                <TabsTrigger value="rates">Booking Rates</TabsTrigger>
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
              </>
            )}
            {isProfessional && (
              <>
                <TabsTrigger value="specializations">Specializations</TabsTrigger>
                <TabsTrigger value="top-specializations">Top Specializations</TabsTrigger>
                <TabsTrigger value="availability">Availability</TabsTrigger>
                <TabsTrigger value="roles">Roles</TabsTrigger>
                <TabsTrigger value="rates">Service Rates</TabsTrigger>
                <TabsTrigger value="professional-info">Professional Info</TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value="stage-names" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Music className="w-5 h-5" />
                  Stage Names
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter stage name"
                    value={newStageName}
                    onChange={(e) => setNewStageName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addStageName()}
                  />
                  <Button onClick={addStageName}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {profileData.stageNames.map((stage: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{stage.name}</span>
                        {stage.isPrimary && <Badge variant="default">Primary</Badge>}
                      </div>
                      <div className="flex items-center gap-2">
                        {!stage.isPrimary && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPrimaryStageName(index)}
                          >
                            <Star className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeStageName(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="genres" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Secondary Genres
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Primary Genre</Label>
                    <Select value={profileData.primaryGenre} onValueChange={(value) => setProfileData({ ...profileData, primaryGenre: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select primary genre" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(globalGenres).map(([category, genres]) => (
                          <div key={category}>
                            <div className="font-semibold text-sm px-2 py-1 text-muted-foreground">{category}</div>
                            {(genres as any[]).map(genre => (
                              <SelectItem key={genre.id} value={genre.name}>{genre.name}</SelectItem>
                            ))}
                          </div>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Secondary Genres</Label>
                  <div className="flex flex-wrap gap-2">
                    {profileData.secondaryGenres.map((genre: any, index: number) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {genre.name}
                        {genre.isCustom && <Star className="w-3 h-3" />}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0"
                          onClick={() => removeSecondaryGenre(index)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Add from Global Genres</Label>
                  {Object.entries(globalGenres).map(([category, genres]) => (
                    <div key={category} className="space-y-1">
                      <div className="font-medium text-sm text-muted-foreground">{category}</div>
                      <div className="flex flex-wrap gap-1">
                        {(genres as any[]).map(genre => (
                          <div key={genre.id} className="flex items-center gap-2 p-2 border rounded-lg">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addGenreToSecondary(category, genre.name)}
                              className="flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" />
                              {genre.name}
                            </Button>
                            <div className="flex items-center gap-1">
                              <Checkbox
                                id={`top-genre-${genre.id}`}
                                checked={selectedTopGenres.includes(genre.name)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedTopGenres([...selectedTopGenres, genre.name]);
                                  } else {
                                    setSelectedTopGenres(selectedTopGenres.filter(g => g !== genre.name));
                                  }
                                }}
                              />
                              <Label htmlFor={`top-genre-${genre.id}`} className="text-xs text-muted-foreground">
                                Top
                              </Label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label>Add Custom Genre</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Select value={customGenre.category} onValueChange={(value) => setCustomGenre({ ...customGenre, category: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(globalGenres).map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Genre name"
                      value={customGenre.name}
                      onChange={(e) => setCustomGenre({ ...customGenre, name: e.target.value })}
                    />
                    <Button onClick={addCustomGenre} className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Add
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="top-genres" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Top Genres (Publicly Displayed)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Select the genres you excel at most. These will be displayed publicly as your specialties.
                </div>
                
                <div className="space-y-2">
                  <Label>Selected Top Genres</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedTopGenres.map((genre, index) => (
                      <Badge key={index} variant="default" className="flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        {genre}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0"
                          onClick={() => toggleTopGenre(genre)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Available Genres</Label>
                  {Object.entries(globalGenres).map(([category, genres]) => (
                    <div key={category} className="space-y-1">
                      <div className="font-medium text-sm text-muted-foreground">{category}</div>
                      <div className="flex flex-wrap gap-1">
                        {(genres as any[]).map(genre => (
                          <Button
                            key={genre.id}
                            variant={selectedTopGenres.includes(genre.name) ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleTopGenre(genre.name)}
                            className="flex items-center gap-1"
                          >
                            {selectedTopGenres.includes(genre.name) ? (
                              <Star className="w-3 h-3" />
                            ) : (
                              <Plus className="w-3 h-3" />
                            )}
                            {genre.name}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="social" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Social Media Handles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Select value={newSocialHandle.platform} onValueChange={(value) => setNewSocialHandle({ ...newSocialHandle, platform: value })}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Platform" />
                    </SelectTrigger>
                    <SelectContent>
                      {socialPlatforms.map(platform => (
                        <SelectItem key={platform.name} value={platform.name}>
                          <div className="flex items-center gap-2">
                            <platform.icon className="w-4 h-4" />
                            {platform.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Handle (without @)"
                    value={newSocialHandle.handle}
                    onChange={(e) => setNewSocialHandle({ ...newSocialHandle, handle: e.target.value })}
                    onKeyPress={(e) => e.key === 'Enter' && addSocialHandle()}
                  />
                  <Button onClick={addSocialHandle}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {profileData.socialMediaHandles.map((handle: any, index: number) => {
                    const platform = socialPlatforms.find(p => p.name === handle.platform);
                    return (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-2">
                          {platform && <platform.icon className="w-4 h-4" />}
                          <span className="font-medium">{handle.platform}</span>
                          <span className="text-muted-foreground">@{handle.handle}</span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeSocialHandle(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roles" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Music className="w-5 h-5" />
                  {isArtistOrMusician ? 'Performance Roles' : 'Professional Roles'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="primaryRole">Primary Role (for technical rider auto-population)</Label>
                  <Input
                    id="primaryRole"
                    placeholder={isArtistOrMusician ? "e.g., Lead Vocalist, Guitarist, Songwriter" : "e.g., DJ, Photographer, Sound Engineer"}
                    value={profileData.primaryRole || (userRole === 'artist' || userRole === 'managed_artist' ? 'Lead Vocalist' : '')}
                    onChange={(e) => setProfileData({ ...profileData, primaryRole: e.target.value })}
                  />
                  {(userRole === 'artist' || userRole === 'managed_artist') && !profileData.primaryRole && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Default: Lead Vocalist (uses vocal chords, no instrument required)
                    </p>
                  )}
                </div>
                
                {isArtistOrMusician && (
                  <div>
                    <Label>Skills & Instruments (for technical rider integration)</Label>
                    <Textarea
                      placeholder="List your instruments and skills, separated by commas (e.g., Piano, Guitar, Vocals, Songwriting)"
                      value={profileData.skillsAndInstruments ? JSON.stringify(profileData.skillsAndInstruments).replace(/[\[\]"]/g, '').replace(/,/g, ', ') : (userRole === 'artist' || userRole === 'managed_artist' ? 'Vocals' : '')}
                      onChange={(e) => {
                        const skills = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                        setProfileData({ ...profileData, skillsAndInstruments: skills });
                      }}
                    />
                    {(userRole === 'artist' || userRole === 'managed_artist') && !profileData.skillsAndInstruments?.length && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Default: Vocals (Lead vocalists use their vocal chords as their primary instrument)
                      </p>
                    )}
                  </div>
                )}
                
                {isProfessional && (
                  <div>
                    <Label>Service Capabilities (for booking integration)</Label>
                    <Textarea
                      placeholder="List your professional services and equipment owned, separated by commas"
                      value={profileData.serviceCapabilities ? JSON.stringify(profileData.serviceCapabilities).replace(/[\[\]"]/g, '').replace(/,/g, ', ') : ''}
                      onChange={(e) => {
                        const capabilities = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                        setProfileData({ ...profileData, serviceCapabilities: capabilities });
                      }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rates" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  {isArtistOrMusician ? 'Booking Rates' : 'Service Rates'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="basePrice">Base Price</Label>
                    <Input
                      id="basePrice"
                      type="number"
                      placeholder="0.00"
                      value={profileData.basePrice || ''}
                      onChange={(e) => setProfileData({ ...profileData, basePrice: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="idealRate">
                      {isArtistOrMusician ? 'Ideal Performance Rate' : 'Ideal Service Rate'}
                    </Label>
                    <Input
                      id="idealRate"
                      type="number"
                      placeholder={isArtistOrMusician ? "500.00" : "150.00"}
                      value={profileData.idealPerformanceRate || profileData.idealServiceRate || ''}
                      onChange={(e) => {
                        if (isArtistOrMusician) {
                          setProfileData({ ...profileData, idealPerformanceRate: e.target.value });
                        } else {
                          setProfileData({ ...profileData, idealServiceRate: e.target.value });
                        }
                      }}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="minimumRate">Minimum Acceptable Rate</Label>
                    <Input
                      id="minimumRate"
                      type="number"
                      placeholder={isArtistOrMusician ? "250.00" : "75.00"}
                      value={profileData.minimumAcceptableRate || ''}
                      onChange={(e) => setProfileData({ ...profileData, minimumAcceptableRate: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  <p>These rates will be used for:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Auto-populating booking forms and contracts</li>
                    <li>Technical rider rate calculations</li>
                    <li>Revenue optimization recommendations</li>
                    <li>Counter-offer calculations in booking workflows</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Current Stage Name</Label>
                    <Input
                      value={profileData.stageName}
                      onChange={(e) => setProfileData({ ...profileData, stageName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Website</Label>
                    <Input
                      value={profileData.website}
                      onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Biography</Label>
                  <Textarea
                    value={profileData.biography}
                    onChange={(e) => setProfileData({ ...profileData, biography: e.target.value })}
                    placeholder="Tell us about yourself..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Professional Specializations Tab */}
          <TabsContent value="specializations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Professional Specializations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Select your professional specializations from our comprehensive global catalog.
                </div>
                
                <div className="space-y-2">
                  <Label>Selected Top Specializations</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedTopSpecializations.map((specialization, index) => (
                      <Badge key={index} variant="default" className="flex items-center gap-1 bg-yellow-500 hover:bg-yellow-600">
                        <Star className="w-3 h-3" />
                        {specialization}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0"
                          onClick={() => setSelectedTopSpecializations(selectedTopSpecializations.filter(s => s !== specialization))}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Selected Specializations</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedSpecializations.map((spec, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {spec}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0"
                          onClick={() => setSelectedSpecializations(selectedSpecializations.filter(s => s !== spec))}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Available Specializations</Label>
                  {Object.entries(globalProfessions).map(([category, professions]) => (
                    <div key={category} className="space-y-1">
                      <div className="font-medium text-sm text-muted-foreground">{category}</div>
                      <div className="flex flex-wrap gap-1">
                        {(professions as any[]).map(profession => (
                          <div key={profession.id} className="flex items-center gap-2 p-2 border rounded-lg">
                            <Button
                              variant={selectedSpecializations.includes(profession.name) ? "default" : "outline"}
                              size="sm"
                              onClick={() => {
                                if (selectedSpecializations.includes(profession.name)) {
                                  setSelectedSpecializations(selectedSpecializations.filter(s => s !== profession.name));
                                } else {
                                  setSelectedSpecializations([...selectedSpecializations, profession.name]);
                                }
                              }}
                              className="flex items-center gap-1"
                            >
                              {!selectedSpecializations.includes(profession.name) && <Plus className="w-3 h-3" />}
                              {profession.name}
                              {profession.isCustom && <Star className="w-3 h-3 ml-1" />}
                            </Button>
                            <div className="flex items-center gap-1">
                              <Checkbox
                                id={`top-specialization-${profession.id}`}
                                checked={selectedTopSpecializations.includes(profession.name)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedTopSpecializations([...selectedTopSpecializations, profession.name]);
                                  } else {
                                    setSelectedTopSpecializations(selectedTopSpecializations.filter(s => s !== profession.name));
                                  }
                                }}
                              />
                              <Label htmlFor={`top-specialization-${profession.id}`} className="text-xs text-muted-foreground">
                                Top
                              </Label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label>Add Custom Specialization</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Select value={customProfession.category} onValueChange={(value) => setCustomProfession({ ...customProfession, category: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(globalProfessions).map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Specialization name"
                      value={customProfession.name}
                      onChange={(e) => setCustomProfession({ ...customProfession, name: e.target.value })}
                    />
                    <Button 
                      onClick={() => {
                        if (customProfession.name && customProfession.category) {
                          setSelectedSpecializations([...selectedSpecializations, customProfession.name]);
                          setCustomProfession({ category: '', name: '', description: '' });
                        }
                      }}
                      className="flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Top Specializations Tab */}
          <TabsContent value="top-specializations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Top Specializations (Publicly Displayed)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Select the specializations you excel at most. These will be displayed publicly as your expertise.
                </div>
                
                <div className="space-y-2">
                  <Label>Selected Top Specializations</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedTopSpecializations.map((spec, index) => (
                      <Badge key={index} variant="default" className="flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        {spec}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0"
                          onClick={() => setSelectedTopSpecializations(selectedTopSpecializations.filter(s => s !== spec))}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Available Specializations</Label>
                  {Object.entries(globalProfessions).map(([category, professions]) => (
                    <div key={category} className="space-y-1">
                      <div className="font-medium text-sm text-muted-foreground">{category}</div>
                      <div className="flex flex-wrap gap-1">
                        {(professions as any[]).map(profession => (
                          <Button
                            key={profession.id}
                            variant={selectedTopSpecializations.includes(profession.name) ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              if (selectedTopSpecializations.includes(profession.name)) {
                                setSelectedTopSpecializations(selectedTopSpecializations.filter(s => s !== profession.name));
                              } else {
                                setSelectedTopSpecializations([...selectedTopSpecializations, profession.name]);
                              }
                            }}
                            className="flex items-center gap-1"
                          >
                            {!selectedTopSpecializations.includes(profession.name) && <Plus className="w-3 h-3" />}
                            {profession.name}
                            {profession.isCustom && <Star className="w-3 h-3 ml-1" />}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Availability Tab */}
          <TabsContent value="availability" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Availability Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Configure your availability for consultation bookings. These settings will impact your booking calendar.
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Availability Type</Label>
                    <Select 
                      value={profileData.availability.availabilityType} 
                      onValueChange={(value) => setProfileData({
                        ...profileData,
                        availability: { ...profileData.availability, availabilityType: value }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select availability type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekdays">Weekdays Only</SelectItem>
                        <SelectItem value="weekends">Weekends Only</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="custom">Custom Schedule</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Time Zone</Label>
                    <Select 
                      value={profileData.availability.timeZone} 
                      onValueChange={(value) => setProfileData({
                        ...profileData,
                        availability: { ...profileData.availability, timeZone: value }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select time zone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="EST">EST</SelectItem>
                        <SelectItem value="PST">PST</SelectItem>
                        <SelectItem value="GMT">GMT</SelectItem>
                        <SelectItem value="CET">CET</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Time</Label>
                    <Input
                      type="time"
                      value={profileData.availability.startTime}
                      onChange={(e) => setProfileData({
                        ...profileData,
                        availability: { ...profileData.availability, startTime: e.target.value }
                      })}
                    />
                  </div>

                  <div>
                    <Label>End Time</Label>
                    <Input
                      type="time"
                      value={profileData.availability.endTime}
                      onChange={(e) => setProfileData({
                        ...profileData,
                        availability: { ...profileData.availability, endTime: e.target.value }
                      })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="excludeHolidays"
                      checked={profileData.availability.excludeHolidays}
                      onChange={(e) => setProfileData({
                        ...profileData,
                        availability: { ...profileData.availability, excludeHolidays: e.target.checked }
                      })}
                    />
                    <Label htmlFor="excludeHolidays">Exclude Holidays</Label>
                  </div>
                </div>

                <div>
                  <Label>Country (for holiday detection)</Label>
                  <Select 
                    value={profileData.availability.country} 
                    onValueChange={(value) => setProfileData({
                      ...profileData,
                      availability: { ...profileData.availability, country: value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="US">United States</SelectItem>
                      <SelectItem value="CA">Canada</SelectItem>
                      <SelectItem value="GB">United Kingdom</SelectItem>
                      <SelectItem value="AU">Australia</SelectItem>
                      <SelectItem value="DE">Germany</SelectItem>
                      <SelectItem value="FR">France</SelectItem>
                      <SelectItem value="IT">Italy</SelectItem>
                      <SelectItem value="ES">Spain</SelectItem>
                      <SelectItem value="NL">Netherlands</SelectItem>
                      <SelectItem value="SE">Sweden</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Professional Info Tab */}
          <TabsContent value="professional-info" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Music2 className="w-5 h-5" />
                  Professional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Professional Name</Label>
                    <Input
                      value={profileData.stageName}
                      onChange={(e) => setProfileData({ ...profileData, stageName: e.target.value })}
                      placeholder="Your professional name"
                    />
                  </div>
                  <div>
                    <Label>Website</Label>
                    <Input
                      value={profileData.website}
                      onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Professional Biography</Label>
                  <Textarea
                    value={profileData.biography}
                    onChange={(e) => setProfileData({ ...profileData, biography: e.target.value })}
                    placeholder="Describe your professional background and expertise..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={saveProfile} disabled={loading}>
            {loading ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}