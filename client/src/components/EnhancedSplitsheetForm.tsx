import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Plus, X, Users, Music, Upload, Search, UserCheck, UserPlus } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQuery } from "@tanstack/react-query";

interface Participant {
  id: string;
  assignedUserId?: number;
  name: string;
  email: string;
  address: string;
  phone?: string;
  ipiNumber?: string;
  proAffiliation?: string;
  nationalId?: string;
  dateOfBirth?: string;
  roles: Array<{
    type: 'songwriter' | 'melody_creator' | 'beat_music_composer' | 'recording_artist' | 'label_rep' | 'publisher' | 'studio_rep' | 'executive_producer';
    percentage: number;
    notes?: string;
    entryId?: string; // WM-SSA-[Document Shortname]-[ISRC]-[count]
  }>;
  hasSigned: boolean;
  signatureImageUrl?: string;
  signedAt?: string;
  accessToken?: string;
  existingUserFound?: boolean;
  newUserCreated?: boolean;
  tempPassword?: string;
}

interface EnhancedSplitsheetData {
  songTitle: string;
  isrc: string;
  workId?: string;
  upcEan?: string;
  agreementDate: string;
  participants: Participant[];
  basePrice: number;
  finalPrice: number;
  discountPercentage: number;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'free';
}

export function EnhancedSplitsheetForm() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Fetch service pricing from database
  const { data: servicePricing } = useQuery({
    queryKey: ['/api/service-pricing', 'Create Splitsheet'],
    queryFn: async () => {
      const response = await apiRequest('/api/service-pricing/Create Splitsheet');
      return response.json();
    }
  });

  const basePrice = servicePricing?.basePrice || 15.00;
  
  const [formData, setFormData] = useState<EnhancedSplitsheetData>({
    songTitle: '',
    isrc: '',
    workId: '',
    upcEan: '',
    agreementDate: new Date().toISOString().split('T')[0],
    participants: [],
    basePrice: 15.00, // Initial value, will be updated when service pricing loads
    finalPrice: 15.00,
    discountPercentage: 0.00,
    paymentStatus: 'pending'
  });

  // Update form data when service pricing is loaded
  React.useEffect(() => {
    if (servicePricing?.basePrice) {
      setFormData(prev => ({
        ...prev,
        basePrice: servicePricing.basePrice,
        finalPrice: servicePricing.basePrice
      }));
    }
  }, [servicePricing]);

  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [activeParticipantIndex, setActiveParticipantIndex] = useState<number | null>(null);

  // Search assignable talent users
  const { data: searchResults = [], isLoading: isSearching } = useQuery<any[]>({
    queryKey: ['/api/users/assignable-talent', searchQuery],
    enabled: searchQuery.length >= 3,
  });

  // Create enhanced splitsheet mutation
  const createSplitsheetMutation = useMutation({
    mutationFn: async (data: { splitsheetData: EnhancedSplitsheetData; audioFile: File | null }) => {
      const formData = new FormData();
      formData.append('splitsheetData', JSON.stringify(data.splitsheetData));
      if (data.audioFile) {
        formData.append('audioFile', data.audioFile);
      }

      const token = localStorage.getItem('token');
      const response = await fetch('/api/splitsheet-enhanced-create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create enhanced splitsheet');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Splitsheet Created Successfully!",
        description: `${data.notificationsSent} notifications sent. ${data.newUsersCreated} new platform accounts created. ${data.isrcGenerated ? 'ISRC code generated.' : ''}`,
        duration: 8000
      });
      
      // Reset form
      setFormData({
        songTitle: '',
        isrc: '',
        agreementDate: new Date().toISOString().split('T')[0],
        participants: [],
        basePrice: servicePricing?.basePrice || 15.00,
        finalPrice: servicePricing?.basePrice || 15.00,
        discountPercentage: 0.00,
        paymentStatus: 'pending'
      });
      setAudioFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error Creating Splitsheet",
        description: error.message,
        variant: "destructive",
        duration: 8000
      });
    }
  });

  // Add new participant
  const addParticipant = () => {
    const newParticipant: Participant = {
      id: `participant-${Date.now()}`,
      name: '',
      email: '',
      address: '',
      phone: '',
      ipiNumber: '',
      proAffiliation: '',
      nationalId: '',
      dateOfBirth: '',
      roles: [],
      hasSigned: false
    };

    setFormData(prev => ({
      ...prev,
      participants: [...prev.participants, newParticipant]
    }));
  };

  // Remove participant
  const removeParticipant = (index: number) => {
    setFormData(prev => ({
      ...prev,
      participants: prev.participants.filter((_, i) => i !== index)
    }));
  };

  // Update participant
  const updateParticipant = (index: number, field: keyof Participant, value: any) => {
    setFormData(prev => ({
      ...prev,
      participants: prev.participants.map((p, i) => 
        i === index ? { ...p, [field]: value } : p
      )
    }));
  };

  // Assign user to participant
  const assignUserToParticipant = (participantIndex: number, user: any) => {
    updateParticipant(participantIndex, 'assignedUserId', user.id);
    updateParticipant(participantIndex, 'name', user.fullName);
    updateParticipant(participantIndex, 'email', user.email);
    
    setShowUserSearch(false);
    setActiveParticipantIndex(null);
    setSearchQuery('');

    toast({
      title: "User Assigned",
      description: `${user.fullName} assigned to this participant. Profile data will be auto-populated.`,
      duration: 3000
    });
  };

  // Add role to participant with entry ID
  const addRoleToParticipant = (participantIndex: number) => {
    const participant = formData.participants[participantIndex];
    const newRole = {
      type: 'songwriter' as const,
      percentage: 0,
      notes: '',
      entryId: generateEntryId('songwriter')
    };

    updateParticipant(participantIndex, 'roles', [...participant.roles, newRole]);
  };

  // Remove role from participant
  const removeRoleFromParticipant = (participantIndex: number, roleIndex: number) => {
    const participant = formData.participants[participantIndex];
    const updatedRoles = participant.roles.filter((_, i) => i !== roleIndex);
    updateParticipant(participantIndex, 'roles', updatedRoles);
  };

  // Update role with duplicate checking
  const updateRole = (participantIndex: number, roleIndex: number, field: string, value: any) => {
    const participant = formData.participants[participantIndex];
    
    // If changing role type, check for duplicates
    if (field === 'type') {
      const existingRoleOfType = participant.roles.find((role, i) => i !== roleIndex && role.type === value);
      if (existingRoleOfType) {
        toast({
          title: "Duplicate Role Error",
          description: "This participant already has this role assigned.",
          variant: "destructive"
        });
        return;
      }
    }

    const updatedRoles = participant.roles.map((role, i) => 
      i === roleIndex ? { 
        ...role, 
        [field]: value,
        entryId: field === 'type' ? generateEntryId(value) : role.entryId
      } : role
    );
    updateParticipant(participantIndex, 'roles', updatedRoles);
  };

  // Generate entry ID: WM-SSA-[Role Shortname]-[ISRC]-[count]
  const generateEntryId = (roleType: string) => {
    const roleShortnames: Record<string, string> = {
      'songwriter': 'WC',
      'melody_creator': 'MC', 
      'beat_music_composer': 'BC',
      'recording_artist': 'RA',
      'label_rep': 'LD',
      'publisher': 'PD',
      'studio_rep': 'SD',
      'executive_producer': 'EP'
    };
    
    const roleCode = roleShortnames[roleType] || 'XX';
    const isrcCode = formData.isrc || 'PENDING';
    const count = formData.participants.reduce((total, p) => 
      total + (p.roles?.filter(r => r.type === roleType).length || 0), 0) + 1;
    return `WM-SSA-${roleCode}-${isrcCode}-${count.toString().padStart(3, '0')}`;
  };

  // Calculate percentage totals for validation
  const calculatePercentageTotals = () => {
    let songwriting = 0;
    let melody = 0;
    let beatProduction = 0;
    let publishing = 0;
    let executiveProducer = 0;

    formData.participants.forEach(participant => {
      participant.roles?.forEach(role => {
        switch (role.type) {
          case 'songwriter':
            songwriting += role.percentage || 0;
            break;
          case 'melody_creator':
            melody += role.percentage || 0;
            break;
          case 'beat_music_composer':
            beatProduction += role.percentage || 0;
            break;
          case 'publisher':
            publishing += role.percentage || 0;
            break;
          case 'executive_producer':
            executiveProducer += role.percentage || 0;
            break;
          // recording_artist, label_rep, studio_rep have 0% by default
        }
      });
    });

    return { songwriting, melody, beatProduction, publishing, executiveProducer };
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.includes('audio')) {
        toast({
          title: "Invalid File Type",
          description: "Please select a WAV or MP3 audio file.",
          variant: "destructive"
        });
        return;
      }

      // Validate file size (50MB limit)
      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please select a file smaller than 50MB.",
          variant: "destructive"
        });
        return;
      }

      setAudioFile(file);
      toast({
        title: "Audio File Added",
        description: `${file.name} ready for upload. ISRC code will be generated automatically.`,
        duration: 4000
      });
    }
  };

  // Submit form
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    // Validate form data
    if (!formData.songTitle.trim()) {
      toast({
        title: "Validation Error",
        description: "Song title is required.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.isrc.trim()) {
      toast({
        title: "Validation Error", 
        description: "ISRC is required.",
        variant: "destructive"
      });
      return;
    }

    // Validate ISRC format: DM-A0D-YY-NN-XXX (12 characters without hyphens)
    const cleanISRC = formData.isrc.replace(/-/g, '');
    if (cleanISRC.length !== 11) {
      toast({
        title: "ISRC Format Error",
        description: `ISRC must be exactly 12 characters (excluding hyphens). Current: ${cleanISRC.length}/12 characters.`,
        variant: "destructive"
      });
      return;
    }

    const isrcPattern = /^DM-A0D-\d{2}-\d{2}-\d{3}$/;
    if (!isrcPattern.test(formData.isrc)) {
      toast({
        title: "ISRC Format Error",
        description: "ISRC format must be: DM-A0D-YY-NN-XXX",
        variant: "destructive"
      });
      return;
    }

    if (formData.participants.length === 0) {
      toast({
        title: "Validation Error",
        description: "At least one participant is required.",
        variant: "destructive"
      });
      return;
    }

    // Validate participant data
    const invalidParticipants = formData.participants.filter(p => 
      !p.name.trim() || !p.email.trim() || !p.address.trim()
    );

    if (invalidParticipants.length > 0) {
      toast({
        title: "Validation Error",
        description: "All participants must have name, email, and address.",
        variant: "destructive"
      });
      return;
    }

    // Validate percentages
    const totals = calculatePercentageTotals();
    if (totals.songwriting > 50) {
      toast({
        title: "Percentage Validation Error",
        description: "Songwriting percentages cannot exceed 50%.",
        variant: "destructive"
      });
      return;
    }

    if (totals.melody > 25) {
      toast({
        title: "Percentage Validation Error",
        description: "Melody creation percentages cannot exceed 25%.",
        variant: "destructive"
      });
      return;
    }

    if (totals.beatProduction > 25) {
      toast({
        title: "Percentage Validation Error",
        description: "Beat/Production percentages cannot exceed 25%.",
        variant: "destructive"
      });
      return;
    }

    // Create enhanced splitsheet
    createSplitsheetMutation.mutate({
      splitsheetData: formData,
      audioFile
    });
  };

  const percentageTotals = calculatePercentageTotals();
  
  // Calculate weighted percentages for the work
  const calculateWeightedPercentages = () => {
    const totals = calculatePercentageTotals();
    
    // Composition side percentages (weighted)
    const songwritingWeighted = (totals.songwriting / 100) * 50; // 50% of composition
    const melodyWeighted = (totals.melody / 100) * 25; // 25% of composition  
    const beatCompositionWeighted = (totals.beatProduction / 100) * 25; // 25% of composition
    const totalCompositionPercent = songwritingWeighted + melodyWeighted + beatCompositionWeighted;
    
    // Publishing side (out of 100% that represents the publishing portion)  
    const publishingPercent = totals.publishing; // Out of 100%
    const publishingWeighted = (publishingPercent / 100) * 50; // Publishing side contributes 50% to work
    
    // Executive Producer (must total 100% if entries exist, otherwise Wai'tuMusic defaults to 100%)
    const hasExecutiveProducers = totals.executiveProducer > 0;
    const executiveProducerPercent = hasExecutiveProducers ? totals.executiveProducer : 100; // Wai'tuMusic default
    
    return {
      // Composition side
      songwritingWeighted,
      melodyWeighted,
      beatCompositionWeighted,
      totalCompositionPercent,
      
      // Publishing side  
      publishingPercent,
      publishingWeighted,
      
      // Executive Producer
      executiveProducerPercent,
      hasExecutiveProducers,
      
      // Total work percentage (Composition + Publishing should equal 100%)
      totalWorkPercent: totalCompositionPercent + publishingWeighted
    };
  };
  
  const weightedTotals = calculateWeightedPercentages();
  
  // Generate reference number preview for display
  const generateSplitsheetReference = (isrc: string): string => {
    if (!isrc) return 'WM-SS-PENDING';
    
    const now = new Date();
    const dateStr = now.getFullYear().toString() + 
                   (now.getMonth() + 1).toString().padStart(2, '0') + 
                   now.getDate().toString().padStart(2, '0');
    
    // Extract DMA0D (Country Code + Registrant) from ISRC
    const isrcClean = isrc.replace(/-/g, '');
    const countryCode = isrcClean.substring(0, 2); // DM
    const registrant = isrcClean.substring(2, 5); // A0D
    const isrcSuffix = (countryCode + registrant).toUpperCase(); // DMA0D
    
    return `WM-SS-${isrcSuffix}-${dateStr}-001`;
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Enhanced Splitsheet Creation
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Create professional splitsheets with user assignment, automatic data population, and notification system
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Song Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="h-5 w-5" />
              Work & Song Information
            </CardTitle>
            <CardDescription>
              Work registration details and song information. A work represents a fully coded song registered with a PRO.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="songTitle">Song Title *</Label>
                <Input
                  id="songTitle"
                  value={formData.songTitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, songTitle: e.target.value }))}
                  placeholder="Enter song title"
                  required
                />
              </div>
              <div>
                <Label htmlFor="isrc">ISRC *</Label>
                <Input
                  id="isrc"
                  value={formData.isrc}
                  onChange={(e) => setFormData(prev => ({ ...prev, isrc: e.target.value.toUpperCase() }))}
                  placeholder="DM-A0D-YY-NN-XXX"
                  required
                  className={`${
                    formData.isrc && (formData.isrc.replace(/-/g, '').length !== 11 || !/^DM-A0D-\d{2}-\d{2}-\d{3}$/.test(formData.isrc))
                      ? 'border-red-500 focus:border-red-500' 
                      : formData.isrc ? 'border-green-500 focus:border-green-500' : ''
                  }`}
                />
                {formData.isrc && (
                  <p className={`text-xs mt-1 ${
                    formData.isrc.replace(/-/g, '').length !== 11 || !/^DM-A0D-\d{2}-\d{2}-\d{3}$/.test(formData.isrc)
                      ? 'text-red-500' 
                      : 'text-green-500'
                  }`}>
                    Format: DM-A0D-YY-NN-XXX ({formData.isrc.replace(/-/g, '').length}/12 characters)
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="workId">Work ID (PRO-issued)</Label>
                <Input
                  id="workId"
                  value={formData.workId || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, workId: e.target.value }))}
                  placeholder="Enter PRO Work ID"
                />
                <p className="text-xs text-gray-500 mt-1">Issued by ASCAP, BMI, SESAC, etc.</p>
              </div>
              
              <div>
                <Label htmlFor="upcEan">UPC/EAN Code</Label>
                <Input
                  id="upcEan"
                  value={formData.upcEan || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, upcEan: e.target.value }))}
                  placeholder="Enter UPC/EAN from distributor"
                />
                <p className="text-xs text-gray-500 mt-1">Provided by music distributor</p>
              </div>
            </div>
            
            <div>
              <Label htmlFor="agreementDate">Agreement Date</Label>
              <Input
                id="agreementDate"
                type="date"
                value={formData.agreementDate}
                onChange={(e) => setFormData(prev => ({ ...prev, agreementDate: e.target.value }))}
              />
            </div>
            
            {/* Reference Number Display */}
            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg border border-emerald-200 dark:border-emerald-800">
              <div className="text-sm font-mono text-emerald-800 dark:text-emerald-200">
                Reference: {generateSplitsheetReference(formData.isrc)}
              </div>
              <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                Wai'tuMusic Splitsheet Agreement - Work Registration - {formData.isrc ? 'ISRC Validated' : 'Awaiting ISRC'}
              </div>
              {formData.workId && (
                <div className="text-xs text-emerald-600 dark:text-emerald-400">
                  Work ID: {formData.workId} | UPC/EAN: {formData.upcEan || 'Not provided'}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Audio File Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Audio File Upload (Optional)
            </CardTitle>
            <CardDescription>
              Upload audio file for automatic ISRC generation and metadata embedding
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".wav,.mp3,audio/*"
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                {audioFile ? `Selected: ${audioFile.name}` : 'Select Audio File (WAV/MP3)'}
              </Button>
              {audioFile && (
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  <p>File: {audioFile.name}</p>
                  <p>Size: {(audioFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                  <p>Type: {audioFile.type}</p>
                  <Badge variant="secondary">ISRC will be auto-generated</Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Participants Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Participants Management
            </CardTitle>
            <CardDescription>
              Assign platform users or manually enter participant information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* User Search */}
            {showUserSearch && activeParticipantIndex !== null && (
              <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Search Platform Users</Label>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setShowUserSearch(false);
                        setActiveParticipantIndex(null);
                        setSearchQuery('');
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Search by name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1"
                    />
                    <Search className="h-4 w-4 text-gray-400 self-center" />
                  </div>
                  {isSearching && <p className="text-sm text-gray-500">Searching...</p>}
                  {searchResults.length > 0 && (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {searchResults.map((user: any) => (
                        <div
                          key={user.id}
                          className="p-2 border rounded cursor-pointer hover:bg-white dark:hover:bg-gray-700"
                          onClick={() => assignUserToParticipant(activeParticipantIndex, user)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{user.fullName}</p>
                              <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                            <Badge variant="outline">Role ID: {user.roleId}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Work Analysis & Percentage Summary */}
            <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h4 className="text-lg font-semibold text-center">Work Analysis: Composition & Publishing Sides</h4>
              
              {/* Composition Side */}
              <div className="space-y-3">
                <h5 className="text-md font-semibold text-center text-blue-700 dark:text-blue-300">Composition Side</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Songwriting (50% weight)</p>
                    <p className={`text-lg font-bold ${percentageTotals.songwriting > 100 ? 'text-red-600' : 'text-green-600'}`}>
                      {percentageTotals.songwriting}% / 100%
                    </p>
                    <p className="text-xs text-gray-500">= {weightedTotals.songwritingWeighted.toFixed(1)}% of work</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Melody Creation (25% weight)</p>
                    <p className={`text-lg font-bold ${percentageTotals.melody > 100 ? 'text-red-600' : 'text-green-600'}`}>
                      {percentageTotals.melody}% / 100%
                    </p>
                    <p className="text-xs text-gray-500">= {weightedTotals.melodyWeighted.toFixed(1)}% of work</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Beat/Music Composition (25% weight)</p>
                    <p className={`text-lg font-bold ${percentageTotals.beatProduction > 100 ? 'text-red-600' : 'text-green-600'}`}>
                      {percentageTotals.beatProduction}% / 100%
                    </p>
                    <p className="text-xs text-gray-500">= {weightedTotals.beatCompositionWeighted.toFixed(1)}% of work</p>
                  </div>
                </div>
              </div>

              {/* Publishing Side */}
              <div className="space-y-3">
                <h5 className="text-md font-semibold text-center text-emerald-700 dark:text-emerald-300">Publishing Side</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Publishing</p>
                    <p className={`text-lg font-bold ${percentageTotals.publishing > 100 ? 'text-red-600' : 'text-green-600'}`}>
                      {percentageTotals.publishing}% / 100%
                    </p>
                    <p className="text-xs text-gray-500">= {weightedTotals.publishingWeighted.toFixed(1)}% of work</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Executive Producer</p>
                    <p className={`text-lg font-bold ${weightedTotals.executiveProducerPercent > 100 ? 'text-red-600' : 'text-green-600'}`}>
                      {weightedTotals.executiveProducerPercent}% / 100%
                    </p>
                    <p className="text-xs text-gray-500">
                      {weightedTotals.hasExecutiveProducers ? "Manual entries" : "Wai'tuMusic default"}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Total Work Percentage */}
              <div className="text-center p-3 bg-white dark:bg-gray-900 rounded border">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Work Share Registration (Composition + Publishing)</p>
                <p className={`text-xl font-bold ${Math.abs(weightedTotals.totalWorkPercent - 100) > 0.1 ? 'text-red-600' : 'text-green-600'}`}>
                  {weightedTotals.totalWorkPercent.toFixed(1)}% / 100%
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {Math.abs(weightedTotals.totalWorkPercent - 100) < 0.1 
                    ? "✓ Perfect work split! Ready to proceed." 
                    : "⚠ Total work share registration must equal 100% to proceed."
                  }
                </p>
              </div>
            </div>

            {/* Participants List */}
            {formData.participants.map((participant, participantIndex) => (
              <div key={participant.id} className="p-4 border rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Participant {participantIndex + 1}</h3>
                  <div className="flex gap-2">
                    {participant.assignedUserId ? (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <UserCheck className="h-3 w-3" />
                        Platform User
                      </Badge>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setActiveParticipantIndex(participantIndex);
                          setShowUserSearch(true);
                        }}
                      >
                        <UserPlus className="h-4 w-4 mr-1" />
                        Assign User
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeParticipant(participantIndex)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Full Name *</Label>
                    <Input
                      value={participant.name}
                      onChange={(e) => updateParticipant(participantIndex, 'name', e.target.value)}
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                  <div>
                    <Label>Email Address *</Label>
                    <Input
                      type="email"
                      value={participant.email}
                      onChange={(e) => updateParticipant(participantIndex, 'email', e.target.value)}
                      placeholder="Enter email address"
                      required
                    />
                  </div>
                  <div>
                    <Label>Address *</Label>
                    <Textarea
                      value={participant.address}
                      onChange={(e) => updateParticipant(participantIndex, 'address', e.target.value)}
                      placeholder="Enter full address"
                      required
                    />
                  </div>
                  <div>
                    <Label>Phone Number</Label>
                    <Input
                      value={participant.phone || ''}
                      onChange={(e) => updateParticipant(participantIndex, 'phone', e.target.value)}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <Label>IPI Number</Label>
                    <Input
                      value={participant.ipiNumber || ''}
                      onChange={(e) => updateParticipant(participantIndex, 'ipiNumber', e.target.value)}
                      placeholder="Enter IPI number"
                    />
                  </div>
                  <div>
                    <Label>PRO Affiliation</Label>
                    <Input
                      value={participant.proAffiliation || ''}
                      onChange={(e) => updateParticipant(participantIndex, 'proAffiliation', e.target.value)}
                      placeholder="e.g., ASCAP, BMI, SESAC"
                    />
                  </div>
                </div>

                {/* Roles Management */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Roles & Percentages</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addRoleToParticipant(participantIndex)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Role
                    </Button>
                  </div>

                  {participant.roles?.map((role, roleIndex) => (
                    <div key={roleIndex} className="space-y-2">
                      {/* Role Entry Label */}
                      <div className="text-xs text-gray-500 font-mono bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded">
                        Entry ID: {role.entryId || generateEntryId(role.type)}
                      </div>
                      
                      <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded">
                        <Select
                          value={role.type}
                          onValueChange={(value) => updateRole(participantIndex, roleIndex, 'type', value)}
                        >
                          <SelectTrigger className="w-48">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="songwriter">Songwriter (50% weighted)</SelectItem>
                            <SelectItem value="melody_creator">Melody Creator (25% weighted)</SelectItem>
                            <SelectItem value="beat_music_composer">Beat/Music Composer (25% weighted)</SelectItem>
                            <SelectItem value="recording_artist">Recording Artist</SelectItem>
                            <SelectItem value="label_rep">Label Representative</SelectItem>
                            <SelectItem value="publisher">Publisher</SelectItem>
                            <SelectItem value="studio_rep">Studio Representative</SelectItem>
                            <SelectItem value="executive_producer">Executive Producer</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={role.percentage || 0}
                          onChange={(e) => updateRole(participantIndex, roleIndex, 'percentage', parseFloat(e.target.value) || 0)}
                          className="w-20"
                          placeholder="%"
                          readOnly={['recording_artist', 'label_rep', 'studio_rep'].includes(role.type)}
                          disabled={['recording_artist', 'label_rep', 'studio_rep'].includes(role.type)}
                        />
                        <span className="text-sm text-gray-500">%</span>
                        <Input
                          value={role.notes || ''}
                          onChange={(e) => updateRole(participantIndex, roleIndex, 'notes', e.target.value)}
                          placeholder="Notes (optional)"
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeRoleFromParticipant(participantIndex, roleIndex)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={addParticipant}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Participant
            </Button>
          </CardContent>
        </Card>

        {/* Service Information */}
        <Card>
          <CardHeader>
            <CardTitle>Service Pricing</CardTitle>
            <CardDescription>
              Enhanced splitsheet service pricing and payment information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Base Price</Label>
                <div className="text-2xl font-bold text-green-600">$15.00</div>
                <p className="text-sm text-gray-500">Per authentic splitsheet</p>
              </div>
              <div>
                <Label>Discount</Label>
                <div className="text-lg font-medium">
                  {formData.discountPercentage > 0 ? `${formData.discountPercentage}% off` : 'No discount'}
                </div>
                <p className="text-sm text-gray-500">Management tier benefits</p>
              </div>
              <div>
                <Label>Final Price</Label>
                <div className="text-2xl font-bold text-emerald-600">${formData.finalPrice.toFixed(2)}</div>
                <p className="text-sm text-gray-500">Total due</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            size="lg"
            disabled={createSplitsheetMutation.isPending}
            className="min-w-48"
          >
            {createSplitsheetMutation.isPending 
              ? "Creating Splitsheet..." 
              : `Create Splitsheet - $${formData.finalPrice.toFixed(2)}`
            }
          </Button>
        </div>
      </form>
    </div>
  );
}