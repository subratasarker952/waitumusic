import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

import ISRCValidationInput from './ISRCValidationInput';
import { Lock, Unlock, Music, Upload, DollarSign, AlertCircle } from 'lucide-react';

// Form validation schema
const isrcSubmissionSchema = z.object({
  songTitle: z.string().min(1, "Song title is required").max(255, "Song title too long"),
  artistName: z.string().min(1, "Artist name is required").max(255, "Artist name too long"),
  isrcCode: z.string().min(1, "ISRC code is required"),
  submissionType: z.enum(["release", "remix", "video"], {
    required_error: "Please select submission type"
  }),
  audioFileUrl: z.string().url("Please provide a valid audio file URL"),
  coverArtUrl: z.string().url("Please provide a valid cover art URL"),
  format: z.enum(["WAV", "MP3"], {
    required_error: "Please select audio format"
  }),
  bitrate: z.number().min(320, "Bitrate must be at least 320 kbps for MP3").optional(),
  sampleRate: z.number().min(44100, "Sample rate must be at least 44.1 kHz").optional(),
  additionalNotes: z.string().optional()
});

type FormData = z.infer<typeof isrcSubmissionSchema>;

interface ISRCServiceFormProps {
  userId: number;
  onSuccess?: () => void;
}

export default function ISRCServiceForm({ userId, onSuccess }: ISRCServiceFormProps) {
  const [isISRCValid, setIsISRCValid] = useState(false);
  const [isrcValue, setIsrcValue] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(isrcSubmissionSchema),
    defaultValues: {
      songTitle: '',
      artistName: '',
      isrcCode: '',
      submissionType: 'release',
      audioFileUrl: '',
      coverArtUrl: '',
      format: 'WAV',
      bitrate: 320,
      sampleRate: 48000,
      additionalNotes: ''
    }
  });

  // Update form when ISRC changes
  const handleISRCChange = (value: string) => {
    setIsrcValue(value);
    form.setValue('isrcCode', value);
    form.trigger('isrcCode'); // Revalidate
  };

  const handleISRCValidation = (isValid: boolean) => {
    setIsISRCValid(isValid);
  };

  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest('POST', '/api/isrc-codes', {
        userId,
        ...data
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "ISRC Submission Successful",
        description: "Your ISRC code request has been submitted for processing.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/isrc-codes'] });
      form.reset();
      setIsrcValue('');
      setIsISRCValid(false);
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit ISRC request. Please try again.",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: FormData) => {
    if (!isISRCValid) {
      toast({
        title: "Invalid ISRC Format",
        description: "Please enter a valid ISRC code matching the DM-A0D-YY-NN-XXX format.",
        variant: "destructive"
      });
      return;
    }
    submitMutation.mutate(data);
  };

  const isFormLocked = !isISRCValid;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="h-5 w-5" />
          ISRC Song Coding Service
          {isFormLocked ? (
            <Lock className="h-4 w-4 text-red-500" title="Form locked - validate ISRC first" />
          ) : (
            <Unlock className="h-4 w-4 text-green-500" title="Form unlocked" />
          )}
        </CardTitle>
        <CardDescription>
          Submit your song for ISRC code assignment. Available exclusively for managed Wai'tuMusic artists.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* ISRC Code Validation - Always Enabled */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">Step 1: ISRC Code Validation</h3>
                <Badge variant={isISRCValid ? "default" : "secondary"}>
                  {isISRCValid ? "Valid" : "Required"}
                </Badge>
              </div>
              
              <ISRCValidationInput
                value={isrcValue}
                onChange={handleISRCChange}
                onValidationChange={handleISRCValidation}
                label="ISRC Code (DM-A0D-YY-NN-XXX format)"
                placeholder="DM-A0D-25-00-001"
              />
              
              {isFormLocked && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <AlertCircle className="h-4 w-4" />
                  Form will unlock when ISRC format is valid
                </div>
              )}
            </div>

            <Separator />

            {/* Song Information - Locked until ISRC is valid */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">Step 2: Song Information</h3>
                {isFormLocked && <Lock className="h-4 w-4 text-red-500" />}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="songTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Song Title *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          disabled={isFormLocked}
                          placeholder="Enter song title"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="artistName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Artist Name *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          disabled={isFormLocked}
                          placeholder="Enter artist name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="submissionType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Submission Type *</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      disabled={isFormLocked}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select submission type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="release">Original Release</SelectItem>
                        <SelectItem value="remix">Remix</SelectItem>
                        <SelectItem value="video">Music Video</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* File Information - Locked until ISRC is valid */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">Step 3: File Information</h3>
                {isFormLocked && <Lock className="h-4 w-4 text-red-500" />}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="audioFileUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Audio File URL *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          disabled={isFormLocked}
                          placeholder="https://example.com/audio.wav"
                        />
                      </FormControl>
                      <FormDescription>
                        Direct link to your audio file
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="coverArtUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cover Art URL *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          disabled={isFormLocked}
                          placeholder="https://example.com/cover.jpg"
                        />
                      </FormControl>
                      <FormDescription>
                        Direct link to your cover art (min 3000x3000px)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="format"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Audio Format *</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        disabled={isFormLocked}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="WAV">WAV (Recommended)</SelectItem>
                          <SelectItem value="MP3">MP3 (320+ kbps)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bitrate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bitrate (kbps)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          disabled={isFormLocked}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        320+ for MP3
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sampleRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sample Rate (Hz)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          disabled={isFormLocked}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        48kHz for video
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Additional Notes */}
            <FormField
              control={form.control}
              name="additionalNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      disabled={isFormLocked}
                      placeholder="Any additional information about your submission..."
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Pricing Information */}
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4" />
                  <span className="font-semibold">Service Pricing</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Base price: $25.00 USD per ISRC code
                  <br />
                  Management tier discounts may apply
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset();
                  setIsrcValue('');
                  setIsISRCValid(false);
                }}
                className="w-full sm:w-auto order-2 sm:order-1"
              >
                Reset Form
              </Button>
              
              <Button
                type="submit"
                disabled={isFormLocked || submitMutation.isPending}
                className="min-w-[120px] w-full sm:w-auto order-1 sm:order-2"
              >
                {submitMutation.isPending ? (
                  "Submitting..."
                ) : isFormLocked ? (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Form Locked
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    <span className="hidden xs:inline">Submit Request</span>
                    <span className="xs:hidden">Submit</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}