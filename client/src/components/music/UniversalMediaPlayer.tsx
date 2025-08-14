import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward, Repeat, Shuffle, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';

interface MediaFile {
  id: number;
  title: string;
  artistName: string;
  url: string;
  fileType: 'audio' | 'video' | 'document';
  price?: number;
  isFree: boolean;
  previewStartSeconds: number;
  previewDuration: number;
  coverArtUrl?: string;
  merchandiseIds?: number[];
}

interface UniversalMediaPlayerProps {
  mediaFile: MediaFile | null;
  playlist?: MediaFile[];
  isAlbumMode?: boolean;
  onNext?: () => void;
  onPrevious?: () => void;
  onAddToCart?: (item: MediaFile) => void;
  onMerchandiseUpsell?: (merchandiseIds: number[]) => void;
  className?: string;
}

export default function UniversalMediaPlayer({
  mediaFile,
  playlist = [],
  isAlbumMode = false,
  onNext,
  onPrevious,
  onAddToCart,
  onMerchandiseUpsell,
  className = ''
}: UniversalMediaPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [quality, setQuality] = useState<'standard' | 'high' | 'lossless'>('standard');
  const { toast } = useToast();

  // Determine media type and appropriate ref
  const isVideo = mediaFile?.fileType === 'video';
  const isAudio = mediaFile?.fileType === 'audio';
  const mediaRef = isVideo ? videoRef : audioRef;

  // Preview mode logic
  useEffect(() => {
    if (mediaFile && !mediaFile.isFree) {
      setIsPreviewMode(true);
    } else {
      setIsPreviewMode(false);
    }
  }, [mediaFile]);

  // Auto-advance for album mode after preview duration
  useEffect(() => {
    if (isPlaying && isPreviewMode && isAlbumMode && mediaFile) {
      const timer = setTimeout(() => {
        handlePause();
        if (onNext) {
          onNext();
        }
        
        // Show merchandise upsell if available
        if (mediaFile.merchandiseIds?.length && onMerchandiseUpsell) {
          onMerchandiseUpsell(mediaFile.merchandiseIds);
        }
      }, mediaFile.previewDuration * 1000);

      return () => clearTimeout(timer);
    }
  }, [isPlaying, isPreviewMode, isAlbumMode, mediaFile, onNext, onMerchandiseUpsell]);

  const handlePlayPause = () => {
    const media = mediaRef.current;
    if (!media || !mediaFile?.url) return;

    if (isPlaying) {
      handlePause();
    } else {
      if (isPreviewMode && mediaFile) {
        // Start from preview position
        media.currentTime = mediaFile.previewStartSeconds;
        media.play();
        setIsPlaying(true);
      } else {
        // Play full content
        media.play();
        setIsPlaying(true);
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
      if (isPreviewMode && mediaFile) {
        const previewEnd = mediaFile.previewStartSeconds + mediaFile.previewDuration;
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
    if (media && mediaFile) {
      const newTime = value[0];
      
      // Restrict seeking for preview mode
      if (isPreviewMode) {
        const maxSeekTime = mediaFile.previewStartSeconds + mediaFile.previewDuration;
        if (newTime > maxSeekTime) {
          showPurchasePrompt();
          return;
        }
        if (newTime < mediaFile.previewStartSeconds) {
          media.currentTime = mediaFile.previewStartSeconds;
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
        video.requestFullscreen();
        setIsFullscreen(true);
      } else {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const showPurchasePrompt = () => {
    if (mediaFile && onAddToCart) {
      toast({
        title: "🎵 Preview Complete",
        description: `Purchase "${mediaFile.title}" to unlock the full ${mediaFile.fileType}`,
        action: (
          <Button 
            size="sm" 
            onClick={() => onAddToCart(mediaFile)}
            className="ml-2 bg-green-600 hover:bg-green-700"
          >
            <ShoppingCart className="h-3 w-3 mr-1" />
            ${mediaFile.price?.toFixed(2) || '0.99'}
          </Button>
        ),
        duration: 8000,
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!mediaFile) {
    return null;
  }

  return (
    <div className={`universal-media-player ${className}`}>
      {/* Hidden audio/video elements */}
      {isAudio && (
        <audio
          ref={audioRef}
          src={mediaFile.url}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handlePause}
          preload="metadata"
        />
      )}
      
      {isVideo && (
        <video
          ref={videoRef}
          src={mediaFile.url}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handlePause}
          className="w-full max-h-96 bg-black rounded-lg"
          poster={mediaFile.coverArtUrl}
          preload="metadata"
        />
      )}

      {/* Player Controls */}
      <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        {/* Media Info */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {mediaFile.coverArtUrl && (
            <img
              src={mediaFile.coverArtUrl}
              alt={mediaFile.title}
              className="w-12 h-12 rounded object-cover flex-shrink-0"
            />
          )}
          <div className="min-w-0 flex-1">
            <div className="font-medium text-sm truncate">
              {mediaFile.title}
              {isPreviewMode && !mediaFile.isFree && (
                <span className="ml-2 px-1 py-0.5 bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-700 text-xs rounded border border-orange-200">
                  🎵 Preview - ${mediaFile.price?.toFixed(2) || '0.99'}
                </span>
              )}
            </div>
            <div className="text-xs text-gray-500 truncate">
              {mediaFile.artistName}
            </div>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          {isAlbumMode && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onPrevious}
              disabled={!onPrevious}
            >
              <SkipBack className="h-4 w-4" />
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePlayPause}
            className="w-10 h-10"
          >
            {isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5" />
            )}
          </Button>
          
          {isAlbumMode && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onNext}
              disabled={!onNext}
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="flex-1 max-w-md">
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

        {/* Volume Control */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMute}
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
          <Slider
            value={[isMuted ? 0 : volume]}
            onValueChange={handleVolumeChange}
            max={1}
            step={0.1}
            className="w-20"
          />
        </div>

        {/* Additional Controls */}
        <div className="flex items-center gap-1">
          {isVideo && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
            >
              <Maximize className="h-4 w-4" />
            </Button>
          )}
          
          {/* Purchase Button for Paid Content */}
          {isPreviewMode && !mediaFile.isFree && onAddToCart && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={() => onAddToCart(mediaFile)}
                  className="bg-green-600 hover:bg-green-700 text-white animate-pulse hover:animate-none"
                >
                  <ShoppingCart className="h-4 w-4 mr-1" />
                  ${mediaFile.price?.toFixed(2) || '0.99'}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Purchase full {mediaFile.fileType} to unlock complete access
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </div>
  );
}