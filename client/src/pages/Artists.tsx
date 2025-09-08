import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Search,
  Filter,
  Music,
  MapPin,
  Star,
  Calendar,
  DollarSign,
  CheckCircle,
  Heart
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export default function Artists() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [genreFilter, setGenreFilter] = useState('all');
  const [managementFilter, setManagetmentFilter] = useState('all');
  const [favorites, setFavorites] = useState(new Set());

  const { data: artists = [], isLoading: artistsLoading } = useQuery({
    queryKey: ['/api/artists'],
  });

  const { data: musicians = [], isLoading: musiciansLoading } = useQuery({
    queryKey: ['/api/musicians'],
  });

  const { data: userFavorites = [], isLoading: favoritesLoading } = useQuery({
    queryKey: ['/api/favorites'],
    enabled: !!user,
  });

  const isLoading = artistsLoading || musiciansLoading;

  // Load favorites into Set for quick lookup
  useEffect(() => {
    setFavorites(new Set(userFavorites?.map((fav: any) => fav.favoriteUserId) || []));
  }, [userFavorites]);

  const handleFavoriteToggle = async (performerId: number) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to save favorites",
        variant: "destructive",
      });
      return;
    }

    try {
      const isFavorite = favorites.has(performerId);

      if (isFavorite) {
        await apiRequest(`/api/favorites/${performerId}`, { method: 'DELETE' });
        setFavorites(prev => {
          const newSet = new Set(prev);
          newSet.delete(performerId);
          return newSet;
        });
        toast({
          title: "Removed from Favorites",
          description: "Artist removed from your favorites",
        });
      } else {
        await apiRequest('/api/favorites', {
          method: 'POST',
          body: JSON.stringify({ favoriteUserId: performerId, favoriteType: 'artist' })
        });
        setFavorites(prev => new Set([...prev, performerId]));
        toast({
          title: "Added to Favorites",
          description: "Artist added to your favorites",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update favorites",
        variant: "destructive",
      });
    }
  };

  // Combine artists and musicians
  const allPerformers = [
    ...(artists ?? []).map((artist: any) => ({ ...artist, type: 'artist' })),
    ...(musicians ?? []).map((musician: any) => ({ ...musician, type: 'musician' }))
  ];

  const filteredPerformers = allPerformers
    .filter((performer: any) => {
      const matchesSearch = !searchTerm ||
        (performer.stageNames?.find(sn => sn.isPrimary)?.name || performer.stageName)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        performer.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        performer.instrument?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesGenre = !genreFilter || genreFilter === 'all' || performer.genre === genreFilter || performer.primaryGenre === genreFilter;
      const matchesManagement = !managementFilter  || managementFilter === 'all' ||  (managementFilter === 'managed' && performer.isManaged) ||   (managementFilter === 'independent' && !performer.isManaged);

      return matchesSearch && matchesGenre && matchesManagement;
    })
    .sort((a: any, b: any) => {
      // Prioritize managed performers first
      if (a.isManaged && !b.isManaged) return -1;
      if (!a.isManaged && b.isManaged) return 1;
      // Then sort alphabetically by primary stage name, fallback stage name, or full name
      const aName = a.stageNames?.find(sn => sn.isPrimary)?.name || a.stageName || a.user?.fullName || '';
      const bName = b.stageNames?.find(sn => sn.isPrimary)?.name || b.stageName || b.user?.fullName || '';
      return aName.localeCompare(bName);
    });

  const genres = [...new Set([
    ...(artists ?? []).map((artist: any) => artist.genre).filter(Boolean),
    ...(musicians ?? []).map((musician: any) => musician.primaryGenre).filter(Boolean)
  ])];

  console.log(filteredPerformers)
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="gradient-primary text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Navigation for Admins */}
          {(user?.role === "admin" || user?.role === "superadmin") && (
            <div className="mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocation("/dashboard")}
                className="text-white border-white hover:bg-white hover:text-gray-900"
              >
                ← Back to Dashboard
              </Button>
            </div>
          )}
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Discover Amazing Artists
            </h1>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto">
              Connect with professional musicians and artists for your next event or collaboration
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search artists by name or stage name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2">
              <Select value={genreFilter} onValueChange={setGenreFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Genres" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genres</SelectItem>
                  {genres?.map((genre: string, index: number) => (
                    <SelectItem key={index} value={genre || `genre_${index}`}>
                      {genre || 'Unspecified'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={managementFilter} onValueChange={setManagetmentFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Artists" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Artists</SelectItem>
                  <SelectItem value="managed">Managed</SelectItem>
                  <SelectItem value="independent">Independent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">
              Showing {filteredPerformers.length} of {allPerformers.length} performers
            </p>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </div>

        {/* Artists Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredPerformers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPerformers?.map((performer: any) => (
              <Card key={`${performer.type}-${performer.userId}`} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  {/* Performer Avatar */}
                  <div className="text-center mb-4">
                    <Avatar className="w-24 h-24 mx-auto mb-3">
                      <AvatarImage
                        src={performer?.user?.avatarUrl}
                        alt={performer.stageNames?.find(sn => sn.isPrimary)?.name || performer.stageName || performer.user?.fullName}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-2xl font-bold">
                        {(performer.stageNames?.find(sn => sn.isPrimary)?.name || performer.stageName || performer.user?.fullName || 'A').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex items-center justify-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">
                        {performer.stageNames?.find(sn => sn.isPrimary)?.name || performer.stageName || performer.user?.fullName}
                      </h3>
                      {performer.isManaged && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                    </div>

                    <div className="flex flex-wrap justify-center gap-1 mb-2">
                      <Badge variant="outline" className="text-xs">
                        {performer.type === 'artist' ? 'Artist' : 'Musician'}
                      </Badge>
                      {(performer.genre || performer.primaryGenre) && (
                        <Badge variant="secondary" className="text-xs">
                          {performer.genre || performer.primaryGenre}
                        </Badge>
                      )}
                      {performer.instrument && (
                        <Badge variant="secondary" className="text-xs">
                          {performer.instrument}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Performer Info */}
                  <div className="space-y-2 mb-4">
                    {performer.profile?.bio && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {performer.profile.bio}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-sm">
                      {(performer.basePrice || performer.hourlyRate) && (
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1 text-green-600" />
                          <span>
                            {performer.basePrice ? `From $${performer.basePrice}` : `$${performer.hourlyRate}/hr`}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center">
                        <Star className="h-4 w-4 mr-1 text-yellow-500" />
                        <span>4.8</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div className="flex gap-2 mb-4">
                    {performer.isManaged && (
                      <Badge className="bg-green-500">
                        Managed
                      </Badge>
                    )}
                    <Badge variant="outline">
                      <Calendar className="h-3 w-3 mr-1" />
                      Available
                    </Badge>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    <Link href={`/artists/${performer.userId}?type=${performer.type}`}>
                      <Button className="w-full">
                        View Profile
                      </Button>
                    </Link>

                    {performer.isManaged && (
                      <Link href={`/booking?${performer.type === 'artist' ? 'artist' : 'musician'}=${performer.userId}`}>
                        <Button variant="outline" className="w-full">
                          <Calendar className="h-4 w-4 mr-2" />
                          Book Now
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Music className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No artists found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or filters
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setGenreFilter('');
                setManagetmentFilter('');
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
