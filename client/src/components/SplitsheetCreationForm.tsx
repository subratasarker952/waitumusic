import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useMutation, useQueryClient } from '@tanstack/react-query';
// import { useUser } from '@/lib/auth';
import { 
  splitsheetFormSchema, 
  type SplitsheetFormData,
  type SongwriterData,
  type MelodyCreatorData,
  type BeatCreatorData
} from '@shared/isrcSchema';
import { 
  Users, Music, Building, FileText, 
  Plus, Minus, CheckCircle, AlertTriangle 
} from 'lucide-react';

interface SplitsheetCreationFormProps {
  songTitle: string;
  songReference: string;
  onComplete: (splitsheetId: number) => void;
}

export function SplitsheetCreationForm({ 
  songTitle, 
  songReference, 
  onComplete 
}: SplitsheetCreationFormProps) {
  // const { user } = useUser();
  const user = { username: 'Demo User', email: 'demo@waitumusic.com' }; // Mock user for now
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const splitsheetForm = useForm<SplitsheetFormData>({
    resolver: zodResolver(splitsheetFormSchema),
    defaultValues: {
      songTitle,
      songReference,
      songwriters: [{
        referenceNumber: 1,
        name: user?.username || '',
        address: '',
        proAffiliation: 'ASCAP',
        lyricsOwnership: 50,
        email: user?.email || '',
        ipiNumber: ''
      }],
      melodyCreators: [{
        referenceNumber: 1,
        name: '',
        address: '',
        proAffiliation: 'ASCAP',
        melodyOwnership: 25,
        email: '',
        ipiNumber: ''
      }],
      beatCreators: [{
        referenceNumber: 1,
        name: '',
        address: '',
        proAffiliation: 'ASCAP',
        beatOwnership: 25,
        email: '',
        ipiNumber: ''
      }],
      recordingArtists: [{
        referenceNumber: 1,
        name: user?.username || '',
        address: '',
        proAffiliation: 'ASCAP',
        email: user?.email || '',
        ipiNumber: ''
      }],
      labels: [{
        referenceNumber: 1,
        name: "Wai'tuMusic",
        address: "123 Music Street, Music City, MC 12345",
        phone: "+1-555-MUSIC-01"
      }],
      studios: [],
      publishers: [{
        referenceNumber: 1,
        name: "Wai'tuMusic",
        address: "123 Music Street, Music City, MC 12345",
        proAffiliation: "ASCAP",
        publishingPercentage: 100,
        email: "publishing@waitumusic.com"
      }]
    }
  });

  const createSplitsheetMutation = useMutation({
    mutationFn: async (data: SplitsheetFormData) => {
      const response = await apiRequest('/api/splitsheet-create', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      return response.json();
    },
    onSuccess: (result) => {
      toast({
        title: "Splitsheet Created",
        description: `Splitsheet created successfully. Notifications sent to ${result.notificationsSent} parties.`
      });
      queryClient.invalidateQueries({ queryKey: ['/api/splitsheets'] });
      onComplete(result.splitsheetId);
    },
    onError: (error: any) => {
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create splitsheet",
        variant: "destructive"
      });
    }
  });

  // Calculate percentages automatically
  const calculatePercentages = () => {
    const songwriters = splitsheetForm.watch('songwriters') || [];
    const melodyCreators = splitsheetForm.watch('melodyCreators') || [];
    const beatCreators = splitsheetForm.watch('beatCreators') || [];
    
    const totalSongwriters = songwriters.reduce((sum, sw) => sum + (sw.lyricsOwnership || 0), 0);
    const totalMelody = melodyCreators.reduce((sum, mc) => sum + (mc.melodyOwnership || 0), 0);
    const totalBeat = beatCreators.reduce((sum, bc) => sum + (bc.beatOwnership || 0), 0);
    
    return {
      songwriters: totalSongwriters,
      melody: totalMelody,
      beat: totalBeat,
      total: totalSongwriters + totalMelody + totalBeat
    };
  };

  const percentages = calculatePercentages();
  const isValid = Math.abs(percentages.total - 100) < 0.01;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
          <FileText className="h-6 w-6" />
          Create Splitsheet
        </h2>
        <p className="text-muted-foreground">
          Configure ownership percentages according to Wai'tuMusic policy
        </p>
        <div className="flex items-center justify-center gap-4">
          <Badge variant={isValid ? "default" : "destructive"}>
            Total: {percentages.total.toFixed(1)}%
          </Badge>
          {isValid ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-red-500" />
          )}
        </div>
      </div>

      <Form {...splitsheetForm}>
        <form onSubmit={splitsheetForm.handleSubmit((data) => createSplitsheetMutation.mutate(data))} className="space-y-8">
          
          {/* Wai'tuMusic Policy Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Wai'tuMusic Splitsheet Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <h4 className="font-semibold">Songwriters/Authors</h4>
                  <Badge className="bg-blue-500">50%</Badge>
                  <p className="text-sm text-muted-foreground mt-1">
                    People who wrote the lyrics
                  </p>
                </div>
                <div className="text-center">
                  <h4 className="font-semibold">Melody Creators</h4>
                  <Badge className="bg-green-500">25%</Badge>
                  <p className="text-sm text-muted-foreground mt-1">
                    Who created the melody (producer, singer-songwriter, etc.)
                  </p>
                </div>
                <div className="text-center">
                  <h4 className="font-semibold">Beat/Production</h4>
                  <Badge className="bg-purple-500">25%</Badge>
                  <p className="text-sm text-muted-foreground mt-1">
                    Beat makers, producers, musicians
                  </p>
                </div>
              </div>
              <Separator />
              <div className="text-center">
                <h4 className="font-semibold">Publishing Rights</h4>
                <Badge className="bg-primary">100% to Wai'tuMusic</Badge>
                <p className="text-sm text-muted-foreground mt-1">
                  Unless songwriter is represented by another PRO
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Composition Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="h-5 w-5" />
                Song Composition (Must Total 100%)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Songwriters (50%) */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-base font-medium">
                    Songwriters/Authors ({percentages.songwriters}% of 50% target)
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const current = splitsheetForm.getValues('songwriters') || [];
                      splitsheetForm.setValue('songwriters', [
                        ...current,
                        {
                          referenceNumber: current.length + 1,
                          name: '',
                          address: '',
                          proAffiliation: 'ASCAP',
                          lyricsOwnership: 0,
                          email: '',
                          ipiNumber: ''
                        }
                      ]);
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    Add Songwriter
                  </Button>
                </div>
                
                {splitsheetForm.watch('songwriters')?.map((_, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-3 p-4 border rounded-lg">
                    <FormField
                      control={splitsheetForm.control}
                      name={`songwriters.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Songwriter name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={splitsheetForm.control}
                      name={`songwriters.${index}.lyricsOwnership`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Lyrics %</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0" 
                              max="50" 
                              step="0.1"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={splitsheetForm.control}
                      name={`songwriters.${index}.email`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" placeholder="songwriter@example.com" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={splitsheetForm.control}
                      name={`songwriters.${index}.ipiNumber`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>IPI Number</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="000000000XX" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={splitsheetForm.control}
                      name={`songwriters.${index}.proAffiliation`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>PRO</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="ASCAP" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const current = splitsheetForm.getValues('songwriters') || [];
                          if (current.length > 1) {
                            splitsheetForm.setValue('songwriters', current.filter((_, i) => i !== index));
                          }
                        }}
                        disabled={(splitsheetForm.watch('songwriters')?.length || 0) <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Melody Creators (25%) */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-base font-medium">
                    Melody Creators ({percentages.melody}% of 25% target)
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const current = splitsheetForm.getValues('melodyCreators') || [];
                      splitsheetForm.setValue('melodyCreators', [
                        ...current,
                        {
                          referenceNumber: current.length + 1,
                          name: '',
                          address: '',
                          proAffiliation: 'ASCAP',
                          melodyOwnership: 0,
                          email: '',
                          ipiNumber: ''
                        }
                      ]);
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    Add Melody Creator
                  </Button>
                </div>
                
                {splitsheetForm.watch('melodyCreators')?.map((_, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-3 p-4 border rounded-lg">
                    <FormField
                      control={splitsheetForm.control}
                      name={`melodyCreators.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Melody creator name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={splitsheetForm.control}
                      name={`melodyCreators.${index}.melodyOwnership`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Melody %</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0" 
                              max="25" 
                              step="0.1"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={splitsheetForm.control}
                      name={`melodyCreators.${index}.email`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" placeholder="creator@example.com" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={splitsheetForm.control}
                      name={`melodyCreators.${index}.ipiNumber`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>IPI Number</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="000000000XX" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={splitsheetForm.control}
                      name={`melodyCreators.${index}.proAffiliation`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>PRO</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="ASCAP" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const current = splitsheetForm.getValues('melodyCreators') || [];
                          if (current.length > 1) {
                            splitsheetForm.setValue('melodyCreators', current.filter((_, i) => i !== index));
                          }
                        }}
                        disabled={(splitsheetForm.watch('melodyCreators')?.length || 0) <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Beat Creators (25%) */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-base font-medium">
                    Beat/Production Creators ({percentages.beat}% of 25% target)
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const current = splitsheetForm.getValues('beatCreators') || [];
                      splitsheetForm.setValue('beatCreators', [
                        ...current,
                        {
                          referenceNumber: current.length + 1,
                          name: '',
                          address: '',
                          proAffiliation: 'ASCAP',
                          beatOwnership: 0,
                          email: '',
                          ipiNumber: ''
                        }
                      ]);
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    Add Beat Creator
                  </Button>
                </div>
                
                {splitsheetForm.watch('beatCreators')?.map((_, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-3 p-4 border rounded-lg">
                    <FormField
                      control={splitsheetForm.control}
                      name={`beatCreators.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Beat creator name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={splitsheetForm.control}
                      name={`beatCreators.${index}.beatOwnership`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Beat %</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0" 
                              max="25" 
                              step="0.1"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={splitsheetForm.control}
                      name={`beatCreators.${index}.email`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" placeholder="creator@example.com" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={splitsheetForm.control}
                      name={`beatCreators.${index}.ipiNumber`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>IPI Number</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="000000000XX" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={splitsheetForm.control}
                      name={`beatCreators.${index}.proAffiliation`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>PRO</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="ASCAP" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const current = splitsheetForm.getValues('beatCreators') || [];
                          if (current.length > 1) {
                            splitsheetForm.setValue('beatCreators', current.filter((_, i) => i !== index));
                          }
                        }}
                        disabled={(splitsheetForm.watch('beatCreators')?.length || 0) <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />
              
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Composition Breakdown</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>Songwriters: {percentages.songwriters}%</div>
                  <div>Melody: {percentages.melody}%</div>
                  <div>Beat/Production: {percentages.beat}%</div>
                </div>
                <div className="mt-2 font-bold">
                  Total: {percentages.total}% / 100%
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Publishing Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Publishing Rights (Default: 100% Wai'tuMusic)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Default Publisher: Wai'tuMusic</h4>
                <p className="text-sm text-muted-foreground">
                  Publishing rights default to 100% Wai'tuMusic unless songwriter is represented by another PRO.
                  Contact admin if you need to modify publishing arrangements.
                </p>
                <div className="mt-3">
                  <Badge>Wai'tuMusic - 100% Publishing</Badge>
                  <Badge variant="outline" className="ml-2">ASCAP Affiliated</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              disabled={!isValid || createSplitsheetMutation.isPending}
              className="flex-1"
            >
              {createSplitsheetMutation.isPending ? (
                "Creating Splitsheet..."
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Create Splitsheet & Send Notifications
                </>
              )}
            </Button>
          </div>

          {!isValid && (
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">Percentage Error</span>
              </div>
              <p className="text-sm mt-1">
                Composition percentages must total exactly 100%. Current total: {percentages.total.toFixed(1)}%
              </p>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}