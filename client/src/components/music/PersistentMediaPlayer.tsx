import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Repeat, 
  Shuffle,
  ShoppingCart,
  Heart,
  MoreHorizontal,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Song {
  id: number;
  title: string;
  artistName: string;
  albumTitle?: string;
  mp3Url?: string;
  coverArtUrl?: string;
  price?: number;
  isFree: boolean;
  durationSeconds?: number;
  previewStartSeconds: number;
  previewDuration: number;
  isPaid?: boolean; // Whether user has purchased this track
}

interface PersistentMediaPlayerProps {
  currentSong?: Song | null;
  playlist?: Song[];
  onSongChange?: (song: Song) => void;
  onAddToCart?: (song: Song) => void;
  isVisible?: boolean;
  onToggleVisibility?: () => void;
}

export default function PersistentMediaPlayer({ 
  currentSong, 
  playlist = [], 
  onSongChange, 
  onAddToCart,
  isVisible = true,
  onToggleVisibility 
}: PersistentMediaPlayerProps) {
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'none' | 'one' | 'all'>('none');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong?.mp3Url) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration || 0);
    const handleEnded = () => {
      setIsPlaying(false);
      handleNext();
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    // Check if song is paid or free, and if user has access
    const shouldUsePreview = currentSong && !currentSong.isFree && !currentSong.isPaid;
    setIsPreviewMode(shouldUsePreview);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentSong]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio || !currentSong?.mp3Url) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      // For paid audio files, always use preview mode unless user has purchased
      if (isPreviewMode && currentSong) {
        // Start from preview position
        audio.currentTime = currentSong.previewStartSeconds;
        audio.play();
        setIsPlaying(true);
        
        // Stop after preview duration and show purchase prompt
        setTimeout(() => {
          if (audio && !audio.paused) {
            audio.pause();
            setIsPlaying(false);
            
            // Prominent add to cart prompt for paid audio
            if (onAddToCart && !currentSong.isFree) {
              toast({
                title: "🎵 Preview Complete",
                description: `Purchase "${currentSong.title}" to unlock the full track`,
                action: (
                  <Button 
                    size="sm" 
                    onClick={() => onAddToCart(currentSong)}
                    className="ml-2 bg-green-600 hover:bg-green-700"
                  >
                    <ShoppingCart className="h-3 w-3 mr-1" />
                    ${currentSong.price?.toFixed(2) || '0.99'}
                  </Button>
                ),
                duration: 8000, // Show longer for paid content
              });
            }
          }
        }, currentSong.previewDuration * 1000);
      } else {
        // Play full song (for free songs or purchased songs)
        audio.play();
        setIsPlaying(true);
      }
    }
  };

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;

    const newTime = value[0];
    
    // Restrict seeking for preview mode
    if (isPreviewMode) {
      const maxTime = currentSong.previewStartSeconds + currentSong.previewDuration;
      if (newTime < currentSong.previewStartSeconds || newTime > maxTime) {
        toast({
          title: "Preview Restriction",
          description: "Purchase the full song to access all content",
          variant: "destructive"
        });
        return;
      }
    }
    
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
  };

  const handleMute = () => {
    setIsMuted(!isMuted);
  };

  const handlePrevious = () => {
    if (!playlist.length || !currentSong) return;
    
    const currentIndex = playlist.findIndex(song => song.id === currentSong.id);
    const previousIndex = currentIndex > 0 ? currentIndex - 1 : playlist.length - 1;
    
    if (onSongChange) {
      onSongChange(playlist[previousIndex]);
    }
  };

  const handleNext = () => {
    if (!playlist.length || !currentSong) return;
    
    const currentIndex = playlist.findIndex(song => song.id === currentSong.id);
    
    if (repeatMode === 'one') {
      // Replay current song
      const audio = audioRef.current;
      if (audio) {
        audio.currentTime = isPreviewMode ? currentSong.previewStartSeconds : 0;
        if (isPlaying) audio.play();
      }
      return;
    }
    
    let nextIndex;
    if (isShuffled) {
      nextIndex = Math.floor(Math.random() * playlist.length);
    } else {
      nextIndex = currentIndex < playlist.length - 1 ? currentIndex + 1 : 0;
    }
    
    if (repeatMode === 'none' && currentIndex === playlist.length - 1) {
      setIsPlaying(false);
      return;
    }
    
    if (onSongChange) {
      onSongChange(playlist[nextIndex]);
    }
  };

  const handleAddToCart = () => {
    if (currentSong && onAddToCart) {
      onAddToCart(currentSong);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    if (isPreviewMode && currentSong) {
      const previewStart = currentSong.previewStartSeconds;
      const previewEnd = previewStart + currentSong.previewDuration;
      const relativeTime = Math.max(0, currentTime - previewStart);
      const relativeDuration = previewEnd - previewStart;
      return (relativeTime / relativeDuration) * 100;
    }
    return (currentTime / duration) * 100;
  };

  if (!isVisible || !currentSong) return null;

  return (
    <TooltipProvider>
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-black border-t shadow-lg">
        <audio
          ref={audioRef}
          src={currentSong.mp3Url}
          preload="metadata"
        />
        
        <Card className="rounded-none border-0 border-t">
          <div className={`p-4 ${isMinimized ? 'pb-2' : ''}`}>
            {/* Main player controls */}
            <div className="flex items-center gap-4">
              {/* Song info */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {currentSong.coverArtUrl && (
                  <img 
                    src={currentSong.coverArtUrl} 
                    alt={currentSong.title}
                    className="w-12 h-12 rounded object-cover flex-shrink-0"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm truncate">
                    {currentSong.title}
                    {isPreviewMode && !currentSong.isFree && (
                      <span className="ml-2 px-1 py-0.5 bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-700 text-xs rounded border border-orange-200">
                        🎵 Preview - ${currentSong.price?.toFixed(2) || '0.99'}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {currentSong.artistName}
                    {currentSong.albumTitle && ` • ${currentSong.albumTitle}`}
                  </div>
                </div>
              </div>

              {/* Player controls */}
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setIsShuffled(!isShuffled)}
                      className={isShuffled ? 'text-blue-600' : ''}
                    >
                      <Shuffle className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Shuffle</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={handlePrevious}>
                      <SkipBack className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Previous</TooltipContent>
                </Tooltip>

                <Button 
                  onClick={handlePlayPause}
                  size="sm"
                  className="w-8 h-8 rounded-full"
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
                </Button>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={handleNext}>
                      <SkipForward className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Next</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setRepeatMode(repeatMode === 'none' ? 'all' : repeatMode === 'all' ? 'one' : 'none')}
                      className={repeatMode !== 'none' ? 'text-blue-600' : ''}
                    >
                      <Repeat className="h-4 w-4" />
                      {repeatMode === 'one' && (
                        <span className="absolute -top-1 -right-1 text-xs bg-blue-600 text-white rounded-full w-3 h-3 flex items-center justify-center">
                          1
                        </span>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {repeatMode === 'none' ? 'No Repeat' : repeatMode === 'all' ? 'Repeat All' : 'Repeat One'}
                  </TooltipContent>
                </Tooltip>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                {/* Prominent Add to Cart for paid audio files */}
                {isPreviewMode && !currentSong.isFree && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="default" 
                        size="sm"
                        onClick={handleAddToCart}
                        className="bg-green-600 hover:bg-green-700 text-white animate-pulse hover:animate-none"
                      >
                        <ShoppingCart className="h-4 w-4 mr-1" />
                        ${currentSong.price?.toFixed(2) || '0.99'}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      Purchase full track to unlock complete audio
                    </TooltipContent>
                  </Tooltip>
                )}

                {/* Standard add to cart for other content */}
                {isPreviewMode && currentSong.isFree && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={handleAddToCart}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <ShoppingCart className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      Add to collection
                    </TooltipContent>
                  </Tooltip>
                )}

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Heart className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Add to Favorites</TooltipContent>
                </Tooltip>

                {/* Volume control */}
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={handleMute}>
                    {isMuted || volume === 0 ? (
                      <VolumeX className="h-4 w-4" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </Button>
                  <div className="w-20">
                    <Slider
                      value={[isMuted ? 0 : volume]}
                      onValueChange={handleVolumeChange}
                      max={1}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* More options */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setIsMinimized(!isMinimized)}>
                      {isMinimized ? (
                        <>
                          <Maximize2 className="h-4 w-4 mr-2" />
                          Expand Player
                        </>
                      ) : (
                        <>
                          <Minimize2 className="h-4 w-4 mr-2" />
                          Minimize Player
                        </>
                      )}
                    </DropdownMenuItem>
                    {onToggleVisibility && (
                      <DropdownMenuItem onClick={onToggleVisibility}>
                        Hide Player
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Progress bar and time - only show when not minimized */}
            {!isMinimized && (
              <div className="mt-3 flex items-center gap-3">
                <span className="text-xs text-gray-500 w-10 text-right">
                  {formatTime(currentTime)}
                </span>
                
                <div className="flex-1 relative">
                  <Slider
                    value={[currentTime]}
                    onValueChange={handleSeek}
                    max={isPreviewMode && currentSong ? 
                      currentSong.previewStartSeconds + currentSong.previewDuration : 
                      duration
                    }
                    min={isPreviewMode && currentSong ? 
                      currentSong.previewStartSeconds : 
                      0
                    }
                    step={1}
                    className="w-full"
                  />
                  
                  {/* Preview restriction indicator */}
                  {isPreviewMode && currentSong && (
                    <div className="absolute top-0 left-0 right-0 h-2 pointer-events-none">
                      <div 
                        className="h-full bg-orange-200 rounded"
                        style={{
                          left: `${(currentSong.previewStartSeconds / duration) * 100}%`,
                          width: `${(currentSong.previewDuration / duration) * 100}%`
                        }}
                      />
                    </div>
                  )}
                </div>
                
                <span className="text-xs text-gray-500 w-10">
                  {formatTime(isPreviewMode && currentSong ? 
                    currentSong.previewStartSeconds + currentSong.previewDuration :
                    duration
                  )}
                </span>
              </div>
            )}
          </div>
        </Card>
      </div>
    </TooltipProvider>
  );
}