import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { Calendar as CalendarIcon, Save, X, Clock, AlertTriangle } from 'lucide-react';

interface CalendarModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: 'block' | 'schedule' | 'availability';
  title?: string;
}

export default function CalendarModal({ 
  open, 
  onOpenChange, 
  mode = 'block',
  title 
}: CalendarModalProps) {
  const { toast } = useToast();
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    location: '',
    notes: ''
  });

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    setSelectedDates(prev => {
      const exists = prev.some(d => d.toDateString() === date.toDateString());
      if (exists) {
        return prev.filter(d => d.toDateString() !== date.toDateString());
      } else {
        return [...prev, date];
      }
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setEventData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (selectedDates.length === 0) {
      toast({
        title: "No Dates Selected",
        description: "Please select at least one date.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Here you would make an API call based on the mode
      const action = mode === 'block' ? 'blocked' : 
                   mode === 'schedule' ? 'scheduled' : 'updated';
      
      toast({
        title: `Calendar ${action.charAt(0).toUpperCase() + action.slice(1)}`,
        description: `${selectedDates.length} date(s) have been ${action}.`,
      });
      
      onOpenChange(false);
      setSelectedDates([]);
      setEventData({
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        location: '',
        notes: ''
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update calendar. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getModalTitle = () => {
    if (title) return title;
    switch (mode) {
      case 'block': return 'Block Calendar Dates';
      case 'schedule': return 'Schedule Event';
      case 'availability': return 'Update Availability';
      default: return 'Calendar Management';
    }
  };

  const getModalDescription = () => {
    switch (mode) {
      case 'block': return 'Select dates you want to block from bookings.';
      case 'schedule': return 'Schedule a new event or appointment.';
      case 'availability': return 'Update your availability for bookings.';
      default: return 'Manage your calendar settings.';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            {getModalTitle()}
          </DialogTitle>
          <DialogDescription>
            {getModalDescription()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Calendar */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Select Dates</h3>
              {selectedDates.length > 0 && (
                <span className="text-sm text-muted-foreground">
                  {selectedDates.length} date(s) selected
                </span>
              )}
            </div>
            
            <div className="flex justify-center">
              <Calendar
                mode="single"
                onSelect={handleDateSelect}
                className="rounded-md border"
                disabled={(date) => date < new Date()}
              />
            </div>

            {selectedDates.length > 0 && (
              <div className="space-y-2">
                <Label>Selected Dates:</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedDates.map((date, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {date.toLocaleDateString()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Event Details (for schedule mode) */}
          {mode === 'schedule' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Event Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Event Title</Label>
                  <Input
                    id="title"
                    value={eventData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter event title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={eventData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="Event location"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={eventData.startTime}
                    onChange={(e) => handleInputChange('startTime', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={eventData.endTime}
                    onChange={(e) => handleInputChange('endTime', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={eventData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Event description..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={eventData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Additional notes..."
                  rows={2}
                />
              </div>
            </div>
          )}

          {/* Block Reason (for block mode) */}
          {mode === 'block' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Block Details</h3>
              
              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Blocking</Label>
                <Textarea
                  id="reason"
                  value={eventData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Optional: Reason for blocking these dates..."
                  rows={2}
                />
              </div>

              <div className="flex items-start space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">Important:</p>
                  <p>Blocked dates will not be available for new bookings. Existing bookings will not be affected.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            {mode === 'block' ? 'Block Dates' : 
             mode === 'schedule' ? 'Schedule Event' : 
             'Update Availability'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}