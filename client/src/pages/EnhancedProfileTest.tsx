import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import EnhancedProfileModal from '@/components/modals/EnhancedProfileModal';
import { User, Music, Users, Star, Globe, Edit, Plus, Briefcase } from 'lucide-react';

export default function EnhancedProfileTest() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedUserRole, setSelectedUserRole] = useState<string>('');
  const [modalOpen, setModalOpen] = useState(false);
  const [createUserOpen, setCreateUserOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    fullName: '',
    roleId: '',
    password: 'test123'
  });

  // Fetch artists and musicians for testing
  const { data: artists = [], isLoading: artistsLoading } = useQuery({
    queryKey: ['/api/artists'],
    queryFn: async () => {
      const response = await apiRequest('/api/artists');
      return response.json();
    }
  });

  const { data: musicians = [], isLoading: musiciansLoading } = useQuery({
    queryKey: ['/api/musicians'],
    queryFn: async () => {
      const response = await apiRequest('/api/musicians');
      return response.json();
    }
  });

  const { data: globalGenres = {}, isLoading: genresLoading } = useQuery({
    queryKey: ['/api/global-genres'],
    queryFn: async () => {
      const response = await apiRequest('/api/global-genres');
      return response.json();
    }
  });

  const { data: professionals = [], isLoading: professionalsLoading } = useQuery({
    queryKey: ['/api/professionals'],
    queryFn: async () => {
      const response = await apiRequest('/api/professionals');
      return response.json();
    }
  });

  const { data: globalProfessions = {}, isLoading: professionalsDataLoading } = useQuery({
    queryKey: ['/api/global-professions'],
    queryFn: async () => {
      const response = await apiRequest('/api/global-professions');
      return response.json();
    }
  });

  const openProfileModal = (userId: string, role: string) => {
    setSelectedUserId(userId);
    setSelectedUserRole(role);
    setModalOpen(true);
  };

  const createTestUser = async () => {
    try {
      if (!newUser.email || !newUser.fullName || !newUser.roleId) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        return;
      }

      const response = await apiRequest('POST', '/api/users', {
        email: newUser.email,
        fullName: newUser.fullName,
        roleId: parseInt(newUser.roleId),
        password: newUser.password
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Test user created successfully"
        });
        setCreateUserOpen(false);
        setNewUser({ email: '', fullName: '', roleId: '', password: 'test123' });
        
        // Refresh the data
        queryClient.invalidateQueries({ queryKey: ['/api/artists'] });
        queryClient.invalidateQueries({ queryKey: ['/api/musicians'] });
        queryClient.invalidateQueries({ queryKey: ['/api/professionals'] });
      } else {
        throw new Error('Failed to create user');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create test user",
        variant: "destructive"
      });
    }
  };

  const getTopGenres = (profile: any) => {
    return profile.topGenres && profile.topGenres.length > 0 ? profile.topGenres : [];
  };

  const getSocialHandles = (profile: any) => {
    return profile.socialMediaHandles && profile.socialMediaHandles.length > 0 ? profile.socialMediaHandles : [];
  };

  if (artistsLoading || musiciansLoading || genresLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Star className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold">Enhanced Profile Management Test</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Global Genres Available</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(globalGenres).map(([category, genres]) => (
              <div key={category} className="space-y-2">
                <h3 className="font-semibold text-sm text-muted-foreground">{category}</h3>
                <div className="flex flex-wrap gap-1">
                  {(genres as any[]).slice(0, 5).map(genre => (
                    <Badge key={genre.id} variant="outline" className="text-xs">
                      {genre.name}
                    </Badge>
                  ))}
                  {(genres as any[]).length > 5 && (
                    <Badge variant="outline" className="text-xs">
                      +{(genres as any[]).length - 5} more
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="w-5 h-5" />
              Artists
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {artists.map((artist: any) => (
              <div key={artist.userId} className="p-4 border rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{artist.stageName}</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openProfileModal(artist.userId.toString(), 'artist')}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium">Top Genres:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {getTopGenres(artist).map((genre: string, index: number) => (
                        <Badge key={index} variant="default" className="text-xs">
                          <Star className="w-3 h-3 mr-1" />
                          {genre}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium">Social Media:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {getSocialHandles(artist).map((handle: any, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          <Globe className="w-3 h-3 mr-1" />
                          {handle.platform}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Musicians
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {musicians.map((musician: any) => (
              <div key={musician.userId} className="p-4 border rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{musician.stageName || 'Unnamed Musician'}</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openProfileModal(musician.userId.toString(), 'musician')}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium">Instruments:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(musician.instruments || []).map((instrument: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {instrument}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium">Top Genres:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {getTopGenres(musician).map((genre: string, index: number) => (
                        <Badge key={index} variant="default" className="text-xs">
                          <Star className="w-3 h-3 mr-1" />
                          {genre}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <EnhancedProfileModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        userId={selectedUserId}
        userRole={selectedUserRole}
        onProfileUpdated={() => {
          // Refresh the data when profile is updated
          window.location.reload();
        }}
      />
    </div>
  );
}