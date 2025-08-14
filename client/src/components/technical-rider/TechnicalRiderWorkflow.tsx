import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  Settings, CheckCircle, Clock, AlertCircle, 
  Save, Download, ArrowRight, Wand2 
} from 'lucide-react';

// Import Enhanced Components
import Enhanced32PortMixer from '../modals/Enhanced32PortMixer';
import EnhancedSetlistManager from '../modals/EnhancedSetlistManager';

interface TechnicalRiderWorkflowProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: number;
  assignedTalent?: any[];
}

interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  component: string;
  data?: any;
}

export default function TechnicalRiderWorkflow({ 
  isOpen, 
  onClose, 
  bookingId, 
  assignedTalent = [] 
}: TechnicalRiderWorkflowProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [workflowData, setWorkflowData] = useState({
    stagePlot: [],
    monitorMixes: [],
    mixerChannels: [],
    setlist: [],
    integrationStatus: {}
  });

  const [componentStates, setComponentStates] = useState({
    stageDesigner: false,
    mixerConfig: false,
    setlistManager: false
  });

  // Fetch technical rider status
  const { data: technicalRiderStatus, refetch: refetchStatus } = useQuery({
    queryKey: ['/api/bookings', bookingId, 'technical-rider', 'status'],
    queryFn: async () => {
      const response = await apiRequest(`/api/bookings/${bookingId}/technical-rider/status`);
      return await response.json();
    },
    enabled: !!bookingId
  });

  // Workflow steps with interdependency
  const workflowSteps: WorkflowStep[] = [
    {
      id: 'stage-plot',
      name: 'Stage Plot Design',
      description: 'Design stage layout with movable icons and talent assignments',
      status: technicalRiderStatus?.componentsCompleted?.stagePlot ? 'completed' : 'pending',
      component: 'StagePlotDesigner'
    },
    {
      id: 'mixer-config',
      name: '32-Port Mixer Setup',
      description: 'Configure mixer channels with stage plot integration',
      status: technicalRiderStatus?.componentsCompleted?.mixerConfig ? 'completed' : 'pending',
      component: 'Enhanced32PortMixer'
    },
    {
      id: 'setlist-management',
      name: 'AI-Optimized Setlist',
      description: 'Create setlist with YouTube integration and chord charts',
      status: technicalRiderStatus?.componentsCompleted?.setlist ? 'completed' : 'pending',
      component: 'EnhancedSetlistManager'
    },
    {
      id: 'integration-review',
      name: 'Integration Review',
      description: 'Review all components and their interconnections',
      status: 'pending',
      component: 'IntegrationReview'
    }
  ];

  // Calculate overall progress
  const completedSteps = workflowSteps.filter(step => step.status === 'completed').length;
  const progressPercentage = (completedSteps / workflowSteps.length) * 100;

  const openComponent = (component: string) => {
    setComponentStates(prev => ({
      ...prev,
      [component]: true
    }));
  };

  const closeComponent = (component: string) => {
    setComponentStates(prev => ({
      ...prev,
      [component]: false
    }));
  };

  const handleStepComplete = async (stepId: string, data: any) => {
    setWorkflowData(prev => ({
      ...prev,
      [stepId]: data
    }));

    // Update step status
    const stepIndex = workflowSteps.findIndex(step => step.id === stepId);
    if (stepIndex !== -1) {
      workflowSteps[stepIndex].status = 'completed';
    }

    // Save step data to backend
    try {
      await apiRequest(`/api/bookings/${bookingId}/technical-rider/${stepId}`, {
        method: 'POST',
        body: JSON.stringify(data)
      });

      toast({
        title: "Step Completed",
        description: `${workflowSteps[stepIndex].name} saved successfully`
      });

      refetchStatus();
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save step data",
        variant: "destructive"
      });
    }
  };

  const saveCompleteRider = async () => {
    try {
      const response = await apiRequest(`/api/bookings/${bookingId}/technical-rider/complete`, {
        method: 'POST',
        body: JSON.stringify({
          ...workflowData,
          assignedTalent,
          completedAt: new Date().toISOString()
        })
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Technical Rider Complete",
          description: `Rider saved successfully - ID: ${result.technicalRiderId}`
        });
      }
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save complete technical rider",
        variant: "destructive"
      });
    }
  };

  const exportTechnicalRider = () => {
    const exportData = {
      booking_id: bookingId,
      workflow_data: workflowData,
      assigned_talent: assignedTalent,
      completion_status: {
        steps_completed: completedSteps,
        total_steps: workflowSteps.length,
        progress_percentage: progressPercentage
      },
      interconnections: technicalRiderStatus?.interconnections || {},
      export_timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `technical-rider-booking-${bookingId}-complete.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Technical Rider Exported",
      description: "Complete technical rider configuration exported"
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Complete Technical Rider Workflow
            <Badge variant="outline">Booking #{bookingId}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Workflow Progress</CardTitle>
              <div className="flex items-center gap-4">
                <Progress value={progressPercentage} className="flex-1" />
                <span className="text-sm font-medium">{completedSteps}/{workflowSteps.length} Complete</span>
              </div>
            </CardHeader>
          </Card>

          {/* Workflow Steps */}
          <Tabs value={workflowSteps[currentStep]?.id} onValueChange={(value) => {
            const stepIndex = workflowSteps.findIndex(step => step.id === value);
            if (stepIndex !== -1) setCurrentStep(stepIndex);
          }}>
            <TabsList className="grid w-full grid-cols-4">
              {workflowSteps.map((step, index) => (
                <TabsTrigger 
                  key={step.id} 
                  value={step.id}
                  className="flex items-center gap-2"
                >
                  {step.status === 'completed' ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : step.status === 'in_progress' ? (
                    <Clock className="h-4 w-4 text-yellow-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-gray-400" />
                  )}
                  <span className="hidden sm:inline">{step.name}</span>
                  <span className="sm:hidden">Step {index + 1}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Step 1: Stage Plot Design */}
            <TabsContent value="stage-plot" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Interactive Stage Plot Designer</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Design your stage layout with movable icons and talent assignments. 
                    Icons can be dragged and dropped to create the perfect stage configuration.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <Button 
                      onClick={() => openComponent('stageDesigner')}
                      className="flex-1"
                    >
                      <Wand2 className="w-4 h-4 mr-2" />
                      Open Stage Designer
                    </Button>
                    {workflowSteps[0].status === 'completed' && (
                      <Badge variant="outline" className="px-4 py-2">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Completed
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Step 2: Mixer Configuration */}
            <TabsContent value="mixer-config" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>32-Port Mixer Integration</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Configure your mixer channels with automatic stage plot integration. 
                    Talent assignments from stage plot auto-populate mixer channels.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <Button 
                      onClick={() => openComponent('mixerConfig')}
                      className="flex-1"
                      disabled={workflowSteps[0].status !== 'completed'}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Open Mixer Configuration
                    </Button>
                    {workflowSteps[1].status === 'completed' && (
                      <Badge variant="outline" className="px-4 py-2">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Completed
                      </Badge>
                    )}
                  </div>
                  {workflowSteps[0].status !== 'completed' && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Complete stage plot design first to enable mixer configuration
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Step 3: Setlist Management */}
            <TabsContent value="setlist-management" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Enhanced Setlist Manager</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Create setlists with YouTube integration, chord chart generation, and advanced optimization. 
                    Connect songs to stage plot and mixer for complete integration.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <Button 
                      onClick={() => openComponent('setlistManager')}
                      className="flex-1"
                      disabled={workflowSteps[1].status !== 'completed'}
                    >
                      <Wand2 className="w-4 h-4 mr-2" />
                      Open Setlist Manager
                    </Button>
                    {workflowSteps[2].status === 'completed' && (
                      <Badge variant="outline" className="px-4 py-2">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Completed
                      </Badge>
                    )}
                  </div>
                  {workflowSteps[1].status !== 'completed' && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Complete mixer configuration first to enable setlist management
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Step 4: Integration Review */}
            <TabsContent value="integration-review" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Integration Review & Export</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Review all components and their interconnections before finalizing the technical rider.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded">
                      <h4 className="font-medium mb-2">Stage Plot</h4>
                      <p className="text-sm text-muted-foreground">
                        {workflowData.stagePlot?.length || 0} stage items configured
                      </p>
                      {workflowSteps[0].status === 'completed' && (
                        <Badge variant="outline" className="mt-2">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Ready
                        </Badge>
                      )}
                    </div>
                    
                    <div className="p-4 border rounded">
                      <h4 className="font-medium mb-2">Mixer Config</h4>
                      <p className="text-sm text-muted-foreground">
                        {workflowData.mixerChannels?.length || 0}/32 channels configured
                      </p>
                      {workflowSteps[1].status === 'completed' && (
                        <Badge variant="outline" className="mt-2">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Ready
                        </Badge>
                      )}
                    </div>
                    
                    <div className="p-4 border rounded">
                      <h4 className="font-medium mb-2">Setlist</h4>
                      <p className="text-sm text-muted-foreground">
                        {workflowData.setlist?.length || 0} songs in setlist
                      </p>
                      {workflowSteps[2].status === 'completed' && (
                        <Badge variant="outline" className="mt-2">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Ready
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button 
                      onClick={saveCompleteRider}
                      className="flex-1"
                      disabled={completedSteps < 3}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Complete Technical Rider
                    </Button>
                    <Button 
                      onClick={exportTechnicalRider}
                      variant="outline"
                      disabled={completedSteps < 3}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
            >
              Previous Step
            </Button>
            <Button 
              onClick={() => setCurrentStep(Math.min(workflowSteps.length - 1, currentStep + 1))}
              disabled={currentStep === workflowSteps.length - 1}
            >
              Next Step
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Enhanced Component Modals */}

        <Enhanced32PortMixer
          isOpen={componentStates.mixerConfig}
          onClose={() => closeComponent('mixerConfig')}
          bookingId={bookingId}
          assignedTalent={assignedTalent}
          stagePlotData={workflowData.stagePlot}
          onSave={(mixerConfig: any) => {
            handleStepComplete('mixer-config', mixerConfig);
            closeComponent('mixerConfig');
          }}
        />

        <EnhancedSetlistManager
          isOpen={componentStates.setlistManager}
          onClose={() => closeComponent('setlistManager')}
          bookingId={bookingId}
          assignedTalent={assignedTalent}
          onSave={(data: any) => {
            handleStepComplete('setlist-management', data);
            closeComponent('setlistManager');
          }}
        />
      </DialogContent>
    </Dialog>
  );
}