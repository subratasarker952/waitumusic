import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Music, Download, RefreshCw, AlertCircle, Volume2, Guitar } from 'lucide-react';

interface ChordProgression {
  id: number;
  instrument: string;
  chordData: {
    sections: Array<{
      name: string; // verse, chorus, bridge, etc.
      chords: Array<{
        chord: string;
        duration: number; // beats
        timestamp?: number; // seconds
      }>;
    }>;
    key: string;
    capo?: number;
    tuning?: string;
  };
  difficulty: string;
  generatedFrom: string;
}

interface ChordProgressionViewerProps {
  song: {
    id?: number;
    songTitle: string;
    artistPerformer: string;
    keySignature?: string;
    chordProgression?: string;
    youtubeLink?: string;
    uploadedTrackId?: number;
  };
  instruments: string[];
  onClose: () => void;
  onGenerateChords: (song: any, instrument: string) => void;
  canGenerate: boolean;
}

const COMMON_INSTRUMENTS = [
  'Guitar', 'Piano', 'Bass', 'Ukulele', 'Mandolin', 
  'Banjo', 'Violin', 'Cello', 'Harmonica'
];

export default function ChordProgressionViewer({
  song,
  instruments,
  onClose,
  onGenerateChords,
  canGenerate
}: ChordProgressionViewerProps) {
  const { toast } = useToast();
  const [chordProgressions, setChordProgressions] = useState<ChordProgression[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedInstrument, setSelectedInstrument] = useState('Guitar');
  const [generating, setGenerating] = useState<string | null>(null);

  // Get unique instruments from assigned musicians plus common instruments
  const availableInstruments = [
    ...new Set([...COMMON_INSTRUMENTS, ...instruments])
  ].sort();

  useEffect(() => {
    if (song.id) {
      loadChordProgressions();
    }
  }, [song.id]);

  const loadChordProgressions = async () => {
    if (!song.id) return;

    try {
      setLoading(true);
      const response = await apiRequest(`/api/setlist-songs/${song.id}/chords`);

      if (response.ok) {
        const data = await response.json();
        setChordProgressions(data);
      }
    } catch (error) {
      console.error('Error loading chord progressions:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateChordsForInstrument = async (instrument: string) => {
    if (!canGenerate) return;

    setGenerating(instrument);
    try {
      await onGenerateChords(song, instrument);
      // Reload progressions after generation
      setTimeout(() => {
        loadChordProgressions();
      }, 2000);
    } finally {
      setGenerating(null);
    }
  };

  const downloadChordChart = async (progressionId: number, instrument: string) => {
    try {
      const response = await apiRequest(`/api/chord-progressions/${progressionId}/pdf`);

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${song.songTitle}_${instrument}_chords.pdf`;
        a.click();
        URL.revokeObjectURL(url);

        toast({
          title: "Chord Chart Downloaded",
          description: `${instrument} chord chart downloaded successfully`
        });
      }
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download chord chart",
        variant: "destructive"
      });
    }
  };

  const renderChordProgression = (progression: ChordProgression) => {
    const { chordData } = progression;

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Guitar className="h-5 w-5" />
              {progression.instrument}
              <Badge variant="outline">{progression.difficulty}</Badge>
            </CardTitle>
            <div className="flex gap-2">
              <Badge variant="secondary">
                Generated from {progression.generatedFrom}
              </Badge>
              <Button
                size="sm"
                variant="outline"
                onClick={() => downloadChordChart(progression.id, progression.instrument)}
                className="flex items-center gap-1"
              >
                <Download className="h-3 w-3" />
                PDF
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>Key: {chordData.key}</span>
            {chordData.capo && <span>Capo: {chordData.capo}</span>}
            {chordData.tuning && <span>Tuning: {chordData.tuning}</span>}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {chordData.sections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="space-y-2">
                <h4 className="font-medium capitalize">{section.name}</h4>
                <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg">
                  {section.chords.map((chord, chordIndex) => (
                    <div
                      key={chordIndex}
                      className="flex flex-col items-center bg-white rounded p-2 min-w-[60px]"
                    >
                      <span className="font-bold text-lg">{chord.chord}</span>
                      <span className="text-xs text-gray-500">
                        {chord.duration} beats
                      </span>
                      {chord.timestamp && (
                        <span className="text-xs text-blue-600">
                          {Math.floor(chord.timestamp / 60)}:{(chord.timestamp % 60).toFixed(1).padStart(4, '0')}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const existingProgressions = chordProgressions.filter(p => 
    availableInstruments.includes(p.instrument)
  );

  const missingInstruments = availableInstruments.filter(instrument =>
    !chordProgressions.some(p => p.instrument === instrument)
  );

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Chord Progressions - {song.songTitle}
          </DialogTitle>
          <p className="text-sm text-gray-600">by {song.artistPerformer}</p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Manual Chord Progression (if available) */}
          {song.chordProgression && (
            <Card>
              <CardHeader>
                <CardTitle>Manual Chord Progression</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm">{song.chordProgression}</pre>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Existing Progressions */}
          {existingProgressions.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Available Chord Charts</h3>
              {existingProgressions.map(progression => (
                <div key={progression.id}>
                  {renderChordProgression(progression)}
                </div>
              ))}
            </div>
          )}

          {/* Generate Missing Progressions */}
          {canGenerate && missingInstruments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5" />
                  Generate Chord Charts
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Generate chord progressions for instruments assigned to this booking
                </p>
              </CardHeader>
              <CardContent>
                {!song.youtubeLink && !song.uploadedTrackId && (
                  <div className="flex items-center gap-2 p-4 bg-yellow-50 rounded-lg mb-4">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <p className="text-sm text-yellow-800">
                      Add a YouTube link or upload a track to enable automatic chord generation
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {missingInstruments.map(instrument => (
                    <Button
                      key={instrument}
                      variant="outline"
                      onClick={() => generateChordsForInstrument(instrument)}
                      disabled={generating === instrument || (!song.youtubeLink && !song.uploadedTrackId)}
                      className="flex items-center gap-2 h-12"
                    >
                      {generating === instrument ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Volume2 className="h-4 w-4" />
                          {instrument}
                        </>
                      )}
                    </Button>
                  ))}
                </div>

                {song.youtubeLink && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Audio Source:</strong> YouTube - 
                      <a 
                        href={song.youtubeLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline ml-1"
                      >
                        {song.youtubeLink.substring(0, 50)}...
                      </a>
                    </p>
                  </div>
                )}

                {song.uploadedTrackId && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>Audio Source:</strong> Uploaded Track (ID: {song.uploadedTrackId})
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* No progressions available */}
          {existingProgressions.length === 0 && !canGenerate && (
            <Card>
              <CardContent className="text-center py-12">
                <Music className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No chord progressions available for this song</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex justify-end pt-6 border-t">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}