import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Edit, Trash2, Music, Star, Settings } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface MusicianInstrumentPreference {
  id: number;
  instrumentId: number;
  proficiencyLevel: string;
  isPrimary: boolean;
  specializations?: string;
  equipmentNotes?: string;
  technicalRequirements?: string;
  preferredSetup?: string;
  isActive: boolean;
  instrumentName: string;
  instrumentType: string;
  mixerGroup: string;
}

interface Instrument {
  id: number;
  name: string;
  playerName: string;
  type: string;
  mixerGroup: string;
  displayPriority: number;
}

const preferenceFormSchema = z.object({
  instrumentId: z.number().min(1, "Please select an instrument"),
  proficiencyLevel: z.enum(['beginner', 'intermediate', 'advanced', 'professional']),
  isPrimary: z.boolean().default(false),
  specializations: z.string().optional(),
  equipmentNotes: z.string().optional(),
  technicalRequirements: z.string().optional(),
  preferredSetup: z.string().optional(),
});

type PreferenceFormData = z.infer<typeof preferenceFormSchema>;

const PROFICIENCY_LEVELS = [
  { value: 'beginner', label: 'Beginner', color: 'bg-red-100 text-red-800' },
  { value: 'intermediate', label: 'Intermediate', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'advanced', label: 'Advanced', color: 'bg-blue-100 text-blue-800' },
  { value: 'professional', label: 'Professional', color: 'bg-green-100 text-green-800' }
];

interface MusicianInstrumentPreferencesProps {
  musicianUserId: number;
  musicianName: string;
  canEdit?: boolean;
}

