import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths, isAfter, isBefore, startOfDay } from 'date-fns';

interface BookingCalendarProps {
  selectedDates: Date[];
  onDateSelect: (dates: Date[]) => void;
  bookedDates?: Date[];
  unavailableDates?: Date[];
  multiSelect?: boolean;
}

export default function BookingCalendar({
  selectedDates,
  onDateSelect,
  bookedDates = [],
  unavailableDates = [],
  multiSelect = false
}: BookingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const today = startOfDay(new Date());

  const isDateBooked = (date: Date) => {
    return bookedDates.some(bookedDate => 
      format(bookedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  };

  const isDateUnavailable = (date: Date) => {
    return unavailableDates.some(unavailableDate => 
      format(unavailableDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  };

  const isDatePast = (date: Date) => {
    return isBefore(date, today);
  };

  const isDateSelected = (date: Date) => {
    return selectedDates.some(selectedDate => 
      format(selectedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  };

  const getDateStatus = (date: Date) => {
    if (isDatePast(date)) return 'past';
    if (isDateBooked(date)) return 'booked';
    if (isDateUnavailable(date)) return 'unavailable';
    return 'available';
  };

  const handleDateClick = (date: Date | undefined) => {
    if (!date) return;
    
    const status = getDateStatus(date);
    if (status !== 'available') return;

    if (multiSelect) {
      if (isDateSelected(date)) {
        // Remove date if already selected
        onDateSelect(selectedDates.filter(selectedDate => 
          format(selectedDate, 'yyyy-MM-dd') !== format(date, 'yyyy-MM-dd')
        ));
      } else {
        // Add date to selection
        onDateSelect([...selectedDates, date]);
      }
    } else {
      // Single select
      onDateSelect([date]);
    }
  };

  const DayContent = ({ date }: { date: Date }) => {
    const status = getDateStatus(date);
    const isSelected = isDateSelected(date);
    
    let className = 'w-full h-full flex items-center justify-center text-sm font-medium rounded cursor-pointer transition-colors ';
    
    if (isSelected) {
      className += 'bg-primary text-primary-foreground ';
    } else {
      switch (status) {
        case 'available':
          className += 'calendar-available ';
          break;
        case 'booked':
          className += 'calendar-booked cursor-not-allowed ';
          break;
        case 'unavailable':
          className += 'calendar-unavailable cursor-not-allowed ';
          break;
        case 'past':
          className += 'calendar-past cursor-not-allowed ';
          break;
      }
    }

    return (
      <div 
        className={className}
        onClick={() => handleDateClick(date)}
      >
        {format(date, 'd')}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{format(currentMonth, 'MMMM yyyy')}</CardTitle>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Calendar
            mode={multiSelect ? "multiple" : "single"}
            selected={multiSelect ? selectedDates : selectedDates[0]}
            onSelect={multiSelect ? onDateSelect : (date) => handleDateClick(date)}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            components={{
              Day: ({ date }) => <DayContent date={date} />
            }}
            className="rounded-md border"
          />
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span>Booked</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span>Unavailable</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-400 rounded"></div>
              <span>Past dates</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
