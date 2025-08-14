import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  ShoppingCart,
  Heart,
  Share2,
  Repeat,
  Shuffle,
  Maximize2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface MediaItem {
  id: number;
  title: string;
  artist: string;
  url: string;
  mp4_url?: string;
  type: 'audio' | 'video';
  duration?: number;
  isPaid: boolean;
  price?: number;
  previewStartTime?: number;
  previewDuration?: number;
  albumId?: number;
  albumTitle?: string;
  merchandise?: Array<{
    id: number;
    name: string;
    price: number;
    image_url: string;
  }>;
}

interface UniversalMediaPlayerProps {
  playlist: MediaItem[];
  currentIndex: number;
  onTrackChange: (index: number) => void;
  onAddToCart?: (itemId: number, type: 'song' | 'merchandise') => void;
  className?: string;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}

export default function UniversalMediaPlayer({
  playlist,
  currentIndex,
  onTrackChange,
  onAddToCart,
  className = '',
  isMinimized = false,
  onToggleMinimize
}: UniversalMediaPlayerProps) {
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false);
  
  const currentTrack = playlist[currentIndex];
  const mediaRef = currentTrack?.type === 'video' ? videoRef : audioRef;

  // Update media element when track changes
  useEffect(() => {
    if (mediaRef.current && currentTrack) {
      mediaRef.current.src = currentTrack.url;
      mediaRef.current.load();
      setCurrentTime(0);
      
      // For preview tracks, set start time
      if (currentTrack.isPaid && currentTrack.previewStartTime) {
        mediaRef.current.currentTime = currentTrack.previewStartTime;
      }
    }
  }, [currentIndex, currentTrack]);

  // Handle time updates
  useEffect(() => {
    const media = mediaRef.current;
    if (!media) return;

    const updateTime = () => {
      setCurrentTime(media.currentTime);
      
      // For paid tracks, enforce preview duration
      if (currentTrack?.isPaid && currentTrack.previewDuration) {
        const previewEnd = (currentTrack.previewStartTime || 0) + currentTrack.previewDuration;
        if (media.currentTime >= previewEnd) {
          media.pause();
          setIsPlaying(false);
          
          // Show add to cart prompt
          toast({
            title: "Preview Complete",
            description: `Want to hear the full song? Add "${currentTrack.title}" to your cart!`,
            action: currentTrack.price ? (
              <Button 
                size="sm" 
                onClick={() => onAddToCart?.(currentTrack.id, 'song')}
              >
                Add to Cart - ${currentTrack.price}
              </Button>
            ) : undefined
          });
        }
      }
    };

    const updateDuration = () => setDuration(media.duration || 0);
    const handleEnded = () => {
      setIsPlaying(false);
      handleNext();
    };

    media.addEventListener('timeupdate', updateTime);
    media.addEventListener('durationchange', updateDuration);
    media.addEventListener('ended', handleEnded);

    return () => {
      media.removeEventListener('timeupdate', updateTime);
      media.removeEventListener('durationchange', updateDuration);
      media.removeEventListener('ended', handleEnded);
    };
  }, [currentTrack, currentIndex]);

  const togglePlayPause = () => {
    if (!mediaRef.current) return;
    
    if (isPlaying) {
      mediaRef.current.pause();
    } else {
      mediaRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handlePrevious = () => {
    const newIndex = isShuffled 
      ? Math.floor(Math.random() * playlist.length)
      : currentIndex > 0 ? currentIndex - 1 : playlist.length - 1;
    onTrackChange(newIndex);
  };

  const handleNext = () => {
    if (isRepeating) {
      mediaRef.current?.play();
      setIsPlaying(true);
      return;
    }
    
    const newIndex = isShuffled 
      ? Math.floor(Math.random() * playlist.length)
      : currentIndex < playlist.length - 1 ? currentIndex + 1 : 0;
    onTrackChange(newIndex);
  };

  const handleSeek = (value: number[]) => {
    if (!mediaRef.current) return;
    
    const newTime = value[0];
    
    // For paid tracks, restrict seeking outside preview range
    if (currentTrack?.isPaid && currentTrack.previewStartTime && currentTrack.previewDuration) {
      const previewStart = currentTrack.previewStartTime;
      const previewEnd = previewStart + currentTrack.previewDuration;
      
      if (newTime < previewStart || newTime > previewEnd) {
        toast({
          title: "Preview Only",
          description: "You can only listen to the preview. Purchase the full track to access everything!",
          variant: "destructive"
        });
        return;
      }
    }
    
    mediaRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (mediaRef.current) {
      mediaRef.current.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (!mediaRef.current) return;
    
    if (isMuted) {
      mediaRef.current.volume = volume;
      setIsMuted(false);
    } else {
      mediaRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleAddToCart = () => {
    if (currentTrack && onAddToCart) {
      onAddToCart(currentTrack.id, 'song');
      toast({
        title: "Added to Cart",
        description: `"${currentTrack.title}" has been added to your cart`
      });
    }
  };

  if (!currentTrack) return null;

  // Minimized view
  if (isMinimized) {
    return (
      <div className={`fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t shadow-lg z-50 ${className}`}>
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={togglePlayPause}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{currentTrack.title}</p>
              <p className="text-xs text-muted-foreground truncate">{currentTrack.artist}</p>
            </div>
            
            {currentTrack.isPaid && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleAddToCart}
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Add to Cart - ${currentTrack.price}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleMinimize}
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className={`${className}`}>
      <CardContent className="p-6">
        {/* Track Info */}
        <div className="flex items-center justify-between mb-4">
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold truncate">{currentTrack.title}</h3>
            <p className="text-sm text-muted-foreground truncate">{currentTrack.artist}</p>
            {currentTrack.albumTitle && (
              <p className="text-xs text-muted-foreground truncate">From: {currentTrack.albumTitle}</p>
            )}
          </div>
          
          <div className="flex items-center space-x-2 ml-4">
            {currentTrack.isPaid && (
              <Badge variant="secondary">Preview</Badge>
            )}
            <Badge variant="outline">{currentTrack.type}</Badge>
          </div>
        </div>

        {/* Video Player */}
        {currentTrack.type === 'video' && (
          <div className="mb-4">
            <video
              ref={videoRef}
              className="w-full rounded-lg"
              controls={false}
              playsInline
            />
          </div>
        )}

        {/* Audio element (hidden) */}
        <audio ref={audioRef} preload="metadata" />

        {/* Progress Bar */}
        <div className="space-y-2 mb-4">
          <Slider
            value={[currentTime]}
            max={duration}
            step={1}
            onValueChange={handleSeek}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center space-x-4 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsShuffled(!isShuffled)}
            className={isShuffled ? 'text-primary' : ''}
          >
            <Shuffle className="h-4 w-4" />
          </Button>
          
          <Button variant="ghost" size="sm" onClick={handlePrevious}>
            <SkipBack className="h-4 w-4" />
          </Button>
          
          <Button
            variant="default"
            size="lg"
            onClick={togglePlayPause}
            className="h-12 w-12 rounded-full"
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </Button>
          
          <Button variant="ghost" size="sm" onClick={handleNext}>
            <SkipForward className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsRepeating(!isRepeating)}
            className={isRepeating ? 'text-primary' : ''}
          >
            <Repeat className="h-4 w-4" />
          </Button>
        </div>

        {/* Volume and Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={toggleMute}>
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            <Slider
              value={[isMuted ? 0 : volume]}
              max={1}
              step={0.1}
              onValueChange={handleVolumeChange}
              className="w-20"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            {currentTrack.isPaid && onAddToCart && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" onClick={handleAddToCart}>
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      ${currentTrack.price}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Add full track to cart</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            
            {/* Merchandise Upsell */}
            {currentTrack.merchandise && currentTrack.merchandise.length > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipContent>
                    <div className="space-y-2">
                      <p className="font-medium">Available Merchandise:</p>
                      {currentTrack.merchandise.map((item) => (
                        <div key={item.id} className="flex items-center justify-between">
                          <span className="text-sm">{item.name}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onAddToCart?.(item.id, 'merchandise')}
                          >
                            ${item.price}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </TooltipContent>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Heart className="h-4 w-4 mr-2" />
                      Merch
                    </Button>
                  </TooltipTrigger>
                </Tooltip>
              </TooltipProvider>
            )}
            
            <Button variant="ghost" size="sm">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Playlist Info */}
        <div className="mt-4 pt-4 border-t">
          <p className="text-xs text-muted-foreground text-center">
            Track {currentIndex + 1} of {playlist.length}
            {playlist.length > 1 && ` • Next: ${playlist[(currentIndex + 1) % playlist.length]?.title}`}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}