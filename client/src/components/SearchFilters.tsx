import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Slider 
} from '@/components/ui/slider';
import { 
  Search, 
  Filter, 
  X,
  SlidersHorizontal 
} from 'lucide-react';

export interface FilterOptions {
  genre?: string[];
  priceRange?: [number, number];
  managementStatus?: 'managed' | 'independent' | 'all';
  sortBy?: 'name' | 'price' | 'recent' | 'popular';
  searchQuery?: string;
}

interface SearchFiltersProps {
  onFiltersChange: (filters: FilterOptions) => void;
  showGenreFilter?: boolean;
  showPriceFilter?: boolean;
  showManagementFilter?: boolean;
  availableGenres?: string[];
  placeholder?: string;
}

const DEFAULT_GENRES = [
  'Pop', 'Hip-Hop', 'R&B', 'Jazz', 'Rock', 'Electronic', 
  'Country', 'Reggae', 'Dancehall', 'Soul', 'Blues', 'Folk'
];

export default function SearchFilters({
  onFiltersChange,
  showGenreFilter = true,
  showPriceFilter = true,
  showManagementFilter = true,
  availableGenres = DEFAULT_GENRES,
  placeholder = "Search artists, songs, or albums..."
}: SearchFiltersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [managementStatus, setManagementStatus] = useState<'managed' | 'independent' | 'all'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'recent' | 'popular'>('name');
  const [showFilters, setShowFilters] = useState(false);

  const updateFilters = (updates: Partial<FilterOptions>) => {
    const newFilters: FilterOptions = {
      searchQuery,
      genre: selectedGenres.length > 0 ? selectedGenres : undefined,
      priceRange: priceRange[0] > 0 || priceRange[1] < 1000 ? priceRange : undefined,
      managementStatus: managementStatus !== 'all' ? managementStatus : undefined,
      sortBy,
      ...updates
    };
    onFiltersChange(newFilters);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    updateFilters({ searchQuery: value });
  };

  const toggleGenre = (genre: string) => {
    const newGenres = selectedGenres.includes(genre)
      ? selectedGenres.filter(g => g !== genre)
      : [...selectedGenres, genre];
    setSelectedGenres(newGenres);
    updateFilters({ genre: newGenres.length > 0 ? newGenres : undefined });
  };

  const handlePriceRangeChange = (value: number[]) => {
    const newRange: [number, number] = [value[0], value[1]];
    setPriceRange(newRange);
    updateFilters({ priceRange: newRange });
  };

  const handleManagementStatusChange = (value: 'managed' | 'independent' | 'all') => {
    setManagementStatus(value);
    updateFilters({ managementStatus: value !== 'all' ? value : undefined });
  };

  const handleSortChange = (value: 'name' | 'price' | 'recent' | 'popular') => {
    setSortBy(value);
    updateFilters({ sortBy: value });
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedGenres([]);
    setPriceRange([0, 1000]);
    setManagementStatus('all');
    setSortBy('name');
    onFiltersChange({});
  };

  const hasActiveFilters = 
    searchQuery ||
    selectedGenres.length > 0 ||
    priceRange[0] > 0 ||
    priceRange[1] < 1000 ||
    managementStatus !== 'all' ||
    sortBy !== 'name';

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-1">
              Active
            </Badge>
          )}
        </Button>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-600">Active filters:</span>
          
          {selectedGenres.map(genre => (
            <Badge key={genre} variant="secondary" className="flex items-center gap-1">
              {genre}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => toggleGenre(genre)}
              />
            </Badge>
          ))}
          
          {(priceRange[0] > 0 || priceRange[1] < 1000) && (
            <Badge variant="secondary" className="flex items-center gap-1">
              ${priceRange[0]} - ${priceRange[1]}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => handlePriceRangeChange([0, 1000])}
              />
            </Badge>
          )}
          
          {managementStatus !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {managementStatus === 'managed' ? 'Managed' : 'Independent'}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => handleManagementStatusChange('all')}
              />
            </Badge>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-red-600 hover:text-red-700"
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Expanded Filters */}
      {showFilters && (
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Sort By */}
            <div>
              <label className="text-sm font-medium mb-2 block">Sort By</label>
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                  <SelectItem value="price">Price (Low to High)</SelectItem>
                  <SelectItem value="recent">Recently Added</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Management Status */}
            {showManagementFilter && (
              <div>
                <label className="text-sm font-medium mb-2 block">Management</label>
                <Select value={managementStatus} onValueChange={handleManagementStatusChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="All artists" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Artists</SelectItem>
                    <SelectItem value="managed">Managed Only</SelectItem>
                    <SelectItem value="independent">Independent Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Price Range */}
            {showPriceFilter && (
              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-2 block">
                  Price Range: ${priceRange[0]} - ${priceRange[1]}
                </label>
                <Slider
                  value={priceRange}
                  onValueChange={handlePriceRangeChange}
                  max={1000}
                  min={0}
                  step={25}
                  className="w-full"
                />
              </div>
            )}
          </div>

          {/* Genre Filter */}
          {showGenreFilter && (
            <div>
              <label className="text-sm font-medium mb-2 block">Genres</label>
              <div className="flex flex-wrap gap-2">
                {availableGenres.map(genre => (
                  <Badge
                    key={genre}
                    variant={selectedGenres.includes(genre) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleGenre(genre)}
                  >
                    {genre}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}