import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { ArrowRight, CheckCircle, Clock, FileText, Users, UserCheck, Scale, Star, Crown, Shield, Edit, Eye, ArrowLeft, Check } from 'lucide-react';
import { useLocation, useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ManagementApplicationWalkthrough() {
  const [, setLocation] = useLocation()
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const { id } = useParams()
  const [applicationId, setApplicationId] = useState<number | null>(null);
  const [applicationData, setApplicationData] = useState<any>(null);
  const [reviewComments, setReviewComments] = useState<string>('')
  const [notes, setNotes] = useState<string>('')
  const [termInMonths, setTermInMonths] = useState<number>(12)
  const [selectedProfessional, setSelectedProfessional] = useState(null)

  const { data: application, isLoading: applicationLoading, error: applicationError } = useQuery({
    queryKey: [`/api/management-applications/${id}`],
  });

  const { data: availableLawyer, isLoading: availableLawyerLoading, error: availableLawerError } = useQuery({
    queryKey: [`/api/available-lawyers-waitumusic`],
  });

  console.log(availableLawyer)


  const steps = [
    { id: 1, title: "Application Data", status: "pending", icon: FileText },
    { id: 2, title: "Admin Review", status: "pending", icon: Users },
    { id: 3, title: "Professional Assignment", status: "pending", icon: Scale },
    { id: 4, title: "Contract Generation", status: "pending", icon: FileText },
    { id: 5, title: "Multi-Party Signing", status: "pending", icon: UserCheck },
    { id: 6, title: "Role Transition", status: "pending", icon: Crown }
  ];

  const [stepStatuses, setStepStatuses] = useState(
    steps.reduce((acc, step) => ({ ...acc, [step.id]: "pending" }), {})
  );


  // Step 1: Create Application
  const startReview = async () => {
    try {
      setApplicationId(application.id);
      setApplicationData(application);
      setReviewComments(application?.notes)
      setNotes(application?.notes)

      setStepStatuses(prev => ({ ...prev, 1: "completed" }));
      setCurrentStep(2);

      toast({
        title: "Application Review",
        description: "Application Review Started successfully",
      });
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Failed to create application",
        variant: "destructive",
      });
    }
  };

  // Step 2: Admin Review
  const reviewApplication = async (status: "approved" | "rejected") => {
    if (!applicationId) return;

    try {
      const payload = {
        reviewStatus: status,
        reviewComments,
        notes,
        termInMonths
      }

      await apiRequest(`/api/management-applications/${applicationId}/review`, {
        method: 'POST',
        body: payload
      });

      setStepStatuses(prev => ({ ...prev, 2: "completed" }));
      setCurrentStep(3);

      toast({
        title: status === "approved" ? "Application Approved" : status === "rejected" ? "Application Rejected" : "Marked Under Review",
        description: `Application review completed with status: ${status}`,
      });
    } catch (error) {
      toast({
        title: "Review Failed",
        description: "Failed to review application",
        variant: "destructive",
      });
    }
  };


  // ✅ helper function
  function getAssignmentPayload(professional: any) {
    const specialty = professional.specialty?.toLowerCase() || "";

    // Legal professionals
    if (specialty.includes("legal")) {
      return {
        lawyerUserId: professional.id,
        assignmentRole: "waitumusic_representative",
        authorityLevel: "full_authority",
        canSignContracts: true,
        canModifyTerms: true,
        canFinalizeAgreements: true,
      };
    }

    // Business / Strategic consultants
    if (specialty.includes("business") || specialty.includes("strategic") || specialty.includes("marketing")) {
      return {
        lawyerUserId: professional.id,
        assignmentRole: "business_consultant",
        authorityLevel: "limited_authority",
        canSignContracts: false,
        canModifyTerms: true,
        canFinalizeAgreements: false,
      };
    }

    // Financial advisors
    if (specialty.includes("financial") || specialty.includes("advisory")) {
      return {
        lawyerUserId: professional.id,
        assignmentRole: "financial_advisor",
        authorityLevel: "limited_authority",
        canSignContracts: false,
        canModifyTerms: false,
        canFinalizeAgreements: false,
      };
    }

    // Default / general support
    return {
      lawyerUserId: professional.id,
      assignmentRole: "general_support",
      authorityLevel: "limited_authority",
      canSignContracts: false,
      canModifyTerms: false,
      canFinalizeAgreements: false,
    };
  }

  // Step 3: Assign Professional
  const assignLawyer = async () => {


    try {
      // Get available non-performance professionals for Wai'tuMusic
      const availableProfessionals = await apiRequest("/api/available-lawyers-waitumusic", { method: "GET" });


      let assignedProfessional: any = null;

      if (availableProfessionals.length > 0) {
        // Try to find a clear professional (no conflicts)
        assignedProfessional = availableProfessionals.find((prof: any) => prof.conflictStatus === "clear");

        if (!assignedProfessional) {
          // If none are clear, pick the first professional as fallback
          assignedProfessional = availableProfessionals[0];
          toast({
            title: "Fallback Assignment",
            description: `No clear professionals available, defaulting to ${assignedProfessional.fullName}`,
            variant: "destructive",
          });
        }
      }

      setSelectedProfessional(assignedProfessional)

      // // Build assignment payload dynamically
      // // If assignedProfessional is null, backend will auto fallback to default professional
      const payload = assignedProfessional ? getAssignmentPayload(assignedProfessional) : {};

      const res = await apiRequest(`/api/management-applications/${applicationId}/assign-lawyer`, {
        method: "POST",
        body: payload,
      });
      console.log(res)

      setStepStatuses(prev => ({ ...prev, 3: "completed" }));
      setCurrentStep(4);

      toast({
        title: "Professional Assigned",
        description: assignedProfessional
          ? `${assignedProfessional.fullName} (${assignedProfessional.specialty}) assigned successfully`
          : "Default professional automatically assigned by system",
      });

    } catch (error: any) {

      let errorData = await error.response?.json();

      toast({
        title: "Assignment Failed",
        description: errorData?.requiresOverride
          ? "Conflict detected; override required"
          : "Failed to assign professional",
        variant: "destructive",
      });
    }
  };

  // Step 3: Generate Contract
  const generateContract = async () => {
    if (!applicationId) return;

    try {
      const res = await apiRequest(`/api/management-applications/${applicationId}/generate-contract`, { method: 'POST', body: {} });

      console.log(res)
      setStepStatuses(prev => ({ ...prev, 4: "completed" }));
      setCurrentStep(5);

      toast({
        title: "Contract Generated",
        description: "Management contract generated and ready for signing",
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate contract",
        variant: "destructive",
      });
    }
  };

  // Step 5: Multi-Party Signing (simulated)
  const signContract = async () => {
    if (!applicationId) return;

    try {
      // Simulate applicant signature
      await apiRequest(`/api/management-applications/${applicationId}/sign`, {
        method: 'POST', body: {
          signatureData: `applicant-signature-${Date.now()}`,
          signerRole: 'applicant'
        }
      });

      // Simulate assigned admin signature
      await apiRequest(`/api/management-applications/${applicationId}/sign`, {
        method: 'POST', body: {
          signatureData: `admin-signature-${Date.now()}`,
          signerRole: 'assigned_admin'
        }
      });

      // Simulate lawyer signature (representing Wai'tuMusic)
      await apiRequest(`/api/management-applications/${applicationId}/sign`, {
        method: 'POST', body: {
          signatureData: `lawyer-signature-${Date.now()}`,
          signerRole: 'lawyer'
        }
      });

      // Final superadmin confirmation
      await apiRequest(`/api/management-applications/${applicationId}/sign`, {
        method: 'POST', body: {
          signatureData: `superadmin-signature-${Date.now()}`,
          signerRole: 'superadmin'
        }
      });

      setStepStatuses(prev => ({ ...prev, 5: "completed", 6: "completed" }));
      setCurrentStep(6);

      toast({
        title: "Contract Completed",
        description: "All parties have signed. Role transition executed!",
      });
    } catch (error) {
      toast({
        title: "Signing Failed",
        description: "Failed to complete contract signing process",
        variant: "destructive",
      });
    }
  };


  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setLocation('/dashboard')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <Badge variant="outline" className="text-primary border-primary">
          <Shield className="h-3 w-3 mr-1" />
          Admin / Super Admin Access
        </Badge>
      </div>

      <div>
        <h1 className="text-3xl font-bold">Management Application Walkthrough</h1>
        <p className="text-muted-foreground">Interactive demonstration of the complete workflow</p>
      </div>


      {/* Progress Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Workflow Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = stepStatuses[step.id] === "completed";
              const isCurrent = currentStep === step.id;

              return (
                <div key={step.id} className="flex flex-col items-center">
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center border-2 mb-2
                    ${isCompleted ? 'bg-green-500 border-green-500 text-white' :
                      isCurrent ? 'bg-blue-500 border-blue-500 text-white' :
                        'bg-gray-100 border-gray-300 text-gray-500'}
                  `}>
                    {isCompleted ? <CheckCircle className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                  </div>
                  <span className={`text-sm font-medium text-center ${isCompleted ? 'text-green-600' :
                    isCurrent ? 'text-blue-600' :
                      'text-gray-500'
                    }`}>
                    {step.title}
                  </span>
                  {index < steps.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-gray-400 mt-2" />
                  )}
                  {index == steps.length && (
                    <Check className="w-4 h-4 text-gray-400 mt-2" />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Step Details */}
      <Tabs value={currentStep.toString()}>
        <TabsList className="grid w-full grid-cols-6">
          {steps.map((step) => (
            <TabsTrigger
              key={step.id}
              value={step.id.toString()}
              disabled={step.id > currentStep}
            >
              Step {step.id}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="1" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Step 1: Application Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {application ? <div className="flex items-center justify-between gap-3">
                <div>
                  {/* Header */}
                  <h3 className="text-xl font-bold">
                    Application # {application.id} <span className="text-sm text-muted-foreground">({application.status})</span>
                  </h3>


                  {/* Applicant Info */}
                  <div className="space-y-2">
                    <p>
                      <strong>User ID:</strong> {application.applicantUserId}
                    </p>
                    <p>
                      <strong>Requested Role:</strong> {application.requestedRoleId}
                    </p>
                    <p>
                      <strong>Requested Tier:</strong>  {application.requestedManagementTierId}
                    </p>
                  </div>

                  {/* Reason */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-lg">Reason</h4>
                    <p className="text-gray-700">{application.applicationReason}</p>
                  </div>

                  <div>
                    <strong>Business Plan:</strong>
                    <p className="text-gray-700">{application.businessPlan}</p>
                  </div>

                  <div>
                    <strong>Expected Revenue:</strong>{" "}
                    {application.expectedRevenue}
                  </div>

                  <div>
                    <strong>Portfolio Links:</strong>{" "}
                    <a
                      href={application.portfolioLinks}
                      target="_blank"
                      className="text-blue-600 underline"
                    >
                      {application.portfolioLinks}
                    </a>
                  </div>

                  <div>
                    <strong>Social Media:</strong>{" "}
                    <a
                      href={application.socialMediaMetrics}
                      target="_blank"
                      className="text-blue-600 underline"
                    >
                      {application.socialMediaMetrics}
                    </a>
                  </div>

                  {/* Contract Terms */}
                  {application.contractTerms && (
                    <div className="space-y-1">
                      <strong>Contract Terms:</strong>
                      <ul className="list-disc ml-6 text-gray-700">
                        <li>Notice Period: {application.contractTerms.termination.noticePeriod} Days</li>
                        <li>Early Termination Fee: $ {application.contractTerms.termination.earlyTerminationFee} </li>
                        <li>Admin Commission: {application.contractTerms.adminCommission}%</li>
                        <li>Services Discount: {application.contractTerms.servicesDiscount}%</li>
                        <li>Marketplace Discount: {application.contractTerms.marketplaceDiscount}%</li>
                        <li>Min Commitment: {application.contractTerms.minimumCommitmentMonths} months</li>
                      </ul>
                    </div>
                  )}



                  {/* Dates */}
                  <div className="space-y-2 border-t pt-4">
                    <h4 className="font-semibold text-lg">Timeline</h4>
                    <p>
                      <strong>Submitted At:</strong>{" "}
                      {new Date(application.submittedAt).toLocaleString()}
                    </p>
                    <p>
                      <strong>Created At:</strong>{" "}
                      {new Date(application.createdAt).toLocaleString()}
                    </p>
                    <p>
                      <strong>Updated At:</strong>{" "}
                      {new Date(application.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
                : <LoadingSpinner />}


              <Button className='w-full' onClick={() => startReview()} disabled={stepStatuses[1] === "completed"}>
                {stepStatuses[1] === "completed" ? "Starting.." : "Start to Review"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="2" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Step 2: Admin Review
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className='space-y-6'>
                <div className='space-y-3'>
                  <Label>Review Comments</Label>
                  <Textarea
                    placeholder="Enter review comments..."
                    value={reviewComments}
                    onChange={(e) => setReviewComments(e.target.value)}
                  />
                </div>

                <div className='space-y-3'>
                  <Label>Term (months)</Label>
                  <Input
                    type="number"
                    min={12}
                    placeholder="Term (months)"
                    value={termInMonths.toString()}
                    onChange={(e) => setTermInMonths(parseInt(e.target.value))}
                  />
                </div>

                <div className='space-y-3'>
                  <Label>Notes (optional)</Label>
                  <Textarea
                    placeholder="Notes (optional)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>


              </div>

              {/* Review Buttons */}
              <div className="flex flex-col md:flex-row gap-3 mt-4">
                <Button
                  className="w-full"
                  variant="default"
                  onClick={() => reviewApplication("approved")}
                  disabled={stepStatuses[2] === "completed" || !applicationId}
                >
                  Approve
                </Button>

                <Button
                  className="w-full"
                  variant="destructive"
                  onClick={() => reviewApplication("rejected")}
                  disabled={stepStatuses[2] === "completed" || !applicationId}
                >
                  Reject
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="3" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="w-5 h-5" />
                Step 3: Professional Assignment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">What happens in this step:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Superadmin assigns non-performance professional to represent Wai'tuMusic</li>
                  <li>• Only managed professionals can represent Wai'tuMusic without conflicts</li>
                  <li>• Professional authority level configured (full, review-only, advisory)</li>
                  <li>• Contract signing and modification permissions set</li>
                  <li>• Professional can act on behalf of Wai'tuMusic in non-performance matters</li>
                </ul>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="border p-3 rounded">
                  <span className="font-medium">Assignment Role:</span>
                  <p className="text-sm text-muted-foreground">Wai'tuMusic Representative</p>
                </div>
                <div className="border p-3 rounded">
                  <span className="font-medium">Authority Level:</span>
                  <p className="text-sm text-muted-foreground">Full Authority</p>
                </div>
                <div className="border p-3 rounded">
                  <span className="font-medium">Service Type:</span>
                  <p className="text-sm text-muted-foreground">Non-Performance</p>
                </div>
              </div>

              <div className="bg-amber-50 p-3 rounded border border-amber-200">
                <h5 className="font-medium text-amber-800 mb-1">Conflict Prevention:</h5>
                <p className="text-sm text-amber-700">
                  Professionals representing managed users cannot represent Wai'tuMusic unless they are managed professionals themselves.
                  System automatically prevents conflicts of interest.
                </p>
              </div>
              <div>

                {selectedProfessional?.conflictStatus && (
                  <div
                    className={`p-3 rounded border ${selectedProfessional?.conflictStatus === "clear"
                      ? "bg-green-50 border-green-200"
                      : "bg-amber-50 border-amber-200"
                      }`}
                  >
                    <h5
                      className={`font-medium mb-1 ${selectedProfessional?.conflictStatus === "clear"
                        ? "text-green-800"
                        : "text-amber-800"
                        }`}
                    >
                      Conflict Status:
                    </h5>
                    <p
                      className={`text-sm ${selectedProfessional?.conflictStatus === "clear"
                        ? "text-green-700"
                        : "text-amber-700"
                        }`}
                    >
                      {selectedProfessional?.conflictStatus === "clear"
                        ? "No conflict detected. Professional is available to represent Wai'tuMusic."
                        : "Professional represents managed users. Conflict detected!"}
                    </p>

                    {selectedProfessional?.conflictDetails && (
                      <ul className="mt-2 text-xs text-amber-800 list-disc list-inside">
                        {selectedProfessional?.conflictDetails.map((c: any, idx: number) => (
                          <li key={idx}>{c.message}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>

              <Button className='w-full' onClick={() => assignLawyer()} disabled={stepStatuses[3] === "completed" || !applicationId}>
                {stepStatuses[3] === "completed" ? "Professional Assigned" : "Assign Professional"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="4" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Step 4: Contract Generation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {application ? <div className="space-y-6">
                {/* Auto-populated from rolesManagement */}
                <div>
                  <Label>Admin Commission (%)</Label>
                  <Input value={applicationData?.contractTerms?.adminCommission} disabled />
                </div>

                <div>
                  <Label>Marketplace Discount (%)</Label>
                  <Input value={applicationData?.contractTerms?.marketplaceDiscount} disabled />
                </div>

                <div>
                  <Label>Services Discount (%)</Label>
                  <Input value={applicationData?.contractTerms?.servicesDiscount} disabled />
                </div>
              </div> : <LoadingSpinner />}


              <Button className='w-full' onClick={() => generateContract()} disabled={stepStatuses[4] === "completed" || !applicationId}>
                {stepStatuses[4] === "completed" ? "Contract Generated" : "Generate Contract"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="5" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="w-5 h-5" />
                Step 5: Multi-Party Signing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">What happens in this step:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Applicant signs contract digitally</li>
                  <li>• Assigned admin signs on behalf of administrative oversight</li>
                  <li>• Assigned lawyer signs representing Wai'tuMusic interests</li>
                  <li>• Superadmin provides final confirmation signature</li>
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Required Signatures:</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Applicant</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Assigned Admin</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Wai'tuMusic Lawyer</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-orange-500" />
                      <span>Superadmin Confirmation</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Signing Order:</h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>1. Applicant reviews and signs</p>
                    <p>2. Admin administrative approval</p>
                    <p>3. Lawyer legal validation</p>
                    <p>4. Superadmin final confirmation</p>
                  </div>
                </div>
              </div>

              <Button className='w-full' onClick={signContract} disabled={stepStatuses[5] === "completed" || !applicationId}>
                {stepStatuses[5] === "completed" ? "Contract Signed" : "Execute Signing Process"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="6" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5" />
                Step 6: Role Transition Complete
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-100 p-4 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h4 className="font-medium text-green-800">Workflow Complete!</h4>
                </div>
                <ul className="space-y-1 text-sm text-green-700">
                  <li>• User role upgraded to Managed Artist (roleId: 3)</li>
                  <li>• Artist record created/updated with management tier</li>
                  <li>• Service discounts activated (up to 100%)</li>
                  <li>• Audit trail completed with all transitions recorded</li>
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="border p-4 rounded-lg">
                  <h4 className="font-medium mb-2">New Status:</h4>
                  <Badge className="bg-purple-600">
                    <Crown className="w-3 h-3 mr-1" />
                    Managed Artist
                  </Badge>
                </div>
                <div className="border p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Management Tier:</h4>
                  <Badge variant="outline" className="text-gold border-gold">
                    <Star className="w-3 h-3 mr-1" />
                    Full Management
                  </Badge>
                </div>
              </div>

              <div className="text-center pt-4">
                <h3 className="text-lg font-medium mb-2">🎉 Application Process Complete!</h3>
                <p className="text-muted-foreground">
                  The user now has full access to managed artist benefits and Wai'tuMusic's comprehensive service catalog.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Reset Button */}
      <div className="flex justify-center pt-4">
        <Button
          variant="outline"
          onClick={() => {
            setCurrentStep(1);
            setApplicationId(null);
            setApplicationData(null);
            setStepStatuses(steps.reduce((acc, step) => ({ ...acc, [step.id]: "pending" }), {}));
          }}
        >
          Reset Walkthrough
        </Button>
      </div>
    </div>
  );
}