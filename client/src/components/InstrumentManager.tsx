import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Edit, Trash2, Music, Filter, Search } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

// Types for instruments
interface Instrument {
  id: number;
  name: string;
  playerName: string;
  type: string;
  mixerGroup: string;
  displayPriority: number;
}

// Form schema for creating/editing instruments
const instrumentFormSchema = z.object({
  name: z.string().min(1, "Instrument name is required"),
  playerName: z.string().min(1, "Player name is required"),
  type: z.string().min(1, "Type is required"),
  mixerGroup: z.string().min(1, "Mixer group is required"),
  displayPriority: z.number().min(1, "Display priority must be at least 1"),
});

type InstrumentFormData = z.infer<typeof instrumentFormSchema>;

// Predefined mixer groups and instrument types
const MIXER_GROUPS = [
  'LEAD_VOCALS', 'BACKGROUND_VOCALS', 'CHOIR', 'DRUMS', 'BASS', 'STRINGS', 'GUITARS',
  'KEYBOARDS', 'KEYS', 'BRASS', 'WOODWINDS', 'WOODWIND', 'PERCUSSION', 'ORCHESTRAL_PERCUSSION', 
  'ORCHESTRAL_STRINGS', 'ELECTRONIC', 'DJ', 'WORLD_INSTRUMENTS', 'WORLD_PERCUSSION', 
  'TECHNICAL', 'VOCALS'
];

const INSTRUMENT_TYPES = [
  'Vocal', 'Percussion', 'Stringed', 'Brass', 'Wind', 'Keyboard', 'Electronic', 'Technical'
];

export default function InstrumentManager() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingInstrument, setEditingInstrument] = useState<Instrument | null>(null);
  const [deletingInstrument, setDeletingInstrument] = useState<Instrument | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch instruments
  const { data: instruments = [], isLoading } = useQuery({
    queryKey: ['/api/instruments'],
    queryFn: () => apiRequest('/api/instruments'),
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['/api/instruments/categories'],
    queryFn: () => apiRequest('/api/instruments/categories'),
  });

  // Create instrument mutation
  const createInstrumentMutation = useMutation({
    mutationFn: (data: InstrumentFormData) => apiRequest('/api/instruments', { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/instruments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/instruments/categories'] });
      setShowAddDialog(false);
      toast({ title: "Success", description: "Instrument created successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create instrument", variant: "destructive" });
    },
  });

  // Update instrument mutation
  const updateInstrumentMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InstrumentFormData> }) =>
      apiRequest(`/api/instruments/${id}`, { method: 'PATCH', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/instruments'] });
      setEditingInstrument(null);
      toast({ title: "Success", description: "Instrument updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update instrument", variant: "destructive" });
    },
  });

  // Delete instrument mutation
  const deleteInstrumentMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/instruments/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/instruments'] });
      setDeletingInstrument(null);
      toast({ title: "Success", description: "Instrument deleted successfully" });
    },
    onError: (error: any) => {
      const message = error?.assignmentsCount > 0 
        ? `Cannot delete instrument - it is currently assigned to ${error.assignmentsCount} booking(s)`
        : "Failed to delete instrument";
      toast({ title: "Error", description: message, variant: "destructive" });
      setDeletingInstrument(null);
    },
  });

  // Form for creating/editing instruments
  const form = useForm<InstrumentFormData>({
    resolver: zodResolver(instrumentFormSchema),
    defaultValues: {
      name: '',
      playerName: '',
      type: '',
      mixerGroup: '',
      displayPriority: 1,
    },
  });

  // Filter instruments based on category and search
  const filteredInstruments = instruments.filter((instrument: Instrument) => {
    const matchesCategory = selectedCategory === 'all' || instrument.mixerGroup === selectedCategory;
    const matchesSearch = searchTerm === '' || 
      instrument.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      instrument.playerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      instrument.type.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Group instruments by mixer group for display
  const groupedInstruments = filteredInstruments.reduce((acc: Record<string, Instrument[]>, instrument: Instrument) => {
    if (!acc[instrument.mixerGroup]) {
      acc[instrument.mixerGroup] = [];
    }
    acc[instrument.mixerGroup].push(instrument);
    return acc;
  }, {});

  const handleSubmit = (data: InstrumentFormData) => {
    if (editingInstrument) {
      updateInstrumentMutation.mutate({ id: editingInstrument.id, data });
    } else {
      createInstrumentMutation.mutate(data);
    }
  };

  const handleEdit = (instrument: Instrument) => {
    setEditingInstrument(instrument);
    form.reset({
      name: instrument.name,
      playerName: instrument.playerName,
      type: instrument.type,
      mixerGroup: instrument.mixerGroup,
      displayPriority: instrument.displayPriority,
    });
  };

  const handleDelete = (instrument: Instrument) => {
    setDeletingInstrument(instrument);
  };

  const confirmDelete = () => {
    if (deletingInstrument) {
      deleteInstrumentMutation.mutate(deletingInstrument.id);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading instruments...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Instrument Database Manager</h2>
          <p className="text-gray-600">Manage the comprehensive instrument database for technical riders</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingInstrument(null);
              form.reset();
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Instrument
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingInstrument ? 'Edit Instrument' : 'Add New Instrument'}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instrument Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Drum Kit - Kick" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="playerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Player Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Drummer" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instrument Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {INSTRUMENT_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mixerGroup"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mixer Group</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select mixer group" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {MIXER_GROUPS.map((group) => (
                            <SelectItem key={group} value={group}>{group}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="displayPriority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Priority</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
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
                  <Button type="submit" disabled={createInstrumentMutation.isPending || updateInstrumentMutation.isPending}>
                    {editingInstrument ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Music className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Total Instruments</p>
                <p className="text-2xl font-bold">{instruments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Mixer Groups</p>
                <p className="text-2xl font-bold">{categories.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Search className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Filtered Results</p>
                <p className="text-2xl font-bold">{filteredInstruments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Music className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Groups Showing</p>
                <p className="text-2xl font-bold">{Object.keys(groupedInstruments).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search instruments, players, or types..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="md:w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category: string) => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Instruments Display */}
      <div className="space-y-6">
        {Object.entries(groupedInstruments).map(([mixerGroup, groupInstruments]) => (
          <Card key={mixerGroup}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Badge variant="outline">{mixerGroup}</Badge>
                  <span className="text-sm text-gray-500">({(groupInstruments as Instrument[]).length} instruments)</span>
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(groupInstruments as Instrument[]).map((instrument: Instrument) => (
                  <div key={instrument.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{instrument.name}</h4>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            handleEdit(instrument);
                            setShowAddDialog(true);
                          }}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(instrument)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">Player: {instrument.playerName}</p>
                    <p className="text-sm text-gray-600">Type: {instrument.type}</p>
                    <p className="text-sm text-gray-600">Priority: {instrument.displayPriority}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingInstrument} onOpenChange={() => setDeletingInstrument(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Instrument</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingInstrument?.name}"? This action cannot be undone.
              {deletingInstrument && (
                <div className="mt-2 text-sm">
                  <strong>Player:</strong> {deletingInstrument.playerName}<br />
                  <strong>Type:</strong> {deletingInstrument.type}<br />
                  <strong>Mixer Group:</strong> {deletingInstrument.mixerGroup}
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              disabled={deleteInstrumentMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}