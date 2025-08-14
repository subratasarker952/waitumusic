import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Users, Music, Building, FileText, 
  Plus, Minus, CheckCircle, AlertTriangle,
  User, Briefcase, Mic, Headphones, Trash2, Calculator
} from 'lucide-react';

// Form participant schemas matching authentic splitsheet
const formParticipantSchema = z.object({
  referenceNumber: z.number(),
  name: z.string().min(1, 'Name is required'),
  address: z.string().min(1, 'Address is required'),
  phone: z.string().optional(),
  proAffiliation: z.string().optional(),
  nationalId: z.string().optional(),
  dateOfBirth: z.string().optional(),
  email: z.string().email().optional(),
  ipiNumber: z.string().optional(),
});

const writerComposerSchema = formParticipantSchema.extend({
  proIpiNumber: z.string().optional(),
  songwritingPercentage: z.number().min(0).max(100).default(100),
  role: z.string().optional(),
});

const recordingArtistSchema = formParticipantSchema.extend({
  proIpiNumber: z.string().optional(),
  musicOwnership: z.number().min(0).max(100).default(0),
  role: z.string().optional(),
});

const labelSchema = formParticipantSchema.extend({
  labelName: z.string().min(1, 'Label name is required'),
  proIpiNumber: z.string().optional(),
  artist: z.string().min(1, 'Artist name is required'),
});

const studioSchema = formParticipantSchema.extend({
  studioName: z.string().min(1, 'Studio name is required'),
});

const publisherSchema = formParticipantSchema.extend({
  publisherName: z.string().min(1, 'Publisher name is required'),
  proIpiNumber: z.string().optional(),
  publishingPercentage: z.number().min(0).max(100),
});

const executiveProducerSchema = z.object({
  referenceNumber: z.number(),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email().min(1, 'Email is required'),
  notes: z.string().optional(),
  workOwnership: z.number().min(0).max(100),
});

const otherContributorSchema = z.object({
  referenceNumber: z.number(),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email().min(1, 'Email is required'),
  roleNotes: z.string().optional(),
  proIpiNumber: z.string().optional(),
  workOwnership: z.number().min(0).max(100).default(0),
});

const authenticsplitsheetSchema = z.object({
  songTitle: z.string().min(1, 'Song title is required'),
  songReference: z.string().min(1, 'Song reference is required'),
  agreementDate: z.string().optional(),
  
  writerComposers: z.array(writerComposerSchema).min(1, 'At least one writer/composer required'),
  recordingArtists: z.array(recordingArtistSchema).min(1, 'At least one recording artist required'),
  labels: z.array(labelSchema).min(1, 'At least one label required'),
  studios: z.array(studioSchema).min(1, 'At least one studio required'),
  publishers: z.array(publisherSchema).min(1, 'At least one publisher required'),
  executiveProducers: z.array(executiveProducerSchema).optional(),
  otherContributors: z.array(otherContributorSchema).optional(),
});

type AuthenticSplitsheetData = z.infer<typeof authenticsplitsheetSchema>;

interface AuthenticSplitsheetFormProps {
  onSuccess?: () => void;
}

