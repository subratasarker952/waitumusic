import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Eye, DollarSign, CreditCard, FileText, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { apiRequest } from "@/lib/queryClient";

interface PROApplication {
  id: number;
  userId: number;
  proName: string;
  applicationStatus: string;
  applicationDate: string;
  applicationData: {
    personalInfo: {
      firstName: string;
      middleNames?: string;
      lastName: string;
      email: string;
      socialSecurityPassport?: string;
      fullAddress: string;
      dateOfBirth: string;
      desiredArtistNames: string;
      desiredUsername: string;
      musicGenres: string[];
    };
    contactPreferences: any;
    notes?: string;
  };
  adminFee: number;
  proRegistrationFee: number;
  handlingFee: number;
  paymentMethod: string;
  paymentStatus: string;
  notes?: string;
}

export function SuperadminPROReview() {
  const [selectedApplication, setSelectedApplication] = useState<PROApplication | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [customFees, setCustomFees] = useState({
    adminFee: 30,
    proRegistrationFee: 1,
    handlingFee: 3
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all pending PRO applications
  const { data: applications, isLoading } = useQuery({
    queryKey: ['/api/pro-registrations/admin'],
    queryFn: async () => {
      const response = await apiRequest('/api/pro-registrations/admin');
      if (!response.ok) {
        throw new Error('Failed to fetch PRO applications');
      }
      return response.json();
    }
  });

  // Update fees mutation
  const updateFeesMutation = useMutation({
    mutationFn: async ({ id, fees }: { id: number; fees: any }) => {
      const response = await apiRequest(`/api/pro-registrations/${id}/fees`, {
        method: 'PATCH',
        body: fees
      });
      if (!response.ok) {
        throw new Error('Failed to update fees');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Fees Updated",
        description: "Registration fees have been updated successfully"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/pro-registrations/admin'] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update fees",
        variant: "destructive"
      });
    }
  });

  // Approve application mutation
  const approveMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: number; notes: string }) => {
      const response = await apiRequest(`/api/pro-registrations/${id}/approve`, {
        method: 'PATCH',
        body: { notes }
      });
      if (!response.ok) {
        throw new Error('Failed to approve application');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Application Approved",
        description: "PRO registration has been approved and payment link generated"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/pro-registrations/admin'] });
      setSelectedApplication(null);
    }
  });

  // Generate payment link mutation
  const paymentLinkMutation = useMutation({
    mutationFn: async (applicationId: number) => {
      const response = await apiRequest(`/api/pro-registrations/${applicationId}/payment-link`, {
        method: 'POST'
      });
      if (!response.ok) {
        throw new Error('Failed to generate payment link');
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Payment Link Generated",
        description: "Payment link has been created and sent to applicant"
      });
      // You could open the payment link or copy to clipboard
      navigator.clipboard.writeText(data.paymentUrl);
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline"><AlertCircle className="w-3 h-3 mr-1" />Pending Review</Badge>;
      case 'approved':
        return <Badge className="bg-green-500"><CheckCircle2 className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      case 'completed':
        return <Badge className="bg-blue-500"><CheckCircle2 className="w-3 h-3 mr-1" />Completed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline"><AlertCircle className="w-3 h-3 mr-1" />Payment Pending</Badge>;
      case 'paid':
        return <Badge className="bg-green-500"><CheckCircle2 className="w-3 h-3 mr-1" />Paid</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const calculateTotal = (app: PROApplication) => {
    return (app.adminFee + app.proRegistrationFee + app.handlingFee).toFixed(2);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">PRO Registration Applications</h2>
          <p className="text-muted-foreground">
            Review and approve Performing Rights Organization registration applications
          </p>
        </div>
        <Badge variant="secondary">
          {applications?.length || 0} Applications
        </Badge>
      </div>

      <div className="grid gap-4">
        {applications?.map((app: PROApplication) => (
          <Card key={app.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {app.applicationData.personalInfo.firstName} {app.applicationData.personalInfo.lastName}
                    <Badge variant="outline">{app.proName}</Badge>
                  </CardTitle>
                  <CardDescription>
                    Applied: {new Date(app.applicationDate).toLocaleDateString()} • 
                    Artist: {app.applicationData.personalInfo.desiredArtistNames} • 
                    Username: {app.applicationData.personalInfo.desiredUsername}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(app.applicationStatus)}
                  {getPaymentBadge(app.paymentStatus)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Email: {app.applicationData.personalInfo.email}</p>
                  <p className="text-sm text-muted-foreground">
                    Genres: {app.applicationData.personalInfo.musicGenres.join(', ')}
                  </p>
                  <p className="text-sm font-medium">
                    Total: ${calculateTotal(app)} USD ({app.paymentMethod})
                  </p>
                </div>
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedApplication(app)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Review
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>PRO Registration Application Review</DialogTitle>
                        <DialogDescription>
                          Review application details and set pricing for {app.applicationData.personalInfo.firstName} {app.applicationData.personalInfo.lastName}
                        </DialogDescription>
                      </DialogHeader>
                      
                      {selectedApplication && (
                        <div className="space-y-6">
                          {/* Application Details */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <h3 className="font-semibold">Personal Information</h3>
                              <div className="space-y-2">
                                <p><strong>Name:</strong> {selectedApplication.applicationData.personalInfo.firstName} {selectedApplication.applicationData.personalInfo.middleNames} {selectedApplication.applicationData.personalInfo.lastName}</p>
                                <p><strong>Email:</strong> {selectedApplication.applicationData.personalInfo.email}</p>
                                <p><strong>Birth Date:</strong> {selectedApplication.applicationData.personalInfo.dateOfBirth}</p>
                                <p><strong>SSN/Passport:</strong> {selectedApplication.applicationData.personalInfo.socialSecurityPassport}</p>
                                <p><strong>Address:</strong> {selectedApplication.applicationData.personalInfo.fullAddress}</p>
                              </div>
                            </div>
                            
                            <div className="space-y-4">
                              <h3 className="font-semibold">Artist Information</h3>
                              <div className="space-y-2">
                                <p><strong>Artist Name:</strong> {selectedApplication.applicationData.personalInfo.desiredArtistNames}</p>
                                <p><strong>Username:</strong> {selectedApplication.applicationData.personalInfo.desiredUsername}</p>
                                <p><strong>PRO Choice:</strong> {selectedApplication.proName}</p>
                                <p><strong>Genres:</strong> {selectedApplication.applicationData.personalInfo.musicGenres.join(', ')}</p>
                              </div>
                            </div>
                          </div>

                          {/* Fee Configuration */}
                          <div className="space-y-4">
                            <h3 className="font-semibold">Fee Configuration</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <Label>Admin Fee (USD)</Label>
                                <Input
                                  type="number"
                                  value={customFees.adminFee}
                                  onChange={(e) => setCustomFees({...customFees, adminFee: parseFloat(e.target.value) || 0})}
                                  step="0.01"
                                />
                              </div>
                              <div>
                                <Label>PRO Registration Fee (USD)</Label>
                                <Input
                                  type="number"
                                  value={customFees.proRegistrationFee}
                                  onChange={(e) => setCustomFees({...customFees, proRegistrationFee: parseFloat(e.target.value) || 0})}
                                  step="0.01"
                                />
                              </div>
                              <div>
                                <Label>Handling Fee (USD)</Label>
                                <Input
                                  type="number"
                                  value={customFees.handlingFee}
                                  onChange={(e) => setCustomFees({...customFees, handlingFee: parseFloat(e.target.value) || 0})}
                                  step="0.01"
                                />
                              </div>
                            </div>
                            <p className="text-sm font-medium">
                              Total: ${(customFees.adminFee + customFees.proRegistrationFee + customFees.handlingFee).toFixed(2)} USD
                            </p>
                            <Button
                              onClick={() => updateFeesMutation.mutate({
                                id: selectedApplication.id,
                                fees: customFees
                              })}
                              disabled={updateFeesMutation.isPending}
                              variant="outline"
                            >
                              <DollarSign className="w-4 h-4 mr-2" />
                              Update Fees
                            </Button>
                          </div>

                          {/* Review Notes */}
                          <div className="space-y-2">
                            <Label>Review Notes</Label>
                            <Textarea
                              placeholder="Add notes about this application..."
                              value={reviewNotes}
                              onChange={(e) => setReviewNotes(e.target.value)}
                            />
                          </div>

                          {/* Payment Information */}
                          {selectedApplication.paymentMethod === 'offline' && (
                            <Alert>
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription>
                                <div className="space-y-2">
                                  <p><strong>Offline Payment Selected - MoBanking (National Bank of Dominica):</strong></p>
                                  <p className="text-sm text-muted-foreground">
                                    *Available only for applicants with MoBanking Service Account through National Bank of Dominica
                                  </p>
                                  <p><strong>Peer Nickname:</strong> KrystallionInc</p>
                                  <p><strong>MoBanking ID:</strong> 5551010</p>
                                  <p><strong>Account Number:</strong> 100064871</p>
                                  <p><strong>Amount:</strong> $100 XCD (approximately ${calculateTotal(selectedApplication)} USD)</p>
                                  <p className="text-sm font-medium mt-2">
                                    MoBanking is a mobile banking service provided by the National Bank of Dominica for convenient local transactions.
                                  </p>
                                </div>
                              </AlertDescription>
                            </Alert>
                          )}

                          {/* Actions */}
                          <div className="flex gap-2 pt-4">
                            {selectedApplication.applicationStatus === 'pending' && (
                              <Button
                                onClick={() => approveMutation.mutate({
                                  id: selectedApplication.id,
                                  notes: reviewNotes
                                })}
                                disabled={approveMutation.isPending}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Approve Application
                              </Button>
                            )}
                            
                            {selectedApplication.applicationStatus === 'approved' && selectedApplication.paymentMethod === 'online' && (
                              <Button
                                onClick={() => paymentLinkMutation.mutate(selectedApplication.id)}
                                disabled={paymentLinkMutation.isPending}
                              >
                                <CreditCard className="w-4 h-4 mr-2" />
                                Generate Payment Link
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!applications || applications.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No PRO Applications</h3>
            <p className="text-muted-foreground">
              No performing rights organization registration applications to review at this time.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}