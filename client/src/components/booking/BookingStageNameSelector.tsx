import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Crown, Calendar, Star } from 'lucide-react';

interface BookingStageNameSelectorProps {
  artistStageNames?: Array<{
    name: string;
    isPrimary?: boolean;
    isForBookings?: boolean;
    usageType?: 'primary' | 'bookings' | 'both';
  }>;
  selectedStageName?: string;
  onStageNameChange: (stageName: string) => void;
  label?: string;
  required?: boolean;
}

export default function BookingStageNameSelector({
  artistStageNames = [],
  selectedStageName,
  onStageNameChange,
  label = "Performance Name",
  required = false
}: BookingStageNameSelectorProps) {
  // Filter stage names available for bookings
  const bookingStageNames = artistStageNames.filter(sn => 
    sn.isForBookings || sn.usageType === 'bookings' || sn.usageType === 'both'
  );

  // Get default stage name (first booking-available name, or first 'both' type)
  const getDefaultStageName = () => {
    const bothNames = bookingStageNames.filter(sn => sn.usageType === 'both');
    if (bothNames.length > 0) return bothNames[0].name;
    
    const bookingOnlyNames = bookingStageNames.filter(sn => sn.usageType === 'bookings');
    if (bookingOnlyNames.length > 0) return bookingOnlyNames[0].name;
    
    return bookingStageNames[0]?.name;
  };

  const getStageNameIcon = (stageName: any) => {
    switch (stageName.usageType) {
      case 'primary': return <Crown className="w-3 h-3" />;
      case 'bookings': return <Calendar className="w-3 h-3" />;
      case 'both': return <Star className="w-3 h-3" />;
      default: return <Calendar className="w-3 h-3" />;
    }
  };

  const getStageNameBadgeColor = (stageName: any) => {
    switch (stageName.usageType) {
      case 'primary': return 'bg-purple-500 text-white';
      case 'bookings': return 'bg-blue-500 text-white';
      case 'both': return 'bg-gradient-to-r from-purple-500 to-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  // Auto-select default if nothing selected
  React.useEffect(() => {
    if (!selectedStageName && bookingStageNames.length > 0) {
      const defaultName = getDefaultStageName();
      if (defaultName) {
        onStageNameChange(defaultName);
      }
    }
  }, [bookingStageNames, selectedStageName, onStageNameChange]);

  if (bookingStageNames.length === 0) {
    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium text-muted-foreground">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
        <div className="p-4 border border-dashed border-gray-300 rounded-lg text-center">
          <p className="text-sm text-muted-foreground">
            No stage names available for bookings. Artist needs to add stage names marked for "Bookings" or "Both".
          </p>
        </div>
      </div>
    );
  }

  if (bookingStageNames.length === 1) {
    const singleName = bookingStageNames[0];
    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
        <div className="flex items-center gap-2 p-3 border rounded-lg bg-muted/50">
          <Badge className={`${getStageNameBadgeColor(singleName)} flex items-center gap-1`}>
            {getStageNameIcon(singleName)}
            {singleName.usageType}
          </Badge>
          <span className="font-medium">{singleName.name}</span>
          <span className="text-xs text-muted-foreground">(Auto-selected)</span>
        </div>
        <input type="hidden" value={singleName.name} />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <div className="space-y-3">
        <Select value={selectedStageName} onValueChange={onStageNameChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select performance name for this booking" />
          </SelectTrigger>
          <SelectContent>
            {bookingStageNames.map((stageName, index) => (
              <SelectItem key={index} value={stageName.name}>
                <div className="flex items-center gap-2">
                  <Badge className={`${getStageNameBadgeColor(stageName)} flex items-center gap-1 text-xs`}>
                    {getStageNameIcon(stageName)}
                    {stageName.usageType}
                  </Badge>
                  <span>{stageName.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {/* Current Selection Display */}
        {selectedStageName && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">Selected for Contract:</span>
              <span className="font-semibold">{selectedStageName}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              This name will appear on all booking contracts and legal documents.
            </p>
          </div>
        )}

        {/* Help Text */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Note:</strong> Only stage names marked for "Bookings" or "Both" are available for selection.</p>
          <p>The default selection prioritizes "Both" type names, then "Bookings" only names.</p>
        </div>
      </div>
    </div>
  );
}