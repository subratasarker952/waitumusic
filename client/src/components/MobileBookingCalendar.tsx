import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Calendar, X } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, 
         isSameMonth, isToday, isSameDay, getDay, addDays } from 'date-fns';

interface MobileBookingCalendarProps {
  selectedDates: Date[];
  onDateSelect: (dates: Date[]) => void;
  bookedDates?: Date[];
  unavailableDates?: Date[];
  multiSelect?: boolean;
  onClose?: () => void;
}

export default function MobileBookingCalendar({
  selectedDates,
  onDateSelect,
  bookedDates = [],
  unavailableDates = [],
  multiSelect = false,
  onClose
}: MobileBookingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const today = new Date();

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  
  // Get calendar days including previous/next month to fill grid
  const firstDayOfWeek = getDay(monthStart);
  const calendarStart = addDays(monthStart, -firstDayOfWeek);
  const lastDayOfWeek = getDay(monthEnd);
  const calendarEnd = addDays(monthEnd, 6 - lastDayOfWeek);
  
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const isDateBooked = (date: Date) => {
    return bookedDates.some(bookedDate => isSameDay(bookedDate, date));
  };

  const isDateUnavailable = (date: Date) => {
    return unavailableDates.some(unavailableDate => isSameDay(unavailableDate, date));
  };

  const isDateSelected = (date: Date) => {
    return selectedDates.some(selectedDate => isSameDay(selectedDate, date));
  };

  const isDatePast = (date: Date) => {
    return date < today && !isToday(date);
  };

  const getDateStatus = (date: Date) => {
    if (isDatePast(date)) return 'past';
    if (isDateBooked(date)) return 'booked';
    if (isDateUnavailable(date)) return 'unavailable';
    if (isDateSelected(date)) return 'selected';
    return 'available';
  };

  const handleDateClick = (date: Date) => {
    const status = getDateStatus(date);
    if (status === 'past' || status === 'booked' || status === 'unavailable') return;

    if (multiSelect) {
      if (isDateSelected(date)) {
        onDateSelect(selectedDates.filter(selectedDate => !isSameDay(selectedDate, date)));
      } else {
        onDateSelect([...selectedDates, date]);
      }
    } else {
      onDateSelect([date]);
    }
  };

  const getDateClasses = (date: Date, status: string) => {
    const baseClasses = "h-12 w-12 flex items-center justify-center text-sm font-medium rounded-lg transition-colors";
    const isCurrentMonth = isSameMonth(date, currentMonth);
    
    if (!isCurrentMonth) {
      return `${baseClasses} text-gray-300 cursor-default`;
    }

    switch (status) {
      case 'past':
        return `${baseClasses} text-gray-400 cursor-not-allowed`;
      case 'booked':
        return `${baseClasses} bg-red-100 text-red-600 cursor-not-allowed`;
      case 'unavailable':
        return `${baseClasses} bg-gray-100 text-gray-500 cursor-not-allowed`;
      case 'selected':
        return `${baseClasses} bg-primary text-white`;
      case 'available':
        if (isToday(date)) {
          return `${baseClasses} bg-blue-50 text-blue-600 border-2 border-blue-200 hover:bg-blue-100`;
        }
        return `${baseClasses} hover:bg-gray-100 cursor-pointer`;
      default:
        return baseClasses;
    }
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col md:relative md:inset-auto md:bg-transparent md:z-auto">
      {/* Mobile Header */}
      <div className="flex items-center justify-between p-4 border-b md:hidden">
        <h2 className="text-lg font-semibold">Select Dates</h2>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      <Card className="flex-1 border-0 md:border">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <CardTitle className="text-lg font-semibold">
              {format(currentMonth, 'MMMM yyyy')}
            </CardTitle>
            
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pb-6">
          {/* Week days header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map(day => (
              <div key={day} className="h-8 flex items-center justify-center text-xs font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((date, index) => {
              const status = getDateStatus(date);
              return (
                <button
                  key={index}
                  onClick={() => handleDateClick(date)}
                  className={getDateClasses(date, status)}
                  disabled={status === 'past' || status === 'booked' || status === 'unavailable'}
                >
                  {format(date, 'd')}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 space-y-2">
            <div className="flex flex-wrap gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-primary rounded"></div>
                <span>Selected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div>
                <span>Booked</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-100 border border-gray-200 rounded"></div>
                <span>Unavailable</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-50 border-2 border-blue-200 rounded"></div>
                <span>Today</span>
              </div>
            </div>
          </div>

          {/* Selected dates summary */}
          {selectedDates.length > 0 && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium mb-2">
                Selected {multiSelect ? 'Dates' : 'Date'}:
              </div>
              <div className="flex flex-wrap gap-1">
                {selectedDates.map((date, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {format(date, 'MMM d')}
                    {multiSelect && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDateSelect(selectedDates.filter(d => !isSameDay(d, date)));
                        }}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mobile action buttons */}
      <div className="p-4 border-t md:hidden">
        <div className="flex flex-col xs:flex-row gap-3">
          {onClose && (
            <Button variant="outline" onClick={onClose} className="w-full xs:flex-1">
              Cancel
            </Button>
          )}
          <Button 
            onClick={() => onClose && onClose()} 
            className="w-full xs:flex-1"
            disabled={selectedDates.length === 0}
          >
            Confirm ({selectedDates.length})
          </Button>
        </div>
      </div>
    </div>
  );
}