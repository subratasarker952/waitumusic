import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Music, Mic, Users, Camera, Video, Headphones, Volume2, Play, Plus, X, Upload, ExternalLink, Clock, Settings, Lightbulb } from 'lucide-react';

interface StageItem {
  id: string;
  type: 'instrument' | 'vocal' | 'monitor' | 'equipment';
  name: string;
  position: { x: number; y: number };
  assignedTo?: string;
  icon: string;
}

interface MixerChannel {
  channel: number;
  instrument: string;
  input: string;
  phantomPower: boolean;
  assignedTo: string;
  stageItemId?: string;
}

interface SetlistSong {
  id: string;
  title: string;
  artist: string;
  key: string;
  tempo: number;
  duration: number;
  hasVocalRemoval?: boolean;
  audioFile?: string;
  youtubeUrl?: string;
}

interface Professional {
  id: string;
  type: 'photographer' | 'videographer' | 'dj';
  name: string;
  email: string;
  transferUrl?: string;
  uploadedFiles?: string[];
  equipment?: string[];
}

interface EquipmentRecommendation {
  professional: string;
  eventTime: string;
  artistPerformanceTime: string;
  lighting: 'daylight' | 'stage_lights' | 'low_light' | 'mixed';
  recommendations: {
    camera?: string;
    settings?: string;
    equipment?: string[];
    notes?: string;
  };
}

interface UnifiedTechnicalRiderProps {
  bookingId?: string;
  onSave?: (data: any) => void;
}

