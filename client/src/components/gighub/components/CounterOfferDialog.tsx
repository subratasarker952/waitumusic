import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { DollarSign, Loader2 } from 'lucide-react';

interface CounterOfferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: number;
  currentPrice: string | null;
  onSuccess: () => void;
}

export function CounterOfferDialog({ 
  open, 
  onOpenChange, 
  bookingId, 
  currentPrice,
  onSuccess 
}: CounterOfferDialogProps) {
  const { toast } = useToast();
  const [proposedPrice, setProposedPrice] = useState(currentPrice || '');
  const [reason, setReason] = useState('');

  const counterOfferMutation = useMutation({
    mutationFn: async () => {
      return apiRequest(`/api/bookings/${bookingId}/talent-response`, {
        method: 'POST',
        body: {
          action: 'counter_offer',
          proposedPrice: parseFloat(proposedPrice),
          reason
        }
      });
    },
    onSuccess: () => {
      toast({
        title: "Counter Offer Sent",
        description: "Your counter offer has been submitted for review."
      });
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Failed to Send",
        description: "Unable to submit counter offer. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!proposedPrice || parseFloat(proposedPrice) <= 0) {
      toast({
        title: "Invalid Price",
        description: "Please enter a valid price amount.",
        variant: "destructive"
      });
      return;
    }

    counterOfferMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Submit Counter Offer</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="current-price">Current Offer</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="current-price"
                  value={currentPrice || 'TBD'}
                  disabled
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="proposed-price">Your Counter Offer</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="proposed-price"
                  type="number"
                  step="0.01"
                  value={proposedPrice}
                  onChange={(e) => setProposedPrice(e.target.value)}
                  placeholder="Enter amount"
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Counter Offer</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain your counter offer (optional)"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={counterOfferMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={counterOfferMutation.isPending}
            >
              {counterOfferMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Submit Counter Offer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}