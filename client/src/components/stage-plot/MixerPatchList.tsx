import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { 
  Volume2, Mic, Settings, Save, Download, Plus, Trash2, 
  RotateCw, Zap, Speaker, Music
} from 'lucide-react';

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
  aux: string[];
  assigned: boolean;
  assignedTo?: string;
  notes?: string;
}

interface MixerPatchListProps {
  bookingId: number;
  assignedMusicians?: any[];
  canEdit?: boolean;
  userRole?: string;
  onSave?: (data: any) => void;
  onLoad?: (data: any) => void;
}

export default function MixerPatchList({ 
  bookingId, 
  assignedMusicians = [], 
  canEdit = true, 
  userRole = 'user',
  onSave,
  onLoad 
}: MixerPatchListProps) {
  const { toast } = useToast();
  const [mixerChannels, setMixerChannels] = useState<MixerChannel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<number | null>(null);
  const [totalChannels, setTotalChannels] = useState(32);

  useEffect(() => {
    initializeMixerChannels();
  }, [totalChannels]);

  const initializeMixerChannels = () => {
    const channels: MixerChannel[] = [];
    for (let i = 1; i <= totalChannels; i++) {
      channels.push({
        channel: i,
        instrument: '',
        inputType: 'XLR',
        phantom: false,
        gain: '0dB',
        eq: { high: '0dB', mid: '0dB', low: '0dB' },
        aux: ['0', '0', '0', '0'],
        assigned: false
      });
    }
    setMixerChannels(channels);
  };

  const updateChannel = (channelNumber: number, updates: Partial<MixerChannel>) => {
    setMixerChannels(prev => prev.map(channel => 
      channel.channel === channelNumber 
        ? { ...channel, ...updates, assigned: !!(updates.instrument || channel.instrument) }
        : channel
    ));
  };

  const getInstrumentInputType = (instrument: string): MixerChannel['inputType'] => {
    const lowerInstrument = instrument.toLowerCase();
    if (lowerInstrument.includes('keyboard') || lowerInstrument.includes('synth')) return 'Line';
    if (lowerInstrument.includes('guitar') || lowerInstrument.includes('bass')) return 'Instrument';
    if (lowerInstrument.includes('vocal') || lowerInstrument.includes('mic')) return 'XLR';
    return 'XLR';
  };

  const getInstrumentPhantomPower = (instrument: string): boolean => {
    const lowerInstrument = instrument.toLowerCase();
    return lowerInstrument.includes('vocal') || lowerInstrument.includes('condenser') || 
           lowerInstrument.includes('overhead') || lowerInstrument.includes('acoustic');
  };

  const autoAssignChannels = () => {
    let channelIndex = 1;
    const updatedChannels = [...mixerChannels];

    assignedMusicians.forEach((musician: any) => {
      if (musician.instruments && Array.isArray(musician.instruments)) {
        musician.instruments.forEach((instrument: string) => {
          if (channelIndex <= totalChannels) {
            updatedChannels[channelIndex - 1] = {
              ...updatedChannels[channelIndex - 1],
              instrument: `${instrument} (${musician.name})`,
              inputType: getInstrumentInputType(instrument),
              phantom: getInstrumentPhantomPower(instrument),
              assigned: true,
              assignedTo: musician.name
            };
            channelIndex++;
          }
        });
      }
    });

    setMixerChannels(updatedChannels);
    toast({
      title: "Auto-Assignment Complete",
      description: `Assigned ${channelIndex - 1} channels automatically.`
    });
  };

  const clearAllChannels = () => {
    initializeMixerChannels();
    toast({
      title: "Channels Cleared",
      description: "All channel assignments have been cleared."
    });
  };

  const savePatchList = () => {
    const patchData = {
      bookingId,
      totalChannels,
      channels: mixerChannels.filter(ch => ch.assigned),
      timestamp: new Date().toISOString()
    };
    
    if (onSave) {
      onSave(patchData);
    }
    
    toast({
      title: "Patch List Saved",
      description: "Your mixer patch list has been saved successfully."
    });
  };

  const getChannelColor = (channel: MixerChannel): string => {
    if (!channel.assigned) return 'bg-gray-50';
    if (channel.instrument.toLowerCase().includes('vocal')) return 'bg-red-50 border-red-200';
    if (channel.instrument.toLowerCase().includes('drum')) return 'bg-orange-50 border-orange-200';
    if (channel.instrument.toLowerCase().includes('guitar')) return 'bg-blue-50 border-blue-200';
    if (channel.instrument.toLowerCase().includes('bass')) return 'bg-purple-50 border-purple-200';
    if (channel.instrument.toLowerCase().includes('keyboard')) return 'bg-green-50 border-green-200';
    return 'bg-yellow-50 border-yellow-200';
  };

  const assignedChannels = mixerChannels.filter(ch => ch.assigned).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold">Mixer Patch List</h3>
          <Badge variant="outline">
            {assignedChannels}/{totalChannels} Channels Used
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button onClick={savePatchList} size="sm">
            <Save className="h-4 w-4 mr-2" />
            Save Patch List
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Channel List */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base flex items-center">
                <Volume2 className="h-4 w-4 mr-2" />
                Input Channels
              </CardTitle>
              <div className="flex gap-2">
                <Button 
                  onClick={autoAssignChannels} 
                  size="sm" 
                  variant="outline"
                  disabled={!canEdit || assignedMusicians.length === 0}
                >
                  <RotateCw className="h-4 w-4 mr-2" />
                  Auto Assign
                </Button>
                <Button 
                  onClick={clearAllChannels} 
                  size="sm" 
                  variant="outline"
                  disabled={!canEdit}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Ch</th>
                      <th className="text-left p-2">Instrument</th>
                      <th className="text-left p-2">Input</th>
                      <th className="text-left p-2">48V</th>
                      <th className="text-left p-2">Gain</th>
                      <th className="text-left p-2">Assigned To</th>
                      <th className="text-left p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mixerChannels.map((channel) => (
                      <tr 
                        key={channel.channel} 
                        className={`border-b hover:bg-gray-50 ${getChannelColor(channel)}`}
                      >
                        <td className="p-2 font-mono">{channel.channel}</td>
                        <td className="p-2">
                          {canEdit ? (
                            <Input
                              value={channel.instrument}
                              onChange={(e) => updateChannel(channel.channel, { instrument: e.target.value })}
                              placeholder="Enter instrument..."
                              className="w-full"
                              size={16}
                            />
                          ) : (
                            <span>{channel.instrument || '-'}</span>
                          )}
                        </td>
                        <td className="p-2">
                          {canEdit ? (
                            <Select
                              value={channel.inputType}
                              onValueChange={(value: MixerChannel['inputType']) => 
                                updateChannel(channel.channel, { inputType: value })
                              }
                            >
                              <SelectTrigger className="w-20">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="XLR">XLR</SelectItem>
                                <SelectItem value="TRS">TRS</SelectItem>
                                <SelectItem value="Instrument">Inst</SelectItem>
                                <SelectItem value="Line">Line</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <Badge variant="outline">{channel.inputType}</Badge>
                          )}
                        </td>
                        <td className="p-2">
                          {canEdit ? (
                            <Checkbox
                              checked={channel.phantom}
                              onCheckedChange={(checked) => 
                                updateChannel(channel.channel, { phantom: checked === true })
                              }
                            />
                          ) : (
                            <div className="flex justify-center">
                              {channel.phantom ? <Zap className="h-4 w-4 text-yellow-500" /> : '-'}
                            </div>
                          )}
                        </td>
                        <td className="p-2">
                          {canEdit ? (
                            <Input
                              value={channel.gain}
                              onChange={(e) => updateChannel(channel.channel, { gain: e.target.value })}
                              placeholder="0dB"
                              className="w-16"
                            />
                          ) : (
                            <span>{channel.gain}</span>
                          )}
                        </td>
                        <td className="p-2">
                          {canEdit ? (
                            <Select
                              value={channel.assignedTo || ''}
                              onValueChange={(value) => 
                                updateChannel(channel.channel, { assignedTo: value })
                              }
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue placeholder="Select..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="unassigned">Unassigned</SelectItem>
                                {assignedMusicians.map((musician: any, idx: number) => (
                                  <SelectItem key={idx} value={musician.name}>
                                    {musician.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <span>{channel.assignedTo || '-'}</span>
                          )}
                        </td>
                        <td className="p-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedChannel(
                              selectedChannel === channel.channel ? null : channel.channel
                            )}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Channel Details Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Add</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {['Lead Vocal', 'Guitar', 'Bass', 'Drums', 'Keyboard', 'Backing Vocal'].map((instrument) => (
                <Button
                  key={instrument}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => {
                    const nextChannel = mixerChannels.find(ch => !ch.assigned);
                    if (nextChannel) {
                      updateChannel(nextChannel.channel, {
                        instrument,
                        inputType: getInstrumentInputType(instrument),
                        phantom: getInstrumentPhantomPower(instrument)
                      });
                    }
                  }}
                  disabled={!canEdit || assignedChannels >= totalChannels}
                >
                  {instrument === 'Lead Vocal' && <Mic className="h-4 w-4 mr-2" />}
                  {instrument === 'Guitar' && <Music className="h-4 w-4 mr-2" />}
                  {instrument === 'Bass' && <Music className="h-4 w-4 mr-2" />}
                  {instrument === 'Drums' && <Speaker className="h-4 w-4 mr-2" />}
                  {instrument === 'Keyboard' && <Settings className="h-4 w-4 mr-2" />}
                  {instrument === 'Backing Vocal' && <Mic className="h-4 w-4 mr-2" />}
                  {instrument}
                </Button>
              ))}
            </CardContent>
          </Card>

          {selectedChannel && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Channel {selectedChannel} EQ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(() => {
                  const channel = mixerChannels.find(ch => ch.channel === selectedChannel);
                  if (!channel) return null;
                  
                  return (
                    <>
                      <div>
                        <label className="text-sm font-medium">High</label>
                        <Input 
                          value={channel.eq.high} 
                          onChange={(e) => updateChannel(selectedChannel, { 
                            eq: { ...channel.eq, high: e.target.value } 
                          })}
                          placeholder="0dB"
                          disabled={!canEdit}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Mid</label>
                        <Input 
                          value={channel.eq.mid} 
                          onChange={(e) => updateChannel(selectedChannel, { 
                            eq: { ...channel.eq, mid: e.target.value } 
                          })}
                          placeholder="0dB"
                          disabled={!canEdit}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Low</label>
                        <Input 
                          value={channel.eq.low} 
                          onChange={(e) => updateChannel(selectedChannel, { 
                            eq: { ...channel.eq, low: e.target.value } 
                          })}
                          placeholder="0dB"
                          disabled={!canEdit}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Notes</label>
                        <Input 
                          value={channel.notes || ''} 
                          onChange={(e) => updateChannel(selectedChannel, { notes: e.target.value })}
                          placeholder="Channel notes..."
                          disabled={!canEdit}
                        />
                      </div>
                    </>
                  );
                })()}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm">
                <div className="flex justify-between">
                  <span>Assigned:</span>
                  <span>{assignedChannels}</span>
                </div>
                <div className="flex justify-between">
                  <span>Available:</span>
                  <span>{totalChannels - assignedChannels}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total:</span>
                  <span>{totalChannels}</span>
                </div>
              </div>
              
              <div className="mt-4">
                <label className="text-sm font-medium">Mixer Size</label>
                <Select
                  value={totalChannels.toString()}
                  onValueChange={(value) => setTotalChannels(parseInt(value))}
                  disabled={!canEdit}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="16">16 Channel</SelectItem>
                    <SelectItem value="24">24 Channel</SelectItem>
                    <SelectItem value="32">32 Channel</SelectItem>
                    <SelectItem value="48">48 Channel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}