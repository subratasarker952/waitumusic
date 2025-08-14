import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import CounterOfferDialog from './CounterOfferDialog';
import { CheckCircle, XCircle, Clock, DollarSign, Globe, MessageCircle } from 'lucide-react';

interface MusicianRateResponseProps {
  bookingId: number;
  musicianId: number;
  rateInfo: {
    adminSetRate: number;
    originalCurrency: string;
    originalAmount: number;
    rateStatus: string;
    musicianResponse?: string;
    musicianResponseMessage?: string;
    rateNotes?: string;
    rateSetAt?: string;
    musicianResponseAt?: string;
  };
  currencies: any[];
  onResponseSubmitted?: () => void;
}

export default function MusicianRateResponse({
  bookingId,
  musicianId,
  rateInfo,
  currencies,
  onResponseSubmitted
}: MusicianRateResponseProps) {
  const [response, setResponse] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [showCounterOffer, setShowCounterOffer] = useState(false);
  const { toast } = useToast();

  const formatCurrency = (amount: number, currency: string): string => {
    const currencyInfo = currencies.find(c => c.code === currency);
    return `${currencyInfo?.symbol || '$'}${amount.toFixed(2)}`;
  };

  const handleSubmitResponse = async (counterOfferData?: any) => {
    if (!response) {
      toast({
        title: "Response Required",
        description: "Please select accept, decline, or counter offer",
        variant: "destructive"
      });
      return;
    }

    // Handle counter offer
    if (response === 'counter_offer') {
      setShowCounterOffer(true);
      return;
    }

    try {
      setLoading(true);
      const apiResponse = await apiRequest(`/api/bookings/${bookingId}/musicians/${musicianId}/respond-rate`, {
        method: 'POST',
        body: JSON.stringify({
          response,
          message: message || undefined,
          counterOffer: counterOfferData
        })
      });

      if (apiResponse.ok) {
        const responseText = response === 'counter_offer' ? 'submitted a counter offer for' : response;
        toast({
          title: "Response Submitted",
          description: `You have ${responseText} the performance rate offer`
        });
        onResponseSubmitted?.();
      } else {
        throw new Error('Failed to submit response');
      }
    } catch (error) {
      toast({
        title: "Failed to Submit Response",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCounterOfferSubmit = (counterOfferData: any) => {
    setMessage(`Counter offer: ${formatCurrency(counterOfferData.amount, counterOfferData.currency)} (${formatCurrency(counterOfferData.usdEquivalent, 'USD')} USD) - ${counterOfferData.message}`);
    handleSubmitResponse(counterOfferData);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <Badge className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="h-3 w-3 mr-1" />Accepted</Badge>;
      case 'declined':
        return <Badge className="bg-red-100 text-red-800 border-red-200"><XCircle className="h-3 w-3 mr-1" />Declined</Badge>;
      case 'counter_offer':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200"><MessageCircle className="h-3 w-3 mr-1" />Counter Offer Submitted</Badge>;
      case 'admin_set':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200"><Clock className="h-3 w-3 mr-1" />Awaiting Response</Badge>;
      default:
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  const hasResponded = rateInfo.musicianResponse && ['accepted', 'declined', 'counter_offer'].includes(rateInfo.musicianResponse);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Performance Rate Offer
          {getStatusBadge(rateInfo.rateStatus)}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Rate Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Original Currency</span>
            </div>
            <p className="text-2xl font-bold text-blue-900">
              {formatCurrency(rateInfo.originalAmount, rateInfo.originalCurrency)}
            </p>
            <p className="text-xs text-blue-600">{rateInfo.originalCurrency}</p>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">USD Equivalent</span>
            </div>
            <p className="text-2xl font-bold text-green-900">
              {formatCurrency(rateInfo.adminSetRate, 'USD')}
            </p>
            <p className="text-xs text-green-600">Site Currency</p>
          </div>
        </div>

        {/* Admin Notes */}
        {rateInfo.rateNotes && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-1">Admin Notes</h4>
            <p className="text-sm text-gray-600">{rateInfo.rateNotes}</p>
          </div>
        )}

        {/* Response Section */}
        {!hasResponded && rateInfo.rateStatus === 'admin_set' ? (
          <div className="space-y-4 border-t pt-4">
            <h4 className="font-medium">Your Response</h4>
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant={response === 'accepted' ? 'default' : 'outline'}
                onClick={() => setResponse('accepted')}
                className={response === 'accepted' ? 'bg-green-600 hover:bg-green-700' : ''}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Accept Rate
              </Button>
              <Button
                variant={response === 'counter_offer' ? 'default' : 'outline'}
                onClick={() => setResponse('counter_offer')}
                className={response === 'counter_offer' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Counter Offer
              </Button>
              <Button
                variant={response === 'declined' ? 'default' : 'outline'}
                onClick={() => setResponse('declined')}
                className={response === 'declined' ? 'bg-red-600 hover:bg-red-700' : ''}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Decline Rate
              </Button>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Message (Optional)</label>
              <Textarea
                placeholder="Add a message about your response..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
              />
            </div>

            <Button
              onClick={() => handleSubmitResponse()}
              disabled={loading || !response}
              className="w-full"
            >
              {loading ? 'Submitting...' : response === 'counter_offer' ? 'Proceed with Counter Offer' : `Submit ${response ? response.charAt(0).toUpperCase() + response.slice(1).replace('_', ' ') : 'Response'}`}
            </Button>
          </div>
        ) : hasResponded ? (
          <div className="border-t pt-4">
            <div className="flex items-center gap-2 mb-2">
              <MessageCircle className="h-4 w-4 text-blue-600" />
              <span className="font-medium">Your Response</span>
              <Badge className={
                rateInfo.musicianResponse === 'accepted' ? 'bg-green-100 text-green-800' : 
                rateInfo.musicianResponse === 'declined' ? 'bg-red-100 text-red-800' :
                rateInfo.musicianResponse === 'counter_offer' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }>
                {rateInfo.musicianResponse?.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
            
            {/* Counter Offer Display */}
            {rateInfo.musicianResponse === 'counter_offer' && (rateInfo as any).counterOfferAmount && (
              <div className="bg-yellow-50 p-3 rounded-lg mb-3">
                <h5 className="font-medium text-yellow-800 mb-1">Your Counter Offer</h5>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg font-semibold text-yellow-900">
                    {formatCurrency((rateInfo as any).counterOfferAmount, (rateInfo as any).counterOfferCurrency)}
                  </span>
                  {(rateInfo as any).counterOfferCurrency !== 'USD' && (
                    <>
                      <span className="text-yellow-600">≈</span>
                      <span className="text-yellow-900">
                        {formatCurrency((rateInfo as any).counterOfferUsdEquivalent, 'USD')} USD
                      </span>
                    </>
                  )}
                </div>
                {(rateInfo as any).counterOfferMessage && (
                  <p className="text-sm text-yellow-700 italic">
                    "{(rateInfo as any).counterOfferMessage}"
                  </p>
                )}
              </div>
            )}
            
            {rateInfo.musicianResponseMessage && (
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                "{rateInfo.musicianResponseMessage}"
              </p>
            )}
            {rateInfo.musicianResponseAt && (
              <p className="text-xs text-gray-500 mt-2">
                Responded on {new Date(rateInfo.musicianResponseAt).toLocaleDateString()}
              </p>
            )}
            
            {/* Admin Counter Response */}
            {(rateInfo as any).adminCounterResponse && (
              <div className="mt-3 bg-blue-50 p-3 rounded-lg">
                <h5 className="font-medium text-blue-800 mb-1">Admin Response</h5>
                <Badge className={
                  (rateInfo as any).adminCounterResponse === 'accepted' ? 'bg-green-100 text-green-800' :
                  (rateInfo as any).adminCounterResponse === 'declined' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }>
                  {(rateInfo as any).adminCounterResponse?.toUpperCase()}
                </Badge>
                {(rateInfo as any).adminCounterResponseMessage && (
                  <p className="text-sm text-blue-700 mt-1">
                    "{(rateInfo as any).adminCounterResponseMessage}"
                  </p>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Waiting for admin to set performance rate</p>
          </div>
        )}

        {/* Rate Set Date */}
        {rateInfo.rateSetAt && (
          <p className="text-xs text-gray-500">
            Rate set on {new Date(rateInfo.rateSetAt).toLocaleDateString()}
          </p>
        )}

        {/* Counter Offer Dialog */}
        <CounterOfferDialog
          open={showCounterOffer}
          onClose={() => {
            setShowCounterOffer(false);
            setResponse('');
          }}
          currencies={currencies}
          currentRate={{
            adminSetRate: rateInfo.adminSetRate,
            originalCurrency: rateInfo.originalCurrency,
            originalAmount: rateInfo.originalAmount
          }}
          onSubmit={handleCounterOfferSubmit}
        />
      </CardContent>
    </Card>
  );
}