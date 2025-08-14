import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Music, Mic, Volume2, Settings, Save, X } from 'lucide-react';

interface DrumKitComponent {
  id: string;
  name: string;
  type: 'acoustic' | 'electronic' | 'percussion';
  requiresMic: boolean;
  requiresChannel: boolean;
  requiresDI: boolean;
  isSelected: boolean;
  channelName?: string;
  micType?: 'dynamic' | 'condenser' | 'contact';
  notes?: string;
}

interface DrumKitConfig {
  id: string;
  performerName: string;
  performerId?: string;
  kitType: 'acoustic' | 'electronic' | 'hybrid';
  components: DrumKitComponent[];
  totalChannels: number;
  setupNotes: string;
}

interface DrumKitConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (config: DrumKitConfig) => void;
  performerName: string;
  performerId?: string;
  existingConfig?: DrumKitConfig;
  userInstruments?: string[];
}

// Standard drum kit components from database
const STANDARD_DRUM_COMPONENTS: DrumKitComponent[] = [
  { id: 'kick', name: 'Kick Drum', type: 'acoustic', requiresMic: true, requiresChannel: true, requiresDI: false, isSelected: true, channelName: 'Kick', micType: 'dynamic' },
  { id: 'kick-inner', name: 'Kick Mic Inner', type: 'acoustic', requiresMic: true, requiresChannel: true, requiresDI: false, isSelected: false, channelName: 'Kick In', micType: 'dynamic' },
  { id: 'snare-top', name: 'Snare Top', type: 'acoustic', requiresMic: true, requiresChannel: true, requiresDI: false, isSelected: true, channelName: 'Snare', micType: 'dynamic' },
  { id: 'snare-bottom', name: 'Snare Bottom', type: 'acoustic', requiresMic: true, requiresChannel: true, requiresDI: false, isSelected: false, channelName: 'Snare Btm', micType: 'condenser' },
  { id: 'hi-hat', name: 'Hi-Hat', type: 'acoustic', requiresMic: true, requiresChannel: true, requiresDI: false, isSelected: true, channelName: 'Hi-Hat', micType: 'condenser' },
  { id: 'high-tom', name: 'High Tom', type: 'acoustic', requiresMic: true, requiresChannel: true, requiresDI: false, isSelected: true, channelName: 'Tom 1', micType: 'dynamic' },
  { id: 'mid-tom', name: 'Mid Tom', type: 'acoustic', requiresMic: true, requiresChannel: true, requiresDI: false, isSelected: true, channelName: 'Tom 2', micType: 'dynamic' },
  { id: 'floor-tom', name: 'Floor Tom', type: 'acoustic', requiresMic: true, requiresChannel: true, requiresDI: false, isSelected: true, channelName: 'Floor Tom', micType: 'dynamic' },
  { id: 'overhead-l', name: 'Overhead L', type: 'acoustic', requiresMic: true, requiresChannel: true, requiresDI: false, isSelected: true, channelName: 'OH L', micType: 'condenser' },
  { id: 'overhead-r', name: 'Overhead R', type: 'acoustic', requiresMic: true, requiresChannel: true, requiresDI: false, isSelected: true, channelName: 'OH R', micType: 'condenser' },
  { id: 'crash', name: 'Crash Cymbal', type: 'acoustic', requiresMic: false, requiresChannel: false, requiresDI: false, isSelected: false, channelName: '', notes: 'Picked up by overheads' },
  { id: 'ride', name: 'Ride Cymbal', type: 'acoustic', requiresMic: false, requiresChannel: false, requiresDI: false, isSelected: false, channelName: '', notes: 'Picked up by overheads' },
  { id: 'ride-bell', name: 'Ride Bell', type: 'acoustic', requiresMic: true, requiresChannel: true, requiresDI: false, isSelected: false, channelName: 'Ride Bell', micType: 'condenser' }
];

