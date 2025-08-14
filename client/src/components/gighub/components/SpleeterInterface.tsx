import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  Headphones, Download, Play, Pause, Volume2, 
  Loader2, Music, Mic, Drum, Guitar
} from 'lucide-react';

interface Song {
  id: number;
  title: string;
  artist: string;
  duration?: number;
  hasSpleeterTracks?: boolean;
}

interface SpleeterInterfaceProps {
  bookingId: number;
  songs: Song[];
}

export function SpleeterInterface({ bookingId, songs }: SpleeterInterfaceProps) {
  const { toast } = useToast();
  const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());
  const [downloadProgress, setDownloadProgress] = useState<Record<number, number>>({});

  const processSpleeterMutation = useMutation({
    mutationFn: async (songId: number) => {
      setProcessingIds(prev => new Set(prev).add(songId));
      return apiRequest(`/api/songs/${songId}/process-spleeter`, {
        method: 'POST',
        body: { bookingId }
      });
    },
    onSuccess: (data, songId) => {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(songId);
        return newSet;
      });
      toast({
        title: "Track Separated",
        description: "Stems are ready for download"
      });
    },
    onError: (error, songId) => {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(songId);
        return newSet;
      });
      toast({
        title: "Processing Failed",
        description: "Unable to separate track. Please try again.",
        variant: "destructive"
      });
    }
  });

  const downloadStem = async (songId: number, stemType: string) => {
    try {
      setDownloadProgress(prev => ({ ...prev, [`${songId}-${stemType}`]: 0 }));
      
      const response = await fetch(`/api/songs/${songId}/stems/${stemType}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${songs.find(s => s.id === songId)?.title}-${stemType}.wav`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setDownloadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[`${songId}-${stemType}`];
        return newProgress;
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Unable to download stem. Please try again.",
        variant: "destructive"
      });
    }
  };

  const stemTypes = [
    { id: 'vocals', label: 'Vocals', icon: <Mic className="h-4 w-4" /> },
    { id: 'drums', label: 'Drums', icon: <Drum className="h-4 w-4" /> },
    { id: 'bass', label: 'Bass', icon: <Guitar className="h-4 w-4" /> },
    { id: 'other', label: 'Other', icon: <Music className="h-4 w-4" /> }
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>DJ Track Access</CardTitle>
          <CardDescription>
            Access original tracks and AI-separated stems for mixing
          </CardDescription>
        </CardHeader>
        <CardContent>
          {songs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Headphones className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No tracks assigned for this booking</p>
            </div>
          ) : (
            <div className="space-y-4">
              {songs.map((song) => (
                <Card key={song.id} className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{song.title}</p>
                        <p className="text-sm text-muted-foreground">{song.artist}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Play className="h-4 w-4 mr-1" />
                          Preview
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-1" />
                          Original
                        </Button>
                      </div>
                    </div>

                    {song.hasSpleeterTracks ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {stemTypes.map(stem => {
                          const progressKey = `${song.id}-${stem.id}`;
                          const isDownloading = Boolean(downloadProgress[progressKey]);
                          
                          return (
                            <Button
                              key={stem.id}
                              size="sm"
                              variant="secondary"
                              onClick={() => downloadStem(song.id, stem.id)}
                              disabled={isDownloading}
                            >
                              {isDownloading ? (
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                              ) : (
                                stem.icon
                              )}
                              {stem.label}
                            </Button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="bg-muted rounded-lg p-4">
                        {processingIds.has(song.id) ? (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Processing stems...</span>
                              <Loader2 className="h-4 w-4 animate-spin" />
                            </div>
                            <Progress value={33} className="h-2" />
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                              Stems not yet generated
                            </span>
                            <Button
                              size="sm"
                              onClick={() => processSpleeterMutation.mutate(song.id)}
                            >
                              <Volume2 className="h-4 w-4 mr-1" />
                              Generate Stems
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}