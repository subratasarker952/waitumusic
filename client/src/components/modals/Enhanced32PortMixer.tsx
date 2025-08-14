import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Save, Volume2, Mic, Music, Settings, Users, Zap, Plus, Minus, Headphones, Sliders } from 'lucide-react';

interface MixerChannel {
  channel: number;
  inputName: string;
  inputType: 'microphone' | 'instrument' | 'playback' | 'monitor';
  assignedTo?: string;
  talentRole?: string;
  instrumentType?: string;
  gain: number;
  eq: {
    high: number;
    mid: number;
    low: number;
  };
  auxSend: number[];
  phantom48V: boolean;
  mute: boolean;
  solo: boolean;
  notes: string;
  isActive: boolean;
}

interface MonitorMix {
  mixNumber: number;
  name: string;
  assignedTalent: string;
  channels: { [channelNumber: number]: number }; // channel number -> send level
  masterLevel: number;
  eq: {
    high: number;
    mid: number;
    low: number;
  };
}

interface AssignedTalent {
  id: number;
  name: string;
  role: string;
  instruments?: string[];
  specialization?: string;
}

interface Enhanced32PortMixerProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId?: number;
  assignedTalent?: AssignedTalent[];
  stagePlotData?: any[];
  onSave?: (data: any) => void;
}

