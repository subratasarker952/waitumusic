import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Search, Music, Plus, ExternalLink, Clock, Calendar } from 'lucide-react';

interface SongData {
  title: string;
  artist: string;
  originalArtist?: string;
  songwriters?: Array<{name: string; role: string}>;
  publishers?: Array<{name: string; split: number}>;
  isrc?: string;
  duration?: number;
  releaseYear?: number;
  youtubeLink?: string;
  webSearchData?: any;
}

interface SongSearchDialogProps {
  open: boolean;
  onClose: () => void;
  onSongSelected: (song: any) => void;
  userRole: string;
}

const MUSICAL_KEYS = [
  'C Major', 'G Major', 'D Major', 'A Major', 'E Major', 'B Major', 'F# Major',
  'C# Major', 'F Major', 'Bb Major', 'Eb Major', 'Ab Major', 'Db Major', 'Gb Major',
  'A Minor', 'E Minor', 'B Minor', 'F# Minor', 'C# Minor', 'G# Minor', 'D# Minor',
  'A# Minor', 'D Minor', 'G Minor', 'C Minor', 'F Minor', 'Bb Minor', 'Eb Minor'
];

const TIME_SIGNATURES = ['4/4', '3/4', '2/4', '6/8', '9/8', '12/8', '5/4', '7/4'];

