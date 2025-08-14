import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Music, Download, Play } from 'lucide-react';

interface SetlistItem {
  id: number;
  songTitle: string;
  artist: string;
  duration: number;
  key?: string;
  tempo?: number;
  order: number;
}

interface SetlistViewerProps {
  bookingId: number;
  workflowData: any;
}

export function SetlistViewer({ bookingId, workflowData }: SetlistViewerProps) {
  const setlist: SetlistItem[] = workflowData?.setlist || [];
  
  const totalDuration = setlist.reduce((acc, song) => acc + (song.duration || 0), 0);
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Performance Setlist</CardTitle>
              <CardDescription>
                {setlist.length} songs • {formatDuration(totalDuration)} total runtime
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" />
              Export PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {setlist.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                No setlist created yet
              </p>
            ) : (
              setlist.map((song, index) => (
                <Card key={song.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-bold text-muted-foreground">
                        {String(index + 1).padStart(2, '0')}
                      </div>
                      <div>
                        <p className="font-medium">{song.songTitle}</p>
                        <p className="text-sm text-muted-foreground">{song.artist}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {song.key && (
                        <Badge variant="outline">Key: {song.key}</Badge>
                      )}
                      {song.tempo && (
                        <Badge variant="outline">{song.tempo} BPM</Badge>
                      )}
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDuration(song.duration)}
                      </div>
                      <Button size="sm" variant="ghost">
                        <Play className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}