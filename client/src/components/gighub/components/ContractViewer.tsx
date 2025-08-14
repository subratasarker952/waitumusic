import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Eye, CheckCircle, Clock } from 'lucide-react';
import { PerfectLoading } from '@/components/ui/perfect-loading';

interface Contract {
  id: number;
  type: string;
  status: string;
  createdAt: string;
  signedAt?: string;
  documentUrl?: string;
}

interface ContractViewerProps {
  bookingId: number;
}

export function ContractViewer({ bookingId }: ContractViewerProps) {
  const { data: contracts, isLoading } = useQuery({
    queryKey: ['booking-contracts', bookingId],
    queryFn: async () => {
      const response = await apiRequest(`/api/bookings/${bookingId}/contracts`);
      return response as Contract[];
    }
  });

  if (isLoading) {
    return <PerfectLoading message="Loading contracts..." />;
  }

  const contractTypes = {
    'performance_agreement': 'Performance Agreement',
    'booking_agreement': 'Booking Agreement',
    'technical_rider': 'Technical Rider',
    'hospitality_rider': 'Hospitality Rider'
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Contracts & Agreements</CardTitle>
        </CardHeader>
        <CardContent>
          {!contracts || contracts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No contracts generated yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {contracts.map((contract) => (
                <Card key={contract.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {contractTypes[contract.type as keyof typeof contractTypes] || contract.type}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Created {new Date(contract.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {contract.signedAt ? (
                        <Badge variant="default">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Signed
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <Clock className="h-3 w-3 mr-1" />
                          Pending
                        </Badge>
                      )}
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
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