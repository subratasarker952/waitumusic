import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useEnhancedToast } from '@/components/ui/perfect-toast';
import { TECHNICAL_RIDER_CONFIGS, TOAST_CONFIGS } from '@shared/ui-config';
import EnhancedMixerPatchSystem from '@/components/stage-plot/EnhancedMixerPatchSystem';
import { useQuery } from '@tanstack/react-query';
import {
  Save, Download, Share2, RefreshCw, Zap, AlertTriangle, CheckCircle, Clock,
  Layout, Volume2, Mic, Speaker, Music, Settings, Users, Calendar,
  Target, MapPin, FileText, Database, Wand2, Brain, Eye, Plus, Lightbulb, X, RotateCcw, Monitor, Move, ChevronUp, ChevronDown, Edit3
} from 'lucide-react';
import DrumKitConfigModal from '../modals/DrumKitConfigModal';
import EnhancedSetlistSection from '@/components/setlist/EnhancedSetlistSection';
import { ShareButton } from '@/components/share/ShareButton';

interface TechnicalRequirement {
  id: string;
  category: 'sound' | 'lighting' | 'power' | 'stage' | 'backline' | 'production';
  item: string;
  description: string;
  quantity: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  providedBy: 'venue' | 'artist' | 'rental' | 'production';
  specifications?: string;
  brand?: string;
  model?: string;
  assignedTo?: string;
  status: 'pending' | 'confirmed' | 'unavailable' | 'alternative';
  alternatives?: string[];
  notes?: string;
}

interface StageLayout {
  stageWidth: number;
  stageHeight: number;
  stageType: 'indoor' | 'outdoor' | 'amphitheater' | 'arena' | 'club';
  riser: boolean;
  riserSpecs?: string;
  backdrop: boolean;
  backstageAccess: boolean;
  loadInAccess: string;
  elements: Array<{
    id: string;
    type: 'instrument' | 'mic' | 'monitor' | 'equipment' | 'performer';
    name: string;
    x: number;
    y: number;
    rotation: number;
    assignedTo?: string;
  }>;
}

interface AudioConfig {
  mainPA: string;
  monitors: Array<{
    type: string;
    quantity: number;
    placement: string;
  }>;
  mixerChannels: number;
  inputList: Array<{
    channel: number;
    instrument: string;
    inputType: string;
    phantom: boolean;
    assignedTo: string;
  }>;
  effectsRack: string[];
  recordingRequirements?: string;
}

interface EnhancedTechnicalRiderProps {
  bookingId: number;
  assignedMusicians?: any[];
  eventDetails?: {
    eventName: string;
    venueName: string;
    eventDate: string;
    eventType: string;
    duration: number;
  };
  canEdit?: boolean;
  userRole?: string;
  onSave?: (data: any) => void;
  onLoad?: (data: any) => void;
}