export default function MusicianInstrumentPreferences({
  musicianUserId,
  musicianName,
  canEdit = false
}: MusicianInstrumentPreferencesProps) {
  const [editingPreference, setEditingPreference] = useState<MusicianInstrumentPreference | null>(null);
  const [deletingPreference, setDeletingPreference] = useState<MusicianInstrumentPreference | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch musician's instrument preferences
  const { data: preferences = [], isLoading } = useQuery({
    queryKey: [`/api/musicians/${musicianUserId}/instrument-preferences`],
    queryFn: () => apiRequest(`/api/musicians/${musicianUserId}/instrument-preferences`),
  });

  // Fetch recommended instruments (ones not already selected)
  const { data: recommendedInstruments = [] } = useQuery({
    queryKey: [`/api/musicians/${musicianUserId}/recommended-instruments`],
    queryFn: () => apiRequest(`/api/musicians/${musicianUserId}/recommended-instruments`),
    enabled: showAddDialog,
  });

  // Create preference mutation
  const createPreferenceMutation = useMutation({
    mutationFn: (data: PreferenceFormData) =>
      apiRequest(`/api/musicians/${musicianUserId}/instrument-preferences`, { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/musicians/${musicianUserId}/instrument-preferences`] });
      setShowAddDialog(false);
      toast({ title: "Success", description: "Instrument preference added successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add instrument preference", variant: "destructive" });
    },
  });

  // Update preference mutation
  const updatePreferenceMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<PreferenceFormData> }) =>
      apiRequest(`/api/musicians/instrument-preferences/${id}`, { method: 'PATCH', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/musicians/${musicianUserId}/instrument-preferences`] });
      setEditingPreference(null);
      toast({ title: "Success", description: "Instrument preference updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update instrument preference", variant: "destructive" });
    },
  });

  // Delete preference mutation
  const deletePreferenceMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/musicians/instrument-preferences/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/musicians/${musicianUserId}/instrument-preferences`] });
      setDeletingPreference(null);
      toast({ title: "Success", description: "Instrument preference removed successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to remove instrument preference", variant: "destructive" });
    },
  });

  const form = useForm<PreferenceFormData>({
    resolver: zodResolver(preferenceFormSchema),
    defaultValues: {
      instrumentId: 0,
      proficiencyLevel: 'intermediate',
      isPrimary: false,
      specializations: '',
      equipmentNotes: '',
      technicalRequirements: '',
      preferredSetup: '',
    },
  });

  const handleSubmit = (data: PreferenceFormData) => {
    if (editingPreference) {
      updatePreferenceMutation.mutate({ id: editingPreference.id, data });
    } else {
      createPreferenceMutation.mutate(data);
    }
  };

  const handleEdit = (preference: MusicianInstrumentPreference) => {
    setEditingPreference(preference);
    form.reset({
      instrumentId: preference.instrumentId,
      proficiencyLevel: preference.proficiencyLevel as any,
      isPrimary: preference.isPrimary,
      specializations: preference.specializations || '',
      equipmentNotes: preference.equipmentNotes || '',
      technicalRequirements: preference.technicalRequirements || '',
      preferredSetup: preference.preferredSetup || '',
    });
  };

  const handleDelete = (preference: MusicianInstrumentPreference) => {
    setDeletingPreference(preference);
  };

  const confirmDelete = () => {
    if (deletingPreference) {
      deletePreferenceMutation.mutate(deletingPreference.id);
    }
  };

  const getProficiencyBadge = (level: string) => {
    const config = PROFICIENCY_LEVELS.find(p => p.value === level);
    return config ? { label: config.label, className: config.color } : { label: level, className: 'bg-gray-100 text-gray-800' };
  };

  // Group preferences by mixer group for organized display
  const groupedPreferences = (preferences as MusicianInstrumentPreference[]).reduce((acc: Record<string, MusicianInstrumentPreference[]>, pref: MusicianInstrumentPreference) => {
    if (!acc[pref.mixerGroup]) {
      acc[pref.mixerGroup] = [];
    }
    acc[pref.mixerGroup].push(pref);
    return acc;
  }, {});

  const primaryInstrument = (preferences as MusicianInstrumentPreference[]).find((p: MusicianInstrumentPreference) => p.isPrimary);

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading instrument preferences...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">Instrument Preferences - {musicianName}</h3>
          <p className="text-gray-600">Manage instrument skills and technical requirements</p>
          {primaryInstrument && (
            <div className="flex items-center mt-2">
              <Star className="h-4 w-4 text-yellow-500 mr-2" />
              <span className="text-sm">Primary: {primaryInstrument.instrumentName}</span>
            </div>
          )}
        </div>
        {canEdit && (
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingPreference(null);
                form.reset();
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Instrument
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingPreference ? 'Edit Instrument Preference' : 'Add Instrument Preference'}
                </DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  {!editingPreference && (
                    <FormField
                      control={form.control}
                      name="instrumentId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Instrument</FormLabel>
                          <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select an instrument" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {recommendedInstruments.map((instrument: Instrument) => (
                                <SelectItem key={instrument.id} value={instrument.id ? instrument.id.toString() : `instrument-${Math.random()}`}>
                                  {instrument.name} ({instrument.mixerGroup})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="proficiencyLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Proficiency Level</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select proficiency level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {PROFICIENCY_LEVELS.map((level) => (
                              <SelectItem key={level.value} value={level.value ? level.value : `level-${Math.random()}`}>{level.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isPrimary"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Primary Instrument</FormLabel>
                          <div className="text-sm text-gray-600">
                            Mark this as your main instrument
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="specializations"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Specializations (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="e.g., jazz brushes, rock double kick, electronic triggers"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="equipmentNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Equipment Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Personal equipment preferences, brand preferences, etc."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="technicalRequirements"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Technical Requirements (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Specific technical needs, mixer requirements, etc."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="preferredSetup"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Setup (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Stage positioning, monitor preferences, etc."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createPreferenceMutation.isPending || updatePreferenceMutation.isPending}>
                      {editingPreference ? 'Update' : 'Add'}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Instrument Preferences Display */}
      {Object.keys(groupedPreferences).length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Music className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No Instrument Preferences</h4>
            <p className="text-gray-600 mb-4">
              {canEdit ? "Add instruments to customize technical rider generation" : "This musician hasn't specified any instrument preferences yet"}
            </p>
            {canEdit && (
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Instrument
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedPreferences).map(([mixerGroup, groupPreferences]) => (
            <Card key={mixerGroup}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Badge variant="outline">{mixerGroup}</Badge>
                  <span className="text-sm text-gray-500">({groupPreferences.length} instruments)</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {groupPreferences.map((preference) => {
                    const proficiencyBadge = getProficiencyBadge(preference.proficiencyLevel);
                    return (
                      <div key={preference.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium">{preference.instrumentName}</h4>
                            {preference.isPrimary && <Star className="h-4 w-4 text-yellow-500" />}
                          </div>
                          {canEdit && (
                            <div className="flex space-x-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  handleEdit(preference);
                                  setShowAddDialog(true);
                                }}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDelete(preference)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Badge className={proficiencyBadge.className}>
                              {proficiencyBadge.label}
                            </Badge>
                            <span className="text-sm text-gray-600">{preference.instrumentType}</span>
                          </div>

                          {preference.specializations && (
                            <div>
                              <p className="text-xs font-medium text-gray-700">Specializations:</p>
                              <p className="text-sm text-gray-600">{preference.specializations}</p>
                            </div>
                          )}

                          {preference.equipmentNotes && (
                            <div>
                              <p className="text-xs font-medium text-gray-700">Equipment:</p>
                              <p className="text-sm text-gray-600">{preference.equipmentNotes}</p>
                            </div>
                          )}

                          {preference.technicalRequirements && (
                            <div>
                              <p className="text-xs font-medium text-gray-700">Technical:</p>
                              <p className="text-sm text-gray-600">{preference.technicalRequirements}</p>
                            </div>
                          )}

                          {preference.preferredSetup && (
                            <div>
                              <p className="text-xs font-medium text-gray-700">Setup:</p>
                              <p className="text-sm text-gray-600">{preference.preferredSetup}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingPreference} onOpenChange={() => setDeletingPreference(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Instrument Preference</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove "{deletingPreference?.instrumentName}" from {musicianName}'s instrument preferences?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deletePreferenceMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}