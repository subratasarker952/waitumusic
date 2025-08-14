import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Download, Calendar, User, Music, MapPin, CheckCircle, Clock, Loader2, AlertCircle, Layout, Volume2, List } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import StagePlotDesigner from '@/components/stage-plot/StagePlotDesigner';
import MixerPatchList from '@/components/stage-plot/MixerPatchList';
import SetlistManager from '@/components/setlist/SetlistManager';
import EnhancedTechnicalRider from '@/components/technical-rider/EnhancedTechnicalRider';

interface ContractGeneratorProps {
  bookingId: number;
  contractType: 'booking_agreement' | 'performance_agreement' | 'technical_rider';
  onGenerated?: () => void;
}

interface BookingDetails {
  id: number;
  eventName: string;
  eventDate: string;
  venueName: string;
  venueAddress: string;
  totalBudget: string;
  finalPrice: string;
  primaryArtist: any;
  assignedMusicians: any[];
  booker: any;
  requirements: string;
}

interface TechnicalSpecs {
  artistSpecs: any[];
  musicianSpecs: any[];
  equipment: any[];
  stage: any[];
  lighting: any[];
  sound: any[];
}

export default function ContractGenerator({ bookingId, contractType, onGenerated }: ContractGeneratorProps) {
  const { toast } = useToast();
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [technicalSpecs, setTechnicalSpecs] = useState<TechnicalSpecs | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customClauses, setCustomClauses] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Technical rider specific state (matching TechnicalRiderDesigner exactly)
  const [assignedMusicians, setAssignedMusicians] = useState<any[]>([]);
  const [currentStagePlot, setCurrentStagePlot] = useState<any>(null);
  const [currentPatchList, setCurrentPatchList] = useState<any>(null);
  const [currentSetlist, setCurrentSetlist] = useState<any>(null);
  
  // Status tracking for saved/loaded templates (exactly like TechnicalRiderDesigner)
  const [stagePlotStatus, setStagePlotStatus] = useState<'idle' | 'saved' | 'loaded'>('idle');
  const [patchListStatus, setPatchListStatus] = useState<'idle' | 'saved' | 'loaded'>('idle');
  const [setlistStatus, setSetlistStatus] = useState<'idle' | 'saved' | 'loaded'>('idle');

  useEffect(() => {
    loadBookingDetails();
  }, [bookingId, contractType]);

  const loadBookingDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await apiRequest(`/api/bookings/${bookingId}`);
      console.log('Booking data received:', data);
        
        // Check if data has the expected properties
        if (data && typeof data === 'object' && data.id) {
          setBooking(data);
          
          // Load additional data for technical riders
          if (contractType === 'technical_rider') {
            await Promise.all([
              loadTechnicalSpecs(),
              loadAssignedMusicians()
            ]);
          }
        } else {
          console.error('Invalid booking data structure:', data);
          throw new Error('Invalid booking data received');
        }
    } catch (error) {
      console.error('Failed to load booking details:', error);
      setError('Failed to load booking details. Please try refreshing the page.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadTechnicalSpecs = async () => {
    try {
      const data = await apiRequest(`/api/bookings/${bookingId}/technical-specs`);
      setTechnicalSpecs(data);
    } catch (error) {
      console.log('Technical specs not available or unauthorized');
      // Don't throw error - technical specs are optional
    }
  };

  const loadAssignedMusicians = async () => {
    try {
      const musicians = await apiRequest(`/api/bookings/${bookingId}/assigned-talent`);
      console.log('Contract Generator - Assigned musicians:', musicians);
      
      if (musicians && Array.isArray(musicians)) {
        setAssignedMusicians(musicians.map((m: any) => ({
          id: m.userId || m.id,
          name: m.name || m.fullName,
          instruments: m.instruments || []
        })));
      } else {
        console.log('No assigned musicians found');
        setAssignedMusicians([]);
      }
    } catch (error) {
      console.error('Failed to load assigned musicians:', error);
      setAssignedMusicians([]);
    }
  };

  // Handler functions exactly like TechnicalRiderDesigner
  const handleStagePlotSave = (stagePlot: any) => {
    setCurrentStagePlot(stagePlot);
    setStagePlotStatus('saved');
    toast({
      title: "Stage Plot Saved",
      description: "Stage plot template saved successfully"
    });
  };
  
  const handleStagePlotLoad = (stagePlot: any) => {
    setCurrentStagePlot(stagePlot);
    setStagePlotStatus('loaded');
    toast({
      title: "Stage Plot Loaded",
      description: "Stage plot template loaded successfully"
    });
  };

  const handlePatchListSave = (patchList: any) => {
    setCurrentPatchList(patchList);
    setPatchListStatus('saved');
    toast({
      title: "Patch List Saved", 
      description: "Mixer patch list template saved successfully"
    });
  };
  
  const handlePatchListLoad = (patchList: any) => {
    setCurrentPatchList(patchList);
    setPatchListStatus('loaded');
    toast({
      title: "Patch List Loaded",
      description: "Mixer patch list template loaded successfully"
    });
  };

  const handleSetlistSave = (setlist: any) => {
    setCurrentSetlist(setlist);
    setSetlistStatus('saved');
    toast({
      title: "Setlist Saved",
      description: "Performance setlist saved successfully"
    });
  };

  const handleSetlistLoad = (setlist: any) => {
    setCurrentSetlist(setlist);
    setSetlistStatus('loaded');
    toast({
      title: "Setlist Loaded",
      description: "Setlist template loaded successfully"
    });
  };

  // New Enhanced Technical Rider handlers
  const handleTechnicalRiderSave = async (riderData: any) => {
    try {
      await apiRequest(`/api/bookings/${bookingId}/enhanced-technical-rider`, {
        method: 'POST',
        body: JSON.stringify(riderData)
      });
      toast({
        title: "Technical Rider Saved",
        description: "Enhanced technical rider saved successfully"
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save technical rider",
        variant: "destructive"
      });
    }
  };

  const handleTechnicalRiderLoad = async () => {
    try {
      const data = await apiRequest(`/api/bookings/${bookingId}/enhanced-technical-rider`);
      toast({
        title: "Technical Rider Loaded",
        description: "Enhanced technical rider loaded successfully"
      });
      return data;
    } catch (error) {
      console.log('No existing technical rider found');
      return null;
    }
  };

  // Progress simulation for contract generation
  const simulateProgress = async (duration: number, steps: string[]) => {
    const stepDuration = duration / steps.length;
    
    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(steps[i]);
      const targetProgress = ((i + 1) / steps.length) * 100;
      
      // Animate progress smoothly
      const startProgress = (i / steps.length) * 100;
      const progressDiff = targetProgress - startProgress;
      const animationDuration = stepDuration * 0.8; // 80% of step time for animation
      const frameTime = 50; // Update every 50ms
      const frames = animationDuration / frameTime;
      const progressPerFrame = progressDiff / frames;
      
      for (let frame = 0; frame < frames; frame++) {
        await new Promise(resolve => setTimeout(resolve, frameTime));
        setGenerationProgress(startProgress + (progressPerFrame * frame));
      }
      
      setGenerationProgress(targetProgress);
      
      // Brief pause before next step
      await new Promise(resolve => setTimeout(resolve, stepDuration * 0.2));
    }
  };

  const generateContract = async () => {
    try {
      setIsGenerating(true);
      setGenerationProgress(0);
      setCurrentStep('Initializing...');
      
      // For technical rider, use the enhanced generation with components
      if (contractType === 'technical_rider') {
        return await generateCompleteTechnicalRider();
      }
      
      const steps = [
        'Validating booking data...',
        'Processing contract template...',
        'Inserting contract details...',
        'Generating terms and clauses...',
        'Formatting document structure...',
        'Finalizing contract...'
      ];
      
      // Start progress animation
      const progressPromise = simulateProgress(3000, steps); // 3 seconds total
      
      // Prepare request body with technical rider specific data
      const requestBody: any = {
        contractType,
        customClauses,
        additionalNotes
      };
      
      // Use specific contract generation endpoints based on type
      let endpoint = '';
      if (contractType === 'booking_agreement') {
        endpoint = `/api/bookings/${bookingId}/generate-booking-contract`;
      } else if (contractType === 'performance_agreement') {
        endpoint = `/api/bookings/${bookingId}/generate-performance-contract`;
      } else {
        endpoint = `/api/bookings/${bookingId}/generate-contract`;
      }
      
      const result = await apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });

      // Wait for progress animation to complete
      await progressPromise;

      setCurrentStep('Complete!');
      setGenerationProgress(100);
      
      toast({
        title: "Contract Generated",
        description: `${getContractTitle()} has been successfully generated.`
      });
      onGenerated?.();
      
      // Brief pause to show completion
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Auto-download after generation
      downloadContract();
    } catch (error) {
      console.error('Generate contract error:', error);
      setCurrentStep('Error occurred');
      toast({
        title: "Generation Failed",
        description: "Failed to generate contract. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
      setCurrentStep('');
    }
  };

  // Enhanced technical rider generation with components (exactly like TechnicalRiderDesigner)
  const generateCompleteTechnicalRider = async () => {
    if (!currentStagePlot || !currentPatchList) {
      toast({
        title: "Missing Components",
        description: "Please save both stage plot and mixer patch list before generating technical rider",
        variant: "destructive"
      });
      setIsGenerating(false);
      return;
    }

    try {
      const steps = [
        'Validating technical components...',
        'Processing stage plot data...',
        'Integrating mixer patch list...',
        'Including setlist information...',
        'Generating comprehensive rider...',
        'Finalizing PDF document...'
      ];
      
      // Start progress animation
      const progressPromise = simulateProgress(4000, steps); // 4 seconds for technical rider

      const result = await apiRequest(`/api/bookings/${bookingId}/complete-technical-rider`, {
        method: 'POST',
        body: JSON.stringify({
          stagePlot: currentStagePlot,
          patchList: currentPatchList,
          setlist: currentSetlist,
          assignedMusicians,
          customClauses,
          additionalNotes
        })
      });

      // Wait for progress animation to complete
      await progressPromise;

      setCurrentStep('Complete!');
      setGenerationProgress(100);

      // Handle PDF download if result is a blob
      if (result instanceof Blob) {
        const url = URL.createObjectURL(result);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Complete_Technical_Rider_${booking?.primaryArtist?.stageName || 'Artist'}_${new Date().toISOString().split('T')[0]}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      }

      toast({
        title: "Technical Rider Generated",
        description: "Complete technical rider with stage plot and components downloaded successfully"
      });
      
      onGenerated?.();
    } catch (error) {
      console.error('Technical rider generation error:', error);
      setCurrentStep('Error occurred');
      toast({
        title: "Generation Failed",
        description: "Failed to generate complete technical rider",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
      setCurrentStep('');
    }
  };

  const downloadContract = async () => {
    try {
      setIsDownloading(true);
      // Use the appropriate endpoint based on contract type
      let endpoint = '';
      if (contractType === 'technical_rider') {
        endpoint = `/api/bookings/${bookingId}/technical-rider`;
      } else if (contractType === 'booking_agreement') {
        endpoint = `/api/bookings/${bookingId}/booking-agreement`;
      } else if (contractType === 'performance_agreement') {
        endpoint = `/api/bookings/${bookingId}/performance-engagement/${booking?.primaryArtist?.id || booking?.primaryArtist?.userId || '1'}`;
      } else {
        endpoint = `/api/bookings/${bookingId}/download-contract/${contractType}`;
      }
      
      const response = await apiRequest(endpoint);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        // Determine filename based on contract type
        let filename = `${contractType}_booking_${bookingId}.pdf`;
        if (contractType === 'technical_rider') {
          filename = `Technical_Rider_${booking?.primaryArtist?.stageName || 'Artist'}_${bookingId}.pdf`;
        } else if (contractType === 'booking_agreement') {
          filename = `Booking_Agreement_${booking?.primaryArtist?.stageName || 'Artist'}_${bookingId}.pdf`;
        } else if (contractType === 'performance_agreement') {
          filename = `Performance_Agreement_${booking?.primaryArtist?.stageName || 'Artist'}_${bookingId}.pdf`;
        }
        
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
        
        toast({
          title: "Download Complete",
          description: `${getContractTitle()} has been downloaded successfully.`
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download contract.",
        variant: "destructive"
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const getContractTitle = () => {
    switch (contractType) {
      case 'booking_agreement': return 'Booking Agreement';
      case 'performance_agreement': return 'Performance Agreement';
      case 'technical_rider': return 'Technical Rider';
      default: return 'Contract';
    }
  };

  const getContractDescription = () => {
    switch (contractType) {
      case 'booking_agreement': 
        return 'Legal agreement between booker and artist/management outlining event details, payment terms, and responsibilities.';
      case 'performance_agreement': 
        return 'Detailed agreement covering performance specifications, deliverables, and technical requirements.';
      case 'technical_rider': 
        return 'Technical specifications document with equipment, stage, lighting, and sound requirements auto-populated from user profiles.';
      default: return '';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            <p className="text-muted-foreground">Loading contract details...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center space-y-4">
            <p className="text-red-600">{error}</p>
            <Button onClick={loadBookingDetails} variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!booking) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">Booking details not found.</p>
            <Button onClick={loadBookingDetails} variant="outline">
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Contract Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>{getContractTitle()}</span>
            </div>
            <Badge variant="outline">Booking #{bookingId}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <p className="text-muted-foreground mb-2">{getContractDescription()}</p>
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Instructions:</h4>
              <ol className="text-sm text-blue-700 space-y-1">
                <li>1. Review the booking details below to ensure accuracy</li>
                <li>2. Add any custom clauses or special terms in the text area</li>
                <li>3. Include additional notes or requirements</li>
                <li>4. Click "Generate Contract" to create the document</li>
                <li>5. Once generated, use "Download" to save the PDF</li>
              </ol>
            </div>
          </div>
          
          {/* Booking Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Event Details</span>
              </div>
              <div className="ml-6 space-y-1">
                <p className="text-sm">{booking.eventName}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(booking.eventDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Venue</span>
              </div>
              <div className="ml-6 space-y-1">
                <p className="text-sm">{booking.venueName}</p>
                <p className="text-sm text-muted-foreground">{booking.venueAddress}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Music className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Primary Artist</span>
              </div>
              <div className="ml-6">
                <p className="text-sm">{booking.primaryArtist?.stageName}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Booker</span>
              </div>
              <div className="ml-6">
                <p className="text-sm">{booking.booker?.fullName || booking.booker?.guestName}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* COMPLETELY NEW ENHANCED TECHNICAL RIDER SYSTEM - OLD INTERFACE DESTROYED */}
      {contractType === 'technical_rider' && (
        <div className="space-y-6">
          <Alert className="border-green-200 bg-green-50 text-green-800">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              ✅ <strong>NEW ENHANCED TECHNICAL RIDER SYSTEM</strong> - The old jumbled interface has been completely destroyed and rebuilt with professional-grade functionality.
            </AlertDescription>
          </Alert>
          
          <EnhancedTechnicalRider
            bookingId={bookingId}
            assignedMusicians={assignedMusicians}
            eventDetails={{
              eventName: booking?.eventName || '',
              venueName: booking?.venueName || '',
              eventDate: booking?.eventDate || '',
              eventType: 'Performance',
              duration: 120
            }}
            canEdit={true}
            userRole="superadmin"
            onSave={handleTechnicalRiderSave}
            onLoad={handleTechnicalRiderLoad}
          />
        </div>
      )}



      {/* Progress Indicator */}
      {isGenerating && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-primary">Generating Contract</h4>
                  <p className="text-sm text-muted-foreground">{currentStep}</p>
                </div>
                <span className="text-sm font-medium text-primary">
                  {Math.round(generationProgress)}%
                </span>
              </div>
              
              <Progress 
                value={generationProgress} 
                className="w-full h-2"
              />
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Processing...</span>
                <span>Please wait while we generate your contract</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generation Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium">Generate Contract</h4>
              <p className="text-sm text-muted-foreground">
                This will create a PDF document with all the specified terms and requirements.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={generateContract} 
                disabled={isGenerating || isDownloading}
                className="flex-1"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Generate Contract
                  </>
                )}
              </Button>
              
              <Button 
                onClick={downloadContract} 
                variant="outline"
                disabled={isGenerating || isDownloading}
                className="flex-1"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}