function EnhancedTechnicalRider({
  bookingId,
  assignedMusicians = [],
  eventDetails,
  canEdit = true,
  userRole = 'user',
  onSave,
  onLoad
}: EnhancedTechnicalRiderProps) {
  const { toast } = useEnhancedToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Fetch assigned talent data directly from API using same endpoint as assignment system
  const { data: apiAssignedTalent, isLoading: talentLoading } = useQuery({
    queryKey: [`/api/bookings/${bookingId}/assigned-talent`],
    enabled: !!bookingId
  });

  // Use API data if available, otherwise fall back to props
  const finalAssignedMusicians = apiAssignedTalent || assignedMusicians;

  // Individual Band Member Hospitality Section with individual data queries
  const BandMemberHospitalitySection = ({ member }: { member: any }) => {
    // Query hospitality requirements for this specific band member
    const { data: memberHospitalityData = [] } = useQuery({
      queryKey: [`/api/users/${member.userId}/hospitality-requirements`],
      enabled: !!member.userId
    });

    console.log(`🍽️ HOSPITALITY: Member ${member.fullName} (ID: ${member.userId}) - Found ${(memberHospitalityData as any[]).length} requirements`);

    return (
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-semibold">
                {member.fullName?.charAt(0) || 'B'}
              </div>
              <div>
                <h4 className="font-medium">{member.fullName}</h4>
                {member.stageName && (
                  <p className="text-sm text-muted-foreground">({member.stageName})</p>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Role</p>
              <p className="text-sm font-medium">{member.selectedTalent || 'Performer'}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          {(memberHospitalityData as any[]).length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground mb-2">Specific requirements from profile:</p>
              {(memberHospitalityData as any[]).map((req: any, reqIndex: number) => (
                <div key={req.id || reqIndex} className="flex items-center gap-2 p-2 bg-green-50 rounded">
                  <Badge variant="outline" className="text-xs">
                    {req.category}
                  </Badge>
                  <span className="text-sm">{req.item || req.requirement}</span>
                  {req.specifications && (
                    <span className="text-xs text-muted-foreground">({req.specifications})</span>
                  )}
                  {req.priority === 'critical' && (
                    <Badge variant="destructive" className="text-xs">Critical</Badge>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-3 text-muted-foreground">
              <p className="text-sm">No hospitality requirements found for {member.fullName}</p>
              <p className="text-xs">Standard requirements will apply</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // Dressing Room Requirements Component
  const DressingRoomRequirements = ({ bandMembers }: { bandMembers: any[] }) => {
    const [allDressingRoomReqs, setAllDressingRoomReqs] = useState<any[]>([]);

    useEffect(() => {
      const fetchAllDressingRoomRequirements = async () => {
        const requirements: any[] = [];
        for (const member of bandMembers) {
          // Process all assigned talent (restriction removed)
          if (member.userId) {
            try {
              const token = localStorage.getItem('token');
              const response = await fetch(`/api/users/${member.userId}/hospitality-requirements`, {
                headers: {
                  ...(token && { 'Authorization': `Bearer ${token}` }),
                },
                credentials: 'include'
              });
              if (response.ok) {
                const data = await response.json();
                const dressingRoomReqs = data.filter((req: any) =>
                  req.category === 'Dressing Room' || req.category === 'Green Room'
                );
                requirements.push(...dressingRoomReqs.map((req: any) => ({ ...req, memberName: member.fullName })));
              }
            } catch (error) {
              console.log(`Failed to fetch dressing room requirements for ${member.fullName}:`, error);
            }
          }
        }
        setAllDressingRoomReqs(requirements);
      };

      fetchAllDressingRoomRequirements();
    }, [bandMembers]);

    return (
      <>
        {allDressingRoomReqs.map((req, index) => (
          <div key={req.id || index} className="flex items-center gap-2">
            <Checkbox id={`custom-amenity-${req.id || index}`} defaultChecked />
            <Label htmlFor={`custom-amenity-${req.id || index}`} className="text-sm">
              {req.item || req.requirement}
              {req.specifications && ` (${req.specifications})`}
              <span className="text-xs text-muted-foreground ml-1">- {req.memberName}</span>
            </Label>
            {req.priority === 'critical' && (
              <Badge variant="destructive" className="text-xs">Critical</Badge>
            )}
          </div>
        ))}
      </>
    );
  };

  // Individual Band Member Technical Requirements Section
  const BandMemberTechnicalSection = ({ member }: { member: any }) => {
    // Query technical requirements for this specific band member
    const { data: memberTechnicalData = [] } = useQuery({
      queryKey: [`/api/users/${member.userId}/technical-requirements`],
      enabled: !!member.userId
    });

    console.log(`🔧 TECHNICAL: Member ${member.fullName} (ID: ${member.userId}) - Found ${(memberTechnicalData as any[]).length} requirements`);

    return (
      <Card className="border-l-4 border-l-orange-500">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-sm font-semibold">
                {member.fullName?.charAt(0) || 'T'}
              </div>
              <div>
                <h4 className="font-medium">{member.fullName}</h4>
                {member.stageName && (
                  <p className="text-sm text-muted-foreground">({member.stageName})</p>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Role</p>
              <p className="text-sm font-medium">{member.selectedTalent || 'Performer'}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          {(memberTechnicalData as any[]).length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground mb-2">Technical requirements from profile:</p>
              {(memberTechnicalData as any[]).map((req: any, reqIndex: number) => (
                <div key={req.id || reqIndex} className="flex items-center gap-2 p-2 bg-orange-50 rounded">
                  <Badge variant="outline" className="text-xs">
                    {req.requirementType}
                  </Badge>
                  <span className="text-sm">{req.requirementName}</span>
                  {req.specifications && (
                    <span className="text-xs text-muted-foreground">({req.specifications})</span>
                  )}
                  {req.priority === 'critical' && (
                    <Badge variant="destructive" className="text-xs">Critical</Badge>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-3 text-muted-foreground">
              <p className="text-sm">No technical requirements found for {member.fullName}</p>
              <p className="text-xs">Standard equipment will apply</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // Individual Band Member Performance Specifications Section
  const BandMemberPerformanceSection = ({ member }: { member: any }) => {
    // Query performance specs for this specific band member
    const { data: memberPerformanceData = [] } = useQuery({
      queryKey: [`/api/users/${member.userId}/performance-specs`],
      enabled: !!member.userId
    });

    console.log(`🎵 PERFORMANCE: Member ${member.fullName} (ID: ${member.userId}) - Found ${(memberPerformanceData as any[]).length} specifications`);

    return (
      <Card className="border-l-4 border-l-green-500">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-sm font-semibold">
                {member.fullName?.charAt(0) || 'P'}
              </div>
              <div>
                <h4 className="font-medium">{member.fullName}</h4>
                {member.stageName && (
                  <p className="text-sm text-muted-foreground">({member.stageName})</p>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Role</p>
              <p className="text-sm font-medium">{member.selectedTalent || 'Performer'}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          {(memberPerformanceData as any[]).length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground mb-2">Performance specifications from profile:</p>
              {(memberPerformanceData as any[]).map((spec: any, specIndex: number) => (
                <div key={spec.id || specIndex} className="flex items-center gap-2 p-2 bg-green-50 rounded">
                  <Badge variant="outline" className="text-xs">
                    {spec.specType}
                  </Badge>
                  <span className="text-sm">{spec.specName}: {spec.specValue}</span>
                  {spec.notes && (
                    <span className="text-xs text-muted-foreground">({spec.notes})</span>
                  )}
                  {spec.priority === 'critical' && (
                    <Badge variant="destructive" className="text-xs">Critical</Badge>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-3 text-muted-foreground">
              <p className="text-sm">No performance specifications found for {member.fullName}</p>
              <p className="text-xs">Standard performance setup will apply</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // Refreshment Requirements Component
  const RefreshmentRequirements = ({ bandMembers }: { bandMembers: any[] }) => {
    const [allRefreshmentReqs, setAllRefreshmentReqs] = useState<any[]>([]);

    useEffect(() => {
      const fetchAllRefreshmentRequirements = async () => {
        const requirements: any[] = [];
        for (const member of bandMembers) {
          // Process all assigned talent (restriction removed)
          if (member.userId) {
            try {
              const response = await fetch(`/api/users/${member.userId}/hospitality-requirements`);
              if (response.ok) {
                const data = await response.json();
                const refreshmentReqs = data.filter((req: any) =>
                  req.category === 'Catering' || req.category === 'Beverages' || req.category === 'Refreshments'
                );
                requirements.push(...refreshmentReqs.map((req: any) => ({ ...req, memberName: member.fullName })));
              }
            } catch (error) {
              console.log(`Failed to fetch refreshment requirements for ${member.fullName}:`, error);
            }
          }
        }
        setAllRefreshmentReqs(requirements);
      };

      fetchAllRefreshmentRequirements();
    }, [bandMembers]);

    return (
      <div className="space-y-2">
        {allRefreshmentReqs.length > 0 ? (
          <>
            <p className="text-sm text-muted-foreground">
              Customized refreshment requirements based on band member preferences:
            </p>
            {allRefreshmentReqs.map((req, index) => (
              <div key={req.id || index} className="flex items-center gap-2">
                <Checkbox id={`refreshment-${req.id || index}`} defaultChecked />
                <Label htmlFor={`refreshment-${req.id || index}`} className="text-sm">
                  {req.item || req.requirement}
                  {req.specifications && ` (${req.specifications})`}
                  <span className="text-xs text-muted-foreground ml-1">- {req.memberName}</span>
                </Label>
                {req.priority === 'critical' && (
                  <Badge variant="destructive" className="text-xs">Critical</Badge>
                )}
              </div>
            ))}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Standard refreshment requirements will apply (no specific band member preferences found).
          </p>
        )}
      </div>
    );
  };

  // Editable Dressing Room Section Component
  const EditableDressingRoomSection = ({ bandMembers }: { bandMembers: any[] }) => {
    const [customRequirements, setCustomRequirements] = useState<any[]>([]);
    const [standardItems, setStandardItems] = useState([
      { id: 1, item: "Towels or paper towels", checked: true, editable: false },
      { id: 2, item: "Free access to the internet (if available)", checked: true, editable: false },
      { id: 3, item: "Mirrors and adequate lighting", checked: true, editable: false },
      { id: 4, item: "Electrical outlets for equipment", checked: true, editable: false }
    ]);
    const [newItem, setNewItem] = useState('');

    // Fetch member-specific requirements
    useEffect(() => {
      const fetchCustomRequirements = async () => {
        const requirements: any[] = [];
        for (const member of bandMembers) {
          // Process all assigned talent (restriction removed)
          if (member.userId) {
            try {
              const response = await fetch(`/api/users/${member.userId}/hospitality-requirements`);
              if (response.ok) {
                const data = await response.json();
                const dressingReqs = data.filter((req: any) =>
                  req.requirementType === 'dressing_room' || req.requirementType === 'green_room'
                );
                requirements.push(...dressingReqs.map((req: any) => ({
                  ...req,
                  memberName: member.fullName,
                  checked: true,
                  editable: true
                })));
              }
            } catch (error) {
              console.log(`Failed to fetch dressing room requirements for ${member.fullName}:`, error);
            }
          }
        }
        setCustomRequirements(requirements);
      };

      fetchCustomRequirements();
    }, [bandMembers]);

    const addNewItem = () => {
      if (newItem.trim()) {
        const newId = Math.max(...standardItems.map(i => i.id), 0) + 1;
        setStandardItems(prev => [...prev, {
          id: newId,
          item: newItem.trim(),
          checked: true,
          editable: true
        }]);
        setNewItem('');
      }
    };

    const removeItem = (id: number) => {
      setStandardItems(prev => prev.filter(item => item.id !== id));
    };

    const toggleItem = (id: number) => {
      setStandardItems(prev => prev.map(item =>
        item.id === id ? { ...item, checked: !item.checked } : item
      ));
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Dressing Room Requirements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 border rounded">
            <Label className="text-sm font-medium">
              SERVICE PROVIDER requests dressing room accommodation based on band composition and individual needs.
            </Label>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-sm">Dressing Room Amenities:</h4>

            {/* Custom requirements from band members */}
            {customRequirements.map((req, index) => (
              <div key={req.id || index} className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                <Checkbox id={`custom-${req.id || index}`} checked={req.checked} />
                <Label htmlFor={`custom-${req.id || index}`} className="text-sm flex-1">
                  {req.requirementName}
                  {req.specifications && ` (${req.specifications})`}
                  <span className="text-xs text-muted-foreground ml-1">- {req.memberName}</span>
                </Label>
              </div>
            ))}

            {/* Standard and custom items */}
            {standardItems.map((item) => (
              <div key={item.id} className="flex items-center gap-2">
                <Checkbox
                  id={`amenity-${item.id}`}
                  checked={item.checked}
                  onCheckedChange={() => toggleItem(item.id)}
                />
                <Label htmlFor={`amenity-${item.id}`} className="text-sm flex-1">{item.item}</Label>
                {item.editable && (
                  <Button variant="ghost" size="sm" onClick={() => removeItem(item.id)}>
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}

            {/* Add new item */}
            <div className="flex gap-2 mt-4">
              <Input
                placeholder="Add custom dressing room requirement"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addNewItem()}
                className="flex-1"
              />
              <Button onClick={addNewItem} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Editable Refreshment Section Component
  const EditableRefreshmentSection = ({ bandMembers }: { bandMembers: any[] }) => {
    const [customRequirements, setCustomRequirements] = useState<any[]>([]);
    const [standardItems, setStandardItems] = useState([
      { id: 1, item: "Bottle(s) of spring water (room temperature)", checked: true, editable: false },
      { id: 2, item: "A variety of fruit juices (orange is preferred)", checked: true, editable: false },
      { id: 3, item: "Hot water, honey and lemon for tea", checked: true, editable: false },
      { id: 4, item: "Coffee", checked: true, editable: false }
    ]);
    const [newItem, setNewItem] = useState('');

    // Fetch member-specific requirements
    useEffect(() => {
      const fetchCustomRequirements = async () => {
        const requirements: any[] = [];
        for (const member of bandMembers) {
          // Process all assigned talent (restriction removed)
          if (member.userId) {
            try {
              const response = await fetch(`/api/users/${member.userId}/hospitality-requirements`);
              if (response.ok) {
                const data = await response.json();
                const refreshmentReqs = data.filter((req: any) =>
                  req.requirementType === 'catering' || req.requirementType === 'beverages' || req.requirementType === 'refreshments'
                );
                requirements.push(...refreshmentReqs.map((req: any) => ({
                  ...req,
                  memberName: member.fullName,
                  checked: true,
                  editable: true
                })));
              }
            } catch (error) {
              console.log(`Failed to fetch refreshment requirements for ${member.fullName}:`, error);
            }
          }
        }
        setCustomRequirements(requirements);
      };

      fetchCustomRequirements();
    }, [bandMembers]);

    const addNewItem = () => {
      if (newItem.trim()) {
        const newId = Math.max(...standardItems.map(i => i.id), 0) + 1;
        setStandardItems(prev => [...prev, {
          id: newId,
          item: newItem.trim(),
          checked: true,
          editable: true
        }]);
        setNewItem('');
      }
    };

    const removeItem = (id: number) => {
      setStandardItems(prev => prev.filter(item => item.id !== id));
    };

    const toggleItem = (id: number) => {
      setStandardItems(prev => prev.map(item =>
        item.id === id ? { ...item, checked: !item.checked } : item
      ));
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Refreshment Requirements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Custom requirements from band members */}
          {customRequirements.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Band member specific requirements:
              </p>
              {customRequirements.map((req, index) => (
                <div key={req.id || index} className="flex items-center gap-2 p-2 bg-green-50 rounded">
                  <Checkbox id={`custom-refreshment-${req.id || index}`} checked={req.checked} />
                  <Label htmlFor={`custom-refreshment-${req.id || index}`} className="text-sm flex-1">
                    {req.requirementName}
                    {req.specifications && ` (${req.specifications})`}
                    <span className="text-xs text-muted-foreground ml-1">- {req.memberName}</span>
                  </Label>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2">
            <h4 className="font-medium text-sm">Standard Refreshments:</h4>

            {/* Standard and custom items */}
            {standardItems.map((item) => (
              <div key={item.id} className="flex items-center gap-2">
                <Checkbox
                  id={`refreshment-${item.id}`}
                  checked={item.checked}
                  onCheckedChange={() => toggleItem(item.id)}
                />
                <Label htmlFor={`refreshment-${item.id}`} className="text-sm flex-1">{item.item}</Label>
                {item.editable && (
                  <Button variant="ghost" size="sm" onClick={() => removeItem(item.id)}>
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}

            {/* Add new item */}
            <div className="flex gap-2 mt-4">
              <Input
                placeholder="Add custom refreshment requirement"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addNewItem()}
                className="flex-1"
              />
              <Button onClick={addNewItem} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Equipment Request Interface
  interface EquipmentRequest {
    id: string;
    item: string;
    required: boolean;
    category: string;
  }

  // Main State
  const [riderData, setRiderData] = useState({
    eventInfo: eventDetails || {},
    technicalRequirements: [] as TechnicalRequirement[],
    equipmentRequests: [] as EquipmentRequest[],
    stageLayout: {
      stageWidth: 20,
      stageHeight: 16,
      stageType: 'indoor',
      riser: false,
      backdrop: false,
      backstageAccess: true,
      loadInAccess: 'rear',
      elements: []
    } as StageLayout,
    audioConfig: {
      mainPA: 'Line Array System',
      monitors: [],
      mixerChannels: 32,
      inputList: [],
      effectsRack: [],
    } as AudioConfig,
    lighting: {
      generalWash: true,
      spotlights: 4,
      specialEffects: [],
      dimmingControl: true,
      lightingConsole: 'Professional',
    },
    power: {
      totalLoad: 0,
      distributionBoxes: 2,
      singlePhase: true,
      threePhase: false,
      groundedOutlets: 12,
    },
    schedule: {
      loadIn: '',
      soundcheck: '',
      doors: '',
      showtime: '',
      curfew: '',
      loadOut: '',
    },
    contacts: {
      production: { name: '', phone: '', email: '' },
      technical: { name: '', phone: '', email: '' },
      venue: { name: '', phone: '', email: '' },
    },
    additionalNotes: '',
    emergencyProcedures: '',
  });

  const [activeTab, setActiveTab] = useState('requirements');
  const [isGenerating, setIsGenerating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [bandMembers, setBandMembers] = useState<Array<{
    id: string;
    membership: keyof typeof TECHNICAL_RIDER_CONFIGS.MEMBERSHIP_TYPES;
    role: string;
    fullName: string;
    stageName?: string;
    userId?: number;
    isManual?: boolean;
    profileRoles?: string[];
    profileSkills?: string[];
    primaryRole?: string;
    assignedRole?: string;
    selectedRoles?: string[];
    isMainBookedTalent?: boolean;
    assignmentRole?: string;
    talentType?: string;
    type?: string; // Add type property for professional detection
    selectedTalent?: string; // Add selectedTalent property for dropdown value
    availableRoles?: string[];
    professionalRoles?: string[];
    professionalSkills?: string[];
    // NEW: Assignment source tracking fields
    assignmentSource?: string;
    roleBadge?: string;
    artistProfile?: any;
    musicianProfile?: any;
    professionalProfile?: any;
    dropdownOptions?: Array<{ value: string, label: string, color: string, icon: string, tier: number, type?: string }>;
    // MONITOR MIXING PROPERTIES
    monitorType?: 'wedge' | 'iem-wired' | 'iem-wireless';
    monitorMix?: Record<string, { selected: boolean; volume: number; sectionName?: string; channelName?: string }>;
    overallMonitorLevel?: number;
  }>>([]);
  const [completionStatus, setCompletionStatus] = useState({
    overview: false,
    requirements: false,
    stage: false,
    audio: false,
    lighting: false,
    schedule: false,
  });

  // Drag state for stage plot elements
  const [dragState, setDragState] = useState<{
    isDragging: boolean;
    elementId: string | null;
    startX: number;
    startY: number;
  }>({
    isDragging: false,
    elementId: null,
    startX: 0,
    startY: 0
  });

  // Selected element for control buttons
  const [selectedElement, setSelectedElement] = useState<string | null>(null);

  // Separate state for legend editing (manual only)
  const [editingLegendItem, setEditingLegendItem] = useState<string | null>(null);

  // Equipment counters for auto-increment naming
  const [equipmentCounters, setEquipmentCounters] = useState<{ [key: string]: number }>({});

  // Stage plot legend data
  const [stageLegend, setStageLegend] = useState<Array<{
    id: string;
    name: string;
    type: string;
    color: string;
    assignedTo?: string;
    role?: string;
  }>>([]);

  // DYNAMIC INSTRUMENT-DRIVEN MIXER SYSTEM - No predefined channels, builds from database
  const getEmptyMixerChannels = () => ({});

  // Function to fetch all available instruments from database and create channel structure
  const buildChannelsFromInstruments = async (assignedInstruments: string[] = []) => {
    try {
      console.log('🎼 BUILDING CHANNELS FROM INSTRUMENT DATABASE');

      // Fetch all instruments from database
      const response = await fetch('/api/instruments');
      if (!response.ok) throw new Error('Failed to fetch instruments');

      const allInstruments = await response.json();
      console.log(`📊 Found ${allInstruments.length} instruments in database`);

      // Group instruments by mixer_group
      const instrumentsByGroup = allInstruments.reduce((groups: any, instrument: any) => {
        const group = instrument.mixer_group.toLowerCase();
        if (!groups[group]) groups[group] = [];
        groups[group].push(instrument);
        return groups;
      }, {});

      // Create channel structure based on assigned instruments + extras from each group
      const dynamicChannels: any = {};

      // Process each mixer group
      Object.keys(instrumentsByGroup).forEach(groupName => {
        // Skip talkback from technical group - use ID-based filtering
        if (groupName === 'technical') {
          // Filter by ID: exclude Talkback Mic (ID 187)
          const instruments = instrumentsByGroup[groupName].filter((inst: any) =>
            inst.id !== 187
          );
          if (instruments.length === 0) return;
        } else {
          var instruments = instrumentsByGroup[groupName];
        }

        const groupChannels: any[] = [];

        // Special handling for drums - use drum kit configurations
        if (groupName === 'drums') {
          // Check if we have drum kit configurations for assigned drummers - MAIN BOOKED TALENT ONLY
          const drummers = bandMembers.filter(member =>
            member.selectedTalent &&
            (member.selectedTalent.toLowerCase().includes('drum') ||
              member.assignedRole?.toLowerCase().includes('drum')) &&
            (!member.assignmentRole || member.assignmentRole === 'Main Booked Talent')
          );

          console.log(`🥁 Found ${drummers.length} drummers with configurations`);

          if (drummers.length > 0) {
            drummers.forEach((drummer, drummerIndex) => {
              const drummerConfig = drumKitConfigs[drummer.id];
              if (drummerConfig && drummerConfig.components) {
                console.log(`🎛️ Adding ${drummerConfig.components.length} channels for ${drummer.fullName || drummer.stageName}`);

                drummerConfig.components
                  .filter((comp: any) => comp.isSelected && comp.requiresChannel)
                  .forEach((component: any, compIndex: number) => {
                    groupChannels.push({
                      id: `drum-${drummer.id}-${component.id}`,
                      input: component.channelName || component.name,
                      applicable: true,
                      notes: `${drummer.fullName || drummer.stageName} - ${component.name}`,
                      assignedTo: drummer.fullName || drummer.stageName,
                      instrumentId: component.id,
                      isAssigned: true,
                      drumKitComponent: true,
                      drummerId: drummer.id,
                      micType: component.micType
                    });
                  });
              } else {
                // Fallback to basic drum channels if no configuration
                const basicDrumChannels = [
                  'Kick', 'Snare', 'Hi-Hat', 'Tom 1', 'Tom 2', 'Floor Tom', 'OH L', 'OH R'
                ];
                basicDrumChannels.forEach((drumChannel, index) => {
                  groupChannels.push({
                    id: `drum-${drummer.id}-basic-${index}`,
                    input: drumChannel,
                    applicable: index < 6, // First 6 are typically needed
                    notes: `${drummer.fullName || drummer.stageName} - Basic kit`,
                    assignedTo: drummer.fullName || drummer.stageName,
                    isAssigned: true,
                    drumKitComponent: true,
                    drummerId: drummer.id
                  });
                });
              }
            });
          }
        } else {
          // NO NAME-BASED SEARCHING! Only use assigned instruments by ID
          // This section is only reached for extra channel generation
          // Get top 3 instruments from this group as backup channels
          const topInstruments = instruments
            .sort((a: any, b: any) => (b.display_priority || 0) - (a.display_priority || 0))
            .slice(0, 3);

          topInstruments.forEach((instrument: any, index: number) => {
            groupChannels.push({
              id: `${groupName}-extra-${index}`,
              input: instrument.name,
              applicable: false,
              notes: "Available if needed",
              assignedTo: "",
              instrumentId: instrument.id,
              isAssigned: false
            });
          });
        }

        // Only add group if it has channels
        if (groupChannels.length > 0) {
          dynamicChannels[groupName] = groupChannels;
        }
      });

      console.log(`🎛️ Built ${Object.keys(dynamicChannels).length} channel groups:`, Object.keys(dynamicChannels));
      return dynamicChannels;

    } catch (error) {
      console.error('❌ Error building channels from instruments:', error);

      // Fallback to minimal essential channels if database fails
      return {
        vocals: [
          { id: 'vocal-1', input: "Lead Vocals", applicable: true, notes: "", assignedTo: "" },
          { id: 'vocal-2', input: "Background Vocals", applicable: false, notes: "", assignedTo: "" }
        ],
        drums: [
          { id: 'drum-1', input: "Kick", applicable: true, notes: "", assignedTo: "" },
          { id: 'drum-2', input: "Snare", applicable: true, notes: "", assignedTo: "" },
          { id: 'drum-3', input: "Hi-Hat", applicable: true, notes: "", assignedTo: "" }
        ],
        bass: [
          { id: 'bass-1', input: "Bass", applicable: true, notes: "", assignedTo: "" }
        ],
        guitars: [
          { id: 'guitar-1', input: "Guitar", applicable: true, notes: "", assignedTo: "" }
        ]
      };
    }
  };

  // Mixer channels state - starts empty, builds dynamically from instruments
  const [mixerChannels, setMixerChannels] = useState<any>({
    drums: [],
    percussion: [],
    bass: [],
    guitars: [],
    keyboards: [],
    brass: [],
    strings: [],
    woodwind: [],
    world: [],
    electronic: [],
    technical: [],
    vocals: []
  });

  // Channel group ordering state - controls the order of sections in the mixer (industry standard order)
  const [channelGroupOrder, setChannelGroupOrder] = useState<string[]>([
    'drums', 'percussion', 'bass', 'guitars', 'keyboards', 'vocals', 'brass', 'strings', 'woodwind', 'world', 'electronic', 'technical'
  ]);

  // Drag state for channel groups
  const [groupDragState, setGroupDragState] = useState<{
    isDragging: boolean;
    draggedGroup: string | null;
    dragOverGroup: string | null;
  }>({
    isDragging: false,
    draggedGroup: null,
    dragOverGroup: null
  });

  // Note: rebuildMixerFromInstruments function is defined below with proper 37-channel implementation

  // Drum kit configuration functions
  const handleDrummerClick = (drummer: any) => {
    console.log('🥁 Opening drum kit configuration for:', drummer.fullName || drummer.stageName);
    setCurrentDrummer(drummer);
    setShowDrumKitModal(true);
  };

  const handleDrumKitConfig = (config: any) => {
    console.log('🎛️ Saving drum kit configuration:', config);
    setDrumKitConfigs(prev => ({
      ...prev,
      [config.performerId || config.id]: config
    }));

    // Rebuild mixer to include the new drum kit channels
    setTimeout(() => {
      rebuildMixerFromInstruments();
    }, 100);
  };

  const isDrummer = (member: any) => {
    return member.selectedTalent &&
      (member.selectedTalent.toLowerCase().includes('drum') ||
        member.assignedRole?.toLowerCase().includes('drum'));
  };

  // REBUILD MIXER BY CYCLING THROUGH BAND MEMBERS FIRST - DATABASE DRIVEN
  const rebuildMixerFromInstruments = async () => {
    console.log('🎛️ REBUILDING MIXER - QUERYING DATABASE DIRECTLY');
    console.log('🎛️ Current band members count:', bandMembers.length);

    try {
      // Initialize mixer sections based on database mixer groups
      const newMixerChannels: any = {
        drums: [],
        percussion: [],
        bass: [],
        guitars: [],
        keyboards: [],
        brass: [],
        strings: [],
        woodwind: [],
        world: [],
        electronic: [],
        technical: [],
        vocals: []
      };

      let channelCounter = 1;

      // INSTRUMENT NAME TO ID MAPPING - Convert talent names to instrument IDs
      const getInstrumentIdFromTalentName = (talentName: string): number | null => {
        const instrumentMapping: Record<string, number> = {
          // Primary mappings based on database
          'Lead Vocalist': 144,
          'Bass Player': 6,       // Bass Guitar
          'Drummer': 10,          // Use Kick drum as primary - Drummer talent now available in dropdowns
          'Lead Guitarist': 21,   // Lead Guitar  
          'Keyboardist': 27,      // Synthesizer
          'Violinist': 43,        // Violin
          'Saxophonist': 36,      // Saxophone Alto
          'Singer-Songwriter': 144, // Lead Vocalist
          'Guitarist': 22,        // Acoustic Guitar
          'Pianist': 159,         // Piano - Electric
          'Vocalist': 144,        // Lead Vocalist
          'Background Vocalist': 145, // Background Vocalist 1
          'Backing Vocalist': 2,  // Backing Vocals
        };

        return instrumentMapping[talentName] || null;
      };

      // STEP 1: Process each band member with their selectedTalent - CONVERT NAMES TO IDS
      for (const member of bandMembers) {
        const memberName = member.stageName || member.fullName || 'Unknown';

        // Convert talent name to instrument ID
        const selectedTalent = member.selectedTalent || '';
        const instrumentId = selectedTalent ? getInstrumentIdFromTalentName(selectedTalent) : null;

        // Process all assigned talent (restriction removed)
        if (!instrumentId || member.membership === 'MANAGEMENT') {
          console.log(`⚠️ Skipping ${memberName}: no valid instrument ID found for talent "${selectedTalent}"`);
          continue;
        }

        console.log(`🎛️ Processing: ${memberName} with talent "${selectedTalent}" → instrument ID: ${instrumentId}`);

        // STEP 2: Get instrument details by ID from all_instruments table
        const response = await fetch(`/api/instruments/${instrumentId}`);
        if (!response.ok) {
          console.log(`❌ Could not find instrument with ID ${instrumentId} for ${memberName}`);
          continue;
        }

        const instrument = await response.json();
        const instrumentName = instrument.name;
        const mixerGroup = instrument.mixer_group || instrument.mixerGroup;

        console.log(`🎵 Found instrument: ${instrumentName} (${mixerGroup}) for ${memberName}`);

        // STEP 3: Determine mixer section from database mixer_group
        let mixerSection = 'vocals'; // Default fallback

        switch (mixerGroup) {
          case 'DRUMS':
            mixerSection = 'drums';
            break;
          case 'PERCUSSION':
          case 'ORCHESTRAL_PERCUSSION':
          case 'WORLD_PERCUSSION':
            mixerSection = 'percussion';
            break;
          case 'BASS':
            mixerSection = 'bass';
            break;
          case 'GUITARS':
            mixerSection = 'guitars';
            break;
          case 'KEYBOARDS':
          case 'KEYS':
            mixerSection = 'keyboards';
            break;
          case 'BRASS':
            mixerSection = 'brass';
            break;
          case 'STRINGS':
          case 'ORCHESTRAL_STRINGS':
            mixerSection = 'strings';
            break;
          case 'WOODWIND':
          case 'WOODWINDS':
            mixerSection = 'woodwind';
            break;
          case 'WORLD_INSTRUMENTS':
          case 'STEEL_PAN':
            mixerSection = 'world';
            break;
          case 'ELECTRONIC':
          case 'DJ':
            mixerSection = 'electronic';
            break;
          case 'TECHNICAL':
            mixerSection = 'technical';
            break;
          case 'VOCALS':
          case 'LEAD_VOCALS':
          case 'BACKGROUND_VOCALS':
          case 'CHOIR':
            mixerSection = 'vocals';
            break;
        }

        // STEP 4: Handle drum kit configuration for drummers
        if (mixerSection === 'drums') {
          const drummerConfig = drumKitConfigs[member.id];

          if (drummerConfig && drummerConfig.components) {
            // Use actual drum kit configuration from stage plot modal
            const enabledComponents = drummerConfig.components.filter((comp: any) => comp.isSelected && comp.requiresChannel);

            enabledComponents.forEach((component: any) => {
              newMixerChannels.drums.push({
                id: `drums-${channelCounter++}`,
                input: component.channelName || component.name,
                applicable: true,
                notes: component.notes || '',
                assignedTo: memberName,
                drumKitComponent: true
              });
            });

            console.log(`🥁 Created ${enabledComponents.length} drum channels for ${memberName} from stage plot`);
          } else {
            // Default drum channels if no stage plot configuration
            const defaultDrumChannels = ['Kick', 'Snare', 'Hi-Hat', 'Tom 1', 'Tom 2', 'Floor Tom', 'OH L', 'OH R'];

            defaultDrumChannels.forEach(channelName => {
              newMixerChannels.drums.push({
                id: `drums-${channelCounter++}`,
                input: channelName,
                applicable: true,
                notes: `${memberName} - ${instrumentName}`,
                assignedTo: memberName,
                drumKitComponent: true
              });
            });

            console.log(`🥁 Created ${defaultDrumChannels.length} default drum channels for ${memberName}`);
          }
        } else {
          // Single channel for other instruments
          newMixerChannels[mixerSection].push({
            id: `${mixerSection}-${channelCounter++}`,
            input: instrumentName,
            applicable: true,
            notes: '',
            assignedTo: memberName
          });

          console.log(`🎵 Created ${instrumentName} channel for ${memberName} in ${mixerSection} section`);
        }
      }

      // STEP 5: Add extra channels to reach 37 total
      const currentTotal = Object.values(newMixerChannels).reduce((sum: number, section: any) => sum + section.length, 0);
      const targetTotal = 37;
      const extraNeeded = targetTotal - currentTotal;

      console.log(`🎛️ Current channels: ${currentTotal}, Need ${extraNeeded} more to reach ${targetTotal}`);

      if (extraNeeded > 0) {
        const sectionsToExpand = ['percussion', 'bass', 'guitars', 'keyboards', 'brass', 'strings', 'woodwind', 'world', 'electronic', 'vocals'];
        const channelsPerSection = Math.floor(extraNeeded / sectionsToExpand.length);

        sectionsToExpand.forEach(section => {
          for (let i = 0; i < channelsPerSection; i++) {
            newMixerChannels[section].push({
              id: `${section}-extra-${channelCounter}`,
              input: `Channel ${channelCounter++}`,
              applicable: false,
              notes: '',
              assignedTo: 'auto-assign'
            });
          }
        });

        // Add remaining channels to vocals
        const remaining = extraNeeded - (channelsPerSection * sectionsToExpand.length);
        for (let i = 0; i < remaining; i++) {
          newMixerChannels.vocals.push({
            id: `vocals-extra-${channelCounter}`,
            input: `Channel ${channelCounter++}`,
            applicable: false,
            notes: '',
            assignedTo: 'auto-assign'
          });
        }
      }

      const finalTotal = Object.values(newMixerChannels).reduce((sum: number, section: any) => sum + section.length, 0);
      console.log(`🎛️ MIXER REBUILT: ${finalTotal} total channels created (database-driven, stage plot aware)`);

      setMixerChannels(newMixerChannels);

      // Set the correct ordering: DRUMS FIRST, then percussion, bass, guitars, keyboards, brass, strings, woodwind, world, electronic, vocals LAST
      const correctGroupOrder = ['drums', 'percussion', 'bass', 'guitars', 'keyboards', 'brass', 'strings', 'woodwind', 'world', 'electronic', 'technical', 'vocals'];
      setChannelGroupOrder(correctGroupOrder);
      console.log(`🎛️ Set correct group order: ${correctGroupOrder.join(' → ')}`);

    } catch (error) {
      console.error('🚨 Error querying database for instruments:', error);
      // Fallback: don't crash, just create empty mixer
      setMixerChannels({
        drums: [],
        percussion: [],
        bass: [],
        guitars: [],
        keyboards: [],
        brass: [],
        strings: [],
        woodwind: [],
        world: [],
        electronic: [],
        technical: [],
        vocals: []
      });
    }
  };

  // Add missing resetMixerToDefaults function
  const resetMixerToDefaults = () => {
    console.log('🎛️ RESETTING MIXER TO DEFAULTS');
    rebuildMixerFromInstruments();
  };

  // Mixer channel management functions
  const addChannelToSection = (section: keyof typeof mixerChannels) => {
    const sectionStr = String(section);
    const newChannelId = `${sectionStr}-${Date.now()}`;
    const newChannel = {
      id: newChannelId,
      input: `New ${sectionStr.charAt(0).toUpperCase() + sectionStr.slice(1)} Input`,
      applicable: false,
      notes: "",
      assignedTo: "auto-assign"  // Default to auto-assign
    };

    setMixerChannels((prev: typeof mixerChannels) => ({
      ...prev,
      [section]: [...prev[section], newChannel]
    }));

    console.log(`🎚️ Added new channel to ${sectionStr} section with auto-assign default`);
  };

  const updateChannelAssignment = (section: keyof typeof mixerChannels, channelId: string, assignedTo: string) => {
    setMixerChannels((prev: typeof mixerChannels) => ({
      ...prev,
      [section]: prev[section].map((channel: any) =>
        channel.id === channelId ? { ...channel, assignedTo } : channel
      )
    }));

    const sectionStr = String(section);
    console.log(`🎚️ Assigned channel ${channelId} to ${assignedTo}`);
  };

  const removeChannelFromSection = (section: keyof typeof mixerChannels, channelId: string) => {
    setMixerChannels((prev: typeof mixerChannels) => ({
      ...prev,
      [section]: prev[section].filter((channel: any) => channel.id !== channelId)
    }));

    console.log(`🎚️ Removed channel ${channelId} from ${section} section`);
  };



  const updateChannelInput = (section: keyof typeof mixerChannels, channelId: string, newInput: string) => {
    setMixerChannels((prev: typeof mixerChannels) => ({
      ...prev,
      [section]: prev[section].map((channel: any) =>
        channel.id === channelId ? { ...channel, input: newInput } : channel
      )
    }));
  };

  const updateChannelApplicable = (section: keyof typeof mixerChannels, channelId: string, applicable: boolean) => {
    setMixerChannels((prev: typeof mixerChannels) => ({
      ...prev,
      [section]: prev[section].map((channel: any) =>
        channel.id === channelId ? { ...channel, applicable } : channel
      )
    }));
  };

  const updateChannelNotes = (section: keyof typeof mixerChannels, channelId: string, notes: string) => {
    setMixerChannels((prev: typeof mixerChannels) => ({
      ...prev,
      [section]: prev[section].map((channel: any) =>
        channel.id === channelId ? { ...channel, notes } : channel
      )
    }));
  };

  // Calculate channel numbers dynamically - sequential numbering based on current group order
  const getChannelNumber = (section: keyof typeof mixerChannels, index: number): number => {
    let channelNumber = 1;

    // Use current group order for numbering
    for (const sectionName of channelGroupOrder) {
      if (sectionName === section) {
        return channelNumber + index;
      }
      // Only count sections that actually exist in mixerChannels
      if (mixerChannels[sectionName as keyof typeof mixerChannels]) {
        channelNumber += mixerChannels[sectionName as keyof typeof mixerChannels].length;
      }
    }

    return channelNumber;
  };

  // Drag and drop handlers for channel groups
  const handleGroupDragStart = (e: React.DragEvent, groupName: string) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', groupName);
    setGroupDragState({
      isDragging: true,
      draggedGroup: groupName,
      dragOverGroup: null
    });
    console.log(`🎚️ DRAG START: Group "${groupName}"`);
  };

  const handleGroupDragOver = (e: React.DragEvent, targetGroup: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setGroupDragState(prev => ({
      ...prev,
      dragOverGroup: targetGroup
    }));
  };

  const handleGroupDragLeave = (e: React.DragEvent) => {
    // Only clear if we're actually leaving the drop zone
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setGroupDragState(prev => ({
        ...prev,
        dragOverGroup: null
      }));
    }
  };

  const handleGroupDrop = (e: React.DragEvent, targetGroup: string) => {
    e.preventDefault();
    const draggedGroup = e.dataTransfer.getData('text/plain');

    if (draggedGroup && draggedGroup !== targetGroup) {
      // Reorder the channel groups
      const newOrder = [...channelGroupOrder];
      const draggedIndex = newOrder.indexOf(draggedGroup);
      const targetIndex = newOrder.indexOf(targetGroup);

      // Remove dragged group and insert at new position
      newOrder.splice(draggedIndex, 1);
      newOrder.splice(targetIndex, 0, draggedGroup);

      setChannelGroupOrder(newOrder);
      console.log(`🎚️ REORDER: Moved "${draggedGroup}" to position of "${targetGroup}"`);
      console.log(`🎚️ NEW ORDER:`, newOrder);
    }

    setGroupDragState({
      isDragging: false,
      draggedGroup: null,
      dragOverGroup: null
    });
  };

  const handleGroupDragEnd = () => {
    setGroupDragState({
      isDragging: false,
      draggedGroup: null,
      dragOverGroup: null
    });
  };

  // Up/down arrow functions for channel group reordering (desktop and mobile)
  const moveGroupUp = (groupName: string) => {
    const currentIndex = channelGroupOrder.indexOf(groupName);
    if (currentIndex > 0) {
      const newOrder = [...channelGroupOrder];
      // Swap with previous group
      [newOrder[currentIndex - 1], newOrder[currentIndex]] = [newOrder[currentIndex], newOrder[currentIndex - 1]];
      setChannelGroupOrder(newOrder);
      console.log(`🎚️ MOVE UP: Moved "${groupName}" up in order`);
      console.log(`🎚️ NEW ORDER:`, newOrder);
    }
  };

  const moveGroupDown = (groupName: string) => {
    const currentIndex = channelGroupOrder.indexOf(groupName);
    if (currentIndex < channelGroupOrder.length - 1) {
      const newOrder = [...channelGroupOrder];
      // Swap with next group
      [newOrder[currentIndex], newOrder[currentIndex + 1]] = [newOrder[currentIndex + 1], newOrder[currentIndex]];
      setChannelGroupOrder(newOrder);
      console.log(`🎚️ MOVE DOWN: Moved "${groupName}" down in order`);
      console.log(`🎚️ NEW ORDER:`, newOrder);
    }
  };

  // Add new section to channel group order when dynamically created
  const addSectionToOrder = (sectionName: string) => {
    if (!channelGroupOrder.includes(sectionName)) {
      setChannelGroupOrder(prev => [...prev, sectionName]);
      console.log(`🎚️ ADDED SECTION: "${sectionName}" to group order`);
    }
  };

  // Scroll to top function
  const scrollToTop = () => {
    if (containerRef.current) {
      containerRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    } else {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
    }
  };

  // Enhanced tab change with scroll
  const handleTabChange = (newTab: typeof TECHNICAL_RIDER_CONFIGS.TABS.OVERVIEW) => {
    setActiveTab(newTab);
    scrollToTop();
  };

  // Simplified helper functions using musician data directly

  const addProfileRoles = (options: any[], profile: any, color: string, icon: string, tier: number, excludeRole?: string) => {
    // Add primary role
    if (profile.primaryRole && profile.primaryRole !== excludeRole) {
      options.push({
        value: profile.primaryRole,
        label: profile.primaryRole,
        color: color,
        icon: icon,
        tier: tier
      });
    }

    // Add skills converted to player names
    if (profile.skillsAndInstruments && Array.isArray(profile.skillsAndInstruments)) {
      profile.skillsAndInstruments.forEach((skill: string) => {
        const playerRole = getRoleFromInstrument(skill);
        if (playerRole !== 'Performer' && playerRole !== excludeRole && !options.find(opt => opt.value === playerRole)) {
          options.push({
            value: playerRole,
            label: playerRole,
            color: color,
            icon: '🎯',
            tier: tier
          });
        }
      });
    }

    // Add performance roles
    if (profile.performanceRoles && Array.isArray(profile.performanceRoles)) {
      profile.performanceRoles.forEach((role: string) => {
        if (role !== excludeRole && !options.find(opt => opt.value === role)) {
          options.push({
            value: role,
            label: role,
            color: color,
            icon: icon,
            tier: tier
          });
        }
      });
    }
  };

  const addProfessionalRoles = (options: any[], profile: any, color: string, icon: string, tier: number, excludeRole?: string) => {
    // Add primary profession
    if (profile.primaryRole && profile.primaryRole !== excludeRole) {
      options.push({
        value: profile.primaryRole,
        label: profile.primaryRole,
        color: color,
        icon: icon,
        tier: tier
      });
    }

    // Add service capabilities
    if (profile.serviceCapabilities && Array.isArray(profile.serviceCapabilities)) {
      profile.serviceCapabilities.forEach((service: string) => {
        if (service !== excludeRole && !options.find(opt => opt.value === service)) {
          options.push({
            value: service,
            label: service,
            color: color,
            icon: '🔧',
            tier: tier
          });
        }
      });
    }

    // Add professional roles
    if (profile.professionalRoles && Array.isArray(profile.professionalRoles)) {
      profile.professionalRoles.forEach((role: string) => {
        if (role !== excludeRole && !options.find(opt => opt.value === role)) {
          options.push({
            value: role,
            label: role,
            color: color,
            icon: icon,
            tier: tier
          });
        }
      });
    }
  };

  // Generic talent options by member type
  const GENERIC_ARTIST_MUSICIAN_TALENTS = [
    'Vocalist', 'Lead Vocalist', 'Backing Vocalist',
    'Lead Guitar', 'Rhythm Guitar', 'Electric Guitar', 'Acoustic Guitar',
    'Bass Guitar', 'Electric Bass', 'Upright Bass',
    'Drummer', 'Percussion', 'Congas', 'Bongos',
    'Pianist', 'Keyboardist', 'Synthesizer', 'Organ',
    'Violinist', 'Cellist', 'Violist', 'Double Bass',
    'Saxophonist', 'Alto Sax', 'Tenor Sax', 'Baritone Sax',
    'Trumpeter', 'Trombonist', 'French Horn', 'Tuba',
    'Flutist', 'Clarinetist', 'Oboist', 'Bassoonist',
    'Singer-Songwriter', 'Multi-Instrumentalist', 'Session Musician'
  ];

  const GENERIC_PROFESSIONAL_ROLES = [
    'Sound Engineer', 'FOH Engineer', 'Monitor Engineer', 'System Engineer',
    'Lighting Technician', 'Lighting Designer', 'Lighting Operator',
    'Stage Manager', 'Production Manager', 'Tour Manager',
    'Guitar Tech', 'Bass Tech', 'Drum Tech', 'Keyboard Tech',
    'Backline Tech', 'Instrument Tech', 'Audio Tech',
    'Video Engineer', 'Camera Operator', 'Video Director',
    'Security', 'Stage Security', 'Venue Security',
    'Roadie', 'Crew Chief', 'Load-In Supervisor',
    'Merchandiser', 'Vendor Coordinator', 'Catering Coordinator'
  ];

  // Database-driven talent dropdown options with generic additions
  const buildTalentDropdownOptions = (memberData: any): Array<{ value: string, label: string, color: string, icon: string, tier: number, type?: string }> => {
    const options: Array<{ value: string, label: string, color: string, icon: string, tier: number, type?: string }> = [];
    const existingTalents = new Set<string>();

    // Add primary talent with star badge
    if (memberData.primaryTalent) {
      const talent = memberData.primaryTalent;
      options.push({
        value: talent,
        label: `${talent} ⭐`,
        color: 'blue',
        icon: '⭐',
        tier: 1,
        type: 'Primary'
      });
      existingTalents.add(talent);
    }

    // Add secondary talents with outline badges
    if (memberData.secondaryTalents && Array.isArray(memberData.secondaryTalents) && memberData.secondaryTalents.length > 0) {
      memberData.secondaryTalents.forEach((talent: string) => {
        if (talent && !existingTalents.has(talent)) {
          options.push({
            value: talent,
            label: talent,
            color: 'gray',
            icon: '🎯',
            tier: 2,
            type: 'Secondary'
          });
          existingTalents.add(talent);
        }
      });
    }

    // Add divider if there are existing talents
    if (options.length > 0) {
      options.push({
        value: '__divider__',
        label: '──────────────',
        color: 'gray',
        icon: '',
        tier: 3,
        type: 'Divider'
      });
    }

    // Add generic talents based on member type
    const isProfessional = memberData.type === 'Professional' ||
      memberData.talentType?.includes('Professional') ||
      memberData.roleId === 7 || memberData.roleId === 8;

    const genericTalents = isProfessional ? GENERIC_PROFESSIONAL_ROLES : GENERIC_ARTIST_MUSICIAN_TALENTS;

    genericTalents.forEach((talent: string) => {
      if (!existingTalents.has(talent)) {
        options.push({
          value: talent,
          label: talent,
          color: isProfessional ? 'purple' : 'green',
          icon: isProfessional ? '🔧' : '🎵',
          tier: 4,
          type: 'Generic'
        });
      }
    });

    // If no options at all, add default
    if (options.length === 0 || (options.length === 1 && options[0].type === 'Divider')) {
      options.push({
        value: 'No talent assigned',
        label: 'No talent assigned',
        color: 'gray',
        icon: '❓',
        tier: 99,
        type: 'Unassigned'
      });
    }
    return options;
  };

  // ENHANCED: Sync stage legend talent/skills when band members change
  useEffect(() => {
    setStageLegend(prev => prev.map(legendItem => {
      // Find matching band member by assignedTo name (multiple matching patterns)
      const matchingMember = bandMembers.find(member => {
        const memberName = member.fullName;
        const memberStage = member.stageName;
        const assignedTo = legendItem.assignedTo;

        return assignedTo === memberName ||
          assignedTo === memberStage ||
          (memberName && assignedTo?.includes(memberName)) ||
          (memberStage && assignedTo?.includes(memberStage)) ||
          (memberName && memberName.includes(assignedTo || '')) ||
          (memberStage && memberStage.includes(assignedTo || ''));
      });

      if (matchingMember) {
        // PRIORITY: Use selectedTalent (what user actually selected), convert to player name if needed
        let updatedRole = matchingMember.selectedTalent;

        // Convert instrument names to player names for consistency
        updatedRole = convertInstrumentToPlayer(updatedRole || '');



        if (legendItem.role !== updatedRole) {
          console.log(`🎯 STAGE LEGEND SYNC: Updating ${legendItem.assignedTo} role from "${legendItem.role}" to "${updatedRole}"`);
        }

        return {
          ...legendItem,
          role: updatedRole
        };
      }

      return legendItem;
    }));
    console.log('DEBUG: Syncing stage legend talent/skills with band members');
  }, [bandMembers, JSON.stringify(bandMembers.map(member => member.selectedTalent))]);



  // Convert instrument names to player names - ENHANCED for comprehensive instrument coverage
  const convertInstrumentToPlayer = (instrument: string): string => {
    const conversions: { [key: string]: string } = {
      'Guitar': 'Guitarist',
      'Bass': 'Bass Player',
      'Piano': 'Pianist',
      'Keyboard': 'Keyboardist',
      'Drums': 'Drummer',
      'Percussion': 'Percussionist',
      'Vocals': 'Vocalist',
      'Violin': 'Violinist',
      'Saxophone': 'Saxophonist',
      'Trumpet': 'Trumpeter',
      'Flute': 'Flutist',
      'Cello': 'Cellist',
      'Electric Guitar': 'Electric Guitarist',
      'Acoustic Guitar': 'Acoustic Guitarist',
      'Electric Bass': 'Bass Player',
      'Congas': 'Conga Player',
      'Trombone': 'Trombonist',
      'Clarinet': 'Clarinetist',
      'Oboe': 'Oboist',
      'French Horn': 'French Horn Player',
      'Tuba': 'Tuba Player',
      'Harmonica': 'Harmonica Player',
      'Mandolin': 'Mandolinist',
      'Banjo': 'Banjo Player',
      'Ukulele': 'Ukulele Player',
      'Harp': 'Harpist',
      'Organ': 'Organist',
      'Synthesizer': 'Keyboardist',
      'Electric Piano': 'Pianist',
      'Bass Guitar': 'Bass Player'
    };

    return conversions[instrument] || instrument;
  };

  // Initialize band members from assigned musicians and admins
  useEffect(() => {
    const initializeBandMembers = () => {
      console.log('🔄 TECHNICAL RIDER: Initializing band members');
      console.log('🔄 Assigned musicians (props) count:', Array.isArray(assignedMusicians) ? assignedMusicians.length : 0);
      console.log('🔄 Final assigned musicians (API) count:', Array.isArray(finalAssignedMusicians) ? finalAssignedMusicians.length : 0);
      console.log('🔄 Will use:', assignedMusicians && assignedMusicians.length > 0 ? 'assignedMusicians (props)' : 'finalAssignedMusicians (API)');

      const members = [];

      // Add assigned musicians - Use assignedMusicians props (same as Artist Lineup) for consistency
      const musicianDataSource = assignedMusicians && assignedMusicians.length > 0 ? assignedMusicians : finalAssignedMusicians;
      console.log('🔄 Using musician data source:', Array.isArray(musicianDataSource) && musicianDataSource.length > 0 ? 'assignedMusicians (props)' : 'finalAssignedMusicians (API)');

      if (musicianDataSource && Array.isArray(musicianDataSource)) {
        musicianDataSource.forEach((musician, index) => {
          // Determine role badge from musician data - use server-provided talentType
          const roleBadge = musician.talentType;

          // Determine membership from role type (artists/musicians = BAND, professionals = TEAM)
          // Check if user is a professional based on multiple indicators
          const isProfessional = musician.roleId === 7 || musician.roleId === 8 ||
            musician.talentType?.includes('Professional') ||
            musician.type === 'Professional' ||
            musician.assignedRole === 'Audio Engineer' ||
            musician.assignedRole === 'Legal Counsel' ||
            musician.assignedRole?.includes('Engineer') ||
            musician.assignedRole?.includes('Counsel') ||
            musician.assignedRole?.includes('Manager') ||
            (musician.professionalProfile && Object.keys(musician.professionalProfile).length > 0) ||
            musician.role === 'professional';

          const membership = isProfessional ? TECHNICAL_RIDER_CONFIGS.MEMBERSHIP_TYPES.TEAM : TECHNICAL_RIDER_CONFIGS.MEMBERSHIP_TYPES.BAND;
          // Get actual role name from database talents - with debugging for Phoenix
          const primaryRole = musician.primaryTalent || null;



          const memberData = {
            id: `musician-${musician.userId || index}`,
            membership: membership,
            role: primaryRole, // Use determined primary role
            fullName: musician.name || musician.fullName || 'Unknown Musician',
            stageName: musician.stageName || '',
            userId: musician.userId,
            roleId: musician.roleId, // Store roleId for database role name lookup
            isManual: false,
            primaryRole: primaryRole, // Store primary role
            assignedRole: musician.assignedRole,
            selectedRoles: musician.selectedRoles || [],
            isMainBookedTalent: musician.isMainBookedTalent || musician.isPrimary || false,
            assignmentRole: musician.type || (musician.isMainBookedTalent ? 'Main Booked Talent' : (musician.assignmentRole || 'Supporting Musician')),
            talentType: musician.talentType || musician.type || 'Artist',
            type: isProfessional ? 'Professional' : (musician.type || 'Artist'), // Add type property
            selectedTalent: primaryRole, // Only use database-derived role, no fallbacks

            roleBadge: roleBadge, // Badge based on talent type
            // Profile data for dropdown options
            artistProfile: musician.artistProfile,
            musicianProfile: musician.musicianProfile,
            professionalProfile: musician.professionalProfile,
            // Build dropdown options based on database talents
            primaryTalent: musician.primaryTalent,
            secondaryTalents: musician.secondaryTalents,
            hasPrimaryTalent: !!musician.primaryTalent,
            hasSecondaryTalents: !!(musician.secondaryTalents && musician.secondaryTalents.length > 0)
          };


          members.push(memberData);
        });
      } else {
        console.log('🔄 No assigned musicians found or data is not an array');
      }

      console.log(`🔄 Total members added from API: ${members.length}`);

      // Add default management team members if no admins provided
      if (!finalAssignedMusicians || !Array.isArray(finalAssignedMusicians) || !finalAssignedMusicians.some((m: any) => m.role === 'admin')) {
        members.push(
          {
            id: 'mgmt-ceo',
            membership: TECHNICAL_RIDER_CONFIGS.MEMBERSHIP_TYPES.MANAGEMENT,
            role: 'CEO',
            fullName: 'Mr Lindsay George',
            stageName: '',
            isManual: false,
            isMainBookedTalent: false,
            type: 'Management',
            selectedTalent: 'CEO',
            roleBadge: TECHNICAL_RIDER_CONFIGS.MEMBERSHIP_TYPES.MANAGEMENT,
            talentType: TECHNICAL_RIDER_CONFIGS.MEMBERSHIP_TYPES.MANAGEMENT,
            dropdownOptions: []
          },
          {
            id: 'mgmt-cfo',
            membership: TECHNICAL_RIDER_CONFIGS.MEMBERSHIP_TYPES.MANAGEMENT,
            role: 'CFO',
            fullName: 'Ms Joyette Pascal',
            stageName: '',
            isManual: false,
            isMainBookedTalent: false,
            type: 'Management',
            selectedTalent: 'CFO',
            roleBadge: TECHNICAL_RIDER_CONFIGS.MEMBERSHIP_TYPES.MANAGEMENT,
            talentType: TECHNICAL_RIDER_CONFIGS.MEMBERSHIP_TYPES.MANAGEMENT,
            dropdownOptions: []
          }
        );
      }

      // Sort members by normal order (no Main Booked Talent restriction)
      const sortedMembers = members.sort((a, b) => {

        // Then by role badge priority (from assignment source) - ONLY AUTHENTIC ROLES
        const typeOrder: { [key: string]: number } = {
          'Managed Artist': 1,
          'Managed Musician': 2,
          'Managed Professional': 3,
          'Professional': 4,
          'TEAM': 5, // Team members 
          'MANAGEMENT': 999, // Always last
          'Unknown': 1000 // Fallback for items without proper role data
        };

        // Use role badge (from assignment source) for sorting, with membership as fallback - NO HARDCODED ROLES
        const aType = (a as any).roleBadge || (a as any).talentType ||
          (a.membership === 'MANAGEMENT' ? 'MANAGEMENT' :
            a.membership === 'TEAM' ? 'TEAM' : 'Unknown');
        const bType = (b as any).roleBadge || (b as any).talentType ||
          (b.membership === 'MANAGEMENT' ? 'MANAGEMENT' :
            b.membership === 'TEAM' ? 'TEAM' : 'Unknown');

        const aOrder = typeOrder[aType] || 7;
        const bOrder = typeOrder[bType] || 7;

        console.log('Sorting:', a.fullName, 'badge:', (a as any).roleBadge, 'order:', aOrder, 'vs', b.fullName, 'badge:', (b as any).roleBadge, 'order:', bOrder);

        return aOrder - bOrder;
      });

      console.log(`🔄 FINAL: Setting ${sortedMembers.length} band members`);

      setBandMembers(sortedMembers);

      // Rebuild mixer channels from band members after they are set
      if (sortedMembers.length > 0) {
        console.log('🎛️ REBUILDING MIXER for', sortedMembers.length, 'band members on page load');
        setTimeout(() => {
          rebuildMixerFromInstruments();
        }, 500);
      }
    };

    initializeBandMembers();
  }, [finalAssignedMusicians, talentLoading]);

  // Note: Mixer rebuilds are handled in the initial band member loading above
  // No need for additional useEffect to rebuild on band member changes

  const getRoleFromInstrument = (instrument: string): string => {
    const instrumentLower = instrument.toLowerCase();
    if (instrumentLower.includes('drum')) return 'Drummer';
    if (instrumentLower.includes('bass')) return 'Bass Player';
    if (instrumentLower.includes('guitar')) return 'Guitarist';
    if (instrumentLower.includes('keyboard') || instrumentLower.includes('piano')) return 'Keyboardist';
    if (instrumentLower.includes('vocal') || instrumentLower.includes('singer') || instrumentLower.includes('voice')) return 'Vocalist';
    if (instrumentLower.includes('sax')) return 'Saxophonist';
    if (instrumentLower.includes('trumpet')) return 'Trumpeter';
    if (instrumentLower.includes('trombone')) return 'Trombonist';
    if (instrumentLower.includes('violin')) return 'Violinist';
    if (instrumentLower.includes('percussion')) return 'Percussionist';
    // Fallback for instrument mapping (not profile data)
    return 'Performer';
  };

  const addBandMember = (memberType: 'BAND' | 'TEAM' | 'MANAGEMENT' = 'BAND') => {
    const newMember = {
      id: `${memberType.toLowerCase()}-${Date.now()}`,
      membership: memberType,
      role: memberType === 'BAND' ? 'Performer' : memberType === 'TEAM' ? 'Team Member' : 'Manager',
      fullName: '',
      stageName: '',
      isManual: true,
      dropdownOptions: []
    };

    setBandMembers(prev => {
      if (memberType === 'BAND') {
        // Insert BAND members above first TEAM or MANAGEMENT row (keep BAND entries together)
        const firstNonBandIndex = prev.findIndex(member => member.membership !== 'BAND');
        if (firstNonBandIndex === -1) {
          // No team/management members yet, just append
          return [...prev, newMember];
        } else {
          // Insert before first non-band member
          const newArray = [...prev];
          newArray.splice(firstNonBandIndex, 0, newMember);
          return newArray;
        }
      } else if (memberType === 'TEAM') {
        // Insert TEAM members above first MANAGEMENT row (keep TEAM entries together)
        const firstManagementIndex = prev.findIndex(member => member.membership === 'MANAGEMENT');
        if (firstManagementIndex === -1) {
          // No management members yet, just append
          return [...prev, newMember];
        } else {
          // Insert before first management member
          const newArray = [...prev];
          newArray.splice(firstManagementIndex, 0, newMember);
          return newArray;
        }
      } else {
        // MANAGEMENT members go at the end
        return [...prev, newMember];
      }
    });

    // Scroll to top after adding member
    scrollToTop();
  };

  const updateBandMember = (id: string, updates: Partial<typeof bandMembers[0]>) => {
    setBandMembers(prev =>
      prev.map(member =>
        member.id === id ? { ...member, ...updates } : member
      )
    );
  };

  const removeBandMember = (id: string) => {
    // Prevent deletion of main booked talent
    const memberToRemove = bandMembers.find(member => member.id === id);
    if (memberToRemove?.isMainBookedTalent) {
      toast(TOAST_CONFIGS.ERROR.CANNOT_REMOVE);
      return;
    }

    setBandMembers(prev => prev.filter(member => member.id !== id));

    // Scroll to top after removing member
    scrollToTop();
  };

  // Helper function to convert skills to player names
  const convertSkillToPlayerName = (skill: string): string => {
    const skillLower = skill.toLowerCase();
    if (skillLower.includes('guitar') || skillLower.includes('guitarist')) return 'Guitarist';
    if (skillLower.includes('piano') || skillLower.includes('pianist')) return 'Pianist';
    if (skillLower.includes('keyboard') || skillLower.includes('keyboardist')) return 'Keyboardist';
    if (skillLower.includes('bass') || skillLower.includes('bass player')) return 'Bass Player';
    if (skillLower.includes('drum') || skillLower.includes('drummer')) return 'Drummer';
    if (skillLower.includes('vocal') || skillLower.includes('singer') || skillLower.includes('vocalist')) return 'Vocalist';
    if (skillLower.includes('saxophone') || skillLower.includes('sax')) return 'Saxophonist';
    if (skillLower.includes('trumpet')) return 'Trumpet Player';
    if (skillLower.includes('violin')) return 'Violinist';
    if (skillLower.includes('percussion')) return 'Percussionist';
    return `${skill} Player`;
  };



  // Smart dropdown system: database talents first, then filtered generic options
  const getRoleOptions = (member: typeof bandMembers[0]) => {
    console.log('🎯 DEBUG: Member data for dropdown:', {
      id: member.id,
      fullName: member.fullName,
      primaryRole: member.primaryRole,
      profileRoles: member.profileRoles,
      membership: member.membership,
      dropdownOptions: member.dropdownOptions
    });

    // Use pre-built dropdown options if available (from assignment source tracking)
    if (member.dropdownOptions && Array.isArray(member.dropdownOptions)) {
      console.log('🎯 Using pre-built dropdown options');
      return member.dropdownOptions.map(option => ({
        role: option.label,
        type: getTierType(option.tier),
        color: getTierColor(option.color),
        isRequested: option.tier <= 7,
        tier: option.tier,
        icon: option.icon
      }));
    }

    const roleList: Array<{ role: string; type: string; isRequested: boolean; color: string; tier?: number; icon?: string }> = [];
    const usedRoles = new Set<string>();

    // 1. Primary talent first (database)
    if (member.primaryRole && member.primaryRole.trim()) {
      roleList.push({
        role: member.primaryRole,
        type: 'primary',
        isRequested: true,
        color: 'text-blue-600',
        tier: 1,
        icon: '⭐'
      });
      usedRoles.add(member.primaryRole);
    }

    // 2. Additional user talents/skills second (database)
    if (member.profileRoles && Array.isArray(member.profileRoles)) {
      member.profileRoles.forEach(role => {
        if (role && role.trim() && !usedRoles.has(role)) {
          roleList.push({
            role,
            type: 'additional',
            isRequested: true,
            color: 'text-green-600',
            tier: 2,
            icon: '🎵'
          });
          usedRoles.add(role);
        }
      });
    }

    // 3. Generic filtered lists third (contextual by user type)
    let genericOptions = [];

    if (member.membership === "BAND") {
      // For artists/musicians: performance talents
      genericOptions = [
        "Lead Vocalist", "Background Vocalist", "Pop Vocalist", "Jazz Vocalist",
        "Guitarist", "Lead Guitarist", "Rhythm Guitarist", "Bass Player",
        "Drummer", "Percussionist", "Keyboardist", "Pianist",
        "Saxophonist", "Trumpeter", "Trombonist", "Violinist",
        "Singer-Songwriter", "Performer", "Entertainer"
      ];
    } else {
      // For professionals: business/technical roles
      genericOptions = [
        "Sound Engineer", "Lighting Technician", "Stage Manager",
        "Tour Manager", "Production Manager", "Security", "Bodyguard",
        "Photographer", "Videographer", "DJ", "Props Manager",
        "Merch Manager", "Marketing Manager", "Business Administrator",
        "Artist Manager", "Booking Agent", "Publicist"
      ];
    }

    // Add generic options that aren't already used
    genericOptions.forEach(role => {
      if (!usedRoles.has(role)) {
        roleList.push({
          role,
          type: 'generic',
          isRequested: false,
          color: 'text-gray-600',
          tier: 8,
          icon: '📝'
        });
      }
    });

    console.log('🎯 Final dropdown options for', member.fullName, ':', roleList.map(r => r.role));
    return roleList;
  };

  // Helper functions for tier mapping
  const getTierType = (tier: number) => {
    switch (tier) {
      case 1: return 'assignment-source';
      case 2: return 'managed-artist';
      case 3: return 'artist';
      case 4: return 'managed-musician';
      case 5: return 'musician';
      case 6: return 'managed-professional';
      case 7: return 'professional';
      default: return 'generic';
    }
  };

  const getTierColor = (color: string) => {
    switch (color) {
      case 'blue': return 'text-blue-600';
      case 'green': return 'text-green-600';
      case 'purple': return 'text-purple-600';
      case 'orange': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const generateRequirements = () => {
    // Prevent popup spawning by removing automatic generation
    toast(TOAST_CONFIGS.INFO.MANUAL_SETUP);
    scrollToTop();
  };

  // FIXED: Generate consolidated requirements per musician (only one vocal mic per user)
  const generateMusicianRequirements = (musician: any, index: number): TechnicalRequirement[] => {
    const reqs: TechnicalRequirement[] = [];
    const musicianName = musician.fullName || musician.name || `Musician ${index + 1}`;
    const instruments = musician.skillsAndInstruments || musician.instruments || musician.profileRoles || [];

    // Track what we've already added to avoid duplicates
    let hasVocalMic = false;
    let hasDrumKit = false;
    let hasGuitar = false;

    instruments.forEach((instrument: string) => {
      const instrumentLower = instrument.toLowerCase();

      // DRUMS - only add once per musician
      if (instrumentLower.includes('drum') && !hasDrumKit) {
        reqs.push({
          id: `drum-${musician.userId || index}-1`,
          category: 'sound',
          item: 'Drum Microphone Package',
          description: 'Complete drum mic setup with kick, snare, hi-hat, and overhead mics',
          quantity: 1,
          priority: 'critical',
          providedBy: 'venue',
          assignedTo: musicianName,
          status: 'pending',
          specifications: 'Kick: AKG D112 or similar, Snare: SM57, Overheads: Condenser pair'
        });
        reqs.push({
          id: `drum-${musician.userId || index}-2`,
          category: 'backline',
          item: 'Drum Kit',
          description: 'Full acoustic drum kit with hardware',
          quantity: 1,
          priority: 'critical',
          providedBy: 'artist',
          assignedTo: musicianName,
          status: 'pending'
        });
        hasDrumKit = true;
      }

      // VOCALS - FIXED: Only add one vocal mic per musician regardless of vocal skills count
      if ((instrumentLower.includes('vocal') || instrumentLower.includes('singer')) && !hasVocalMic) {
        reqs.push({
          id: `vocal-${musician.userId || index}-1`,
          category: 'sound',
          item: 'Vocal Microphone',
          description: 'Professional dynamic vocal microphone',
          quantity: 1,
          priority: 'critical',
          providedBy: 'venue',
          assignedTo: musicianName,
          status: 'pending',
          specifications: 'Shure SM58 or equivalent'
        });
        reqs.push({
          id: `vocal-${musician.userId || index}-2`,
          category: 'sound',
          item: 'Floor Monitor',
          description: 'Stage monitor wedge for vocal monitoring',
          quantity: 1,
          priority: 'high',
          providedBy: 'venue',
          assignedTo: musicianName,
          status: 'pending'
        });
        hasVocalMic = true;
      }

      // GUITAR - only add once per musician  
      if (instrumentLower.includes('guitar') && !hasGuitar) {
        reqs.push({
          id: `guitar-${musician.userId || index}-1`,
          category: 'sound',
          item: 'Guitar Amplifier',
          description: 'Guitar amplifier or DI box for electric guitar',
          quantity: 1,
          priority: 'critical',
          providedBy: 'artist',
          assignedTo: musicianName,
          status: 'pending',
          specifications: 'Tube amp or high-quality modeling amp'
        });
        hasGuitar = true;
      }
    });

    return reqs;
  };

  // Legacy function for backward compatibility
  const generateInstrumentRequirements = (instrument: string, musicianName: string, index: number): TechnicalRequirement[] => {
    const reqs: TechnicalRequirement[] = [];
    const instrumentLower = instrument.toLowerCase();

    if (instrumentLower.includes('drum')) {
      reqs.push({
        id: `drum-${index}-1`,
        category: 'sound',
        item: 'Drum Microphone Package',
        description: 'Complete drum mic setup with kick, snare, hi-hat, and overhead mics',
        quantity: 1,
        priority: 'critical',
        providedBy: 'venue',
        assignedTo: musicianName,
        status: 'pending',
        specifications: 'Kick: AKG D112 or similar, Snare: SM57, Overheads: Condenser pair'
      });
      reqs.push({
        id: `drum-${index}-2`,
        category: 'backline',
        item: 'Drum Kit',
        description: 'Full acoustic drum kit with hardware',
        quantity: 1,
        priority: 'critical',
        providedBy: 'artist',
        assignedTo: musicianName,
        status: 'pending'
      });
    }

    if (instrumentLower.includes('vocal')) {
      reqs.push({
        id: `vocal-${index}-1`,
        category: 'sound',
        item: 'Vocal Microphone',
        description: 'Professional dynamic vocal microphone',
        quantity: 1,
        priority: 'critical',
        providedBy: 'venue',
        assignedTo: musicianName,
        status: 'pending',
        specifications: 'Shure SM58 or equivalent'
      });
      reqs.push({
        id: `vocal-${index}-2`,
        category: 'sound',
        item: 'Floor Monitor',
        description: 'Stage monitor wedge for vocal monitoring',
        quantity: 1,
        priority: 'high',
        providedBy: 'venue',
        assignedTo: musicianName,
        status: 'pending'
      });
    }

    if (instrumentLower.includes('guitar')) {
      reqs.push({
        id: `guitar-${index}-1`,
        category: 'sound',
        item: 'Guitar Amplifier',
        description: 'Guitar amplifier or DI box for electric guitar',
        quantity: 1,
        priority: 'critical',
        providedBy: 'artist',
        assignedTo: musicianName,
        status: 'pending',
        specifications: 'Tube amp or high-quality modeling amp'
      });
    }

    return reqs;
  };

  const generateVenueRequirements = (eventDetails: any): TechnicalRequirement[] => {
    return [
      {
        id: 'venue-power-1',
        category: 'power',
        item: 'Main Power Distribution',
        description: 'Sufficient power distribution for full production',
        quantity: 1,
        priority: 'critical',
        providedBy: 'venue',
        status: 'pending',
        specifications: '220V service with ground fault protection'
      },
      {
        id: 'venue-lighting-1',
        category: 'lighting',
        item: 'General Stage Lighting',
        description: 'Basic stage wash and front lighting',
        quantity: 1,
        priority: 'high',
        providedBy: 'venue',
        status: 'pending'
      },
      {
        id: 'venue-security-1',
        category: 'production',
        item: 'Security Personnel',
        description: 'Professional security for stage and equipment',
        quantity: 2,
        priority: 'medium',
        providedBy: 'venue',
        status: 'pending'
      }
    ];
  };

  const updateRequirement = (id: string, updates: Partial<TechnicalRequirement>) => {
    setRiderData(prev => ({
      ...prev,
      technicalRequirements: prev.technicalRequirements.map(req =>
        req.id === id ? { ...req, ...updates } : req
      )
    }));
  };

  const addCustomRequirement = () => {
    const newReq: TechnicalRequirement = {
      id: `custom-${Date.now()}`,
      category: 'sound',
      item: '',
      description: '',
      quantity: 1,
      priority: 'medium',
      providedBy: 'venue',
      status: 'pending'
    };

    setRiderData(prev => ({
      ...prev,
      technicalRequirements: [...prev.technicalRequirements, newReq]
    }));
  };

  // Stage Plot Functions with Auto-increment and User Assignment
  const addStageElement = (type: string, name: string, assignedUser?: any) => {
    // Check if user is already placed on stage plot
    if (assignedUser?.userId) {
      const userAlreadyOnStage = riderData.stageLayout.elements.some(element =>
        element.assignedTo === assignedUser.fullName || element.assignedTo === assignedUser.name
      );

      if (userAlreadyOnStage) {
        toast({
          title: "User Already on Stage",
          description: `${assignedUser.fullName || assignedUser.name} is already placed on the stage plot.`,
          variant: "destructive"
        });
        return; // Don't add duplicate user
      }
    }

    // Auto-increment counter for naming
    const currentCount = equipmentCounters[name] || 0;
    const newCount = currentCount + 1;
    setEquipmentCounters(prev => ({ ...prev, [name]: newCount }));

    // Generate name with auto-increment
    const elementName = `${name} ${newCount}`;

    const newElement = {
      id: `element-${Date.now()}`,
      type: 'equipment' as const,
      name: elementName,
      displayName: elementName, // For legend display
      x: Math.random() * 70 + 10, // Random position between 10-80%
      y: Math.random() * 60 + 20, // Random position between 20-80%
      rotation: 0,
      equipmentType: name,
      icon: type,
      assignedTo: assignedUser?.fullName || assignedUser?.name || '',
      assignedRole: assignedUser?.role || assignedUser?.selectedRoles?.[0] || '',
      userId: assignedUser?.userId,
      color: getElementColor(name)
    };

    setRiderData(prev => ({
      ...prev,
      stageLayout: {
        ...prev.stageLayout,
        elements: [...prev.stageLayout.elements, newElement]
      }
    }));

    // Add to legend - ENHANCED: Use selectedTalent and convert to player name
    let assignedRole = assignedUser?.selectedTalent || assignedUser?.role || assignedUser?.selectedRoles?.[0];
    if (assignedRole) {
      assignedRole = convertInstrumentToPlayer(assignedRole);
    }

    setStageLegend(prev => [...prev, {
      id: newElement.id,
      name: elementName,
      type: name,
      color: getElementColor(name),
      assignedTo: assignedUser?.fullName || assignedUser?.name,
      role: assignedRole
    }]);

    // Note: Auto-assignment is handled separately to avoid interfering with stage plot functionality
  };

  // Get color for equipment type
  const getElementColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'Piano': '#8B5CF6',
      'Guitar': '#EF4444',
      'Drums': '#F59E0B',
      'Mic Stand': '#10B981',
      'Monitor': '#3B82F6',
      'Screen': '#6B7280'
    };
    return colors[type] || '#9CA3AF';
  };

  const removeStageElement = (elementId: string) => {
    const elementToRemove = riderData.stageLayout.elements.find(el => el.id === elementId);
    const isAssignedToBandMember = elementToRemove?.assignedTo &&
      bandMembers.some(member => member.fullName === elementToRemove.assignedTo);

    if (isAssignedToBandMember) {
      // Confirm removal for band member elements
      const confirmed = window.confirm(
        `Are you sure you want to remove "${elementToRemove.name}" assigned to ${elementToRemove.assignedTo}? This will remove them from the stage plot.`
      );
      if (!confirmed) {
        return; // Don't remove if not confirmed
      }
    }

    setRiderData(prev => ({
      ...prev,
      stageLayout: {
        ...prev.stageLayout,
        elements: prev.stageLayout.elements.filter(el => el.id !== elementId)
      }
    }));

    // Remove from legend
    setStageLegend(prev => prev.filter(item => item.id !== elementId));

    // Clear selection if removing selected element
    if (selectedElement === elementId) {
      setSelectedElement(null);
    }

    console.log(`🎭 STAGE REMOVAL: Removed ${elementToRemove?.name} for ${elementToRemove?.assignedTo}`);

    // Scroll to top after removing element
    scrollToTop();
  };

  // Update element name
  const updateElementName = (elementId: string, newName: string) => {
    setRiderData(prev => ({
      ...prev,
      stageLayout: {
        ...prev.stageLayout,
        elements: prev.stageLayout.elements.map(el =>
          el.id === elementId ? { ...el, name: newName, displayName: newName } : el
        )
      }
    }));

    // Update legend
    setStageLegend(prev => prev.map(item =>
      item.id === elementId ? { ...item, name: newName } : item
    ));
  };

  // Generate instruments from user profiles - ENHANCED: Use selectedTalent + proper icons
  const getUserInstruments = (user: any) => {
    // PRIORITY: Use selectedTalent if available, otherwise fall back to profile data
    const primaryTalent = user.selectedTalent || user.primaryRole;
    const instruments = user.skillsAndInstruments || user.instruments || user.profileRoles || [];
    const instrumentSet = new Set<string>();
    const result: any[] = [];

    // Add selectedTalent/primaryRole first (highest priority)
    if (primaryTalent) {
      const instrumentType = getInstrumentTypeFromTalent(primaryTalent);
      result.push(instrumentType);
      instrumentSet.add(instrumentType.name);
    }

    // Track if we've already added a vocal mic for this user
    let hasVocalMic = primaryTalent && (primaryTalent.toLowerCase().includes('vocal') || primaryTalent.toLowerCase().includes('singer'));

    instruments.forEach((instrument: string) => {
      const instrumentType = getInstrumentTypeFromTalent(instrument);

      // Skip vocals if we already have a vocal mic
      if ((instrument.toLowerCase().includes('vocal') || instrument.toLowerCase().includes('singer')) && hasVocalMic) {
        return;
      }

      // Use instrument name as key to avoid duplicates of same instrument type
      const key = instrumentType.name;
      if (!instrumentSet.has(key)) {
        instrumentSet.add(key);
        result.push(instrumentType);

        if (instrument.toLowerCase().includes('vocal') || instrument.toLowerCase().includes('singer')) {
          hasVocalMic = true;
        }
      }
    });

    return result;
  };

  // Helper function to get role name from role ID
  const getRoleNameFromId = (roleId: number): string => {
    const roleMap: { [key: number]: string } = {
      1: 'SuperAdmin',
      2: 'Admin',
      3: 'Managed Artist',
      4: 'Artist',
      5: 'Managed Musician',
      6: 'Musician',
      7: 'Managed Professional',
      8: 'Professional',
      9: 'Fan'
    };
    return roleMap[roleId] || 'Unknown Role';
  };

  // ENHANCED: Get proper instrument type and icon based on talent/skill
  const getInstrumentTypeFromTalent = (talent: string) => {
    const talentLower = talent.toLowerCase();

    if (talentLower.includes('piano') || talentLower.includes('pianist')) {
      return { type: '🎹', name: 'Piano' };
    } else if (talentLower.includes('keyboard') || talentLower.includes('keyboardist')) {
      return { type: '🎹', name: 'Piano' };
    } else if (talentLower.includes('guitar') || talentLower.includes('guitarist')) {
      return { type: '🎸', name: 'Guitar' };
    } else if (talentLower.includes('drum') || talentLower.includes('drummer')) {
      return { type: '🥁', name: 'Drums' };
    } else if (talentLower.includes('bass') || talentLower.includes('bass player')) {
      return { type: '🎸', name: 'Bass' };
    } else if (talentLower.includes('vocal') || talentLower.includes('singer') || talentLower.includes('vocalist')) {
      return { type: '🎤🎶', name: 'Mic Stand' };
    } else if (talentLower.includes('saxophone') || talentLower.includes('saxophonist')) {
      return { type: '🎷', name: 'Saxophone' };
    } else if (talentLower.includes('trumpet') || talentLower.includes('trumpeter')) {
      return { type: '🎺', name: 'Trumpet' };
    } else if (talentLower.includes('violin') || talentLower.includes('violinist')) {
      return { type: '🎻', name: 'Violin' };
    } else {
      return { type: '🎵', name: talent };
    }
  };

  // Export stage plot with legend
  const exportStagePlot = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 600;

    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Stage area
    ctx.strokeStyle = '#cccccc';
    ctx.strokeRect(50, 50, 500, 300);

    // Labels
    ctx.fillStyle = '#666666';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('AUDIENCE', 300, 30);
    ctx.fillText('BACKSTAGE', 300, 370);

    // Draw elements
    riderData.stageLayout.elements.forEach((element) => {
      const x = 50 + (element.x / 100) * 500;
      const y = 50 + (element.y / 100) * 300;

      // Element box
      ctx.fillStyle = (element as any).color || '#3B82F6';
      ctx.fillRect(x - 20, y - 10, 40, 20);

      // Element text
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(element.name, x, y + 3);
    });

    // Legend
    ctx.fillStyle = '#000000';
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('LEGEND', 580, 70);

    stageLegend.forEach((item, index) => {
      const legendY = 90 + (index * 25);

      // Legend color box
      ctx.fillStyle = item.color;
      ctx.fillRect(580, legendY - 8, 12, 12);

      // Legend text
      ctx.fillStyle = '#000000';
      ctx.font = '10px Arial';
      ctx.fillText(item.name, 600, legendY);

      if (item.assignedTo) {
        ctx.font = '8px Arial';
        ctx.fillStyle = '#666666';
        ctx.fillText(`${item.assignedTo} (${item.role})`, 600, legendY + 12);
      }
    });

    // Download
    const link = document.createElement('a');
    link.download = `stage-plot-${bookingId || 'design'}.png`;
    link.href = canvas.toDataURL();
    link.click();

    // Scroll to top after export
    scrollToTop();
  };

  // Missing utility functions for drag and movement - using enhanced versions below

  const moveElementWithControls = (direction: 'up' | 'down' | 'left' | 'right') => {
    if (!selectedElement) return;

    const moveDistance = 5; // 5% movement
    setRiderData(prev => ({
      ...prev,
      stageLayout: {
        ...prev.stageLayout,
        elements: prev.stageLayout.elements.map(el => {
          if (el.id !== selectedElement) return el;

          let newX = el.x;
          let newY = el.y;

          switch (direction) {
            case 'up': newY = Math.max(0, el.y - moveDistance); break;
            case 'down': newY = Math.min(100, el.y + moveDistance); break;
            case 'left': newX = Math.max(0, el.x - moveDistance); break;
            case 'right': newX = Math.min(100, el.x + moveDistance); break;
          }

          return { ...el, x: newX, y: newY };
        })
      }
    }));
  };

  const rotateElement = (elementId: string, direction: 'left' | 'right') => {
    const rotation = direction === 'left' ? -15 : 15;
    setRiderData(prev => ({
      ...prev,
      stageLayout: {
        ...prev.stageLayout,
        elements: prev.stageLayout.elements.map(el =>
          el.id === elementId
            ? { ...el, rotation: (el.rotation + rotation) % 360 }
            : el
        )
      }
    }));
  };

  // Drag and Drop Functions
  const startDrag = (elementId: string, e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setSelectedElement(elementId);

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    setDragState({
      isDragging: true,
      elementId,
      startX: clientX,
      startY: clientY
    });
  };

  const handleDrag = (e: MouseEvent | TouchEvent) => {
    if (!dragState.isDragging || !dragState.elementId) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const deltaX = clientX - dragState.startX;
    const deltaY = clientY - dragState.startY;

    // Convert pixel delta to percentage (assuming 400px container height/width)
    const deltaXPercent = (deltaX / 400) * 100;
    const deltaYPercent = (deltaY / 400) * 100;

    updateElementPosition(dragState.elementId, deltaXPercent, deltaYPercent);

    setDragState(prev => ({
      ...prev,
      startX: clientX,
      startY: clientY
    }));
  };

  const stopDrag = () => {
    setDragState({
      isDragging: false,
      elementId: null,
      startX: 0,
      startY: 0
    });
  };

  const updateElementPosition = (elementId: string, deltaX: number, deltaY: number) => {
    setRiderData(prev => ({
      ...prev,
      stageLayout: {
        ...prev.stageLayout,
        elements: prev.stageLayout.elements.map(element => {
          if (element.id === elementId) {
            const newX = Math.max(0, Math.min(90, element.x + deltaX));
            const newY = Math.max(5, Math.min(85, element.y + deltaY));
            return { ...element, x: newX, y: newY };
          }
          return element;
        })
      }
    }));
  };

  // Duplicate functions removed - using enhanced versions

  // Mouse and touch event handlers
  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => handleDrag(e);
    const handleMouseUp = () => stopDrag();
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      handleDrag(e);
    };
    const handleTouchEnd = () => stopDrag();

    if (dragState.isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [dragState.isDragging, dragState.startX, dragState.startY, dragState.elementId]);

  // Removed duplicate startDrag function - using the comprehensive version above

  // Audio Configuration Functions
  const addMonitor = () => {
    const newMonitor = {
      type: 'Wedge',
      quantity: 1,
      placement: 'Stage Left'
    };

    setRiderData(prev => ({
      ...prev,
      audioConfig: {
        ...prev.audioConfig,
        monitors: [...prev.audioConfig.monitors, newMonitor]
      }
    }));
    scrollToTop();
  };

  const removeMonitor = (index: number) => {
    setRiderData(prev => ({
      ...prev,
      audioConfig: {
        ...prev.audioConfig,
        monitors: prev.audioConfig.monitors.filter((_, i) => i !== index)
      }
    }));
  };

  const updateMonitor = (index: number, updates: any) => {
    setRiderData(prev => ({
      ...prev,
      audioConfig: {
        ...prev.audioConfig,
        monitors: prev.audioConfig.monitors.map((monitor, i) =>
          i === index ? { ...monitor, ...updates } : monitor
        )
      }
    }));
  };

  const addInputChannel = () => {
    const newInput = {
      channel: riderData.audioConfig.inputList.length + 1,
      instrument: '',
      inputType: 'XLR',
      phantom: false,
      assignedTo: ''
    };

    setRiderData(prev => ({
      ...prev,
      audioConfig: {
        ...prev.audioConfig,
        inputList: [...prev.audioConfig.inputList, newInput]
      }
    }));
    scrollToTop();
  };

  const removeInputChannel = (index: number) => {
    setRiderData(prev => ({
      ...prev,
      audioConfig: {
        ...prev.audioConfig,
        inputList: prev.audioConfig.inputList.filter((_, i) => i !== index)
      }
    }));
  };

  const updateInputList = (index: number, updates: any) => {
    setRiderData(prev => ({
      ...prev,
      audioConfig: {
        ...prev.audioConfig,
        inputList: prev.audioConfig.inputList.map((input, i) =>
          i === index ? { ...input, ...updates } : input
        )
      }
    }));
  };

  // Handle talent change and sync across stage plot and mixer assignments
  const handleTalentChange = (memberId: string, newTalent: string) => {
    console.log('🔄 TALENT SYNC: Handling talent change for member:', memberId, 'to:', newTalent);

    // Update band member's selected talent
    setBandMembers(prev => prev.map(member => {
      if (member.id === memberId) {
        const updatedMember = { ...member, selectedTalent: newTalent };

        // Check if this member is in the stage plot
        const isInStagePlot = riderData.stageLayout.elements.some(el =>
          el.assignedTo === member.fullName || el.assignedTo === member.fullName
        );

        if (isInStagePlot) {
          console.log('🎯 SYNC: Member is in stage plot, updating stage elements and mixer assignments');

          // Update stage plot elements
          setRiderData(prevRider => {
            const updatedElements = prevRider.stageLayout.elements.map(el => {
              if (el.assignedTo === member.fullName || el.assignedTo === member.fullName) {
                return {
                  ...el,
                  assignedRole: newTalent,
                  equipmentType: newTalent
                };
              }
              return el;
            });

            return {
              ...prevRider,
              stageLayout: {
                ...prevRider.stageLayout,
                elements: updatedElements
              }
            };
          });

          // Update stage legend
          setStageLegend(prev => prev.map(legendItem => {
            if (legendItem.assignedTo === member.fullName) {
              return {
                ...legendItem,
                role: convertInstrumentToPlayer(newTalent)
              };
            }
            return legendItem;
          }));

          // Update mixer channel assignments
          const updatedInputList = riderData.audioConfig.inputList.map(input => {
            if (input.assignedTo === member.fullName) {
              // Check if new talent matches this channel's instrument type
              const channelInstrument = input.instrument.toLowerCase();
              const newTalentLower = newTalent.toLowerCase();

              // If talent doesn't match channel type anymore, unassign
              if (!channelInstrument.includes(newTalentLower) &&
                !newTalentLower.includes(channelInstrument.split(' ')[0])) {
                return { ...input, assignedTo: '' };
              }
            }
            return input;
          });

          setRiderData(prevRider => ({
            ...prevRider,
            audioConfig: {
              ...prevRider.audioConfig,
              inputList: updatedInputList
            }
          }));

          // Trigger auto-assignment to reassign channels with new talent
          // Use immediate assignment for better reliability
          autoAssignMixerChannels();
        }

        return updatedMember;
      }
      return member;
    }));
  };

  // Drum kit configurations state
  const [drumKitConfigs, setDrumKitConfigs] = useState<Record<string, any>>({});
  const [showDrumKitModal, setShowDrumKitModal] = useState(false);
  const [currentDrummer, setCurrentDrummer] = useState<any>(null);

  // Rebuild mixer when band members change
  useEffect(() => {
    const hasAssignedInstruments = bandMembers.some(member => member.selectedTalent);
    if (hasAssignedInstruments) {
      console.log('🎼 Band members changed with assigned instruments, rebuilding mixer...');
      rebuildMixerFromInstruments();
    }
  }, [bandMembers, drumKitConfigs]);

  // AUTO-ASSIGNMENT: Use bandMembers directly like stage plot does  
  const autoAssignMixerChannels = useCallback(() => {
    try {
      console.log('🎛️ AUTO-ASSIGNMENT: Using bandMembers like stage plot');

      if (!bandMembers || bandMembers.length === 0) {
        console.log('🎛️ No band members available for auto-assignment');
        return;
      }

      console.log(`🎛️ Processing ${bandMembers.length} band members for auto-assignment`);

      // Track assigned members to prevent duplicates
      const assignedMemberIds = new Set();

      // Update mixer channels directly
      setMixerChannels(prevChannels => {
        const updatedChannels = { ...prevChannels };

        // Clear all existing assignments first (for re-assignment when user returns)
        Object.keys(updatedChannels).forEach(sectionName => {
          (updatedChannels as any)[sectionName].forEach((channel: any) => {
            channel.assignedTo = '';
          });
        });
        console.log('🧹 CLEARED all existing channel assignments before re-assigning');

        // Process each band member
        bandMembers.forEach((member: any, index: number) => {
          if (assignedMemberIds.has(member.userId)) return;
          // CRITICAL FIX: Use selectedTalent (what user chose in dropdown) for flexibility
          const memberTalent = member.selectedTalent;
          if (!memberTalent) {
            console.log(`   ❌ SKIPPING: No talent data found. Available fields:`, Object.keys(member));
            return; // Skip members without talent/skill selection
          }

          console.log(`\n🎵 PROCESSING BAND MEMBER ${index + 1}/${bandMembers.length}:`);
          console.log(`   Name: ${member.fullName}`);
          console.log(`   Stage Name: ${member.stageName}`);
          console.log(`   Current Talent: "${memberTalent}"`);

          // Show exactly what we're checking for Phoenix specifically
          if (member.fullName === 'Phoenix' || member.stageName === 'Phoenix') {
            console.log(`   🔍 PHOENIX DEBUG: Talent="${memberTalent}", Lowercase="${memberTalent?.toLowerCase()}"`);
            console.log(`   🔍 PHOENIX DEBUG: Contains 'drum'?`, memberTalent?.toLowerCase().includes('drum'));
            console.log(`   🔍 PHOENIX DEBUG: Contains 'percussion'?`, memberTalent?.toLowerCase().includes('percussion'));
          }

          // Determine instrument type from current Talent selection
          const instrumentLower = memberTalent.toLowerCase();
          let instrumentType = 'OTHER';
          let assignmentRule = 'SINGLE'; // SINGLE, STEREO_PAIR, or FULL_GROUP

          if (instrumentLower.includes('vocal') || instrumentLower.includes('singer') || instrumentLower.includes('voice')) {
            instrumentType = 'VOCALS';
            assignmentRule = 'SINGLE';
            console.log(`   🎤 VOCAL DETECTION: "${instrumentLower}" mapped to VOCALS`);

            // Enhanced lead vocalist detection for new instrument database
            const isLeadVocalist = instrumentLower.includes('lead vocalist') ||
              instrumentLower.includes('lead singer') ||
              instrumentLower.includes('main vocalist') ||
              instrumentLower.includes('lead vocal') ||
              instrumentLower.includes('lead') ||
              instrumentLower.includes('main');

            const isBackgroundVocalist = instrumentLower.includes('background vocalist') ||
              instrumentLower.includes('backing vocalist') ||
              instrumentLower.includes('background vocal') ||
              instrumentLower.includes('backing vocal') ||
              instrumentLower.includes('background singer') ||
              instrumentLower.includes('backing singer');

            if (isLeadVocalist) {
              console.log(`   🎤 LEAD VOCALIST DETECTED: "${memberTalent}"`);
            } else if (isBackgroundVocalist) {
              console.log(`   🎤 BACKGROUND VOCALIST DETECTED: "${memberTalent}"`);
            } else {
              console.log(`   🎤 GENERAL VOCALIST DETECTED: "${memberTalent}"`);
            }
          } else if (instrumentLower.includes('guitar') && !instrumentLower.includes('bass')) {
            instrumentType = 'GUITAR';
            assignmentRule = 'SINGLE';
          } else if (instrumentLower.includes('bass')) {
            instrumentType = 'BASS';
            assignmentRule = 'SINGLE';
          } else if (instrumentLower.includes('keyboard') || instrumentLower.includes('piano')) {
            instrumentType = 'KEYBOARD';
            assignmentRule = 'STEREO_PAIR'; // Keyboards need L/R pair
          } else if (instrumentLower.includes('drum') || instrumentLower.includes('percussion') || instrumentLower.includes('beat') ||
            instrumentLower.includes('drummer') || instrumentLower.includes('percussionist')) {
            instrumentType = 'DRUMS';
            assignmentRule = 'FULL_GROUP'; // Drums get all available drum channels
            console.log(`   🥁 DRUM DETECTION: "${instrumentLower}" mapped to DRUMS`);

            // Enhanced drum type detection for new instrument database
            if (instrumentLower.includes('jazz drum') || instrumentLower.includes('jazz kit')) {
              console.log(`   🥁 JAZZ DRUM KIT DETECTED: "${memberTalent}"`);
            } else if (instrumentLower.includes('rock drum') || instrumentLower.includes('rock kit')) {
              console.log(`   🥁 ROCK DRUM KIT DETECTED: "${memberTalent}"`);
            } else if (instrumentLower.includes('electronic drum') || instrumentLower.includes('e-drum')) {
              console.log(`   🥁 ELECTRONIC DRUM KIT DETECTED: "${memberTalent}"`);
            } else {
              console.log(`   🥁 GENERAL DRUM KIT DETECTED: "${memberTalent}"`);
            }
          } else if (instrumentLower.includes('brass') || instrumentLower.includes('trumpet') || instrumentLower.includes('sax')) {
            instrumentType = 'BRASS';
            assignmentRule = 'SINGLE';
          } else if (instrumentLower.includes('string') || instrumentLower.includes('violin')) {
            instrumentType = 'STRINGS';
            assignmentRule = 'SINGLE';
          } else if (instrumentLower.includes('percussion')) {
            instrumentType = 'PERCUSSION';
            assignmentRule = 'SINGLE';
          }

          console.log(`   Mapped to: ${instrumentType} (${assignmentRule})`);

          // Find matching channel groups for this instrument type
          let channelAssigned = false;

          // Sort sections to prioritize better matches (lead vocals before background vocals, etc.)
          const sortedSectionNames = Object.keys(updatedChannels).sort((a, b) => {
            const aLower = a.toLowerCase();
            const bLower = b.toLowerCase();

            // For vocals, prioritize lead/main over background/backing using enhanced detection
            if (instrumentType === 'VOCALS') {
              // Use same enhanced detection logic as above
              const memberIsLead = instrumentLower.includes('lead vocalist') ||
                instrumentLower.includes('lead singer') ||
                instrumentLower.includes('main vocalist') ||
                instrumentLower.includes('lead vocal') ||
                instrumentLower.includes('lead') ||
                instrumentLower.includes('main');

              const memberIsBackground = instrumentLower.includes('background vocalist') ||
                instrumentLower.includes('backing vocalist') ||
                instrumentLower.includes('background vocal') ||
                instrumentLower.includes('backing vocal') ||
                instrumentLower.includes('background singer') ||
                instrumentLower.includes('backing singer');

              const aIsLead = aLower.includes('lead') || aLower.includes('main') ||
                (aLower.includes('vocal') && !aLower.includes('background') && !aLower.includes('backing'));
              const bIsLead = bLower.includes('lead') || bLower.includes('main') ||
                (bLower.includes('vocal') && !bLower.includes('background') && !bLower.includes('backing'));

              // If musician is specifically a lead vocalist, prioritize lead vocal sections
              if (memberIsLead) {
                console.log(`   🎤 LEAD VOCALIST - Prioritizing lead vocal sections`);
                if (aIsLead && !bIsLead) return -1; // a comes first
                if (!aIsLead && bIsLead) return 1;  // b comes first
              } else if (memberIsBackground) {
                // For background vocalists, prioritize background vocals
                console.log(`   🎤 BACKGROUND VOCALIST - Prioritizing background vocal sections`);
                const aIsBackground = aLower.includes('background') || aLower.includes('backing');
                const bIsBackground = bLower.includes('background') || bLower.includes('backing');
                if (aIsBackground && !bIsBackground) return -1;
                if (!aIsBackground && bIsBackground) return 1;
              }
            }

            return 0; // Keep original order for non-vocals or equal priority
          });

          sortedSectionNames.forEach(sectionName => {
            if (channelAssigned) return; // Only assign once per musician

            const sectionLower = sectionName.toLowerCase();
            let sectionMatchesInstrument = false;

            // Check if section matches the musician's instrument type
            switch (instrumentType) {
              case 'VOCALS':
                // Prioritize lead vocals over background vocals
                const isLeadVocals = sectionLower.includes('lead') || sectionLower.includes('main') ||
                  (sectionLower.includes('vocal') && !sectionLower.includes('background') && !sectionLower.includes('backing'));
                const isAnyVocals = sectionLower.includes('vocal') || sectionLower.includes('vox');
                sectionMatchesInstrument = isAnyVocals;
                console.log(`   🎤 VOCAL SECTION CHECK: "${sectionName}" - Lead: ${isLeadVocals}, Any: ${isAnyVocals}`);

                // Check if member is lead vocalist and this is lead vocal section using enhanced detection
                const memberIsLead = instrumentLower.includes('lead vocalist') ||
                  instrumentLower.includes('lead singer') ||
                  instrumentLower.includes('main vocalist') ||
                  instrumentLower.includes('lead vocal') ||
                  instrumentLower.includes('lead') ||
                  instrumentLower.includes('main');

                const memberIsBackground = instrumentLower.includes('background vocalist') ||
                  instrumentLower.includes('backing vocalist') ||
                  instrumentLower.includes('background vocal') ||
                  instrumentLower.includes('backing vocal') ||
                  instrumentLower.includes('background singer') ||
                  instrumentLower.includes('backing singer');

                if (memberIsLead && isLeadVocals) {
                  console.log(`   🎤 LEAD VOCALIST → LEAD VOCALS SECTION: ${sectionName}`);
                } else if (memberIsLead && !isLeadVocals) {
                  console.log(`   🎤 LEAD VOCALIST but non-lead section: ${sectionName} - will try lead sections first`);
                } else if (memberIsBackground && sectionLower.includes('background')) {
                  console.log(`   🎤 BACKGROUND VOCALIST → BACKGROUND VOCALS SECTION: ${sectionName}`);
                } else if (memberIsBackground && !sectionLower.includes('background')) {
                  console.log(`   🎤 BACKGROUND VOCALIST but non-background section: ${sectionName} - will try background sections first`);
                }
                break;
              case 'GUITAR':
                sectionMatchesInstrument = (sectionLower.includes('guitar') || sectionLower.includes('gtr')) && !sectionLower.includes('bass');
                break;
              case 'BASS':
                sectionMatchesInstrument = sectionLower.includes('bass') && !sectionLower.includes('drum');
                break;
              case 'KEYBOARD':
                sectionMatchesInstrument = sectionLower.includes('key') || sectionLower.includes('piano') || sectionLower.includes('synth');
                break;
              case 'DRUMS':
                sectionMatchesInstrument = sectionLower.includes('drum') || sectionLower.includes('percussion') || sectionName === 'DRUMS';
                console.log(`   🥁 DRUM SECTION CHECK: "${sectionName}" - Match: ${sectionMatchesInstrument}`);
                break;
              case 'BRASS':
                sectionMatchesInstrument = sectionLower.includes('sax') || sectionLower.includes('trumpet') || sectionLower.includes('brass');
                break;
              case 'STRINGS':
                sectionMatchesInstrument = sectionLower.includes('string') || sectionLower.includes('violin') || sectionLower.includes('orchestral');
                break;
              case 'PERCUSSION':
                sectionMatchesInstrument = sectionLower.includes('percussion');
                break;
            }

            if (sectionMatchesInstrument) {
              const channels = (updatedChannels as any)[sectionName];
              const availableChannels = channels.filter((ch: any) => !ch.assignedTo || ch.assignedTo.trim() === '');

              console.log(`   Found matching section: ${sectionName} (${availableChannels.length} available channels)`);

              if (availableChannels.length > 0) {
                const displayName = member.stageName || member.fullName;

                // Apply assignment rule
                switch (assignmentRule) {
                  case 'SINGLE':
                    // Assign to one channel only
                    availableChannels[0].assignedTo = displayName;
                    console.log(`   ✅ SINGLE ASSIGNMENT: ${displayName} → Channel ${availableChannels[0].number || availableChannels[0].channel || 'N/A'}`);
                    channelAssigned = true;
                    break;

                  case 'STEREO_PAIR':
                    // Assign to L/R pair (keyboards) - MUST get both channels
                    if (availableChannels.length >= 2) {
                      availableChannels[0].assignedTo = `${displayName} (L)`;
                      availableChannels[1].assignedTo = `${displayName} (R)`;
                      console.log(`   ✅ STEREO PAIR: ${displayName} → Channels ${availableChannels[0].number || availableChannels[0].channel || 'N/A'}-${availableChannels[1].number || availableChannels[1].channel || 'N/A'} (L/R)`);
                      channelAssigned = true;
                    } else if (availableChannels.length === 1) {
                      // Fallback to single channel if only one available
                      availableChannels[0].assignedTo = displayName;
                      console.log(`   ✅ FALLBACK SINGLE: ${displayName} → Channel ${availableChannels[0].number || availableChannels[0].channel || 'N/A'} (only 1 available for stereo)`);
                      channelAssigned = true;
                    } else {
                      console.log(`   ❌ NO CHANNELS AVAILABLE for stereo pair: ${displayName}`);
                    }
                    break;

                  case 'FULL_GROUP':
                    // Assign to ALL available channels in the group (drums)
                    if (availableChannels.length > 0) {
                      availableChannels.forEach((channel: any) => {
                        channel.assignedTo = displayName;
                      });
                      console.log(`   ✅ FULL GROUP: ${displayName} → ALL ${availableChannels.length} channels in ${sectionName}`);
                      channelAssigned = true;
                    } else {
                      console.log(`   ❌ NO CHANNELS AVAILABLE for full group: ${displayName}`);
                    }
                    break;
                }
              }
            }
          });

          if (!channelAssigned) {
            console.log(`   ❌ NO SUITABLE CHANNELS FOUND FOR ${member.fullName} (${instrumentType})`);

            // For strings/violin, create a new section if it doesn't exist
            if (instrumentType === 'STRINGS') {
              console.log(`   🎻 CREATING STRINGS SECTION for ${member.fullName}`);
              const displayName = member.stageName || member.fullName;

              // Add a strings section with 2 channels
              (updatedChannels as any)['strings'] = [
                { number: 1, name: 'Strings L', assignedTo: `${displayName} (L)` },
                { number: 2, name: 'Strings R', assignedTo: `${displayName} (R)` }
              ];
              console.log(`   ✅ STRINGS SECTION CREATED: ${displayName} → Channels 1-2 (L/R)`);
              channelAssigned = true;
            }
          }

          if (channelAssigned) {
            console.log(`   🎯 MUSICIAN ASSIGNED AND MARKED AS PROCESSED`);
            assignedMemberIds.add(member.userId);
          }
        });

        console.log('\n🎯 AUTO-ASSIGNMENT COMPLETE');
        console.log(`📊 Total band members processed: ${bandMembers.length}`);
        console.log(`📊 Total musicians assigned: ${assignedMemberIds.size}`);
        console.log(`📊 Unassigned musicians: ${bandMembers.length - assignedMemberIds.size}`);

        return updatedChannels;
      });

      console.log('🎛️ AUTO-ASSIGNMENT: Channels updated successfully');
    } catch (error) {
      console.error('🚨 AUTO-ASSIGNMENT ERROR:', error);
      // Don't show error toast on page load - just log it
    }
  }, [bandMembers, mixerChannels]); // Dependencies for useCallback

  const calculateProgress = () => {
    const sections = Object.keys(completionStatus).length;
    const completed = Object.values(completionStatus).filter(Boolean).length;
    return (completed / sections) * 100;
  };

  const exportRider = async () => {
    try {
      setIsGenerating(true);

      const exportData = {
        booking_id: bookingId,
        band_members: bandMembers,
        equipment_requests: riderData.equipmentRequests || [],
        stage_layout: riderData.stageLayout,
        audio_config: riderData.audioConfig,
        event_details: eventDetails,
        mixer_channels: mixerChannels,
        generated_at: new Date().toISOString()
      };

      const response = await fetch('/api/technical-rider/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || 'temp-token'}`
        },
        body: JSON.stringify(exportData)
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `technical-rider-booking-${bookingId}.pdf`;
        a.click();
        URL.revokeObjectURL(url);

        toast(TOAST_CONFIGS.SUCCESS.EXPORT);
        scrollToTop();
      } else {
        const errorData = await response.json();
        toast(TOAST_CONFIGS.ERROR.EXPORT_FAILED_WITH_MESSAGE(errorData.message));
      }
    } catch (error) {
      console.error('Export error:', error);
      toast(TOAST_CONFIGS.ERROR.EXPORT_FAILED);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsGenerating(true);

      const saveData = {
        booking_id: bookingId,
        band_members: bandMembers,
        equipment_requests: riderData.equipmentRequests || [],
        stage_layout: riderData.stageLayout || {},
        audio_config: riderData.audioConfig || {},
        completion_status: completionStatus || {},
        saved_at: new Date().toISOString(),
      };

      const response = await fetch(`/api/bookings/${bookingId}/enhanced-technical-rider`, {
        method: 'POST',
        body: JSON.stringify(saveData),
      });

      if (!response.ok) {
        throw new Error("Failed to save technical rider");
      }

      const result = await response.json(); // Optional: backend থেকে return আসলে ব্যবহার করতে পারো
      onSave?.(result.data ?? riderData);

      toast(TOAST_CONFIGS.SUCCESS.SAVE);
      scrollToTop();
    } catch (error) {
      console.error("Save error:", error);
      toast(TOAST_CONFIGS.ERROR.SAVE_FAILED);
    } finally {
      setIsGenerating(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-600 bg-green-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'unavailable': return 'text-red-600 bg-red-50';
      case 'alternative': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Header with Progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3">
                <Target className="h-6 w-6 text-primary" />
                Professional Technical Rider System
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Enhanced technical rider with real-time collaboration and professional export
              </p>
            </div>
            <div className="flex flex-col md:flex-row gap-2">
              <Button
                onClick={generateRequirements}
                disabled={isGenerating}
                variant="outline"
                size="sm"
                className="mobile-button w-full sm:w-auto"
              >
                <Wand2 className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">{isGenerating ? 'Generating...' : 'Auto Generate'}</span>
                <span className="sm:hidden">🎪 {isGenerating ? 'Creating...' : 'Auto Magic'}</span>
              </Button>
              
              <Button
                onClick={exportRider}
                variant="outline"
                size="sm"
                className="mobile-button w-full sm:w-auto"
              >
                <Download className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Export PDF</span>
                <span className="sm:hidden">📄 Export</span>
              </Button>
              <Button
                onClick={handleSave}
                size="sm"
                disabled={isGenerating}
                className="mobile-button w-full sm:w-auto"
              >
                <Save className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">{isGenerating ? 'Saving...' : 'Save Rider'}</span>
                <span className="sm:hidden">💾 {isGenerating ? 'Saving...' : 'Save'}</span>
              </Button>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span>Completion Progress</span>
              <span>{Math.round(calculateProgress())}%</span>
            </div>
            <Progress value={calculateProgress()} className="h-2" />
          </div>
        </CardHeader>
      </Card>

      {/* Main Tabs - Musical Mobile Optimized */}
      <Tabs value={activeTab} onValueChange={(value: string) => setActiveTab(value as any)}>
        <TabsList className="musical-tabs-list ">
          <TabsTrigger value="requirements" className="musical-tab-trigger musical-tab">
            <div className="mobile-tab-icon">🎛️</div>
            <div className="mobile-tab-text">Requirements</div>
          </TabsTrigger>
          <TabsTrigger value="stage" className="musical-tab-trigger musical-tab">
            <div className="mobile-tab-icon">🎭</div>
            <div className="mobile-tab-text">Stage Plot</div>
          </TabsTrigger>
          <TabsTrigger value="audio" className="musical-tab-trigger musical-tab">
            <div className="mobile-tab-icon">🎚️</div>
            <div className="mobile-tab-text">Mixer & Patch</div>
          </TabsTrigger>
          <TabsTrigger value="schedule" className="musical-tab-trigger musical-tab">
            <div className="mobile-tab-icon">🎵</div>
            <div className="mobile-tab-text">Setlist Builder</div>
          </TabsTrigger>
          <TabsTrigger value="hospitality" className="musical-tab-trigger musical-tab">
            <div className="mobile-tab-icon">🏨</div>
            <div className="mobile-tab-text">Hospitality & Dressing</div>
          </TabsTrigger>
          <TabsTrigger value="overview" className="musical-tab-trigger musical-tab">
            <div className="mobile-tab-icon">📋</div>
            <div className="mobile-tab-text">Overview</div>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 animate-fade-in-up">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mobile-container">
            {/* Event Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Event Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Event Name</Label>
                  <Input
                    value={(riderData.eventInfo as any)?.eventName || ''}
                    onChange={(e) => setRiderData(prev => ({
                      ...prev,
                      eventInfo: { ...prev.eventInfo, eventName: e.target.value }
                    }))}
                    disabled={!canEdit}
                    className="mobile-input"
                    placeholder="🎪 Enter event name..."
                  />
                </div>
                <div>
                  <Label>Venue</Label>
                  <Input
                    value={(riderData.eventInfo as any)?.venueName || ''}
                    onChange={(e) => setRiderData(prev => ({
                      ...prev,
                      eventInfo: { ...prev.eventInfo, venueName: e.target.value }
                    }))}
                    disabled={!canEdit}
                    className="mobile-input"
                    placeholder="🏛️ Venue name..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Event Date</Label>
                    <Input
                      type="date"
                      value={(riderData.eventInfo as any)?.eventDate || ''}
                      onChange={(e) => setRiderData(prev => ({
                        ...prev,
                        eventInfo: { ...prev.eventInfo, eventDate: e.target.value }
                      }))}
                      disabled={!canEdit}
                    />
                  </div>
                  <div>
                    <Label>Duration (minutes)</Label>
                    <Input
                      type="number"
                      value={(riderData.eventInfo as any)?.duration || ''}
                      onChange={(e) => setRiderData(prev => ({
                        ...prev,
                        eventInfo: { ...prev.eventInfo, duration: parseInt(e.target.value) }
                      }))}
                      disabled={!canEdit}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Artist Lineup */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Artist Lineup
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {assignedMusicians.map((musician, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="font-medium">{musician.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {musician.instruments?.join(', ') || 'No instruments specified'}
                      </div>
                      {musician.role && (
                        <Badge variant="outline" className="mt-1">
                          {musician.role}
                        </Badge>
                      )}
                    </div>
                  ))}
                  {assignedMusicians.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No musicians assigned yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">
                  {riderData.technicalRequirements.length}
                </div>
                <div className="text-sm text-muted-foreground">Total Requirements</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {riderData.technicalRequirements.filter(r => r.status === 'confirmed').length}
                </div>
                <div className="text-sm text-muted-foreground">Confirmed</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {riderData.technicalRequirements.filter(r => r.status === 'pending').length}
                </div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">
                  {riderData.technicalRequirements.filter(r => r.priority === 'critical').length}
                </div>
                <div className="text-sm text-muted-foreground">Critical Items</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Band Makeup & Equipment Requirements - MATCHING YOUR DOCUMENT */}
        <TabsContent value="requirements" className="space-y-4 lg:space-y-6 animate-fade-in-up mobile-container">
          {/* Band Makeup Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Band Makeup & Instrumentation
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Professional band configuration matching your technical rider format
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Band Members Table */}
              <div>
                <h4 className="font-semibold mb-3">MANAGEMENT TEAM and BAND members are:</h4>
                <div className="space-y-2">
                  <div className="grid grid-cols-5 gap-4 font-semibold text-sm bg-gray-100 p-3 rounded">
                    <div className="col-span-1">Membership</div>
                    <div className="col-span-1">Talent/Skill</div>
                    <div className="col-span-2">Full Name (Stage Name)</div>
                    <div className="col-span-1">Role</div>
                  </div>

                  {bandMembers.map((member, index) => (
                    <div key={member.id} className="grid grid-cols-5 gap-4 p-3 border rounded items-center">
                      {/* Column 1: Membership (smaller) */}
                      <Badge
                        variant={member.membership === "BAND" ? "default" : member.membership === "TEAM" ? "outline" : "secondary"}
                        className={`text-xs ${member.membership === "TEAM" ? "border-orange-500 text-orange-700" : ""
                          }`}
                      >
                        {member.membership}
                      </Badge>

                      {/* Column 2: Talent/Skill Dropdown */}
                      <Select
                        value={member.selectedTalent || ""}
                        onValueChange={(value) => {
                          // Skip divider option
                          if (value === '__divider__') return;

                          console.log(`🎯 TALENT/SKILL CHANGE: ${member.fullName} selected "${value}"`);

                          // Use the new unified talent change handler
                          handleTalentChange(member.id, value);

                          // Also update band member directly for immediate UI update
                          updateBandMember(member.id, { selectedTalent: value });


                        }}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {/* Enhanced database-driven talent options with generic alternatives */}
                          {buildTalentDropdownOptions(member).map((option, idx) => {
                            // Handle divider specially - non-selectable
                            if (option.type === 'Divider') {
                              return (
                                <div key={idx} className="px-2 py-1 text-center text-gray-400 text-xs border-b">
                                  {option.label}
                                </div>
                              );
                            }

                            return (
                              <SelectItem
                                key={idx}
                                value={option.value}
                                className={option.type === 'Primary' ? 'bg-blue-50 font-medium' :
                                  option.type === 'Secondary' ? 'bg-gray-50' :
                                    option.type === 'Generic' ? 'bg-green-50' : ''}
                              >
                                <div className="flex items-center justify-between w-full">
                                  <span style={{
                                    color: option.color === 'blue' ? '#3b82f6' :
                                      option.color === 'green' ? '#16a34a' :
                                        option.color === 'orange' ? '#ea580c' :
                                          option.color === 'purple' ? '#9333ea' : '#6b7280'
                                  }}>
                                    {option.label}
                                  </span>
                                  <span className="text-xs text-muted-foreground ml-2">
                                    {option.icon} {option.type}
                                  </span>
                                </div>
                              </SelectItem>
                            );
                          })}

                          {/* NO FALLBACK OPTIONS - USER POLICY: Zero tolerance for hardcoded values */}
                        </SelectContent>
                      </Select>

                      {/* Column 3-4: Full Name (Stage Name) - spans 2 columns */}
                      <div className="col-span-2 flex items-center gap-2">
                        <div className="flex-1 flex items-center gap-2">
                          <Input
                            value={member.stageName ? `${member.fullName} (${member.stageName})` : member.fullName}
                            onChange={(e) => {
                              const value = e.target.value;
                              const hasParens = value.includes('(') && value.includes(')');
                              if (hasParens) {
                                const fullName = value.split('(')[0].trim();
                                const stageName = value.split('(')[1].replace(')', '').trim();
                                updateBandMember(member.id, { fullName, stageName });
                              } else {
                                updateBandMember(member.id, { fullName: value, stageName: '' });
                              }
                            }}
                            className="h-8 flex-1"
                          />

                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeBandMember(member.id)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        >
                          ×
                        </Button>
                      </div>

                      {/* Column 5: Role - Show primaryRole, assignedRole, assignmentRole and availableRoles for non-management */}
                      <div className="flex flex-col gap-1">
                        {/* For non-management users: Show unique roles only */}
                        {member.membership !== 'MANAGEMENT' && (
                          <div className="flex flex-wrap gap-1">
                            {/* Show unique roles - prioritize assignedRole for professionals, primaryRole for others */}
                            {(() => {
                              const roles = new Set();
                              const roleElements = [];

                              // For professionals: prioritize assignedRole
                              if (member.type === 'Professional' && member.assignedRole && !roles.has(member.assignedRole)) {
                                roles.add(member.assignedRole);
                                roleElements.push(
                                  <Badge key="assigned" variant="default" className="text-xs bg-red-600 text-white">
                                    🎯 {member.assignedRole}
                                  </Badge>
                                );
                              }

                              // Show only database role from role_id - no fallbacks
                              if ((member as any).roleId) {
                                const dbRoleName = getRoleNameFromId((member as any).roleId);
                                if (dbRoleName && !roles.has(dbRoleName)) {
                                  roles.add(dbRoleName);
                                  roleElements.push(
                                    <Badge key="primary" variant="default" className="text-xs bg-blue-600 text-white">
                                      ⭐ {dbRoleName}
                                    </Badge>
                                  );
                                }
                              }

                              return roleElements;
                            })()}
                          </div>
                        )}

                        {/* For non-management users: Show assignment status (Main Booked Talent, Supporting Musician, etc.) */}
                        {member.membership !== 'MANAGEMENT' && (
                          <div className="flex flex-wrap gap-1">
                            {/* Show assignment status - avoid duplication */}
                            {(() => {
                              const statusElements = [];

                              // Primary booking status - check database assignment directly
                              if (member.assignmentRole === 'Main Booked Talent') {
                                statusElements.push(
                                  <Badge key="main-talent" variant="secondary" className="text-xs bg-purple-600 text-white">
                                    Main Booked Talent
                                  </Badge>
                                );
                              }

                              // Other assignment roles (avoid duplication with Main Booked Talent)
                              if (member.assignmentRole && member.assignmentRole !== 'Main Booked Talent') {
                                statusElements.push(
                                  <Badge key="assignment" variant="outline" className="text-xs">
                                    {member.assignmentRole}
                                  </Badge>
                                );
                              }

                              return statusElements;
                            })()}
                          </div>
                        )}

                        {/* For non-management users: Show availableRoles */}
                        {member.membership !== 'MANAGEMENT' && member.availableRoles && member.availableRoles.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            <span className="text-xs text-muted-foreground">Available:</span>
                            {member.availableRoles.slice(0, 2).map((role, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {role}
                              </Badge>
                            ))}
                            {member.availableRoles.length > 2 && (
                              <span className="text-xs text-muted-foreground">+{member.availableRoles.length - 2}</span>
                            )}
                          </div>
                        )}

                        {/* Management roles editable for MANAGEMENT members */}
                        {member.membership === 'MANAGEMENT' && (
                          <div className="flex gap-1 mt-1">
                            <Input
                              value={member.selectedTalent || ''}
                              onChange={(e) => updateBandMember(member.id, { selectedTalent: e.target.value })}
                              className="h-6 text-xs"
                              placeholder="Add roles..."
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => addBandMember('BAND')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Band Member
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={() => addBandMember('TEAM')}>
                      <Plus className="h-4 w-4 mr-2" />
                      + Add Team Member
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={() => addBandMember('MANAGEMENT')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Management
                    </Button>
                  </div>
                </div>
              </div>

              {/* Band Makeup Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Band Makeup Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {(() => {
                        const roleCounts = bandMembers.reduce((counts, member) => {
                          if (member.membership === 'BAND') {
                            const talent = member.selectedTalent || 'Performer';
                            counts[talent] = (counts[talent] || 0) + 1;
                          }
                          return counts;
                        }, {} as Record<string, number>);

                        const totalBandMembers = Object.values(roleCounts).reduce((sum, count) => sum + count, 0);

                        return (
                          <>
                            {Object.entries(roleCounts).map(([role, count]) => (
                              <div key={role} className="flex justify-between items-center p-2 border rounded">
                                <span className="text-sm">{role}</span>
                                <Badge variant="outline">{count}</Badge>
                              </div>
                            ))}
                            <div className="border-t pt-2 mt-2">
                              <div className="flex justify-between items-center font-semibold">
                                <span>Total Band Members</span>
                                <Badge>{totalBandMembers}</Badge>
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </CardContent>
                </Card>

                {/* Equipment Responsibilities */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Equipment Responsibilities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-green-700 mb-2">MANAGEMENT TEAM Provides:</h4>
                        <ul className="text-sm space-y-1 text-green-600">
                          <li>• ARTIST</li>
                          <li>• BAND MAKEUP as aforementioned</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium text-blue-700 mb-2">CLIENT Provides:</h4>
                        <ul className="text-sm space-y-1 text-blue-600">
                          <li>• One (1) small table for ARTIST's Tambourine and shaker</li>
                          <li>• One (1) Performance Stage</li>
                          <li>• Stage Lighting</li>
                          <li>• Sound Reinforcement System</li>
                          <li>• Audio/Video Recording</li>
                          <li>• Audio/Video Streaming</li>
                          <li>• Photography</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Equipment Request */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Equipment Request
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                CLIENT shall provide the following equipment, or equivalent. Includes lighting requirements.
              </p>
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                <strong>Lighting Note:</strong> All lighting equipment must be pre-hung prior to arrival for rehearsal.
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {riderData.equipmentRequests?.map((equipment: EquipmentRequest, index: number) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded">
                    <Checkbox
                      id={`equipment-${index}`}
                      checked={equipment.required}
                      onCheckedChange={(checked) => {
                        setRiderData(prev => ({
                          ...prev,
                          equipmentRequests: prev.equipmentRequests?.map((eq: EquipmentRequest, i: number) =>
                            i === index ? { ...eq, required: !!checked } : eq
                          ) || []
                        }));
                      }}
                    />
                    <Input
                      value={equipment.item}
                      onChange={(e) => {
                        setRiderData(prev => ({
                          ...prev,
                          equipmentRequests: prev.equipmentRequests?.map((eq: EquipmentRequest, i: number) =>
                            i === index ? { ...eq, item: e.target.value } : eq
                          ) || []
                        }));
                      }}
                      className="flex-1 text-sm"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newEquipmentRequests = [...(riderData.equipmentRequests || [])];
                        newEquipmentRequests[index] = {
                          ...equipment,
                          required: !equipment.required
                        };
                        setRiderData(prev => ({ ...prev, equipmentRequests: newEquipmentRequests }));
                      }}
                      className="h-8 px-2"
                    >
                      <Badge variant={equipment.required ? "default" : "outline"}>
                        {equipment.required ? "Required" : "Optional"}
                      </Badge>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setRiderData(prev => ({
                          ...prev,
                          equipmentRequests: prev.equipmentRequests?.filter((_: EquipmentRequest, i: number) => i !== index) || []
                        }));
                      }}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                    >
                      ×
                    </Button>
                  </div>
                )) || [
                  // BACKLINE EQUIPMENT
                  "Aguilar Tone Hammer 500 Bass Head with 8 X 10 cabinet (preferred) or equivalent",
                  "Fender twin reverb guitar amp or equivalent",
                  "DW fusion drum kit (14'' snare; 10\", 12\", 16\" toms)",
                  "DW 5000 kick pedal",
                  "Meinl byzance cymbals (14\" hi hat, 16'' crash, 17/18\" crash, 8\" splash, splash stack, ride)",
                  "Five (5) cymbal stands",

                  // MICROPHONES & SOUND (MERGED FROM MIC SECTION)
                  "One (1) wireless mic for ARTIST (Shure SM58 or equivalent)",
                  "Shure SM58 microphones (vocals) - additional as needed",
                  "DI boxes for instruments",

                  // MONITORS (MERGED FROM MONITOR SECTION)
                  "Wedge monitors (sufficient for stage size) or in-ear monitors for BAND",
                  "In-ear Monitor XLR/TRS connection for ARTIST",
                  "Floor monitors for background vocals",

                  // STAGE ITEMS & OTHER (MERGED FROM OTHER SECTION)
                  "Small table upon which to rest ARTIST's Tambourine and shaker",
                  "Music stands (as needed)",
                  "Power distribution and cable management"
                ].map((equipment, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded">
                    <Checkbox id={`equipment-${index}`} defaultChecked />
                    <Input
                      defaultValue={equipment}
                      className="flex-1 text-sm"
                      onChange={(e) => {
                        const newEquipmentRequests = riderData.equipmentRequests || [];
                        newEquipmentRequests[index] = {
                          id: `eq-${index}`,
                          item: e.target.value,
                          required: true,
                          category: 'Equipment'
                        };
                        setRiderData(prev => ({ ...prev, equipmentRequests: newEquipmentRequests }));
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newEquipmentRequests = riderData.equipmentRequests || [];
                        if (newEquipmentRequests[index]) {
                          newEquipmentRequests[index].required = !newEquipmentRequests[index].required;
                        } else {
                          newEquipmentRequests[index] = {
                            id: `eq-${index}`,
                            item: equipment,
                            required: false,
                            category: 'Equipment'
                          };
                        }
                        setRiderData(prev => ({ ...prev, equipmentRequests: newEquipmentRequests }));
                      }}
                      className="h-8 px-2"
                    >
                      <Badge variant={riderData.equipmentRequests?.[index]?.required !== false ? "default" : "outline"}>
                        {riderData.equipmentRequests?.[index]?.required !== false ? "Required" : "Optional"}
                      </Badge>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setRiderData(prev => ({
                          ...prev,
                          equipmentRequests: prev.equipmentRequests?.filter((_: EquipmentRequest, i: number) => i !== index) || []
                        }));
                      }}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                    >
                      ×
                    </Button>
                  </div>
                ))}

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setRiderData(prev => ({
                      ...prev,
                      equipmentRequests: [
                        ...(prev.equipmentRequests || []),
                        {
                          id: `eq-${Date.now()}`,
                          item: '',
                          required: false,
                          category: 'Equipment'
                        }
                      ]
                    }));
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Equipment Requirement
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Lighting Requirements Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Lighting Requirements
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Professional lighting specifications and requirements
              </p>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                <strong>Pre-Hanging Required:</strong> All lighting equipment must be pre-hung and tested prior to arrival for rehearsal.
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  "One-two (1-2) follow spots/spotlights for the ARTIST (as applicable)",
                  "Gels for Pops lighting (variety of colors and patterns) (as applicable)",
                  "General stage wash lighting",
                  "Front lighting for performance area",
                  "Color changing capability",
                  "Backlighting for band/musicians",
                  "Side lighting for depth and dimension",
                  "Haze machine for atmospheric effects (optional)",
                  "LED strip lighting for stage perimeter",
                  "Lighting control board/operator"
                ].map((lighting, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded bg-gradient-to-r from-blue-50 to-purple-50">
                    <Checkbox
                      id={`lighting-${index}`}
                      defaultChecked={index < 5} // First 5 are required by default
                    />
                    <Input
                      defaultValue={lighting}
                      className="flex-1 text-sm"
                    />
                    <Badge variant={index < 5 ? "default" : "outline"}>
                      {index < 5 ? "Required" : "Optional"}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                    >
                      ×
                    </Button>
                  </div>
                ))}

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    // Add new lighting requirement
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Lighting Requirement
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* MERGED: Microphones, Monitors, Other - Now part of Equipment Request section above */}
        </TabsContent>

        {/* Stage Plot Tab - FUNCTIONAL IMPLEMENTATION */}
        <TabsContent value="stage" className="space-y-4 lg:space-y-6 animate-fade-in-up mobile-container">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="h-5 w-5" />
                Interactive Stage Plot Designer
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Drag and drop instruments and equipment to design your stage layout
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Stage Configuration */}
                <div className="space-y-4">
                  <div>
                    <Label>Stage Width (ft)</Label>
                    <Input
                      type="number"
                      value={riderData.stageLayout.stageWidth}
                      onChange={(e) => setRiderData(prev => ({
                        ...prev,
                        stageLayout: { ...prev.stageLayout, stageWidth: parseInt(e.target.value) || 20 }
                      }))}
                      disabled={!canEdit}
                    />
                  </div>
                  <div>
                    <Label>Stage Height (ft)</Label>
                    <Input
                      type="number"
                      value={riderData.stageLayout.stageHeight}
                      onChange={(e) => setRiderData(prev => ({
                        ...prev,
                        stageLayout: { ...prev.stageLayout, stageHeight: parseInt(e.target.value) || 16 }
                      }))}
                      disabled={!canEdit}
                    />
                  </div>
                  <div>
                    <Label>Stage Type</Label>
                    <Select
                      value={riderData.stageLayout.stageType}
                      onValueChange={(value) => setRiderData(prev => ({
                        ...prev,
                        stageLayout: { ...prev.stageLayout, stageType: value as any }
                      }))}
                      disabled={!canEdit}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="indoor">Indoor</SelectItem>
                        <SelectItem value="outdoor">Outdoor</SelectItem>
                        <SelectItem value="amphitheater">Amphitheater</SelectItem>
                        <SelectItem value="arena">Arena</SelectItem>
                        <SelectItem value="club">Club</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Equipment Palette with User Instruments */}
                  <div className="space-y-4">
                    <div>
                      <Label>Add Equipment</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {[
                          { type: '🎹', name: 'Piano' },
                          { type: '🎸', name: 'Guitar' },
                          { type: '🥁', name: 'Drums' },
                          { type: '🎤', name: 'Mic' },
                          { type: '🔈', name: 'Monitor' },
                          { type: '📺', name: 'Screen' },
                          { type: '💻', name: 'Computer' },
                          { type: '🎧', name: 'DJ Setup' }
                        ].map((item) => (
                          <Button
                            key={item.name}
                            variant="outline"
                            size="sm"
                            onClick={() => addStageElement(item.type, item.name)}
                            disabled={!canEdit}
                            className="text-xs"
                          >
                            {item.type} {item.name}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Band Member Placement Tracking */}
                    <div>
                      <div className='flex lg:flex-col justify-center items-center gap-4'>
                        <Label>Band Member Placement</Label>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Button variant="outline" className="text-xs h-7">
                              {(() => {
                                // Count only BAND members (not TEAM or MANAGEMENT)
                                const totalBandMembers = bandMembers.filter(member => member.membership === 'BAND').length;
                                // Count placed BAND members based on stage legend assignments
                                const placedMembers = stageLegend.filter(legend =>
                                  bandMembers.some(member =>
                                    member.membership === 'BAND' &&
                                    (legend.assignedTo === member.fullName || legend.assignedTo === member.stageName)
                                  )
                                ).length;
                                return `${placedMembers} / ${totalBandMembers} Placed`;
                              })()}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // Place all unplaced band members
                                const unplacedMembers = bandMembers.filter(member => {
                                  if (member.membership !== 'BAND') return false;
                                  // Process all assigned talent (restriction removed)
                                  return !stageLegend.some(legend =>
                                    legend.assignedTo === member.fullName || legend.assignedTo === member.stageName
                                  );
                                });

                                unplacedMembers.forEach((member, index) => {
                                  const userInstruments = getUserInstruments(member);
                                  if (userInstruments.length > 0) {
                                    // Use first instrument
                                    addStageElement(userInstruments[0].type, userInstruments[0].name, member);
                                  } else {
                                    // Default to mic
                                    addStageElement('🎤', 'Mic', member);
                                  }
                                });
                              }}
                              disabled={!canEdit}
                              className="text-xs h-7"
                            >
                              Place All
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 mt-2 max-h-[60vh] overflow-y-auto">
                        {(() => {
                          const totalBandMembers = bandMembers.filter(member => member.membership === 'BAND');
                          const placedMembers: any[] = [];
                          const unplacedMembers: any[] = [];

                          totalBandMembers.forEach(member => {
                            const isPlaced = stageLegend.some(legend =>
                              legend.assignedTo === member.fullName || legend.assignedTo === member.stageName
                            );

                            if (isPlaced) {
                              placedMembers.push(member);
                            } else {
                              unplacedMembers.push(member);
                            }
                          });

                          // Show unplaced members first, then placed members at bottom
                          return [...unplacedMembers, ...placedMembers];
                        })().map((user, index) => {
                          const userInstruments = getUserInstruments(user);
                          const isPlaced = stageLegend.some(legend =>
                            legend.assignedTo === user.fullName || legend.assignedTo === user.stageName
                          );

                          return (
                            <div
                              key={user.id}
                              className={`border rounded p-2 transition-all duration-200 ${isPlaced
                                ? 'bg-green-50 border-green-200 opacity-75'
                                : 'bg-white border-gray-200 hover:border-blue-300'
                                }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <div className="text-xs font-medium text-muted-foreground">
                                  {user.fullName} ({user.selectedTalent || user.role})
                                </div>
                                {isPlaced && (
                                  <Badge variant="secondary" className="text-xs bg-green-600 text-white">
                                    ✓ Placed
                                  </Badge>
                                )}
                              </div>
                              <div className="grid grid-cols-1 gap-1">
                                {userInstruments.length > 0 ? userInstruments.map((instrument: any, i: number) => (
                                  <Button
                                    key={i}
                                    variant={isPlaced ? "secondary" : "outline"}
                                    size="sm"
                                    onClick={() => addStageElement(instrument.type, instrument.name, user)}
                                    disabled={!canEdit || isPlaced}
                                    className={`text-xs h-7 ${isPlaced
                                      ? 'bg-green-100 text-green-700 cursor-not-allowed'
                                      : 'hover:bg-blue-50'
                                      }`}
                                  >
                                    {instrument.type} {instrument.name}
                                    {isPlaced && ' ✓'}
                                  </Button>
                                )) : (
                                  <Button
                                    variant={isPlaced ? "secondary" : "outline"}
                                    size="sm"
                                    onClick={() => addStageElement('🎤', 'Mic', user)}
                                    disabled={!canEdit || isPlaced}
                                    className={`text-xs h-7 col-span-2 ${isPlaced
                                      ? 'bg-green-100 text-green-700 cursor-not-allowed'
                                      : 'hover:bg-blue-50'
                                      }`}
                                  >
                                    🎤 Add {user.fullName}
                                    {isPlaced && ' ✓'}
                                  </Button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Missing Members Alert */}
                      {(() => {
                        const totalBandMembers = bandMembers.filter(member => member.membership === 'BAND').length;
                        const placedMembers = stageLegend.filter(legend =>
                          bandMembers.some(member =>
                            member.membership === 'BAND' &&
                            (legend.assignedTo === member.fullName || legend.assignedTo === member.stageName)
                          )
                        ).length;
                        const missingCount = totalBandMembers - placedMembers;

                        if (missingCount > 0) {
                          return (
                            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-center">
                              <p className="text-sm text-yellow-800">
                                ⚠️ {missingCount} band member{missingCount === 1 ? '' : 's'} not placed on stage plot
                              </p>
                              <p className="text-xs text-yellow-600">
                                Click instruments above or use "Place All" to add missing members
                              </p>
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  </div>
                </div>

                {/* Stage Visualization - WORKING WITH DRAG & DROP */}
                <div className="lg:col-span-3 space-y-4">
                  <div
                    className="relative border-2 border-gray-300 rounded-lg bg-gradient-to-b from-gray-50 to-gray-100 overflow-hidden"
                    style={{
                      height: '400px',
                      width: '100%'
                    }}
                  >
                    {/* Stage Background */}
                    <div className="absolute inset-0 bg-gradient-to-b from-gray-200 to-gray-100">
                      <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 font-medium">
                        AUDIENCE
                      </div>
                      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 font-medium">
                        BACKSTAGE
                      </div>
                    </div>

                    {/* Stage Elements - FIXED SIZING & CLEAN DISPLAY */}
                    {riderData.stageLayout.elements.map((element) => (
                      <div
                        key={element.id}
                        className={`absolute cursor-move bg-white border-2 rounded-lg shadow-md select-none hover:shadow-lg stage-plot-element ${dragState.isDragging && dragState.elementId === element.id ? 'dragging' : ''
                          } ${selectedElement === element.id
                            ? 'border-green-500 ring-2 ring-green-200'
                            : 'border-blue-400'
                          }`}
                        style={{
                          left: `${element.x}%`,
                          top: `${element.y}%`,
                          transform: `rotate(${element.rotation}deg)`,
                          borderColor: (element as any).color || '#3B82F6'
                        }}
                        onMouseDown={(e) => startDrag(element.id, e)}
                        onTouchStart={(e) => startDrag(element.id, e)}
                        onClick={() => setSelectedElement(element.id)}
                        title={`${element.name}${(element as any).assignedTo ? ` - Assigned to ${(element as any).assignedTo}` : ''}`}
                      >
                        {/* Fixed size icon display */}
                        <div className="stage-plot-icon">
                          {(element as any).icon || '⚡'}
                        </div>

                        {/* Fixed size text display */}
                        <div className="stage-plot-text">
                          {element.name}
                        </div>

                        {(element as any).assignedRole && (
                          <div className="stage-plot-text text-muted-foreground">
                            {(element as any).assignedRole}
                          </div>
                        )}

                        {element.assignedTo && (
                          <div className="stage-plot-text text-gray-600">
                            {element.assignedTo}
                          </div>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute -top-1 -right-1 h-4 w-4 p-0 text-red-500 hover:text-red-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeStageElement(element.id);
                          }}
                          disabled={!canEdit}
                        >
                          ×
                        </Button>
                      </div>
                    ))}

                    {riderData.stageLayout.elements.length === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                        <div className="text-center">
                          <Layout className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">Click equipment buttons to add to stage</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Movement Control Buttons */}
                  {selectedElement && (
                    <div className="bg-white border rounded-lg p-4">
                      <div className="text-sm font-medium mb-3 text-center">
                        Control Selected: {riderData.stageLayout.elements.find(e => e.id === selectedElement)?.name}
                      </div>

                      {/* Movement Controls */}
                      <div className="grid grid-cols-3 gap-2 max-w-48 mx-auto mb-4">
                        <div></div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => moveElementWithControls('up')}
                          disabled={!canEdit}
                          className="h-10 w-10 p-0"
                        >
                          ↑
                        </Button>
                        <div></div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => moveElementWithControls('left')}
                          disabled={!canEdit}
                          className="h-10 w-10 p-0"
                        >
                          ←
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedElement(null)}
                          className="h-10 w-10 p-0 text-xs"
                        >
                          ✕
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => moveElementWithControls('right')}
                          disabled={!canEdit}
                          className="h-10 w-10 p-0"
                        >
                          →
                        </Button>

                        <div></div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => moveElementWithControls('down')}
                          disabled={!canEdit}
                          className="h-10 w-10 p-0"
                        >
                          ↓
                        </Button>
                        <div></div>
                      </div>

                      {/* Rotation Controls */}
                      <div className="flex gap-2 justify-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => selectedElement && rotateElement(selectedElement, 'left')}
                          disabled={!canEdit}
                          className="flex items-center gap-1"
                        >
                          ↺ Left
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => selectedElement && rotateElement(selectedElement, 'right')}
                          disabled={!canEdit}
                          className="flex items-center gap-1"
                        >
                          Right ↻
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Dynamic Legend - MANUAL EDITING ONLY */}
                  <div id="stage-legend" className="bg-white border rounded p-3 mt-4 w-full">
                    <h4 className="font-semibold text-sm mb-2 leading-tight">Legend ({stageLegend.length} items)</h4>
                    <div className="space-y-2 w-full">
                      {stageLegend.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 p-2 border rounded bg-gray-50 w-full">
                          <div
                            className="w-4 h-4 rounded border flex-shrink-0"
                            style={{ backgroundColor: item.color }}
                          />
                          <div className="flex-1 min-w-0">
                            {editingLegendItem === item.id && canEdit ? (
                              <Input
                                className="h-6 text-sm font-medium border-0 p-1 bg-transparent"
                                value={item.name}
                                onChange={(e) => updateElementName(item.id, e.target.value)}
                                onBlur={() => setEditingLegendItem(null)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    setEditingLegendItem(null);
                                  }
                                }}
                                autoFocus
                              />
                            ) : (
                              <div
                                className="text-sm font-medium cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                                title={item.name}
                                onClick={() => canEdit && setEditingLegendItem(item.id)}
                              >
                                {item.name}
                              </div>
                            )}
                            {item.assignedTo && (
                              <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                                <span>Assigned to: {item.assignedTo}</span>
                                {item.role && (
                                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                                    {item.role}
                                  </span>
                                )}
                                {/* Drum Kit Configuration Edit Icon */}
                                {item.role && item.role.toLowerCase().includes('drum') && canEdit && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      const drummer = bandMembers.find(member =>
                                        member.fullName === item.assignedTo || member.stageName === item.assignedTo
                                      );
                                      if (drummer) {
                                        handleDrummerClick(drummer);
                                      }
                                    }}
                                    className="h-4 w-4 p-0 text-blue-600 hover:text-blue-800"
                                    title="Configure drum kit"
                                  >
                                    <Edit3 className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      {stageLegend.length === 0 && (
                        <div className="text-muted-foreground text-center py-2" style={{ fontSize: '8px' }}>
                          Add equipment
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Export Stage Plot */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportStagePlot()}
                    className="w-full mt-2"
                    disabled={stageLegend.length === 0}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Stage Plot with Legend
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Professional Mixer Input Patch List - MATCHING YOUR DOCUMENT */}
        <TabsContent value="audio" className="space-y-4 lg:space-y-6 animate-fade-in-up mobile-container">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Mic className="h-5 w-5" />
                    Mixer Input Patch List
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Professional mixer configuration matching industry technical rider standards
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={autoAssignMixerChannels}
                    className="h-8"
                    disabled={riderData.stageLayout.elements.filter(el => el.assignedTo && el.assignedTo.trim() !== '').length === 0}
                  >
                    <Zap className="w-4 h-4 mr-1" />
                    Auto-Assign
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => resetMixerToDefaults()}
                    className="h-8"
                  >
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Reset to Defaults
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* DRAG-AND-DROP MIXER SECTIONS - Ordered by channelGroupOrder */}
                {channelGroupOrder
                  .filter(sectionName => mixerChannels[sectionName as keyof typeof mixerChannels])
                  .map((sectionName) => {
                    const channels = mixerChannels[sectionName as keyof typeof mixerChannels];
                    const isDragging = groupDragState.draggedGroup === sectionName;
                    const isDragOver = groupDragState.dragOverGroup === sectionName;

                    return (
                      <div
                        key={sectionName}
                        className={`space-y-2 transition-all duration-200 ${isDragging ? 'opacity-50 scale-95' : ''
                          } ${isDragOver ? 'ring-2 ring-blue-400 bg-blue-50' : ''
                          }`}
                        draggable={canEdit}
                        onDragStart={(e) => handleGroupDragStart(e, sectionName)}
                        onDragOver={(e) => handleGroupDragOver(e, sectionName)}
                        onDragLeave={handleGroupDragLeave}
                        onDrop={(e) => handleGroupDrop(e, sectionName)}
                        onDragEnd={handleGroupDragEnd}
                      >
                        <div className={`flex items-center justify-between cursor-move ${canEdit ? 'hover:bg-gray-50' : ''
                          } p-2 rounded border ${isDragOver ? 'border-blue-400' : 'border-gray-200'
                          }`}>
                          <div className="flex items-center gap-2">
                            {canEdit && (
                              <div className="flex flex-col gap-1 text-gray-400">
                                <div className="w-1 h-1 bg-current rounded-full"></div>
                                <div className="w-1 h-1 bg-current rounded-full"></div>
                                <div className="w-1 h-1 bg-current rounded-full"></div>
                                <div className="w-1 h-1 bg-current rounded-full"></div>
                                <div className="w-1 h-1 bg-current rounded-full"></div>
                                <div className="w-1 h-1 bg-current rounded-full"></div>
                              </div>
                            )}
                            <h4 className={`font-semibold text-sm p-2 rounded capitalize ${sectionName === 'drums' ? 'bg-yellow-100' :
                              sectionName === 'bass' ? 'bg-blue-100' :
                                sectionName === 'guitar' ? 'bg-green-100' :
                                  sectionName === 'keyboards' ? 'bg-purple-100' :
                                    sectionName === 'percussion' ? 'bg-orange-100' :
                                      sectionName === 'brass' ? 'bg-red-100' :
                                        sectionName === 'vocals' ? 'bg-pink-100' :
                                          'bg-gray-100'
                              }`}>
                              {sectionName.toUpperCase()}
                              <span className="ml-2 text-xs text-muted-foreground">
                                ({channels?.length || 0} channels)
                              </span>
                            </h4>
                          </div>
                          <div className="flex items-center gap-2">
                            {/* Up/Down Arrow Controls - Available for Both Desktop and Mobile */}
                            {canEdit && (
                              <div className="flex flex-col gap-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    moveGroupUp(sectionName);
                                  }}
                                  className="h-6 w-6 p-0"
                                  disabled={channelGroupOrder.indexOf(sectionName) === 0}
                                  title="Move group up"
                                >
                                  <ChevronUp className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    moveGroupDown(sectionName);
                                  }}
                                  className="h-6 w-6 p-0"
                                  disabled={channelGroupOrder.indexOf(sectionName) === channelGroupOrder.length - 1}
                                  title="Move group down"
                                >
                                  <ChevronDown className="w-3 h-3" />
                                </Button>
                              </div>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addChannelToSection(sectionName as keyof typeof mixerChannels)}
                              className="h-8"
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Add Channel
                            </Button>
                          </div>
                        </div>

                        {/* Column Headers */}
                        <div className="grid grid-cols-6 gap-3 items-center p-2 bg-gray-50 rounded text-xs font-medium text-muted-foreground">
                          <div>Channel</div>
                          <div>Input</div>
                          <div>Assigned To</div>
                          <div>Applicable</div>
                          <div>Notes</div>
                          <div>Actions</div>
                        </div>

                        {channels.map((channel: any, index: number) => {
                          const channelNumber = getChannelNumber(sectionName as keyof typeof mixerChannels, index);
                          return (
                            <div key={channel.id} className="grid grid-cols-6 gap-3 items-center p-2 border rounded">
                              <div className="font-mono text-sm font-semibold">Ch {channelNumber}</div>

                              {/* Editable Input Name */}
                              <Input
                                value={channel.input}
                                onChange={(e) => updateChannelInput(sectionName as keyof typeof mixerChannels, channel.id, e.target.value)}
                                className="h-8 text-sm"
                                placeholder="Input name"
                              />

                              {/* Manual Assignment Dropdown */}
                              <Select
                                value={channel.assignedTo || 'unassigned'}
                                onValueChange={(value) => {
                                  if (value === 'unassigned') {
                                    updateChannelAssignment(sectionName as keyof typeof mixerChannels, channel.id, '');
                                  } else {
                                    updateChannelAssignment(sectionName as keyof typeof mixerChannels, channel.id, value);
                                  }
                                }}
                              >
                                <SelectTrigger className="h-8 text-xs">
                                  <SelectValue placeholder="Assign to..." />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="unassigned">- Unassigned -</SelectItem>
                                  {bandMembers.map(member => (
                                    <SelectItem key={member.id} value={member.fullName}>
                                      {member.fullName}
                                      {member.selectedTalent && (
                                        <span className="text-xs text-muted-foreground ml-1">
                                          ({member.selectedTalent})
                                        </span>
                                      )}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>

                              <div>
                                <Checkbox
                                  id={`${channel.id}-applicable`}
                                  checked={channel.applicable}
                                  onCheckedChange={(checked) => updateChannelApplicable(sectionName as keyof typeof mixerChannels, channel.id, checked as boolean)}
                                />
                                <Label htmlFor={`${channel.id}-applicable`} className="ml-2 text-xs">Applicable</Label>
                              </div>

                              <Input
                                placeholder="Notes"
                                className="h-8 text-sm"
                                value={channel.notes}
                                onChange={(e) => updateChannelNotes(sectionName as keyof typeof mixerChannels, channel.id, e.target.value)}
                              />

                              {/* Remove Channel Button */}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeChannelFromSection(sectionName as keyof typeof mixerChannels, channel.id)}
                                className="h-8 w-8 p-0"
                                disabled={channels.length <= 1}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}

                {/* Drag Instructions */}
                {canEdit && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-sm font-medium text-blue-800 flex items-center gap-2">
                      <Move className="w-4 h-4" />
                      Professional Mixer Workflow
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      <strong>Reorder channel groups:</strong> Drag and drop headers OR use the up/down arrow buttons on each group. <br />
                      Channel numbers automatically update to help mixing engineers organize their workflow professionally.
                    </p>
                  </div>
                )}

                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-sm font-medium text-yellow-800">
                    Note: Only Channels Highlighted/Checked are Applicable
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    This matches the professional mixer input patch list format from your technical rider document.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Band Monitor Mix Section - Individual Monitor Control System */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                BAND Monitor Mix
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Individual monitor mix configuration for each assigned band member
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {bandMembers
                  .filter(member =>
                    member.talentType !== 'Professional' &&
                    member.talentType !== 'Management' &&
                    member.talentType !== 'Admin' &&
                    member.talentType !== 'Superadmin' &&
                    member.talentType !== 'Fan'
                  )
                  .map((bandMember, memberIndex) => (
                    <Card key={bandMember.id} className="border-l-4 border-l-blue-500">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="bg-blue-50">
                              {bandMember.talentType}
                            </Badge>
                            <div>
                              <h4 className="font-semibold">{bandMember.fullName}</h4>
                              <p className="text-sm text-muted-foreground">
                                {bandMember.stageName && `(${bandMember.stageName})`} • {bandMember.selectedTalent || bandMember.primaryRole}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Monitor Type</p>
                            <Select
                              value={bandMember.monitorType || 'wedge'}
                              onValueChange={(value: 'wedge' | 'iem-wired' | 'iem-wireless') => {
                                updateBandMember(bandMember.id, { monitorType: value });
                              }}
                            >
                              <SelectTrigger className="w-32 h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="wedge">🔈 Wedge</SelectItem>
                                <SelectItem value="iem-wired">🎧 Wired IEM</SelectItem>
                                <SelectItem value="iem-wireless">📶 Wireless IEM</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between mb-4">
                            <div className="text-sm font-medium text-muted-foreground">
                              Personal Monitor Mix (Add channels they want to hear)
                            </div>
                            <Select
                              onValueChange={(channelId) => {
                                if (channelId) {
                                  // Find the channel and section
                                  let foundChannel: any = null;
                                  let foundSection = '';

                                  Object.entries(mixerChannels).forEach(([sectionName, channels]) => {
                                    const channel = (channels as any[]).find((ch: any) => ch.id === channelId);
                                    if (channel) {
                                      foundChannel = channel;
                                      foundSection = sectionName;
                                    }
                                  });

                                  if (foundChannel) {
                                    const currentMix = bandMember.monitorMix || {};
                                    const updatedMix = {
                                      ...currentMix,
                                      [channelId]: {
                                        selected: true,
                                        volume: 70, // Default volume
                                        sectionName: foundSection,
                                        channelName: foundChannel.input
                                      }
                                    };
                                    updateBandMember(bandMember.id, { monitorMix: updatedMix });

                                    // Note: Auto-assignment to main mixer removed per user request
                                  }
                                }
                              }}
                            >
                              <SelectTrigger className="w-48">
                                <SelectValue placeholder="+ Add Channel to Mix" />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(mixerChannels).map(([sectionName, channels]) => (
                                  <div key={sectionName}>
                                    <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase">
                                      {sectionName}
                                    </div>
                                    {(channels as any[])
                                      .filter((channel: any) => !bandMember.monitorMix?.[channel.id]?.selected) // Only show unselected channels
                                      .map((channel: any, channelIndex: number) => {
                                        const channelNumber = getChannelNumber(sectionName as keyof typeof mixerChannels, channelIndex);
                                        return (
                                          <SelectItem key={channel.id} value={channel.id}>
                                            Ch {channelNumber} - {channel.input}
                                          </SelectItem>
                                        );
                                      })}
                                  </div>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Selected Channels in Mix */}
                          <div className="space-y-2">
                            {Object.entries(bandMember.monitorMix || {})
                              .filter(([_, mixData]) => mixData.selected)
                              .map(([channelId, mixData]) => {
                                // Find channel number
                                let channelNumber = 0;
                                let sectionName = mixData.sectionName || '';

                                if (sectionName) {
                                  const sectionChannels = mixerChannels[sectionName as keyof typeof mixerChannels];
                                  const channelIndex = sectionChannels.findIndex((ch: any) => ch.id === channelId);
                                  if (channelIndex >= 0) {
                                    channelNumber = getChannelNumber(sectionName as keyof typeof mixerChannels, channelIndex);
                                  }
                                }

                                return (
                                  <div key={channelId} className={`flex items-center gap-3 p-3 rounded border ${sectionName === 'drums' ? 'bg-yellow-50 border-yellow-200' :
                                    sectionName === 'bass' ? 'bg-blue-50 border-blue-200' :
                                      sectionName === 'guitar' ? 'bg-green-50 border-green-200' :
                                        sectionName === 'keyboards' ? 'bg-purple-50 border-purple-200' :
                                          sectionName === 'vocals' ? 'bg-pink-50 border-pink-200' :
                                            'bg-orange-50 border-orange-200'
                                    }`}>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="font-mono text-sm font-semibold">Ch {channelNumber}</span>
                                        <span className="text-sm font-medium">{mixData.channelName}</span>
                                        <Badge variant="outline" className="text-xs capitalize">
                                          {sectionName}
                                        </Badge>
                                      </div>
                                    </div>

                                    {/* Volume Control */}
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-muted-foreground w-8">Vol:</span>
                                      <Input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={mixData.volume || 70}
                                        onChange={(e) => {
                                          const currentMix = bandMember.monitorMix || {};
                                          const updatedMix = {
                                            ...currentMix,
                                            [channelId]: {
                                              ...mixData,
                                              volume: parseInt(e.target.value)
                                            }
                                          };
                                          updateBandMember(bandMember.id, { monitorMix: updatedMix });
                                        }}
                                        className="w-20 h-6"
                                      />
                                      <span className="text-sm font-medium w-8 text-center">{mixData.volume || 70}</span>
                                    </div>

                                    {/* Remove Channel */}
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        const currentMix = bandMember.monitorMix || {};
                                        const updatedMix = { ...currentMix };
                                        delete updatedMix[channelId];
                                        updateBandMember(bandMember.id, { monitorMix: updatedMix });
                                      }}
                                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  </div>
                                );
                              })}

                            {Object.keys(bandMember.monitorMix || {}).filter(channelId => bandMember.monitorMix?.[channelId]?.selected).length === 0 && (
                              <div className="text-center py-6 text-muted-foreground">
                                <Monitor className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No channels added to monitor mix yet</p>
                                <p className="text-xs">Use the dropdown above to add channels</p>
                              </div>
                            )}
                          </div>

                          {/* Overall Monitor Level */}
                          <div className="pt-3 border-t">
                            <div className="flex items-center justify-between">
                              <Label className="text-sm font-medium">Overall Monitor Level</Label>
                              <div className="flex items-center gap-2">
                                <Input
                                  type="range"
                                  min="0"
                                  max="100"
                                  value={bandMember.overallMonitorLevel || 75}
                                  onChange={(e) => {
                                    updateBandMember(bandMember.id, { overallMonitorLevel: parseInt(e.target.value) });
                                  }}
                                  className="w-24 h-6"
                                />
                                <span className="text-sm font-mono w-12 text-center">
                                  {bandMember.overallMonitorLevel || 75}%
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                {/* No Band Members Message */}
                {bandMembers.filter(member =>
                  member.talentType !== 'Professional' &&
                  member.talentType !== 'Management' &&
                  member.talentType !== 'Admin' &&
                  member.talentType !== 'Superadmin' &&
                  member.talentType !== 'Fan'
                ).length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Monitor className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="font-medium">No Band Members for Monitor Mixing</p>
                      <p className="text-sm">Assign band members to the booking to configure their monitor mixes</p>
                    </div>
                  )}
              </div>
            </CardContent>
          </Card>

          {/* MERGED: Monitor Requirements - Now part of Equipment Request section above */}
        </TabsContent>



        {/* Enhanced Professional Setlist - UPGRADED VERSION */}
        <TabsContent value="schedule" className="space-y-4 lg:space-y-6 animate-fade-in-up mobile-container">
          <EnhancedSetlistSection
            bookingId={bookingId}
            assignedTalent={finalAssignedMusicians.map((member: any) => ({
              id: member.userId,
              name: member.fullName || member.stageName || 'Band Member',
              role: member.selectedTalent || member.assignedRole || 'Performer',
              instruments: member.selectedTalent ? [member.selectedTalent] : []
            }))}
            eventDetails={{
              eventName: `Booking ${bookingId} Performance`,
              eventType: 'Live Performance'
            }}
            onSave={(setlistData) => {
              console.log('✅ SETLIST SAVED:', setlistData);
              toast({
                title: "Setlist Saved",
                description: "Performance setlist saved to technical rider"
              });
            }}
          />


        </TabsContent>

        {/* Hospitality & Dressing Rooms Tab */}
        <TabsContent value="hospitality" className="space-y-4 lg:space-y-6 animate-fade-in-up mobile-container">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Hospitality and Dressing Rooms
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Professional hospitality requirements for artist and band
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Individual Band Member Hospitality Requirements */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Individual Band Member Requirements</h3>
                  <Badge variant="outline" className="bg-blue-50">
                    {bandMembers.filter(m => m.membership === 'BAND').length} Band Members
                  </Badge>
                </div>

                {bandMembers.filter(member => member.membership === 'BAND').map((member, index) => {
                  return <BandMemberHospitalitySection key={member.id} member={member} />;
                })}
              </div>

              {/* Technical Requirements Section */}
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Technical Requirements from Band Members
                  </h3>
                  <Badge variant="outline" className="bg-orange-50">
                    Individual Requirements
                  </Badge>
                </div>

                {bandMembers.filter(member => member.membership === 'BAND').map((member, index) => {
                  return <BandMemberTechnicalSection key={`tech-${member.id}`} member={member} />;
                })}
              </div>

              {/* Performance Requirements Section */}
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Performance Specifications from Band Members
                  </h3>
                  <Badge variant="outline" className="bg-green-50">
                    Individual Specifications
                  </Badge>
                </div>

                {bandMembers.filter(member => member.membership === 'BAND').map((member, index) => {
                  return <BandMemberPerformanceSection key={`perf-${member.id}`} member={member} />;
                })}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Editable Dressing Room Requirements */}
                <EditableDressingRoomSection bandMembers={bandMembers.filter(m => m.membership === 'BAND')} />

                {/* Editable Refreshment Requirements */}
                <EditableRefreshmentSection bandMembers={bandMembers.filter(m => m.membership === 'BAND')} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* End of Hospitality Tab */}
        <TabsContent value="end-placeholder" className="hidden">
          {/* This is just to close off the hospitality section properly */}
        </TabsContent>
      </Tabs>

      {/* Drum Kit Configuration Modal */}
      {currentDrummer && (
        <DrumKitConfigModal
          isOpen={showDrumKitModal}
          onClose={() => {
            setShowDrumKitModal(false);
            setCurrentDrummer(null);
          }}
          onConfirm={handleDrumKitConfig}
          performerName={currentDrummer.fullName || currentDrummer.stageName || 'Drummer'}
          performerId={currentDrummer.id}
          existingConfig={drumKitConfigs[currentDrummer.id]}
          userInstruments={currentDrummer.skillsAndInstruments || []}
        />
      )}
    </div>
  );
};

export default EnhancedTechnicalRider;
