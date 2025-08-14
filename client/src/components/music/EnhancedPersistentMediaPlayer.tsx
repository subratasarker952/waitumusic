import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward, Repeat, Shuffle, ShoppingCart, X, Package, Maximize, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { useMediaPlayer } from '@/contexts/MediaPlayerContext';
import MerchandiseUpsellModal from './MerchandiseUpsellModal';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface MerchandiseItem {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  category: string;
  inStock: boolean;
}

export default function EnhancedPersistentMediaPlayer() {
  const {
    currentSong,
    currentAlbum,
    isVisible,
    isAlbumMode,
    repeatMode,
    shuffleEnabled,
    nextTrack,
    previousTrack,
    toggleShuffle,
    toggleRepeat,
    getMerchandiseForCurrentSong,
    hidePlayer,
  } = useMediaPlayer();

  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [quality, setQuality] = useState<'standard' | 'high' | 'lossless'>('standard');
  const [showMerchandiseModal, setShowMerchandiseModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showWaveform, setShowWaveform] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Determine current media URL based on quality and file type
  const getCurrentMediaUrl = () => {
    if (!currentSong) return '';
    
    // Video takes priority
    if (currentSong.mp4Url) return currentSong.mp4Url;
    
    // Audio quality selection
    switch (quality) {
      case 'lossless':
        return currentSong.flacUrl || currentSong.wavUrl || currentSong.mp3Url || '';
      case 'high':
        return currentSong.wavUrl || currentSong.mp3Url || '';
      default:
        return currentSong.mp3Url || '';
    }
  };

  const isVideo = currentSong?.mp4Url && getCurrentMediaUrl() === currentSong.mp4Url;
  const mediaRef = isVideo ? videoRef : audioRef;

  // Preview mode logic
  useEffect(() => {
    if (currentSong && !currentSong.isFree && !currentSong.isPaid) {
      setIsPreviewMode(true);
    } else {
      setIsPreviewMode(false);
    }
  }, [currentSong]);

  // Auto-advance for album mode after preview duration
  useEffect(() => {
    if (isPlaying && isPreviewMode && isAlbumMode && currentSong) {
      const timer = setTimeout(() => {
        handlePause();
        
        // Show merchandise upsell if available
        const merchandiseIds = getMerchandiseForCurrentSong();
        if (merchandiseIds.length > 0) {
          setShowMerchandiseModal(true);
        }
        
        // Auto-advance to next track after short delay
        setTimeout(() => {
          nextTrack();
        }, 1500);
        
      }, currentSong.previewDuration * 1000);

      return () => clearTimeout(timer);
    }
  }, [isPlaying, isPreviewMode, isAlbumMode, currentSong, nextTrack, getMerchandiseForCurrentSong]);

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async (item: any) => {
      return apiRequest('/api/cart/add', {
        method: 'POST',
        body: { 
          itemId: item.id, 
          itemType: item.itemType || 'song',
          price: item.price 
        },
      });
    },
    onSuccess: () => {
      toast({
        title: "Added to Cart",
        description: "Item successfully added to your cart",
        duration: 3000,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    },
  });

  const handlePlayPause = () => {
    const media = mediaRef.current;
    if (!media || !getCurrentMediaUrl()) return;

    if (isPlaying) {
      handlePause();
    } else {
      if (isPreviewMode && currentSong) {
        media.currentTime = currentSong.previewStartSeconds;
        media.play().then(() => setIsPlaying(true));
      } else {
        media.play().then(() => setIsPlaying(true));
      }
    }
  };

  const handlePause = () => {
    const media = mediaRef.current;
    if (media) {
      media.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    const media = mediaRef.current;
    if (media) {
      setCurrentTime(media.currentTime);
      
      // Enforce preview limits for paid content
      if (isPreviewMode && currentSong) {
        const previewEnd = currentSong.previewStartSeconds + currentSong.previewDuration;
        if (media.currentTime >= previewEnd) {
          media.pause();
          setIsPlaying(false);
          showPurchasePrompt();
        }
      }
    }
  };

  const handleLoadedMetadata = () => {
    const media = mediaRef.current;
    if (media) {
      setDuration(media.duration);
    }
  };

  const handleSeek = (value: number[]) => {
    const media = mediaRef.current;
    if (media && currentSong) {
      const newTime = value[0];
      
      // Restrict seeking for preview mode
      if (isPreviewMode) {
        const maxSeekTime = currentSong.previewStartSeconds + currentSong.previewDuration;
        if (newTime > maxSeekTime) {
          showPurchasePrompt();
          return;
        }
        if (newTime < currentSong.previewStartSeconds) {
          media.currentTime = currentSong.previewStartSeconds;
          return;
        }
      }
      
      media.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    const media = mediaRef.current;
    if (media) {
      media.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const media = mediaRef.current;
    if (media) {
      if (isMuted) {
        media.volume = volume;
        setIsMuted(false);
      } else {
        media.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const toggleFullscreen = () => {
    if (!isVideo) return;
    
    const video = videoRef.current;
    if (video) {
      if (!isFullscreen) {
        video.requestFullscreen().then(() => setIsFullscreen(true));
      } else {
        document.exitFullscreen().then(() => setIsFullscreen(false));
      }
    }
  };

  const showPurchasePrompt = () => {
    if (currentSong) {
      toast({
        title: "🎵 Preview Complete",
        description: `Purchase "${currentSong.title}" to unlock the full ${isVideo ? 'video' : 'audio'}`,
        action: (
          <Button 
            size="sm" 
            onClick={() => handleAddToCart(currentSong)}
            className="ml-2 bg-green-600 hover:bg-green-700"
          >
            <ShoppingCart className="h-3 w-3 mr-1" />
            ${currentSong.price?.toFixed(2) || '0.99'}
          </Button>
        ),
        duration: 8000,
      });
    }
  };

  const handleAddToCart = (item: any) => {
    addToCartMutation.mutate({
      ...item,
      itemType: isVideo ? 'video' : 'song'
    });
  };

  const handleMerchandiseUpsell = (items: MerchandiseItem[]) => {
    items.forEach(item => {
      addToCartMutation.mutate({
        ...item,
        itemType: 'merchandise'
      });
    });
  };

  const handleMerchandiseBundle = (songId: number, merchandiseIds: number[]) => {
    // Add bundle to cart with discount
    addToCartMutation.mutate({
      id: `bundle-${songId}`,
      itemType: 'bundle',
      songId,
      merchandiseIds,
      price: 0 // Price calculated on backend
    });
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

  const cycleQuality = () => {
    setQuality(prev => {
      if (prev === 'standard') return 'high';
      if (prev === 'high') return 'lossless';
      return 'standard';
    });
  };

  if (!isVisible || !currentSong) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg">
      {/* Hidden media elements */}
      <audio
        ref={audioRef}
        src={!isVideo ? getCurrentMediaUrl() : ''}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => {
          setIsPlaying(false);
          if (isAlbumMode) nextTrack();
        }}
        preload="metadata"
      />
      
      {isVideo && (
        <div className="relative">
          <video
            ref={videoRef}
            src={getCurrentMediaUrl()}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => {
              setIsPlaying(false);
              if (isAlbumMode) nextTrack();
            }}
            className="w-full max-h-64 bg-black"
            poster={currentSong.coverArtUrl}
            preload="metadata"
          />
          {isFullscreen && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="absolute top-2 right-2 text-white bg-black/50"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}

      {/* Player Controls */}
      <div className="flex items-center gap-2 p-3">
        {/* Media Info */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {currentSong.coverArtUrl && !isVideo && (
            <img
              src={currentSong.coverArtUrl}
              alt={currentSong.title}
              className="w-12 h-12 rounded object-cover flex-shrink-0"
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
            </div>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-1">
          {/* Album Controls */}
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
                    className={repeatMode !== 'none' ? 'text-purple-600' : ''}
                  >
                    <Repeat className="h-3 w-3" />
                    {repeatMode === 'one' && (
                      <span className="text-xs ml-1">1</span>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Repeat: {repeatMode}</TooltipContent>
              </Tooltip>
            </>
          )}
        </div>

        {/* Progress Bar */}
        <div className="flex-1 max-w-sm">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>{formatTime(currentTime)}</span>
            <Slider
              value={[currentTime]}
              onValueChange={handleSeek}
              max={duration || 100}
              step={1}
              className="flex-1"
            />
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume & Quality Control */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMute}
          >
            {isMuted ? (
              <VolumeX className="h-3 w-3" />
            ) : (
              <Volume2 className="h-3 w-3" />
            )}
          </Button>
          <Slider
            value={[isMuted ? 0 : volume]}
            onValueChange={handleVolumeChange}
            max={1}
            step={0.1}
            className="w-16"
          />
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={cycleQuality}
                className="text-xs"
              >
                {getQualityIcon()}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Quality: {quality}</TooltipContent>
          </Tooltip>
        </div>

        {/* Additional Controls */}
        <div className="flex items-center gap-1">
          {/* Merchandise Button */}
          {getMerchandiseForCurrentSong().length > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMerchandiseModal(true)}
                  className="text-purple-600 animate-pulse hover:animate-none"
                >
                  <Package className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>View Merchandise</TooltipContent>
            </Tooltip>
          )}
          
          {/* Video Fullscreen */}
          {isVideo && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
            >
              <Maximize className="h-3 w-3" />
            </Button>
          )}
          
          {/* Purchase Button */}
          {isPreviewMode && !currentSong.isFree && (
            <Button 
              variant="default" 
              size="sm"
              onClick={() => handleAddToCart(currentSong)}
              className="bg-green-600 hover:bg-green-700 text-white animate-pulse hover:animate-none"
            >
              <ShoppingCart className="h-3 w-3 mr-1" />
              ${currentSong.price?.toFixed(2) || '0.99'}
            </Button>
          )}
          
          {/* Close Player */}
          <Button
            variant="ghost"
            size="sm"
            onClick={hidePlayer}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Merchandise Upsell Modal */}
      <MerchandiseUpsellModal
        isOpen={showMerchandiseModal}
        onClose={() => setShowMerchandiseModal(false)}
        merchandiseIds={getMerchandiseForCurrentSong()}
        currentSongTitle={currentSong.title}
        currentAlbumTitle={currentAlbum?.title}
        onAddToCart={handleMerchandiseUpsell}
        onAddBundle={handleMerchandiseBundle}
      />
    </div>
  );
}