import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Calendar, Clock, Users, FileText, CreditCard, CheckCircle, 
  AlertCircle, Download, Signature, Music, User
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import UnifiedTechnicalRiderSystem from '@/components/technical-rider/UnifiedTechnicalRiderSystem';

interface BookingWorkflowProps {
  bookingId: number;
  onStatusChange?: (status: string) => void;
}

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  icon: React.ReactNode;
  action?: () => void;
}

interface BookingData {
  id: number;
  eventName: string;
  eventDate: string;
  status: string;
  primaryArtist: any;
  assignedMusicians: any[];
  contracts: any[];
  payments: any[];
  signatures: any[];
}

export default function BookingWorkflow({ bookingId, onStatusChange }: BookingWorkflowProps) {
  const { toast } = useToast();
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [showTechnicalRider, setShowTechnicalRider] = useState(false);

  const getStepDescription = (id: string) => {
    switch (id) {
      case 'approval':
        return 'Click the action button to approve this booking. Once approved, you can assign musicians.';
      case 'assignment':
        return 'After approval, click to open the musician assignment interface to select performers.';
      case 'technical_rider':
        return 'Generates a technical specifications document using artist and musician profile data.';
      case 'contracts':
        return 'Creates Booking Agreement and Performance Agreement documents with all booking details.';
      case 'signatures':
        return 'Initiates the digital signature collection process for all parties involved.';
      case 'payment':
        return 'Processes the final payment for the booking after all signatures are collected.';
      case 'receipt':
        return 'Generates final receipt and completion documents for the booking.';
      default:
        return '';
    }
  };

  useEffect(() => {
    loadBookingData();
  }, [bookingId]);

  const loadBookingData = async () => {
    try {
      const response = await apiRequest(`/api/bookings/${bookingId}/workflow`);
      if (response.ok) {
        const data = await response.json();
        setBooking(data);
        updateWorkflowSteps(data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load booking workflow data.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateWorkflowSteps = (bookingData: BookingData) => {
    const steps: WorkflowStep[] = [
      {
        id: 'approval',
        title: 'Admin Approval',
        description: 'Booking reviewed and approved by administrator',
        status: bookingData.status === 'pending' ? 'pending' : 'completed',
        icon: <CheckCircle className="h-5 w-5" />,
        action: bookingData.status === 'pending' ? () => approveBooking() : undefined
      },
      {
        id: 'assignment',
        title: 'Musician Assignment',
        description: 'Assign managed musicians to the booking',
        status: bookingData.assignedMusicians?.length > 0 ? 'completed' : 
                bookingData.status === 'approved' ? 'in_progress' : 'pending',
        icon: <Users className="h-5 w-5" />,
        action: bookingData.status === 'approved' ? () => assignMusicians() : undefined
      },
      {
        id: 'technical_rider',
        title: 'Technical Rider Creation',
        description: 'Auto-generate technical specifications from profiles',
        status: bookingData.contracts?.some(c => c.documentType === 'technical_rider') ? 'completed' :
                bookingData.assignedMusicians?.length > 0 ? 'in_progress' : 'pending',
        icon: <FileText className="h-5 w-5" />,
        action: bookingData.assignedMusicians?.length > 0 ? () => openTechnicalRiderDesigner() : undefined
      },
      {
        id: 'contracts',
        title: 'Contract Generation',
        description: 'Generate artist-specific Booking Agreement',
        status: bookingData.contracts?.length >= 2 ? 'completed' :
                bookingData.contracts?.some(c => c.documentType === 'technical_rider') ? 'in_progress' : 'pending',
        icon: <FileText className="h-5 w-5" />,
        action: bookingData.contracts?.some(c => c.documentType === 'technical_rider') ? () => generateBookingAgreement() : undefined
      },
      {
        id: 'signatures',
        title: 'Signature Collection',
        description: 'Collect signatures from all parties',
        status: bookingData.signatures?.length >= 3 ? 'completed' :
                bookingData.contracts?.length >= 3 ? 'in_progress' : 'pending',
        icon: <Signature className="h-5 w-5" />,
        action: bookingData.contracts?.length >= 3 ? () => initiateSignatures() : undefined
      },
      {
        id: 'payment',
        title: 'Payment Processing',
        description: 'Process final payment for the booking',
        status: bookingData.payments?.some(p => p.paymentStatus === 'completed') ? 'completed' :
                bookingData.signatures?.length >= 3 ? 'in_progress' : 'pending',
        icon: <CreditCard className="h-5 w-5" />,
        action: bookingData.signatures?.length >= 3 ? () => processPayment() : undefined
      },
      {
        id: 'receipt',
        title: 'Receipt Generation',
        description: 'Generate final receipt and completion documents',
        status: bookingData.payments?.some(p => p.paymentStatus === 'completed') ? 'completed' : 'pending',
        icon: <Download className="h-5 w-5" />,
        action: bookingData.payments?.some(p => p.paymentStatus === 'completed') ? () => generateReceipt() : undefined
      }
    ];

    setWorkflowSteps(steps);
  };

  const approveBooking = async () => {
    try {
      const response = await apiRequest(`/api/bookings/${bookingId}/approve`, {
        method: 'POST'
      });
      
      if (response.ok) {
        toast({
          title: "Booking Approved",
          description: "The booking has been approved and is ready for musician assignment."
        });
        loadBookingData();
        onStatusChange?.('approved');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve booking.",
        variant: "destructive"
      });
    }
  };

  const assignMusicians = async () => {
    try {
      // Open musician assignment modal or redirect to assignment page
      toast({
        title: "Musician Assignment",
        description: "Opening musician assignment interface...",
      });
      // This would open a modal or navigate to assignment page
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to open musician assignment.",
        variant: "destructive"
      });
    }
  };

  const openTechnicalRiderDesigner = () => {
    setShowTechnicalRider(true);
  };

  const saveTechnicalRiderData = async (data: any) => {
    try {
      const response = await apiRequest(`/api/bookings/${bookingId}/save-technical-rider`, {
        method: 'POST',
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        toast({
          title: "Technical Rider Saved",
          description: "Unified technical rider configuration has been saved successfully."
        });
        setShowTechnicalRider(false);
        loadBookingData();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save technical rider.",
        variant: "destructive"
      });
    }
  };

  const generateTechnicalRider = async () => {
    try {
      const response = await apiRequest(`/api/bookings/${bookingId}/technical-rider`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `technical-rider-booking-${bookingId}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        toast({
          title: "Technical Rider Generated",
          description: "Technical rider has been auto-generated and downloaded."
        });
        loadBookingData();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate technical rider.",
        variant: "destructive"
      });
    }
  };

  const generateBookingAgreement = async () => {
    try {
      const response = await apiRequest(`/api/bookings/${bookingId}/booking-agreement`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `booking-agreement-${bookingId}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        toast({
          title: "Booking Agreement Generated",
          description: "Artist-specific booking agreement has been created and downloaded."
        });
        loadBookingData();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate booking agreement.",
        variant: "destructive"
      });
    }
  };

  const initiateSignatures = async () => {
    try {
      const response = await apiRequest(`/api/bookings/${bookingId}/initiate-signatures`, {
        method: 'POST'
      });
      
      if (response.ok) {
        toast({
          title: "Signatures Initiated",
          description: "Signature requests have been sent to all parties."
        });
        loadBookingData();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initiate signatures.",
        variant: "destructive"
      });
    }
  };

  const processPayment = async () => {
    try {
      // This would integrate with Stripe or other payment processor
      toast({
        title: "Payment Processing",
        description: "Opening payment interface...",
      });
      // Redirect to payment page or open payment modal
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process payment.",
        variant: "destructive"
      });
    }
  };

  const generateReceipt = async () => {
    try {
      const response = await apiRequest(`/api/bookings/${bookingId}/generate-receipt`, {
        method: 'POST'
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `booking-${bookingId}-receipt.pdf`;
        a.click();
        
        toast({
          title: "Receipt Generated",
          description: "Final receipt has been generated and downloaded."
        });
        loadBookingData();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate receipt.",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressPercentage = () => {
    const completedSteps = workflowSteps.filter(step => step.status === 'completed').length;
    return (completedSteps / workflowSteps.length) * 100;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </CardContent>
      </Card>
    );
  }

  if (!booking) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Booking not found or access denied.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Booking Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Booking Workflow</span>
            <Badge className={getStatusColor(booking.status)}>
              {booking.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{booking.eventName}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{new Date(booking.eventDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Music className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{booking.primaryArtist?.stageName}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Overall Progress</span>
                <span>{Math.round(getProgressPercentage())}%</span>
              </div>
              <Progress value={getProgressPercentage()} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workflow Steps */}
      <div className="space-y-4">
        {workflowSteps.map((step, index) => (
          <Card key={step.id} className={step.status === 'completed' ? 'bg-green-50' : ''}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-full ${
                    step.status === 'completed' ? 'bg-green-100 text-green-600' :
                    step.status === 'in_progress' ? 'bg-blue-100 text-blue-600' :
                    step.status === 'failed' ? 'bg-red-100 text-red-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {step.icon}
                  </div>
                  <div>
                    <h4 className="font-medium">{step.title}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{step.description}</p>
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-2 rounded-r-lg">
                      <p className="text-xs text-blue-700">{getStepDescription(step.id)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(step.status)}>
                    {step.status.replace('_', ' ')}
                  </Badge>
                  {step.action && step.status !== 'completed' && (
                    <Button size="sm" onClick={step.action}>
                      {step.status === 'pending' ? 'Start' : 'Continue'}
                    </Button>
                  )}
                </div>
              </div>
              
              {index < workflowSteps.length - 1 && (
                <div className="ml-6 mt-4">
                  <Separator orientation="vertical" className="h-6" />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Contract Downloads */}
      {booking.contracts && booking.contracts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {booking.contracts.map((contract: any) => (
                <div key={contract.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4" />
                      <span className="font-medium text-sm">
                        {contract.documentType.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                      </span>
                    </div>
                    <Badge className={getStatusColor(contract.status)}>
                      {contract.status}
                    </Badge>
                  </div>
                  <Button size="sm" variant="outline" className="w-full">
                    <Download className="h-3 w-3 mr-1" />
                    Download PDF
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Unified Technical Rider Designer Modal */}
      <Dialog open={showTechnicalRider} onOpenChange={setShowTechnicalRider}>
        <DialogContent className="max-w-7xl h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Unified Technical Rider Designer</DialogTitle>
          </DialogHeader>
          <UnifiedTechnicalRiderSystem 
            bookingId={bookingId.toString()}
            onSave={saveTechnicalRiderData}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}