import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Save, Music, Search, Plus, Trash2, Clock, Zap, Youtube, Brain, Upload, Library, Users } from 'lucide-react';

interface SetlistSong {
  id: string;
  title: string;
  artist: string;
  duration: number; // in seconds
  key: string;
  bpm: number;
  energy: 'low' | 'medium' | 'high';
  assignedTo?: string;
  talentRole?: string;
  notes: string;
  youtubeUrl?: string;
  chordChart?: string;
  source?: 'youtube' | 'coded' | 'custom';
  isCustomUpload?: boolean;
  codedBy?: string;
  isrcCode?: string;
  audioFile?: File;
}

interface CodedSong {
  id: string;
  title: string;
  artist: string;
  duration: number;
  codedBy: string;
  codedByRole: string;
  isrcCode?: string;
}

interface AssignedTalent {
  id: number;
  name: string;
  role: string;
  instruments?: string[];
  specialization?: string;
}

interface EventDetails {
  eventName?: string;
  eventType?: string;
  audienceType?: string;
  duration?: number;
  venueName?: string;
}

interface EnhancedSetlistSectionProps {
  bookingId?: number;
  assignedTalent?: AssignedTalent[];
  eventDetails?: EventDetails;
  onSave?: (data: any) => void;
}

export default function EnhancedSetlistSection({
  bookingId,
  assignedTalent = [],
  eventDetails,
  onSave
}: EnhancedSetlistSectionProps) {
  const { toast } = useToast();
  const [setlistSongs, setSetlistSongs] = useState<SetlistSong[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedSong, setSelectedSong] = useState<SetlistSong | null>(null);
  const [setlistName, setSetlistName] = useState('');
  const [showOptimization, setShowOptimization] = useState(false);
  const [codedSongs, setCodedSongs] = useState<CodedSong[]>([]);
  const [activeTab, setActiveTab] = useState<'search' | 'coded' | 'custom'>('search');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (eventDetails?.eventName) {
      setSetlistName(`${eventDetails.eventName} Setlist`);
    }
    // Load coded songs when component mounts
    loadCodedSongs();
  }, [eventDetails]);

  // Load coded songs from system - prioritizing main booked talent
  const loadCodedSongs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/coded-songs', {
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });
      if (response.ok) {
        const songs = await response.json();
        // Sort by priority: main booked talent first, then managed artists, then managed musicians
        const sortedSongs = songs.sort((a: CodedSong, b: CodedSong) => {
          const aIsMainTalent = assignedTalent.some(t => t.name === a.codedBy && t.role.includes('main'));
          const bIsMainTalent = assignedTalent.some(t => t.name === b.codedBy && t.role.includes('main'));
          const aIsManaged = a.codedByRole.includes('managed');
          const bIsManaged = b.codedByRole.includes('managed');
          
          if (aIsMainTalent && !bIsMainTalent) return -1;
          if (!aIsMainTalent && bIsMainTalent) return 1;
          if (aIsManaged && !bIsManaged) return -1;
          if (!aIsManaged && bIsManaged) return 1;
          return 0;
        });
        setCodedSongs(sortedSongs);
      }
    } catch (error) {
      console.error('Failed to load coded songs:', error);
    }
  };

  const searchYoutube = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await fetch(`/api/youtube/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery, maxResults: 10 })
      });
      
      if (response.ok) {
        const results = await response.json();
        setSearchResults(results.items || []);
      } else {
        toast({
          title: "Search Failed",
          description: "Unable to search YouTube. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Search Error",
        description: "YouTube search service unavailable",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const addSongFromSearch = async (result: any) => {
    const metadata = {
      title: result.snippet.title,
      artist: result.snippet.channelTitle,
      duration: 180, // Default duration
      key: 'C',
      bpm: 120,
      energy: 'medium' as const
    };

    const newSong: SetlistSong = {
      id: Date.now().toString(),
      title: metadata.title,
      artist: metadata.artist,
      duration: metadata.duration,
      key: metadata.key,
      bpm: metadata.bpm,
      energy: metadata.energy,
      notes: '',
      youtubeUrl: `https://www.youtube.com/watch?v=${result.id.videoId}`,
      source: 'youtube'
    };

    setSetlistSongs(prev => [...prev, newSong]);
    setSearchResults([]);
    setSearchQuery('');
  };

  const addCodedSong = (codedSong: CodedSong) => {
    const newSong: SetlistSong = {
      id: Date.now().toString(),
      title: codedSong.title,
      artist: codedSong.artist,
      duration: codedSong.duration,
      key: 'C', // Default, can be edited
      bpm: 120, // Default, can be edited
      energy: 'medium',
      notes: '',
      source: 'coded',
      codedBy: codedSong.codedBy,
      isrcCode: codedSong.isrcCode
    };

    setSetlistSongs(prev => [...prev, newSong]);
  };

  const removeSong = (songId: string) => {
    setSetlistSongs(prev => prev.filter(song => song.id !== songId));
    if (selectedSong?.id === songId) {
      setSelectedSong(null);
    }
  };

  const optimizeSetlist = () => {
    setShowOptimization(true);
    // Simple optimization: arrange by energy flow (start medium, build to high, end medium)
    setTimeout(() => {
      const optimized = [...setlistSongs].sort((a, b) => {
        const energyOrder = { medium: 1, high: 2, low: 3 };
        return energyOrder[a.energy] - energyOrder[b.energy];
      });
      setSetlistSongs(optimized);
      setShowOptimization(false);
      toast({
        title: "Setlist Optimized",
        description: "Songs arranged for optimal energy flow"
      });
    }, 2000);
  };

  const saveSetlist = async () => {
    try {
      const setlistData = {
        name: setlistName,
        songs: setlistSongs,
        bookingId,
        totalDuration: setlistSongs.reduce((sum, song) => sum + song.duration, 0),
        assignedTalent,
        generatedAt: new Date().toISOString()
      };

      if (bookingId) {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/bookings/${bookingId}/setlist`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
          },
          body: JSON.stringify({ setlist: setlistData })
        });

        if (response.ok) {
          toast({
            title: "Setlist Saved",
            description: "Performance setlist saved successfully"
          });
          onSave?.(setlistData);
        } else {
          throw new Error('Failed to save setlist');
        }
      } else {
        onSave?.(setlistData);
        toast({
          title: "Setlist Ready",
          description: "Setlist data prepared for technical rider"
        });
      }
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Could not save setlist. Please try again.",
        variant: "destructive"
      });
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getEnergyColor = (energy: 'low' | 'medium' | 'high') => {
    switch (energy) {
      case 'low': return 'bg-blue-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Current Setlist */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Music className="h-5 w-5" />
                  Performance Setlist
                </CardTitle>
                <Input
                  value={setlistName}
                  onChange={(e) => setSetlistName(e.target.value)}
                  placeholder="Setlist name..."
                  className="mt-2 h-8"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={optimizeSetlist}
                  disabled={setlistSongs.length === 0 || showOptimization}
                >
                  <Brain className="h-4 w-4 mr-1" />
                  {showOptimization ? 'Optimizing...' : 'Smart Optimize'}
                </Button>
                <Badge variant="outline">
                  {setlistSongs.filter(song => song.assignedTo).length} Assigned
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {setlistSongs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No songs in setlist yet</p>
                  <p className="text-sm">Search YouTube or add coded songs to get started</p>
                </div>
              ) : (
                setlistSongs.map((song, index) => (
                  <div
                    key={song.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      selectedSong?.id === song.id 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => setSelectedSong(song)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{index + 1}.</span>
                          <div>
                            <div className="font-medium">{song.title}</div>
                            <div className="text-sm text-muted-foreground">{song.artist}</div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm text-muted-foreground">
                          {formatDuration(song.duration)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Badge variant="outline" className="text-xs">
                            {song.key}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {song.bpm} BPM
                          </Badge>
                          <div 
                            className={`w-3 h-3 rounded-full ${getEnergyColor(song.energy)}`}
                            title={`${song.energy} energy`}
                          />
                        </div>
                        {song.assignedTo && (
                          <Badge variant="secondary" className="text-xs">
                            {song.assignedTo}
                          </Badge>
                        )}
                        {song.youtubeUrl && (
                          <Youtube className="h-4 w-4 text-red-500" />
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeSong(song.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Total Songs: {setlistSongs.length}</span>
                <span>Total Duration: {formatDuration(setlistSongs.reduce((sum, song) => sum + song.duration, 0))}</span>
              </div>
              <Button onClick={saveSetlist} className="w-full mt-2" disabled={setlistSongs.length === 0}>
                <Save className="h-4 w-4 mr-2" />
                Save to Technical Rider
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls Panel */}
      <div className="space-y-6">
        {/* Song Sources */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Add Songs</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'search' | 'coded' | 'custom')} className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="search" className="text-xs">🔍 YouTube</TabsTrigger>
                <TabsTrigger value="coded" className="text-xs">🎵 Coded</TabsTrigger>
                <TabsTrigger value="custom" className="text-xs">📁 Upload</TabsTrigger>
              </TabsList>

              <TabsContent value="search" className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search songs..."
                    className="h-8"
                    onKeyPress={(e) => e.key === 'Enter' && searchYoutube()}
                  />
                  <Button
                    onClick={searchYoutube}
                    disabled={isSearching || !searchQuery.trim()}
                    size="sm"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>

                {isSearching && (
                  <div className="text-center py-4">
                    <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
                    <p className="text-sm text-muted-foreground mt-2">Searching YouTube...</p>
                  </div>
                )}

                {searchResults.length > 0 && (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {searchResults.map((result, index) => (
                      <div
                        key={index}
                        className="p-2 border rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                        onClick={() => addSongFromSearch(result)}
                      >
                        <div className="text-sm font-medium truncate">
                          {result.snippet.title}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {result.snippet.channelTitle}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="coded" className="space-y-4">
                <div className="text-xs text-muted-foreground mb-2">
                  Songs from booked talent, managed artists & musicians
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {codedSongs.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      <Library className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No coded songs available</p>
                    </div>
                  ) : (
                    codedSongs.map((song, index) => (
                      <div
                        key={song.id}
                        className="p-2 border rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                        onClick={() => addCodedSong(song)}
                      >
                        <div className="text-sm font-medium">{song.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {song.artist} • {song.codedBy} ({song.codedByRole})
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="custom" className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Upload custom audio files
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    MP3, WAV, FLAC supported
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Song Details Editor */}
        {selectedSong && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Song Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Key</Label>
                  <Select
                    value={selectedSong.key}
                    onValueChange={(value) => {
                      setSelectedSong({ ...selectedSong, key: value });
                      setSetlistSongs(prev => prev.map(song => 
                        song.id === selectedSong.id ? { ...song, key: value } : song
                      ));
                    }}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].map(key => (
                        <SelectItem key={key} value={key}>{key}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>BPM</Label>
                  <Input
                    type="number"
                    value={selectedSong.bpm}
                    onChange={(e) => {
                      const bpm = parseInt(e.target.value) || 120;
                      setSelectedSong({ ...selectedSong, bpm });
                      setSetlistSongs(prev => prev.map(song => 
                        song.id === selectedSong.id ? { ...song, bpm } : song
                      ));
                    }}
                    className="h-8"
                  />
                </div>
              </div>
              
              <div>
                <Label>Assigned To</Label>
                <Select
                  value={selectedSong.assignedTo || ''}
                  onValueChange={(value) => {
                    setSelectedSong({ ...selectedSong, assignedTo: value });
                    setSetlistSongs(prev => prev.map(song => 
                      song.id === selectedSong.id ? { ...song, assignedTo: value } : song
                    ));
                  }}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Select performer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Unassigned</SelectItem>
                    {assignedTalent.map(talent => (
                      <SelectItem key={talent.id} value={talent.name}>
                        {talent.name} ({talent.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Performance Notes</Label>
                <Textarea
                  value={selectedSong.notes}
                  onChange={(e) => {
                    setSelectedSong({ ...selectedSong, notes: e.target.value });
                    setSetlistSongs(prev => prev.map(song => 
                      song.id === selectedSong.id ? { ...song, notes: e.target.value } : song
                    ));
                  }}
                  placeholder="Add performance notes, key changes, etc."
                  className="h-20"
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}