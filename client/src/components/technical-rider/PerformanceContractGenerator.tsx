import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, FileText, Plus, Trash2, Users, Calendar, Music, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BandMember {
  id: string;
  role: string;
  name: string;
  alternates?: string[];
}

interface ContractData {
  // Header Information
  serviceProvider: {
    company: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  client: {
    company: string;
    representative: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  event: {
    startDate: string;
    endDate: string;
    contractId: string;
    value: string;
    venue: string;
    eventType: string;
    duration: string;
  };
  artist: {
    name: string;
    stageName: string;
  };
  bandMembers: BandMember[];
  // Technical Requirements
  equipment: {
    clientProvides: string[];
    serviceProviderProvides: string[];
  };
  backlineEquipment: string[];
  mixerInputs: Array<{
    channel: number;
    instrument: string;
    applicable: boolean;
  }>;
  setlist: Array<{
    song: string;
    performerWriter: string;
    notes: string;
  }>;
  lighting: {
    requirements: string[];
    notes: string;
  };
  hospitality: {
    dressingRooms: string;
    refreshments: string[];
    transportation: string;
  };
  merchandise: {
    allowed: boolean;
    provisions: string;
  };
}

interface PerformanceContractGeneratorProps {
  bookingId: string;
  eventDetails?: any;
  assignedMusicians?: any[];
  onSave?: (contractData: ContractData) => void;
}

export default function PerformanceContractGenerator({
  bookingId,
  eventDetails,
  assignedMusicians = [],
  onSave
}: PerformanceContractGeneratorProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('header');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [contractData, setContractData] = useState<ContractData>({
    serviceProvider: {
      company: "Wai'tuMusic",
      address: "31 Bath Estate",
      city: "Roseau",
      state: "St George",
      postalCode: "00152",
      country: "Dominica"
    },
    client: {
      company: eventDetails?.clientCompany || "",
      representative: eventDetails?.clientRepresentative || "",
      address: "",
      city: "",
      state: "",
      postalCode: "",
      country: ""
    },
    event: {
      startDate: eventDetails?.eventDate || "",
      endDate: eventDetails?.endDate || "",
      contractId: `WM-CO-${String(Date.now()).slice(-5)}`,
      value: eventDetails?.totalCost || "",
      venue: eventDetails?.venueName || "",
      eventType: eventDetails?.eventType || "",
      duration: eventDetails?.duration || ""
    },
    artist: {
      name: eventDetails?.primaryArtist || "",
      stageName: eventDetails?.primaryArtist || ""
    },
    bandMembers: [],
    equipment: {
      clientProvides: [
        "One (1) Performance Stage",
        "Stage Lighting", 
        "Sound Reinforcement System",
        "Audio/Video Recording",
        "Audio/Video Streaming",
        "Photography"
      ],
      serviceProviderProvides: [
        "ARTIST",
        "BAND MAKEUP as aforementioned for the sake of the PERFORMANCE"
      ]
    },
    backlineEquipment: [
      "Aguilar Tone Hammer 500 Bass Head with 8 X 10 cabinet (preferred) or equivalent",
      "Fender twin reverb guitar amp or equivalent",
      "DW fusion drum kit (14'' snare; 10\", 12\", 16\" toms)",
      "DW 5000 kick pedal",
      "Meinl byzance cymbals (14\" hi hat, 16'' crash, 17/18\" crash, 8\" splash, splash stack, ride)",
      "Five (5) cymbal stands"
    ],
    mixerInputs: [
      { channel: 1, instrument: "Kick In", applicable: true },
      { channel: 2, instrument: "Kick Out", applicable: true },
      { channel: 3, instrument: "Snare Top", applicable: true },
      { channel: 4, instrument: "Snare Bottom", applicable: false },
      { channel: 5, instrument: "Hi Hat", applicable: true },
      { channel: 6, instrument: "Rack Tom 1", applicable: true },
      { channel: 7, instrument: "Rack Tom 2", applicable: true },
      { channel: 8, instrument: "Rack Tom 3 / Floor Tom", applicable: false },
      { channel: 9, instrument: "Over Head Left", applicable: true },
      { channel: 10, instrument: "Over Head Right", applicable: true },
      { channel: 11, instrument: "Bass DI", applicable: true },
      { channel: 12, instrument: "Bass Mic", applicable: false },
      { channel: 13, instrument: "Guitar 1", applicable: true },
      { channel: 14, instrument: "Guitar 2", applicable: false },
      { channel: 15, instrument: "Percussion – Electric Floor Tom", applicable: false },
      { channel: 16, instrument: "Percussion – Cow Bell", applicable: false },
      { channel: 17, instrument: "Keyboard 1 – Left", applicable: true },
      { channel: 18, instrument: "Keyboard 1 – Right", applicable: true },
      { channel: 19, instrument: "Keyboard 2 – Left", applicable: false },
      { channel: 20, instrument: "Keyboard 2 – Right", applicable: false },
      { channel: 25, instrument: "Brass", applicable: false },
      { channel: 33, instrument: "Background Vocals 1", applicable: true },
      { channel: 34, instrument: "Background Vocals 2", applicable: true },
      { channel: 37, instrument: "Lead Vox", applicable: true }
    ],
    setlist: [],
    lighting: {
      requirements: [
        "One-two (1-2) follow spots/spotlights for the ARTIST (as applicable)",
        "Gels for Pops lighting (variety of colors and patterns) (as applicable)"
      ],
      notes: "All lighting equipment must be pre-hung prior to arrival for rehearsal."
    },
    hospitality: {
      dressingRooms: "One (1) dressing room for the ARTIST and BAND",
      refreshments: [
        "Bottle(s) of spring water (room temperature)",
        "A variety of fruit juices (orange is preferred)",
        "Hot water, honey and lemon for tea",
        "Coffee"
      ],
      transportation: "Ground transportation for ARTIST and BAND - arrive 30 min before rehearsal, 60 min before performance"
    },
    merchandise: {
      allowed: true,
      provisions: "CLIENT agrees to make provision for ARTIST/SERVICE PROVIDER to sell PERFORMANCE-related merchandise, photos, interviews, and autographs as possible."
    }
  });

  // Auto-populate band members from assigned musicians
  React.useEffect(() => {
    if (assignedMusicians.length > 0 && contractData.bandMembers.length === 0) {
      const members = assignedMusicians.map((musician, index) => ({
        id: `member-${index}`,
        role: musician.instruments?.[0] || "Musician",
        name: musician.name,
        alternates: []
      }));
      
      setContractData(prev => ({
        ...prev,
        bandMembers: members
      }));
    }
  }, [assignedMusicians]);

  const addBandMember = () => {
    const newMember: BandMember = {
      id: `member-${Date.now()}`,
      role: "",
      name: "",
      alternates: []
    };
    
    setContractData(prev => ({
      ...prev,
      bandMembers: [...prev.bandMembers, newMember]
    }));
  };

  const updateBandMember = (id: string, updates: Partial<BandMember>) => {
    setContractData(prev => ({
      ...prev,
      bandMembers: prev.bandMembers.map(member => 
        member.id === id ? { ...member, ...updates } : member
      )
    }));
  };

  const removeBandMember = (id: string) => {
    setContractData(prev => ({
      ...prev,
      bandMembers: prev.bandMembers.filter(member => member.id !== id)
    }));
  };

  const addSetlistSong = () => {
    setContractData(prev => ({
      ...prev,
      setlist: [...prev.setlist, { song: "", performerWriter: "", notes: "" }]
    }));
  };

  const exportContract = async () => {
    try {
      setIsGenerating(true);
      
      const response = await fetch('/api/performance-contract/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId,
          contractData,
          eventDetails
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Performance_Contract_${contractData.event.contractId}_${new Date().toISOString().split('T')[0]}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        toast({
          title: "Contract Exported Successfully",
          description: "Professional performance contract PDF has been generated and downloaded."
        });
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Unable to export contract. Please check all required fields and try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-primary" />
                Performance Contract Generator
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Generate industry-standard performance contracts matching the professional template format
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={exportContract} disabled={isGenerating} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                {isGenerating ? 'Generating...' : 'Export Contract PDF'}
              </Button>
              <Button onClick={() => onSave?.(contractData)}>
                Save Contract Data
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Contract Form */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="header">Header Info</TabsTrigger>
          <TabsTrigger value="band">Band Makeup</TabsTrigger>
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
          <TabsTrigger value="mixer">Mixer Inputs</TabsTrigger>
          <TabsTrigger value="setlist">Setlist</TabsTrigger>
          <TabsTrigger value="production">Production</TabsTrigger>
        </TabsList>

        {/* Header Information Tab */}
        <TabsContent value="header" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Service Provider */}
            <Card>
              <CardHeader>
                <CardTitle>Service Provider Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Company Name</Label>
                  <Input
                    value={contractData.serviceProvider.company}
                    onChange={(e) => setContractData(prev => ({
                      ...prev,
                      serviceProvider: { ...prev.serviceProvider, company: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label>Address</Label>
                  <Input
                    value={contractData.serviceProvider.address}
                    onChange={(e) => setContractData(prev => ({
                      ...prev,
                      serviceProvider: { ...prev.serviceProvider, address: e.target.value }
                    }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>City</Label>
                    <Input
                      value={contractData.serviceProvider.city}
                      onChange={(e) => setContractData(prev => ({
                        ...prev,
                        serviceProvider: { ...prev.serviceProvider, city: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <Label>State/Province</Label>
                    <Input
                      value={contractData.serviceProvider.state}
                      onChange={(e) => setContractData(prev => ({
                        ...prev,
                        serviceProvider: { ...prev.serviceProvider, state: e.target.value }
                      }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Client Information */}
            <Card>
              <CardHeader>
                <CardTitle>Client Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Client Company</Label>
                  <Input
                    value={contractData.client.company}
                    onChange={(e) => setContractData(prev => ({
                      ...prev,
                      client: { ...prev.client, company: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label>Representative Name</Label>
                  <Input
                    value={contractData.client.representative}
                    onChange={(e) => setContractData(prev => ({
                      ...prev,
                      client: { ...prev.client, representative: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label>Address</Label>
                  <Input
                    value={contractData.client.address}
                    onChange={(e) => setContractData(prev => ({
                      ...prev,
                      client: { ...prev.client, address: e.target.value }
                    }))}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Event Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Event Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={contractData.event.startDate}
                  onChange={(e) => setContractData(prev => ({
                    ...prev,
                    event: { ...prev.event, startDate: e.target.value }
                  }))}
                />
              </div>
              <div>
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={contractData.event.endDate}
                  onChange={(e) => setContractData(prev => ({
                    ...prev,
                    event: { ...prev.event, endDate: e.target.value }
                  }))}
                />
              </div>
              <div>
                <Label>Contract Value</Label>
                <Input
                  value={contractData.event.value}
                  onChange={(e) => setContractData(prev => ({
                    ...prev,
                    event: { ...prev.event, value: e.target.value }
                  }))}
                  placeholder="$4,000.00"
                />
              </div>
              <div>
                <Label>Contract ID</Label>
                <Input
                  value={contractData.event.contractId}
                  onChange={(e) => setContractData(prev => ({
                    ...prev,
                    event: { ...prev.event, contractId: e.target.value }
                  }))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Band Makeup Tab */}
        <TabsContent value="band" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Band Makeup & Personnel
                </CardTitle>
                <Button onClick={addBandMember} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Band Member
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {contractData.bandMembers.map((member) => (
                <div key={member.id} className="border rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Role in Band</Label>
                      <Select
                        value={member.role}
                        onValueChange={(value) => updateBandMember(member.id, { role: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Drummer">Drummer</SelectItem>
                          <SelectItem value="Bass Player">Bass Player</SelectItem>
                          <SelectItem value="Guitarist">Guitarist</SelectItem>
                          <SelectItem value="Keyboardist">Keyboardist</SelectItem>
                          <SelectItem value="Background Vocalist">Background Vocalist</SelectItem>
                          <SelectItem value="Lead Vocalist">Lead Vocalist</SelectItem>
                          <SelectItem value="Percussionist">Percussionist</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Name</Label>
                      <Input
                        value={member.name}
                        onChange={(e) => updateBandMember(member.id, { name: e.target.value })}
                        placeholder="Musician name"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeBandMember(member.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {contractData.bandMembers.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No band members added yet. Click "Add Band Member" to begin.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Setlist Tab */}
        <TabsContent value="setlist" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Music className="h-5 w-5" />
                  Performance Setlist
                </CardTitle>
                <Button onClick={addSetlistSong} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Song
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contractData.setlist.map((song, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
                    <div>
                      <Label>Song Title</Label>
                      <Input
                        value={song.song}
                        onChange={(e) => {
                          const newSetlist = [...contractData.setlist];
                          newSetlist[index].song = e.target.value;
                          setContractData(prev => ({ ...prev, setlist: newSetlist }));
                        }}
                        placeholder="Song title"
                      />
                    </div>
                    <div>
                      <Label>Performer/Writer</Label>
                      <Input
                        value={song.performerWriter}
                        onChange={(e) => {
                          const newSetlist = [...contractData.setlist];
                          newSetlist[index].performerWriter = e.target.value;
                          setContractData(prev => ({ ...prev, setlist: newSetlist }));
                        }}
                        placeholder="Original artist/composer"
                      />
                    </div>
                    <div>
                      <Label>Notes</Label>
                      <Input
                        value={song.notes}
                        onChange={(e) => {
                          const newSetlist = [...contractData.setlist];
                          newSetlist[index].notes = e.target.value;
                          setContractData(prev => ({ ...prev, setlist: newSetlist }));
                        }}
                        placeholder="Special notes"
                      />
                    </div>
                  </div>
                ))}
                
                {contractData.setlist.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No songs added yet. Click "Add Song" to build your setlist.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other tabs would continue here with similar structure... */}
        
      </Tabs>
    </div>
  );
}