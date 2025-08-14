import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Crown, Star, Music } from 'lucide-react';

interface GenreDisplayProps {
  primaryGenre?: string;
  secondaryGenres?: string[];
  topGenres?: string[];
  allGenres?: string[];
  showAll?: boolean;
  layout?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
}

export default function EnhancedGenreDisplay({ 
  primaryGenre, 
  secondaryGenres = [], 
  topGenres = [],
  allGenres = [],
  showAll = true,
  layout = 'horizontal',
  size = 'md'
}: GenreDisplayProps) {
  // Combine all genres for display
  const combinedGenres = [...new Set([
    ...(primaryGenre ? [primaryGenre] : []),
    ...secondaryGenres,
    ...topGenres,
    ...allGenres
  ])];

  const getGenreType = (genre: string) => {
    if (genre === primaryGenre) return 'primary';
    if (secondaryGenres.includes(genre)) return 'secondary';
    if (topGenres.includes(genre)) return 'top';
    return 'other';
  };

  const getGenreStyle = (genreType: string) => {
    switch (genreType) {
      case 'primary':
        return 'bg-gradient-to-r from-purple-600 to-purple-800 text-white border-2 border-purple-400 shadow-lg scale-110';
      case 'secondary':
        return 'bg-gradient-to-r from-blue-500 to-blue-700 text-white border-2 border-blue-300 shadow-md';
      case 'top':
        return 'bg-gradient-to-r from-emerald-500 to-emerald-700 text-white border border-emerald-300';
      default:
        return 'bg-gray-100 text-gray-700 border border-gray-300 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getGenreIcon = (genreType: string) => {
    switch (genreType) {
      case 'primary':
        return <Crown className={`${size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'}`} />;
      case 'secondary':
        return <Star className={`${size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'}`} />;
      case 'top':
        return <Music className={`${size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'}`} />;
      default:
        return null;
    }
  };

  const getBadgeSize = () => {
    switch (size) {
      case 'sm': return 'text-xs px-2 py-1';
      case 'lg': return 'text-base px-4 py-2';
      default: return 'text-sm px-3 py-1';
    }
  };

  const genresToDisplay = showAll ? combinedGenres : combinedGenres.slice(0, 5);

  if (genresToDisplay.length === 0) {
    return (
      <div className="text-muted-foreground text-sm">
        No genres specified
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Primary Genre - Most Prominent */}
      {primaryGenre && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-muted-foreground">Primary Genre</h4>
          <Badge className={`${getGenreStyle('primary')} ${getBadgeSize()} inline-flex items-center gap-2 font-semibold`}>
            {getGenreIcon('primary')}
            {primaryGenre}
          </Badge>
        </div>
      )}

      {/* Secondary Genres - Highlighted */}
      {secondaryGenres.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-muted-foreground">Secondary Genres</h4>
          <div className={`flex ${layout === 'vertical' ? 'flex-col' : 'flex-wrap'} gap-2`}>
            {secondaryGenres.map((genre, index) => (
              <Badge 
                key={index} 
                className={`${getGenreStyle('secondary')} ${getBadgeSize()} inline-flex items-center gap-2 font-medium`}
              >
                {getGenreIcon('secondary')}
                {genre}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* All Other Genres */}
      {showAll && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-muted-foreground">All Genres</h4>
          <div className={`flex ${layout === 'vertical' ? 'flex-col' : 'flex-wrap'} gap-2`}>
            {genresToDisplay.map((genre, index) => {
              const genreType = getGenreType(genre);
              if (genreType === 'primary' || genreType === 'secondary') return null; // Already displayed above
              
              return (
                <Badge 
                  key={index} 
                  className={`${getGenreStyle(genreType)} ${getBadgeSize()} inline-flex items-center gap-1`}
                >
                  {getGenreIcon(genreType)}
                  {genre}
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      {/* Truncation indicator */}
      {!showAll && combinedGenres.length > 5 && (
        <Badge variant="outline" className={getBadgeSize()}>
          +{combinedGenres.length - 5} more
        </Badge>
      )}

      {/* Legend */}
      <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
        <div className="flex items-center gap-2">
          <Crown className="w-3 h-3 text-purple-600" />
          <span>Primary Genre (Most Prominent)</span>
        </div>
        <div className="flex items-center gap-2">
          <Star className="w-3 h-3 text-blue-600" />
          <span>Secondary Genres (Highlighted)</span>
        </div>
        <div className="flex items-center gap-2">
          <Music className="w-3 h-3 text-emerald-600" />
          <span>Additional Genres</span>
        </div>
      </div>
    </div>
  );
}