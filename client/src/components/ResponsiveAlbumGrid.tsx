import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { AlbumsLoadingSkeleton } from '@/components/LoadingSkeleton';

interface Album {
  id: number;
  title: string;
  artist: string;
  coverUrl?: string;
  price: number;
  releaseDate: string;
}

interface ResponsiveAlbumGridProps {
  albums: Album[];
  isLoading?: boolean;
}

export function ResponsiveAlbumGrid({ albums, isLoading }: ResponsiveAlbumGridProps) {
  const [gridColumns, setGridColumns] = useState(4);
  const { addToCart } = useCart();

  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setGridColumns(1); // Mobile: 1 column
      } else if (width < 768) {
        setGridColumns(2); // Small tablets: 2 columns
      } else if (width < 1024) {
        setGridColumns(3); // Tablets: 3 columns
      } else {
        setGridColumns(4); // Desktop: 4 columns
      }
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  if (isLoading) {
    return <AlbumsLoadingSkeleton />;
  }

  return (
    <div 
      className="grid gap-4 sm:gap-6"
      style={{
        gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))`
      }}
    >
      {albums.map((album) => (
        <Card key={album.id} className="overflow-hidden h-full flex flex-col">
          <div className="aspect-square relative bg-muted">
            {album.coverUrl ? (
              <img 
                src={album.coverUrl} 
                alt={album.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Play className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
          </div>
          
          <CardContent className="flex-1 p-4">
            <h3 className="font-semibold text-lg line-clamp-1">{album.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-1">{album.artist}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Released: {new Date(album.releaseDate).toLocaleDateString()}
            </p>
            <p className="font-bold mt-2">${album.price.toFixed(2)}</p>
          </CardContent>
          
          <CardFooter className="p-4 pt-0 gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
            >
              <Play className="h-4 w-4 mr-1" />
              Preview
            </Button>
            <Button 
              size="sm" 
              className="flex-1"
              onClick={() => addToCart({
                id: album.id,
                type: 'album',
                name: album.title,
                price: album.price,
                artist: album.artist,
                quantity: 1
              })}
            >
              <ShoppingCart className="h-4 w-4 mr-1" />
              Add
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}