import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Play, Pause, Volume2, Settings } from 'lucide-react';

interface WaveformDisplayProps {
  audioUrl: string;
  previewStart: number;
  previewDuration: number;
  onPreviewChange: (start: number, duration: number) => void;
  className?: string;
}

export default function WaveformDisplay({
  audioUrl,
  previewStart,
  previewDuration,
  onPreviewChange,
  className = ''
}: WaveformDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragType, setDragType] = useState<'start' | 'end' | 'move' | null>(null);

  // Generate waveform data from audio
  useEffect(() => {
    if (!audioUrl) return;

    const generateWaveform = async () => {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const response = await fetch(audioUrl);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        const rawData = audioBuffer.getChannelData(0);
        const samples = 300; // Number of samples for waveform
        const blockSize = Math.floor(rawData.length / samples);
        const filteredData = [];
        
        for (let i = 0; i < samples; i++) {
          let blockStart = blockSize * i;
          let sum = 0;
          for (let j = 0; j < blockSize; j++) {
            sum += Math.abs(rawData[blockStart + j]);
          }
          filteredData.push(sum / blockSize);
        }
        
        // Normalize the data
        const maxValue = Math.max(...filteredData);
        const normalizedData = filteredData.map(value => value / maxValue);
        setWaveformData(normalizedData);
        
        audioContext.close();
      } catch (error) {
        console.error('Error generating waveform:', error);
        // Generate fallback waveform
        const fallbackData = Array.from({ length: 300 }, () => Math.random() * 0.8 + 0.1);
        setWaveformData(fallbackData);
      }
    };

    generateWaveform();
  }, [audioUrl]);

  // Draw waveform on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || waveformData.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    // Draw waveform
    const barWidth = width / waveformData.length;
    waveformData.forEach((value, index) => {
      const barHeight = value * height * 0.8;
      const x = index * barWidth;
      const y = (height - barHeight) / 2;

      // Color based on position
      const position = (index / waveformData.length) * duration;
      let color = '#e5e7eb'; // Default gray

      if (position >= previewStart && position <= previewStart + previewDuration) {
        color = '#10b981'; // Green for preview range
      }
      if (position <= currentTime) {
        color = position >= previewStart && position <= previewStart + previewDuration 
          ? '#059669' // Darker green for played preview
          : '#3b82f6'; // Blue for played
      }

      ctx.fillStyle = color;
      ctx.fillRect(x, y, barWidth - 1, barHeight);
    });

    // Draw preview range boundaries
    const previewStartX = (previewStart / duration) * width;
    const previewEndX = ((previewStart + previewDuration) / duration) * width;

    // Preview start line
    ctx.strokeStyle = '#16a34a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(previewStartX, 0);
    ctx.lineTo(previewStartX, height);
    ctx.stroke();

    // Preview end line
    ctx.beginPath();
    ctx.moveTo(previewEndX, 0);
    ctx.lineTo(previewEndX, height);
    ctx.stroke();

    // Current time indicator
    const currentTimeX = (currentTime / duration) * width;
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(currentTimeX, 0);
    ctx.lineTo(currentTimeX, height);
    ctx.stroke();

  }, [waveformData, currentTime, duration, previewStart, previewDuration]);

  // Handle canvas click for seeking and preview adjustment
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || duration === 0) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const clickTime = (x / canvas.width) * duration;

    // If clicking near preview boundaries (within 10px), start dragging
    const previewStartX = (previewStart / duration) * canvas.width;
    const previewEndX = ((previewStart + previewDuration) / duration) * canvas.width;

    if (Math.abs(x - previewStartX) < 10) {
      setIsDragging(true);
      setDragType('start');
    } else if (Math.abs(x - previewEndX) < 10) {
      setIsDragging(true);
      setDragType('end');
    } else if (x > previewStartX && x < previewEndX) {
      setIsDragging(true);
      setDragType('move');
    } else {
      // Seek to clicked position
      if (audioRef.current) {
        audioRef.current.currentTime = clickTime;
        setCurrentTime(clickTime);
      }
    }
  };

  // Handle mouse move for dragging
  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !canvasRef.current || duration === 0) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const newTime = (x / canvasRef.current.width) * duration;

    if (dragType === 'start') {
      const maxStart = Math.max(0, Math.min(newTime, previewStart + previewDuration - 5));
      onPreviewChange(maxStart, previewDuration);
    } else if (dragType === 'end') {
      const maxDuration = Math.min(60, Math.max(5, newTime - previewStart));
      onPreviewChange(previewStart, maxDuration);
    } else if (dragType === 'move') {
      const offset = newTime - (previewStart + previewDuration / 2);
      const newStart = Math.max(0, Math.min(previewStart + offset, duration - previewDuration));
      onPreviewChange(newStart, previewDuration);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragType(null);
  };

  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.currentTime = previewStart;
      audio.play();
      setIsPlaying(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="h-5 w-5" />
          Waveform & Preview Editor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={() => {
            if (audioRef.current) {
              setCurrentTime(audioRef.current.currentTime);
              // Auto-pause at preview end
              if (audioRef.current.currentTime >= previewStart + previewDuration) {
                audioRef.current.pause();
                setIsPlaying(false);
              }
            }
          }}
          onLoadedMetadata={() => {
            if (audioRef.current) {
              setDuration(audioRef.current.duration);
            }
          }}
          onEnded={() => setIsPlaying(false)}
        />

        {/* Waveform Canvas */}
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={600}
            height={120}
            className="w-full h-30 border rounded cursor-pointer"
            onClick={handleCanvasClick}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
          
          {/* Waveform Legend */}
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0:00</span>
            <span className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                Preview Range
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                Current Position
              </span>
            </span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <Button
            onClick={handlePlayPause}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            Preview
          </Button>
          
          <div className="text-sm text-gray-600">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>

          <div className="text-sm text-green-600">
            Preview: {formatTime(previewStart)} - {formatTime(previewStart + previewDuration)}
          </div>
        </div>

        {/* Precision Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Preview Start Time</Label>
            <div className="flex items-center gap-2">
              <Slider
                value={[previewStart]}
                onValueChange={([value]) => onPreviewChange(value, previewDuration)}
                max={Math.max(0, duration - 5)}
                step={0.1}
                className="flex-1"
              />
              <span className="text-sm font-mono w-12">
                {formatTime(previewStart)}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Preview Duration</Label>
            <div className="flex items-center gap-2">
              <Slider
                value={[previewDuration]}
                onValueChange={([value]) => onPreviewChange(previewStart, value)}
                min={5}
                max={60}
                step={1}
                className="flex-1"
              />
              <span className="text-sm font-mono w-12">
                {previewDuration}s
              </span>
            </div>
          </div>
        </div>

        {/* Preview Instructions */}
        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
          <strong>Instructions:</strong> Click on waveform to seek. Drag green lines to adjust preview range. 
          Click inside preview area to move entire range. Preview range: {formatTime(previewStart)} to {formatTime(previewStart + previewDuration)} 
          ({previewDuration} seconds)
        </div>
      </CardContent>
    </Card>
  );
}