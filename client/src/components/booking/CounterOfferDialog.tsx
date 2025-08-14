import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, Globe, ArrowRight } from 'lucide-react';

interface CounterOfferDialogProps {
  open: boolean;
  onClose: () => void;
  currencies: any[];
  currentRate: {
    adminSetRate: number;
    originalCurrency: string;
    originalAmount: number;
  };
  onSubmit: (counterOffer: {
    currency: string;
    amount: number;
    usdEquivalent: number;
    message: string;
  }) => void;
}

export default function CounterOfferDialog({
  open,
  onClose,
  currencies,
  currentRate,
  onSubmit
}: CounterOfferDialogProps) {
  const [currency, setCurrency] = useState('USD');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});

  React.useEffect(() => {
    // Create exchange rates map from currencies
    const ratesMap: Record<string, number> = {};
    currencies.forEach((curr: any) => {
      ratesMap[curr.code] = curr.exchangeRate || 1;
    });
    setExchangeRates(ratesMap);
  }, [currencies]);

  const convertToUSD = (amount: number, fromCurrency: string): number => {
    if (fromCurrency === 'USD') return amount;
    const fromRate = exchangeRates[fromCurrency] || 1;
    return amount / fromRate;
  };

  const formatCurrency = (amount: number, currency: string): string => {
    const currencyInfo = currencies.find(c => c.code === currency);
    return `${currencyInfo?.symbol || '$'}${amount.toFixed(2)}`;
  };

  const handleSubmit = () => {
    if (!amount || !currency || !message.trim()) {
      return;
    }

    const numericAmount = parseFloat(amount);
    const usdEquivalent = convertToUSD(numericAmount, currency);

    onSubmit({
      currency,
      amount: numericAmount,
      usdEquivalent,
      message: message.trim()
    });

    // Reset form
    setAmount('');
    setMessage('');
    setCurrency('USD');
    onClose();
  };

  const usdEquivalent = amount ? convertToUSD(parseFloat(amount), currency) : 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Submit Counter Offer
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Current Rate Display */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">Current Offered Rate</h4>
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">
                {formatCurrency(currentRate.originalAmount, currentRate.originalCurrency)}
              </span>
              <ArrowRight className="h-4 w-4 text-gray-400" />
              <span className="text-lg font-semibold">
                {formatCurrency(currentRate.adminSetRate, 'USD')} USD
              </span>
            </div>
          </div>

          {/* Counter Offer Form */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Currency</label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((curr) => (
                      <SelectItem key={curr.code} value={curr.code}>
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          {curr.symbol} {curr.code}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Your Rate</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>

            {amount && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-blue-700">Your Offer:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{formatCurrency(parseFloat(amount), currency)}</span>
                    {currency !== 'USD' && (
                      <>
                        <ArrowRight className="h-3 w-3" />
                        <span className="font-semibold">{formatCurrency(usdEquivalent, 'USD')} USD</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Explanation (Required)</label>
              <Textarea
                placeholder="Explain why you're proposing this rate..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSubmit}
              disabled={!amount || !currency || !message.trim()}
              className="flex-1"
            >
              Submit Counter Offer
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}