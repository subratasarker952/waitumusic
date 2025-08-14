import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  ArrowRight, 
  CheckCircle, 
  Clock, 
  FileText, 
  Users, 
  UserCheck, 
  Scale,
  Star,
  Crown,
  Shield,
  Edit,
  Eye
} from 'lucide-react';

export default function ManagementApplicationWalkthrough() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [applicationId, setApplicationId] = useState<number | null>(null);
  const [applicationData, setApplicationData] = useState<any>(null);

  const steps = [
    { id: 1, title: "Application Submission", status: "pending", icon: FileText },
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
  const createApplication = async () => {
    try {
      const response = await apiRequest('POST', '/api/management-applications', {
        requestedManagementTierId: 1, // Full Management
        businessDescription: "Multi-genre artist specializing in Caribbean Neo Soul with international tour experience",
        expectedRevenue: "50000",
        portfolioLinks: {
          website: "https://demo-artist.waitumusic.com",
          streaming: "https://open.spotify.com/artist/demo"
        },
        socialMediaMetrics: {
          instagram: 15000,
          youtube: 8500,
          tiktok: 25000
        },
        contractTerms: {
          tier: "Full Management",
          discountLevel: "up to 100%",
          benefits: ["Dedicated team", "Comprehensive marketing", "Priority booking"],
          duration: "2 years renewable"
        }
      });

      const data = await response.json();
      setApplicationId(data.id);
      setApplicationData(data);
      setStepStatuses(prev => ({ ...prev, 1: "completed" }));
      setCurrentStep(2);

      toast({
        title: "Application Submitted",
        description: "Management application created successfully",
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
  const reviewApplication = async () => {
    if (!applicationId) return;

    try {
      await apiRequest('POST', `/api/management-applications/${applicationId}/review`, {
        reviewStatus: 'approved',
        reviewComments: 'Application demonstrates strong potential for Full Management tier. Applicant shows excellent growth metrics and professional presentation.'
      });

      setStepStatuses(prev => ({ ...prev, 2: "completed" }));
      setCurrentStep(3);

      toast({
        title: "Application Approved",
        description: "Application reviewed and approved by superadmin",
      });
    } catch (error) {
      toast({
        title: "Review Failed",
        description: "Failed to review application",
        variant: "destructive",
      });
    }
  };

  // Step 3: Assign Professional
  const assignLawyer = async () => {
    if (!applicationId) return;

    try {
      // Get available non-performance professionals for Wai'tuMusic representation
      const response = await apiRequest('GET', '/api/available-lawyers-waitumusic');
      const availableProfessionals = await response.json();
      
      if (availableProfessionals.length === 0) {
        toast({
          title: "No Professionals Available",
          description: "No non-performance professionals available to represent Wai'tuMusic",
          variant: "destructive",
        });
        return;
      }

      // Find the first professional without conflicts
      const clearProfessional = availableProfessionals.find((prof: any) => prof.conflictStatus === 'clear');
      
      if (!clearProfessional) {
        toast({
          title: "Conflict Alert",
          description: "All professionals have potential conflicts. Override would be required.",
          variant: "destructive",
        });
        return;
      }

      await apiRequest('POST', `/api/management-applications/${applicationId}/assign-lawyer`, {
        lawyerUserId: clearProfessional.id,
        assignmentRole: 'waitumusic_representative',
        authorityLevel: 'full_authority',
        canSignContracts: true,
        canModifyTerms: true,
        canFinalizeAgreements: true
      });

      setStepStatuses(prev => ({ ...prev, 3: "completed" }));
      setCurrentStep(4);

      toast({
        title: "Professional Assigned",
        description: `${clearProfessional.fullName} (${clearProfessional.specialty}) assigned to represent Wai'tuMusic (no conflicts)`,
      });
    } catch (error: any) {
      const errorData = await error.response?.json();
      
      if (errorData?.requiresOverride) {
        toast({
          title: "Conflict Detected",
          description: "Assignment requires superadmin conflict override",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Assignment Failed",
          description: "Failed to assign professional",
          variant: "destructive",
        });
      }
    }
  };

  // Step 4: Generate Contract
  const generateContract = async () => {
    if (!applicationId) return;

    try {
      await apiRequest('POST', `/api/management-applications/${applicationId}/generate-contract`);

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
      await apiRequest('POST', `/api/management-applications/${applicationId}/sign`, {
        signatureData: `applicant-signature-${Date.now()}`,
        signerRole: 'applicant'
      });

      // Simulate assigned admin signature
      await apiRequest('POST', `/api/management-applications/${applicationId}/sign`, {
        signatureData: `admin-signature-${Date.now()}`,
        signerRole: 'assigned_admin'
      });

      // Simulate lawyer signature (representing Wai'tuMusic)
      await apiRequest('POST', `/api/management-applications/${applicationId}/sign`, {
        signatureData: `lawyer-signature-${Date.now()}`,
        signerRole: 'lawyer'
      });

      // Final superadmin confirmation
      await apiRequest('POST', `/api/management-applications/${applicationId}/sign`, {
        signatureData: `superadmin-signature-${Date.now()}`,
        signerRole: 'superadmin'
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
        <div>
          <h1 className="text-3xl font-bold">Management Application Walkthrough</h1>
          <p className="text-muted-foreground">Interactive demonstration of the complete workflow</p>
        </div>
        <Badge variant="outline" className="text-blue-600 border-blue-600">
          <Star className="h-3 w-3 mr-1" />
          Demo Mode
        </Badge>
      </div>

      {/* Progress Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Workflow Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
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
                  <span className={`text-sm font-medium text-center ${
                    isCompleted ? 'text-green-600' : 
                    isCurrent ? 'text-blue-600' : 
                    'text-gray-500'
                  }`}>
                    {step.title}
                  </span>
                  {index < steps.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-gray-400 mt-2" />
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
                Step 1: Application Submission
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">What happens in this step:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• User submits management application through ManagementApplicationModal</li>
                  <li>• Application specifies Full Management or Administration tier</li>
                  <li>• System validates business information and expected revenue</li>
                  <li>• Application status set to "pending" for admin review</li>
                </ul>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="border p-3 rounded">
                  <span className="font-medium">Tier Requested:</span>
                  <p className="text-sm text-muted-foreground">Full Management (up to 100% discounts)</p>
                </div>
                <div className="border p-3 rounded">
                  <span className="font-medium">Expected Revenue:</span>
                  <p className="text-sm text-muted-foreground">$50,000 annually</p>
                </div>
              </div>

              <Button onClick={createApplication} disabled={stepStatuses[1] === "completed"}>
                {stepStatuses[1] === "completed" ? "Application Submitted" : "Submit Application"}
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
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">What happens in this step:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Assigned admin or superadmin reviews application details</li>
                  <li>• Business case and revenue projections are evaluated</li>
                  <li>• Decision made to approve, reject, or request changes</li>
                  <li>• Review comments and reasoning documented</li>
                </ul>
              </div>

              {applicationData && (
                <div className="border p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Application Details:</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    <strong>Business:</strong> {applicationData.businessDescription}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>Status:</strong> <Badge variant="secondary">Pending Review</Badge>
                  </p>
                </div>
              )}

              <Button onClick={reviewApplication} disabled={stepStatuses[2] === "completed" || !applicationId}>
                {stepStatuses[2] === "completed" ? "Application Approved" : "Approve Application"}
              </Button>
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

              <Button onClick={assignLawyer} disabled={stepStatuses[3] === "completed" || !applicationId}>
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
              <div className="bg-orange-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">What happens in this step:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Superadmin generates formal management contract</li>
                  <li>• Contract includes tier-specific terms and benefits</li>
                  <li>• Status changes to "contract_generated"</li>
                  <li>• Contract becomes available for multi-party signing</li>
                </ul>
              </div>

              <div className="border p-4 rounded-lg">
                <h4 className="font-medium mb-2">Contract Terms Preview:</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Management Tier:</span>
                    <p className="text-muted-foreground">Full Management</p>
                  </div>
                  <div>
                    <span className="font-medium">Service Discounts:</span>
                    <p className="text-muted-foreground">Up to 100%</p>
                  </div>
                  <div>
                    <span className="font-medium">Duration:</span>
                    <p className="text-muted-foreground">2 years renewable</p>
                  </div>
                  <div>
                    <span className="font-medium">Benefits:</span>
                    <p className="text-muted-foreground">Dedicated team, Marketing</p>
                  </div>
                </div>
              </div>

              <Button onClick={generateContract} disabled={stepStatuses[4] === "completed" || !applicationId}>
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

              <Button onClick={signContract} disabled={stepStatuses[5] === "completed" || !applicationId}>
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