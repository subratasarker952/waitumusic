import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Heart, 
  Music, 
  Calendar, 
  Star,
  Search,
  Bell,
  BellOff,
  Play,
  ShoppingCart,
  ExternalLink
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface FollowedArtistsProps {
  user: any;
}

export default function FollowedArtists({ user }: FollowedArtistsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDiscoverOpen, setIsDiscoverOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch followed artists
  const { data: followedArtists, isLoading } = useQuery({
    queryKey: ['/api/fans/followed-artists', user.id],
    queryFn: async () => {
      const response = await apiRequest(`/api/fans/followed-artists?userId=${user.id}`);
      return await response.json();
    },
  });

  // Fetch available artists for discovery
  const { data: allArtists } = useQuery({
    queryKey: ['/api/artists/discover'],
    queryFn: async () => {
      const response = await apiRequest('/api/artists/discover');
      return await response.json();
    },
  });

  // Follow artist mutation
  const followArtistMutation = useMutation({
    mutationFn: async (artistId: number) => {
      const response = await apiRequest('/api/fans/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artistId, userId: user.id })
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/fans/followed-artists'] });
      toast({
        title: "Artist Followed",
        description: "You'll now receive updates from this artist.",
      });
    },
  });

  // Unfollow artist mutation
  const unfollowArtistMutation = useMutation({
    mutationFn: async (artistId: number) => {
      const response = await apiRequest(`/api/fans/unfollow/${artistId}`, {
        method: 'DELETE',
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/fans/followed-artists'] });
      toast({
        title: "Artist Unfollowed",
        description: "You'll no longer receive updates from this artist.",
      });
    },
  });

  // Toggle notifications mutation
  const toggleNotificationsMutation = useMutation({
    mutationFn: async ({ artistId, enabled }: { artistId: number; enabled: boolean }) => {
      const response = await apiRequest(`/api/fans/notifications/${artistId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled })
      });
      return await response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/fans/followed-artists'] });
      toast({
        title: `Notifications ${variables.enabled ? 'Enabled' : 'Disabled'}`,
        description: `You will ${variables.enabled ? 'now' : 'no longer'} receive notifications.`,
      });
    },
  });

  const followed = followedArtists || [
    {
      id: 19,
      stageName: "Lí-Lí Octave",
      genre: "Caribbean Neo Soul",
      followedAt: "2024-01-15",
      notificationsEnabled: true,
      upcomingEvents: 2,
      newReleases: 1,
      avatar: null
    },
    {
      id: 16,
      stageName: "JCro",
      genre: "Afrobeats/Hip-Hop",
      followedAt: "2024-02-01",
      notificationsEnabled: false,
      upcomingEvents: 1,
      newReleases: 0,
      avatar: null
    }
  ];

  const availableArtists = allArtists || [
    {
      id: 17,
      stageName: "Janet Azzouz",
      genre: "Pop/R&B",
      totalSongs: 5,
      followers: 234,
      avatar: null
    },
    {
      id: 21,
      stageName: "Princess Trinidad",
      genre: "Dancehall/Reggae",
      totalSongs: 3,
      followers: 189,
      avatar: null
    }
  ];

  const filteredArtists = availableArtists.filter((artist: any) =>
    artist.stageName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    artist.genre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Followed Artists</h3>
          <p className="text-gray-600 dark:text-gray-400">Stay updated with your favorite artists</p>
        </div>
        <Dialog open={isDiscoverOpen} onOpenChange={setIsDiscoverOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Discover Artists
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Discover New Artists</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search artists by name or genre..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
                {filteredArtists.map((artist: any) => (
                  <Card key={artist.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                          <Music className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">{artist.stageName}</h4>
                          <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                            <span>{artist.genre}</span>
                            <span>•</span>
                            <span>{artist.totalSongs} songs</span>
                            <span>•</span>
                            <span>{artist.followers} followers</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => followArtistMutation.mutate(artist.id)}
                        disabled={followArtistMutation.isPending}
                      >
                        <Heart className="h-4 w-4 mr-1" />
                        Follow
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Followed Artists Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {followed.map((artist: any) => (
          <Card key={artist.id} className="bg-gradient-to-br from-white to-purple-50 dark:from-gray-900 dark:to-purple-950 hover:shadow-lg transition-all duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                    <Music className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{artist.stageName}</CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      {artist.genre}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleNotificationsMutation.mutate({
                    artistId: artist.id,
                    enabled: !artist.notificationsEnabled
                  })}
                >
                  {artist.notificationsEnabled ? (
                    <Bell className="h-4 w-4 text-blue-500" />
                  ) : (
                    <BellOff className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Following since {new Date(artist.followedAt).toLocaleDateString()}
              </div>
              
              {/* Activity Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-2 bg-blue-50 dark:bg-blue-950 rounded">
                  <div className="text-lg font-bold text-blue-700 dark:text-blue-300">
                    {artist.upcomingEvents}
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-400">Upcoming Events</div>
                </div>
                <div className="text-center p-2 bg-green-50 dark:bg-green-950 rounded">
                  <div className="text-lg font-bold text-green-700 dark:text-green-300">
                    {artist.newReleases}
                  </div>
                  <div className="text-xs text-green-600 dark:text-green-400">New Releases</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Play className="h-3 w-3 mr-1" />
                  Listen
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <ShoppingCart className="h-3 w-3 mr-1" />
                  Shop
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Calendar className="h-3 w-3 mr-1" />
                  Events
                </Button>
              </div>

              {/* Unfollow Button */}
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                onClick={() => unfollowArtistMutation.mutate(artist.id)}
              >
                Unfollow
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {followed.length === 0 && (
        <Card className="p-12 text-center">
          <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Artists Followed</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Discover and follow artists to stay updated with their latest music and events</p>
          <Button onClick={() => setIsDiscoverOpen(true)}>
            <Search className="h-4 w-4 mr-2" />
            Discover Artists
          </Button>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 text-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
            {followed.length}
          </div>
          <div className="text-sm text-blue-600 dark:text-blue-400">Artists Followed</div>
        </Card>
        <Card className="p-4 text-center bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
          <div className="text-2xl font-bold text-green-700 dark:text-green-300">
            {followed.reduce((sum: number, artist: any) => sum + artist.upcomingEvents, 0)}
          </div>
          <div className="text-sm text-green-600 dark:text-green-400">Upcoming Events</div>
        </Card>
        <Card className="p-4 text-center bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
          <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
            {followed.filter((artist: any) => artist.notificationsEnabled).length}
          </div>
          <div className="text-sm text-purple-600 dark:text-purple-400">Notifications On</div>
        </Card>
      </div>
    </div>
  );
}