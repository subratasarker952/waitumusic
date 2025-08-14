import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

interface EnhancedSetlistManagerProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId?: number;
  assignedTalent?: AssignedTalent[];
  eventDetails?: EventDetails;
  onSave?: (data: any) => void;
}

export default function EnhancedSetlistManager({
  isOpen,
  onClose,
  bookingId,
  assignedTalent = [],
  eventDetails,
  onSave
}: EnhancedSetlistManagerProps) {
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
    // Load coded songs when component opens
    if (isOpen) {
      loadCodedSongs();
    }
  }, [eventDetails, isOpen]);

  // Load coded songs from system - prioritizing main booked talent, then managed artists, then managed musicians
  const loadCodedSongs = async () => {
    try {
      const response = await fetch('/api/coded-songs', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
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

  const extractMetadata = async (youtubeUrl: string) => {
    try {
      const response = await fetch(`/api/youtube/extract-metadata`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: youtubeUrl })
      });
      
      if (response.ok) {
        const metadata = await response.json();
        return metadata;
      }
    } catch (error) {
      console.error('Metadata extraction failed:', error);
    }
    return null;
  };

  const generateChordChart = async (songTitle: string, artist: string) => {
    try {
      const response = await fetch(`/api/opphub-ai/generate-chord-chart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ songTitle, artist })
      });
      
      if (response.ok) {
        const result = await response.json();
        return result.chordChart;
      }
    } catch (error) {
      console.error('Chord chart generation failed:', error);
    }
    return null;
  };

  const addSongFromSearch = async (searchResult: any) => {
    const metadata = await extractMetadata(searchResult.url || `https://youtube.com/watch?v=${searchResult.id.videoId}`);
    const chordChart = await generateChordChart(searchResult.snippet.title, searchResult.snippet.channelTitle);
    
    const newSong: SetlistSong = {
      id: `song-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: searchResult.snippet.title,
      artist: searchResult.snippet.channelTitle,
      duration: metadata?.duration || 180, // Default 3 minutes
      key: metadata?.key || 'C',
      bpm: metadata?.bpm || 120,
      energy: metadata?.energy || 'medium',
      youtubeUrl: searchResult.url || `https://youtube.com/watch?v=${searchResult.id.videoId}`,
      chordChart: chordChart || '',
      notes: '',
      source: 'youtube'
    };
    
    setSetlistSongs(prev => [...prev, newSong]);
    setSearchQuery('');
    setSearchResults([]);
    
    toast({
      title: "Song Added",
      description: `${newSong.title} added to setlist with auto-generated chord chart`
    });
  };

  const addCustomSong = () => {
    const newSong: SetlistSong = {
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: 'New Song',
      artist: 'Artist',
      duration: 180,
      key: 'C',
      bpm: 120,
      energy: 'medium',
      notes: '',
      source: 'custom',
      isCustomUpload: true
    };
    
    setSetlistSongs(prev => [...prev, newSong]);
    setSelectedSong(newSong);
    
    toast({
      title: "Custom Song Added",
      description: "Edit the song details in the sidebar"
    });
  };

  // Add coded song from system to setlist
  const addCodedSong = (codedSong: CodedSong) => {
    const newSong: SetlistSong = {
      id: `coded-${codedSong.id}-${Date.now()}`,
      title: codedSong.title,
      artist: codedSong.artist,
      duration: codedSong.duration,
      key: 'C', // Default - could be enhanced with metadata
      bpm: 120, // Default - could be enhanced with metadata
      energy: 'medium',
      notes: '',
      source: 'coded',
      codedBy: codedSong.codedBy,
      isrcCode: codedSong.isrcCode
    };
    
    setSetlistSongs(prev => [...prev, newSong]);
    toast({
      title: "Coded Song Added",
      description: `${newSong.title} by ${newSong.artist} added to setlist`
    });
  };

  // Handle custom audio file upload
  const handleCustomUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an audio file (MP3, WAV, etc.)",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('audio', file);
      formData.append('bookingId', bookingId?.toString() || '');

      const response = await fetch('/api/setlist/upload-custom-song', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const uploadedSong = await response.json();
        const newSong: SetlistSong = {
          id: `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: uploadedSong.title || file.name.replace(/\.[^/.]+$/, ""),
          artist: 'Custom Upload',
          duration: uploadedSong.duration || 180,
          key: 'C',
          bpm: 120,
          energy: 'medium',
          notes: '',
          source: 'custom',
          isCustomUpload: true,
          audioFile: file
        };
        
        setSetlistSongs(prev => [...prev, newSong]);
        setSelectedSong(newSong);
        
        toast({
          title: "Song Uploaded",
          description: `${newSong.title} uploaded successfully`
        });
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload audio file",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeSong = (songId: string) => {
    setSetlistSongs(prev => prev.filter(song => song.id !== songId));
    if (selectedSong?.id === songId) {
      setSelectedSong(null);
    }
    toast({
      title: "Song Removed",
      description: "Song removed from setlist"
    });
  };

  const updateSong = (songId: string, updates: Partial<SetlistSong>) => {
    setSetlistSongs(prev => prev.map(song => 
      song.id === songId ? { ...song, ...updates } : song
    ));
  };

  const assignTalentToSong = (songId: string, talentName: string) => {
    const talent = assignedTalent.find(t => t.name === talentName);
    if (talent) {
      updateSong(songId, {
        assignedTo: talent.name,
        talentRole: talent.role
      });
      toast({
        title: "Talent Assigned",
        description: `${talent.name} assigned to perform song`
      });
    }
  };

  const optimizeSetlist = async () => {
    if (setlistSongs.length === 0) {
      toast({
        title: "No Songs",
        description: "Add songs to setlist before optimizing",
        variant: "destructive"
      });
      return;
    }

    setShowOptimization(true);
    try {
      const response = await fetch(`/api/opphub-ai/optimize-setlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          songs: setlistSongs,
          eventDetails,
          assignedTalent,
          duration: eventDetails?.duration || 60
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.optimizedSetlist) {
          setSetlistSongs(result.optimizedSetlist);
          toast({
            title: "Setlist Optimized",
            description: "System has optimized song order for energy flow and audience engagement"
          });
        }
      }
    } catch (error) {
      toast({
        title: "Optimization Failed",
        description: "Unable to optimize setlist. Manual ordering remains.",
        variant: "destructive"
      });
    } finally {
      setShowOptimization(false);
    }
  };

  const saveSetlist = () => {
    const setlistData = {
      name: setlistName,
      songs: setlistSongs,
      bookingId,
      eventDetails,
      totalDuration: setlistSongs.reduce((total, song) => total + song.duration, 0),
      talentAssignments: setlistSongs.filter(song => song.assignedTo).length,
      createdAt: new Date().toISOString()
    };
    
    onSave?.(setlistData);
    toast({
      title: "Setlist Saved",
      description: "Performance setlist saved successfully"
    });
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getEnergyColor = (energy: string) => {
    switch (energy) {
      case 'low': return 'bg-blue-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const totalDuration = setlistSongs.reduce((total, song) => total + song.duration, 0);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Enhanced Setlist Manager - YouTube Integration & Smart Optimization
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Setlist */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div>
                    <Input
                      value={setlistName}
                      onChange={(e) => setSetlistName(e.target.value)}
                      className="text-lg font-semibold border-none bg-transparent p-0 h-auto"
                      placeholder="Setlist Name"
                    />
                    <div className="text-sm text-muted-foreground">
                      {setlistSongs.length} songs • {formatDuration(totalDuration)} total
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
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
                      <p className="text-sm">Search YouTube or add custom songs to get started</p>
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
                          <Music className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No coded songs available</p>
                        </div>
                      ) : (
                        codedSongs.map((song) => (
                          <div
                            key={song.id}
                            className="p-2 border rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                            onClick={() => addCodedSong(song)}
                          >
                            <div className="text-sm font-medium truncate">
                              {song.title}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {song.artist} • Coded by {song.codedBy}
                            </div>
                            {song.isrcCode && (
                              <Badge variant="outline" className="text-xs mt-1">
                                {song.isrcCode}
                              </Badge>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="custom" className="space-y-4">
                    <div className="space-y-3">
                      <Button
                        onClick={addCustomSong}
                        variant="outline"
                        className="w-full"
                        size="sm"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Blank Song
                      </Button>
                      
                      <div className="relative">
                        <Input
                          type="file"
                          accept="audio/*"
                          onChange={handleCustomUpload}
                          className="hidden"
                          id="audio-upload"
                          disabled={isUploading}
                        />
                        <Label
                          htmlFor="audio-upload"
                          className={`flex items-center justify-center w-full h-10 px-4 border rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
                            isUploading ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          {isUploading ? (
                            <>
                              <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full mr-2" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4 mr-2" />
                              Upload Audio File
                            </>
                          )}
                        </Label>
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        Supported: MP3, WAV, M4A, FLAC
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Song Editor */}
            {selectedSong && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Edit Song</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="song-title">Title</Label>
                    <Input
                      id="song-title"
                      value={selectedSong.title}
                      onChange={(e) => {
                        updateSong(selectedSong.id, { title: e.target.value });
                        setSelectedSong({ ...selectedSong, title: e.target.value });
                      }}
                      className="h-8"
                    />
                  </div>

                  <div>
                    <Label htmlFor="song-artist">Artist</Label>
                    <Input
                      id="song-artist"
                      value={selectedSong.artist}
                      onChange={(e) => {
                        updateSong(selectedSong.id, { artist: e.target.value });
                        setSelectedSong({ ...selectedSong, artist: e.target.value });
                      }}
                      className="h-8"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="song-key">Key</Label>
                      <Select
                        value={selectedSong.key}
                        onValueChange={(value) => {
                          updateSong(selectedSong.id, { key: value });
                          setSelectedSong({ ...selectedSong, key: value });
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
                      <Label htmlFor="song-bpm">BPM</Label>
                      <Input
                        id="song-bpm"
                        type="number"
                        value={selectedSong.bpm}
                        onChange={(e) => {
                          const bpm = Number(e.target.value);
                          updateSong(selectedSong.id, { bpm });
                          setSelectedSong({ ...selectedSong, bpm });
                        }}
                        className="h-8"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Energy Level</Label>
                    <Select
                      value={selectedSong.energy}
                      onValueChange={(value) => {
                        updateSong(selectedSong.id, { energy: value as any });
                        setSelectedSong({ ...selectedSong, energy: value as any });
                      }}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low Energy</SelectItem>
                        <SelectItem value="medium">Medium Energy</SelectItem>
                        <SelectItem value="high">High Energy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {assignedTalent.length > 0 && (
                    <div>
                      <Label>Assign Performer</Label>
                      <Select
                        value={selectedSong.assignedTo || ''}
                        onValueChange={(value) => assignTalentToSong(selectedSong.id, value)}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder="Select talent" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No Assignment</SelectItem>
                          {assignedTalent.map((talent) => (
                            <SelectItem key={talent.id} value={talent.name}>
                              {talent.name} ({talent.role})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="song-notes">Performance Notes</Label>
                    <Textarea
                      id="song-notes"
                      value={selectedSong.notes}
                      onChange={(e) => {
                        updateSong(selectedSong.id, { notes: e.target.value });
                        setSelectedSong({ ...selectedSong, notes: e.target.value });
                      }}
                      className="h-16 text-xs"
                      placeholder="Performance notes, cues, special instructions..."
                    />
                  </div>

                  {selectedSong.chordChart && (
                    <div>
                      <Label>Auto-Generated Chord Chart</Label>
                      <Textarea
                        value={selectedSong.chordChart}
                        onChange={(e) => {
                          updateSong(selectedSong.id, { chordChart: e.target.value });
                          setSelectedSong({ ...selectedSong, chordChart: e.target.value });
                        }}
                        className="h-32 text-xs font-mono"
                        placeholder="Chord chart will appear here..."
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button onClick={saveSetlist} className="w-full" size="sm">
                  <Save className="h-4 w-4 mr-2" />
                  Save Setlist
                </Button>
                <Button variant="secondary" onClick={onClose} className="w-full" size="sm">
                  Close Manager
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}