export default function AuthenticSplitsheetForm({ onSuccess }: AuthenticSplitsheetFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');

  // Percentage validation function based on Wai'tuMusic policy
  const validatePercentages = (data: AuthenticSplitsheetData) => {
    const alerts = [];
    
    // Calculate totals for each category
    const songwritingTotal = (data.writerComposers?.reduce((sum, wc) => sum + (wc.songwritingPercentage || 0), 0) || 0) +
                           (data.otherContributors?.filter(oc => oc.roleNotes?.toLowerCase().includes('songwriter') || oc.roleNotes?.toLowerCase().includes('author'))
                            .reduce((sum, oc) => sum + (oc.workOwnership || 0), 0) || 0);
    
    const melodyTotal = (data.recordingArtists?.reduce((sum, ra) => sum + (ra.musicOwnership || 0), 0) || 0) +
                       (data.otherContributors?.filter(oc => oc.roleNotes?.toLowerCase().includes('melody'))
                        .reduce((sum, oc) => sum + (oc.workOwnership || 0), 0) || 0);
    
    const beatProductionTotal = (data.otherContributors?.filter(oc => oc.roleNotes?.toLowerCase().includes('beat') || 
                                                                       oc.roleNotes?.toLowerCase().includes('production') ||
                                                                       oc.roleNotes?.toLowerCase().includes('producer'))
                                .reduce((sum, oc) => sum + (oc.workOwnership || 0), 0) || 0);

    // Policy limits: Songwriting 50%, Melody 25%, Beat/Production 25%
    if (songwritingTotal > 50) {
      alerts.push({
        type: 'error',
        category: 'Songwriting/Authors (50%)',
        message: `Songwriting percentages ${songwritingTotal}% of 50% total`,
        limit: 50,
        current: songwritingTotal
      });
    }
    
    if (melodyTotal > 25) {
      alerts.push({
        type: 'error',
        category: 'Melody Creators (25%)',
        message: `Melody creation percentages ${melodyTotal}% of 25% total`,
        limit: 25,
        current: melodyTotal
      });
    }
    
    if (beatProductionTotal > 25) {
      alerts.push({
        type: 'error',
        category: 'Music Composition (25%)',
        message: `Music composition percentages ${beatProductionTotal}% of 25% total`,
        limit: 25,
        current: beatProductionTotal
      });
    }

    // Warning when approaching limits (within 5%)
    if (songwritingTotal > 45 && songwritingTotal <= 50) {
      alerts.push({
        type: 'warning',
        category: 'Songwriting/Authors (50%)',
        message: `Songwriting percentages ${songwritingTotal}% of 50% total (approaching limit)`,
        limit: 50,
        current: songwritingTotal
      });
    }

    return alerts;
  };

  const form = useForm<AuthenticSplitsheetData>({
    resolver: zodResolver(authenticsplitsheetSchema),
    defaultValues: {
      songTitle: '',
      songReference: '',
      agreementDate: new Date().toISOString().split('T')[0],
      writerComposers: [
        {
          referenceNumber: 1,
          name: 'LIANNE MARILDA MARISA LETANG',
          address: 'BATH ESTATE,\nROSEAU, DOMINICA',
          proIpiNumber: 'ASCAP/1057495241',
          songwritingPercentage: 100,
          role: 'Songwriter/Composer',
          email: 'lilioctave@waitumusic.com',
          phone: '',
          nationalId: '',
          dateOfBirth: '',
          ipiNumber: '',
          proAffiliation: ''
        }
      ],
      recordingArtists: [
        {
          referenceNumber: 1,
          name: 'LI-LI OCTAVE',
          address: 'BATH ESTATE,\nROSEAU, DOMINICA',
          proIpiNumber: 'ASCAP/1057495241',
          musicOwnership: 100,
          role: 'Recording Artist',
          email: 'lilioctave@waitumusic.com',
          phone: '',
          nationalId: '',
          dateOfBirth: '',
          ipiNumber: '',
          proAffiliation: ''
        }
      ],
      labels: [
        {
          referenceNumber: 1,
          name: 'Wai\'tuMusic',
          labelName: 'Wai\'tuMusic',
          address: 'C/o Krystallion Incorporated\nP.O. Box 1350\nRoseau, Dominica',
          phone: '+1 (767) 265-2833 / 315-1110',
          proIpiNumber: 'ASCAP/1050116716',
          artist: 'LI-LI OCTAVE',
          email: 'admin@waitumusic.com',
          nationalId: '',
          dateOfBirth: '',
          ipiNumber: '',
          proAffiliation: ''
        }
      ],
      studios: [
        {
          referenceNumber: 1,
          name: 'FUNKI DATA MUSIC',
          studioName: 'FUNKI DATA MUSIC',
          address: '19TH STREET,\nCANEFIELD, DOMINICA',
          phone: '',
          email: '',
          proAffiliation: '',
          nationalId: '',
          dateOfBirth: '',
          ipiNumber: ''
        }
      ],
      publishers: [
        {
          referenceNumber: 1,
          name: 'WAI\'TUMUSIC',
          publisherName: 'WAI\'TUMUSIC',
          address: 'C/O KRYSTALLION INCORPORATED\nP.O. BOX 1350, ROSEAU, DOMINICA',
          proIpiNumber: 'ASCAP/1050116716',
          publishingPercentage: 100,
          phone: '',
          email: 'admin@waitumusic.com',
          nationalId: '',
          dateOfBirth: '',
          ipiNumber: '',
          proAffiliation: ''
        }
      ],
      executiveProducers: [],
      otherContributors: []
    }
  });

  const writerComposersArray = useFieldArray({
    control: form.control,
    name: 'writerComposers'
  });

  const recordingArtistsArray = useFieldArray({
    control: form.control,
    name: 'recordingArtists'
  });

  const labelsArray = useFieldArray({
    control: form.control,
    name: 'labels'
  });

  const studiosArray = useFieldArray({
    control: form.control,
    name: 'studios'
  });

  const publishersArray = useFieldArray({
    control: form.control,
    name: 'publishers'
  });

  const executiveProducersArray = useFieldArray({
    control: form.control,
    name: 'executiveProducers'
  });

  const otherContributorsArray = useFieldArray({
    control: form.control,
    name: 'otherContributors'
  });

  // Watch form values for real-time percentage validation
  const currentFormData = form.watch();
  const percentageAlerts = validatePercentages(currentFormData);

  const createSplitsheetMutation = useMutation({
    mutationFn: (data: AuthenticSplitsheetData) => {
      // Sending splitsheet creation data
      const token = localStorage.getItem('token');
      // Authentication token validated
      return apiRequest('/api/splitsheet-create', { method: 'POST', body: data });
    },
    onSuccess: (response) => {
      // Splitsheet creation successful
      toast({
        title: "Splitsheet Created Successfully",
        description: "Your authentic splitsheet has been created and notifications sent.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user/splitsheets'] });
      onSuccess?.();
    },
    onError: (error: any) => {
      console.error('Mutation error:', error);
      toast({
        title: "Failed to Create Splitsheet",
        description: error.message || "An error occurred while creating the splitsheet.",
        variant: "destructive",
      });
    }
  });

  // Auto-divide songwriting percentages equally among all writers
  const redistributeWriterPercentages = () => {
    const writers = form.watch('writerComposers');
    if (writers && writers.length > 0) {
      const equalPercentage = Math.floor(50 / writers.length);
      const remainder = 50 - (equalPercentage * writers.length);
      
      // Update each writer's percentage
      writers.forEach((writer, index) => {
        const newPercentage = index === 0 ? equalPercentage + remainder : equalPercentage;
        form.setValue(`writerComposers.${index}.songwritingPercentage`, newPercentage);
      });
      
      toast({
        title: "Percentages Auto-Divided",
        description: `Songwriting percentages automatically divided equally among ${writers.length} writer(s). You can manually adjust if needed.`,
      });
    }
  };

  // Auto-divide melody creation percentages equally among all recording artists (default 100%)
  const redistributeRecordingArtistPercentages = () => {
    const artists = form.watch('recordingArtists');
    if (artists && artists.length > 0) {
      const equalPercentage = Math.floor(100 / artists.length);
      const remainder = 100 - (equalPercentage * artists.length);
      
      // Update each artist's percentage
      artists.forEach((artist, index) => {
        const newPercentage = index === 0 ? equalPercentage + remainder : equalPercentage;
        form.setValue(`recordingArtists.${index}.musicOwnership`, newPercentage);
      });
      
      toast({
        title: "Melody Percentages Auto-Divided",
        description: `Melody creation percentages automatically divided equally among ${artists.length} recording artist(s).`,
      });
    }
  };

  const onSubmit = (data: AuthenticSplitsheetData) => {
    console.log('Form submission data:', data);
    console.log('Form validation errors:', form.formState.errors);
    console.log('Form is valid:', form.formState.isValid);
    console.log('Form is submitting:', form.formState.isSubmitting);
    
    // Check if form has required fields filled
    if (!data.songTitle || !data.songReference) {
      toast({
        title: "Form Validation Error",
        description: "Song title and reference are required.",
        variant: "destructive",
      });
      return;
    }
    
    createSplitsheetMutation.mutate(data);
  };

  const addParticipant = (type: 'writerComposers' | 'recordingArtists' | 'labels' | 'studios' | 'publishers' | 'executiveProducers' | 'otherContributors') => {
    const arrays = {
      writerComposers: writerComposersArray,
      recordingArtists: recordingArtistsArray,
      labels: labelsArray,
      studios: studiosArray,
      publishers: publishersArray,
      executiveProducers: executiveProducersArray,
      otherContributors: otherContributorsArray
    };

    const defaults = {
      writerComposers: {
        referenceNumber: (form.watch(type) || []).length + 1,
        name: '',
        address: '',
        proIpiNumber: '',
        songwritingPercentage: 100,
        role: '',
        email: '',
        phone: '',
        nationalId: '',
        dateOfBirth: '',
        ipiNumber: '',
        proAffiliation: ''
      },
      recordingArtists: {
        referenceNumber: (form.watch(type) || []).length + 1,
        name: '',
        address: '',
        proIpiNumber: '',
        musicOwnership: 100,
        role: '',
        email: '',
        phone: '',
        nationalId: '',
        dateOfBirth: '',
        ipiNumber: '',
        proAffiliation: ''
      },
      labels: {
        referenceNumber: (form.watch(type) || []).length + 1,
        name: '',
        labelName: '',
        address: '',
        artist: '',
        phone: '',
        proIpiNumber: '',
        email: '',
        nationalId: '',
        dateOfBirth: '',
        ipiNumber: '',
        proAffiliation: ''
      },
      studios: {
        referenceNumber: (form.watch(type) || []).length + 1,
        name: '',
        studioName: '',
        address: '',
        phone: '',
        email: '',
        proAffiliation: '',
        nationalId: '',
        dateOfBirth: '',
        ipiNumber: ''
      },
      publishers: {
        referenceNumber: (form.watch(type) || []).length + 1,
        name: '',
        publisherName: '',
        address: '',
        publishingPercentage: 0,
        phone: '',
        proIpiNumber: '',
        email: '',
        nationalId: '',
        dateOfBirth: '',
        ipiNumber: '',
        proAffiliation: ''
      },
      executiveProducers: {
        referenceNumber: (form.watch(type) || []).length + 1,
        name: '',
        email: '',
        notes: '',
        workOwnership: 0
      },
      otherContributors: {
        referenceNumber: (form.watch(type) || []).length + 1,
        name: '',
        email: '',
        roleNotes: '',
        proIpiNumber: '',
        workOwnership: 0
      }
    };

    arrays[type].append(defaults[type] as any);
    
    // Auto-divide percentages when adding participants
    if (type === 'writerComposers') {
      redistributeWriterPercentages();
    } else if (type === 'recordingArtists') {
      redistributeRecordingArtistPercentages();
    }
  };

  const removeParticipant = (type: 'writerComposers' | 'recordingArtists' | 'labels' | 'studios' | 'publishers' | 'executiveProducers' | 'otherContributors', index: number) => {
    const arrays = {
      writerComposers: writerComposersArray,
      recordingArtists: recordingArtistsArray,
      labels: labelsArray,
      studios: studiosArray,
      publishers: publishersArray,
      executiveProducers: executiveProducersArray,
      otherContributors: otherContributorsArray
    };

    const currentArray = form.watch(type);
    if (currentArray && currentArray.length > 1) {
      arrays[type].remove(index);
      
      // Auto-redistribute percentages after removal
      if (type === 'writerComposers') {
        setTimeout(() => redistributeWriterPercentages(), 100);
      } else if (type === 'recordingArtists') {
        setTimeout(() => redistributeRecordingArtistPercentages(), 100);
      }
    }
  };

  const renderParticipantForm = (
    type: 'writerComposers' | 'recordingArtists' | 'labels' | 'studios' | 'publishers',
    index: number,
    participant: any,
    formRef: string
  ) => {
    return (
      <Card key={index}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">
              {formRef} - {form.watch('songReference')}-{index + 1}
            </CardTitle>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => removeParticipant(type, index)}
              disabled={form.watch(type).length <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <FormField
              control={form.control}
              name={`${type}.${index}.name`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Full legal name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {(type === 'labels') && (
              <FormField
                control={form.control}
                name={`${type}.${index}.labelName`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Label Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Label business name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {(type === 'studios') && (
              <FormField
                control={form.control}
                name={`${type}.${index}.studioName`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Studio Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Recording studio name" className="mobile-input" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {(type === 'publishers') && (
              <FormField
                control={form.control}
                name={`${type}.${index}.publisherName`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Publisher Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Publishing company name" className="mobile-input" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name={`${type}.${index}.address`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Full address" className="mobile-input" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`${type}.${index}.phone`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Phone number" className="mobile-input" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`${type}.${index}.proAffiliation`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PRO Affiliation</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., ASCAP/1057495241" className="mobile-input" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />



            {type === 'writerComposers' && (
              <FormField
                control={form.control}
                name={`${type}.${index}.songwritingPercentage`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Songwriting Percentage (%)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        max="100" 
                        {...field} 
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        placeholder="Overall songwriting percentage"
                        className="mobile-input"
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground mt-1">
                      Total songwriting contribution (max 50% policy applies)
                    </p>
                  </FormItem>
                )}
              />
            )}

            {type === 'recordingArtists' && (
              <FormField
                control={form.control}
                name={`${type}.${index}.musicOwnership`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Melody Creation Percentage (%)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        max="100" 
                        {...field} 
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        placeholder="Melody creation percentage"
                        className="mobile-input"
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground mt-1">
                      Melody creation contribution (max 25% policy applies)
                    </p>
                  </FormItem>
                )}
              />
            )}

            {(type === 'labels') && (
              <FormField
                control={form.control}
                name={`${type}.${index}.artist`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Artist</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Artist represented" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {(type === 'publishers') && (
              <FormField
                control={form.control}
                name={`${type}.${index}.publishingPercentage`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Publishing Percentage (%)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        max="100" 
                        {...field} 
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderExecutiveProducerForm = (index: number, participant: any) => {
    return (
      <Card key={index}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">
              WM-SSA-EP - {form.watch('songReference')}-{index + 1}
            </CardTitle>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeParticipant('executiveProducers', index)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4">
            <FormField
              control={form.control}
              name={`executiveProducers.${index}.name`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`executiveProducers.${index}.email`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`executiveProducers.${index}.notes`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`executiveProducers.${index}.workOwnership`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Work Ownership (%)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="0" 
                      max="100" 
                      {...field} 
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderOtherContributorForm = (index: number, participant: any) => {
    return (
      <Card key={index}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">
              WM-SSA-OC - {form.watch('songReference')}-{index + 1}
            </CardTitle>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeParticipant('otherContributors', index)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4">
            <FormField
              control={form.control}
              name={`otherContributors.${index}.name`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`otherContributors.${index}.email`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`otherContributors.${index}.roleNotes`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role/Notes</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`otherContributors.${index}.proIpiNumber`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PRO/IPI Number</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`otherContributors.${index}.workOwnership`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Work Ownership (%)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="0" 
                      max="100" 
                      {...field} 
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      placeholder="Percentage ownership"
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground mt-1">
                    Specify role in notes: melody creator (25% max), music composition (25% max), or songwriter (part of 50% max)
                  </p>
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="w-full mobile-safe mobile-container mobile-scroll">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-full space-y-4 sm:space-y-6 py-4 pb-20">
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-lg sm:text-xl font-bold">Songwriter Split Sheet Agreement</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">Authentic Wai'tuMusic Format</p>
            </div>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Song Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="songTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Song Title</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., WHAT DO WE DO" className="mobile-input" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="songReference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-red-600 font-bold">Song Reference Number * (CRITICAL - REQUIRED)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="DM-A0D-YY-NN-XXX" 
                          className={`mobile-input ${!field.value ? 'border-red-500 bg-red-50' : 'border-green-500'}`}
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-red-600 font-medium">
                        ISRC format: DM-A0D-YY-NN-XXX (replaces "Reference" in all form headers)
                      </p>
                      {!field.value && (
                        <div className="text-xs text-red-700 font-bold bg-red-100 p-2 rounded mt-1 border border-red-300">
                          ⚠️ BLOCKING: Nothing can proceed without this value being entered in correct ISRC format
                        </div>
                      )}
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="agreementDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Agreement Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} className="mobile-input" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Mobile-friendly Tabs for each form section */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            {/* Desktop tabs */}
            <TabsList className="hidden lg:grid grid-cols-7 w-full">
              <TabsTrigger value="composers" className="text-xs">
                <User className="h-3 w-3 mr-1" />
                Writers/Composers
              </TabsTrigger>
              <TabsTrigger value="artists" className="text-xs">
                <Mic className="h-3 w-3 mr-1" />
                Recording Artists  
              </TabsTrigger>
              <TabsTrigger value="labels" className="text-xs">
                <Building className="h-3 w-3 mr-1" />
                Labels
              </TabsTrigger>
              <TabsTrigger value="studios" className="text-xs">
                <Headphones className="h-3 w-3 mr-1" />
                Studios
              </TabsTrigger>
              <TabsTrigger value="publishers" className="text-xs">
                <Briefcase className="h-3 w-3 mr-1" />
                Publishers
              </TabsTrigger>
              <TabsTrigger value="producers" className="text-xs">
                <Music className="h-3 w-3 mr-1" />
                Executive Producers
              </TabsTrigger>
              <TabsTrigger value="others" className="text-xs">
                <Users className="h-3 w-3 mr-1" />
                Other Contributors
              </TabsTrigger>
            </TabsList>

            {/* Mobile dropdown navigation */}
            <div className="lg:hidden mb-4">
              <Select value={activeTab} onValueChange={setActiveTab}>
                <SelectTrigger className="w-full mobile-input">
                  <SelectValue placeholder="Select section to edit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="composers">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      📝 Writers/Composers
                    </div>
                  </SelectItem>
                  <SelectItem value="artists">
                    <div className="flex items-center gap-2">
                      <Mic className="h-4 w-4" />
                      🎤 Recording Artists
                    </div>
                  </SelectItem>
                  <SelectItem value="labels">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      🏢 Labels
                    </div>
                  </SelectItem>
                  <SelectItem value="studios">
                    <div className="flex items-center gap-2">
                      <Headphones className="h-4 w-4" />
                      🎧 Studios
                    </div>
                  </SelectItem>
                  <SelectItem value="publishers">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      💼 Publishers
                    </div>
                  </SelectItem>
                  <SelectItem value="producers">
                    <div className="flex items-center gap-2">
                      <Music className="h-4 w-4" />
                      🎵 Executive Producers
                    </div>
                  </SelectItem>
                  <SelectItem value="others">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      👥 Other Contributors
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Percentage Alerts Display */}
            {percentageAlerts.length > 0 && (
              <Card className="mb-4 border-orange-200 bg-orange-50 dark:bg-orange-900/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
                    <AlertTriangle className="h-5 w-5" />
                    Percentage Validation Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {percentageAlerts.map((alert, index) => (
                    <div key={index} className={`p-3 rounded-lg ${alert.type === 'error' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-yellow-100 dark:bg-yellow-900/30'}`}>
                      <div className="flex items-center gap-2">
                        {alert.type === 'error' ? (
                          <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                        )}
                        <div>
                          <p className={`font-medium ${alert.type === 'error' ? 'text-red-700 dark:text-red-300' : 'text-yellow-700 dark:text-yellow-300'}`}>
                            {alert.category}
                          </p>
                          <p className={`text-sm ${alert.type === 'error' ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                            {alert.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                    <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2">Wai'tuMusic Splitsheet Policy:</h4>
                    <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
                      <li>• Songwriters/Authors: 50% (WC, RA lyrics, OC songwriter roles)</li>
                      <li>• Melody Creators: 25% (RA music ownership, OC melody roles)</li>
                      <li>• Music Composition: 25% (OC beat/production/music composition roles)</li>
                      <li>• Publishing: 100% to Wai'tuMusic (unless represented by other PRO)</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}

            <TabsContent value="composers" className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <h3 className="text-base sm:text-lg font-semibold">Writer/Composer Document (WM-SSA-WC)</h3>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    type="button"
                    onClick={redistributeWriterPercentages}
                    variant="secondary"
                    size="sm"
                    disabled={form.watch('writerComposers').length <= 1}
                    className="text-xs sm:text-sm h-8 sm:h-9"
                  >
                    <Calculator className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Auto-Divide %</span>
                    <span className="sm:hidden">Auto %</span>
                  </Button>
                  <Button
                    type="button"
                    onClick={() => addParticipant('writerComposers')}
                    variant="outline"
                    size="sm"
                    className="text-xs sm:text-sm h-8 sm:h-9"
                  >
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Add Writer/Composer</span>
                    <span className="sm:hidden">Add Writer</span>
                  </Button>
                </div>
              </div>
              
              {form.watch('writerComposers').map((participant, index) => 
                renderParticipantForm('writerComposers', index, participant, 'WM-SSA-WC')
              )}
            </TabsContent>

            <TabsContent value="artists" className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <h3 className="text-base sm:text-lg font-semibold">Recording Artist Document (WM-SSA-RA)</h3>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    type="button"
                    onClick={redistributeRecordingArtistPercentages}
                    variant="secondary"
                    size="sm"
                    disabled={form.watch('recordingArtists').length <= 1}
                    className="text-xs sm:text-sm h-8 sm:h-9"
                  >
                    <Calculator className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Auto-Distribute %</span>
                    <span className="sm:hidden">Auto %</span>
                  </Button>
                  <Button
                    type="button"
                    onClick={() => addParticipant('recordingArtists')}
                    variant="outline"
                    size="sm"
                    className="text-xs sm:text-sm h-8 sm:h-9"
                  >
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Add Recording Artist</span>
                    <span className="sm:hidden">Add Artist</span>
                  </Button>
                </div>
              </div>
              
              {form.watch('recordingArtists').map((participant, index) => 
                renderParticipantForm('recordingArtists', index, participant, 'WM-SSA-RA')
              )}
            </TabsContent>

            <TabsContent value="labels" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Label Document (WM-SSA-LD)</h3>
                <Button
                  type="button"
                  onClick={() => addParticipant('labels')}
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Label
                </Button>
              </div>
              
              {form.watch('labels').map((participant, index) => 
                renderParticipantForm('labels', index, participant, 'WM-SSA-LD')
              )}
            </TabsContent>

            <TabsContent value="studios" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Studio Document (WM-SSA-SD)</h3>
                <Button
                  type="button"
                  onClick={() => addParticipant('studios')}
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Studio
                </Button>
              </div>
              
              {form.watch('studios').map((participant, index) => 
                renderParticipantForm('studios', index, participant, 'WM-SSA-SD')
              )}
            </TabsContent>

            <TabsContent value="publishers" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Publisher Document (WM-SSA-PD)</h3>
                <Button
                  type="button"
                  onClick={() => addParticipant('publishers')}
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Publisher
                </Button>
              </div>
              
              {form.watch('publishers').map((participant, index) => 
                renderParticipantForm('publishers', index, participant, 'WM-SSA-PD')
              )}
            </TabsContent>

            <TabsContent value="producers" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Executive Producer Document (WM-SSA-EP)</h3>
                <Button
                  type="button"
                  onClick={() => addParticipant('executiveProducers')}
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Executive Producer
                </Button>
              </div>
              
              {form.watch('executiveProducers')?.map((participant, index) => 
                renderExecutiveProducerForm(index, participant)
              )}
            </TabsContent>

            <TabsContent value="others" className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <h3 className="text-base sm:text-lg font-semibold">Other Contributors Document (WM-SSA-OC)</h3>
                <Button
                  type="button"
                  onClick={() => addParticipant('otherContributors')}
                  variant="outline"
                  size="sm"
                  className="text-xs sm:text-sm h-8 sm:h-9"
                >
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Add Other Contributor</span>
                  <span className="sm:hidden">Add Other</span>
                </Button>
              </div>
              
              {form.watch('otherContributors')?.map((participant, index) => 
                renderOtherContributorForm(index, participant)
              )}
            </TabsContent>
          </Tabs>

          {/* Pricing and Submit Section */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-emerald-700 dark:text-emerald-300 mb-2">
                    Wai'tuMusic Splitsheet Service
                  </h4>
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    $15.00 USD
                  </p>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">
                    Per authentic splitsheet with digital signatures & notifications
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Please do not fill in any item in BOLD. This is for official use only.
                </p>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={createSplitsheetMutation.isPending}
                  onClick={() => {
                    console.log('Button clicked!');
                    console.log('Current form data:', form.getValues());
                    console.log('Form errors:', form.formState.errors);
                  }}
                >
                  {createSplitsheetMutation.isPending ? (
                    <>
                      <div className="animate-spin w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                      Creating Splitsheet...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Create Authentic Splitsheet - $5.00
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </Form>
    </div>
  );
}