import { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useKeyboardHeight } from '@/hooks/useKeyboardHeight';

interface SearchResult {
  id: number;
  name: string;
  type: string;
}

interface MobileSearchInputProps {
  onSearch: (query: string) => void;
  results: SearchResult[];
  isLoading?: boolean;
  placeholder?: string;
}

export function MobileSearchInput({ 
  onSearch, 
  results, 
  isLoading,
  placeholder = "Search artists..." 
}: MobileSearchInputProps) {
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const { keyboardHeight, isKeyboardVisible } = useKeyboardHeight();
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleSearch = (value: string) => {
    setQuery(value);
    setShowResults(value.length > 0);
    onSearch(value);
  };

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calculate position based on keyboard visibility
  const resultsPosition = isKeyboardVisible
    ? { bottom: `${keyboardHeight + 10}px`, top: 'auto' }
    : { top: '100%', bottom: 'auto' };

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="search"
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => query.length > 0 && setShowResults(true)}
          className="pl-10"
        />
      </div>

      {showResults && (
        <div
          ref={resultsRef}
          className="absolute left-0 right-0 z-50 mt-1 bg-background border rounded-lg shadow-lg overflow-hidden"
          style={{
            ...resultsPosition,
            maxHeight: isKeyboardVisible ? '40vh' : '60vh',
            overflowY: 'auto'
          }}
          data-keyboard-visible={isKeyboardVisible}
        >
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              Searching...
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No results found
            </div>
          ) : (
            <ul className="py-2">
              {results.map((result) => (
                <li
                  key={result.id}
                  className="px-4 py-3 hover:bg-accent cursor-pointer"
                  onClick={() => {
                    // Handle result selection
                    setShowResults(false);
                    setQuery('');
                  }}
                >
                  <div className="font-medium">{result.name}</div>
                  <div className="text-sm text-muted-foreground">{result.type}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}