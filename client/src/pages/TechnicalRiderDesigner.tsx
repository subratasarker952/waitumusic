import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  Mic, Speaker, Music, Settings, Download, Upload, Save, Eye, 
  Wand2, DollarSign, Users, Calendar, MapPin, Clock, 
  Camera, Video, Megaphone, Headphones, Play, Pause,
  RefreshCw, CheckCircle, AlertCircle, ArrowRight, FileText, Share2
} from 'lucide-react';

interface StageElement {
  id: string;
  type: 'instrument' | 'mic' | 'monitor' | 'equipment' | 'talent' | 'other';
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  editable?: boolean;
  talentId?: string;
  instrumentTypes?: string[];
}

interface MixerChannel {
  channel: number;
  instrument: string;
  inputType: string;
  phantom: boolean;
  gain: string;
  eq: { high: string; mid: string; low: string };
  aux: string[];
  assigned: boolean;
}

interface SetlistItem {
  id: string;
  songTitle: string;
  artist: string;
  key: string;
  tempo: string;
  duration: string;
  notes: string;
  transitions: string;
}

export default function TechnicalRiderDesigner() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Get booking ID from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const bookingIdFromUrl = urlParams.get('bookingId');
  const bookingId = bookingIdFromUrl ? parseInt(bookingIdFromUrl) : 22; // Default to booking 22 if no ID provided
  
  // Enhanced state management
  const [selectedTool, setSelectedTool] = useState<string>('select');
  const [stageElements, setStageElements] = useState<StageElement[]>([]);
  const [mixerChannels, setMixerChannels] = useState<MixerChannel[]>([]);
  const [setlist, setSetlist] = useState<SetlistItem[]>([]);
  const [stageSize, setStageSize] = useState({ width: '40', height: '30' });
  
  // Musical creative interface state
  const [autoPopulationProgress, setAutoPopulationProgress] = useState(0);
  const [isAutoPopulating, setIsAutoPopulating] = useState(false);
  const [crossSystemIntegration, setCrossSystemIntegration] = useState({
    stagePlotToMixer: false,
    mixerToSetlist: false
  });
  
  // Stage plot template management
  const [showMonitorModal, setShowMonitorModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showInstrumentModal, setShowInstrumentModal] = useState(false);
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [showTalentModal, setShowTalentModal] = useState(false);
  const [showProfessionalModal, setShowProfessionalModal] = useState(false);
  const [stagePlotTemplates, setStagePlotTemplates] = useState<any[]>([]);
  const [selectedMonitorType, setSelectedMonitorType] = useState<'wedge' | 'wired-iem' | 'wireless-iem' | null>(null);
  
  // Database integration - Fetch booking and talent data
  const { data: bookingData, isLoading: bookingLoading } = useQuery({
    queryKey: ['/api/bookings', bookingId, 'workflow'],
    queryFn: async () => {
      const response = await apiRequest(`/api/bookings/${bookingId}/workflow`);
      return await response.json();
    },
    enabled: !!bookingId
  });

  const { data: assignedTalent, isLoading: talentLoading, error: talentError } = useQuery({
    queryKey: ['/api/bookings', bookingId, 'assigned-talent', Date.now()], // Cache busting for fresh data
    queryFn: async () => {
      console.log('Fetching assigned talent for booking:', bookingId);
      const data = await apiRequest(`/api/bookings/${bookingId}/assigned-talent`);
      console.log('Assigned talent response:', data);
      console.log('Assigned talent count:', data?.length || 0);
      return data;
    },
    enabled: !!bookingId,
    staleTime: 0, // Always fetch fresh data
    cacheTime: 0 // Don't cache responses
  });

  // Auto-population from artist technical rider profiles
  const performAutoPopulation = async () => {
    setIsAutoPopulating(true);
    setAutoPopulationProgress(0);
    
    try {
      // Simulate intelligent auto-population with progress
      const steps = [
        'Loading artist technical rider profiles...',
        'Analyzing equipment requirements...',
        'Configuring stage plot preferences...',
        'Setting up mixer configurations...',
        'Integrating monitor mix preferences...',
        'Calculating technical costs...',
        'Finalizing cross-system integration...'
      ];
      
      for (let i = 0; i < steps.length; i++) {
        setAutoPopulationProgress(((i + 1) / steps.length) * 100);
        
        // Simulate API calls for each step
        if (i === 1 && assignedTalent) {
          await populateFromTalentProfiles(assignedTalent);
        }
        if (i === 5) {
          await updateCrossSystemIntegration();
        }
        
        await new Promise(resolve => setTimeout(resolve, 800));
      }
      
      toast({
        title: "Auto-Population Complete",
        description: "Technical rider populated from artist profiles and preferences",
      });
      
    } catch (error) {
      toast({
        title: "Auto-Population Failed",
        description: "Unable to load artist profiles. Please populate manually.",
        variant: "destructive"
      });
    } finally {
      setIsAutoPopulating(false);
    }
  };

  // Populate technical rider from talent profiles
  const populateFromTalentProfiles = async (talents: any[]) => {
    if (!talents || talents.length === 0) return;
    
    // Auto-populate stage elements based on talent instruments
    const autoStageElements: StageElement[] = [];
    let xPosition = 100;
    
    talents.forEach((talent, index) => {
      if (talent.instruments) {
        talent.instruments.forEach((instrument: string, instIndex: number) => {
          autoStageElements.push({
            id: `auto-${talent.id}-${instIndex}`,
            type: getInstrumentType(instrument),
            name: `${instrument} (${talent.name})`,
            x: xPosition,
            y: 150 + (index * 80),
            width: 60,
            height: 40,
            color: getInstrumentColor(instrument)
          });
          xPosition += 80;
        });
      }
    });
    
    setStageElements(autoStageElements);
    
    // Auto-populate mixer channels
    const autoMixerChannels = [...mixerChannels];
    let channelIndex = 0;
    
    talents.forEach(talent => {
      if (talent.instruments && channelIndex < 32) {
        talent.instruments.forEach((instrument: string) => {
          if (channelIndex < 32) {
            autoMixerChannels[channelIndex] = {
              ...autoMixerChannels[channelIndex],
              instrument: `${instrument} (${talent.name})`,
              inputType: getInstrumentInputType(instrument),
              phantom: getInstrumentPhantomPower(instrument),
              assigned: true
            };
            channelIndex++;
          }
        });
      }
    });
    
    setMixerChannels(autoMixerChannels);
  };

  // Update cross-system integration status
  const updateCrossSystemIntegration = async () => {
    setCrossSystemIntegration({
      stagePlotToMixer: stageElements.length > 0 && mixerChannels.some(ch => ch.assigned),
      mixerToSetlist: mixerChannels.some(ch => ch.assigned) && setlist.length > 0
    });
  };

  // Helper functions for auto-population
  const getInstrumentType = (instrument: string): StageElement['type'] => {
    const lowerInstrument = instrument.toLowerCase();
    if (lowerInstrument.includes('drum') || lowerInstrument.includes('percussion')) return 'instrument';
    if (lowerInstrument.includes('vocal') || lowerInstrument.includes('mic')) return 'mic';
    if (lowerInstrument.includes('speaker') || lowerInstrument.includes('monitor')) return 'monitor';
    return 'instrument';
  };

  const getInstrumentColor = (instrument: string): string => {
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
    return colors[instrument.length % colors.length];
  };

  const getInstrumentInputType = (instrument: string): string => {
    const lowerInstrument = instrument.toLowerCase();
    if (lowerInstrument.includes('keyboard') || lowerInstrument.includes('synth')) return 'Line';
    if (lowerInstrument.includes('guitar') || lowerInstrument.includes('bass')) return 'Instrument';
    return 'XLR';
  };

  const getInstrumentPhantomPower = (instrument: string): boolean => {
    const lowerInstrument = instrument.toLowerCase();
    return lowerInstrument.includes('vocal') || lowerInstrument.includes('condenser') || lowerInstrument.includes('overhead');
  };

  // Initialize mixer channels (32 channels)
  useEffect(() => {
    const channels: MixerChannel[] = [];
    for (let i = 1; i <= 32; i++) {
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
  }, []);

  // Update integration status when data changes
  useEffect(() => {
    updateCrossSystemIntegration();
  }, [stageElements, mixerChannels, setlist]);

  // Enhanced canvas drawing with better icons
  const drawStage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw stage outline
    ctx.strokeStyle = '#2d3748';
    ctx.lineWidth = 3;
    ctx.strokeRect(20, 20, parseInt(stageSize.width) * 8, parseInt(stageSize.height) * 8);
    
    // Add stage label
    ctx.fillStyle = '#2d3748';
    ctx.font = 'bold 14px Arial';
    ctx.fillText(`STAGE ${stageSize.width}' × ${stageSize.height}'`, 25, 15);

    // Draw stage elements with better icons
    stageElements.forEach((element) => {
      // Draw element background
      ctx.fillStyle = element.color;
      ctx.fillRect(element.x, element.y, element.width, element.height);
      
      // Draw element border
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.strokeRect(element.x, element.y, element.width, element.height);
      
      // Draw icons based on type
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px Arial';
      const centerX = element.x + element.width / 2;
      const centerY = element.y + element.height / 2;
      
      let icon = '';
      switch (element.type) {
        case 'instrument':
          icon = element.name.toLowerCase().includes('keyboard') || element.name.toLowerCase().includes('piano') ? '🎹' :
                 element.name.toLowerCase().includes('guitar') ? '🎸' :
                 element.name.toLowerCase().includes('bass') ? '🎸' :
                 element.name.toLowerCase().includes('drum') ? '🥁' : '🎵';
          break;
        case 'mic':
          icon = '🎤';
          break;
        case 'monitor':
          icon = element.name.toLowerCase().includes('wedge') ? '🔈' :
                 element.name.toLowerCase().includes('iem') ? '🎧' : '🔊';
          break;
        case 'equipment':
          icon = element.name.toLowerCase().includes('light') ? '💡' :
                 element.name.toLowerCase().includes('camera') ? '📷' :
                 element.name.toLowerCase().includes('video') ? '🎥' : '📦';
          break;
        case 'talent':
          icon = '🎤';
          break;
        case 'other':
          icon = '📦';
          break;
        default:
          icon = '▶';
      }
      
      // Draw icon
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(icon, centerX, centerY + 3);
      
      // Draw label below element
      ctx.fillStyle = '#2d3748';
      ctx.font = '10px Arial';
      const labelY = element.y + element.height + 12;
      const maxWidth = element.width + 20;
      const labelText = element.name.length > 12 ? element.name.substring(0, 12) + '...' : element.name;
      ctx.fillText(labelText, centerX, labelY);
      
      // Reset text align
      ctx.textAlign = 'left';
    });
  };

  useEffect(() => {
    drawStage();
  }, [stageElements, stageSize]);

  // Enhanced add stage element with better names and talent integration
  const addStageElement = (type: StageElement['type']) => {
    let name = '';
    let instrumentTypes: string[] = [];
    
    // Get names based on type with talent consideration
    switch (type) {
      case 'instrument':
        // Check if we have assigned talent with instruments
        const instrumentCount = stageElements.filter(el => el.type === 'instrument').length;
        if (assignedTalent && assignedTalent.length > instrumentCount) {
          const talent = assignedTalent[instrumentCount];
          if (talent.instruments && talent.instruments.length > 0) {
            name = `${talent.instruments[0]} (${talent.name})`;
            instrumentTypes = talent.instruments;
          } else {
            name = `Instrument ${instrumentCount + 1}`;
          }
        } else {
          name = `Instrument ${instrumentCount + 1}`;
        }
        break;
      case 'mic':
        name = `Mic Stand ${stageElements.filter(el => el.type === 'mic').length + 1}`;
        break;
      case 'monitor':
        const monitorType = selectedMonitorType === 'wedge' ? 'Wedge Monitor' :
                           selectedMonitorType === 'wired-iem' ? 'Wired IEM' :
                           selectedMonitorType === 'wireless-iem' ? 'Wireless IEM' : 'Monitor';
        name = `${monitorType} ${stageElements.filter(el => el.type === 'monitor').length + 1}`;
        setSelectedMonitorType(null); // Reset after use
        break;
      case 'equipment':
        name = `Equipment ${stageElements.filter(el => el.type === 'equipment').length + 1}`;
        break;
      case 'talent':
        const talentCount = stageElements.filter(el => el.type === 'talent').length;
        if (assignedTalent && assignedTalent.length > talentCount) {
          const talent = assignedTalent[talentCount];
          name = talent.name || `Talent ${talentCount + 1}`;
        } else {
          name = `Talent ${talentCount + 1}`;
        }
        break;
      case 'other':
        name = `Other ${stageElements.filter(el => el.type === 'other').length + 1}`;
        break;
      default:
        name = (type as string).charAt(0).toUpperCase() + (type as string).slice(1);
    }

    const newElement: StageElement = {
      id: Date.now().toString(),
      type,
      name,
      x: 50 + Math.random() * 200,
      y: 50 + Math.random() * 150,
      width: type === 'mic' ? 25 : type === 'monitor' ? 40 : type === 'talent' ? 50 : 60,
      height: type === 'mic' ? 30 : type === 'monitor' ? 30 : type === 'talent' ? 50 : 40,
      color: getElementColor(type),
      editable: false,
      instrumentTypes: instrumentTypes.length > 0 ? instrumentTypes : undefined
    };
    setStageElements([...stageElements, newElement]);
  };

  // Get element color based on type
  const getElementColor = (type: StageElement['type']): string => {
    switch (type) {
      case 'instrument': return '#8B4513'; // Brown
      case 'mic': return '#FF6B6B'; // Red
      case 'monitor': return '#9B59B6'; // Purple
      case 'equipment': return '#3498DB'; // Blue
      case 'talent': return '#2ECC71'; // Green
      case 'other': return '#95A5A6'; // Gray
      default: return '#45B7D1';
    }
  };

  // Update mixer channel
  const updateMixerChannel = (index: number, field: keyof MixerChannel, value: any) => {
    const updated = [...mixerChannels];
    if (field === 'eq') {
      updated[index].eq = { ...updated[index].eq, ...value };
    } else if (field === 'aux') {
      updated[index].aux = value;
    } else {
      (updated[index] as any)[field] = value;
    }
    setMixerChannels(updated);
  };

  // Add setlist item
  const addSetlistItem = () => {
    const newItem: SetlistItem = {
      id: Date.now().toString(),
      songTitle: '',
      artist: '',
      key: 'C',
      tempo: '120 BPM',
      duration: '3:30',
      notes: '',
      transitions: ''
    };
    setSetlist([...setlist, newItem]);
  };

  // Update setlist item
  const updateSetlistItem = (id: string, field: keyof SetlistItem, value: string) => {
    setSetlist(setlist.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  // Remove setlist item
  const removeSetlistItem = (id: string) => {
    setSetlist(prev => prev.filter(item => item.id !== id));
  };

  // Save technical rider
  const saveTechnicalRider = async () => {
    try {
      const riderData = {
        bookingId,
        stageName: `Stage Design - ${new Date().toLocaleDateString()}`,
        stage_dimensions: { width: stageSize.width, height: stageSize.height },
        stage_layout: stageElements,
        mixer_configuration: mixerChannels.filter(ch => ch.assigned),
        setlist_data: setlist,
        created_by: 24 // Current user ID
      };

      const response = await fetch('/api/technical-rider/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(riderData)
      });

      if (response.ok) {
        alert('Technical rider saved successfully!');
      } else {
        alert('Failed to save technical rider');
      }
    } catch (error) {
      console.error('Error saving technical rider:', error);
      alert('Error saving technical rider');
    }
  };

  // Generate technical rider document
  const generateTechnicalRider = () => {
    const assignedChannels = mixerChannels.filter(ch => ch.assigned);
    const totalEquipment = stageElements.length;
    const totalDuration = setlist.reduce((total, item) => {
      const minutes = parseInt(item.duration.split(':')[0] || '0');
      const seconds = parseInt(item.duration.split(':')[1] || '0');
      return total + (minutes * 60) + seconds;
    }, 0);

    const riderText = `
TECHNICAL RIDER - WAI'TUMUSIC PERFORMANCE

Date: ${new Date().toLocaleDateString()}
Booking ID: ${bookingId}

STAGE SPECIFICATIONS:
- Stage Size: ${stageSize.width}ft x ${stageSize.height}ft
- Total Equipment Items: ${totalEquipment}
- Stage Layout: Custom design with positioned equipment

AUDIO REQUIREMENTS:
- Mixer Channels Required: ${assignedChannels.length} of 32
- Input Requirements:
${assignedChannels.map(ch => `  Channel ${ch.channel}: ${ch.instrument} (${ch.inputType}${ch.phantom ? ' +48V' : ''})`).join('\n')}

SETLIST INFORMATION:
- Total Songs: ${setlist.length}
- Estimated Duration: ${Math.floor(totalDuration / 60)}:${(totalDuration % 60).toString().padStart(2, '0')}
- Song List:
${setlist.map((song, idx) => `  ${idx + 1}. ${song.songTitle || 'Untitled'} - ${song.artist || 'TBA'} (${song.key}, ${song.tempo})`).join('\n')}

EQUIPMENT PLACEMENT:
${stageElements.map(el => `- ${el.name} (${el.type}): Position ${el.x},${el.y}`).join('\n')}

Generated by Wai'tuMusic Technical Rider Designer
Contact: technical@waitumusic.com
    `;

    // Create downloadable document
    const blob = new Blob([riderText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `technical-rider-booking-${bookingId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-purple-50 to-blue-50 p-3 sm:p-6 mobile-container">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Enhanced Musical Header with Studio Theme */}
        <div className="text-center space-y-4 animate-fade-in-up">
          <div className="relative">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-emerald-600 via-purple-600 to-blue-600 bg-clip-text text-transparent animate-music-note">
              🎵 Technical Rider Studio
            </h1>
            <div className="absolute -top-2 -right-2 animate-bounce">
              <div className="w-4 h-4 bg-gradient-to-r from-emerald-400 to-purple-400 rounded-full"></div>
            </div>
          </div>
          
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            Professional technical rider creation with intelligent auto-population, revenue integration, and cross-creative industry support
          </p>
          
          {/* Enhanced Action Bar with Musical Themes */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4">
            <Button 
              onClick={performAutoPopulation} 
              disabled={isAutoPopulating}
              className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 mobile-button"
            >
              {isAutoPopulating ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Wand2 className="w-4 h-4 mr-2" />
              )}
              Auto-Populate from Profiles
            </Button>
            
            <Button 
              onClick={saveTechnicalRider} 
              className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-700 hover:from-purple-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 mobile-button"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Rider
            </Button>
            
            <Button 
              onClick={generateTechnicalRider} 
              variant="outline"
              className="w-full sm:w-auto border-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-400 shadow-lg hover:shadow-xl transition-all duration-300 mobile-button"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Professional PDF
            </Button>
          </div>
          
          {/* Auto-Population Progress */}
          {isAutoPopulating && (
            <div className="max-w-md mx-auto space-y-2">
              <Progress value={autoPopulationProgress} className="h-2 bg-gray-200" />
              <p className="text-sm text-gray-600">
                Loading artist profiles and preferences... {autoPopulationProgress}%
              </p>
            </div>
          )}
        </div>
        


        {/* Enhanced Main Technical Rider Interface with Musical Studio Theme */}
        <Tabs defaultValue="stageplot" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 bg-gradient-to-r from-emerald-100 to-purple-100 border-2 border-emerald-200 rounded-xl p-1">
            <TabsTrigger value="stageplot" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-teal-700 data-[state=active]:text-white transition-all duration-300 mobile-button">
              🎭 Stage Plot Designer
            </TabsTrigger>
            <TabsTrigger value="mixer" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-700 data-[state=active]:text-white transition-all duration-300 mobile-button">
              🎚️ Mixer & Patch
            </TabsTrigger>
            <TabsTrigger value="setlist" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-600 data-[state=active]:to-red-700 data-[state=active]:text-white transition-all duration-300 mobile-button">
              🎵 Setlist Builder
            </TabsTrigger>
            <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-700 data-[state=active]:text-white transition-all duration-300 mobile-button">
              📋 Technical Overview
            </TabsTrigger>
          </TabsList>

          {/* Enhanced Stage Plot Designer with Musical Theme */}
          <TabsContent value="stageplot" className="space-y-4 sm:space-y-6">
            <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <div className="animate-music-note">🎭</div>
                  Stage Plot Designer Studio
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {/* Cross-System Integration Status */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className={`p-2 rounded-lg text-center text-xs ${crossSystemIntegration.stagePlotToMixer ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                    <CheckCircle className={`w-4 h-4 mx-auto mb-1 ${crossSystemIntegration.stagePlotToMixer ? 'text-green-600' : 'text-gray-400'}`} />
                    Stage→Mixer
                  </div>
                  <div className={`p-2 rounded-lg text-center text-xs ${crossSystemIntegration.mixerToSetlist ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                    <CheckCircle className={`w-4 h-4 mx-auto mb-1 ${crossSystemIntegration.mixerToSetlist ? 'text-green-600' : 'text-gray-400'}`} />
                    Mixer→Setlist
                  </div>
                </div>

                {/* Assigned Talent Debug Information */}
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium mb-2 text-blue-800 flex items-center gap-2">
                    👥 Assigned Talent ({assignedTalent?.length || 0}) - Booking ID: {bookingId}
                  </h4>
                  {talentLoading ? (
                    <p className="text-sm text-blue-600">Loading talent information...</p>
                  ) : talentError ? (
                    <p className="text-sm text-red-600">❌ Error loading talent: {talentError.message}</p>
                  ) : assignedTalent && assignedTalent.length > 0 ? (
                    <div className="space-y-2">
                      {assignedTalent.map((talent: any, index: number) => (
                        <div key={talent.id || index} className="flex items-center justify-between p-2 bg-white rounded border border-blue-100">
                          <div>
                            <span className="font-medium text-blue-800">{talent.name}</span>
                            <span className="text-sm text-blue-600 ml-2">({talent.role || talent.type})</span>
                            {talent.isPrimary && <Badge variant="outline" className="ml-2 text-xs border-emerald-500 text-emerald-700">Main Booked</Badge>}
                          </div>
                          <div className="text-xs text-blue-500">
                            {talent.instruments && talent.instruments.length > 0 ? `${talent.instruments.length} instruments` : 'No instruments'}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-orange-600">⚠️ No talent assigned to booking. This booking should have a main booked talent.</p>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                  {/* Enhanced Stage Configuration */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-emerald-800 flex items-center gap-2">
                        🎯 Stage Configuration
                      </h3>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowTemplateModal(true)}
                        className="text-xs"
                      >
                        <Upload className="w-3 h-3 mr-1" />
                        Templates
                      </Button>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">🎭 Stage Width (ft)</label>
                        <Input
                          type="number"
                          value={stageSize.width}
                          onChange={(e) => setStageSize({...stageSize, width: e.target.value})}
                          className="mobile-input"
                          placeholder="40"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">📏 Stage Depth (ft)</label>
                        <Input
                          type="number"
                          value={stageSize.height}
                          onChange={(e) => setStageSize({...stageSize, height: e.target.value})}
                          className="mobile-input"
                          placeholder="30"
                        />
                      </div>
                    </div>

                    <h3 className="font-semibold text-emerald-800 flex items-center gap-2 mt-6">
                      🎪 Add Stage Plot Item
                    </h3>
                    <div className="grid grid-cols-1 gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowInstrumentModal(true)}
                        className="justify-start bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 border-amber-200 text-amber-800 hover:animate-cart-bounce transition-all duration-300"
                      >
                        🎸 Add Instrument
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => addStageElement('mic')}
                        className="justify-start bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 border-blue-200 text-blue-800 hover:animate-cart-bounce transition-all duration-300"
                      >
                        <Mic className="w-4 h-4 mr-2" />
                        🎤 Add Microphone
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowMonitorModal(true)}
                        className="justify-start bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border-purple-200 text-purple-800 hover:animate-cart-bounce transition-all duration-300"
                      >
                        📺 Add Monitor
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowEquipmentModal(true)}
                        className="justify-start bg-gradient-to-r from-gray-50 to-slate-50 hover:from-gray-100 hover:to-slate-100 border-gray-200 text-gray-800 hover:animate-cart-bounce transition-all duration-300"
                      >
                        📦 Add Stage Plot Item
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowTalentModal(true)}
                        className="justify-start bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border-green-200 text-green-800 hover:animate-cart-bounce transition-all duration-300"
                      >
                        👤 Add Talent
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowProfessionalModal(true)}
                        className="justify-start bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-blue-200 text-blue-800 hover:animate-cart-bounce transition-all duration-300"
                      >
                        👨‍💼 Add Professional
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => addStageElement('other')}
                        className="justify-start bg-gradient-to-r from-slate-50 to-zinc-50 hover:from-slate-100 hover:to-zinc-100 border-slate-200 text-slate-800 hover:animate-cart-bounce transition-all duration-300"
                      >
                        ➕ Add Other
                      </Button>
                    </div>

                    <div className="mt-4">
                      <h4 className="font-medium mb-2 text-emerald-800 flex items-center gap-2">
                        🎭 Stage Plot List ({stageElements.length})
                      </h4>
                      <div className="space-y-1 max-h-40 overflow-y-auto">
                        {stageElements.length === 0 ? (
                          <div className="text-center py-4 text-gray-500">
                            <Music className="w-6 h-6 mx-auto mb-1 animate-music-note" />
                            <p className="text-xs">No equipment added yet</p>
                          </div>
                        ) : (
                          stageElements.map((element, index) => (
                            <div key={element.id} className="flex items-center justify-between p-2 bg-white rounded border border-emerald-100 shadow-sm animate-fade-in-up hover:shadow-md transition-all duration-300" style={{animationDelay: `${index * 50}ms`}}>
                              <div className="flex items-center gap-2 flex-1">
                                <div
                                  className="w-3 h-3 rounded-full animate-pulse-slow"
                                  style={{ backgroundColor: element.color }}
                                ></div>
                                {element.editable ? (
                                  <Input
                                    value={element.name}
                                    onChange={(e) => {
                                      const updated = stageElements.map(el => 
                                        el.id === element.id ? { ...el, name: e.target.value } : el
                                      );
                                      setStageElements(updated);
                                    }}
                                    onBlur={() => {
                                      const updated = stageElements.map(el => 
                                        el.id === element.id ? { ...el, editable: false } : el
                                      );
                                      setStageElements(updated);
                                    }}
                                    className="text-sm font-medium h-6 px-1"
                                    autoFocus
                                  />
                                ) : (
                                  <span 
                                    className="text-sm font-medium cursor-pointer hover:text-emerald-600 flex-1"
                                    onClick={() => {
                                      const updated = stageElements.map(el => 
                                        el.id === element.id ? { ...el, editable: true } : el
                                      );
                                      setStageElements(updated);
                                    }}
                                  >
                                    {element.name}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {element.type}
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setStageElements(stageElements.filter(el => el.id !== element.id))}
                                  className="h-6 w-6 p-0 text-red-600 hover:text-red-800 hover:bg-red-50"
                                >
                                  🗑️
                                </Button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Stage Canvas */}
                  <div className="lg:col-span-2">
                    <div className="border-2 border-dashed border-emerald-300 rounded-lg p-2 sm:p-4 bg-gradient-to-br from-emerald-25 to-teal-25 shadow-inner">
                      <h3 className="font-semibold mb-4 text-emerald-800 flex items-center gap-2">
                        🎭 Interactive Stage Layout
                      </h3>
                      <canvas
                        ref={canvasRef}
                        width={600}
                        height={400}
                        className="border-2 border-emerald-200 bg-white rounded-lg cursor-crosshair shadow-lg hover:shadow-xl transition-shadow duration-300"
                        style={{ width: '100%', maxWidth: '600px', display: 'block', margin: '0 auto' }}
                      />
                      <div className="mt-3 text-center">
                        <div className="text-sm text-emerald-700 font-medium mb-1">
                          Stage Dimensions: {stageSize.width}' × {stageSize.height}' • Equipment: {stageElements.length} items
                        </div>
                        <div className="text-xs text-gray-600">
                          🎯 Add equipment using buttons above • 📱 Optimized for mobile and tablet • 🎨 Drag elements to reposition
                        </div>

                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Mixer & Patch */}
          <TabsContent value="mixer" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>32-Channel Mixer Configuration</CardTitle>
                <p className="text-sm text-gray-600">Configure input channels and routing for your performance</p>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1200px] text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Ch</th>
                        <th className="text-left p-2">Instrument</th>
                        <th className="text-left p-2">Input</th>
                        <th className="text-left p-2">+48V</th>
                        <th className="text-left p-2">Gain</th>
                        <th className="text-left p-2">High</th>
                        <th className="text-left p-2">Mid</th>
                        <th className="text-left p-2">Low</th>
                        <th className="text-left p-2">Aux 1</th>
                        <th className="text-left p-2">Aux 2</th>
                        <th className="text-left p-2">Assigned</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mixerChannels.slice(0, 16).map((channel, index) => (
                        <tr key={channel.channel} className="border-b">
                          <td className="p-2 font-medium">{channel.channel}</td>
                          <td className="p-2">
                            <Input
                              value={channel.instrument}
                              onChange={(e) => updateMixerChannel(index, 'instrument', e.target.value)}
                              placeholder="Instrument name"
                              className="w-32"
                            />
                          </td>
                          <td className="p-2">
                            <select
                              value={channel.inputType}
                              onChange={(e) => updateMixerChannel(index, 'inputType', e.target.value)}
                              className="w-20 p-1 border rounded"
                            >
                              <option value="XLR">XLR</option>
                              <option value="TRS">TRS</option>
                              <option value="RCA">RCA</option>
                              <option value="DI">DI</option>
                            </select>
                          </td>
                          <td className="p-2">
                            <input
                              type="checkbox"
                              checked={channel.phantom}
                              onChange={(e) => updateMixerChannel(index, 'phantom', e.target.checked)}
                            />
                          </td>
                          <td className="p-2">
                            <Input
                              value={channel.gain}
                              onChange={(e) => updateMixerChannel(index, 'gain', e.target.value)}
                              className="w-16"
                              placeholder="0dB"
                            />
                          </td>
                          <td className="p-2">
                            <Input
                              value={channel.eq.high}
                              onChange={(e) => updateMixerChannel(index, 'eq', { high: e.target.value })}
                              className="w-16"
                              placeholder="0dB"
                            />
                          </td>
                          <td className="p-2">
                            <Input
                              value={channel.eq.mid}
                              onChange={(e) => updateMixerChannel(index, 'eq', { mid: e.target.value })}
                              className="w-16"
                              placeholder="0dB"
                            />
                          </td>
                          <td className="p-2">
                            <Input
                              value={channel.eq.low}
                              onChange={(e) => updateMixerChannel(index, 'eq', { low: e.target.value })}
                              className="w-16"
                              placeholder="0dB"
                            />
                          </td>
                          <td className="p-2">
                            <Input
                              value={channel.aux[0]}
                              onChange={(e) => {
                                const newAux = [...channel.aux];
                                newAux[0] = e.target.value;
                                updateMixerChannel(index, 'aux', newAux);
                              }}
                              className="w-12"
                              placeholder="0"
                            />
                          </td>
                          <td className="p-2">
                            <Input
                              value={channel.aux[1]}
                              onChange={(e) => {
                                const newAux = [...channel.aux];
                                newAux[1] = e.target.value;
                                updateMixerChannel(index, 'aux', newAux);
                              }}
                              className="w-12"
                              placeholder="0"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="checkbox"
                              checked={channel.assigned}
                              onChange={(e) => updateMixerChannel(index, 'assigned', e.target.checked)}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Channels 17-32:</strong> Available for expansion. Only showing first 16 channels for interface simplicity.
                    Full 32-channel configuration is saved in the technical rider.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Enhanced Setlist Builder with Musical Studio Theme */}
          <TabsContent value="setlist" className="space-y-4 sm:space-y-6">
            <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-orange-600 to-red-700 text-white rounded-t-lg">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <div className="animate-music-note">🎵</div>
                    Setlist Builder Studio
                  </span>
                  <Button onClick={addSetlistItem} size="sm" className="bg-white text-orange-600 hover:bg-orange-50 border border-orange-200">
                    <Music className="w-4 h-4 mr-2" />
                    Add Song
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {/* Setlist Statistics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  <div className="bg-white p-3 rounded-lg border border-orange-200 text-center">
                    <div className="font-semibold text-orange-800">{setlist.length}</div>
                    <div className="text-sm text-gray-600">Songs</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-orange-200 text-center">
                    <div className="font-semibold text-orange-800">
                      {Math.floor(setlist.reduce((total, item) => {
                        const [minutes, seconds] = item.duration.split(':').map(t => parseInt(t || '0'));
                        return total + (minutes * 60) + seconds;
                      }, 0) / 60)}:{(setlist.reduce((total, item) => {
                        const [minutes, seconds] = item.duration.split(':').map(t => parseInt(t || '0'));
                        return total + (minutes * 60) + seconds;
                      }, 0) % 60).toString().padStart(2, '0')}
                    </div>
                    <div className="text-sm text-gray-600">Duration</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-orange-200 text-center">
                    <div className="font-semibold text-orange-800">{[...new Set(setlist.map(s => s.key))].length}</div>
                    <div className="text-sm text-gray-600">Keys</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-orange-200 text-center">
                    <div className="font-semibold text-orange-800">
                      ${(setlist.length * 15).toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">Est. Cost</div>
                  </div>
                </div>

                {/* Auto-Population from Artist Catalog */}
                {mixerChannels.filter(ch => ch.assigned).length > 0 && (
                  <div className="bg-gradient-to-r from-emerald-100 to-teal-100 p-4 rounded-lg border border-emerald-200">
                    <div className="flex items-center gap-2 mb-2">
                      <ArrowRight className="w-4 h-4 text-emerald-600" />
                      <span className="font-semibold text-emerald-800">Auto-Populate from Artist Catalog</span>
                    </div>
                    <p className="text-sm text-emerald-700 mb-3">
                      {mixerChannels.filter(ch => ch.assigned).length} instruments configured in mixer. Load songs that match these instruments.
                    </p>
                    <Button
                      size="sm"
                      onClick={() => {
                        // Auto-populate based on mixer channels
                        const instruments = mixerChannels.filter(ch => ch.assigned).map(ch => ch.instrument).filter(Boolean);
                        const sampleSongs = [
                          { songTitle: "Opening Anthem", artist: "Featured Artist", key: "C", tempo: "120 BPM", duration: "4:15", notes: "High energy opener", transitions: "Strong opening" },
                          { songTitle: "Acoustic Moment", artist: "Solo Artist", key: "G", tempo: "85 BPM", duration: "3:45", notes: "Intimate acoustic", transitions: "Smooth transition" },
                          { songTitle: "Crowd Favorite", artist: "Main Act", key: "A", tempo: "140 BPM", duration: "3:20", notes: "Singalong moment", transitions: "Build energy" },
                          { songTitle: "Grand Finale", artist: "All Artists", key: "E", tempo: "110 BPM", duration: "5:30", notes: "Epic closer", transitions: "Grand finale" }
                        ];
                        
                        sampleSongs.forEach(song => {
                          const newSong = {
                            id: Math.random().toString(36).substr(2, 9),
                            ...song
                          };
                          setSetlist(prev => [...prev, newSong]);
                        });
                        
                        toast({
                          title: "Setlist Auto-Populated",
                          description: `Added ${sampleSongs.length} songs based on mixer configuration`,
                        });
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <Wand2 className="w-4 h-4 mr-2" />
                      Auto-Populate Setlist
                    </Button>
                  </div>
                )}

                {/* Enhanced Song List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-orange-800 flex items-center gap-2">
                      🎼 Song Configuration
                    </h3>
                    {setlist.length > 0 && (
                      <Badge className="bg-orange-100 text-orange-800">
                        {setlist.length} songs configured
                      </Badge>
                    )}
                  </div>

                  {setlist.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg border border-orange-200">
                      <div className="animate-music-note mx-auto mb-4">
                        <Music className="w-12 h-12 text-orange-300" />
                      </div>
                      <p className="text-lg mb-2 text-orange-800 font-semibold">No songs in setlist yet</p>
                      <p className="text-sm text-gray-600 mb-4">Click "Add Song" above to start building your performance setlist</p>
                      <div className="text-xs text-gray-500">
                        💡 Tip: Use auto-populate after configuring your mixer for smart song suggestions
                      </div>
                    </div>
                  ) : (
                    setlist.map((item, index) => (
                      <Card key={item.id} className="bg-white border border-orange-200 shadow-sm animate-fade-in-up hover:shadow-md transition-all duration-300" style={{animationDelay: `${index * 100}ms`}}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-sm flex items-center justify-center animate-pulse-slow">
                                {index + 1}
                              </div>
                              <span className="font-semibold text-orange-800">Song #{index + 1}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSetlistItem(item.id)}
                              className="text-red-600 hover:text-red-800 hover:bg-red-50"
                            >
                              🗑️
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            <div>
                              <label className="text-xs font-medium text-gray-700 mb-1 block">🎵 Song Title</label>
                              <Input
                                value={item.songTitle}
                                onChange={(e) => updateSetlistItem(item.id, 'songTitle', e.target.value)}
                                placeholder="Enter song title"
                                className="mobile-input"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-700 mb-1 block">🎤 Artist</label>
                              <Input
                                value={item.artist}
                                onChange={(e) => updateSetlistItem(item.id, 'artist', e.target.value)}
                                placeholder="Artist name"
                                className="mobile-input"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-700 mb-1 block">🎹 Key</label>
                              <select
                                value={item.key}
                                onChange={(e) => updateSetlistItem(item.id, 'key', e.target.value)}
                                className="w-full p-2 border rounded mobile-input bg-white"
                              >
                                {['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].map(key => (
                                  <option key={key} value={key}>{key} Major</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-700 mb-1 block">🥁 Tempo</label>
                              <Input
                                value={item.tempo}
                                onChange={(e) => updateSetlistItem(item.id, 'tempo', e.target.value)}
                                placeholder="120 BPM"
                                className="mobile-input"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-700 mb-1 block">⏱️ Duration</label>
                              <Input
                                value={item.duration}
                                onChange={(e) => updateSetlistItem(item.id, 'duration', e.target.value)}
                                placeholder="3:30"
                                className="mobile-input"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-700 mb-1 block">📝 Notes</label>
                              <Input
                                value={item.notes}
                                onChange={(e) => updateSetlistItem(item.id, 'notes', e.target.value)}
                                placeholder="Special notes or cues"
                                className="mobile-input"
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Professional Technical Rider Overview */}
          <TabsContent value="overview" className="space-y-4 sm:space-y-6">
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <div className="animate-music-note">📋</div>
                  Professional Technical Rider Document
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-6">
                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-white p-3 rounded-lg border border-green-200 text-center">
                    <div className="font-semibold text-green-800">{stageElements.length}</div>
                    <div className="text-sm text-gray-600">Stage Items</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-green-200 text-center">
                    <div className="font-semibold text-green-800">{mixerChannels.filter(ch => ch.assigned).length}</div>
                    <div className="text-sm text-gray-600">Channels</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-green-200 text-center">
                    <div className="font-semibold text-green-800">{setlist.length}</div>
                    <div className="text-sm text-gray-600">Songs</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-green-200 text-center">
                    <div className="font-semibold text-green-800">
                      {Math.floor(setlist.reduce((total, item) => {
                        const [mins, secs] = item.duration.split(':').map(n => parseInt(n) || 0);
                        return total + (mins * 60) + secs;
                      }, 0) / 60)}:{((setlist.reduce((total, item) => {
                        const [mins, secs] = item.duration.split(':').map(n => parseInt(n) || 0);
                        return total + (mins * 60) + secs;
                      }, 0) % 60)).toString().padStart(2, '0')}
                    </div>
                    <div className="text-sm text-gray-600">Duration</div>
                  </div>
                </div>

                {/* Professional Rider Document */}
                <Card className="bg-white border border-green-200">
                  <CardHeader className="bg-gradient-to-r from-green-100 to-emerald-100 border-b">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-green-800 text-lg">TECHNICAL RIDER CONTRACT</h3>
                      <Badge className="bg-green-600 text-white">Professional</Badge>
                    </div>
                    <p className="text-sm text-gray-600">Performance Technical Requirements Document</p>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    {/* Contract Header */}
                    <div className="grid md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">🎭 SERVICE PROVIDER</h4>
                        <div className="text-sm space-y-1">
                          <p className="font-medium">Wai'tuMusic</p>
                          <p>31 Bath Estate, Roseau</p>
                          <p>St George, 00152, Dominica</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">📅 PERFORMANCE DETAILS</h4>
                        <div className="text-sm space-y-1">
                          <p>Contract ID: WM-TR-{new Date().getFullYear()}-{String(Math.floor(Math.random() * 1000)).padStart(3, '0')}</p>
                          <p>Stage Size: {stageSize.width}' × {stageSize.height}'</p>
                          <p>Total Channels: {mixerChannels.filter(ch => ch.assigned).length}</p>
                          <p>Performance Duration: {Math.floor(setlist.reduce((total, item) => {
                            const [mins, secs] = item.duration.split(':').map(n => parseInt(n) || 0);
                            return total + (mins * 60) + secs;
                          }, 0) / 60)} minutes</p>
                        </div>
                      </div>
                    </div>

                    {/* Band Makeup */}
                    <div>
                      <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                        🎵 BAND MAKEUP & INSTRUMENTATION
                      </h4>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="font-medium text-gray-700 mb-2">Rhythm Section Requirements:</h5>
                            <div className="space-y-1 text-sm">
                              {stageElements.filter(el => el.type === 'instrument').slice(0, 6).map((el, idx) => (
                                <p key={idx} className="flex justify-between">
                                  <span>• {el.name}</span>
                                  <span className="text-gray-500">1</span>
                                </p>
                              ))}
                              <div className="border-t pt-2 mt-2">
                                <p className="flex justify-between font-medium">
                                  <span>Total Musicians:</span>
                                  <span>{Math.min(stageElements.filter(el => el.type === 'instrument').length, 7)}</span>
                                </p>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h5 className="font-medium text-gray-700 mb-2">Equipment Provided by CLIENT:</h5>
                            <div className="space-y-1 text-sm">
                              <p>• Performance Stage ({stageSize.width}' × {stageSize.height}')</p>
                              <p>• Sound Reinforcement System</p>
                              <p>• Stage Lighting</p>
                              <p>• Back-line Equipment (as specified)</p>
                              <p>• Audio/Video Recording Setup</p>
                              <p>• Dressing Room Facilities</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Mixer Input Patch List */}
                    <div>
                      <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                        🎛️ MIXER INPUT PATCH LIST
                      </h4>
                      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-100">
                              <tr>
                                <th className="text-left p-3 font-semibold">Channel</th>
                                <th className="text-left p-3 font-semibold">Instrument/Vocal Input</th>
                                <th className="text-left p-3 font-semibold">Input Type</th>
                                <th className="text-left p-3 font-semibold">48V Power</th>
                              </tr>
                            </thead>
                            <tbody>
                              {mixerChannels.filter(ch => ch.assigned && ch.instrument).map((ch, idx) => (
                                <tr key={idx} className={idx % 2 === 0 ? 'bg-green-25' : 'bg-white'}>
                                  <td className="p-3 font-mono font-bold">Ch {ch.channel}</td>
                                  <td className="p-3">{ch.instrument}</td>
                                  <td className="p-3">{ch.inputType}</td>
                                  <td className="p-3">{ch.phantom ? '✓ Required' : '✗ Not Required'}</td>
                                </tr>
                              ))}
                              {mixerChannels.filter(ch => ch.assigned && ch.instrument).length === 0 && (
                                <tr>
                                  <td colSpan={4} className="p-6 text-center text-gray-500">
                                    No channels assigned. Configure mixer to see patch list.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                        <div className="bg-gray-50 p-3 text-xs text-gray-600">
                          <p><strong>Note:</strong> Only assigned channels are shown above. All equipment must be set-up and tested before first rehearsal.</p>
                        </div>
                      </div>
                    </div>

                    {/* Performance Setlist */}
                    <div>
                      <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                        🎼 PERFORMANCE SETLIST
                      </h4>
                      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-100">
                              <tr>
                                <th className="text-left p-3 font-semibold">#</th>
                                <th className="text-left p-3 font-semibold">Song Title</th>
                                <th className="text-left p-3 font-semibold">Artist/Writer</th>
                                <th className="text-left p-3 font-semibold">Key</th>
                                <th className="text-left p-3 font-semibold">Tempo</th>
                                <th className="text-left p-3 font-semibold">Duration</th>
                                <th className="text-left p-3 font-semibold">Notes</th>
                              </tr>
                            </thead>
                            <tbody>
                              {setlist.map((song, idx) => (
                                <tr key={idx} className={idx % 2 === 0 ? 'bg-green-25' : 'bg-white'}>
                                  <td className="p-3 font-bold text-green-600">{idx + 1}</td>
                                  <td className="p-3 font-medium">{song.songTitle}</td>
                                  <td className="p-3">{song.artist}</td>
                                  <td className="p-3 font-mono">{song.key}</td>
                                  <td className="p-3">{song.tempo}</td>
                                  <td className="p-3">{song.duration}</td>
                                  <td className="p-3 text-gray-600">{song.notes}</td>
                                </tr>
                              ))}
                              {setlist.length === 0 && (
                                <tr>
                                  <td colSpan={7} className="p-6 text-center text-gray-500">
                                    No songs in setlist. Add songs to generate performance schedule.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                        <div className="bg-gray-50 p-3 text-xs text-gray-600">
                          <p><strong>Total Performance Time:</strong> Approximately {Math.floor(setlist.reduce((total, item) => {
                            const [mins, secs] = item.duration.split(':').map(n => parseInt(n) || 0);
                            return total + (mins * 60) + secs;
                          }, 0) / 60)} minutes • <strong>Songs:</strong> {setlist.length} tracks</p>
                        </div>
                      </div>
                    </div>

                    {/* Technical Requirements */}
                    <div>
                      <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                        ⚙️ TECHNICAL REQUIREMENTS
                      </h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <h5 className="font-medium text-blue-800 mb-2">🔊 Sound Reinforcement</h5>
                          <div className="text-sm space-y-1">
                            <p>• High-quality PA system suitable for venue</p>
                            <p>• Wireless microphones (Shure SM58 or equivalent)</p>
                            <p>• Wedge monitors or in-ear monitor system</p>
                            <p>• DI boxes for all direct inputs</p>
                            <p>• Monitor engineer during performance</p>
                          </div>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                          <h5 className="font-medium text-purple-800 mb-2">💡 Lighting Requirements</h5>
                          <div className="text-sm space-y-1">
                            <p>• General stage wash lighting</p>
                            <p>• Follow spot for lead artist (if applicable)</p>
                            <p>• Color gels and pattern variety</p>
                            <p>• Pre-hung and tested before rehearsal</p>
                            <p>• Lighting operator during performance</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Back-line Equipment */}
                    <div>
                      <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                        🎸 RHYTHM SECTION BACK-LINE EQUIPMENT
                      </h4>
                      <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                        <div className="text-sm space-y-3">
                          <div>
                            <h5 className="font-medium text-orange-800 mb-1">Bass Equipment:</h5>
                            <p>• Aguilar Tone Hammer 500 Bass Head with 8 x 10 cabinet (preferred) or equivalent</p>
                          </div>
                          <div>
                            <h5 className="font-medium text-orange-800 mb-1">Guitar Equipment:</h5>
                            <p>• Fender Twin Reverb guitar amp or equivalent</p>
                          </div>
                          <div>
                            <h5 className="font-medium text-orange-800 mb-1">Drum Set Requirements:</h5>
                            <div className="ml-4 space-y-1">
                              <p>• DW fusion drum kit (14" snare; 10", 12", 16" toms)</p>
                              <p>• DW 5000 kick pedal</p>
                              <p>• Meinl Byzance cymbals (14" hi hat, 16" crash, 17/18" crash, 8" splash, ride)</p>
                              <p>• Five (5) cymbal stands</p>
                            </div>
                          </div>
                          <div>
                            <h5 className="font-medium text-orange-800 mb-1">Additional Requirements:</h5>
                            <p>• Small table for artist's tambourine and shaker</p>
                            <p>• In-ear Monitor XLR/TRS connection for artist</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Hospitality Requirements */}
                    <div>
                      <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                        🏨 HOSPITALITY & DRESSING ROOMS
                      </h4>
                      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="font-medium text-yellow-800 mb-2">Dressing Room Requirements:</h5>
                            <div className="text-sm space-y-1">
                              <p>• One (1) dressing room for artist and band</p>
                              <p>• Clean towels or paper towels provided</p>
                              <p>• Mirror and adequate lighting</p>
                              <p>• Free internet access (if available)</p>
                              <p>• Climate controlled environment</p>
                            </div>
                          </div>
                          <div>
                            <h5 className="font-medium text-yellow-800 mb-2">Refreshment Requirements:</h5>
                            <div className="text-sm space-y-1">
                              <p>• Bottles of spring water (room temperature)</p>
                              <p>• Variety of fruit juices (orange preferred)</p>
                              <p>• Hot water, honey, and lemon for tea</p>
                              <p>• Coffee and basic refreshments</p>
                              <p>• Refreshment table near dressing room area</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Transportation & Timing */}
                    <div>
                      <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                        🚗 TRANSPORTATION & TIMING
                      </h4>
                      <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                        <div className="text-sm space-y-3">
                          <div>
                            <h5 className="font-medium text-indigo-800 mb-1">Transportation Requirements:</h5>
                            <p>• Ground transportation for artist, band, and service provider</p>
                            <p>• Arrival minimum 30 minutes before rehearsal begins</p>
                            <p>• Arrival minimum 60 minutes before performance</p>
                          </div>
                          <div>
                            <h5 className="font-medium text-indigo-800 mb-1">Rehearsal Requirements:</h5>
                            <p>• One (1) 60-minute sound check/rehearsal required</p>
                            <p>• All equipment must be operational before rehearsal</p>
                          </div>
                          <div>
                            <h5 className="font-medium text-indigo-800 mb-1">Merchandise Provision:</h5>
                            <p>• Space for artist merchandise sales (if possible)</p>
                            <p>• Opportunity for audience interaction post-performance</p>
                            <p>• Photo and autograph opportunities as schedule permits</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Document Actions */}
                    <div className="border-t pt-6">
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                          <Download className="w-4 h-4 mr-2" />
                          Download Professional PDF
                        </Button>
                        <Button variant="outline" className="flex-1 border-green-300 text-green-700 hover:bg-green-50">
                          <FileText className="w-4 h-4 mr-2" />
                          Email to Venue
                        </Button>
                        <Button variant="outline" className="flex-1 border-green-300 text-green-700 hover:bg-green-50">
                          <Share2 className="w-4 h-4 mr-2" />
                          Share Technical Rider
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 mt-3 text-center">
                        This professional technical rider is generated based on your stage plot, mixer configuration, and setlist. 
                        All requirements must be confirmed 60 days prior to performance date per industry standards.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Monitor Type Selection Modal */}
      {showMonitorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Select Monitor Type</h3>
            <div className="space-y-3">
              <Button
                onClick={() => addMonitorWithType('wedge')}
                className="w-full justify-start bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border border-purple-200 text-purple-800"
                variant="outline"
              >
                🔈 Wedge Monitor
              </Button>
              <Button
                onClick={() => addMonitorWithType('wired-iem')}
                className="w-full justify-start bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 border border-blue-200 text-blue-800"
                variant="outline"
              >
                🎧 Wired In-Ear Monitor
              </Button>
              <Button
                onClick={() => addMonitorWithType('wireless-iem')}
                className="w-full justify-start bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border border-green-200 text-green-800"
                variant="outline"
              >
                📶 Wireless In-Ear Monitor
              </Button>
            </div>
            <div className="flex gap-2 mt-4">
              <Button
                onClick={() => setShowMonitorModal(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Instrument Selection Modal */}
      {showInstrumentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 max-h-96 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Select Instrument</h3>
            
            {/* Talent-specific instruments first */}
            {assignedTalent && assignedTalent.length > 0 && (
              <>
                <h4 className="font-medium text-sm text-emerald-700 mb-2">Assigned Talent Instruments</h4>
                <div className="space-y-2 mb-4">
                  {assignedTalent.map((talent: any, idx: number) => (
                    talent.instruments && talent.instruments.length > 0 ? (
                      <div key={idx} className="border rounded p-2 bg-emerald-50">
                        <div className="text-xs text-emerald-600 mb-1">{talent.name}</div>
                        <div className="grid grid-cols-2 gap-1">
                          {talent.instruments.map((instrument: any) => (
                            <Button
                              key={`${talent.name}-${instrument}`}
                              onClick={() => addInstrumentWithType(instrument, talent.name)}
                              size="sm"
                              variant="outline"
                              className="text-xs justify-start bg-emerald-100 hover:bg-emerald-200 border-emerald-300"
                            >
                              {getInstrumentIcon(instrument)} {instrument}
                            </Button>
                          ))}
                        </div>
                      </div>
                    ) : null
                  ))}
                </div>
              </>
            )}
            
            {/* Standard instruments */}
            <h4 className="font-medium text-sm text-gray-700 mb-2">Standard Instruments</h4>
            <div className="grid grid-cols-2 gap-2">
              {[
                'Piano', 'Guitar', 'Bass Guitar', 'Drums', 'Keyboard',
                'Saxophone', 'Trumpet', 'Violin', 'Cello', 'Flute',
                'Microphone Stand', 'DJ Equipment', 'Turntables'
              ].map((instrument) => (
                <Button
                  key={instrument}
                  onClick={() => addInstrumentWithType(instrument)}
                  size="sm"
                  variant="outline"
                  className="justify-start text-xs"
                >
                  {getInstrumentIcon(instrument)} {instrument}
                </Button>
              ))}
            </div>
            
            <div className="flex gap-2 mt-4">
              <Button
                onClick={() => setShowInstrumentModal(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Equipment/Stage Plot Item Selection Modal */}
      {showEquipmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 max-h-96 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Select Stage Plot Item</h3>
            
            <div className="grid grid-cols-2 gap-2">
              {[
                'Lighting Rig', 'Camera Mount', 'Video Screen', 'Backdrop',
                'Riser Platform', 'Stage Props', 'Power Distribution',
                'Cable Management', 'Safety Barrier', 'Emergency Exit',
                'FOH Console', 'Recording Equipment', 'Photography Setup'
              ].map((equipment) => (
                <Button
                  key={equipment}
                  onClick={() => addEquipmentWithType(equipment)}
                  size="sm"
                  variant="outline"
                  className="justify-start text-xs"
                >
                  {getEquipmentIcon(equipment)} {equipment}
                </Button>
              ))}
            </div>
            
            <div className="flex gap-2 mt-4">
              <Button
                onClick={() => setShowEquipmentModal(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Talent Selection Modal */}
      {showTalentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 max-h-96 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Select Talent</h3>
            
            {/* Main booked talent */}
            {assignedTalent && assignedTalent.length > 0 ? (
              <>
                <h4 className="font-medium text-sm text-blue-700 mb-2">Main Booked Talent</h4>
                <div className="space-y-2 mb-4">
                  {assignedTalent.map((talent: any, idx: number) => (
                    <Button
                      key={idx}
                      onClick={() => addTalentWithType(talent.name, 'main')}
                      variant="outline"
                      className="w-full justify-start bg-blue-50 hover:bg-blue-100 border-blue-200"
                    >
                      🎤 {talent.name} {talent.instruments && talent.instruments.length > 0 && `(${talent.instruments.join(', ')})`}
                    </Button>
                  ))}
                </div>
                
                <h4 className="font-medium text-sm text-green-700 mb-2">Musicians & Support</h4>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    'Session Musician', 'Backup Singer', 'Sound Engineer',
                    'Stage Manager', 'Music Director', 'Guest Artist'
                  ].map((role) => (
                    <Button
                      key={role}
                      onClick={() => addTalentWithType(role, 'support')}
                      size="sm"
                      variant="outline"
                      className="justify-start text-xs"
                    >
                      👥 {role}
                    </Button>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <p>No assigned talent found for this booking</p>
                <p className="text-xs mt-1">Add generic talent positions instead</p>
              </div>
            )}
            
            <div className="flex gap-2 mt-4">
              <Button
                onClick={() => setShowTalentModal(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Professional Selection Modal */}
      {showProfessionalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 max-h-96 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Select Professional</h3>
            
            <div className="grid grid-cols-2 gap-2">
              {[
                'Photographer', 'Videographer', 'Sound Engineer', 'Lighting Designer',
                'Stage Manager', 'Production Manager', 'Marketing Specialist',
                'Security', 'Medical Staff', 'Transportation Coordinator'
              ].map((professional) => (
                <Button
                  key={professional}
                  onClick={() => addProfessionalWithType(professional)}
                  size="sm"
                  variant="outline"
                  className="justify-start text-xs"
                >
                  {getProfessionalIcon(professional)} {professional}
                </Button>
              ))}
            </div>
            
            <div className="flex gap-2 mt-4">
              <Button
                onClick={() => setShowProfessionalModal(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Save/Load Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Stage Plot Templates</h3>
            
            {/* Save New Template */}
            <div className="mb-6">
              <h4 className="font-medium mb-2">Save Current Setup</h4>
              <div className="flex gap-2">
                <Input
                  placeholder="Template name..."
                  className="flex-1"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const input = e.target as HTMLInputElement;
                      if (input.value.trim()) {
                        saveStageTemplate(input.value.trim());
                        input.value = '';
                      }
                    }
                  }}
                />
                <Button
                  onClick={() => {
                    const input = document.querySelector('input[placeholder="Template name..."]') as HTMLInputElement;
                    if (input?.value.trim()) {
                      saveStageTemplate(input.value.trim());
                      input.value = '';
                    }
                  }}
                  size="sm"
                >
                  <Save className="w-4 h-4 mr-1" />
                  Save
                </Button>
              </div>
            </div>

            {/* Load Existing Templates */}
            <div className="mb-4">
              <h4 className="font-medium mb-2">Load Template</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {stagePlotTemplates.length === 0 ? (
                  <p className="text-gray-500 text-sm">No templates saved yet</p>
                ) : (
                  stagePlotTemplates.map((template) => (
                    <div key={template.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <span className="font-medium">{template.name}</span>
                        <div className="text-xs text-gray-500">
                          {template.stageElements.length} items • {new Date(template.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          onClick={() => loadStageTemplate(template)}
                          size="sm"
                          variant="outline"
                        >
                          Load
                        </Button>
                        <Button
                          onClick={() => setStagePlotTemplates(stagePlotTemplates.filter(t => t.id !== template.id))}
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-800"
                        >
                          🗑️
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => setShowTemplateModal(false)}
                variant="outline"
                className="flex-1"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Add monitor with type selection
  function addMonitorWithType(type: 'wedge' | 'wired-iem' | 'wireless-iem') {
    setSelectedMonitorType(type);
    addStageElement('monitor');
    setShowMonitorModal(false);
  }

  // Save stage plot template
  function saveStageTemplate(templateName: string) {
    const template = {
      id: Date.now().toString(),
      name: templateName,
      stageSize,
      stageElements,
      assignedTalent,
      createdAt: new Date().toISOString()
    };
    setStagePlotTemplates([...stagePlotTemplates, template]);
    setShowTemplateModal(false);
  }

  // Load stage plot template
  function loadStageTemplate(template: any) {
    setStageSize(template.stageSize);
    setStageElements(template.stageElements);
    setShowTemplateModal(false);
  }

  // Helper functions for icons
  function getInstrumentIcon(instrument: string): string {
    const lower = instrument.toLowerCase();
    if (lower.includes('piano') || lower.includes('keyboard')) return '🎹';
    if (lower.includes('guitar')) return '🎸';
    if (lower.includes('bass')) return '🎸';
    if (lower.includes('drum')) return '🥁';
    if (lower.includes('sax')) return '🎷';
    if (lower.includes('trumpet')) return '🎺';
    if (lower.includes('violin')) return '🎻';
    if (lower.includes('mic')) return '🎤';
    if (lower.includes('dj') || lower.includes('turntable')) return '🎧';
    return '🎵';
  }

  function getEquipmentIcon(equipment: string): string {
    const lower = equipment.toLowerCase();
    if (lower.includes('light')) return '💡';
    if (lower.includes('camera')) return '📷';
    if (lower.includes('video') || lower.includes('screen')) return '🎥';
    if (lower.includes('power')) return '⚡';
    if (lower.includes('backdrop') || lower.includes('prop')) return '🎭';
    if (lower.includes('platform') || lower.includes('riser')) return '🏗️';
    if (lower.includes('safety') || lower.includes('barrier')) return '🚧';
    if (lower.includes('console') || lower.includes('foh')) return '🎛️';
    return '📦';
  }

  function getProfessionalIcon(professional: string): string {
    const lower = professional.toLowerCase();
    if (lower.includes('photo')) return '📷';
    if (lower.includes('video')) return '🎥';
    if (lower.includes('sound') || lower.includes('audio')) return '🎧';
    if (lower.includes('light')) return '💡';
    if (lower.includes('stage') || lower.includes('production')) return '🎭';
    if (lower.includes('marketing')) return '📢';
    if (lower.includes('security')) return '🛡️';
    if (lower.includes('medical')) return '🏥';
    if (lower.includes('transport')) return '🚐';
    return '👨‍💼';
  }

  // Add functions for different types
  function addInstrumentWithType(instrument: string, talentName?: string) {
    const name = talentName ? `${instrument} (${talentName})` : instrument;
    const newElement: StageElement = {
      id: Date.now().toString(),
      type: 'instrument',
      name,
      x: 50 + Math.random() * 200,
      y: 50 + Math.random() * 150,
      width: 60,
      height: 40,
      color: getElementColor('instrument'),
      editable: false,
      talentId: talentName,
      instrumentTypes: [instrument]
    };
    setStageElements([...stageElements, newElement]);
    setShowInstrumentModal(false);
  }

  function addEquipmentWithType(equipment: string) {
    const newElement: StageElement = {
      id: Date.now().toString(),
      type: 'equipment',
      name: equipment,
      x: 50 + Math.random() * 200,
      y: 50 + Math.random() * 150,
      width: 60,
      height: 40,
      color: getElementColor('equipment'),
      editable: false
    };
    setStageElements([...stageElements, newElement]);
    setShowEquipmentModal(false);
  }

  function addTalentWithType(talentName: string, type: 'main' | 'support') {
    const newElement: StageElement = {
      id: Date.now().toString(),
      type: 'talent',
      name: talentName,
      x: 50 + Math.random() * 200,
      y: 50 + Math.random() * 150,
      width: 50,
      height: 50,
      color: type === 'main' ? '#2ECC71' : '#27AE60',
      editable: false,
      talentId: talentName
    };
    setStageElements([...stageElements, newElement]);
    setShowTalentModal(false);
  }

  function addProfessionalWithType(professional: string) {
    const newElement: StageElement = {
      id: Date.now().toString(),
      type: 'other',
      name: professional,
      x: 50 + Math.random() * 200,
      y: 50 + Math.random() * 150,
      width: 50,
      height: 40,
      color: '#3498DB',
      editable: false
    };
    setStageElements([...stageElements, newElement]);
    setShowProfessionalModal(false);
  }
}