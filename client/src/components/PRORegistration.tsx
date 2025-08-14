import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Music, FileText, CheckCircle2, AlertCircle, User, Building2, Calendar } from 'lucide-react';
import { apiRequest } from "@/lib/queryClient";

// Eligibility Assessment Schema
const eligibilitySchema = z.object({
  hasOriginalMusic: z.boolean(),
  hasPublishedWorks: z.boolean(),
  intendsToPersue: z.boolean(),
  hasPerformances: z.boolean(),
  isUSCitizen: z.boolean(),
  isRegisteredWithAnotherPRO: z.boolean(),
  additionalInfo: z.string().optional()
});

// PRO Registration Schema
const proRegistrationSchema = z.object({
  organizationChoice: z.literal('ASCAP'),
  personalInfo: z.object({
    firstName: z.string().min(1, "First name is required"),
    middleNames: z.string().optional(),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Valid email is required"),
    socialSecurityPassport: z.string().optional(),
    fullAddress: z.string().min(1, "Full address is required"),
    dateOfBirth: z.string().min(1, "Date of birth is required"),
    desiredArtistNames: z.string().min(1, "Desired artist name is required"),
    desiredUsername: z.string().min(1, "Desired username is required"),
    desiredPassword: z.string().min(6, "Password must be at least 6 characters"),
    musicGenres: z.array(z.string()).min(1, "Select at least one genre").max(3, "Select up to 3 genres")
  }),
  fees: z.object({
    adminFee: z.number().default(30),
    proRegistrationFee: z.number().default(1),
    handlingFee: z.number().default(3),
    paymentMethod: z.enum(['online', 'offline']).default('online')
  }),
  w8benInfo: z.object({
    requiresW8ben: z.boolean().default(false),
    formData: z.object({
      beneficiaryName: z.string().optional(),
      countryOfCitizenship: z.string().optional(),
      permanentAddress: z.string().optional(),
      city: z.string().optional(),
      country: z.string().optional(),
      foreignTaxId: z.string().optional(),
      dateOfBirth: z.string().optional(),
      treatyCountry: z.string().optional()
    }).optional()
  }).optional(),
  contactPreferences: z.object({
    emailUpdates: z.boolean().default(true),
    phoneContact: z.boolean().default(false),
    mailingList: z.boolean().default(true),
    quarterlyStatements: z.boolean().default(true)
  }),
  notes: z.string().optional()
});

type EligibilityFormData = z.infer<typeof eligibilitySchema>;
type PRORegistrationFormData = z.infer<typeof proRegistrationSchema>;

interface PRORegistrationProps {
  userId?: number;
}

// W-8BEN Template Data from uploaded form
const w8benTemplate = {
  beneficiaryName: 'JESSIA ALICIA LETANG',
  countryOfCitizenship: 'THE COMMONWEALTH OF DOMINICA',
  permanentAddress: '45 CHATAIGNIER GROVE, BATH ESTATE',
  city: 'ROSEAU',
  country: 'COMMONWEALTH OF DOMINICA',
  foreignTaxId: '126398-00931885',
  dateOfBirth: '01-21-1995',
  treatyCountry: 'THE COMMONWEALTH OF DOMINICA'
};

