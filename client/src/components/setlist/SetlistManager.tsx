import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Plus, Search, Download, Upload, Music, Clock, Key, Volume2, Trash2, Edit, ExternalLink, FileText, Save, ChevronDown, ChevronUp } from 'lucide-react';
import SongSearchDialog from './SongSearchDialog';
import ChordProgressionViewer from './ChordProgressionViewer';

interface SetlistSong {
  id?: number;
  orderPosition: number;
  songTitle: string;
  artistPerformer: string;
  originalArtist?: string;
  songwriters?: Array<{name: string; role: string}>;
  publishers?: Array<{name: string; split: number}>;
  isrc?: string;
  duration?: number;
  releaseYear?: number;
  keySignature?: string;
  tempo?: number;
  timeSignature?: string;
  chordProgression?: string;
  notes?: string;
  youtubeLink?: string;
  uploadedTrackId?: number;
  chordChartUrl?: string;
  webSearchData?: any;
}

interface Setlist {
  id?: number;
  bookingId: number;
  name: string;
  description?: string;
  songs: SetlistSong[];
}

interface SetlistManagerProps {
  bookingId?: number;
  assignedMusicians?: Array<{id: number; name: string; instruments?: string[]}>;
  userRole?: string;
  canEdit?: boolean;
  onSetlistSaved?: (setlist: Setlist) => void;
  onLoad?: (setlist: Setlist) => void;
}

const MUSICAL_KEYS = [
  'C Major', 'G Major', 'D Major', 'A Major', 'E Major', 'B Major', 'F# Major',
  'C# Major', 'F Major', 'Bb Major', 'Eb Major', 'Ab Major', 'Db Major', 'Gb Major',
  'A Minor', 'E Minor', 'B Minor', 'F# Minor', 'C# Minor', 'G# Minor', 'D# Minor',
  'A# Minor', 'D Minor', 'G Minor', 'C Minor', 'F Minor', 'Bb Minor', 'Eb Minor'
];

const TIME_SIGNATURES = ['4/4', '3/4', '2/4', '6/8', '9/8', '12/8', '5/4', '7/4'];

