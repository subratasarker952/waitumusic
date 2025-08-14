import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Music, Upload, Mic, FileAudio, Headphones, Download, AlertCircle, CheckCircle, Clock, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface PlaybackTrack {
  id?: number;
  bookingId: number;
  songId?: number;
  customSongTitle?: string;
  customArtist?: string;
  originalFileUrl?: string;
  originalFileName?: string;
  setlistPosition?: number;
  songKey?: string;
  tempo?: number;
  duration?: string;
  transitionNotes?: string;
  performanceNotes?: string;
  vocalAnalysis?: {
    vocalConfidence: number;
    recommendation: string;
    message: string;
    duration: number;
    sampleRate: number;
    channels: number;
    analyzedAt: string;
  };
  separationStatus?: string;
  separationPerformed?: boolean;
  instrumentalTrackUrl?: string;
  vocalsTrackUrl?: string;
  djReadyTrackUrl?: string;
  djAccessEnabled?: boolean;
}

interface DjAccess {
  djName: string;
  djEmail: string;
  djPhone?: string;
  accessLevel: string;
  downloadLimit?: number;
  accessExpiresAt?: string;
  allowedTracks?: number[];
}

interface SetlistUploadProps {
  bookingId: number;
  onTracksUpdated?: () => void;
}

export function SetlistUpload({ bookingId, onTracksUpdated }: SetlistUploadProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [tracks, setTracks] = useState<PlaybackTrack[]>([]);
  const [djAccess, setDjAccess] = useState<DjAccess>({
    djName: '',
    djEmail: '',
    djPhone: '',
    accessLevel: 'full',
    downloadLimit: undefined,
    accessExpiresAt: '',
    allowedTracks: []
  });
  const [currentTrack, setCurrentTrack] = useState<PlaybackTrack>({
    bookingId,
    customSongTitle: '',
    customArtist: '',
    setlistPosition: 1,
    songKey: '',
    tempo: undefined,
    duration: '',
    transitionNotes: '',
    performanceNotes: '',
    djAccessEnabled: true
  });
  const [uploadingFiles, setUploadingFiles] = useState<{ [key: number]: boolean }>({});
  const [analyzingTracks, setAnalyzingTracks] = useState<{ [key: number]: boolean }>({});
  const [separatingTracks, setSeparatingTracks] = useState<{ [key: number]: boolean }>({});
  const [activeTab, setActiveTab] = useState<'tracks' | 'dj-access'>('tracks');

  // Load existing tracks when modal opens
  const loadPlaybackTracks = useCallback(async () => {
    try {
      const response: PlaybackTrack[] = await apiRequest(`/api/bookings/${bookingId}/playback-tracks`);
      setTracks(response || []);
    } catch (error) {
      console.error('Error loading playback tracks:', error);
      toast({
        title: "Error",
        description: "Failed to load existing tracks",
        variant: "destructive"
      });
    }
  }, [bookingId, toast]);

  const handleFileUpload = async (trackIndex: number, file: File) => {
    setUploadingFiles(prev => ({ ...prev, [trackIndex]: true }));

    try {
      // In a real implementation, you would upload the file to a file storage service
      // For now, we'll simulate the upload and use a placeholder URL
      const fileUrl = URL.createObjectURL(file);
      
      const updatedTracks = [...tracks];
      updatedTracks[trackIndex] = {
        ...updatedTracks[trackIndex],
        originalFileUrl: fileUrl,
        originalFileName: file.name
      };
      setTracks(updatedTracks);

      toast({
        title: "File Uploaded",
        description: `${file.name} uploaded successfully. Ready for vocal analysis.`
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload audio file",
        variant: "destructive"
      });
    } finally {
      setUploadingFiles(prev => ({ ...prev, [trackIndex]: false }));
    }
  };

  const analyzeTrack = async (trackIndex: number) => {
    const track = tracks[trackIndex];
    if (!track.originalFileUrl) {
      toast({
        title: "No File",
        description: "Please upload an audio file first",
        variant: "destructive"
      });
      return;
    }

    setAnalyzingTracks(prev => ({ ...prev, [trackIndex]: true }));

    try {
      // First save the track to get an ID
      if (!track.id) {
        const savedTrack: PlaybackTrack = await apiRequest(`/api/bookings/${bookingId}/playback-tracks`, {
          method: 'POST',
          body: track
        });
        
        const updatedTracks = [...tracks];
        updatedTracks[trackIndex] = { ...updatedTracks[trackIndex], id: savedTrack.id };
        setTracks(updatedTracks);
        track.id = savedTrack.id;
      }

      // Perform vocal analysis
      const analysisResponse: any = await apiRequest(`/api/playback-tracks/${track.id}/analyze`, {
        method: 'POST'
      });

      if (analysisResponse.success) {
        const updatedTracks = [...tracks];
        updatedTracks[trackIndex] = {
          ...updatedTracks[trackIndex],
          vocalAnalysis: analysisResponse.analysis
        };
        setTracks(updatedTracks);

        toast({
          title: "Analysis Complete",
          description: `Vocal analysis completed: ${analysisResponse.analysis.recommendation}`
        });
      }
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze track for vocal content",
        variant: "destructive"
      });
    } finally {
      setAnalyzingTracks(prev => ({ ...prev, [trackIndex]: false }));
    }
  };

  const separateVocals = async (trackIndex: number) => {
    const track = tracks[trackIndex];
    if (!track.id) {
      toast({
        title: "Save Track First",
        description: "Please save the track before vocal separation",
        variant: "destructive"
      });
      return;
    }

    setSeparatingTracks(prev => ({ ...prev, [trackIndex]: true }));

    try {
      const separationResponse: any = await apiRequest(`/api/playback-tracks/${track.id}/separate`, {
        method: 'POST'
      });

      if (separationResponse.success) {
        const updatedTracks = [...tracks];
        updatedTracks[trackIndex] = {
          ...updatedTracks[trackIndex],
          separationStatus: 'completed',
          separationPerformed: separationResponse.result.separation_performed,
          instrumentalTrackUrl: separationResponse.result.output_files?.instrumental,
          vocalsTrackUrl: separationResponse.result.output_files?.vocals,
          djReadyTrackUrl: separationResponse.result.output_files?.instrumental || 
                          separationResponse.result.output_files?.dj_ready ||
                          track.originalFileUrl
        };
        setTracks(updatedTracks);

        toast({
          title: "Vocal Separation Complete",
          description: separationResponse.result.separation_performed ? 
                      "Vocals successfully separated - DJ track ready!" :
                      "No vocal separation needed - track is already instrumental"
        });
      }
    } catch (error) {
      toast({
        title: "Separation Failed",
        description: "Failed to perform vocal separation",
        variant: "destructive"
      });
    } finally {
      setSeparatingTracks(prev => ({ ...prev, [trackIndex]: false }));
    }
  };

  const addTrack = () => {
    setTracks(prev => [...prev, {
      ...currentTrack,
      setlistPosition: prev.length + 1
    }]);
    setCurrentTrack({
      bookingId,
      customSongTitle: '',
      customArtist: '',
      setlistPosition: tracks.length + 2,
      songKey: '',
      tempo: undefined,
      duration: '',
      transitionNotes: '',
      performanceNotes: '',
      djAccessEnabled: true
    });
  };

  const saveSetlist = async () => {
    try {
      // Save all tracks
      for (const track of tracks) {
        if (!track.id) {
          await apiRequest(`/api/bookings/${bookingId}/playback-tracks`, {
            method: 'POST',
            body: track
          });
        }
      }

      toast({
        title: "Setlist Saved",
        description: "All tracks have been saved successfully"
      });
      
      onTracksUpdated?.();
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save setlist",
        variant: "destructive"
      });
    }
  };

  const createDjAccess = async () => {
    try {
      await apiRequest(`/api/bookings/${bookingId}/dj-access`, {
        method: 'POST',
        body: djAccess
      });

      toast({
        title: "DJ Access Created",
        description: "DJ access code has been generated and sent"
      });
    } catch (error) {
      toast({
        title: "Access Creation Failed",
        description: "Failed to create DJ access",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (track: PlaybackTrack) => {
    if (!track.originalFileUrl) return <Upload className="h-4 w-4 text-gray-400" />;
    if (analyzingTracks[tracks.indexOf(track)]) return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
    if (separatingTracks[tracks.indexOf(track)]) return <Loader2 className="h-4 w-4 animate-spin text-purple-500" />;
    if (track.separationStatus === 'completed') return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (track.vocalAnalysis) return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    return <Clock className="h-4 w-4 text-gray-400" />;
  };

  const getStatusText = (track: PlaybackTrack) => {
    if (!track.originalFileUrl) return "No file uploaded";
    if (analyzingTracks[tracks.indexOf(track)]) return "Analyzing vocals...";
    if (separatingTracks[tracks.indexOf(track)]) return "Separating vocals...";
    if (track.separationStatus === 'completed') return "DJ track ready";
    if (track.vocalAnalysis) return `${Math.round(track.vocalAnalysis.vocalConfidence * 100)}% vocal content`;
    return "Ready for analysis";
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={loadPlaybackTracks}>
          <Music className="h-4 w-4 mr-2" />
          Manage Setlist & DJ Tracks
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Setlist Upload & DJ Track Management</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="flex space-x-4 border-b">
            <button
              className={`pb-2 px-4 ${activeTab === 'tracks' ? 'border-b-2 border-emerald-500 text-emerald-600' : 'text-gray-600'}`}
              onClick={() => setActiveTab('tracks')}
            >
              <Music className="h-4 w-4 inline mr-2" />
              Setlist Tracks
            </button>
            <button
              className={`pb-2 px-4 ${activeTab === 'dj-access' ? 'border-b-2 border-emerald-500 text-emerald-600' : 'text-gray-600'}`}
              onClick={() => setActiveTab('dj-access')}
            >
              <Headphones className="h-4 w-4 inline mr-2" />
              DJ Access
            </button>
          </div>

          {activeTab === 'tracks' && (
            <div className="space-y-4">
              {/* Add New Track Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Add New Track</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="songTitle">Song Title</Label>
                      <Input
                        id="songTitle"
                        value={currentTrack.customSongTitle}
                        onChange={(e) => setCurrentTrack(prev => ({ ...prev, customSongTitle: e.target.value }))}
                        placeholder="Enter song title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="artist">Artist</Label>
                      <Input
                        id="artist"
                        value={currentTrack.customArtist}
                        onChange={(e) => setCurrentTrack(prev => ({ ...prev, customArtist: e.target.value }))}
                        placeholder="Enter artist name"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="position">Position</Label>
                      <Input
                        id="position"
                        type="number"
                        value={currentTrack.setlistPosition}
                        onChange={(e) => setCurrentTrack(prev => ({ ...prev, setlistPosition: parseInt(e.target.value) }))}
                        min="1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="key">Key</Label>
                      <Select value={currentTrack.songKey} onValueChange={(value) => setCurrentTrack(prev => ({ ...prev, songKey: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select key" />
                        </SelectTrigger>
                        <SelectContent>
                          {['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].map(key => (
                            <SelectItem key={key} value={key}>{key}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="tempo">BPM</Label>
                      <Input
                        id="tempo"
                        type="number"
                        value={currentTrack.tempo || ''}
                        onChange={(e) => setCurrentTrack(prev => ({ ...prev, tempo: parseInt(e.target.value) || undefined }))}
                        placeholder="120"
                      />
                    </div>
                    <div>
                      <Label htmlFor="duration">Duration</Label>
                      <Input
                        id="duration"
                        value={currentTrack.duration}
                        onChange={(e) => setCurrentTrack(prev => ({ ...prev, duration: e.target.value }))}
                        placeholder="3:45"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="notes">Performance Notes</Label>
                    <Textarea
                      id="notes"
                      value={currentTrack.performanceNotes}
                      onChange={(e) => setCurrentTrack(prev => ({ ...prev, performanceNotes: e.target.value }))}
                      placeholder="Special instructions, solo sections, energy level, etc."
                      rows={2}
                    />
                  </div>
                  <Button onClick={addTrack} disabled={!currentTrack.customSongTitle}>
                    Add Track
                  </Button>
                </CardContent>
              </Card>

              {/* Existing Tracks */}
              <div className="space-y-3">
                {tracks.map((track, index) => (
                  <Card key={index}>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <Badge variant="outline">#{track.setlistPosition}</Badge>
                          <div>
                            <h3 className="font-medium">{track.customSongTitle}</h3>
                            <p className="text-sm text-gray-600">{track.customArtist}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(track)}
                          <span className="text-sm text-gray-600">{getStatusText(track)}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>Key: <span className="font-medium">{track.songKey || 'Not set'}</span></div>
                        <div>BPM: <span className="font-medium">{track.tempo || 'Not set'}</span></div>
                        <div>Duration: <span className="font-medium">{track.duration || 'Not set'}</span></div>
                      </div>

                      {track.performanceNotes && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                          <strong>Notes:</strong> {track.performanceNotes}
                        </div>
                      )}

                      {/* File Upload and Processing */}
                      <div className="mt-4 space-y-3">
                        {!track.originalFileUrl ? (
                          <div>
                            <input
                              type="file"
                              accept="audio/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload(index, file);
                              }}
                              className="hidden"
                              id={`file-upload-${index}`}
                            />
                            <label htmlFor={`file-upload-${index}`}>
                              <Button variant="outline" className="w-full" asChild>
                                <span>
                                  <Upload className="h-4 w-4 mr-2" />
                                  Upload Audio File
                                </span>
                              </Button>
                            </label>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2 text-sm">
                              <FileAudio className="h-4 w-4" />
                              <span className="truncate">{track.originalFileName}</span>
                            </div>

                            {/* Vocal Analysis */}
                            {track.vocalAnalysis && (
                              <div className="p-3 bg-blue-50 rounded">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium">Vocal Analysis</span>
                                  <Badge variant={track.vocalAnalysis.vocalConfidence > 0.5 ? "default" : "secondary"}>
                                    {Math.round(track.vocalAnalysis.vocalConfidence * 100)}% Vocals
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600">{track.vocalAnalysis.message}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Recommendation: {track.vocalAnalysis.recommendation}
                                </p>
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex space-x-2">
                              {!track.vocalAnalysis && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => analyzeTrack(index)}
                                  disabled={analyzingTracks[index]}
                                >
                                  {analyzingTracks[index] ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                  ) : (
                                    <Mic className="h-4 w-4 mr-2" />
                                  )}
                                  Analyze Vocals
                                </Button>
                              )}

                              {track.vocalAnalysis && track.vocalAnalysis.vocalConfidence > 0.3 && 
                               track.separationStatus !== 'completed' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => separateVocals(index)}
                                  disabled={separatingTracks[index]}
                                >
                                  {separatingTracks[index] ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                  ) : (
                                    <Headphones className="h-4 w-4 mr-2" />
                                  )}
                                  Separate Vocals
                                </Button>
                              )}

                              {track.djReadyTrackUrl && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => window.open(track.djReadyTrackUrl, '_blank')}
                                >
                                  <Download className="h-4 w-4 mr-2" />
                                  Download DJ Track
                                </Button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={saveSetlist}>
                  Save Setlist
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'dj-access' && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>DJ Access Setup</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="djName">DJ Name/Company</Label>
                      <Input
                        id="djName"
                        value={djAccess.djName}
                        onChange={(e) => setDjAccess(prev => ({ ...prev, djName: e.target.value }))}
                        placeholder="DJ name or company"
                      />
                    </div>
                    <div>
                      <Label htmlFor="djEmail">DJ Email</Label>
                      <Input
                        id="djEmail"
                        type="email"
                        value={djAccess.djEmail}
                        onChange={(e) => setDjAccess(prev => ({ ...prev, djEmail: e.target.value }))}
                        placeholder="dj@example.com"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="djPhone">Phone (Optional)</Label>
                      <Input
                        id="djPhone"
                        value={djAccess.djPhone}
                        onChange={(e) => setDjAccess(prev => ({ ...prev, djPhone: e.target.value }))}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    <div>
                      <Label htmlFor="accessLevel">Access Level</Label>
                      <Select value={djAccess.accessLevel} onValueChange={(value) => setDjAccess(prev => ({ ...prev, accessLevel: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full">Full Access</SelectItem>
                          <SelectItem value="preview">Preview Only</SelectItem>
                          <SelectItem value="restricted">Restricted</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="downloadLimit">Download Limit</Label>
                      <Input
                        id="downloadLimit"
                        type="number"
                        value={djAccess.downloadLimit || ''}
                        onChange={(e) => setDjAccess(prev => ({ ...prev, downloadLimit: parseInt(e.target.value) || undefined }))}
                        placeholder="Unlimited"
                      />
                    </div>
                    <div>
                      <Label htmlFor="expiresAt">Access Expires</Label>
                      <Input
                        id="expiresAt"
                        type="datetime-local"
                        value={djAccess.accessExpiresAt}
                        onChange={(e) => setDjAccess(prev => ({ ...prev, accessExpiresAt: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="pt-4">
                    <Button 
                      onClick={createDjAccess} 
                      disabled={!djAccess.djName || !djAccess.djEmail}
                      className="w-full"
                    >
                      <Headphones className="h-4 w-4 mr-2" />
                      Generate DJ Access Code
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}