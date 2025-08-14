import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Music, 
  Plus, 
  Youtube, 
  Upload,
  Save,
  Guitar,
  Clock,
  RefreshCw
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { SortableSetlistItem } from './SortableSetlistItem';

interface SetlistSong {
  id: string;
  title: string;
  artist: string;
  duration: number;
  key?: string;
  tempo?: number;
  youtubeUrl?: string;
  youtubeId?: string;
  isrcCode?: string;
  audioFileUrl?: string;
  chordCharts: {
    [instrument: string]: {
      chords: string[];
      progression: string;
      capo?: number;
      tuning?: string;
      difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    };
  };
  separatedTracks?: {
    vocals?: string;
    drums?: string;
    bass?: string;
    guitar?: string;
    piano?: string;
    other?: string;
  };
  order: number;
}

interface BandMember {
  id: string;
  name: string;
  selectedInstrument: string;
  instruments: string[];
  roleId: number;
}

interface SetlistDesignerProps {
  bookingId: number;
  bandMembers: BandMember[];
  onSetlistSave?: (setlist: SetlistSong[]) => void;
  canEdit?: boolean;
  userRole?: string;
}

export const SetlistDesigner: React.FC<SetlistDesignerProps> = ({
  bookingId,
  bandMembers,
  onSetlistSave,
  canEdit = true,
  userRole = 'user'
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [setlist, setSetlist] = useState<SetlistSong[]>([]);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [audioPlayer, setAudioPlayer] = useState<HTMLAudioElement | null>(null);
  const [newSongTitle, setNewSongTitle] = useState('');
  const [newSongArtist, setNewSongArtist] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isGeneratingChords, setIsGeneratingChords] = useState(false);

  // Fetch existing setlist
  const { data: existingSetlist } = useQuery({
    queryKey: ['/api/bookings', bookingId, 'setlist'],
    enabled: !!bookingId
  });

  // Fetch media hub songs
  const { data: mediaHubSongs = [] } = useQuery({
    queryKey: ['/api/media-hub', 'songs', bookingId]
  });

  useEffect(() => {
    if (existingSetlist) {
      setSetlist((existingSetlist as any).setlist || []);
    }
  }, [existingSetlist]);

  // Calculate total duration
  const totalDuration = setlist.reduce((total, song) => total + song.duration, 0);

  // Helper function to format duration
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Generate chord charts for all instruments
  const generateChordCharts = async (songData: Partial<SetlistSong>) => {
    setIsGeneratingChords(true);
    try {
      const chordCharts: { [instrument: string]: any } = {};
      
      for (const member of bandMembers) {
        const instrument = member.selectedInstrument;
        const response = await apiRequest('/api/chords/generate', {
          method: 'POST',
          body: {
            songTitle: songData.title,
            artist: songData.artist,
            instrument,
            key: songData.key,
            tempo: songData.tempo
          }
        });
        
        chordCharts[instrument] = {
          chords: response.chords || [],
          progression: response.progression || '',
          capo: response.capo || 0,
          tuning: response.tuning || 'Standard',
          difficulty: response.difficulty || 'Intermediate'
        };
      }
      
      return chordCharts;
    } catch (error) {
      console.error('Chord generation error:', error);
      toast({
        title: "Chord Generation Failed",
        description: "Using basic progressions.",
        variant: "destructive"
      });
      
      // Fallback basic chord charts
      const fallbackCharts: { [instrument: string]: any } = {};
      bandMembers.forEach(member => {
        fallbackCharts[member.selectedInstrument] = {
          chords: ['C', 'Am', 'F', 'G'],
          progression: 'I-vi-IV-V',
          capo: 0,
          tuning: 'Standard',
          difficulty: 'Beginner'
        };
      });
      return fallbackCharts;
    } finally {
      setIsGeneratingChords(false);
    }
  };

  // Add song from YouTube
  const addFromYouTube = async () => {
    if (!youtubeUrl.trim()) return;
    
    const youtubeId = extractYouTubeId(youtubeUrl);
    if (!youtubeId) {
      toast({
        title: "Invalid YouTube URL",
        description: "Please provide a valid YouTube video URL",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await apiRequest('/api/youtube/video-info', {
        method: 'POST',
        body: { youtubeId }
      });
      
      const songData: Partial<SetlistSong> = {
        title: response.title || 'Unknown Title',
        artist: response.channelTitle || 'Unknown Artist',
        duration: response.duration || 180,
        youtubeUrl: youtubeUrl,
        youtubeId: youtubeId,
        key: response.detectedKey,
        tempo: response.detectedTempo
      };

      const chordCharts = await generateChordCharts(songData);
      
      const newSong: SetlistSong = {
        ...songData,
        id: `yt-${youtubeId}-${Date.now()}`,
        title: songData.title || 'Unknown Title',
        artist: songData.artist || 'Unknown Artist',
        duration: songData.duration || 180,
        chordCharts,
        order: setlist.length + 1
      };
      
      setSetlist(prev => [...prev, newSong]);
      setYoutubeUrl('');
      
      toast({
        title: "Song Added from YouTube",
        description: `${newSong.title} added with chord charts`
      });
    } catch (error) {
      console.error('YouTube song add error:', error);
      toast({
        title: "YouTube Integration Error",
        description: "Unable to fetch song from YouTube",
        variant: "destructive"
      });
    }
  };

  // Add song manually
  const addManualSong = async () => {
    if (!newSongTitle.trim() || !newSongArtist.trim()) return;
    
    const songData: Partial<SetlistSong> = {
      title: newSongTitle,
      artist: newSongArtist,
      duration: 180
    };

    const chordCharts = await generateChordCharts(songData);
    
    const newSong: SetlistSong = {
      ...songData,
      id: `manual-${Date.now()}`,
      title: songData.title || '',
      artist: songData.artist || '',
      duration: songData.duration || 180,
      chordCharts,
      order: setlist.length + 1
    };
    
    setSetlist(prev => [...prev, newSong]);
    setNewSongTitle('');
    setNewSongArtist('');
    
    toast({
      title: "Song Added Manually",
      description: `${newSong.title} added with chord charts`
    });
  };

  // Add song from media hub
  const addFromMediaHub = async (mediaSong: any) => {
    const songData: Partial<SetlistSong> = {
      title: mediaSong.title,
      artist: mediaSong.artist || 'Unknown Artist',
      duration: mediaSong.duration || 180,
      audioFileUrl: mediaSong.audioUrl,
      isrcCode: mediaSong.isrcCode
    };

    const chordCharts = await generateChordCharts(songData);
    
    const newSong: SetlistSong = {
      ...songData,
      id: `media-${mediaSong.id}-${Date.now()}`,
      title: songData.title || '',
      artist: songData.artist || '',
      duration: songData.duration || 180,
      chordCharts,
      order: setlist.length + 1
    };
    
    setSetlist(prev => [...prev, newSong]);
    
    toast({
      title: "Song Added from Media Hub",
      description: `${newSong.title} added with chord charts`
    });
  };

  // Separate audio tracks using Spleeter
  const separateAudioTracks = async (song: SetlistSong) => {
    try {
      const response = await apiRequest('/api/spleeter/separate', {
        method: 'POST',
        body: {
          songId: song.id,
          audioUrl: song.audioFileUrl,
          youtubeId: song.youtubeId
        }
      });
      
      // Update song with separated tracks
      setSetlist(prev => prev.map(s => 
        s.id === song.id 
          ? { ...s, separatedTracks: response.tracks }
          : s
      ));
      
      toast({
        title: "Tracks Separated",
        description: "Audio tracks separated for DJ use"
      });
    } catch (error) {
      console.error('Track separation error:', error);
      toast({
        title: "Separation Failed",
        description: "Unable to separate audio tracks",
        variant: "destructive"
      });
    }
  };

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Drag and drop reordering
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setSetlist((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);

        const reorderedItems = arrayMove(items, oldIndex, newIndex);
        
        return reorderedItems.map((song, index) => ({
          ...song,
          order: index + 1
        }));
      });
    }
  };

  // Save setlist
  const saveSetlist = useMutation({
    mutationFn: async (setlistData: SetlistSong[]) => {
      return apiRequest(`/api/bookings/${bookingId}/setlist`, {
        method: 'POST',
        body: { setlist: setlistData }
      });
    },
    onSuccess: () => {
      toast({
        title: "Setlist Saved",
        description: "Setlist with chord charts saved successfully"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/bookings', bookingId, 'setlist'] });
      onSetlistSave?.(setlist);
    },
    onError: (error) => {
      console.error('Save setlist error:', error);
      toast({
        title: "Save Failed",
        description: "Unable to save setlist",
        variant: "destructive"
      });
    }
  });

  // Play audio
  const playAudio = (song: SetlistSong, trackType?: string) => {
    const audioUrl = trackType && song.separatedTracks 
      ? song.separatedTracks[trackType as keyof typeof song.separatedTracks]
      : song.audioFileUrl;
      
    if (!audioUrl) {
      toast({
        title: "No Audio Available",
        description: "This song doesn't have an audio file",
        variant: "destructive"
      });
      return;
    }

    if (audioPlayer) {
      audioPlayer.pause();
    }

    const audio = new Audio(audioUrl);
    audio.play();
    setAudioPlayer(audio);
    setIsPlaying(song.id + (trackType || ''));
    
    audio.onended = () => {
      setIsPlaying(null);
      setAudioPlayer(null);
    };
  };

  const stopAudio = () => {
    if (audioPlayer) {
      audioPlayer.pause();
      setAudioPlayer(null);
      setIsPlaying(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Music className="h-6 w-6" />
            Setlist Designer
          </h2>
          <p className="text-muted-foreground">
            Create setlists with automatic chord generation and track separation
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDuration(totalDuration)}
          </Badge>
          <Badge variant="outline">
            {setlist.length} songs
          </Badge>
        </div>
      </div>

      {/* Add Song Options */}
      {canEdit && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* YouTube Integration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Youtube className="h-4 w-4 text-red-500" />
                Add from YouTube
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder="YouTube video URL"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
              />
              <Button 
                onClick={addFromYouTube} 
                className="w-full" 
                size="sm"
                disabled={!youtubeUrl.trim() || isGeneratingChords}
              >
                <Plus className="h-3 w-3 mr-1" />
                {isGeneratingChords ? 'Generating...' : 'Add Song'}
              </Button>
            </CardContent>
          </Card>

          {/* Manual Song Entry */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Music className="h-4 w-4" />
                Add Manually
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder="Song title"
                value={newSongTitle}
                onChange={(e) => setNewSongTitle(e.target.value)}
              />
              <Input
                placeholder="Artist name"
                value={newSongArtist}
                onChange={(e) => setNewSongArtist(e.target.value)}
              />
              <Button 
                onClick={addManualSong} 
                className="w-full" 
                size="sm"
                disabled={!newSongTitle.trim() || !newSongArtist.trim() || isGeneratingChords}
              >
                <Plus className="h-3 w-3 mr-1" />
                {isGeneratingChords ? 'Generating...' : 'Add Song'}
              </Button>
            </CardContent>
          </Card>

          {/* Media Hub Songs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Upload className="h-4 w-4" />
                From Media Hub
              </CardTitle>
            </CardHeader>
            <CardContent>
              {Array.isArray(mediaHubSongs) && mediaHubSongs.length > 0 ? (
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {mediaHubSongs.map((song: any) => (
                    <div key={song.id} className="flex items-center justify-between text-xs">
                      <span className="truncate flex-1">{song.title}</span>
                      <Button 
                        onClick={() => addFromMediaHub(song)} 
                        size="sm" 
                        variant="ghost"
                        disabled={isGeneratingChords}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No uploaded songs available</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Band Members Display */}
      {bandMembers && bandMembers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Guitar className="h-4 w-4" />
              Band Members & Instruments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {bandMembers.map((member) => (
                <div key={member.id} className="text-xs space-y-1">
                  <div className="font-medium">{member.name}</div>
                  <Badge variant="outline" className="text-xs">
                    {member.selectedInstrument}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chord Generation Status */}
      {isGeneratingChords && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <RefreshCw className="h-4 w-4 animate-spin text-primary" />
              <div>
                <p className="font-medium text-primary">Generating Chord Charts</p>
                <p className="text-sm text-muted-foreground">
                  Creating chord progressions for all band member instruments...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Setlist */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Setlist ({setlist.length} songs)
          </CardTitle>
          {canEdit && setlist.length > 0 && (
            <Button 
              onClick={() => saveSetlist.mutate(setlist)}
              disabled={saveSetlist.isPending}
              size="sm"
            >
              <Save className="h-4 w-4 mr-1" />
              {saveSetlist.isPending ? 'Saving...' : 'Save Setlist'}
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {setlist.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No songs in setlist yet</p>
              <p className="text-sm">Add songs using the options above</p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={setlist.map(song => song.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-3">
                  {setlist.map((song) => (
                    <SortableSetlistItem
                      key={song.id}
                      song={song}
                      isPlaying={isPlaying}
                      userRole={userRole}
                      canEdit={canEdit}
                      formatDuration={formatDuration}
                      playAudio={() => playAudio(song)}
                      stopAudio={stopAudio}
                      separateTracks={() => separateAudioTracks(song)}
                      removeSong={() => {
                        setSetlist(prev => prev.filter(s => s.id !== song.id));
                      }}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Helper function to extract YouTube video ID
function extractYouTubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export default SetlistDesigner;