export default function SetlistManager({ 
  bookingId = 0, 
  assignedMusicians = [], 
  userRole = 'fan', 
  canEdit = false, 
  onSetlistSaved,
  onLoad 
}: SetlistManagerProps) {
  const { toast } = useToast();
  const [setlist, setSetlist] = useState<Setlist>({
    bookingId,
    name: 'Performance Setlist',
    description: '',
    songs: []
  });
  const [loading, setLoading] = useState(false);
  const [showSongSearch, setShowSongSearch] = useState(false);
  const [editingSong, setEditingSong] = useState<SetlistSong | null>(null);
  const [selectedSongForChords, setSelectedSongForChords] = useState<SetlistSong | null>(null);
  const [templates, setTemplates] = useState<any[]>([]);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [templateAction, setTemplateAction] = useState<'save' | 'load'>('save');
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');

  const canSeeDetailedInfo = ['superadmin', 'admin'].includes(userRole);
  const canEditSetlist = canEdit && ['superadmin', 'admin', 'managed_artist', 'managed_musician'].includes(userRole);

  useEffect(() => {
    loadTemplates();
    if (bookingId) {
      loadSetlist();
    } else {
      // For demo purposes when no bookingId, show demo data immediately
      setSetlist({
        bookingId: 0,
        name: 'Performance Setlist Demo',
        description: 'Demo setlist for testing songwriter entry',
        songs: [
          {
            orderPosition: 1,
            songTitle: 'Praise Zone',
            artistPerformer: 'JCro',
            originalArtist: 'JCro',
            duration: 210,
            keySignature: 'C Major',
            tempo: 120,
            timeSignature: '4/4',
            songwriters: [
              { name: 'Karlvin Deravariere', role: 'Songwriter' },
              { name: 'JCro', role: 'Composer' }
            ],
            publishers: [
              { name: 'Wai\'tu Music Publishing', split: 60 },
              { name: 'Independent Publishing', split: 40 }
            ]
          },
          {
            orderPosition: 2,
            songTitle: 'Island Dreams',
            artistPerformer: 'Lí-Lí Octave',
            originalArtist: 'Lí-Lí Octave',
            duration: 245,
            keySignature: 'D Major',
            tempo: 95,
            timeSignature: '4/4'
            // Intentionally missing songwriters/publishers to show "Add" buttons
          },
          {
            orderPosition: 3,
            songTitle: 'Caribbean Soul',
            artistPerformer: 'Princess Trinidad',
            originalArtist: 'Princess Trinidad',
            duration: 180,
            keySignature: 'E Minor',
            tempo: 110,
            timeSignature: '4/4',
            songwriters: [
              { name: 'Princess Trinidad', role: 'Songwriter' }
            ]
            // Has songwriters but no publishers to show mixed state
          }
        ]
      });
    }
  }, [bookingId]);

  const loadTemplates = async () => {
    try {
      // First check localStorage for fallback
      const savedTemplates = localStorage.getItem('setlistTemplates');
      if (savedTemplates) {
        const parsed = JSON.parse(savedTemplates);
        setTemplates(parsed);
        // Loaded setlist templates from localStorage
        return;
      }

      const response = await apiRequest('/api/setlist-templates');

      if (response.ok) {
        const templatesData = await response.json();
        // Loaded setlist templates from API
        setTemplates(templatesData);
        // Save to localStorage as backup
        localStorage.setItem('setlistTemplates', JSON.stringify(templatesData));
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      // Create default template if none exist
      const defaultTemplate = {
        id: 1,
        name: 'Basic Performance',
        songs: [
          {
            orderPosition: 1,
            songTitle: 'Opening Song',
            artistPerformer: 'Artist Name',
            originalArtist: 'Artist Name',
            duration: 240,
            keySignature: 'C Major',
            tempo: 120,
            timeSignature: '4/4'
          }
        ]
      };
      setTemplates([defaultTemplate]);
      localStorage.setItem('setlistTemplates', JSON.stringify([defaultTemplate]));
    }
  };

  const loadSetlist = async () => {
    try {
      setLoading(true);
      // First try to load existing setlist
      const response = await apiRequest(`/api/bookings/${bookingId}/setlist`);

      if (response.ok) {
        const data = await response.json();
        if (data && data.songs && data.songs.length > 0) {
          setSetlist(data);
        } else {
          // If no setlist exists, create a demo setlist with sample songs
          const demoSetlist: Setlist = {
            bookingId,
            name: 'Performance Setlist',
            description: 'Demo setlist for testing songwriter entry',
            songs: [
              {
                orderPosition: 1,
                songTitle: 'Praise Zone',
                artistPerformer: 'JCro',
                originalArtist: 'JCro',
                duration: 210,
                keySignature: 'C Major',
                tempo: 120,
                timeSignature: '4/4',
                songwriters: [
                  { name: 'Karlvin Deravariere', role: 'Songwriter' },
                  { name: 'JCro', role: 'Composer' }
                ],
                publishers: [
                  { name: 'Wai\'tu Music Publishing', split: 60 },
                  { name: 'Independent Publishing', split: 40 }
                ]
              },
              {
                orderPosition: 2,
                songTitle: 'Island Dreams',
                artistPerformer: 'Lí-Lí Octave',
                originalArtist: 'Lí-Lí Octave',
                duration: 245,
                keySignature: 'D Major',
                tempo: 95,
                timeSignature: '4/4'
                // Intentionally missing songwriters/publishers to show "Add" buttons
              },
              {
                orderPosition: 3,
                songTitle: 'Caribbean Soul',
                artistPerformer: 'Princess Trinidad',
                originalArtist: 'Princess Trinidad',
                duration: 180,
                keySignature: 'E Minor',
                tempo: 110,
                timeSignature: '4/4',
                songwriters: [
                  { name: 'Princess Trinidad', role: 'Songwriter' }
                ]
                // Has songwriters but no publishers to show mixed state
              }
            ]
          };
          setSetlist(demoSetlist);
        }
      } else {
        // If API fails, still show demo data
        // Setlist API unavailable, using fallback data
        setSetlist({
          bookingId,
          name: 'Performance Setlist',
          description: 'Demo setlist for testing songwriter entry',
          songs: [
            {
              orderPosition: 1,
              songTitle: 'Praise Zone',
              artistPerformer: 'JCro',
              originalArtist: 'JCro',
              duration: 210,
              songwriters: [{ name: 'Karlvin Deravariere', role: 'Songwriter' }],
              publishers: [{ name: 'Wai\'tu Music Publishing', split: 100 }]
            }
          ]
        });
      }
    } catch (error) {
      console.error('Error loading setlist:', error);
      // Always show something, even on error
      setSetlist({
        bookingId,
        name: 'Performance Setlist',
        description: 'Demo setlist for testing',
        songs: []
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSetlist = async () => {
    try {
      setLoading(true);
      const response = await apiRequest(`/api/bookings/${bookingId}/setlist`, {
        method: 'POST',
        body: JSON.stringify(setlist)
      });

      if (response.ok) {
        const saved = await response.json();
        setSetlist(saved);
        toast({
          title: "Setlist Saved",
          description: "Performance setlist saved successfully"
        });
        onSetlistSaved?.(saved);
      } else {
        throw new Error('Failed to save setlist');
      }
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save setlist",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addSongToSetlist = (song: Partial<SetlistSong>) => {
    const newSong: SetlistSong = {
      ...song,
      orderPosition: setlist.songs.length + 1,
      songTitle: song.songTitle || '',
      artistPerformer: song.artistPerformer || ''
    };

    setSetlist(prev => ({
      ...prev,
      songs: [...prev.songs, newSong]
    }));
  };

  const updateSong = (index: number, updates: Partial<SetlistSong>) => {
    setSetlist(prev => ({
      ...prev,
      songs: prev.songs.map((song, i) => 
        i === index ? { ...song, ...updates } : song
      )
    }));
  };

  const removeSong = (index: number) => {
    const song = setlist.songs[index];
    const songTitle = song?.songTitle || 'this song';
    
    if (confirm(`Are you sure you want to remove "${songTitle}" from the setlist?`)) {
      setSetlist(prev => ({
        ...prev,
        songs: prev.songs.filter((_, i) => i !== index).map((song, i) => ({
          ...song,
          orderPosition: i + 1
        }))
      }));
      
      toast({
        title: "Song Removed",
        description: `"${songTitle}" has been removed from the setlist`
      });
    }
  };

  const reorderSong = (fromIndex: number, toIndex: number) => {
    const songs = [...setlist.songs];
    const [moved] = songs.splice(fromIndex, 1);
    songs.splice(toIndex, 0, moved);
    
    setSetlist(prev => ({
      ...prev,
      songs: songs.map((song, i) => ({
        ...song,
        orderPosition: i + 1
      }))
    }));
  };

  const saveAsTemplate = async () => {
    if (!setlist.name?.trim()) {
      toast({
        title: "Setlist Name Required", 
        description: "Please enter a setlist name first",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      const response = await apiRequest('/api/setlist-templates', {
        method: 'POST',
        body: JSON.stringify({
          name: setlist.name.trim(),
          description: setlist.description || '',
          songs: setlist.songs
        })
      });

      if (response.ok) {
        const template = await response.json();
        setTemplates(prev => [template, ...prev]);
        toast({
          title: "Template Saved",
          description: `Template "${setlist.name}" saved successfully`
        });
        loadTemplates(); // Refresh the templates list
      } else {
        throw new Error('Failed to save template');
      }
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save template",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTemplate = (template: any) => {
    const loadedSetlist = {
      bookingId,
      name: setlist.name, // Keep current setlist name
      description: setlist.description,
      songs: template.songs.map((song: any, index: number) => ({
        ...song,
        orderPosition: index + 1,
        id: undefined // Remove template song IDs
      }))
    };
    
    setSetlist(loadedSetlist);
    setShowTemplateDialog(false);
    
    // Notify parent about load action
    if (onLoad) {
      onLoad(loadedSetlist);
    }
    
    toast({
      title: "Template Loaded",
      description: `Loaded "${template.name}" - ${template.songs.length} songs`
    });
  };

  const loadFromTemplate = (template: any) => {
    const loadedSetlist = {
      bookingId,
      name: template.name,
      description: template.description || '',
      songs: template.songs.map((song: any, index: number) => ({
        ...song,
        orderPosition: index + 1,
        id: undefined // Remove template song IDs
      }))
    };
    
    setSetlist(loadedSetlist);
    
    // Notify parent about load action
    if (onLoad) {
      onLoad(loadedSetlist);
    }
    
    toast({
      title: "Template Loaded",
      description: `Loaded "${template.name}" - ${template.songs.length} songs`
    });
  };

  const deleteTemplate = async (template: any) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the template "${template.name}"? This action cannot be undone.`
    );
    
    if (!confirmed) return;

    try {
      const response = await apiRequest(`/api/setlist-templates/${template.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setTemplates(prev => prev.filter(t => t.id !== template.id));
        toast({
          title: "Template Deleted",
          description: `Template "${template.name}" has been deleted`
        });
      } else {
        throw new Error('Failed to delete template');
      }
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "Failed to delete template",
        variant: "destructive"
      });
    }
  };

  const generateChordChart = async (song: SetlistSong, instrument: string) => {
    // Check if song already has audio source
    if (!song.youtubeLink && !song.uploadedTrackId) {
      // Try to find audio source or create one for platform songs
      let audioSource = null;
      let sourceType = null;
      
      // For platform songs, try to generate a YouTube search link
      if (song.songTitle && song.artistPerformer) {
        const searchQuery = `${song.songTitle} ${song.artistPerformer}`.trim();
        audioSource = `https://youtube.com/search?q=${encodeURIComponent(searchQuery)}`;
        sourceType = 'youtube_search';
        
        toast({
          title: "Generating Chords",
          description: `Searching for audio source for "${song.songTitle}" by ${song.artistPerformer}`,
        });
      } else {
        toast({
          title: "Need Audio Source",
          description: "Add a YouTube link or upload audio file to generate chord charts for this song",
          variant: "destructive"
        });
        return;
      }
      
      // Update song with generated audio source
      const songIndex = setlist.songs.findIndex(s => s.orderPosition === song.orderPosition);
      if (songIndex !== -1) {
        updateSong(songIndex, { youtubeLink: audioSource });
        song = { ...song, youtubeLink: audioSource }; // Update local reference
      }
    }

    try {
      const response = await apiRequest('/api/chords/generate', {
        method: 'POST',
        body: JSON.stringify({
          setlistSongId: song.id,
          instrument,
          audioSource: song.youtubeLink || song.uploadedTrackId,
          sourceType: song.youtubeLink ? 'youtube' : 'upload'
        })
      });

      if (response.ok) {
        const result = await response.json();
        const { chordChart, metadata } = result;
        
        toast({
          title: "Chord Chart Generated",
          description: `${instrument} chord progression generated for ${metadata.key} - ${chordChart.chordProgression.length} chords`
        });

        // Update the song with the generated chord chart data
        const songIndex = setlist.songs.findIndex(s => s.orderPosition === song.orderPosition);
        if (songIndex !== -1) {
          const currentSong = setlist.songs[songIndex];
          const existingChords = currentSong.generatedChords || {};
          
          updateSong(songIndex, {
            chordProgression: chordChart.chordProgression.join(' - '),
            keySignature: chordChart.detectedKey,
            tempo: chordChart.tempo,
            generatedChords: {
              ...existingChords,
              [instrument]: {
                chordProgression: chordChart.chordProgression,
                structure: chordChart.structure,
                key: chordChart.detectedKey,
                confidence: chordChart.confidence,
                generatedAt: chordChart.generatedAt
              }
            }
          });
        }

        console.log('Chord generation successful:', { 
          instrument, 
          key: chordChart.detectedKey, 
          chords: chordChart.chordProgression,
          confidence: Math.round(chordChart.confidence * 100) + '%'
        });
      } else {
        throw new Error('Failed to generate chord chart');
      }
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate chord chart",
        variant: "destructive"
      });
    }
  };

  const downloadSetlistPDF = async () => {
    try {
      const response = await apiRequest(`/api/bookings/${bookingId}/setlist/pdf`);

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Setlist_${setlist.name.replace(/\s+/g, '_')}.pdf`;
        a.click();
        URL.revokeObjectURL(url);

        toast({
          title: "Setlist Downloaded",
          description: "Performance setlist PDF downloaded successfully"
        });
      }
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download setlist PDF",
        variant: "destructive"
      });
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const totalDuration = setlist.songs.reduce((total, song) => total + (song.duration || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Setlist Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <CardTitle className="flex items-center gap-2">
                <Music className="h-5 w-5" />
                Performance Setlist
              </CardTitle>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <Badge variant="outline">{setlist.songs.length} Songs</Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDuration(totalDuration)}
                </Badge>
                <Badge variant="outline">{assignedMusicians.length} Musicians</Badge>
              </div>
            </div>
            <div className="flex gap-2">
              {canEditSetlist && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setShowSongSearch(true)}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Song
                  </Button>
                </>
              )}
              <Button
                variant="default"
                onClick={downloadSetlistPDF}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
            </div>
          </div>

          {canEditSetlist && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <Label htmlFor="setlist-name">Setlist Name</Label>
                <Input
                  id="setlist-name"
                  value={setlist.name}
                  onChange={(e) => setSetlist(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter setlist name"
                />
              </div>
              <div>
                <Label htmlFor="setlist-description">Description</Label>
                <Input
                  id="setlist-description"
                  value={setlist.description || ''}
                  onChange={(e) => setSetlist(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional description"
                />
              </div>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Template Management - Like StagePlotDesigner */}
      {canEditSetlist && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Songs List - takes up 3 columns */}
          <div className="lg:col-span-3 space-y-2">
            {setlist.songs.map((song, index) => (
          <Card key={index} className="relative">
            <CardContent className="p-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    {song.orderPosition}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-sm">{song.songTitle}</h4>
                        <p className="text-xs text-gray-600">by {song.artistPerformer}</p>
                        {song.originalArtist && song.originalArtist !== song.artistPerformer && (
                          <p className="text-xs text-gray-500">Originally by {song.originalArtist}</p>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {song.keySignature && (
                          <Badge variant="outline" className="text-xs py-0 px-1">
                            {song.keySignature}
                          </Badge>
                        )}
                        {song.tempo && (
                          <Badge variant="outline" className="text-xs py-0 px-1">
                            {song.tempo}bpm
                          </Badge>
                        )}
                        {song.duration && (
                          <Badge variant="outline" className="text-xs py-0 px-1">
                            {formatDuration(song.duration)}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      {canSeeDetailedInfo && (
                        <>
                          {song.isrc && (
                            <p className="text-xs text-gray-600">ISRC: {song.isrc}</p>
                          )}
                          {song.publishers && song.publishers.length > 0 && (
                            <div className="flex items-center gap-2">
                              <div>
                                <p className="text-xs font-medium text-gray-700">Publishers:</p>
                                {song.publishers.map((pub, i) => (
                                  <p key={i} className="text-xs text-gray-600">
                                    {pub.name} ({pub.split}%)
                                  </p>
                                ))}
                              </div>
                              {canEditSetlist && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const currentPubs = song.publishers.map(p => `${p.name} (${p.split}%)`).join(', ');
                                    const manual = prompt('Edit publishers (format: Name (split%), Name (split%)):', currentPubs);
                                    if (manual !== null) {
                                      const newPubs = manual.split(',').map(p => {
                                        const trimmed = p.trim();
                                        const match = trimmed.match(/^(.+)\s*\((\d+(?:\.\d+)?)%\)$/);
                                        return match ? { name: match[1].trim(), split: parseFloat(match[2]) } : { name: trimmed, split: 100 };
                                      }).filter(p => p.name);
                                      
                                      updateSong(index, { publishers: newPubs });
                                    }
                                  }}
                                  className="text-xs"
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          )}
                          {!song.publishers?.length && canEditSetlist && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const manual = prompt('Add publishers (format: Name (split%), Name (split%)):');
                                if (manual && manual.trim()) {
                                  const newPubs = manual.split(',').map(p => {
                                    const trimmed = p.trim();
                                    const match = trimmed.match(/^(.+)\s*\((\d+(?:\.\d+)?)%\)$/);
                                    return match ? { name: match[1].trim(), split: parseFloat(match[2]) } : { name: trimmed, split: 100 };
                                  }).filter(p => p.name);
                                  
                                  if (newPubs.length > 0) {
                                    updateSong(index, { publishers: newPubs });
                                  }
                                }
                              }}
                              className="text-xs text-blue-600"
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Add Publishers
                            </Button>
                          )}
                        </>
                      )}
                      {song.songwriters && song.songwriters.length > 0 && (
                        <div className="flex items-center gap-2">
                          <div>
                            <p className="text-xs font-medium text-gray-700">Songwriters:</p>
                            {song.songwriters.map((writer, i) => (
                              <p key={i} className="text-xs text-gray-600">
                                {writer.name} ({writer.role})
                              </p>
                            ))}
                          </div>
                          {canEditSetlist && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const currentWriters = song.songwriters.map(w => `${w.name} (${w.role})`).join(', ');
                                const manual = prompt('Edit songwriters (format: Name (role), Name (role)):', currentWriters);
                                if (manual !== null) {
                                  const newWriters = manual.split(',').map(w => {
                                    const trimmed = w.trim();
                                    const match = trimmed.match(/^(.+)\s*\((.+)\)$/);
                                    return match ? { name: match[1].trim(), role: match[2].trim() } : { name: trimmed, role: 'Songwriter' };
                                  }).filter(w => w.name);
                                  
                                  updateSong(index, { songwriters: newWriters });
                                }
                              }}
                              className="text-xs"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      )}
                      {!song.songwriters?.length && canEditSetlist && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const manual = prompt('Add songwriters (format: Name (role), Name (role)):');
                            if (manual && manual.trim()) {
                              const newWriters = manual.split(',').map(w => {
                                const trimmed = w.trim();
                                const match = trimmed.match(/^(.+)\s*\((.+)\)$/);
                                return match ? { name: match[1].trim(), role: match[2].trim() } : { name: trimmed, role: 'Songwriter' };
                              }).filter(w => w.name);
                              
                              if (newWriters.length > 0) {
                                updateSong(index, { songwriters: newWriters });
                              }
                            }
                          }}
                          className="text-xs text-blue-600"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Songwriters
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {song.youtubeLink && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(song.youtubeLink, '_blank')}
                      className="flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      YouTube
                    </Button>
                  )}
                  
                  {/* Universal Chord Generation - Available for ALL songs */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedSongForChords(song)}
                    className="flex items-center gap-1 text-purple-600 hover:text-purple-700"
                    title={song.chordProgression ? "View existing chords or generate new ones" : "Generate chord charts for this song"}
                  >
                    <FileText className="h-3 w-3" />
                    {song.chordProgression ? "View Chords" : "Generate Chords"}
                  </Button>

                  {/* Add Audio Source for Chord Generation */}
                  {!song.youtubeLink && !song.uploadedTrackId && (
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const youtubeLink = prompt(`Add YouTube link for "${song.songTitle}" by ${song.artistPerformer}:`);
                          if (youtubeLink && youtubeLink.trim()) {
                            const songIndex = setlist.songs.findIndex(s => s.orderPosition === song.orderPosition);
                            if (songIndex !== -1) {
                              updateSong(songIndex, { youtubeLink: youtubeLink.trim() });
                            }
                          }
                        }}
                        className="text-xs text-blue-600 hover:text-blue-700"
                        title="Add YouTube link for chord generation"
                      >
                        + YouTube
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Create hidden file input for audio upload
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'audio/*';
                          input.onchange = async (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file) {
                              try {
                                const response = await apiRequest('/api/setlist/upload-audio', {
                                  method: 'POST',
                                  body: JSON.stringify({
                                    fileName: file.name,
                                    fileSize: file.size,
                                    fileType: file.type
                                  })
                                });
                                
                                if (response.ok) {
                                  const uploadResult = await response.json();
                                  const songIndex = setlist.songs.findIndex(s => s.orderPosition === song.orderPosition);
                                  if (songIndex !== -1) {
                                    updateSong(songIndex, { uploadedTrackId: uploadResult.fileId });
                                  }
                                  toast({
                                    title: "Upload Successful",
                                    description: `Audio uploaded for "${song.songTitle}"`
                                  });
                                }
                              } catch (error) {
                                toast({
                                  title: "Upload Failed",
                                  description: "Failed to upload audio file",
                                  variant: "destructive"
                                });
                              }
                            }
                          };
                          input.click();
                        }}
                        className="text-xs text-green-600 hover:text-green-700"
                        title="Upload audio file for chord generation"
                      >
                        + Audio
                      </Button>
                    </div>
                  )}

                  {canEditSetlist && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingSong(song)}
                        className="flex items-center gap-1"
                      >
                        <Edit className="h-3 w-3" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSong(index)}
                        className="flex items-center gap-1 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                        Remove
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {song.notes && (
                <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Notes:</strong> {song.notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {setlist.songs.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Music className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No songs in setlist yet</p>
              {canEditSetlist && (
                <Button
                  onClick={() => setShowSongSearch(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add First Song
                </Button>
              )}
            </CardContent>
          </Card>
            )}
          </div>
          
          {/* Template Controls - Right sidebar like StagePlotDesigner */}
          <div className="space-y-4">
            {/* Save Template Section */}
            <div>
              <Button
                onClick={() => {
                  if (!setlist.name?.trim()) {
                    toast({
                      title: "Setlist Name Required",
                      description: "Please enter a setlist name first",
                      variant: "destructive"
                    });
                    return;
                  }
                  saveAsTemplate();
                }}
                disabled={setlist.songs.length === 0 || loading}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Template
              </Button>
            </div>

            {/* Load Template Section */}
            <div>
              <Label className="text-sm font-semibold">Load Template</Label>
              <div className="space-y-2 mt-2">
                {templates.map(template => (
                  <div key={template.id} className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 justify-start"
                      onClick={() => loadFromTemplate(template)}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {template.name}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteTemplate(template)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                {templates.length === 0 && (
                  <p className="text-sm text-gray-500">No saved templates</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Non-editable mode - just show songs */}
      {!canEditSetlist && (
        <div className="space-y-3">
          {setlist.songs.map((song, index) => (
            <Card key={index} className="relative">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                      {song.orderPosition}
                    </div>
                    
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h4 className="font-medium text-gray-900">{song.songTitle}</h4>
                        <p className="text-sm text-gray-600">{song.artistPerformer}</p>
                        {song.album && (
                          <p className="text-xs text-gray-500">Album: {song.album}</p>
                        )}
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-sm">
                          <span className="font-medium text-gray-700">Duration:</span> {formatDuration(song.estimatedDuration * 1000)}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium text-gray-700">Key:</span> {song.musicalKey || 'Not specified'}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium text-gray-700">Tempo:</span> {song.tempo ? `${song.tempo} BPM` : 'Not specified'}
                        </p>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-sm">
                          <span className="font-medium text-gray-700">Genre:</span> {song.genre}
                        </p>
                        {song.songwriters && song.songwriters.length > 0 && (
                          <p className="text-sm">
                            <span className="font-medium text-gray-700">Writers:</span> {song.songwriters.map(w => w.name).join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {song.notes && (
                  <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Notes:</strong> {song.notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {setlist.songs.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Music className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No songs in setlist yet</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Song Search Dialog */}
      {showSongSearch && (
        <SongSearchDialog
          open={showSongSearch}
          onClose={() => setShowSongSearch(false)}
          onSongSelected={addSongToSetlist}
          userRole={userRole}
        />
      )}

      {/* Chord Progression Viewer */}
      {selectedSongForChords && (
        <ChordProgressionViewer
          song={selectedSongForChords}
          instruments={assignedMusicians.flatMap(m => m.instruments || [])}
          onClose={() => setSelectedSongForChords(null)}
          onGenerateChords={generateChordChart}
          canGenerate={canEditSetlist}
        />
      )}

      {/* Song Edit Dialog */}
      {editingSong && (
        <Dialog open={!!editingSong} onOpenChange={() => setEditingSong(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Song: {editingSong.songTitle}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="song-title">Song Title</Label>
                  <Input
                    id="song-title"
                    value={editingSong.songTitle}
                    onChange={(e) => {
                      const songIndex = setlist.songs.findIndex(s => s.orderPosition === editingSong.orderPosition);
                      if (songIndex !== -1) {
                        updateSong(songIndex, { songTitle: e.target.value });
                        setEditingSong(prev => prev ? { ...prev, songTitle: e.target.value } : null);
                      }
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="artist-performer">Artist/Performer</Label>
                  <Input
                    id="artist-performer"
                    value={editingSong.artistPerformer}
                    onChange={(e) => {
                      const songIndex = setlist.songs.findIndex(s => s.orderPosition === editingSong.orderPosition);
                      if (songIndex !== -1) {
                        updateSong(songIndex, { artistPerformer: e.target.value });
                        setEditingSong(prev => prev ? { ...prev, artistPerformer: e.target.value } : null);
                      }
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="key-signature">Key Signature</Label>
                  <Input
                    id="key-signature"
                    value={editingSong.keySignature || ''}
                    onChange={(e) => {
                      const songIndex = setlist.songs.findIndex(s => s.orderPosition === editingSong.orderPosition);
                      if (songIndex !== -1) {
                        updateSong(songIndex, { keySignature: e.target.value });
                        setEditingSong(prev => prev ? { ...prev, keySignature: e.target.value } : null);
                      }
                    }}
                    placeholder="e.g., C, Am, F#"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tempo">Tempo (BPM)</Label>
                  <Input
                    id="tempo"
                    type="number"
                    value={editingSong.tempo || ''}
                    onChange={(e) => {
                      const songIndex = setlist.songs.findIndex(s => s.orderPosition === editingSong.orderPosition);
                      if (songIndex !== -1) {
                        updateSong(songIndex, { tempo: parseInt(e.target.value) || undefined });
                        setEditingSong(prev => prev ? { ...prev, tempo: parseInt(e.target.value) || undefined } : null);
                      }
                    }}
                    placeholder="120"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (seconds)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={editingSong.duration || ''}
                    onChange={(e) => {
                      const songIndex = setlist.songs.findIndex(s => s.orderPosition === editingSong.orderPosition);
                      if (songIndex !== -1) {
                        updateSong(songIndex, { duration: parseInt(e.target.value) || undefined });
                        setEditingSong(prev => prev ? { ...prev, duration: parseInt(e.target.value) || undefined } : null);
                      }
                    }}
                    placeholder="180"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="original-artist">Original Artist</Label>
                  <Input
                    id="original-artist"
                    value={editingSong.originalArtist || ''}
                    onChange={(e) => {
                      const songIndex = setlist.songs.findIndex(s => s.orderPosition === editingSong.orderPosition);
                      if (songIndex !== -1) {
                        updateSong(songIndex, { originalArtist: e.target.value });
                        setEditingSong(prev => prev ? { ...prev, originalArtist: e.target.value } : null);
                      }
                    }}
                    placeholder="If this is a cover"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="youtube-link">YouTube Link</Label>
                <Input
                  id="youtube-link"
                  value={editingSong.youtubeLink || ''}
                  onChange={(e) => {
                    const songIndex = setlist.songs.findIndex(s => s.orderPosition === editingSong.orderPosition);
                    if (songIndex !== -1) {
                      updateSong(songIndex, { youtubeLink: e.target.value });
                      setEditingSong(prev => prev ? { ...prev, youtubeLink: e.target.value } : null);
                    }
                  }}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="song-notes">Performance Notes</Label>
                <Input
                  id="song-notes"
                  value={editingSong.notes || ''}
                  onChange={(e) => {
                    const songIndex = setlist.songs.findIndex(s => s.orderPosition === editingSong.orderPosition);
                    if (songIndex !== -1) {
                      updateSong(songIndex, { notes: e.target.value });
                      setEditingSong(prev => prev ? { ...prev, notes: e.target.value } : null);
                    }
                  }}
                  placeholder="Special arrangements, tempo changes, etc."
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setEditingSong(null)}>
                  Done
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Template Save/Load Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {templateAction === 'save' ? 'Save Setlist as Template' : 'Load Template'}
            </DialogTitle>
          </DialogHeader>
          
          {templateAction === 'save' ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="template-name">Template Name *</Label>
                <Input
                  id="template-name"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Enter template name..."
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="template-description">Description</Label>
                <Input
                  id="template-description"
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  placeholder="Optional description..."
                  className="w-full"
                />
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium text-sm text-gray-700 mb-2">Template Content:</p>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <Badge variant="outline">{setlist.songs.length} Songs</Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDuration(totalDuration)}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => setShowTemplateDialog(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={saveAsTemplate}
                  disabled={loading || !templateName.trim()}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {loading ? 'Saving...' : 'Save Template'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {templates.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No templates available
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {templates.map((template) => (
                    <Card key={template.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <h4 className="font-medium">{template.name}</h4>
                          {template.description && (
                            <p className="text-sm text-gray-600">{template.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <Badge variant="outline">{template.songs?.length || 0} Songs</Badge>
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDuration(template.totalDuration)}
                            </Badge>
                            <span>Created {new Date(template.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <Button
                          onClick={() => loadTemplate(template)}
                          className="ml-4"
                        >
                          Load Template
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
              <div className="flex gap-2 justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => setShowTemplateDialog(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}