import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Receipt, Download, DollarSign, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { PerfectLoading } from '@/components/ui/perfect-loading';

interface PaymentInfo {
  status: string;
  amount: string;
  currency: string;
  breakdown?: {
    subtotal: string;
    tax?: string;
    fees?: string;
    total: string;
  };
  payments?: Array<{
    id: number;
    amount: string;
    date: string;
    method: string;
    status: string;
  }>;
  vouchers?: Array<{
    id: number;
    code: string;
    createdAt: string;
    downloadUrl?: string;
  }>;
}

interface PaymentDetailsProps {
  bookingId: number;
  amount: string | null;
}

export function PaymentDetails({ bookingId, amount }: PaymentDetailsProps) {
  const { data: paymentInfo, isLoading } = useQuery({
    queryKey: ['booking-payment', bookingId],
    queryFn: async () => {
      const response = await apiRequest(`/api/bookings/${bookingId}/payment-info`);
      return response as PaymentInfo;
    }
  });

  if (isLoading) {
    return <PerfectLoading message="Loading payment details..." />;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'failed':
      case 'overdue':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'paid':
      case 'completed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'failed':
      case 'overdue':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-4">
      {/* Payment Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Summary</CardTitle>
          <CardDescription>
            Total compensation for this booking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">
                ${amount || paymentInfo?.amount || '0.00'}
              </span>
              <Badge variant={getStatusVariant(paymentInfo?.status || 'pending')}>
                {getStatusIcon(paymentInfo?.status || 'pending')}
                <span className="ml-1">{paymentInfo?.status || 'Pending'}</span>
              </Badge>
            </div>

            {paymentInfo?.breakdown && (
              <>
                <Separator />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${paymentInfo.breakdown.subtotal}</span>
                  </div>
                  {paymentInfo.breakdown.tax && (
                    <div className="flex justify-between">
                      <span>Tax</span>
                      <span>${paymentInfo.breakdown.tax}</span>
                    </div>
                  )}
                  {paymentInfo.breakdown.fees && (
                    <div className="flex justify-between">
                      <span>Fees</span>
                      <span>-${paymentInfo.breakdown.fees}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>${paymentInfo.breakdown.total}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment History */}
      {paymentInfo?.payments && paymentInfo.payments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {paymentInfo.payments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">${payment.amount}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(payment.date).toLocaleDateString()} • {payment.method}
                    </p>
                  </div>
                  <Badge variant={getStatusVariant(payment.status)}>
                    {payment.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Vouchers */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Vouchers</CardTitle>
          <CardDescription>
            Official payment documentation
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!paymentInfo?.vouchers || paymentInfo.vouchers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No payment vouchers available yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {paymentInfo.vouchers.map((voucher) => (
                <Card key={voucher.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Voucher #{voucher.code}</p>
                      <p className="text-sm text-muted-foreground">
                        Generated {new Date(voucher.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-1" />
                      Download PDF
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}