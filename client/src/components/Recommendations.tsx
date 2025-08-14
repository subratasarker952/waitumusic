import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, Play, Download, Eye, TrendingUp, Sparkles, Music } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface MusicRecommendation {
  id: number;
  songId: number | null;
  artistId: number | null;
  recommendationType: string;
  score: number;
  reasonCode: string;
  isActive: boolean;
  viewedAt: Date | null;
  clickedAt: Date | null;
  createdAt: Date;
}

interface Song {
  id: number;
  title: string;
  artistUserId: number;
  coverArtUrl: string | null;
  price: string | null;
  isFree: boolean | null;
}

interface Artist {
  userId: number;
  stageName: string;
  genre: string | null;
}

const RecommendationCard = ({ 
  recommendation, 
  song, 
  artist, 
  onInteraction 
}: { 
  recommendation: MusicRecommendation; 
  song?: Song; 
  artist?: Artist;
  onInteraction: (type: string, songId?: number, artistId?: number) => void;
}) => {
  const handleEngagement = async (type: 'viewed' | 'clicked') => {
    try {
      await apiRequest(`/api/recommendations/${recommendation.id}/engage`, {
        method: 'POST',
        body: { engagementType: type }
      });
    } catch (error) {
      console.error('Failed to track engagement:', error);
    }
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'trending': return <TrendingUp className="h-4 w-4" />;
      case 'genre_based': return <Music className="h-4 w-4" />;
      case 'similar_artist': return <Sparkles className="h-4 w-4" />;
      case 'collaborative': return <Heart className="h-4 w-4" />;
      case 'cross_promotion': return <Eye className="h-4 w-4" />;
      default: return <Music className="h-4 w-4" />;
    }
  };

  const getRecommendationColor = (type: string) => {
    switch (type) {
      case 'trending': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'genre_based': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'similar_artist': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'collaborative': return 'bg-pink-500/20 text-pink-300 border-pink-500/30';
      case 'cross_promotion': return 'bg-green-500/20 text-green-300 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  return (
    <Card 
      className="group hover:scale-105 transition-all duration-300 bg-black/40 backdrop-blur-lg border-white/10 hover:border-purple-500/30 hover:shadow-xl hover:shadow-purple-500/20"
      onMouseEnter={() => handleEngagement('viewed')}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Badge 
            variant="outline" 
            className={`${getRecommendationColor(recommendation.recommendationType)} flex items-center gap-1`}
          >
            {getRecommendationIcon(recommendation.recommendationType)}
            {recommendation.recommendationType.replace('_', ' ')}
          </Badge>
          <div className="text-sm text-gray-400">
            {Math.round(recommendation.score * 100)}% match
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {song && (
          <div className="flex items-center space-x-3">
            <div className="relative">
              {song.coverArtUrl ? (
                <img 
                  src={song.coverArtUrl} 
                  alt={song.title}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                  <Music className="h-8 w-8 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white truncate group-hover:text-purple-300 transition-colors">
                {song.title}
              </h3>
              {artist && (
                <p className="text-sm text-gray-400 truncate">
                  {artist.stageName}
                  {artist.genre && (
                    <span className="ml-2 text-xs bg-white/10 px-2 py-1 rounded-full">
                      {artist.genre}
                    </span>
                  )}
                </p>
              )}
              <p className="text-xs text-purple-300 mt-1">
                {recommendation.reasonCode}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 bg-purple-600/20 border-purple-500/30 hover:bg-purple-600/40 text-purple-200"
            onClick={() => {
              handleEngagement('clicked');
              onInteraction('play', song?.id, artist?.userId);
            }}
          >
            <Play className="h-4 w-4 mr-2" />
            Play
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            className="bg-pink-600/20 border-pink-500/30 hover:bg-pink-600/40 text-pink-200"
            onClick={() => {
              handleEngagement('clicked');
              onInteraction('like', song?.id, artist?.userId);
            }}
          >
            <Heart className="h-4 w-4" />
          </Button>

          {song?.price && !song?.isFree && (
            <Button
              size="sm"
              variant="outline"
              className="bg-green-600/20 border-green-500/30 hover:bg-green-600/40 text-green-200"
              onClick={() => {
                handleEngagement('clicked');
                onInteraction('download', song?.id, artist?.userId);
              }}
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default function Recommendations() {
  const queryClient = useQueryClient();

  const { data: recommendations = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/recommendations'],
    enabled: true
  });

  const { data: songs = [] } = useQuery({
    queryKey: ['/api/songs'],
    enabled: recommendations.length > 0
  });

  const { data: artists = [] } = useQuery({
    queryKey: ['/api/artists'],
    enabled: recommendations.length > 0
  });

  const { data: trending = [] } = useQuery({
    queryKey: ['/api/trending', 'weekly'],
    queryFn: async () => {
      const response = await apiRequest('/api/trending?timeframe=weekly');
      return response.json();
    }
  });

  const trackInteractionMutation = useMutation({
    mutationFn: (interaction: any) => 
      apiRequest('/api/interactions', {
        method: 'POST',
        body: interaction
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/recommendations'] });
    }
  });

  const generateRecommendationsMutation = useMutation({
    mutationFn: () => 
      apiRequest('/api/recommendations/generate', {
        method: 'POST'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/recommendations'] });
      refetch();
    }
  });

  const handleInteraction = (type: string, songId?: number, artistId?: number) => {
    trackInteractionMutation.mutate({
      interactionType: type,
      songId,
      artistId,
      metadata: { source: 'recommendations_page' }
    });
  };

  const getSongData = (songId: number) => {
    return songs.find((song: Song) => song.id === songId);
  };

  const getArtistData = (artistId: number) => {
    return artists.find((artist: Artist) => artist.userId === artistId);
  };

  const personalizedRecs = recommendations.filter((rec: MusicRecommendation) => 
    ['genre_based', 'similar_artist', 'collaborative'].includes(rec.recommendationType)
  );

  const trendingRecs = recommendations.filter((rec: MusicRecommendation) => 
    rec.recommendationType === 'trending'
  );

  const featuredRecs = recommendations.filter((rec: MusicRecommendation) => 
    rec.recommendationType === 'cross_promotion'
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-pink-900/20 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-white/10 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-white/10 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-pink-900/20 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            AI Music Recommendations
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Discover new music tailored to your taste with our advanced recommendation engine
          </p>
          
          <Button
            onClick={() => generateRecommendationsMutation.mutate()}
            disabled={generateRecommendationsMutation.isPending}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
          >
            {generateRecommendationsMutation.isPending ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Get Fresh Recommendations
              </div>
            )}
          </Button>
        </div>

        <Tabs defaultValue="personalized" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-black/40 backdrop-blur-lg border-white/10">
            <TabsTrigger value="personalized" className="data-[state=active]:bg-purple-600/30">
              For You ({personalizedRecs.length})
            </TabsTrigger>
            <TabsTrigger value="trending" className="data-[state=active]:bg-red-600/30">
              Trending ({Math.max(trendingRecs.length, Array.isArray(trending) ? trending.length : 0)})
            </TabsTrigger>
            <TabsTrigger value="featured" className="data-[state=active]:bg-green-600/30">
              Featured ({featuredRecs.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personalized" className="space-y-6">
            {personalizedRecs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {personalizedRecs.map((rec: MusicRecommendation) => (
                  <RecommendationCard
                    key={rec.id}
                    recommendation={rec}
                    song={rec.songId ? getSongData(rec.songId) : undefined}
                    artist={rec.artistId ? getArtistData(rec.artistId) : undefined}
                    onInteraction={handleInteraction}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Music className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-300 mb-2">
                  No personalized recommendations yet
                </h3>
                <p className="text-gray-400 mb-4">
                  Start listening to music to get personalized recommendations!
                </p>
                <Button
                  onClick={() => generateRecommendationsMutation.mutate()}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Generate Recommendations
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="trending" className="space-y-6">
            {Array.isArray(trending) && trending.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trending.map((song: Song) => {
                  const artist = getArtistData(song.artistUserId);
                  // Create recommendation data based on actual song data
                  const trendingRec = {
                    id: Date.now() + song.id,
                    songId: song.id,
                    artistId: song.artistUserId,
                    recommendationType: 'trending',
                    score: 0.9,
                    reasonCode: 'Popular in store',
                    isActive: true,
                    viewedAt: null,
                    clickedAt: null,
                    createdAt: new Date()
                  };
                  
                  return (
                    <RecommendationCard
                      key={song.id}
                      recommendation={trendingRec}
                      song={song}
                      artist={artist}
                      onInteraction={handleInteraction}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <TrendingUp className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-300 mb-2">
                  No trending content yet
                </h3>
                <p className="text-gray-400">
                  Check back later for trending music and artists!
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="featured" className="space-y-6">
            {featuredRecs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredRecs.map((rec: MusicRecommendation) => (
                  <RecommendationCard
                    key={rec.id}
                    recommendation={rec}
                    song={rec.songId ? getSongData(rec.songId) : undefined}
                    artist={rec.artistId ? getArtistData(rec.artistId) : undefined}
                    onInteraction={handleInteraction}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Eye className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-300 mb-2">
                  No featured content available
                </h3>
                <p className="text-gray-400">
                  Check back later for featured artists and promotional content!
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}