export function PRORegistration({ userId }: PRORegistrationProps) {
  const [currentStep, setCurrentStep] = useState<'eligibility' | 'registration' | 'works' | 'review'>('eligibility');
  const [eligibilityScore, setEligibilityScore] = useState<number | null>(null);
  const [registrationId, setRegistrationId] = useState<number | null>(null);
  const [selectedPRO, setSelectedPRO] = useState('');
  const [realTimeFees, setRealTimeFees] = useState({ ASCAP: 50, BMI: 0, SESAC: 0, GMR: 0 });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Eligibility Assessment Form
  const eligibilityForm = useForm<EligibilityFormData>({
    resolver: zodResolver(eligibilitySchema),
    defaultValues: {
      hasOriginalMusic: false,
      hasPublishedWorks: false,
      intendsToPersue: false,
      hasPerformances: false,
      isUSCitizen: false
    }
  });

  // PRO Registration Form
  const registrationForm = useForm<PRORegistrationFormData>({
    resolver: zodResolver(proRegistrationSchema),
    defaultValues: {
      organizationChoice: 'ASCAP',
      personalInfo: {
        firstName: '',
        middleNames: '',
        lastName: '',
        email: '',
        socialSecurityPassport: '',
        fullAddress: '',
        dateOfBirth: '',
        desiredArtistNames: '',
        desiredUsername: '',
        desiredPassword: '',
        musicGenres: []
      },
      fees: {
        adminFee: 30,
        proRegistrationFee: 1,
        handlingFee: 3,
        paymentMethod: 'online'
      },
      w8benInfo: {
        requiresW8ben: false,
        formData: {
          beneficiaryName: '',
          countryOfCitizenship: '',
          permanentAddress: '',
          city: '',
          country: '',
          foreignTaxId: '',
          dateOfBirth: '',
          treatyCountry: ''
        }
      },
      contactPreferences: {
        emailUpdates: true,
        phoneContact: false,
        mailingList: true,
        quarterlyStatements: true
      },
      notes: ''
    }
  });

  // Fetch existing assessment
  const { data: existingAssessment } = useQuery({
    queryKey: ['/api/pro-eligibility', userId],
    queryFn: async () => {
      const response = await apiRequest(`/api/pro-eligibility?userId=${userId}`);
      return response.json();
    },
    enabled: !!userId
  });

  // Fetch real-time PRO fees
  const { data: proFees } = useQuery({
    queryKey: ['/api/pro-fees', selectedPRO],
    queryFn: async () => {
      if (!selectedPRO) return null;
      const response = await apiRequest(`/api/pro-fees/${selectedPRO}`);
      return response.json();
    },
    enabled: !!selectedPRO
  });

  // Fetch W-8BEN template for auto-fill
  const { data: w8benTemplate } = useQuery({
    queryKey: ['/api/w8ben-template'],
    queryFn: async () => {
      const response = await apiRequest('/api/w8ben-template');
      return response.json();
    }
  });

  // W-8BEN Auto-fill functionality for non-US residents
  const autoFillW8BEN = () => {
    if (w8benTemplate) {
      registrationForm.setValue('w8benInfo', {
        requiresW8ben: true,
        formData: {
          beneficiaryName: w8benTemplate.beneficiaryName,
          countryOfCitizenship: w8benTemplate.countryOfCitizenship,
          permanentAddress: w8benTemplate.permanentAddress,
          city: w8benTemplate.city,
          country: w8benTemplate.country,
          foreignTaxId: w8benTemplate.foreignTaxId,
          dateOfBirth: w8benTemplate.dateOfBirth,
          treatyCountry: w8benTemplate.treatyCountry
        }
      });
      
      toast({
        title: "W-8BEN Auto-filled",
        description: "Template data from uploaded form has been applied"
      });
    }
  };

  // Update PRO registration fee in real-time
  useEffect(() => {
    if (proFees?.membershipFee !== undefined) {
      registrationForm.setValue('fees.proRegistrationFee', proFees.membershipFee);
    }
  }, [proFees]);

  // Fetch existing registration
  const { data: existingRegistrations } = useQuery({
    queryKey: ['/api/pro-registrations'],
    queryFn: async () => {
      const response = await apiRequest(`/api/pro-registrations${userId ? `?userId=${userId}` : ''}`);
      return response.json();
    },
  });

  // Eligibility Assessment Mutation
  const eligibilityMutation = useMutation({
    mutationFn: async (data: EligibilityFormData) => {
      const response = await apiRequest('/api/pro-eligibility', {
        method: 'POST',
        body: data
      });
      if (!response.ok) {
        throw new Error('Failed to submit eligibility assessment');
      }
      return response.json();
    },
    onSuccess: (data) => {
      setEligibilityScore(data.eligibilityScore);
      toast({
        title: "Eligibility Assessment Complete",
        description: `Your eligibility score is ${data.eligibilityScore}%`
      });
      if (data.eligibilityScore >= 75) {
        setCurrentStep('registration');
      }
      queryClient.invalidateQueries({ queryKey: ['/api/pro-eligibility'] });
    },
    onError: (error: any) => {
      toast({
        title: "Assessment Failed",
        description: error.message || "Failed to complete eligibility assessment",
        variant: "destructive"
      });
    }
  });

  // Registration Mutation
  const registrationMutation = useMutation({
    mutationFn: async (data: PRORegistrationFormData) => {
      const response = await apiRequest('/api/pro-registrations', {
        method: 'POST',
        body: data
      });
      if (!response.ok) {
        throw new Error('Failed to submit registration');
      }
      return response.json();
    },
    onSuccess: (data) => {
      setRegistrationId(data.id);
      setCurrentStep('review');
      toast({
        title: "Registration Submitted",
        description: "Your PRO registration has been submitted successfully"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/pro-registrations'] });
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to submit registration",
        variant: "destructive"
      });
    }
  });

  // PRO Organization Information
  const proOrganizations = {
    ASCAP: {
      name: "American Society of Composers, Authors and Publishers",
      description: "The largest PRO in the US, known for its comprehensive songwriter services",
      membershipFee: "$50 (songwriter) + $50 (publisher)",
      benefits: ["Comprehensive royalty collection", "International agreements", "Career development programs"]
    },
    BMI: {
      name: "Broadcast Music, Inc.", 
      description: "No-fee PRO with strong digital and broadcast coverage",
      membershipFee: "Free (songwriter) + $150 (publisher)",
      benefits: ["No songwriter fees", "Strong digital presence", "Extensive catalog"]
    },
    SESAC: {
      name: "Society of European Stage Authors and Composers",
      description: "Selective, invitation-only PRO with personalized service",
      membershipFee: "By invitation only",
      benefits: ["Selective membership", "Personalized service", "Higher per-performance rates"]
    },
    GMR: {
      name: "Global Music Rights",
      description: "Newer PRO focusing on higher rates and better service",
      membershipFee: "By application",
      benefits: ["Higher performance rates", "Modern technology", "Focused service"]
    }
  };

  const handleEligibilitySubmit = (data: EligibilityFormData) => {
    eligibilityMutation.mutate(data);
  };

  const handleRegistrationSubmit = (data: PRORegistrationFormData) => {
    registrationMutation.mutate(data);
  };

  const getStepProgress = () => {
    switch (currentStep) {
      case 'eligibility': return 33;
      case 'registration': return 66;
      case 'review': return 100;
      default: return 0;
    }
  };

  const getEligibilityBadge = (score: number) => {
    if (score >= 90) return <Badge className="bg-green-500">Highly Eligible</Badge>;
    if (score >= 75) return <Badge className="bg-blue-500">Eligible</Badge>;
    if (score >= 50) return <Badge className="bg-yellow-500">Partially Eligible</Badge>;
    return <Badge variant="destructive">Not Eligible</Badge>;
  };

  useEffect(() => {
    if (existingAssessment) {
      setEligibilityScore(existingAssessment.eligibilityScore);
      if (existingAssessment.eligibilityScore >= 75) {
        setCurrentStep('registration');
      }
    }
  }, [existingAssessment]);

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold gradient-text">PRO Registration System</h1>
        <p className="text-muted-foreground">
          Complete your Performance Rights Organization registration with our guided process
        </p>
        <Progress value={getStepProgress()} className="w-full max-w-md mx-auto" />
      </div>

      <Tabs value={currentStep} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="eligibility" className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Eligibility
          </TabsTrigger>
          <TabsTrigger value="registration" disabled={!eligibilityScore || eligibilityScore < 75} className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Registration
          </TabsTrigger>
          <TabsTrigger value="review" disabled={!registrationId} className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Review
          </TabsTrigger>
        </TabsList>

        <TabsContent value="eligibility" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Eligibility Assessment
              </CardTitle>
              <CardDescription>
                Let's determine if you're eligible for PRO registration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...eligibilityForm}>
                <form onSubmit={eligibilityForm.handleSubmit(handleEligibilitySubmit)} className="space-y-6">
                  <FormField
                    control={eligibilityForm.control}
                    name="hasOriginalMusic"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>I have written original music</FormLabel>
                          <FormDescription>
                            You must have created original musical works to be eligible
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={eligibilityForm.control}
                    name="hasPerformances"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>My music is performed publicly or will be</FormLabel>
                          <FormDescription>
                            PROs collect royalties from public performances of your music
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={eligibilityForm.control}
                    name="isUSCitizen"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>I am a US citizen or permanent resident</FormLabel>
                          <FormDescription>
                            Will determine the W-8BEN forms you will fill out, not required for PRO eligibility
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={eligibilityForm.control}
                    name="hasPublishedWorks"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>I have published or plan to publish my works</FormLabel>
                          <FormDescription>
                            Works should be available for public performance
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={eligibilityForm.control}
                    name="intendsToPersue"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>I intend to pursue a music career professionally</FormLabel>
                          <FormDescription>
                            PRO membership is most beneficial for professional musicians
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={eligibilityForm.control}
                    name="isRegisteredWithAnotherPRO"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>I am already registered with another PRO</FormLabel>
                          <FormDescription>
                            Check this if you're currently a member of ASCAP, BMI, SESAC, GMR, or any other performing rights organization
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={eligibilityForm.control}
                    name="additionalInfo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Information</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell us more about your music career and goals..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {eligibilityScore !== null && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="flex items-center gap-2">
                        Your eligibility score: {eligibilityScore}% 
                        {getEligibilityBadge(eligibilityScore)}
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" disabled={eligibilityMutation.isPending} className="w-full">
                    {eligibilityMutation.isPending ? "Assessing..." : "Complete Assessment"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="registration" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            <Card className="cursor-pointer transition-all hover:shadow-md ring-2 ring-primary">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">ASCAP</CardTitle>
                <CardDescription className="text-sm">
                  American Society of Composers, Authors and Publishers - Wai'tuMusic's exclusive PRO partner
                </CardDescription>
              </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Membership Fee:</span> $50
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Annual Dues:</span> $0
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Performance royalty collection
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      International representation
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Writer and publisher services
                    </div>
                  </div>
                </CardContent>
              </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Registration Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...registrationForm}>
                <form onSubmit={registrationForm.handleSubmit(handleRegistrationSubmit)} className="space-y-6">
                  {/* Personal Information Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={registrationForm.control}
                        name="personalInfo.firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Jessia" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registrationForm.control}
                        name="personalInfo.middleNames"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Middle Names</FormLabel>
                            <FormControl>
                              <Input placeholder="Alicia" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registrationForm.control}
                        name="personalInfo.lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Letang" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={registrationForm.control}
                        name="personalInfo.email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address *</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="j.letang95@gmail.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registrationForm.control}
                        name="personalInfo.socialSecurityPassport"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>SSN / Passport / Driver's License</FormLabel>
                            <FormControl>
                              <Input placeholder="126398-00931885" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={registrationForm.control}
                      name="personalInfo.fullAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Address *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="45 Chataignier grove, Bath Estate&#10;Roseau&#10;Dominica" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registrationForm.control}
                      name="personalInfo.dateOfBirth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of Birth *</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Artist Information Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Artist Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={registrationForm.control}
                        name="personalInfo.desiredArtistNames"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Desired Artist Name(s) *</FormLabel>
                            <FormControl>
                              <Input placeholder="Jessia Letang" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registrationForm.control}
                        name="personalInfo.membershipType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Membership Type *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select membership type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="writer">Writer Only</SelectItem>
                                <SelectItem value="publisher">Publisher Only</SelectItem>
                                <SelectItem value="both">Writer and Publisher</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={registrationForm.control}
                        name="personalInfo.desiredUsername"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Desired Username *</FormLabel>
                            <FormControl>
                              <Input placeholder="JLetang95" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registrationForm.control}
                        name="personalInfo.desiredPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Desired Password *</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Enter secure password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={registrationForm.control}
                      name="personalInfo.musicGenres"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Select Three (3) Genres of Music *</FormLabel>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                            {[
                              'Pop Music', 'RnB/Hip Hop', 'Rap', 'Reggae', 'Rock Music',
                              'Symphonic/Concert/Chamber', 'Gospel', 'Jazz', 'Latin',
                              'Library/Production Music', 'Musical Theater/Cabaret', 'New Age'
                            ].map((genre) => (
                              <div key={genre} className="flex items-center space-x-2">
                                <Checkbox
                                  checked={field.value?.includes(genre) || false}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      if (field.value?.length < 3) {
                                        field.onChange([...(field.value || []), genre]);
                                      }
                                    } else {
                                      field.onChange(field.value?.filter((g: string) => g !== genre) || []);
                                    }
                                  }}
                                  disabled={!field.value?.includes(genre) && field.value?.length >= 3}
                                />
                                <label className="text-sm">{genre}</label>
                              </div>
                            ))}
                          </div>
                          <div className="text-sm text-muted-foreground mt-2">
                            Selected: {field.value?.length || 0}/3
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Fee Structure Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Registration Fees</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={registrationForm.control}
                        name="fees.adminFee"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>PRO Registration Admin Fee (USD)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.01"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registrationForm.control}
                        name="fees.proRegistrationFee"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>PRO Registration Fee (USD)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.01"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registrationForm.control}
                        name="fees.handlingFee"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>PRO Registration Handling Fee (USD)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.01"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={registrationForm.control}
                      name="fees.paymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Admin Fee Payment Options</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select payment method" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="online">Online Payment (Stripe)</SelectItem>
                              <SelectItem value="offline">I wish to make payment offline</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {registrationForm.watch('fees.paymentMethod') === 'offline' && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          <div className="space-y-2">
                            <p><strong>MoBanking Payment (National Bank of Dominica) - $100 XCD:</strong></p>
                            <p className="text-sm text-muted-foreground mb-2">
                              *Available only if you have a MoBanking Service Account with National Bank of Dominica
                            </p>
                            <p><strong>Peer Nickname:</strong> KrystallionInc</p>
                            <p><strong>MoBanking ID:</strong> 5551010</p>
                            <p><strong>Account Number:</strong> 100064871</p>
                            <p className="text-sm mt-2">
                              MoBanking is National Bank of Dominica's mobile banking service for secure local transfers.
                            </p>
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <Button type="submit" disabled={registrationMutation.isPending} className="w-full">
                    {registrationMutation.isPending ? "Submitting..." : "Submit Registration"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="review" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Registration Review
              </CardTitle>
              <CardDescription>
                Review your PRO registration details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {eligibilityScore && (
                  <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                    <span>Eligibility Score:</span>
                    <div className="flex items-center gap-2">
                      {eligibilityScore}% {getEligibilityBadge(eligibilityScore)}
                    </div>
                  </div>
                )}
                
                {existingRegistrations && existingRegistrations.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Your Registrations:</h4>
                    {existingRegistrations.map((reg: any) => (
                      <div key={reg.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{reg.organizationChoice} Registration</p>
                            <p className="text-sm text-muted-foreground">
                              Applied: {new Date(reg.applicationDate).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant={reg.status === 'approved' ? 'default' : 'secondary'}>
                            {reg.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Your PRO registration is now complete. You will receive email updates about your application status.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}