export default function DrumKitConfigModal({
  isOpen,
  onClose,
  onConfirm,
  performerName,
  performerId,
  existingConfig,
  userInstruments = []
}: DrumKitConfigModalProps) {
  const { toast } = useToast();
  const [config, setConfig] = useState<DrumKitConfig>({
    id: existingConfig?.id || Date.now().toString(),
    performerName,
    performerId,
    kitType: existingConfig?.kitType || 'acoustic',
    components: existingConfig?.components || [...STANDARD_DRUM_COMPONENTS],
    totalChannels: 0,
    setupNotes: existingConfig?.setupNotes || ''
  });
  
  const [additionalComponents, setAdditionalComponents] = useState<DrumKitComponent[]>([]);
  const [availableInstruments, setAvailableInstruments] = useState<any[]>([]);

  // Fetch drum instruments from database
  useEffect(() => {
    const fetchDrumInstruments = async () => {
      try {
        const response = await fetch('/api/instruments');
        if (response.ok) {
          const allInstruments = await response.json();
          const drumInstruments = allInstruments.filter((inst: any) => 
            inst.mixer_group === 'DRUMS' || inst.mixer_group === 'PERCUSSION'
          );
          setAvailableInstruments(drumInstruments);
          
          // Create additional components from user instruments
          const userDrumInstruments = userInstruments.filter(instrument => 
            drumInstruments.some((dbInst: any) => 
              dbInst.name.toLowerCase().includes(instrument.toLowerCase()) ||
              instrument.toLowerCase().includes(dbInst.name.toLowerCase())
            )
          );
          
          const additionalComps = userDrumInstruments
            .filter(instrument => !STANDARD_DRUM_COMPONENTS.some(comp => 
              comp.name.toLowerCase().includes(instrument.toLowerCase())
            ))
            .map(instrument => ({
              id: `user-${instrument.replace(/\s+/g, '-').toLowerCase()}`,
              name: instrument,
              type: 'acoustic' as const,
              requiresMic: true,
              requiresChannel: true,
              requiresDI: false,
              isSelected: true,
              channelName: instrument,
              micType: 'dynamic' as const
            }));
          
          setAdditionalComponents(additionalComps);
          
        }
      } catch (error) {
        console.error('Error fetching drum instruments:', error);
      }
    };
    
    if (isOpen) {
      fetchDrumInstruments();
    }
  }, [isOpen, userInstruments]);

  // Calculate total channels
  useEffect(() => {
    const totalChannels = [...config.components, ...additionalComponents]
      .filter(comp => comp.isSelected && comp.requiresChannel)
      .length;
    setConfig(prev => ({ ...prev, totalChannels }));
  }, [config.components, additionalComponents]);

  const updateComponent = (componentId: string, updates: Partial<DrumKitComponent>) => {
    setConfig(prev => ({
      ...prev,
      components: prev.components.map(comp =>
        comp.id === componentId ? { ...comp, ...updates } : comp
      )
    }));
  };

  const updateAdditionalComponent = (componentId: string, updates: Partial<DrumKitComponent>) => {
    setAdditionalComponents(prev =>
      prev.map(comp =>
        comp.id === componentId ? { ...comp, ...updates } : comp
      )
    );
  };

  const addCustomComponent = () => {
    const newComponent: DrumKitComponent = {
      id: `custom-${Date.now()}`,
      name: 'Custom Component',
      type: 'acoustic',
      requiresMic: true,
      requiresChannel: true,
      requiresDI: false,
      isSelected: true,
      channelName: 'Custom',
      micType: 'dynamic'
    };
    setAdditionalComponents(prev => [...prev, newComponent]);
  };

  const removeCustomComponent = (componentId: string) => {
    setAdditionalComponents(prev => prev.filter(comp => comp.id !== componentId));
  };

  const handleConfirm = () => {
    const finalConfig: DrumKitConfig = {
      ...config,
      components: [...config.components, ...additionalComponents]
    };
    
    onConfirm(finalConfig);
    toast({
      title: "Drum Kit Configured",
      description: `${finalConfig.totalChannels} channels configured for ${performerName}`
    });
    onClose();
  };

  const selectedChannelCount = [...config.components, ...additionalComponents]
    .filter(comp => comp.isSelected && comp.requiresChannel)
    .length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Configure Drum Kit - {performerName}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="standard" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="standard">Standard Kit</TabsTrigger>
            <TabsTrigger value="additional">Additional/Custom</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
          </TabsList>

          <TabsContent value="standard" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Standard Drum Kit Components
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {config.components.map(component => (
                  <div key={component.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={component.isSelected}
                        onCheckedChange={(checked) => 
                          updateComponent(component.id, { isSelected: !!checked })
                        }
                      />
                      <div>
                        <div className="font-medium">{component.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {component.requiresMic && <Badge variant="outline" className="mr-1">Mic</Badge>}
                          {component.requiresChannel && <Badge variant="outline" className="mr-1">Channel</Badge>}
                          {component.requiresDI && <Badge variant="outline">DI</Badge>}
                        </div>
                      </div>
                    </div>
                    
                    {component.isSelected && component.requiresChannel && (
                      <div className="flex items-center gap-2">
                        <Label className="text-sm">Channel:</Label>
                        <Input
                          value={component.channelName || ''}
                          onChange={(e) => updateComponent(component.id, { channelName: e.target.value })}
                          className="w-24 h-8"
                          placeholder="Name"
                        />
                        {component.requiresMic && (
                          <select
                            value={component.micType || 'dynamic'}
                            onChange={(e) => updateComponent(component.id, { micType: e.target.value as any })}
                            className="text-sm border rounded px-2 py-1"
                          >
                            <option value="dynamic">Dynamic</option>
                            <option value="condenser">Condenser</option>
                            <option value="contact">Contact</option>
                          </select>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="additional" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4" />
                    Performer's Additional Instruments
                  </span>
                  <Button onClick={addCustomComponent} size="sm">
                    Add Custom
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {additionalComponents.map(component => (
                  <div key={component.id} className="flex items-center justify-between p-3 border rounded-lg bg-blue-50 dark:bg-blue-900/20">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={component.isSelected}
                        onCheckedChange={(checked) => 
                          updateAdditionalComponent(component.id, { isSelected: !!checked })
                        }
                      />
                      <div>
                        <Input
                          value={component.name}
                          onChange={(e) => updateAdditionalComponent(component.id, { name: e.target.value })}
                          className="font-medium mb-1"
                        />
                        <div className="flex gap-1">
                          <label className="flex items-center gap-1 text-sm">
                            <Checkbox
                              checked={component.requiresMic}
                              onCheckedChange={(checked) => 
                                updateAdditionalComponent(component.id, { requiresMic: !!checked })
                              }
                            />
                            Mic Required
                          </label>
                          <label className="flex items-center gap-1 text-sm">
                            <Checkbox
                              checked={component.requiresChannel}
                              onCheckedChange={(checked) => 
                                updateAdditionalComponent(component.id, { requiresChannel: !!checked })
                              }
                            />
                            Dedicated Channel
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {component.isSelected && component.requiresChannel && (
                        <Input
                          value={component.channelName || ''}
                          onChange={(e) => updateAdditionalComponent(component.id, { channelName: e.target.value })}
                          className="w-24 h-8"
                          placeholder="Channel"
                        />
                      )}
                      <Button
                        onClick={() => removeCustomComponent(component.id)}
                        size="sm"
                        variant="outline"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {additionalComponents.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    No additional instruments found for this performer.
                    Click "Add Custom" to add custom components.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="summary" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configuration Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Kit Type</Label>
                    <select
                      value={config.kitType}
                      onChange={(e) => setConfig(prev => ({ ...prev, kitType: e.target.value as any }))}
                      className="w-full border rounded px-3 py-2"
                    >
                      <option value="acoustic">Acoustic</option>
                      <option value="electronic">Electronic</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>
                  <div>
                    <Label>Total Channels Required</Label>
                    <div className="text-2xl font-bold text-blue-600">{selectedChannelCount}</div>
                  </div>
                </div>
                
                <div>
                  <Label>Setup Notes</Label>
                  <textarea
                    value={config.setupNotes}
                    onChange={(e) => setConfig(prev => ({ ...prev, setupNotes: e.target.value }))}
                    className="w-full border rounded px-3 py-2 h-20"
                    placeholder="Additional setup requirements, preferences, or notes..."
                  />
                </div>

                <Card className="bg-gray-50 dark:bg-gray-800">
                  <CardContent className="pt-4">
                    <h4 className="font-medium mb-2">Selected Components ({selectedChannelCount} channels):</h4>
                    <div className="space-y-1">
                      {[...config.components, ...additionalComponents]
                        .filter(comp => comp.isSelected && comp.requiresChannel)
                        .map(comp => (
                          <div key={comp.id} className="flex justify-between text-sm">
                            <span>{comp.name}</span>
                            <span className="text-muted-foreground">{comp.channelName}</span>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>
            <Save className="h-4 w-4 mr-2" />
            Configure Drum Kit ({selectedChannelCount} channels)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}