export default function Enhanced32PortMixer({
  isOpen,
  onClose,
  bookingId,
  assignedTalent = [],
  stagePlotData = [],
  onSave
}: Enhanced32PortMixerProps) {
  const { toast } = useToast();
  const [mixerChannels, setMixerChannels] = useState<MixerChannel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<number | null>(null);
  const [totalChannels, setTotalChannels] = useState(32);
  const [monitorMixes, setMonitorMixes] = useState<MonitorMix[]>([]);
  const [activeTab, setActiveTab] = useState<'channels' | 'monitors'>('channels');
  const [mixerSettings, setMixerSettings] = useState({
    masterVolume: 75,
    monitorMix: 60,
    effectsReturn: 50,
    crossfaderEnabled: false,
    talkbackEnabled: true
  });

  // Initialize channels and monitor mixes
  useEffect(() => {
    const initialChannels: MixerChannel[] = Array.from({ length: totalChannels }, (_, index) => ({
      channel: index + 1,
      inputName: `Channel ${index + 1}`,
      inputType: 'microphone',
      gain: 50,
      eq: { high: 0, mid: 0, low: 0 },
      auxSend: [0, 0, 0, 0], // 4 aux sends
      phantom48V: false,
      mute: false,
      solo: false,
      notes: '',
      isActive: index < 18 // First 18 channels active by default
    }));

    // Auto-assign common instruments
    const commonAssignments = [
      { channel: 1, name: 'Kick Drum', type: 'microphone' as const, phantom: false },
      { channel: 2, name: 'Snare Drum', type: 'microphone' as const, phantom: false },
      { channel: 3, name: 'Hi-Hat', type: 'microphone' as const, phantom: true },
      { channel: 4, name: 'Overhead L', type: 'microphone' as const, phantom: true },
      { channel: 5, name: 'Overhead R', type: 'microphone' as const, phantom: true },
      { channel: 6, name: 'Tom 1', type: 'microphone' as const, phantom: false },
      { channel: 7, name: 'Tom 2', type: 'microphone' as const, phantom: false },
      { channel: 8, name: 'Floor Tom', type: 'microphone' as const, phantom: false },
      { channel: 9, name: 'Bass DI', type: 'instrument' as const, phantom: false },
      { channel: 10, name: 'Bass Amp', type: 'microphone' as const, phantom: false },
      { channel: 11, name: 'Guitar Amp L', type: 'microphone' as const, phantom: false },
      { channel: 12, name: 'Guitar Amp R', type: 'microphone' as const, phantom: false },
      { channel: 13, name: 'Keyboard L', type: 'instrument' as const, phantom: false },
      { channel: 14, name: 'Keyboard R', type: 'instrument' as const, phantom: false },
      { channel: 15, name: 'Lead Vocal', type: 'microphone' as const, phantom: true },
      { channel: 16, name: 'BG Vocal 1', type: 'microphone' as const, phantom: true },
      { channel: 17, name: 'BG Vocal 2', type: 'microphone' as const, phantom: true },
      { channel: 18, name: 'BG Vocal 3', type: 'microphone' as const, phantom: true }
    ];

    commonAssignments.forEach(assignment => {
      const channelIndex = assignment.channel - 1;
      if (channelIndex < initialChannels.length) {
        initialChannels[channelIndex] = {
          ...initialChannels[channelIndex],
          inputName: assignment.name,
          inputType: assignment.type,
          phantom48V: assignment.phantom
        };
      }
    });

    setMixerChannels(initialChannels);

    // Initialize monitor mixes for assigned talent
    const initialMonitorMixes: MonitorMix[] = assignedTalent.slice(0, 6).map((talent, index) => ({
      mixNumber: index + 1,
      name: `${talent.name} Monitor`,
      assignedTalent: talent.name,
      channels: {},
      masterLevel: 75,
      eq: { high: 0, mid: 0, low: 0 }
    }));

    setMonitorMixes(initialMonitorMixes);
  }, [totalChannels, assignedTalent]);

  // Helper functions for dynamic port management
  const addChannels = (count: number) => {
    const newChannels: MixerChannel[] = Array.from({ length: count }, (_, index) => ({
      channel: totalChannels + index + 1,
      inputName: `Channel ${totalChannels + index + 1}`,
      inputType: 'microphone',
      gain: 50,
      eq: { high: 0, mid: 0, low: 0 },
      auxSend: [0, 0, 0, 0],
      phantom48V: false,
      mute: false,
      solo: false,
      notes: '',
      isActive: false
    }));
    
    setMixerChannels(prev => [...prev, ...newChannels]);
    setTotalChannels(prev => prev + count);
  };

  const removeChannels = (count: number) => {
    if (totalChannels - count < 8) {
      toast({
        title: "Cannot Remove Channels",
        description: "Minimum 8 channels required for basic operation",
        variant: "destructive"
      });
      return;
    }
    
    setMixerChannels(prev => prev.slice(0, totalChannels - count));
    setTotalChannels(prev => prev - count);
  };

  const updateChannel = (channelNumber: number, updates: Partial<MixerChannel>) => {
    setMixerChannels(prev => prev.map(channel => 
      channel.channel === channelNumber 
        ? { ...channel, ...updates }
        : channel
    ));
  };

  const assignTalentToChannel = (channelNumber: number, talentName: string) => {
    const talent = assignedTalent.find(t => t.name === talentName);
    if (talent) {
      updateChannel(channelNumber, {
        assignedTo: talent.name,
        talentRole: talent.role
      });
      toast({
        title: "Talent Assigned",
        description: `${talent.name} assigned to channel ${channelNumber}`
      });
    }
  };

  const resetChannel = (channelNumber: number) => {
    updateChannel(channelNumber, {
      inputName: `Channel ${channelNumber}`,
      inputType: 'microphone',
      assignedTo: undefined,
      talentRole: undefined,
      gain: 50,
      eq: { high: 0, mid: 0, low: 0 },
      auxSend: [0, 0, 0, 0],
      phantom48V: false,
      mute: false,
      solo: false,
      notes: ''
    });
  };

  const saveMixerConfiguration = () => {
    const mixerData = {
      channels: mixerChannels,
      settings: mixerSettings,
      bookingId,
      stagePlotIntegration: stagePlotData.length > 0,
      talentAssignments: mixerChannels.filter(ch => ch.assignedTo).length,
      createdAt: new Date().toISOString()
    };
    
    onSave?.(mixerData);
    toast({
      title: "Mixer Configuration Saved",
      description: "32-channel mixer setup saved successfully"
    });
  };

  const autoAssignFromStagePlot = () => {
    if (stagePlotData.length === 0) {
      toast({
        title: "No Stage Plot Data",
        description: "Complete stage plot first for automatic assignment",
        variant: "destructive"
      });
      return;
    }

    // Auto-assign based on stage plot items
    stagePlotData.forEach((stageItem, index) => {
      if (index < mixerChannels.length && stageItem.assignedTo) {
        const channelNumber = index + 1;
        updateChannel(channelNumber, {
          inputName: `${stageItem.name} - ${stageItem.assignedTo}`,
          assignedTo: stageItem.assignedTo,
          talentRole: stageItem.talentRole || 'performer'
        });
      }
    });

    toast({
      title: "Auto-Assignment Complete",
      description: "Mixer channels assigned based on stage plot"
    });
  };

  const getChannelTypeIcon = (type: string) => {
    switch (type) {
      case 'microphone': return <Mic className="h-4 w-4" />;
      case 'instrument': return <Music className="h-4 w-4" />;
      case 'playback': return <Volume2 className="h-4 w-4" />;
      case 'monitor': return <Settings className="h-4 w-4" />;
      default: return <Mic className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Enhanced {totalChannels}-Port Mixer Configuration
          </DialogTitle>
        </DialogHeader>

        {/* Tab Navigation */}
        <div className="flex space-x-1 border-b">
          <Button
            variant={activeTab === 'channels' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('channels')}
          >
            <Sliders className="h-4 w-4 mr-2" />
            Channel Configuration
          </Button>
          <Button
            variant={activeTab === 'monitors' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('monitors')}
          >
            <Headphones className="h-4 w-4 mr-2" />
            Monitor Mixes
          </Button>
        </div>

        {activeTab === 'channels' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Channel Management Controls */}
            <div className="lg:col-span-4 mb-4">
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className="text-lg px-3 py-1">
                        {totalChannels} Channels Total
                      </Badge>
                      <Badge variant="secondary">
                        {mixerChannels.filter(ch => ch.assignedTo).length} Assigned
                      </Badge>
                      <Badge variant="outline">
                        {mixerChannels.filter(ch => ch.isActive).length} Active
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addChannels(4)}
                        disabled={totalChannels >= 64}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add 4 Channels
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeChannels(4)}
                        disabled={totalChannels <= 8}
                      >
                        <Minus className="h-4 w-4 mr-1" />
                        Remove 4 Channels
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={autoAssignFromStagePlot}
                        disabled={stagePlotData.length === 0}
                      >
                        <Users className="h-4 w-4 mr-1" />
                        Auto-Assign from Stage Plot
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Mixer Channels Grid */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Mixer Channel Board</CardTitle>
                </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2 max-h-96 overflow-y-auto">
                  {mixerChannels.map((channel) => (
                    <div
                      key={channel.channel}
                      className={`p-2 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedChannel === channel.channel 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 shadow-lg' 
                          : channel.assignedTo
                          ? 'border-green-400 bg-green-50 dark:bg-green-950 hover:border-green-500'
                          : channel.isActive
                          ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-950 hover:border-yellow-500'
                          : 'border-gray-300 bg-gray-50 dark:bg-gray-900 hover:border-gray-400'
                      }`}
                      onClick={() => setSelectedChannel(channel.channel)}
                    >
                      <div className="text-center space-y-1">
                        <div className="text-xs font-bold flex items-center justify-center gap-1">
                          CH {channel.channel}
                          {channel.assignedTo && <Badge variant="secondary" className="text-xs px-1 py-0">A</Badge>}
                          {channel.isActive && !channel.assignedTo && <Badge variant="outline" className="text-xs px-1 py-0">ON</Badge>}
                        </div>
                        <div className="flex justify-center">
                          {getChannelTypeIcon(channel.inputType)}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {channel.inputName}
                        </div>
                        {channel.assignedTo && (
                          <Badge variant="secondary" className="text-xs">
                            {channel.assignedTo}
                          </Badge>
                        )}
                        <div className="space-y-1">
                          <div className="text-xs">Gain: {channel.gain}%</div>
                          <div className="flex gap-1">
                            {channel.mute && <Badge variant="destructive" className="text-xs px-1">M</Badge>}
                            {channel.solo && <Badge variant="default" className="text-xs px-1">S</Badge>}
                            {channel.phantom48V && <Badge variant="outline" className="text-xs px-1">48V</Badge>}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Channel Controls */}
          <div className="space-y-6">
            {selectedChannel && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Channel {selectedChannel} Controls</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="input-name">Input Name</Label>
                    <Input
                      id="input-name"
                      value={mixerChannels[selectedChannel - 1]?.inputName || ''}
                      onChange={(e) => updateChannel(selectedChannel, { inputName: e.target.value })}
                      className="h-8"
                    />
                  </div>

                  <div>
                    <Label>Input Type</Label>
                    <Select
                      value={mixerChannels[selectedChannel - 1]?.inputType}
                      onValueChange={(value) => updateChannel(selectedChannel, { inputType: value as any })}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="microphone">Microphone</SelectItem>
                        <SelectItem value="instrument">Instrument</SelectItem>
                        <SelectItem value="playback">Playback</SelectItem>
                        <SelectItem value="monitor">Monitor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {assignedTalent.length > 0 && (
                    <div>
                      <Label>Assign Talent</Label>
                      <Select
                        value={mixerChannels[selectedChannel - 1]?.assignedTo || ''}
                        onValueChange={(value) => assignTalentToChannel(selectedChannel, value)}
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
                    <Label htmlFor="gain">Gain: {mixerChannels[selectedChannel - 1]?.gain}%</Label>
                    <Input
                      id="gain"
                      type="range"
                      min="0"
                      max="100"
                      value={mixerChannels[selectedChannel - 1]?.gain || 50}
                      onChange={(e) => updateChannel(selectedChannel, { gain: Number(e.target.value) })}
                      className="h-8"
                    />
                  </div>

                  {/* EQ Controls */}
                  <div className="space-y-2">
                    <Label>3-Band EQ</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label className="text-xs">High</Label>
                        <Input
                          type="range"
                          min="-12"
                          max="12"
                          value={mixerChannels[selectedChannel - 1]?.eq.high || 0}
                          onChange={(e) => {
                            const currentEq = mixerChannels[selectedChannel - 1]?.eq || { high: 0, mid: 0, low: 0 };
                            updateChannel(selectedChannel, { 
                              eq: { ...currentEq, high: Number(e.target.value) }
                            });
                          }}
                          className="h-6"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Mid</Label>
                        <Input
                          type="range"
                          min="-12"
                          max="12"
                          value={mixerChannels[selectedChannel - 1]?.eq.mid || 0}
                          onChange={(e) => {
                            const currentEq = mixerChannels[selectedChannel - 1]?.eq || { high: 0, mid: 0, low: 0 };
                            updateChannel(selectedChannel, { 
                              eq: { ...currentEq, mid: Number(e.target.value) }
                            });
                          }}
                          className="h-6"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Low</Label>
                        <Input
                          type="range"
                          min="-12"
                          max="12"
                          value={mixerChannels[selectedChannel - 1]?.eq.low || 0}
                          onChange={(e) => {
                            const currentEq = mixerChannels[selectedChannel - 1]?.eq || { high: 0, mid: 0, low: 0 };
                            updateChannel(selectedChannel, { 
                              eq: { ...currentEq, low: Number(e.target.value) }
                            });
                          }}
                          className="h-6"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Channel Switches */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>48V Phantom Power</Label>
                      <Switch
                        checked={mixerChannels[selectedChannel - 1]?.phantom48V || false}
                        onCheckedChange={(checked) => updateChannel(selectedChannel, { phantom48V: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Mute</Label>
                      <Switch
                        checked={mixerChannels[selectedChannel - 1]?.mute || false}
                        onCheckedChange={(checked) => updateChannel(selectedChannel, { mute: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Solo</Label>
                      <Switch
                        checked={mixerChannels[selectedChannel - 1]?.solo || false}
                        onCheckedChange={(checked) => updateChannel(selectedChannel, { solo: checked })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={mixerChannels[selectedChannel - 1]?.notes || ''}
                      onChange={(e) => updateChannel(selectedChannel, { notes: e.target.value })}
                      className="h-16 text-xs"
                      placeholder="Channel notes..."
                    />
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => resetChannel(selectedChannel)}
                    className="w-full"
                    size="sm"
                  >
                    Reset Channel
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Master Controls */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Master Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Master Volume: {mixerSettings.masterVolume}%</Label>
                  <Input
                    type="range"
                    min="0"
                    max="100"
                    value={mixerSettings.masterVolume}
                    onChange={(e) => setMixerSettings(prev => ({ ...prev, masterVolume: Number(e.target.value) }))}
                    className="h-8"
                  />
                </div>

                <div>
                  <Label>Monitor Mix: {mixerSettings.monitorMix}%</Label>
                  <Input
                    type="range"
                    min="0"
                    max="100"
                    value={mixerSettings.monitorMix}
                    onChange={(e) => setMixerSettings(prev => ({ ...prev, monitorMix: Number(e.target.value) }))}
                    className="h-8"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Talkback</Label>
                  <Switch
                    checked={mixerSettings.talkbackEnabled}
                    onCheckedChange={(checked) => setMixerSettings(prev => ({ ...prev, talkbackEnabled: checked }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button onClick={saveMixerConfiguration} className="w-full" size="sm">
                  <Save className="h-4 w-4 mr-2" />
                  Save Mixer Config
                </Button>
                <Button variant="secondary" onClick={onClose} className="w-full" size="sm">
                  Close Mixer
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        )}

        {activeTab === 'monitors' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Headphones className="h-5 w-5" />
                  Monitor Mix Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {monitorMixes.map((monitorMix) => (
                    <Card key={monitorMix.mixNumber} className="border-2">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center justify-between">
                          <span>Mix {monitorMix.mixNumber}: {monitorMix.name}</span>
                          <Badge variant="outline">{monitorMix.assignedTalent}</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>Master Level: {monitorMix.masterLevel}%</Label>
                          <Input
                            type="range"
                            min="0"
                            max="100"
                            value={monitorMix.masterLevel}
                            onChange={(e) => {
                              const newMixes = monitorMixes.map(mix => 
                                mix.mixNumber === monitorMix.mixNumber 
                                  ? { ...mix, masterLevel: Number(e.target.value) }
                                  : mix
                              );
                              setMonitorMixes(newMixes);
                            }}
                            className="h-6"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Channel Sends</Label>
                          <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                            {mixerChannels.filter(ch => ch.assignedTo).map((channel) => (
                              <div key={channel.channel} className="text-center space-y-1">
                                <div className="text-xs font-medium">CH {channel.channel}</div>
                                <div className="text-xs text-muted-foreground truncate">{channel.inputName}</div>
                                <Input
                                  type="range"
                                  min="0"
                                  max="100"
                                  value={monitorMix.channels[channel.channel] || 0}
                                  onChange={(e) => {
                                    const newMixes = monitorMixes.map(mix => 
                                      mix.mixNumber === monitorMix.mixNumber 
                                        ? { 
                                            ...mix, 
                                            channels: { 
                                              ...mix.channels, 
                                              [channel.channel]: Number(e.target.value) 
                                            }
                                          }
                                        : mix
                                    );
                                    setMonitorMixes(newMixes);
                                  }}
                                  className="h-4"
                                />
                                <div className="text-xs">{monitorMix.channels[channel.channel] || 0}%</div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm">Monitor EQ</Label>
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <Label className="text-xs">High</Label>
                              <Input
                                type="range"
                                min="-12"
                                max="12"
                                value={monitorMix.eq.high}
                                onChange={(e) => {
                                  const newMixes = monitorMixes.map(mix => 
                                    mix.mixNumber === monitorMix.mixNumber 
                                      ? { ...mix, eq: { ...mix.eq, high: Number(e.target.value) }}
                                      : mix
                                  );
                                  setMonitorMixes(newMixes);
                                }}
                                className="h-4"
                              />
                              <div className="text-xs text-center">{monitorMix.eq.high}dB</div>
                            </div>
                            <div>
                              <Label className="text-xs">Mid</Label>
                              <Input
                                type="range"
                                min="-12"
                                max="12"
                                value={monitorMix.eq.mid}
                                onChange={(e) => {
                                  const newMixes = monitorMixes.map(mix => 
                                    mix.mixNumber === monitorMix.mixNumber 
                                      ? { ...mix, eq: { ...mix.eq, mid: Number(e.target.value) }}
                                      : mix
                                  );
                                  setMonitorMixes(newMixes);
                                }}
                                className="h-4"
                              />
                              <div className="text-xs text-center">{monitorMix.eq.mid}dB</div>
                            </div>
                            <div>
                              <Label className="text-xs">Low</Label>
                              <Input
                                type="range"
                                min="-12"
                                max="12"
                                value={monitorMix.eq.low}
                                onChange={(e) => {
                                  const newMixes = monitorMixes.map(mix => 
                                    mix.mixNumber === monitorMix.mixNumber 
                                      ? { ...mix, eq: { ...mix.eq, low: Number(e.target.value) }}
                                      : mix
                                  );
                                  setMonitorMixes(newMixes);
                                }}
                                className="h-4"
                              />
                              <div className="text-xs text-center">{monitorMix.eq.low}dB</div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <div className="mt-6 flex justify-center">
                  <Button onClick={saveMixerConfiguration} size="lg">
                    <Save className="h-4 w-4 mr-2" />
                    Save Complete Mixer Configuration
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}