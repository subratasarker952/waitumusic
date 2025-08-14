import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Music, 
  Play, 
  ShoppingCart,
  ArrowLeft,
  Calendar,
  DollarSign,
  Users,
  Star
} from 'lucide-react';

export default function Albums() {
  const [location] = useLocation();
  const { addItem } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedAlbumId, setSelectedAlbumId] = useState<number | null>(null);

  // Parse URL parameters for album ID
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const albumId = searchParams.get('id');
    if (albumId) {
      setSelectedAlbumId(parseInt(albumId));
    }
  }, [location]);

  const { data: albums = [], isLoading: albumsLoading } = useQuery<any[]>({
    queryKey: ['/api/albums'],
  });

  const { data: songs = [] } = useQuery<any[]>({
    queryKey: ['/api/songs'],
  });

  const { data: artists = [] } = useQuery<any[]>({
    queryKey: ['/api/artists'],
  });

  // If a specific album ID is provided, show album detail
  if (selectedAlbumId) {
    const album = albums.find((a: any) => a.id === selectedAlbumId);
    const albumSongs = songs.filter((song: any) => song.albumId === selectedAlbumId);
    const artist = artists.find((a: any) => a.userId === album?.artistUserId);

    if (albumsLoading) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (!album) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <Music className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Album not found</h1>
            <p className="text-gray-600 mb-4">The album you're looking for doesn't exist.</p>
            <Button onClick={() => window.history.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      );
    }

    const artistName = artist?.stageNames?.[0]?.name || 'Unknown Artist';

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Button 
            variant="outline" 
            className="mb-6"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          {/* Album Header */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div>
              {album.coverImageUrl && (
                <img 
                  src={album.coverImageUrl} 
                  alt={album.title}
                  className="w-full aspect-square rounded-lg object-cover shadow-lg"
                />
              )}
            </div>
            
            <div className="space-y-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{album.title}</h1>
                <p className="text-xl text-gray-600 mb-2">by {artistName}</p>
                {album.genre && (
                  <Badge variant="secondary" className="mb-4">
                    {album.genre}
                  </Badge>
                )}
              </div>

              <div className="space-y-2">
                {album.releaseDate && (
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    Released: {new Date(album.releaseDate).toLocaleDateString()}
                  </div>
                )}
                
                {album.totalTracks && (
                  <div className="flex items-center text-gray-600">
                    <Music className="h-4 w-4 mr-2" />
                    {album.totalTracks} tracks
                  </div>
                )}

                {album.price && (
                  <div className="flex items-center text-green-600 font-semibold">
                    <DollarSign className="h-4 w-4 mr-1" />
                    ${album.price}
                  </div>
                )}
              </div>

              {album.price && (
                <Button 
                  className="w-full"
                  onClick={() => {
                    addItem({
                      name: album.title,
                      price: parseFloat(album.price),
                      type: 'album',
                      artistName: artistName,
                      imageUrl: album.coverImageUrl
                    });
                    toast({ title: "Added to Cart", description: `${album.title} added to your cart` });
                  }}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart - ${album.price}
                </Button>
              )}
            </div>
          </div>

          {/* Track Listing */}
          {albumSongs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Track Listing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {albumSongs.map((song: any, index: number) => (
                    <div key={song.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <span className="text-gray-500 font-mono text-sm w-6 text-center">
                          {index + 1}
                        </span>
                        <div>
                          <h4 className="font-medium">{song.title}</h4>
                          {song.durationSeconds && (
                            <p className="text-sm text-gray-500">
                              {Math.floor(song.durationSeconds / 60)}:{(song.durationSeconds % 60).toString().padStart(2, '0')}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button size="sm" variant="ghost">
                        <Play className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  // Show albums list if no specific album is selected
  if (albumsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Albums</h1>
          <p className="text-gray-600">Discover amazing albums from our talented artists</p>
        </div>

        {albums?.length === 0 ? (
          <div className="text-center py-12">
            <Music className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No albums available</h2>
            <p className="text-gray-600">Check back soon for new releases!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {albums?.map((album: any) => {
              const artist = artists.find((a: any) => a.userId === album.artistUserId);
              const artistName = artist?.stageNames?.[0]?.name || 'Unknown Artist';

              return (
                <Card key={album.id} className="hover:shadow-lg transition-shadow">
                  <div className="aspect-square overflow-hidden rounded-t-lg">
                    {album.coverImageUrl ? (
                      <img 
                        src={album.coverImageUrl} 
                        alt={album.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-200 cursor-pointer"
                        onClick={() => setSelectedAlbumId(album.id)}
                      />
                    ) : (
                      <div 
                        className="w-full h-full bg-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors"
                        onClick={() => setSelectedAlbumId(album.id)}
                      >
                        <Music className="h-16 w-16 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-1 truncate">{album.title}</h3>
                    <p className="text-gray-600 mb-2 truncate">by {artistName}</p>
                    
                    {album.genre && (
                      <Badge variant="outline" className="mb-2 text-xs">
                        {album.genre}
                      </Badge>
                    )}

                    <div className="flex items-center justify-between">
                      {album.price && (
                        <span className="font-semibold text-green-600">
                          ${album.price}
                        </span>
                      )}
                      
                      <Button 
                        size="sm"
                        onClick={() => setSelectedAlbumId(album.id)}
                      >
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}