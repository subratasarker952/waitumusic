import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  Music, 
  Briefcase,
  Users,
  MapPin,
  Edit,
  Trash2
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface AdvancedCalendarProps {
  user: any;
  eventTypes?: string[];
}

export default function AdvancedCalendar({ user, eventTypes = ['booking', 'consultation', 'session', 'event'] }: AdvancedCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [eventForm, setEventForm] = useState({
    title: '',
    type: '',
    startTime: '',
    endTime: '',
    location: '',
    description: '',
    attendees: ''
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch calendar events
  const { data: events, isLoading } = useQuery({
    queryKey: ['/api/calendar/events', user.id],
    queryFn: async () => {
      const response = await apiRequest(`/api/calendar/events?userId=${user.id}`);
      return await response.json();
    },
  });

  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: async (eventData: any) => {
      const response = await apiRequest('/api/calendar/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...eventData, userId: user.id })
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/calendar/events'] });
      setIsEventModalOpen(false);
      resetForm();
      toast({
        title: "Event Created",
        description: "Your calendar event has been created successfully.",
      });
    },
  });

  // Update event mutation
  const updateEventMutation = useMutation({
    mutationFn: async (eventData: any) => {
      const response = await apiRequest(`/api/calendar/events/${eventData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/calendar/events'] });
      setSelectedEvent(null);
      resetForm();
      toast({
        title: "Event Updated",
        description: "Your calendar event has been updated successfully.",
      });
    },
  });

  // Delete event mutation
  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: number) => {
      const response = await apiRequest(`/api/calendar/events/${eventId}`, {
        method: 'DELETE'
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/calendar/events'] });
      setSelectedEvent(null);
      toast({
        title: "Event Deleted",
        description: "The calendar event has been deleted.",
      });
    },
  });

  const resetForm = () => {
    setEventForm({
      title: '',
      type: '',
      startTime: '',
      endTime: '',
      location: '',
      description: '',
      attendees: ''
    });
  };

  const handleEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const eventData = {
      ...eventForm,
      date: selectedDate?.toISOString().split('T')[0],
      attendees: eventForm.attendees.split(',').map(a => a.trim()).filter(Boolean)
    };

    if (selectedEvent) {
      updateEventMutation.mutate({ ...eventData, id: selectedEvent.id });
    } else {
      createEventMutation.mutate(eventData);
    }
  };

  const handleEditEvent = (event: any) => {
    setSelectedEvent(event);
    setEventForm({
      title: event.title,
      type: event.type,
      startTime: event.startTime,
      endTime: event.endTime,
      location: event.location || '',
      description: event.description || '',
      attendees: event.attendees ? event.attendees.join(', ') : ''
    });
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'booking': return <Music className="h-4 w-4" />;
      case 'consultation': return <Briefcase className="h-4 w-4" />;
      case 'session': return <Users className="h-4 w-4" />;
      case 'event': return <CalendarIcon className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'booking': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'consultation': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'session': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'event': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const calendarEvents = events || [
    {
      id: 1,
      title: "Studio Session with JCro",
      type: "booking",
      date: "2024-02-15",
      startTime: "14:00",
      endTime: "16:00",
      location: "Main Studio",
      description: "Recording session for new track",
      attendees: ["JCro", "Sound Engineer"]
    },
    {
      id: 2,
      title: "Marketing Strategy Meeting",
      type: "consultation",
      date: "2024-02-16",
      startTime: "10:00",
      endTime: "11:30",
      location: "Office",
      description: "Discuss promotional campaign",
      attendees: ["Marketing Team", "Artist Manager"]
    }
  ];

  const selectedDateEvents = calendarEvents.filter((event: any) => 
    event.date === selectedDate?.toISOString().split('T')[0]
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-96 bg-gray-200 rounded-lg"></div>
            <div className="h-96 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Advanced Calendar</h3>
          <p className="text-gray-600 dark:text-gray-400">Manage your schedule and events</p>
        </div>
        <Dialog open={isEventModalOpen} onOpenChange={setIsEventModalOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{selectedEvent ? 'Edit Event' : 'Add New Event'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEventSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Event Title</Label>
                <Input
                  id="title"
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  placeholder="Enter event title"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Event Type</Label>
                  <Select value={eventForm.type} onValueChange={(value) => setEventForm({ ...eventForm, type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {eventTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          <div className="flex items-center gap-2">
                            {getEventTypeIcon(type)}
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={eventForm.location}
                    onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                    placeholder="Event location"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={eventForm.startTime}
                    onChange={(e) => setEventForm({ ...eventForm, startTime: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={eventForm.endTime}
                    onChange={(e) => setEventForm({ ...eventForm, endTime: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="attendees">Attendees (comma-separated)</Label>
                <Input
                  id="attendees"
                  value={eventForm.attendees}
                  onChange={(e) => setEventForm({ ...eventForm, attendees: e.target.value })}
                  placeholder="John Doe, Jane Smith, ..."
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  placeholder="Event description"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => {
                  setIsEventModalOpen(false);
                  setSelectedEvent(null);
                  resetForm();
                }}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createEventMutation.isPending || updateEventMutation.isPending}>
                  {selectedEvent ? 'Update' : 'Create'} Event
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Calendar and Events Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Calendar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
            />
            
            {/* Mini Event List for Selected Date */}
            <div className="mt-4">
              <h4 className="font-semibold mb-2">
                Events for {selectedDate?.toLocaleDateString()}
              </h4>
              {selectedDateEvents.length > 0 ? (
                <div className="space-y-2">
                  {selectedDateEvents.map((event: any) => (
                    <div key={event.id} className="p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                      <div className="flex items-center gap-2">
                        {getEventTypeIcon(event.type)}
                        <span className="font-medium">{event.title}</span>
                      </div>
                      <div className="text-gray-600 dark:text-gray-400 ml-6">
                        {event.startTime} - {event.endTime}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No events scheduled</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Event Details */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold">Upcoming Events</h4>
          
          {calendarEvents
            .filter((event: any) => new Date(event.date) >= new Date())
            .slice(0, 5)
            .map((event: any) => (
              <Card key={event.id} className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getEventTypeIcon(event.type)}
                      <h5 className="font-semibold text-gray-900 dark:text-white">{event.title}</h5>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          handleEditEvent(event);
                          setIsEventModalOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteEventMutation.mutate(event.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <CalendarIcon className="h-4 w-4" />
                      {event.date}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Clock className="h-4 w-4" />
                      {event.startTime} - {event.endTime}
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <MapPin className="h-4 w-4" />
                        {event.location}
                      </div>
                    )}
                    <Badge className={getEventTypeColor(event.type)}>
                      {event.type}
                    </Badge>
                  </div>
                  
                  {event.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      {event.description}
                    </p>
                  )}
                  
                  {event.attendees && event.attendees.length > 0 && (
                    <div className="mt-2">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Users className="h-3 w-3" />
                        {event.attendees.length} attendee{event.attendees.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          
          {calendarEvents.filter((event: any) => new Date(event.date) >= new Date()).length === 0 && (
            <Card className="p-8 text-center">
              <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Upcoming Events</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Your calendar is clear. Add some events to get started.</p>
              <Button onClick={() => setIsEventModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Event
              </Button>
            </Card>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {eventTypes.map((type) => {
          const count = calendarEvents.filter((event: any) => event.type === type).length;
          return (
            <Card key={type} className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                {getEventTypeIcon(type)}
                <span className="font-semibold capitalize">{type}s</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{count}</div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}