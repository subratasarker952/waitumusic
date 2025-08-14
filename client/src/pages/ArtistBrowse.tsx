import React, { useState } from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Music, Star, MapPin, Users, Search, Filter, Grid, List } from 'lucide-react';

interface Artist {
  userId: number;
  stageNames: Array<{ name: string; isPrimary: boolean }>;
  primaryGenre: string;
  secondaryGenres: string[];
  isManaged: boolean;
  basePrice: number;
  profile?: {
    avatarUrl?: string;
    bio?: string;
  };
}

export default function ArtistBrowse() {
  const [searchQuery, setSearchQuery] = useState('');
  const [genreFilter, setGenreFilter] = useState<string>('all');
  const [managedFilter, setManagedFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { data: artists = [], isLoading } = useQuery<Artist[]>({
    queryKey: ['/api/artists'],
    select: (data) => data || []
  });

  // Get available genres for filtering
  const availableGenres = Array.from(
    new Set(
      artists
        .map(artist => artist.primaryGenre)
        .filter(Boolean)
    )
  ).sort();

  // Filter artists based on search and filters
  const filteredArtists = artists.filter(artist => {
    const matchesSearch = !searchQuery || 
      artist.stageNames.some(stage => 
        stage.name.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      artist.primaryGenre?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesGenre = genreFilter === 'all' || 
      artist.primaryGenre === genreFilter;

    const matchesManaged = managedFilter === 'all' ||
      (managedFilter === 'managed' && artist.isManaged) ||
      (managedFilter === 'independent' && !artist.isManaged);

    return matchesSearch && matchesGenre && matchesManaged;
  });

  const getPrimaryStage = (artist: Artist) => {
    const primary = artist.stageNames?.find(stage => stage.isPrimary);
    return primary?.name || artist.stageNames?.[0]?.name || `Artist ${artist.userId}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-4">Discover Artists</h1>
          <p className="text-xl opacity-90">
            Explore our roster of talented artists and musicians from around the world
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search artists or genres..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={genreFilter} onValueChange={setGenreFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Genres" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genres</SelectItem>
                  {availableGenres.map(genre => (
                    <SelectItem key={genre} value={genre}>
                      {genre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={managedFilter} onValueChange={setManagedFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Artists" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Artists</SelectItem>
                  <SelectItem value="managed">Managed Artists</SelectItem>
                  <SelectItem value="independent">Independent Artists</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
            <p>
              Showing {filteredArtists.length} of {artists.length} artists
            </p>
            <p>
              {artists.filter(a => a.isManaged).length} managed • {artists.filter(a => !a.isManaged).length} independent
            </p>
          </div>
        </div>
      </div>

      {/* Artists Grid/List */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {filteredArtists.length === 0 ? (
          <div className="text-center py-16">
            <Music className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No artists found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria or browse all artists.
            </p>
            <Button onClick={() => {
              setSearchQuery('');
              setGenreFilter('all');
              setManagedFilter('all');
            }}>
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            : "space-y-4"
          }>
            {filteredArtists.map((artist) => (
              <Link key={artist.userId} href={`/artists/${artist.userId}`}>
                <Card className={`group hover:shadow-lg transition-all duration-300 cursor-pointer ${
                  viewMode === 'list' ? 'flex flex-row' : ''
                }`}>
                  <div className={viewMode === 'list' ? 'w-48 flex-shrink-0' : ''}>
                    <div className={`relative overflow-hidden ${
                      viewMode === 'list' ? 'h-full rounded-l-lg' : 'h-48 rounded-t-lg'
                    }`}>
                      {artist.profile?.avatarUrl ? (
                        <img
                          src={artist.profile.avatarUrl}
                          alt={getPrimaryStage(artist)}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center group-hover:from-primary/90 group-hover:to-primary/60 transition-colors duration-300">
                          <span className="text-4xl font-bold text-white">
                            {getPrimaryStage(artist).charAt(0)}
                          </span>
                        </div>
                      )}
                      
                      {/* Overlay badges */}
                      <div className="absolute top-3 left-3">
                        {artist.isManaged && (
                          <Badge className="bg-green-500 hover:bg-green-600">
                            Managed
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <CardContent className={`${viewMode === 'list' ? 'flex-1 p-6' : 'p-6'}`}>
                    <div className={viewMode === 'list' ? 'flex items-center justify-between h-full' : ''}>
                      <div className={viewMode === 'list' ? 'flex-1' : ''}>
                        <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                          {getPrimaryStage(artist)}
                        </h3>
                        
                        <div className="space-y-2">
                          {artist.primaryGenre && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Music className="h-4 w-4 mr-2" />
                              {artist.primaryGenre}
                            </div>
                          )}
                          
                          <div className="flex items-center text-sm text-gray-600">
                            <Star className="h-4 w-4 mr-2 fill-yellow-400 text-yellow-400" />
                            4.8 rating
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="h-4 w-4 mr-2" />
                            Available Worldwide
                          </div>
                        </div>

                        {artist.profile?.bio && viewMode === 'list' && (
                          <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                            {artist.profile.bio}
                          </p>
                        )}
                      </div>

                      {viewMode === 'list' && (
                        <div className="text-right ml-4">
                          {artist.basePrice && (
                            <p className="text-lg font-bold text-primary">
                              ${artist.basePrice}
                            </p>
                          )}
                          <Button className="mt-2">
                            View Profile
                          </Button>
                        </div>
                      )}
                    </div>

                    {viewMode === 'grid' && (
                      <div className="mt-4 pt-4 border-t flex items-center justify-between">
                        {artist.basePrice && (
                          <span className="text-lg font-bold text-primary">
                            From ${artist.basePrice}
                          </span>
                        )}
                        <Button size="sm" className="ml-auto">
                          View Profile
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}