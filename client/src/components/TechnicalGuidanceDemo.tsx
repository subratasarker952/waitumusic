/**
 * Technical Guidance Demonstration Component
 * Shows both equipment-specific and generic guidance capabilities
 */

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Camera, Settings, Target, CheckCircle, AlertCircle, Lightbulb } from 'lucide-react';

interface EquipmentSpecs {
  cameraModel?: string;
  lensSpecs?: string[];
  sensorType?: string;
  maxISO?: number;
  megapixels?: number;
  videoCapabilities?: string[];
  audioEquipment?: string[];
  lightingEquipment?: string[];
  additionalGear?: string[];
}

interface GuidanceDemo {
  professionalType: string;
  hasEquipment: boolean;
  equipment?: EquipmentSpecs;
  artistGenre: string;
  internalObjectives?: string[];
}

export default function TechnicalGuidanceDemo() {
  const [selectedDemo, setSelectedDemo] = useState<GuidanceDemo | null>(null);
  const [guidanceResult, setGuidanceResult] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const demoScenarios: GuidanceDemo[] = [
    {
      professionalType: 'photographer',
      hasEquipment: true,
      equipment: {
        cameraModel: 'Canon EOS R5',
        lensSpecs: ['85mm f/1.2L', '24-70mm f/2.8L'],
        sensorType: 'Full Frame',
        maxISO: 51200,
        megapixels: 45,
        lightingEquipment: ['Profoto B10 Plus', 'LED Panel Kit']
      },
      artistGenre: 'Caribbean Neo Soul',
      internalObjectives: ['Album artwork preparation', 'Social media content for Instagram/TikTok', 'Press kit professional headshots']
    },
    {
      professionalType: 'photographer', 
      hasEquipment: false,
      artistGenre: 'Afrobeats',
      internalObjectives: ['Tour promotion materials', 'Brand consistency development']
    },
    {
      professionalType: 'videographer',
      hasEquipment: true,
      equipment: {
        cameraModel: 'Sony FX6', 
        lensSpecs: ['24-70mm f/2.8 GM', '70-200mm f/2.8 GM'],
        videoCapabilities: ['4K 120fps', 'S-Log3'],
        audioEquipment: ['Rode Wireless GO II', 'Zoom F6 Recorder'],
        lightingEquipment: ['Aputure 300d Mark II', 'RGB LED Panels']
      },
      artistGenre: 'Dancehall',
      internalObjectives: ['Music video B-roll', 'Performance documentation', 'Behind-the-scenes content']
    },
    {
      professionalType: 'videographer',
      hasEquipment: false,
      artistGenre: 'Pop/R&B',
      internalObjectives: ['Live performance capture', 'Social media video content']
    }
  ];

  const generateGuidance = async (scenario: GuidanceDemo) => {
    setIsGenerating(true);
    setSelectedDemo(scenario);
    
    // Simulate realistic technical guidance generation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (scenario.hasEquipment && scenario.equipment) {
      // Equipment-specific guidance
      setGuidanceResult({
        type: 'equipment-specific',
        technicalRequirements: {
          aperture: {
            recommended: scenario.equipment.cameraModel?.includes('Canon') ? 'f/1.8 - f/2.8' : 'f/2.0 - f/2.8',
            range: 'f/1.2 - f/4.0',
            reasoning: `Optimized for ${scenario.equipment.cameraModel} native performance and ${scenario.artistGenre} genre requirements`
          },
          shutterSpeed: {
            recommended: '1/125s - 1/250s',
            range: '1/60s - 1/500s', 
            reasoning: 'Balanced for performance movement and lighting conditions'
          },
          iso: {
            recommended: Math.min(1600, (scenario.equipment.maxISO || 6400) / 4),
            maxAcceptable: Math.min(6400, (scenario.equipment.maxISO || 6400) / 2),
            reasoning: `Utilizing ${scenario.equipment.cameraModel} optimal ISO performance range`
          }
        },
        equipmentSpecificGuidance: {
          hasEquipmentSpecs: true,
          equipmentOptimizations: [
            `Camera optimization for ${scenario.equipment.cameraModel}`,
            scenario.equipment.lensSpecs ? `Lens optimization: ${scenario.equipment.lensSpecs.join(', ')}` : '',
            scenario.equipment.lightingEquipment ? `Lighting setup: ${scenario.equipment.lightingEquipment.join(', ')}` : ''
          ].filter(Boolean),
          specificRecommendations: [
            scenario.equipment.cameraModel?.includes('Canon') ? 'Canon Color Science: Enhance skin tones using Portrait Picture Style' : '',
            scenario.equipment.cameraModel?.includes('Sony') ? 'Sony Real-time Eye AF: Ideal for performer tracking' : '',
            scenario.equipment.lensSpecs?.some(lens => lens.includes('85mm')) ? '85mm lens: Perfect for intimate performance shots and artist portraits' : '',
            scenario.equipment.lensSpecs?.some(lens => lens.includes('24-70')) ? '24-70mm zoom: Versatile for stage coverage without repositioning' : ''
          ].filter(Boolean)
        },
        internalObjectiveAlignment: {
          hasInternalObjectives: !!(scenario.internalObjectives && scenario.internalObjectives.length > 0),
          objectiveGuidance: scenario.internalObjectives?.map(obj => {
            if (obj.toLowerCase().includes('album')) return 'Album promotion focus: Capture professional-quality images suitable for album artwork and promotional materials';
            if (obj.toLowerCase().includes('social media')) return 'Social media optimization: Focus on vertical formats and eye-catching compositions';
            if (obj.toLowerCase().includes('press')) return 'Press kit development: Ensure professional headshots and performance documentation';
            if (obj.toLowerCase().includes('tour')) return 'Tour promotion materials: Document performance energy and audience engagement';
            return 'Brand consistency: Maintain visual coherence with existing artist branding';
          }) || [],
          strategicFocus: scenario.internalObjectives?.map(obj => {
            if (obj.toLowerCase().includes('album')) return 'High-resolution, print-ready deliverables';
            if (obj.toLowerCase().includes('social media')) return 'Multiple aspect ratios: 1:1, 9:16, 16:9';
            if (obj.toLowerCase().includes('press')) return 'Publication-ready quality with comprehensive metadata';
            return 'Versatile content suitable for multiple applications';
          }) || []
        }
      });
    } else {
      // Generic guidance fallback
      setGuidanceResult({
        type: 'generic',
        genericCameraSettings: {
          aperture: 'f/2.8 for most performance situations, f/1.8-f/2.0 for low light',
          shutterSpeed: '1/125s minimum for hand-held, 1/250s for performer movement',
          iso: 'Start at ISO 1600, increase as needed up to camera native performance limit',
          focusMode: 'Continuous AF (AI Servo/AF-C) for moving performers',
          meteringMode: 'Matrix/Evaluative for complex stage lighting'
        },
        universalTechniques: [
          'Shoot in RAW format for maximum post-processing flexibility',
          'Use back-button focus for improved accuracy',
          'Enable image stabilization if available on lens or body',
          'Bracket exposures in challenging lighting conditions',
          'Focus on performer\'s eyes when possible'
        ],
        genreSpecificApproach: {
          energy: scenario.artistGenre === 'Afrobeats' ? 'High-energy, vibrant shots capturing rhythmic intensity' : 'Polished, commercial-ready shots emphasizing star quality',
          lighting: scenario.artistGenre === 'Dancehall' ? 'Embrace colorful stage lighting, use dramatic contrasts' : 'Clean, professional lighting that flatters performer',
          composition: 'Performance shots, audience interaction, star moments'
        },
        fallbackEquipment: [
          'Full-frame camera body preferred for low-light performance',
          '85mm f/1.8 lens for portraits and performance shots',
          '24-70mm f/2.8 for versatile stage coverage',
          'External flash with diffusion for fill lighting',
          'Backup camera body and extra batteries essential'
        ],
        internalObjectiveAlignment: {
          hasInternalObjectives: !!(scenario.internalObjectives && scenario.internalObjectives.length > 0),
          objectiveGuidance: scenario.internalObjectives?.map(obj => `Generic guidance aligned with: ${obj}`) || ['Standard professional documentation for comprehensive press kit and promotional use'],
          strategicFocus: ['Versatile content suitable for multiple applications']
        }
      });
    }
    
    setIsGenerating(false);
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Technical Guidance System Demonstration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Demonstrates OppHub's ability to provide precise technical guidance based on actual professional equipment specifications,
            with comprehensive fallback to generic guidance when equipment details are unavailable.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {demoScenarios.map((scenario, index) => (
              <Card key={index} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => generateGuidance(scenario)}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={scenario.hasEquipment ? "default" : "secondary"}>
                      {scenario.hasEquipment ? "Equipment-Specific" : "Generic Guidance"}
                    </Badge>
                    <Camera className="w-4 h-4" />
                  </div>
                  <h4 className="font-medium">{scenario.professionalType.charAt(0).toUpperCase() + scenario.professionalType.slice(1)}</h4>
                  <p className="text-sm text-muted-foreground">{scenario.artistGenre}</p>
                  {scenario.equipment && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {scenario.equipment.cameraModel} + {scenario.equipment.lensSpecs?.length || 0} lenses
                    </p>
                  )}
                  <div className="mt-2">
                    <p className="text-xs font-medium">Internal Objectives:</p>
                    <p className="text-xs text-muted-foreground">{scenario.internalObjectives?.slice(0, 2).join(', ') || 'Standard documentation'}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {isGenerating && (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 animate-spin" />
                <span>Generating technical guidance...</span>
              </div>
            </div>
          )}

          {guidanceResult && selectedDemo && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {guidanceResult.type === 'equipment-specific' ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <Lightbulb className="w-5 h-5 text-blue-500" />
                  )}
                  {guidanceResult.type === 'equipment-specific' ? 'Equipment-Specific' : 'Generic'} Technical Guidance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="technical" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="technical">Technical Settings</TabsTrigger>
                    <TabsTrigger value="equipment">Equipment Guidance</TabsTrigger>
                    <TabsTrigger value="objectives">Internal Objectives</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="technical" className="space-y-4">
                    {guidanceResult.type === 'equipment-specific' ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Aperture</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="font-medium">{guidanceResult.technicalRequirements.aperture.recommended}</p>
                            <p className="text-xs text-muted-foreground mt-1">Range: {guidanceResult.technicalRequirements.aperture.range}</p>
                            <p className="text-xs text-muted-foreground mt-2">{guidanceResult.technicalRequirements.aperture.reasoning}</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Shutter Speed</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="font-medium">{guidanceResult.technicalRequirements.shutterSpeed.recommended}</p>
                            <p className="text-xs text-muted-foreground mt-1">Range: {guidanceResult.technicalRequirements.shutterSpeed.range}</p>
                            <p className="text-xs text-muted-foreground mt-2">{guidanceResult.technicalRequirements.shutterSpeed.reasoning}</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm">ISO</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="font-medium">{guidanceResult.technicalRequirements.iso.recommended}</p>
                            <p className="text-xs text-muted-foreground mt-1">Max: {guidanceResult.technicalRequirements.iso.maxAcceptable}</p>
                            <p className="text-xs text-muted-foreground mt-2">{guidanceResult.technicalRequirements.iso.reasoning}</p>
                          </CardContent>
                        </Card>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <h4 className="font-medium">Generic Camera Settings</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div><strong>Aperture:</strong> {guidanceResult.genericCameraSettings.aperture}</div>
                          <div><strong>Shutter Speed:</strong> {guidanceResult.genericCameraSettings.shutterSpeed}</div>
                          <div><strong>ISO:</strong> {guidanceResult.genericCameraSettings.iso}</div>
                          <div><strong>Focus Mode:</strong> {guidanceResult.genericCameraSettings.focusMode}</div>
                        </div>
                        <div>
                          <h5 className="font-medium mb-2">Universal Techniques:</h5>
                          <ul className="text-sm space-y-1">
                            {guidanceResult.universalTechniques.map((technique: string, index: number) => (
                              <li key={index} className="flex items-start gap-2">
                                <CheckCircle className="w-3 h-3 mt-0.5 text-green-500" />
                                {technique}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="equipment" className="space-y-4">
                    {guidanceResult.type === 'equipment-specific' ? (
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            Equipment Optimizations
                          </h4>
                          <ul className="text-sm space-y-1">
                            {guidanceResult.equipmentSpecificGuidance.equipmentOptimizations.map((opt: string, index: number) => (
                              <li key={index} className="flex items-start gap-2">
                                <Settings className="w-3 h-3 mt-0.5 text-blue-500" />
                                {opt}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Specific Recommendations</h4>
                          <ul className="text-sm space-y-1">
                            {guidanceResult.equipmentSpecificGuidance.specificRecommendations.map((rec: string, index: number) => (
                              <li key={index} className="flex items-start gap-2">
                                <Lightbulb className="w-3 h-3 mt-0.5 text-yellow-500" />
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-orange-500" />
                            Generic Fallback Equipment
                          </h4>
                          <ul className="text-sm space-y-1">
                            {guidanceResult.fallbackEquipment.map((equipment: string, index: number) => (
                              <li key={index} className="flex items-start gap-2">
                                <Camera className="w-3 h-3 mt-0.5 text-gray-500" />
                                {equipment}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Genre-Specific Approach</h4>
                          <div className="text-sm space-y-2">
                            <div><strong>Energy:</strong> {guidanceResult.genreSpecificApproach.energy}</div>
                            <div><strong>Lighting:</strong> {guidanceResult.genreSpecificApproach.lighting}</div>
                            <div><strong>Composition:</strong> {guidanceResult.genreSpecificApproach.composition}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="objectives" className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Target className="w-4 h-4 text-purple-500" />
                        Internal Objective Alignment
                        {guidanceResult.internalObjectiveAlignment.hasInternalObjectives && (
                          <Badge variant="default" className="ml-2">Active</Badge>
                        )}
                      </h4>
                      
                      <div className="space-y-3">
                        <div>
                          <h5 className="text-sm font-medium mb-1">Objective Guidance:</h5>
                          <ul className="text-sm space-y-1">
                            {guidanceResult.internalObjectiveAlignment.objectiveGuidance.map((guidance: string, index: number) => (
                              <li key={index} className="flex items-start gap-2">
                                <Target className="w-3 h-3 mt-0.5 text-purple-500" />
                                {guidance}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h5 className="text-sm font-medium mb-1">Strategic Focus:</h5>
                          <ul className="text-sm space-y-1">
                            {guidanceResult.internalObjectiveAlignment.strategicFocus.map((focus: string, index: number) => (
                              <li key={index} className="flex items-start gap-2">
                                <CheckCircle className="w-3 h-3 mt-0.5 text-green-500" />
                                {focus}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}