export default function UnifiedTechnicalRiderSystem({ bookingId, onSave }: UnifiedTechnicalRiderProps) {
  const [activeTab, setActiveTab] = useState('stage');
  const [stageItems, setStageItems] = useState<StageItem[]>([]);
  const [mixerChannels, setMixerChannels] = useState<MixerChannel[]>([]);
  const [setlist, setSetlist] = useState<SetlistSong[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [equipmentRecommendations, setEquipmentRecommendations] = useState<EquipmentRecommendation[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showProfessionalModal, setShowProfessionalModal] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [eventTime, setEventTime] = useState('19:00');
  const [artistPerformanceTime, setArtistPerformanceTime] = useState('20:30');

  // Initialize 32-channel mixer
  useEffect(() => {
    if (mixerChannels.length === 0) {
      const channels = Array.from({ length: 32 }, (_, i) => ({
        channel: i + 1,
        instrument: '',
        input: 'XLR',
        phantomPower: false,
        assignedTo: ''
      }));
      setMixerChannels(channels);
    }
  }, []);

  // Auto-populate mixer from stage plot
  useEffect(() => {
    const updatedChannels = [...mixerChannels];
    let channelIndex = 0;

    stageItems.forEach(item => {
      if ((item.type === 'instrument' || item.type === 'vocal') && channelIndex < 32) {
        updatedChannels[channelIndex] = {
          ...updatedChannels[channelIndex],
          instrument: item.name,
          assignedTo: item.assignedTo || '',
          stageItemId: item.id,
          phantomPower: item.type === 'vocal'
        };
        channelIndex++;
      }
    });

    setMixerChannels(updatedChannels);
  }, [stageItems]);

  const addStageItem = (type: string, name: string, assignedTo: string) => {
    const newItem: StageItem = {
      id: `${type}-${Date.now()}`,
      type: type as any,
      name,
      position: { x: Math.random() * 400, y: Math.random() * 300 },
      assignedTo,
      icon: getItemIcon(type)
    };
    setStageItems([...stageItems, newItem]);
    setShowAddModal(false);
  };

  const addProfessional = (type: string, name: string, email: string, transferUrl?: string, equipment?: string[]) => {
    const newProfessional: Professional = {
      id: `${type}-${Date.now()}`,
      type: type as any,
      name,
      email,
      transferUrl,
      uploadedFiles: [],
      equipment: equipment || []
    };
    setProfessionals([...professionals, newProfessional]);
    generateEquipmentRecommendations(newProfessional);
    setShowProfessionalModal(false);
  };

  const generateEquipmentRecommendations = (professional: Professional) => {
    const eventHour = parseInt(eventTime.split(':')[0]);
    const performanceHour = parseInt(artistPerformanceTime.split(':')[0]);
    
    let lighting: EquipmentRecommendation['lighting'] = 'stage_lights';
    if (eventHour >= 6 && eventHour < 18) lighting = 'daylight';
    else if (eventHour >= 18 && eventHour < 22) lighting = 'mixed';
    else lighting = 'low_light';

    let recommendations: EquipmentRecommendation['recommendations'] = {};

    if (professional.type === 'photographer') {
      recommendations = getPhotographyRecommendations(lighting, performanceHour);
    } else if (professional.type === 'videographer') {
      recommendations = getVideographyRecommendations(lighting, performanceHour);
    } else if (professional.type === 'dj') {
      recommendations = getDJRecommendations(lighting, performanceHour);
    }

    const newRecommendation: EquipmentRecommendation = {
      professional: professional.name,
      eventTime,
      artistPerformanceTime,
      lighting,
      recommendations
    };

    setEquipmentRecommendations(prev => [...prev.filter(r => r.professional !== professional.name), newRecommendation]);
  };

  const getPhotographyRecommendations = (lighting: string, performanceHour: number) => {
    const baseSettings = {
      daylight: "ISO 100-400, f/2.8-5.6, 1/125-1/250s",
      stage_lights: "ISO 800-3200, f/1.4-2.8, 1/60-1/125s", 
      low_light: "ISO 1600-6400, f/1.4-2.0, 1/30-1/60s",
      mixed: "ISO 400-1600, f/2.0-4.0, 1/60-1/125s"
    };

    const equipment = [
      "70-200mm f/2.8 lens for stage distance",
      "24-70mm f/2.8 for crowd and wide shots",
      "External flash with diffuser",
      "Monopod for stability during long performances"
    ];

    if (performanceHour >= 20) {
      equipment.push("High ISO capable camera body", "Fast prime lenses (50mm f/1.4, 85mm f/1.8)");
    }

    return {
      camera: "Full-frame DSLR/Mirrorless recommended for low light performance",
      settings: baseSettings[lighting as keyof typeof baseSettings],
      equipment,
      notes: `Performance at ${performanceHour}:00 - ${lighting.replace('_', ' ')} conditions expected. Consider venue size for lens selection.`
    };
  };

  const getVideographyRecommendations = (lighting: string, performanceHour: number) => {
    const frameRates = {
      daylight: "24-30fps standard, 60fps for slow motion",
      stage_lights: "24-30fps, avoid 60fps in low light",
      low_light: "24fps preferred for better light gathering",
      mixed: "24-30fps, adjust based on primary lighting"
    };

    const equipment = [
      "Tripod with fluid head for smooth pans",
      "External audio recorder for better sound",
      "Extra batteries (cold weather drains faster)",
      "Multiple memory cards (64GB+ recommended)"
    ];

    if (performanceHour >= 20) {
      equipment.push("Camera with good low-light video performance", "Fast zoom lens (24-70mm f/2.8)");
    }

    return {
      camera: "4K capable camera with good low-light video performance",
      settings: `${frameRates[lighting as keyof typeof frameRates]}. Manual focus for consistent shots.`,
      equipment,
      notes: `Performance at ${performanceHour}:00 - Plan multiple camera angles. Coordinate with lighting team for optimal exposure.`
    };
  };

  const getDJRecommendations = (lighting: string, performanceHour: number) => {
    const equipment = [
      "CDJ/Controller with USB and SD card backup",
      "Professional headphones (closed-back)",
      "Audio interface for laptop connection",
      "Backup laptop with identical software setup"
    ];

    if (performanceHour >= 22) {
      equipment.push("Extended battery pack for mobile setups", "Portable lighting for equipment visibility");
    }

    return {
      equipment,
      settings: "BPM matching for smooth transitions. Prepare setlist based on artist performance schedule.",
      notes: `Performance at ${performanceHour}:00 - Coordinate with sound engineer for optimal monitor mix. Prepare opening and closing music.`
    };
  };

  const addSongToSetlist = (song: Partial<SetlistSong>) => {
    const newSong: SetlistSong = {
      id: `song-${Date.now()}`,
      title: song.title || '',
      artist: song.artist || '',
      key: song.key || 'C',
      tempo: song.tempo || 120,
      duration: song.duration || 240,
      hasVocalRemoval: song.hasVocalRemoval || false,
      audioFile: song.audioFile,
      youtubeUrl: song.youtubeUrl
    };
    setSetlist([...setlist, newSong]);
  };

  const processVocalRemoval = async (songId: string) => {
    // DJ vocal removal using spleeter
    const song = setlist.find(s => s.id === songId);
    if (!song) return;

    try {
      const response = await fetch('/api/vocal-separation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          songId,
          audioFile: song.audioFile,
          youtubeUrl: song.youtubeUrl
        })
      });

      if (response.ok) {
        const updatedSetlist = setlist.map(s => 
          s.id === songId ? { ...s, hasVocalRemoval: true } : s
        );
        setSetlist(updatedSetlist);
      }
    } catch (error) {
      console.error('Vocal removal failed:', error);
    }
  };

  const generateEnergyFlow = () => {
    // Use tempo and key analysis for setlist flow
    const sortedByEnergy = [...setlist].sort((a, b) => {
      const energyA = calculateEnergy(a.tempo, a.key);
      const energyB = calculateEnergy(b.tempo, b.key);
      return energyA - energyB;
    });
    
    setSetlist(sortedByEnergy);
  };

  const calculateEnergy = (tempo: number, key: string) => {
    const tempoScore = tempo / 200 * 50; // Max 50 points
    const keyScore = ['C', 'G', 'D', 'A', 'E'].includes(key) ? 25 : 
                    ['F', 'Bb', 'Eb', 'Ab', 'Db'].includes(key) ? 15 : 20;
    return tempoScore + keyScore;
  };

  const getItemIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      instrument: '🎹',
      vocal: '🎤',
      monitor: '🔈',
      equipment: '🎛️'
    };
    return icons[type] || '🎵';
  };

  const getMonitorMixes = () => {
    const talentOnStage = stageItems.filter(item => item.assignedTo).length;
    const professionalCount = professionals.length;
    return talentOnStage + professionalCount;
  };

  const saveTechnicalRider = async () => {
    const technicalRiderData = {
      bookingId,
      stageItems,
      mixerChannels,
      setlist,
      professionals,
      monitorMixes: getMonitorMixes(),
      generatedAt: new Date().toISOString()
    };

    try {
      const response = await fetch('/api/technical-riders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(technicalRiderData)
      });

      if (response.ok && onSave) {
        onSave(technicalRiderData);
      }
    } catch (error) {
      console.error('Failed to save technical rider:', error);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Music className="h-6 w-6" />
          Unified Technical Rider System
        </h2>
        <Button onClick={saveTechnicalRider} className="bg-purple-600 hover:bg-purple-700">
          Save Technical Rider
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="stage">Stage Plot</TabsTrigger>
          <TabsTrigger value="mixer">32-Channel Mixer</TabsTrigger>
          <TabsTrigger value="setlist">Setlist Manager</TabsTrigger>
          <TabsTrigger value="professionals">Media Team</TabsTrigger>
        </TabsList>

        <TabsContent value="stage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Stage Plot Designer
                <Badge variant="outline">{stageItems.length} Items</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button onClick={() => setShowAddModal(true)} className="mb-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Stage Item
                </Button>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-[400px] relative bg-gray-50">
                  <div className="text-center text-gray-500 mb-4">Stage View</div>
                  {stageItems.map(item => (
                    <div
                      key={item.id}
                      className="absolute bg-white border rounded-lg p-2 shadow-sm cursor-move"
                      style={{ left: item.position.x, top: item.position.y }}
                    >
                      <div className="text-sm font-medium">{item.icon} {item.name}</div>
                      {item.assignedTo && (
                        <div className="text-xs text-gray-600">{item.assignedTo}</div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Instruments on Stage</Label>
                    <div className="space-y-1">
                      {stageItems.filter(item => item.type === 'instrument').map(item => (
                        <div key={item.id} className="text-sm">
                          {item.icon} {item.name} - {item.assignedTo}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label>Monitor Mixes Required: {getMonitorMixes()}</Label>
                    <div className="text-sm text-gray-600">
                      Based on talent and professionals on stage
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mixer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="h-5 w-5" />
                32-Channel Mixer & Patch List
                <Badge variant="outline">
                  {mixerChannels.filter(ch => ch.instrument).length}/32 Channels
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 max-h-96 overflow-y-auto">
                  {mixerChannels.map(channel => (
                    <div key={channel.channel} className="border rounded p-2 bg-gray-50">
                      <div className="text-xs font-medium">CH {channel.channel}</div>
                      <Input
                        placeholder="Instrument"
                        value={channel.instrument}
                        onChange={(e) => {
                          const updated = [...mixerChannels];
                          updated[channel.channel - 1].instrument = e.target.value;
                          setMixerChannels(updated);
                        }}
                        className="text-xs h-8 mb-1"
                      />
                      <div className="text-xs text-gray-600">{channel.assignedTo}</div>
                      {channel.phantomPower && (
                        <Badge variant="secondary" className="text-xs">48V</Badge>
                      )}
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <Label>Monitor Configuration</Label>
                  <div className="grid grid-cols-3 gap-4 mt-2">
                    <div className="text-center p-4 border rounded">
                      <Headphones className="h-8 w-8 mx-auto mb-2" />
                      <div className="text-sm font-medium">Wedge Monitors</div>
                      <div className="text-xs text-gray-600">{Math.ceil(getMonitorMixes() * 0.6)}</div>
                    </div>
                    <div className="text-center p-4 border rounded">
                      <Headphones className="h-8 w-8 mx-auto mb-2" />
                      <div className="text-sm font-medium">Wired IEM</div>
                      <div className="text-xs text-gray-600">{Math.ceil(getMonitorMixes() * 0.3)}</div>
                    </div>
                    <div className="text-center p-4 border rounded">
                      <Headphones className="h-8 w-8 mx-auto mb-2" />
                      <div className="text-sm font-medium">Wireless IEM</div>
                      <div className="text-xs text-gray-600">{Math.ceil(getMonitorMixes() * 0.1)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="setlist" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Setlist Manager
                <Badge variant="outline">{setlist.length} Songs</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button onClick={() => {
                    const title = prompt('Song Title:');
                    const artist = prompt('Artist:');
                    if (title && artist) {
                      addSongToSetlist({ title, artist });
                    }
                  }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Song
                  </Button>
                  <Button onClick={generateEnergyFlow} variant="outline">
                    Generate Energy Flow
                  </Button>
                </div>

                <div className="space-y-2">
                  {setlist.map((song, index) => (
                    <div key={song.id} className="border rounded p-3 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{index + 1}. {song.title}</div>
                          <div className="text-sm text-gray-600">
                            {song.artist} • {song.key} • {song.tempo} BPM • {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {!song.hasVocalRemoval && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => processVocalRemoval(song.id)}
                            >
                              Remove Vocals (DJ)
                            </Button>
                          )}
                          {song.hasVocalRemoval && (
                            <Badge variant="secondary">Vocal Removed</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {setlist.length > 0 && (
                  <div className="border-t pt-4">
                    <Label>Setlist Statistics</Label>
                    <div className="grid grid-cols-3 gap-4 mt-2">
                      <div className="text-center">
                        <div className="text-lg font-bold">{Math.floor(setlist.reduce((acc, song) => acc + song.duration, 0) / 60)}</div>
                        <div className="text-xs text-gray-600">Total Minutes</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold">{Math.round(setlist.reduce((acc, song) => acc + song.tempo, 0) / setlist.length)}</div>
                        <div className="text-xs text-gray-600">Avg BPM</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold">{setlist.filter(s => s.hasVocalRemoval).length}</div>
                        <div className="text-xs text-gray-600">Vocal Removed</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="professionals" className="space-y-4">
          {/* Event Timing Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Event Timing & Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="event-time">Event Start Time</Label>
                  <Input
                    id="event-time"
                    type="time"
                    value={eventTime}
                    onChange={(e) => {
                      setEventTime(e.target.value);
                      // Regenerate recommendations for all professionals
                      professionals.forEach(prof => generateEquipmentRecommendations(prof));
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="performance-time">Artist Performance Time</Label>
                  <Input
                    id="performance-time"
                    type="time"
                    value={artistPerformanceTime}
                    onChange={(e) => {
                      setArtistPerformanceTime(e.target.value);
                      // Regenerate recommendations for all professionals
                      professionals.forEach(prof => generateEquipmentRecommendations(prof));
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Media Team & Professionals
                <Badge variant="outline">{professionals.length} Team Members</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button onClick={() => setShowProfessionalModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Team Member
                </Button>

                <div className="grid gap-4">
                  {professionals.map(professional => (
                    <div key={professional.id} className="border rounded p-4 bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            {professional.type === 'photographer' && <Camera className="h-4 w-4" />}
                            {professional.type === 'videographer' && <Video className="h-4 w-4" />}
                            {professional.type === 'dj' && <Headphones className="h-4 w-4" />}
                            <span className="font-medium">{professional.name}</span>
                            <Badge variant="outline">{professional.type}</Badge>
                          </div>
                          <div className="text-sm text-gray-600 mt-1">{professional.email}</div>
                          {professional.transferUrl && (
                            <div className="flex items-center gap-1 mt-1">
                              <ExternalLink className="h-3 w-3" />
                              <a href={professional.transferUrl} target="_blank" rel="noopener noreferrer" 
                                 className="text-xs text-blue-600 hover:underline">
                                Transfer Link
                              </a>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              const rec = equipmentRecommendations.find(r => r.professional === professional.name);
                              if (rec) {
                                alert(`Equipment Recommendations for ${professional.name}:\n\n${JSON.stringify(rec.recommendations, null, 2)}`);
                              }
                            }}
                          >
                            <Settings className="h-3 w-3 mr-1" />
                            View Recommendations
                          </Button>
                          <Button size="sm" variant="outline">
                            <Upload className="h-3 w-3 mr-1" />
                            Upload Files
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Equipment Recommendations Display */}
                {equipmentRecommendations.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5" />
                        Equipment & Settings Guidance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {equipmentRecommendations.map((rec, index) => (
                          <div key={index} className="border rounded p-4 bg-blue-50">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="secondary">{rec.professional}</Badge>
                              <Badge variant="outline">Event: {rec.eventTime}</Badge>
                              <Badge variant="outline">Performance: {rec.artistPerformanceTime}</Badge>
                              <Badge variant="outline">{rec.lighting.replace('_', ' ')}</Badge>
                            </div>
                            
                            {rec.recommendations.camera && (
                              <div className="mb-2">
                                <strong>Camera:</strong> {rec.recommendations.camera}
                              </div>
                            )}
                            
                            {rec.recommendations.settings && (
                              <div className="mb-2">
                                <strong>Settings:</strong> {rec.recommendations.settings}
                              </div>
                            )}
                            
                            {rec.recommendations.equipment && (
                              <div className="mb-2">
                                <strong>Equipment:</strong>
                                <ul className="list-disc list-inside ml-4 text-sm">
                                  {rec.recommendations.equipment.map((eq, i) => (
                                    <li key={i}>{eq}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {rec.recommendations.notes && (
                              <div className="text-sm text-gray-600 bg-white p-2 rounded border-l-4 border-blue-400">
                                <strong>Notes:</strong> {rec.recommendations.notes}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Stage Item Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Stage Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Type</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instrument">🎹 Instrument</SelectItem>
                  <SelectItem value="vocal">🎤 Vocal</SelectItem>
                  <SelectItem value="monitor">🔈 Monitor</SelectItem>
                  <SelectItem value="equipment">🎛️ Equipment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Name</Label>
              <Input id="itemName" placeholder="e.g., Electric Guitar, Lead Vocal" />
            </div>
            <div>
              <Label>Assigned To</Label>
              <Input id="assignedTo" placeholder="Artist/Musician name" />
            </div>
            <Button onClick={() => {
              const name = (document.getElementById('itemName') as HTMLInputElement)?.value;
              const assignedTo = (document.getElementById('assignedTo') as HTMLInputElement)?.value;
              if (selectedType && name) {
                addStageItem(selectedType, name, assignedTo);
              }
            }}>
              Add Item
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Professional Modal */}
      <Dialog open={showProfessionalModal} onOpenChange={setShowProfessionalModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Type</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="photographer">📷 Photographer</SelectItem>
                  <SelectItem value="videographer">🎥 Videographer</SelectItem>
                  <SelectItem value="dj">🎧 DJ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Name</Label>
              <Input id="professionalName" placeholder="Professional name" />
            </div>
            <div>
              <Label>Email</Label>
              <Input id="professionalEmail" type="email" placeholder="contact@example.com" />
            </div>
            <div>
              <Label>Transfer URL (Optional)</Label>
              <Input id="transferUrl" placeholder="swisstransfer.com/... or wetransfer.com/..." />
            </div>
            <Button onClick={() => {
              const name = (document.getElementById('professionalName') as HTMLInputElement)?.value;
              const email = (document.getElementById('professionalEmail') as HTMLInputElement)?.value;
              const transferUrl = (document.getElementById('transferUrl') as HTMLInputElement)?.value;
              if (selectedType && name && email) {
                addProfessional(selectedType, name, email, transferUrl || undefined);
              }
            }}>
              Add Team Member
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}