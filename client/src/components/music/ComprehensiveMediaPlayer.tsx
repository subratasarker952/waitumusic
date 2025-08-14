import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { useMediaPlayer } from '@/contexts/MediaPlayerContext';
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
  Maximize2,
  FileText,
  Monitor,
  X
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
  mp4Url?: string;
  wavUrl?: string;
  flacUrl?: string;
  coverArtUrl?: string;
  price?: number;
  isFree: boolean;
  durationSeconds?: number;
  previewStartSeconds: number;
  previewDuration: number;
  isPaid?: boolean;
}

export default function ComprehensiveMediaPlayer() {
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const {
    currentSong,
    playlist,
    isVisible,
    setCurrentSong,
    showPlayer,
    hidePlayer,
    getMerchandiseForCurrentSong
  } = useMediaPlayer();

  // Mock additional functionality until MediaPlayerContext is fully updated
  const currentAlbum = null;
  const isAlbumMode = false;
  const toggleAlbumMode = () => {};
  const nextTrack = () => {};
  const previousTrack = () => {};
  const addToCart = (item: any) => console.log('Adding to cart:', item);
  const toggleVisibility = () => isVisible ? hidePlayer() : showPlayer();

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [shuffleEnabled, setShuffleEnabled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'none' | 'one' | 'all'>('none');
  const [quality, setQuality] = useState<'standard' | 'high' | 'lossless'>('standard');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showMerchandise, setShowMerchandise] = useState(false);
  const [crossfadeEnabled, setCrossfadeEnabled] = useState(false);
  const [gaplessEnabled, setGaplessEnabled] = useState(true);

  // Check if current song has video content
  const isVideo = currentSong?.mp4Url ? true : false;
  const isPreviewMode = currentSong && !currentSong.isFree && !currentSong.isPaid;
  
  // Get appropriate media URL based on quality setting
  const getCurrentMediaUrl = () => {
    if (!currentSong) return '';
    
    switch (quality) {
      case 'lossless':
        return currentSong.flacUrl || currentSong.wavUrl || currentSong.mp3Url || '';
      case 'high':
        return currentSong.wavUrl || currentSong.mp3Url || '';
      default:
        return currentSong.mp3Url || '';
    }
  };

  // Audio/Video event handlers
  const handleTimeUpdate = () => {
    const media = isVideo ? videoRef.current : audioRef.current;
    if (media) {
      setCurrentTime(media.currentTime);
      
      // Preview mode enforcement - auto-pause at end of preview
      if (isPreviewMode && media.currentTime >= currentSong.previewStartSeconds + currentSong.previewDuration) {
        media.pause();
        setIsPlaying(false);
        
        // Show merchandise upsell for paid content
        if (!currentSong.isFree) {
          setShowMerchandise(true);
        }
        
        // Auto-advance to next track in album mode
        if (isAlbumMode) {
          setTimeout(() => nextTrack(), 1000);
        }
      }
    }
  };

  const handleLoadedMetadata = () => {
    const media = isVideo ? videoRef.current : audioRef.current;
    if (media) {
      setDuration(media.duration);
      
      // For preview mode, set starting position
      if (isPreviewMode) {
        media.currentTime = currentSong?.previewStartSeconds || 0;
      }
    }
  };

  const handlePlayPause = () => {
    const media = isVideo ? videoRef.current : audioRef.current;
    if (!media || !currentSong) return;

    if (isPlaying) {
      media.pause();
      setIsPlaying(false);
    } else {
      // For preview mode, ensure we start at preview position
      if (isPreviewMode) {
        media.currentTime = currentSong.previewStartSeconds;
      }
      
      media.play().then(() => {
        setIsPlaying(true);
      }).catch((error) => {
        console.error('Playback failed:', error);
        toast({
          title: "Playback Error",
          description: "Failed to play media. Please try again.",
          variant: "destructive",
        });
      });
    }
  };

  const handleSeek = (newTime: number) => {
    const media = isVideo ? videoRef.current : audioRef.current;
    if (media) {
      // In preview mode, restrict seeking to preview range
      if (isPreviewMode && currentSong) {
        const previewEnd = currentSong.previewStartSeconds + currentSong.previewDuration;
        newTime = Math.max(
          currentSong.previewStartSeconds,
          Math.min(newTime, previewEnd)
        );
      }
      
      media.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    const media = isVideo ? videoRef.current : audioRef.current;
    if (media) {
      media.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const toggleMute = () => {
    const media = isVideo ? videoRef.current : audioRef.current;
    if (media) {
      if (isMuted) {
        media.volume = volume > 0 ? volume : 0.5;
        setIsMuted(false);
      } else {
        media.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const toggleShuffle = () => {
    setShuffleEnabled(!shuffleEnabled);
    toast({
      title: shuffleEnabled ? "Shuffle Off" : "Shuffle On",
      description: shuffleEnabled ? "Playing in order" : "Playing randomly",
    });
  };

  const toggleRepeat = () => {
    const modes: Array<'none' | 'one' | 'all'> = ['none', 'one', 'all'];
    const currentIndex = modes.indexOf(repeatMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setRepeatMode(nextMode);
    
    const modeLabels = {
      none: "Repeat Off",
      one: "Repeat One",
      all: "Repeat All"
    };
    
    toast({
      title: modeLabels[nextMode],
      description: `Repeat mode: ${nextMode}`,
    });
  };

  const toggleFullscreen = () => {
    if (!isVideo || !videoRef.current) return;
    
    if (!isFullscreen) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const cycleQuality = () => {
    setQuality(prev => {
      if (prev === 'standard') return 'high';
      if (prev === 'high') return 'lossless';
      return 'standard';
    });
  };

  const handleAddToCart = () => {
    if (currentSong) {
      addToCart({
        id: currentSong.id.toString(),
        itemType: 'song',
        songId: currentSong.id,
        price: currentSong.price || 0.99
      });
      
      toast({
        title: "Added to Cart",
        description: `${currentSong.title} added to your cart`,
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getQualityIcon = () => {
    switch (quality) {
      case 'lossless': return '🎯';
      case 'high': return '🔊';
      default: return '🎵';
    }
  };

  // Don't render if not visible or no current song
  if (!isVisible || !currentSong) {
    return null;
  }

  return (
    <TooltipProvider>
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg">
        {/* Hidden audio element */}
        <audio
          ref={audioRef}
          src={!isVideo ? getCurrentMediaUrl() : ''}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => {
            setIsPlaying(false);
            if (repeatMode === 'one') {
              setTimeout(() => handlePlayPause(), 100);
            } else if (isAlbumMode && repeatMode !== 'none') {
              nextTrack();
            }
          }}
          preload="metadata"
        />
        
        {/* Video element for video content */}
        {isVideo && (
          <div className="relative">
            <video
              ref={videoRef}
              src={getCurrentMediaUrl()}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => {
                setIsPlaying(false);
                if (repeatMode === 'one') {
                  setTimeout(() => handlePlayPause(), 100);
                } else if (isAlbumMode && repeatMode !== 'none') {
                  nextTrack();
                }
              }}
              className="w-full max-h-64 bg-black"
              poster={currentSong.coverArtUrl}
              preload="metadata"
            />
            <div className="absolute top-2 right-2 flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                className="text-white bg-black/50 hover:bg-black/70"
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        )}

        {/* Main Player Controls */}
        <div className="flex items-center gap-2 p-3">
          {/* Song Info */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {currentSong.coverArtUrl && !isVideo && (
              <img
                src={currentSong.coverArtUrl}
                alt={currentSong.title}
                className="w-12 h-12 rounded object-cover flex-shrink-0 cursor-pointer hover:opacity-80"
                onClick={() => {
                  // Could open album/artist page
                }}
              />
            )}
            <div className="min-w-0 flex-1">
              <div className="font-medium text-sm truncate flex items-center gap-2">
                {isVideo && <FileText className="h-3 w-3 text-blue-500" />}
                {currentSong.title}
                {isPreviewMode && !currentSong.isFree && (
                  <span className="px-1 py-0.5 bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-700 text-xs rounded border border-orange-200">
                    🎵 Preview - ${currentSong.price?.toFixed(2) || '0.99'}
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500 truncate flex items-center gap-2">
                {currentSong.artistName}
                {isAlbumMode && currentAlbum && (
                  <span>• Album: {currentAlbum.title}</span>
                )}
                <span className="flex items-center gap-1">
                  <button onClick={cycleQuality} className="hover:text-blue-500">
                    {getQualityIcon()} {quality}
                  </button>
                </span>
              </div>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center gap-1">
            {/* Album Navigation */}
            {isAlbumMode && (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleShuffle}
                      className={shuffleEnabled ? 'text-purple-600' : ''}
                    >
                      <Shuffle className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Toggle Shuffle</TooltipContent>
                </Tooltip>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={previousTrack}
                >
                  <SkipBack className="h-4 w-4" />
                </Button>
              </>
            )}
            
            {/* Play/Pause */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePlayPause}
              className="w-8 h-8"
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>

            {/* Album Navigation */}
            {isAlbumMode && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={nextTrack}
                >
                  <SkipForward className="h-4 w-4" />
                </Button>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleRepeat}
                      className={repeatMode !== 'none' ? 'text-green-600' : ''}
                    >
                      <Repeat className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Repeat: {repeatMode}</TooltipContent>
                </Tooltip>
              </>
            )}
          </div>

          {/* Progress Bar */}
          <div className="flex-1 max-w-md">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="w-10 text-right">{formatTime(currentTime)}</span>
              <div className="flex-1 relative">
                <Slider
                  value={[currentTime]}
                  onValueChange={([value]) => handleSeek(value)}
                  max={duration}
                  step={1}
                  className="w-full"
                />
                {/* Preview Range Indicator */}
                {isPreviewMode && currentSong && (
                  <div
                    className="absolute top-1/2 transform -translate-y-1/2 h-1 bg-green-500 rounded opacity-60"
                    style={{
                      left: `${(currentSong.previewStartSeconds / duration) * 100}%`,
                      width: `${(currentSong.previewDuration / duration) * 100}%`
                    }}
                  />
                )}
              </div>
              <span className="w-10">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Volume Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMute}
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            <Slider
              value={[isMuted ? 0 : volume]}
              onValueChange={([value]) => handleVolumeChange(value)}
              max={1}
              step={0.1}
              className="w-20"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            {/* Add to Cart for paid content */}
            {!currentSong.isFree && !currentSong.isPaid && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleAddToCart}
                    className="text-green-600 hover:text-green-700"
                  >
                    <ShoppingCart className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Add to Cart - ${currentSong.price?.toFixed(2) || '0.99'}</TooltipContent>
              </Tooltip>
            )}

            {/* More Options */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isVideo && (
                  <DropdownMenuItem onClick={toggleFullscreen}>
                    <Monitor className="mr-2 h-4 w-4" />
                    {isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => setCrossfadeEnabled(!crossfadeEnabled)}>
                  <Volume2 className="mr-2 h-4 w-4" />
                  Crossfade: {crossfadeEnabled ? 'On' : 'Off'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setGaplessEnabled(!gaplessEnabled)}>
                  <SkipForward className="mr-2 h-4 w-4" />
                  Gapless: {gaplessEnabled ? 'On' : 'Off'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={cycleQuality}>
                  <FileText className="mr-2 h-4 w-4" />
                  Quality: {quality}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Minimize/Close */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleVisibility}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Merchandise Upsell Modal */}
        {showMerchandise && (
          <div className="absolute bottom-full left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Complete your purchase</h3>
                <p className="text-sm text-gray-600">
                  Get the full song plus exclusive merchandise
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAddToCart}>
                  Buy Song - ${currentSong.price?.toFixed(2) || '0.99'}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowMerchandise(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}