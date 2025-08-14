import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Play, Pause, Upload, Save, RotateCcw, Volume2, Edit3, FileAudio, Music } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import WaveformDisplay from './WaveformDisplay';

interface Song {
  id: number;
  title: string;
  genre?: string;
  secondaryGenres?: string[];
  artistUserId: number;
  albumId?: number;
  mp3Url?: string;
  coverArtUrl?: string;
  isrcCode: string;
  price?: number;
  isFree: boolean;
  durationSeconds?: number;
  previewStartSeconds: number;
  previewDuration: number;
  trackNumber?: number;
  createdAt: string;
}

interface MusicGenre {
  id: number;
  display_name: string;
  description: string;
  is_active: boolean;
}

interface SongEditorProps {
  song: Song;
  isOpen: boolean;
  onClose: () => void;
}

export default function SongEditor({ song, isOpen, onClose }: SongEditorProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const [editedSong, setEditedSong] = useState<Song>(song);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [previewStart, setPreviewStart] = useState(song.previewStartSeconds);
  const [previewDuration, setPreviewDuration] = useState(song.previewDuration);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [selectedSecondaryGenres, setSelectedSecondaryGenres] = useState<string[]>(song.secondaryGenres || []);

  // Query music genres
  const { data: genres = [] } = useQuery<MusicGenre[]>({
    queryKey: ['/api/music-genres'],
    queryFn: () => apiRequest('/api/music-genres').then(res => res.json()).then(data => data.success ? data.data : [])
  });

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration || 0);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  // Update song mutation
  const updateSongMutation = useMutation({
    mutationFn: async (data: Partial<Song>) => {
      const response = await apiRequest(`/api/songs/${song.id}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Song Updated",
        description: "Song details and preview settings saved successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/songs'] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update song",
        variant: "destructive",
      });
    }
  });

  // Reupload song mutation
  const reuploadMutation = useMutation({
    mutationFn: async (file: File) => {
      // Validate same name and ISRC before upload
      if (editedSong.title !== song.title) {
        throw new Error("Song title must remain the same for reupload");
      }
      if (editedSong.isrcCode !== song.isrcCode) {
        throw new Error("ISRC code must remain the same for reupload");
      }

      const formData = new FormData();
      formData.append('audio', file);
      formData.append('songId', song.id.toString());
      formData.append('title', song.title);
      formData.append('isrcCode', song.isrcCode);

      const response = await apiRequest(`/api/songs/${song.id}/reupload`, {
        method: 'POST',
        body: formData
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Song Reuploaded",
        description: "Audio file updated successfully with same title and ISRC",
      });
      setEditedSong(prev => ({ ...prev, mp3Url: data.mp3Url, durationSeconds: data.durationSeconds }));
      setUploadFile(null);
      queryClient.invalidateQueries({ queryKey: ['/api/songs'] });
    },
    onError: (error: any) => {
      toast({
        title: "Reupload Failed",
        description: error.message || "Failed to reupload audio file",
        variant: "destructive",
      });
    }
  });

  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      if (isPreviewMode) {
        // Play preview span only
        audio.currentTime = previewStart;
        audio.play();
        setIsPlaying(true);
        
        // Stop after preview duration
        setTimeout(() => {
          if (audio && !audio.paused) {
            audio.pause();
            setIsPlaying(false);
          }
        }, previewDuration * 1000);
      } else {
        // Play full song
        audio.play();
        setIsPlaying(true);
      }
    }
  };

  const handlePreviewChange = (type: 'start' | 'duration', value: number) => {
    if (type === 'start') {
      setPreviewStart(value);
      // Ensure preview doesn't exceed song duration
      if (value + previewDuration > duration) {
        setPreviewDuration(Math.max(15, duration - value));
      }
    } else {
      setPreviewDuration(value);
    }
  };

  const handleSave = () => {
    const updatedData = {
      title: editedSong.title,
      genre: editedSong.genre,
      secondaryGenres: selectedSecondaryGenres,
      price: editedSong.price,
      isFree: editedSong.isFree,
      previewStartSeconds: previewStart,
      previewDuration: previewDuration,
      isrcCode: editedSong.isrcCode
    };

    updateSongMutation.mutate(updatedData);
  };

  const addSecondaryGenre = (genreId: string) => {
    if (!selectedSecondaryGenres.includes(genreId)) {
      setSelectedSecondaryGenres(prev => [...prev, genreId]);
    }
  };

  const removeSecondaryGenre = (genreId: string) => {
    setSelectedSecondaryGenres(prev => prev.filter(id => id !== genreId));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      setUploadFile(file);
    } else {
      toast({
        title: "Invalid File",
        description: "Please select a valid audio file",
        variant: "destructive",
      });
    }
  };

  const handleReupload = () => {
    if (uploadFile) {
      reuploadMutation.mutate(uploadFile);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="h-5 w-5" />
            Edit Song: {song.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Audio Player */}
          {editedSong.mp3Url && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Volume2 className="h-5 w-5" />
                  Audio Player & Preview Control
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <audio
                  ref={audioRef}
                  src={editedSong.mp3Url}
                  preload="metadata"
                />
                
                <div className="flex items-center gap-4">
                  <Button
                    onClick={handlePlayPause}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    {isPreviewMode ? 'Preview' : 'Full Song'}
                  </Button>
                  
                  <Button
                    onClick={() => setIsPreviewMode(!isPreviewMode)}
                    variant={isPreviewMode ? "default" : "outline"}
                    size="sm"
                  >
                    {isPreviewMode ? 'Preview Mode' : 'Full Mode'}
                  </Button>
                  
                  <div className="text-sm text-gray-600">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="relative h-2 bg-gray-200 rounded">
                    <div
                      className="absolute h-full bg-blue-500 rounded"
                      style={{ width: `${(currentTime / duration) * 100}%` }}
                    />
                    {/* Preview Range Indicator */}
                    <div
                      className="absolute h-full bg-green-500 rounded opacity-50"
                      style={{
                        left: `${(previewStart / duration) * 100}%`,
                        width: `${(previewDuration / duration) * 100}%`
                      }}
                    />
                  </div>
                  <div className="text-xs text-gray-500">
                    Green area shows preview span ({formatTime(previewStart)} - {formatTime(previewStart + previewDuration)})
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Song Details */}
          <Card>
            <CardHeader>
              <CardTitle>Song Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Song Title</Label>
                  <Input
                    id="title"
                    value={editedSong.title}
                    onChange={(e) => setEditedSong(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter song title"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Must remain same for reupload validation
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="isrc">ISRC Code</Label>
                  <Input
                    id="isrc"
                    value={editedSong.isrcCode}
                    onChange={(e) => setEditedSong(prev => ({ ...prev, isrcCode: e.target.value }))}
                    placeholder="e.g., US-ABC-23-12345"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Must remain same for reupload validation
                  </p>
                </div>
              </div>

              {/* Genre Selection */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="primaryGenre">Primary Genre</Label>
                  <Select 
                    value={editedSong.genre || ''} 
                    onValueChange={(value) => setEditedSong(prev => ({ ...prev, genre: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select primary genre" />
                    </SelectTrigger>
                    <SelectContent>
                      {genres.map((genre) => (
                        <SelectItem key={genre.id} value={genre.display_name}>
                          {genre.display_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Secondary Genres</Label>
                  <div className="space-y-2">
                    <Select onValueChange={addSecondaryGenre}>
                      <SelectTrigger>
                        <SelectValue placeholder="Add secondary genre" />
                      </SelectTrigger>
                      <SelectContent>
                        {genres
                          .filter(genre => 
                            genre.display_name !== editedSong.genre && 
                            !selectedSecondaryGenres.includes(genre.display_name)
                          )
                          .map((genre) => (
                            <SelectItem key={genre.id} value={genre.display_name}>
                              {genre.display_name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    
                    {selectedSecondaryGenres.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {selectedSecondaryGenres.map((genreName) => (
                          <div 
                            key={genreName}
                            className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm"
                          >
                            <Music className="h-3 w-3" />
                            {genreName}
                            <button
                              onClick={() => removeSecondaryGenre(genreName)}
                              className="ml-1 text-blue-600 hover:text-blue-800"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={editedSong.price || ''}
                    onChange={(e) => setEditedSong(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.99"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isFree"
                    checked={editedSong.isFree}
                    onChange={(e) => setEditedSong(prev => ({ ...prev, isFree: e.target.checked }))}
                  />
                  <Label htmlFor="isFree">Free Download</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Waveform Preview Editor */}
          {editedSong.mp3Url && (
            <WaveformDisplay
              audioUrl={editedSong.mp3Url}
              previewStart={previewStart}
              previewDuration={previewDuration}
              onPreviewChange={(start, duration) => {
                setPreviewStart(start);
                setPreviewDuration(duration);
              }}
            />
          )}

          {/* Fallback Preview Settings for songs without audio */}
          {!editedSong.mp3Url && (
            <Card>
              <CardHeader>
                <CardTitle>Preview Span Settings</CardTitle>
                <p className="text-sm text-gray-600">
                  Configure which part of the song plays as preview for non-paying users
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Preview Start Time: {formatTime(previewStart)}</Label>
                  <Slider
                    value={[previewStart]}
                    onValueChange={(value) => handlePreviewChange('start', value[0])}
                    max={Math.max(0, duration - 15)}
                    step={1}
                    className="mt-2"
                  />
                </div>
                
                <div>
                  <Label>Preview Duration: {formatTime(previewDuration)}</Label>
                  <Slider
                    value={[previewDuration]}
                    onValueChange={(value) => handlePreviewChange('duration', value[0])}
                    min={15}
                    max={Math.min(60, duration)}
                    step={1}
                    className="mt-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum 15 seconds, maximum 60 seconds
                  </p>
                </div>

                <Button
                  onClick={() => setIsPreviewMode(true)}
                  variant="outline"
                  className="w-full"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Test Preview Span
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Reupload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileAudio className="h-5 w-5" />
                Reupload Audio File
              </CardTitle>
              <p className="text-sm text-gray-600">
                Replace audio file while keeping same title and ISRC code
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="audioFile">Select New Audio File</Label>
                <Input
                  id="audioFile"
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  className="mt-1"
                />
              </div>
              
              {uploadFile && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium">Ready to reupload:</p>
                  <p className="text-sm text-gray-600">{uploadFile.name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Size: {(uploadFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              )}
              
              <Button
                onClick={handleReupload}
                disabled={!uploadFile || reuploadMutation.isPending}
                className="w-full"
              >
                {reuploadMutation.isPending ? (
                  <>Uploading...</>
                ) : (
                  <><Upload className="mr-2 h-4 w-4" /> Reupload Audio File</>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              onClick={handleSave}
              disabled={updateSongMutation.isPending}
              className="flex-1"
            >
              {updateSongMutation.isPending ? (
                <>Saving...</>
              ) : (
                <><Save className="mr-2 h-4 w-4" /> Save Changes</>
              )}
            </Button>
            
            <Button
              onClick={() => {
                setEditedSong(song);
                setPreviewStart(song.previewStartSeconds);
                setPreviewDuration(song.previewDuration);
                setSelectedSecondaryGenres(song.secondaryGenres || []);
                setUploadFile(null);
              }}
              variant="outline"
              className="flex-1"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}