export default function SongSearchDialog({ open, onClose, onSongSelected, userRole }: SongSearchDialogProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SongData[]>([]);
  const [selectedSong, setSelectedSong] = useState<SongData | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Manual entry form
  const [manualSong, setManualSong] = useState({
    songTitle: '',
    artistPerformer: '',
    originalArtist: '',
    keySignature: '',
    tempo: '',
    timeSignature: '4/4',
    chordProgression: '',
    notes: '',
    youtubeLink: '',
    uploadedTrackId: null as number | null
  });

  const [uploadedTracks, setUploadedTracks] = useState<Array<{id: number; title: string; artist: string}>>([]);

  useEffect(() => {
    if (open) {
      loadUploadedTracks();
    }
  }, [open]);

  const loadUploadedTracks = async () => {
    try {
      const response = await apiRequest('/api/songs');

      if (response.ok) {
        const tracks = await response.json();
        setUploadedTracks(tracks.map((track: any) => ({
          id: track.id,
          title: track.title,
          artist: track.artistUserId
        })));
      }
    } catch (error) {
      console.error('Error loading uploaded tracks:', error);
    }
  };

  const searchSongs = async (searchType = 'all') => {
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      const response = await apiRequest('/api/songs/search', {
        method: 'POST',
        body: JSON.stringify({
          query: searchQuery,
          searchType,
          includePublishers: userRole === 'superadmin' || userRole === 'admin',
          includeISRC: userRole === 'superadmin'
        })
      });

      if (response.ok) {
        const results = await response.json();
        setSearchResults(results);
        if (results.length === 0) {
          toast({
            title: "No Results",
            description: `No songs found matching "${searchQuery}"`
          });
        } else {
          const platformCount = results.filter(r => r.source === 'platform').length;
          const youtubeCount = results.filter(r => r.source === 'youtube').length;
          console.log(`Search complete: ${results.length} total (${platformCount} platform, ${youtubeCount} YouTube)`);
        }
      } else {
        throw new Error('Search failed');
      }
    } catch (error) {
      toast({
        title: "Search Failed",
        description: "Failed to search for songs. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadAudioFile = async (file: File) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Simulate file upload for now
      const response = await fetch('/api/setlist/upload-audio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type
        })
      });

      if (response.ok) {
        const uploadResult = await response.json();
        
        // Update manual song with uploaded track info
        setManualSong(prev => ({
          ...prev,
          uploadedTrackId: uploadResult.fileId,
          tempo: Math.round(60000 / (uploadResult.duration || 240) * 4).toString() // Estimate tempo
        }));

        toast({
          title: "Upload Successful",
          description: `Audio file "${uploadResult.fileName}" uploaded for chord extraction`
        });

        return uploadResult;
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload audio file. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const selectSearchResult = (song: SongData) => {
    setSelectedSong(song);
    setManualSong(prev => ({
      ...prev,
      songTitle: song.title,
      artistPerformer: song.artist,
      originalArtist: song.originalArtist || '',
      youtubeLink: song.youtubeLink || ''
    }));
  };

  const addSongToSetlist = () => {
    if (!manualSong.songTitle || !manualSong.artistPerformer) {
      toast({
        title: "Missing Information",
        description: "Song title and performer are required",
        variant: "destructive"
      });
      return;
    }

    const songData = {
      ...manualSong,
      tempo: manualSong.tempo ? parseInt(manualSong.tempo) : undefined,
      ...(selectedSong && {
        songwriters: selectedSong.songwriters,
        publishers: selectedSong.publishers,
        isrc: selectedSong.isrc,
        duration: selectedSong.duration,
        releaseYear: selectedSong.releaseYear,
        webSearchData: selectedSong.webSearchData
      })
    };

    onSongSelected(songData);
    
    // Reset form
    setManualSong({
      songTitle: '',
      artistPerformer: '',
      originalArtist: '',
      keySignature: '',
      tempo: '',
      timeSignature: '4/4',
      chordProgression: '',
      notes: '',
      youtubeLink: '',
      uploadedTrackId: null
    });
    setSelectedSong(null);
    setSearchResults([]);
    setSearchQuery('');
    
    toast({
      title: "Song Added",
      description: "Song added to setlist successfully"
    });
    
    onClose();
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return null;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Add Song to Setlist
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="search" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="search">Search Online</TabsTrigger>
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-6">
            {/* Song Search */}
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search for songs (e.g., 'Bohemian Rhapsody Queen')"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && searchSongs('all')}
                    className="flex-1"
                  />
                  <Button
                    onClick={() => searchSongs('all')}
                    disabled={loading || !searchQuery.trim()}
                    className="flex items-center gap-2"
                  >
                    <Search className="h-4 w-4" />
                    Search All
                  </Button>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => searchSongs('platform')}
                    disabled={loading || !searchQuery.trim()}
                  >
                    Platform Only
                  </Button>
                  <Button
                    variant="outline" 
                    size="sm"
                    onClick={() => searchSongs('youtube')}
                    disabled={loading || !searchQuery.trim()}
                  >
                    YouTube Only
                  </Button>
                </div>
              </div>

              {loading && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2">Searching songs...</span>
                </div>
              )}

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  <h3 className="font-medium">Search Results</h3>
                  {searchResults.map((song, index) => (
                    <div
                      key={index}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedSong === song
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => selectSearchResult(song)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{song.title}</h4>
                          <p className="text-sm text-gray-600">by {song.artist}</p>
                          {song.originalArtist && song.originalArtist !== song.artist && (
                            <p className="text-xs text-gray-500">Originally by {song.originalArtist}</p>
                          )}
                          
                          <div className="flex items-center gap-2 mt-2">
                            {/* Source indicator */}
                            {(song as any).source === 'platform' && (
                              <Badge variant="secondary" className="bg-green-100 text-green-700">
                                Platform
                              </Badge>
                            )}
                            {(song as any).source === 'youtube' && (
                              <Badge variant="secondary" className="bg-red-100 text-red-700 flex items-center gap-1">
                                <ExternalLink className="h-3 w-3" />
                                YouTube
                              </Badge>
                            )}
                            
                            {song.releaseYear && (
                              <Badge variant="outline" className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {song.releaseYear}
                              </Badge>
                            )}
                            {song.duration && (
                              <Badge variant="outline" className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDuration(song.duration)}
                              </Badge>
                            )}
                            {song.youtubeLink && !(song as any).source && (
                              <Badge variant="outline" className="flex items-center gap-1">
                                <ExternalLink className="h-3 w-3" />
                                YouTube
                              </Badge>
                            )}
                          </div>

                          {(userRole === 'superadmin' || userRole === 'admin') && (
                            <div className="mt-2 space-y-1">
                              {song.isrc && (
                                <p className="text-xs text-gray-600">ISRC: {song.isrc}</p>
                              )}
                              {song.publishers && song.publishers.length > 0 && (
                                <div>
                                  <p className="text-xs font-medium">Publishers:</p>
                                  {song.publishers.map((pub, i) => (
                                    <p key={i} className="text-xs text-gray-600">
                                      {pub.name} ({pub.split}%)
                                    </p>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {song.songwriters && song.songwriters.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs font-medium">Songwriters:</p>
                              {song.songwriters.map((writer, i) => (
                                <p key={i} className="text-xs text-gray-600">
                                  {writer.name} ({writer.role})
                                </p>
                              ))}
                            </div>
                          )}
                        </div>

                        <Button
                          size="sm"
                          variant={selectedSong === song ? "default" : "outline"}
                          onClick={(e) => {
                            e.stopPropagation();
                            selectSearchResult(song);
                          }}
                        >
                          {selectedSong === song ? 'Selected' : 'Select'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="manual" className="space-y-6">
            {/* Manual Entry Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="song-title">Song Title *</Label>
                <Input
                  id="song-title"
                  value={manualSong.songTitle}
                  onChange={(e) => setManualSong(prev => ({ ...prev, songTitle: e.target.value }))}
                  placeholder="Enter song title"
                />
              </div>
              
              <div>
                <Label htmlFor="artist-performer">Performer/Artist *</Label>
                <Input
                  id="artist-performer"
                  value={manualSong.artistPerformer}
                  onChange={(e) => setManualSong(prev => ({ ...prev, artistPerformer: e.target.value }))}
                  placeholder="Who will perform this song"
                />
              </div>

              <div>
                <Label htmlFor="original-artist">Original Artist</Label>
                <Input
                  id="original-artist"
                  value={manualSong.originalArtist}
                  onChange={(e) => setManualSong(prev => ({ ...prev, originalArtist: e.target.value }))}
                  placeholder="Original recording artist (if cover)"
                />
              </div>

              <div>
                <Label htmlFor="key-signature">Key Signature</Label>
                <Select
                  value={manualSong.keySignature}
                  onValueChange={(value) => setManualSong(prev => ({ ...prev, keySignature: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select key" />
                  </SelectTrigger>
                  <SelectContent>
                    {MUSICAL_KEYS.map(key => (
                      <SelectItem key={key} value={key}>{key}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="tempo">Tempo (BPM)</Label>
                <Input
                  id="tempo"
                  type="number"
                  min="40"
                  max="200"
                  value={manualSong.tempo}
                  onChange={(e) => setManualSong(prev => ({ ...prev, tempo: e.target.value }))}
                  placeholder="e.g., 120"
                />
              </div>

              <div>
                <Label htmlFor="time-signature">Time Signature</Label>
                <Select
                  value={manualSong.timeSignature}
                  onValueChange={(value) => setManualSong(prev => ({ ...prev, timeSignature: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SIGNATURES.map(sig => (
                      <SelectItem key={sig} value={sig}>{sig}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="youtube-link">YouTube Link</Label>
                <Input
                  id="youtube-link"
                  type="url"
                  value={manualSong.youtubeLink}
                  onChange={(e) => setManualSong(prev => ({ ...prev, youtubeLink: e.target.value }))}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="uploaded-track">Or Select Uploaded Track</Label>
                <Select
                  value={manualSong.uploadedTrackId?.toString() || ''}
                  onValueChange={(value) => setManualSong(prev => ({ 
                    ...prev, 
                    uploadedTrackId: value ? parseInt(value) : null 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose from uploaded tracks" />
                  </SelectTrigger>
                  <SelectContent>
                    {uploadedTracks.map(track => (
                      <SelectItem key={track.id} value={track.id.toString()}>
                        {track.title} - {track.artist}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="chord-progression">Chord Progression</Label>
                <Textarea
                  id="chord-progression"
                  value={manualSong.chordProgression}
                  onChange={(e) => setManualSong(prev => ({ ...prev, chordProgression: e.target.value }))}
                  placeholder="e.g., C - Am - F - G (Verse), Am - F - C - G (Chorus)"
                  rows={3}
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="performance-notes">Performance Notes</Label>
                <Textarea
                  id="performance-notes"
                  value={manualSong.notes}
                  onChange={(e) => setManualSong(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Special instructions, arrangement notes, etc."
                  rows={3}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-6 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={addSongToSetlist}
            disabled={!manualSong.songTitle || !manualSong.artistPerformer}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add to Setlist
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}