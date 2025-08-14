import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { splitsheetFormSchema, type SplitsheetFormData } from '@shared/isrcSchema';
import { useUser } from '@/lib/auth';
import { SplitsheetCreationForm } from './SplitsheetCreationForm';
import { 
  Music, Upload, FileMusic, Users, Building, 
  CheckCircle, AlertCircle, DollarSign, Calendar,
  Play, Download, FileText, Trash2
} from 'lucide-react';

// ISRC submission schema
const isrcSubmissionSchema = z.object({
  songTitle: z.string().min(1, "Song title is required"),
  songReference: z.string().min(1, "Song reference is required"),
  submissionType: z.enum(['release', 'remix', 'video']),
  audioFile: z.instanceof(File).optional(),
  coverArt: z.instanceof(File).optional(),
  splitsheetData: splitsheetFormSchema
});

type ISRCSubmissionData = z.infer<typeof isrcSubmissionSchema>;

export function ISRCCodingService() {
  const [currentStep, setCurrentStep] = useState<'submission' | 'splitsheet' | 'review'>('submission');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverArtFile, setCoverArtFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { user } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if user is managed
  const isManaged = user && [3, 5, 7].includes(user.roleId); // Managed Artist, Musician, Professional

  const submissionForm = useForm<ISRCSubmissionData>({
    resolver: zodResolver(isrcSubmissionSchema),
    defaultValues: {
      songTitle: '',
      songReference: '',
      submissionType: 'release',
      splitsheetData: {
        songTitle: '',
        songReference: '',
        composers: [],
        recordingArtists: [],
        labels: [],
        studios: [],
        publishers: []
      }
    }
  });

  // Fetch user's submissions
  const { data: submissions } = useQuery({
    queryKey: ['/api/isrc-submissions'],
    queryFn: async () => {
      const response = await apiRequest('/api/isrc-submissions');
      return response.json();
    },
    enabled: isManaged
  });

  // Fetch ISRC service pricing from database
  const { data: pricing } = useQuery({
    queryKey: ['/api/service-pricing', 'ISRC Coding'],
    queryFn: async () => {
      const response = await apiRequest('/api/service-pricing/ISRC Coding');
      return response.json();
    }
  });

  // Also fetch legacy pricing for backward compatibility
  const { data: legacyPricing } = useQuery({
    queryKey: ['/api/isrc-service-pricing'],
    queryFn: async () => {
      const response = await apiRequest('/api/isrc-service-pricing');
      return response.json();
    }
  });

  // Use database pricing if available, fallback to legacy pricing
  const servicePricing = pricing || legacyPricing;

  const submitISRCMutation = useMutation({
    mutationFn: async (data: ISRCSubmissionData) => {
      const formData = new FormData();
      formData.append('songTitle', data.songTitle);
      formData.append('songReference', data.songReference);
      formData.append('submissionType', data.submissionType);
      formData.append('splitsheetData', JSON.stringify(data.splitsheetData));
      
      if (audioFile) {
        formData.append('audioFile', audioFile);
      }
      if (coverArtFile) {
        formData.append('coverArt', coverArtFile);
      }

      const response = await apiRequest('/api/isrc-submit', {
        method: 'POST',
        body: formData
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "ISRC Submission Successful",
        description: "Your song has been submitted for ISRC coding"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/isrc-submissions'] });
      setCurrentStep('submission');
      submissionForm.reset();
      setAudioFile(null);
      setCoverArtFile(null);
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit song for ISRC coding",
        variant: "destructive"
      });
    }
  });

  const handleFileUpload = (type: 'audio' | 'coverArt', file: File) => {
    if (type === 'audio') {
      // Validate audio file
      const validAudioTypes = ['audio/wav', 'audio/mpeg', 'audio/mp3'];
      if (!validAudioTypes.includes(file.type)) {
        toast({
          title: "Invalid Audio Format",
          description: "Please upload WAV or MP3 files only",
          variant: "destructive"
        });
        return;
      }
      setAudioFile(file);
      toast({
        title: "Audio File Uploaded",
        description: `${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`
      });
    } else if (type === 'coverArt') {
      // Validate cover art
      const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!validImageTypes.includes(file.type)) {
        toast({
          title: "Invalid Cover Art Format",
          description: "Please upload JPG or PNG files only",
          variant: "destructive"
        });
        return;
      }
      setCoverArtFile(file);
      toast({
        title: "Cover Art Uploaded",
        description: `${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`
      });
    }
  };

  const calculatePrice = () => {
    if (!servicePricing) return { base: 5.00, total: 5.00, discount: 0 };
    
    const basePrice = parseFloat(servicePricing.basePrice || '5.00');
    let discount = 0;
    
    // Apply management tier discount
    if (user?.roleId === 3) { // Managed Artist
      discount = parseFloat(servicePricing.fullManagementDiscount || '100');
    } else if (user?.roleId === 5) { // Managed Musician
      discount = parseFloat(servicePricing.representationDiscount || '50');
    } else if (user?.roleId === 7) { // Managed Professional
      discount = parseFloat(servicePricing.publisherDiscount || '10');
    }
    
    const discountAmount = (basePrice * discount) / 100;
    const total = Math.max(0, basePrice - discountAmount);
    
    return { base: basePrice, total, discount };
  };

  if (!isManaged) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-red-600">
              <AlertCircle className="h-6 w-6" />
              Access Restricted
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              ISRC Song Coding Service is exclusively available to managed artists, musicians, and professionals.
            </p>
            <p className="text-sm text-muted-foreground">
              This premium service includes ISRC code generation, metadata embedding, cover art validation, 
              and splitsheet management for professional music catalog development.
            </p>
            <Button asChild>
              <a href="/dashboard">Apply for Management Status</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { base, total, discount } = calculatePrice();

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold gradient-text flex items-center justify-center gap-2">
          <FileMusic className="h-8 w-8" />
          ISRC Song Coding Service
        </h1>
        <p className="text-muted-foreground">
          Professional ISRC code assignment and metadata embedding for managed artists
        </p>
        <div className="flex items-center justify-center gap-4">
          <Badge className="bg-green-500">Base Price: ${base}</Badge>
          {discount > 0 && <Badge variant="secondary">{discount}% Management Discount</Badge>}
          <Badge className="bg-primary">Your Price: ${total.toFixed(2)}</Badge>
        </div>
      </div>

      <Tabs value={currentStep} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="submission" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Submit Song
          </TabsTrigger>
          <TabsTrigger value="splitsheet" disabled={!audioFile} className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Splitsheet
          </TabsTrigger>
          <TabsTrigger value="review" disabled={!audioFile || !coverArtFile} className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Review
          </TabsTrigger>
        </TabsList>

        <TabsContent value="submission" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Music className="h-5 w-5" />
                    Song Submission
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Form {...submissionForm}>
                    <form className="space-y-4">
                      <FormField
                        control={submissionForm.control}
                        name="songTitle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Song Title *</FormLabel>
                            <FormControl>
                              <Input placeholder="What Do We Do" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={submissionForm.control}
                        name="songReference"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Song Reference *</FormLabel>
                            <FormControl>
                              <Input placeholder="WDWD2024" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={submissionForm.control}
                        name="submissionType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Submission Type *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select submission type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="release">Original Release</SelectItem>
                                <SelectItem value="remix">Remix</SelectItem>
                                <SelectItem value="video">Video Content (48kHz)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </form>
                  </Form>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="audioFile">Audio File *</Label>
                      <div className="mt-2">
                        <input
                          id="audioFile"
                          type="file"
                          accept=".wav,.mp3"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload('audio', file);
                          }}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/80"
                        />
                        {audioFile && (
                          <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            {audioFile.name} uploaded
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="coverArt">Cover Art * (3000x3000px recommended)</Label>
                      <div className="mt-2">
                        <input
                          id="coverArt"
                          type="file"
                          accept=".jpg,.jpeg,.png"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload('coverArt', file);
                          }}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/80"
                        />
                        {coverArtFile && (
                          <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            {coverArtFile.name} uploaded
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => setCurrentStep('splitsheet')}
                    disabled={!audioFile || !submissionForm.watch('songTitle')}
                    className="w-full"
                  >
                    Continue to Splitsheet
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Service Pricing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Base Price</span>
                      <span>${base}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Management Discount ({discount}%)</span>
                        <span>-${(base * discount / 100).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Service Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      ISRC code generation
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Metadata embedding
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Cover art validation
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Splitsheet management
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Vocal-removed version
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Catalog integration
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="splitsheet" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Splitsheet Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Complete splitsheet information for proper publishing and royalty distribution.
              </p>
              <SplitsheetCreationForm
                songTitle={submissionForm.watch('songTitle') || ''}
                songReference={submissionForm.watch('songReference') || ''}
                onComplete={(splitsheetId) => {
                  toast({
                    title: "Splitsheet Created",
                    description: "Splitsheet created and notifications sent to all parties"
                  });
                  setCurrentStep('review');
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="review" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Review & Submit
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Song Information</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Title:</span> {submissionForm.watch('songTitle')}
                    </div>
                    <div>
                      <span className="font-medium">Reference:</span> {submissionForm.watch('songReference')}
                    </div>
                    <div>
                      <span className="font-medium">Type:</span> {submissionForm.watch('submissionType')}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Files</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Audio: {audioFile?.name}
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Cover Art: {coverArtFile?.name}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Final Cost</h4>
                <div className="text-2xl font-bold text-primary">${total.toFixed(2)} USD</div>
                {discount > 0 && (
                  <div className="text-sm text-green-600">
                    {discount}% management discount applied
                  </div>
                )}
              </div>

              <Button
                onClick={() => submitISRCMutation.mutate(submissionForm.getValues())}
                disabled={submitISRCMutation.isPending}
                className="w-full"
              >
                {submitISRCMutation.isPending ? "Processing..." : "Submit for ISRC Coding"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Previous Submissions */}
      {submissions && submissions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Previous Submissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {submissions.map((submission: any) => (
                <div key={submission.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{submission.songTitle}</h4>
                    <div className="text-sm text-muted-foreground">
                      Reference: {submission.songReference} • Type: {submission.submissionType}
                    </div>
                  </div>
                  <Badge variant={submission.status === 'completed' ? 'default' : 'secondary'}>
                    {submission.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}