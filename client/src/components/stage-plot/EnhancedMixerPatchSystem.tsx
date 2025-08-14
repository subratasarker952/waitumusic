/**
 * Enhanced Mixer Patch System with Stage Plot Integration
 * Uses actual assigned talent data with proper instrument ordering
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PerfectButton } from '@/components/ui/perfect-button';
import { PerfectModal } from '@/components/ui/perfect-modal';
import { PerfectForm } from '@/components/ui/perfect-form';
import { LoadingSpinner } from '@/components/ui/perfect-loading';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Volume2, Mic, Settings, Save, Download, RotateCw, 
  Zap, Speaker, Music, Guitar, Piano, Drum
} from 'lucide-react';

interface StageAssignment {
  id: string;
  userId: number;
  name: string;
  stageName: string;
  primaryTalent: string;
  secondaryTalents: string[];
  assignedTo: string;
  isMainBookedTalent: boolean;
}

interface MixerChannel {
  channel: number;
  instrument: string;
  inputType: 'XLR' | 'TRS' | 'Instrument' | 'Line';
  phantom: boolean;
  gain: string;
  eq: {
    high: string;
    mid: string;
    low: string;
  };
  assignedTo: string;
  assignedUserId?: number;
  stageName: string;
  priority: number; // For ordering
  assigned: boolean;
  notes?: string;
}

interface EnhancedMixerPatchSystemProps {
  bookingId: number;
  assignedTalent?: StageAssignment[];
  canEdit?: boolean;
  onSave?: (data: any) => void;
}

// Instrument ordering priority (drums first, vocals last)
const INSTRUMENT_PRIORITY: Record<string, number> = {
  // Drums first
  'Drums': 1,
  'Drummer': 1,
  'Percussion': 2,
  'Percussionist': 2,
  
  // Bass instruments
  'Bass Player': 3,
  'Bass': 3,
  'Upright Bass': 3,
  
  // Guitars
  'Lead Guitarist': 4,
  'Rhythm Guitarist': 5,
  'Guitar': 4,
  'Electric Guitar': 4,
  'Acoustic Guitar': 5,
  
  // Keys/Piano
  'Keyboardist': 6,
  'Piano': 6,
  'Keyboard': 6,
  'Synth': 6,
  
  // Other instruments
  'Violinist': 7,
  'Violin': 7,
  'Saxophonist': 8,
  'Saxophone': 8,
  'Trumpet': 9,
  'Trombone': 10,
  'Flute': 11,
  
  // Vocals last
  'Lead Vocalist': 20,
  'Background Vocalist': 21,
  'Backing Vocals': 21,
  'Vocalist': 20,
  'Singer': 20
};

// Helper functions moved before component to fix hoisting issue
const getInstrumentInputType = (instrument: string): MixerChannel['inputType'] => {
  const lowerInstrument = instrument.toLowerCase();
  if (lowerInstrument.includes('keyboard') || lowerInstrument.includes('synth') || lowerInstrument.includes('piano')) return 'Line';
  if (lowerInstrument.includes('guitar') || lowerInstrument.includes('bass')) return 'Instrument';
  if (lowerInstrument.includes('vocal') || lowerInstrument.includes('mic') || lowerInstrument.includes('singer')) return 'XLR';
  if (lowerInstrument.includes('drum')) return 'XLR';
  return 'XLR';
};

const getInstrumentPhantomPower = (instrument: string): boolean => {
  const lowerInstrument = instrument.toLowerCase();
  return lowerInstrument.includes('vocal') || lowerInstrument.includes('condenser') || 
         lowerInstrument.includes('overhead') || lowerInstrument.includes('acoustic') ||
         lowerInstrument.includes('singer');
};

export default function EnhancedMixerPatchSystem({ 
  bookingId, 
  assignedTalent = [], 
  canEdit = true,
  onSave 
}: EnhancedMixerPatchSystemProps) {
  const { toast } = useToast();
  const [mixerChannels, setMixerChannels] = useState<MixerChannel[]>([]);
  const [totalChannels] = useState(32);
  const [isLoading, setIsLoading] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<MixerChannel | null>(null);

  // Generate mixer patch list from stage plot assignments
  const generateMixerPatchList = useMemo(() => {
    if (!assignedTalent.length) return [];

    const channels: MixerChannel[] = [];
    let channelNumber = 1;

    // Create talent entries with instruments
    const talentWithInstruments = assignedTalent.map(talent => ({
      ...talent,
      instruments: [talent.primaryTalent, ...talent.secondaryTalents].filter(Boolean)
    }));

    // Sort by instrument priority (drums first, vocals last)
    const sortedInstruments = talentWithInstruments
      .flatMap(talent => 
        talent.instruments.map(instrument => ({
          talent,
          instrument,
          priority: INSTRUMENT_PRIORITY[instrument] || 15
        }))
      )
      .sort((a, b) => a.priority - b.priority);

    // Generate channel assignments
    sortedInstruments.forEach(({ talent, instrument, priority }) => {
      if (channelNumber <= totalChannels) {
        const inputType = getInstrumentInputType(instrument);
        const phantom = getInstrumentPhantomPower(instrument);
        
        channels.push({
          channel: channelNumber,
          instrument: instrument,
          inputType,
          phantom,
          gain: '0dB',
          eq: { high: '0dB', mid: '0dB', low: '0dB' },
          assignedTo: talent.name,
          assignedUserId: talent.userId,
          stageName: talent.stageName,
          priority,
          assigned: true,
          notes: `Stage Plot Assignment: ${talent.stageName}`
        });
        
        channelNumber++;
      }
    });

    // Fill remaining channels as unassigned
    while (channelNumber <= totalChannels) {
      channels.push({
        channel: channelNumber,
        instrument: '',
        inputType: 'XLR',
        phantom: false,
        gain: '0dB',
        eq: { high: '0dB', mid: '0dB', low: '0dB' },
        assignedTo: '',
        stageName: '',
        priority: 999,
        assigned: false
      });
      channelNumber++;
    }

    return channels;
  }, [assignedTalent, totalChannels]);

  useEffect(() => {
    setMixerChannels(generateMixerPatchList);
  }, [generateMixerPatchList]);

  const getInstrumentIcon = (instrument: string) => {
    const lowerInstrument = instrument.toLowerCase();
    if (lowerInstrument.includes('vocal') || lowerInstrument.includes('singer')) return <Mic className="h-4 w-4" />;
    if (lowerInstrument.includes('guitar')) return <Guitar className="h-4 w-4" />;
    if (lowerInstrument.includes('drum')) return <Drum className="h-4 w-4" />;
    if (lowerInstrument.includes('keyboard') || lowerInstrument.includes('piano')) return <Piano className="h-4 w-4" />;
    if (lowerInstrument.includes('bass')) return <Music className="h-4 w-4" />;
    return <Speaker className="h-4 w-4" />;
  };

  const getChannelColor = (channel: MixerChannel): string => {
    if (!channel.assigned) return 'bg-gray-50 dark:bg-gray-900';
    if (channel.instrument.toLowerCase().includes('vocal') || channel.instrument.toLowerCase().includes('singer')) return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
    if (channel.instrument.toLowerCase().includes('drum')) return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
    if (channel.instrument.toLowerCase().includes('guitar')) return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
    if (channel.instrument.toLowerCase().includes('bass')) return 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800';
    if (channel.instrument.toLowerCase().includes('keyboard') || channel.instrument.toLowerCase().includes('piano')) return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
    return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
  };

  const saveMixerPatchList = async () => {
    setIsLoading(true);
    try {
      const patchData = {
        bookingId,
        totalChannels,
        assignedChannels: mixerChannels.filter(ch => ch.assigned),
        stageAssignments: assignedTalent,
        timestamp: new Date().toISOString(),
        generatedFromStagePlot: true
      };

      if (onSave) {
        await onSave(patchData);
      }

      toast({
        title: "Mixer Patch List Saved",
        description: `Successfully saved ${patchData.assignedChannels.length} channel assignments from stage plot`
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Could not save mixer patch list. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exportPatchList = () => {
    const assignedChannels = mixerChannels.filter(ch => ch.assigned);
    const exportData = {
      bookingId,
      generatedAt: new Date().toISOString(),
      totalChannels: assignedChannels.length,
      legend: assignedChannels.map(ch => ({
        channel: ch.channel,
        instrument: ch.instrument,
        assignedTo: ch.assignedTo,
        stageName: ch.stageName,
        inputType: ch.inputType,
        phantom: ch.phantom
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mixer-patch-list-booking-${bookingId}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Mixer patch list exported successfully"
    });
  };

  const assignedChannels = mixerChannels.filter(ch => ch.assigned);

  if (isLoading) {
    return <LoadingSpinner size="lg" text="Building mixer patch list from stage plot..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            Mixer Input Patch List
          </h3>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Generated from Stage Plot
          </Badge>
          <Badge variant="secondary">
            {assignedChannels.length}/{totalChannels} Channels
          </Badge>
        </div>
        <div className="flex gap-2">
          <PerfectButton
            onClick={saveMixerPatchList}
            icon={<Save className="h-4 w-4" />}
            disabled={!canEdit || isLoading}
          >
            Save Patch List
          </PerfectButton>
          <PerfectButton
            variant="outline"
            onClick={exportPatchList}
            icon={<Download className="h-4 w-4" />}
          >
            Export
          </PerfectButton>
        </div>
      </div>

      {/* Stage Plot Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Legend ({assignedChannels.length} items)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {assignedChannels.map((channel) => (
              <div 
                key={channel.channel}
                className={`p-3 rounded-lg border ${getChannelColor(channel)}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getInstrumentIcon(channel.instrument)}
                    <span className="font-medium">{channel.instrument}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Ch {channel.channel}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  <div>Assigned to: <span className="font-medium">{channel.assignedTo}</span></div>
                  <div>Stage Name: <span className="font-medium">{channel.stageName}</span></div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">{channel.inputType}</Badge>
                    {channel.phantom && <Zap className="h-3 w-3 text-yellow-500" />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Channel List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Channel Assignments (Ordered: Drums → Percussion → Bass → Guitars → Keys → Other → Vocals)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Ch</th>
                  <th className="text-left p-3">Instrument</th>
                  <th className="text-left p-3">Assigned To</th>
                  <th className="text-left p-3">Stage Name</th>
                  <th className="text-left p-3">Input</th>
                  <th className="text-left p-3">48V</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {assignedChannels.map((channel) => (
                  <tr 
                    key={channel.channel} 
                    className={`border-b hover:bg-gray-50 dark:hover:bg-gray-800 ${getChannelColor(channel)}`}
                  >
                    <td className="p-3 font-mono font-bold">
                      {channel.channel}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {getInstrumentIcon(channel.instrument)}
                        <span className="font-medium">{channel.instrument}</span>
                      </div>
                    </td>
                    <td className="p-3 font-medium">
                      {channel.assignedTo}
                    </td>
                    <td className="p-3">
                      <Badge variant="secondary">{channel.stageName}</Badge>
                    </td>
                    <td className="p-3">
                      <Badge variant="outline">{channel.inputType}</Badge>
                    </td>
                    <td className="p-3 text-center">
                      {channel.phantom ? (
                        <Zap className="h-4 w-4 text-yellow-500 mx-auto" />
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="p-3">
                      <PerfectButton
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedChannel(channel);
                          setShowDetailsModal(true);
                        }}
                        icon={<Settings className="h-4 w-4" />}
                      >
                        Details
                      </PerfectButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Channel Details Modal */}
      <PerfectModal
        open={showDetailsModal}
        onOpenChange={() => setShowDetailsModal(false)}
        title={`Channel ${selectedChannel?.channel} - ${selectedChannel?.instrument}`}
      >
        {selectedChannel && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Assigned To</label>
                <Input value={selectedChannel.assignedTo} disabled />
              </div>
              <div>
                <label className="text-sm font-medium">Stage Name</label>
                <Input value={selectedChannel.stageName} disabled />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Input Type</label>
                <Select value={selectedChannel.inputType} disabled>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="XLR">XLR</SelectItem>
                    <SelectItem value="TRS">TRS</SelectItem>
                    <SelectItem value="Instrument">Instrument</SelectItem>
                    <SelectItem value="Line">Line</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <Checkbox checked={selectedChannel.phantom} disabled />
                <label className="text-sm font-medium">Phantom Power</label>
              </div>
              <div>
                <label className="text-sm font-medium">Priority</label>
                <Input value={selectedChannel.priority.toString()} disabled />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Notes</label>
              <Input 
                value={selectedChannel.notes || 'Auto-generated from stage plot assignments'} 
                disabled 
              />
            </div>
          </div>
        )}
      </PerfectModal>
    </div>
  );
}