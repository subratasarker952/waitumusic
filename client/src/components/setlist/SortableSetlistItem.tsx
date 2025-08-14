import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Play,
  Pause,
  Trash2,
  Mic,
  Volume2,
  Guitar,
  Piano,
  Drum,
  Hash,
  GripVertical,
  ChevronDown,
  Music,
  Scissors
} from 'lucide-react';

interface SetlistSong {
  id: string;
  title: string;
  artist: string;
  duration: number;
  order: number;
  isrcCode?: string;
  audioFileUrl?: string;
  chordCharts: {
    [instrument: string]: {
      chords: string[];
      progression: string;
      difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
      capo?: number;
      tuning?: string;
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
}

interface SortableSetlistItemProps {
  song: SetlistSong;
  isPlaying: string | null;
  userRole: string;
  canEdit: boolean;
  formatDuration: (seconds: number) => string;
  playAudio: () => void;
  stopAudio: () => void;
  separateTracks: () => void;
  removeSong: () => void;
}

export const SortableSetlistItem: React.FC<SortableSetlistItemProps> = ({
  song,
  isPlaying,
  userRole,
  canEdit,
  formatDuration,
  playAudio,
  stopAudio,
  separateTracks,
  removeSong
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: song.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [showChords, setShowChords] = React.useState(false);
  const isCurrentlyPlaying = isPlaying === song.id;

  const getInstrumentIcon = (instrument: string) => {
    const lowerInstrument = instrument.toLowerCase();
    if (lowerInstrument.includes('guitar') || lowerInstrument.includes('bass')) {
      return <Guitar className="h-3 w-3" />;
    }
    if (lowerInstrument.includes('piano') || lowerInstrument.includes('keyboard')) {
      return <Piano className="h-3 w-3" />;
    }
    if (lowerInstrument.includes('drum')) {
      return <Drum className="h-3 w-3" />;
    }
    if (lowerInstrument.includes('vocal')) {
      return <Mic className="h-3 w-3" />;
    }
    return <Music className="h-3 w-3" />;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-card border rounded-lg"
    >
      <div className="flex items-center gap-3 p-4">
        {/* Drag Handle */}
        {canEdit && (
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
        )}

        {/* Song Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium truncate">{song.title}</h4>
            {song.isrcCode && (
              <Badge variant="outline" className="text-xs">
                <Hash className="h-2 w-2 mr-1" />
                {song.isrcCode}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{song.artist}</span>
            <span>{formatDuration(song.duration)}</span>
            <Badge variant="secondary" className="text-xs">
              {Object.keys(song.chordCharts).length} chord charts
            </Badge>
          </div>
        </div>

        {/* Audio Controls */}
        <div className="flex items-center gap-2">
          {song.audioFileUrl && (
            <Button
              size="sm"
              variant="outline"
              onClick={isCurrentlyPlaying ? stopAudio : playAudio}
            >
              {isCurrentlyPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            </Button>
          )}

          {/* Spleeter Button for DJs */}
          {userRole.includes('dj') && song.audioFileUrl && (
            <Button
              size="sm"
              variant="outline"
              onClick={separateTracks}
              title="Separate tracks for DJ use"
            >
              <Scissors className="h-3 w-3" />
            </Button>
          )}

          {/* Chord Charts Toggle */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowChords(!showChords)}
          >
            <ChevronDown className={`h-3 w-3 transition-transform ${showChords ? 'rotate-180' : ''}`} />
          </Button>

          {/* Remove Button */}
          {canEdit && (
            <Button
              size="sm"
              variant="outline"
              onClick={removeSong}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Chord Charts */}
      <Collapsible open={showChords} onOpenChange={setShowChords}>
        <CollapsibleContent>
          <div className="border-t p-4 bg-muted/30">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(song.chordCharts).map(([instrument, chart]) => (
                <Card key={instrument} className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    {getInstrumentIcon(instrument)}
                    <span className="font-medium text-sm">{instrument}</span>
                    <Badge className={`text-xs ${getDifficultyColor(chart.difficulty)}`}>
                      {chart.difficulty}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="font-medium">Chords: </span>
                      <span className="font-mono">{chart.chords.join(' - ')}</span>
                    </div>
                    <div>
                      <span className="font-medium">Progression: </span>
                      <span>{chart.progression}</span>
                    </div>
                    {chart.capo !== undefined && chart.capo > 0 && (
                      <div>
                        <span className="font-medium">Capo: </span>
                        <span>Fret {chart.capo}</span>
                      </div>
                    )}
                    {chart.tuning && (
                      <div>
                        <span className="font-medium">Tuning: </span>
                        <span>{chart.tuning}</span>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            {/* Separated Tracks for DJs */}
            {song.separatedTracks && (
              <div className="mt-4 border-t pt-4">
                <h5 className="font-medium text-sm mb-2 flex items-center gap-1">
                  <Volume2 className="h-3 w-3" />
                  Separated Tracks (DJ Mode)
                </h5>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  {Object.entries(song.separatedTracks).map(([trackType, url]) => (
                    url && (
                      <Button
                        key={trackType}
                        size="sm"
                        variant="outline"
                        className="text-xs capitalize"
                        onClick={() => {
                          const audio = new Audio(url);
                          audio.play();
                        }}
                      >
                        <Play className="h-2 w-2 mr-1" />
                        {trackType}
                      </Button>
                    )
                  ))}
                </div>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default SortableSetlistItem;