import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { DollarSign, User, Clock, CheckCircle, XCircle, AlertCircle, Globe } from 'lucide-react';

interface AssignedMusician {
  id: number;
  name: string;
  instruments?: string[];
  idealRate?: number;
  adminSetRate?: number;
  rateStatus?: string;
  musicianResponse?: string;
  rateNotes?: string;
  minimumAcceptableRate?: number;
}

interface PerformanceRateManagerProps {
  bookingId: number;
  assignedMusicians: AssignedMusician[];
  userRole?: string;
  canSetRates?: boolean;
  onRatesUpdated?: () => void;
}

export default function PerformanceRateManager({
  bookingId,
  assignedMusicians,
  userRole,
  canSetRates = false,
  onRatesUpdated
}: PerformanceRateManagerProps) {
  const [rates, setRates] = useState<Record<number, { rate: string; notes: string; currency: string }>>({});
  const [currencies, setCurrencies] = useState<any[]>([]);
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const canManageRates = canSetRates && (userRole === 'superadmin' || userRole === 'admin');

  // Load currencies and exchange rates
  useEffect(() => {
    const loadCurrencies = async () => {
      try {
        const response = await apiRequest('/api/currencies');
        if (response.ok) {
          const currencyData = await response.json();
          setCurrencies(currencyData);
          
          // Create exchange rates map
          const ratesMap: Record<string, number> = {};
          currencyData.forEach((curr: any) => {
            ratesMap[curr.code] = curr.exchangeRate || 1;
          });
          setExchangeRates(ratesMap);
        }
      } catch (error) {
        console.error('Error loading currencies:', error);
      }
    };
    
    loadCurrencies();
  }, []);

  const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string = 'USD'): number => {
    if (fromCurrency === toCurrency) return amount;
    const fromRate = exchangeRates[fromCurrency] || 1;
    const toRate = exchangeRates[toCurrency] || 1;
    return (amount / fromRate) * toRate;
  };

  const formatCurrency = (amount: number, currency: string): string => {
    const currencyInfo = currencies.find(c => c.code === currency);
    return `${currencyInfo?.symbol || '$'}${amount.toFixed(2)}`;
  };

  useEffect(() => {
    // Initialize rates with current admin-set rates
    const initialRates: Record<number, { rate: string; notes: string; currency: string }> = {};
    assignedMusicians.forEach(musician => {
      if (musician.adminSetRate) {
        initialRates[musician.id] = {
          rate: musician.adminSetRate.toString(),
          notes: musician.rateNotes || '',
          currency: 'USD' // Default to USD, could be stored in database if needed
        };
      }
    });
    setRates(initialRates);
  }, [assignedMusicians]);

  const handleSetRate = async (musicianId: number) => {
    const rateData = rates[musicianId];
    if (!rateData || !rateData.rate || !rateData.currency) {
      toast({
        title: "Rate and Currency Required",
        description: "Please enter a performance rate and select a currency",
        variant: "destructive"
      });
      return;
    }

    const rateInSelectedCurrency = parseFloat(rateData.rate);
    const rateInUSD = convertCurrency(rateInSelectedCurrency, rateData.currency, 'USD');

    try {
      setLoading(true);
      const response = await apiRequest(`/api/bookings/${bookingId}/musicians/${musicianId}/set-rate`, {
        method: 'POST',
        body: JSON.stringify({
          adminSetRate: rateInUSD, // Always store in USD
          originalCurrency: rateData.currency,
          originalAmount: rateInSelectedCurrency,
          rateNotes: rateData.notes
        })
      });

      if (response.ok) {
        toast({
          title: "Rate Set Successfully",
          description: `Rate set: ${formatCurrency(rateInSelectedCurrency, rateData.currency)} (${formatCurrency(rateInUSD, 'USD')} USD)`
        });
        onRatesUpdated?.();
      } else {
        throw new Error('Failed to set rate');
      }
    } catch (error) {
      toast({
        title: "Failed to Set Rate",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generatePerformanceContract = async (musicianId: number) => {
    try {
      const response = await apiRequest(`/api/bookings/${bookingId}/performance-engagement/${musicianId}`, {
        method: 'GET'
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Performance_Contract_${musicianId}_${new Date().toISOString().split('T')[0]}.pdf`;
        a.click();
        URL.revokeObjectURL(url);

        toast({
          title: "Performance Contract Generated",
          description: "Contract with rate details downloaded successfully"
        });
      }
    } catch (error) {
      toast({
        title: "Contract Generation Failed",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string, response?: string) => {
    if (response === 'accepted') return 'bg-green-100 text-green-800';
    if (response === 'declined') return 'bg-red-100 text-red-800';
    if (status === 'admin_set') return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string, response?: string) => {
    if (response === 'accepted') return 'Accepted';
    if (response === 'declined') return 'Declined';
    if (status === 'admin_set') return 'Rate Set - Awaiting Response';
    return 'Pending Rate Setting';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Performance Rate Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {assignedMusicians.map((musician) => (
              <div key={musician.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{musician.name}</h3>
                      {musician.instruments && (
                        <p className="text-sm text-muted-foreground">
                          {musician.instruments.join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge className={getStatusColor(musician.rateStatus || 'pending', musician.musicianResponse)}>
                    {getStatusText(musician.rateStatus || 'pending', musician.musicianResponse)}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Ideal Rate</label>
                    <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                      <DollarSign className="h-4 w-4 text-blue-600" />
                      <span className="font-semibold">
                        ${musician.idealRate ? musician.idealRate.toFixed(2) : 'Not Set'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Minimum Acceptable</label>
                    <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <span className="font-semibold">
                        ${musician.minimumAcceptableRate ? musician.minimumAcceptableRate.toFixed(2) : 'Not Set'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Admin Set Rate</label>
                    <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-semibold">
                        ${musician.adminSetRate ? musician.adminSetRate.toFixed(2) : 'Not Set'}
                      </span>
                    </div>
                  </div>
                </div>

                {canManageRates && (
                  <div className="space-y-4 border-t pt-4">
                    <h4 className="font-medium">Set Performance Rate</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Currency</label>
                        <Select
                          value={rates[musician.id]?.currency || 'USD'}
                          onValueChange={(value) => setRates(prev => ({
                            ...prev,
                            [musician.id]: {
                              ...prev[musician.id],
                              currency: value
                            }
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                          <SelectContent>
                            {currencies.map((currency) => (
                              <SelectItem key={currency.code} value={currency.code}>
                                <div className="flex items-center gap-2">
                                  <Globe className="h-4 w-4" />
                                  {currency.symbol} {currency.code} - {currency.name}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Rate ({rates[musician.id]?.currency || 'USD'})
                        </label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Enter performance rate"
                          value={rates[musician.id]?.rate || ''}
                          onChange={(e) => setRates(prev => ({
                            ...prev,
                            [musician.id]: {
                              ...prev[musician.id],
                              rate: e.target.value
                            }
                          }))}
                        />
                        {rates[musician.id]?.rate && rates[musician.id]?.currency !== 'USD' && (
                          <p className="text-xs text-muted-foreground">
                            ≈ {formatCurrency(
                              convertCurrency(
                                parseFloat(rates[musician.id].rate), 
                                rates[musician.id].currency, 
                                'USD'
                              ), 
                              'USD'
                            )} USD
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Rate Notes</label>
                        <Textarea
                          placeholder="Optional notes about rate determination"
                          value={rates[musician.id]?.notes || ''}
                          onChange={(e) => setRates(prev => ({
                            ...prev,
                            [musician.id]: {
                              ...prev[musician.id],
                              notes: e.target.value
                            }
                          }))}
                          rows={2}
                        />
                      </div>
                    </div>
                    
                    {rates[musician.id]?.rate && rates[musician.id]?.currency && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <h5 className="font-medium text-blue-800 mb-2">Rate Confirmation</h5>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-blue-700">Selected Currency:</span>
                            <p className="font-semibold">{formatCurrency(parseFloat(rates[musician.id].rate), rates[musician.id].currency)}</p>
                          </div>
                          <div>
                            <span className="text-blue-700">USD Equivalent:</span>
                            <p className="font-semibold">{formatCurrency(convertCurrency(parseFloat(rates[musician.id].rate), rates[musician.id].currency, 'USD'), 'USD')}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleSetRate(musician.id)}
                        disabled={loading || !rates[musician.id]?.rate || !rates[musician.id]?.currency}
                      >
                        {loading ? 'Setting Rate...' : 'Set Rate'}
                      </Button>
                      {musician.adminSetRate && (
                        <Button
                          variant="outline"
                          onClick={() => generatePerformanceContract(musician.id)}
                        >
                          Generate Contract
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {musician.musicianResponse === 'declined' && (
                  <div className="bg-red-50 p-3 rounded-lg">
                    <h5 className="font-medium text-red-800 mb-1">Response</h5>
                    <p className="text-sm text-red-700">
                      {musician.musicianResponse || 'No response message provided'}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {assignedMusicians.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No musicians assigned to this booking yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}