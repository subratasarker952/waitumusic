import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DollarSign, FileText, ArrowUpDown, Receipt, Users, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface BookingSummary {
  id: number;
  eventName: string;
  status: string;
  totalBudget: string;
  eventDate: string;
  guestName: string;
}

interface FinancialSummary {
  bookingId: number;
  invoices: any[];
  payoutRequests: any[];
  transactions: any[];
  receipts: any[];
  totalInvoiced: number;
  totalPayouts: number;
  totalTransactions: number;
}

export default function FinancialAutomationPanel() {
  const [selectedBooking, setSelectedBooking] = useState<BookingSummary | null>(null);
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null);
  const [invoicePreview, setInvoicePreview] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const auth = useAuth();

  // Helper function to view PDF with authentication
  const viewAuthenticatedPDF = async (invoiceId: number) => {
    try {
      const token = getToken();
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please log in to view PDFs",
          variant: "destructive"
        });
        return;
      }

      // Create a temporary link with authentication
      const response = await apiRequest(`/api/financial/invoice/${invoiceId}/pdf`);

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.click();
        window.URL.revokeObjectURL(url);
      } else {
        throw new Error('Failed to load PDF');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load PDF. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Fetch all bookings for admin/superadmin users
  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ['/api/bookings/all'],
  });

  // Fetch invoices
  const { data: invoices = [] } = useQuery({
    queryKey: ['/api/financial/invoices'],
  });

  // Fetch payout requests
  const { data: payoutRequests = [] } = useQuery({
    queryKey: ['/api/financial/payout-requests'],
  });

  // Mutation for generating invoice preview
  const generatePreviewMutation = useMutation({
    mutationFn: async (bookingId: number) => {
      try {
        // Generating invoice preview for booking
        
        // Get token from localStorage (consistent with apiRequest function)
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token available');
        }

        // Make direct fetch request with proper headers
        const response = await apiRequest(`/api/bookings/${bookingId}/invoice-preview`);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error:', response.status, errorText);
          throw new Error(`API Error: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        // Invoice preview generated successfully
        return data;
      } catch (error) {
        console.error('Preview fetch error:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      // Preview data received successfully
      setInvoicePreview(data);
      setShowPreview(true);
      toast({
        title: "Success",
        description: "Invoice preview generated successfully"
      });
    },
    onError: (error) => {
      console.error('Preview generation error:', error);
      toast({
        title: "Error",
        description: `Failed to generate invoice preview: ${error.message || 'Unknown error'}`,
        variant: "destructive"
      });
    }
  });

  // Mutation for creating proforma invoice
  const createProformaMutation = useMutation({
    mutationFn: async (bookingId: number) => {
      return await apiRequest(`/api/bookings/${bookingId}/create-proforma-invoice`, {
        method: 'POST'
      });
    },
    onSuccess: () => {
      setShowPreview(false);
      setInvoicePreview(null);
      toast({
        title: "Success",
        description: "Proforma invoice created successfully"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/financial/invoices'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create proforma invoice",
        variant: "destructive"
      });
    }
  });

  // Mutation for converting proforma to final invoice
  const convertToFinalMutation = useMutation({
    mutationFn: async (proformaId: number) => {
      return await apiRequest(`/api/invoices/${proformaId}/convert-to-final`, {
        method: 'POST'
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Proforma invoice converted to final invoice successfully"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/financial/invoices'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to convert proforma invoice",
        variant: "destructive"
      });
    }
  });

  // Mutation for processing payouts
  const processPayoutMutation = useMutation({
    mutationFn: async (payoutId: number) => {
      return await apiRequest(`/api/financial/process-payout/${payoutId}`, {
        method: 'POST'
      });
    },
    onSuccess: () => {
      toast({
        title: "Success", 
        description: "Payout processed successfully"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/financial/payout-requests'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to process payout",
        variant: "destructive"
      });
    }
  });

  const fetchFinancialSummary = async (bookingId: number) => {
    try {
      const summary = {
        bookingId,
        invoices: invoices.filter((inv: any) => inv.bookingId === bookingId),
        payoutRequests: payoutRequests.filter((req: any) => req.bookingId === bookingId),
        transactions: [],
        receipts: [],
        totalInvoiced: 0,
        totalPayouts: 0,
        totalTransactions: 0
      };
      setFinancialSummary(summary);
    } catch (error) {
      console.error('Error fetching financial summary:', error);
      toast({
        title: "Error",
        description: "Failed to fetch financial summary",
        variant: "destructive"
      });
    }
  };

  // Generate proforma invoice function using the mutation
  const generateInvoice = (bookingId: number) => {
    createProformaMutation.mutate(bookingId);
  };

  // Update booking status mutation
  const updateBookingStatusMutation = useMutation({
    mutationFn: async ({ bookingId, status }: { bookingId: number; status: string }) => {
      return await apiRequest(`/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
    },
    onSuccess: (data, variables) => {
      toast({
        title: "Success",
        description: `Booking status updated to ${variables.status}`
      });
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      if (selectedBooking && selectedBooking.id === variables.bookingId) {
        fetchFinancialSummary(variables.bookingId);
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update booking status",
        variant: "destructive"
      });
    }
  });

  // Update booking status function using the mutation
  const updateBookingStatus = (bookingId: number, newStatus: string) => {
    updateBookingStatusMutation.mutate({ bookingId, status: newStatus });
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    
    return (
      <Badge className={statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <DollarSign className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Financial Automation System</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bookings List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Bookings</span>
            </CardTitle>
            <CardDescription>
              Select a booking to view financial automation details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {bookingsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-gray-500">Loading bookings...</p>
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">No bookings found</p>
                <p className="text-sm">Bookings will appear here once they are created</p>
              </div>
            ) : (
              bookings.map((booking: any) => (
                <div
                  key={booking.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedBooking?.id === booking.id 
                      ? 'border-primary bg-primary/5' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => {
                    setSelectedBooking(booking);
                    fetchFinancialSummary(booking.id);
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{booking.eventName || `Booking #${booking.id}`}</h4>
                      <p className="text-sm text-gray-600">{booking.guestName || booking.guestEmail}</p>
                      <p className="text-sm text-gray-500">
                        {booking.eventDate ? new Date(booking.eventDate).toLocaleDateString() : 'Date TBD'} • 
                        ${booking.totalBudget || booking.budget || '0'}
                      </p>
                    </div>
                    {getStatusBadge(booking.status || 'pending')}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Financial Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Financial Automation</span>
            </CardTitle>
            <CardDescription>
              {selectedBooking 
                ? `Financial details for ${selectedBooking.eventName}`
                : 'Select a booking to view automation details'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedBooking ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No booking selected</p>
                <p className="text-sm">Click on a booking to see financial automation features</p>
              </div>
            ) : (createProformaMutation.isPending || updateBookingStatusMutation.isPending) ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-gray-500">Processing financial operation...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Quick Actions */}
                <div className="space-y-2">
                  <h4 className="font-medium">Quick Actions</h4>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => generatePreviewMutation.mutate(selectedBooking.id)}
                      disabled={generatePreviewMutation.isPending}
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      {generatePreviewMutation.isPending ? 'Loading...' : 'Preview Invoice'}
                    </Button>
                    
                    {selectedBooking.status === 'pending' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateBookingStatus(selectedBooking.id, 'accepted')}
                        disabled={updateBookingStatusMutation.isPending}
                      >
                        {updateBookingStatusMutation.isPending ? 'Accepting...' : 'Accept Booking'}
                      </Button>
                    )}
                    
                    {selectedBooking.status === 'accepted' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateBookingStatus(selectedBooking.id, 'completed')}
                        disabled={updateBookingStatusMutation.isPending}
                      >
                        {updateBookingStatusMutation.isPending ? 'Updating...' : 'Mark Completed'}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Financial Summary */}
                {financialSummary && (
                  <div className="space-y-3">
                    <h4 className="font-medium">Financial Summary</h4>
                    
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {financialSummary.invoices.length}
                        </div>
                        <div className="text-sm text-blue-800">Invoices</div>
                        <div className="text-xs text-blue-600">
                          ${financialSummary.totalInvoiced.toFixed(2)}
                        </div>
                      </div>
                      
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {financialSummary.payoutRequests.length}
                        </div>
                        <div className="text-sm text-green-800">Payouts</div>
                        <div className="text-xs text-green-600">
                          ${financialSummary.totalPayouts.toFixed(2)}
                        </div>
                      </div>
                      
                      <div className="p-3 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {financialSummary.transactions.length}
                        </div>
                        <div className="text-sm text-purple-800">Transactions</div>
                        <div className="text-xs text-purple-600">
                          ${financialSummary.totalTransactions.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {/* Recent Financial Activity */}
                    <div className="space-y-2">
                      <h5 className="font-medium text-sm">Recent Activity</h5>
                      <div className="space-y-1 max-h-40 overflow-y-auto">
                        {financialSummary.invoices.map((invoice, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                            <span className="flex items-center">
                              <Receipt className="h-3 w-3 mr-1" />
                              Invoice {invoice.invoiceNumber}
                            </span>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">${parseFloat(invoice.totalAmount).toFixed(2)}</span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => viewAuthenticatedPDF(invoice.id)}
                                className="text-xs px-2 py-1 h-6"
                              >
                                View PDF
                              </Button>
                            </div>
                          </div>
                        ))}
                        {financialSummary.payoutRequests.map((payout, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                            <span className="flex items-center">
                              <ArrowUpDown className="h-3 w-3 mr-1" />
                              Payout {payout.requestNumber}
                            </span>
                            <span className="font-medium">${parseFloat(payout.netPayoutAmount).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* All Invoices Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>All Platform Invoices</span>
          </CardTitle>
          <CardDescription>
            View and manage all invoices generated across the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {invoices.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">No invoices found</p>
                <p className="text-sm">Invoices will appear here once they are generated</p>
              </div>
            ) : (
              invoices.map((invoice: any) => (
                <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium">{invoice.invoiceNumber}</h4>
                      <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                        {invoice.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      {invoice.recipientName} • 
                      Generated: {new Date(invoice.generatedAt).toLocaleDateString()} • 
                      Due: {new Date(invoice.dueDate).toLocaleDateString()}
                    </p>
                    <p className="text-sm font-medium text-green-600">
                      Total: ${parseFloat(invoice.totalAmount).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => viewAuthenticatedPDF(invoice.id)}
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      View PDF
                    </Button>
                    {invoice.invoiceType === 'proforma' && (
                      <Button
                        size="sm"
                        onClick={() => convertToFinalMutation.mutate(invoice.id)}
                        disabled={convertToFinalMutation.isPending}
                      >
                        {convertToFinalMutation.isPending ? 'Converting...' : 'Accept & Convert to Invoice'}
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Automation Features</CardTitle>
          <CardDescription>
            Overview of implemented automation capabilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium text-green-600 mb-2">✓ Automatic Invoice Generation</h4>
              <p className="text-sm text-gray-600">
                Invoices are automatically generated when bookings are accepted, with proper line items and payment terms.
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium text-green-600 mb-2">✓ Payout Request System</h4>
              <p className="text-sm text-gray-600">
                Payout requests are automatically created for performers when bookings are completed.
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium text-green-600 mb-2">✓ Payment Transaction Tracking</h4>
              <p className="text-sm text-gray-600">
                Comprehensive tracking of all payment transactions with fees and audit trails.
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium text-green-600 mb-2">✓ Receipt-Contract Linkage</h4>
              <p className="text-sm text-gray-600">
                Receipts are automatically linked to contracts for complete documentation.
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium text-green-600 mb-2">✓ Financial Audit Trail</h4>
              <p className="text-sm text-gray-600">
                All financial actions are logged with timestamps and user attribution.
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium text-green-600 mb-2">✓ Status Change Triggers</h4>
              <p className="text-sm text-gray-600">
                Financial automation is triggered by booking status changes (accepted → completed).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Preview Modal */}
      {showPreview && invoicePreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Invoice Preview</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowPreview(false);
                    setInvoicePreview(null);
                  }}
                >
                  Close
                </Button>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg mb-6">
                <div className="grid grid-cols-2 gap-6">
                  {/* Issuer Information */}
                  <div>
                    <h4 className="font-semibold text-lg mb-3">From:</h4>
                    <div className="space-y-1">
                      <p className="font-medium">{invoicePreview.invoiceData.issuerName}</p>
                      <p className="text-sm text-gray-600">{invoicePreview.invoiceData.issuerAddress}</p>
                      <p className="text-sm text-gray-600">Tax ID: {invoicePreview.invoiceData.issuerTaxId}</p>
                    </div>
                  </div>

                  {/* Recipient Information */}
                  <div>
                    <h4 className="font-semibold text-lg mb-3">To:</h4>
                    <div className="space-y-1">
                      <p className="font-medium">{invoicePreview.invoiceData.recipientName}</p>
                      <p className="text-sm text-gray-600">{invoicePreview.invoiceData.recipientAddress}</p>
                    </div>
                  </div>
                </div>

                {/* Invoice Details */}
                <div className="mt-6 pt-6 border-t">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Invoice Type</p>
                      <p className="font-medium">Proforma Invoice</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Due Date</p>
                      <p className="font-medium">{new Date(invoicePreview.invoiceData.dueDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Payment Terms</p>
                      <p className="font-medium">{invoicePreview.invoiceData.paymentTerms}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Line Items */}
              <div className="mb-6">
                <h4 className="font-semibold text-lg mb-3">Items & Services</h4>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-3 font-medium">Description</th>
                        <th className="text-center p-3 font-medium">Qty</th>
                        <th className="text-right p-3 font-medium">Rate</th>
                        <th className="text-right p-3 font-medium">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoicePreview.invoiceData.lineItems.map((item: any, index: number) => (
                        <tr key={index} className="border-t">
                          <td className="p-3">{item.description}</td>
                          <td className="p-3 text-center">{item.quantity}</td>
                          <td className="p-3 text-right">${parseFloat(item.rate).toFixed(2)}</td>
                          <td className="p-3 text-right">${parseFloat(item.amount).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals */}
              <div className="mb-6">
                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>${parseFloat(invoicePreview.invoiceData.subtotalAmount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax (8%):</span>
                      <span>${parseFloat(invoicePreview.invoiceData.taxAmount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span>${parseFloat(invoicePreview.invoiceData.totalAmount).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPreview(false);
                    setInvoicePreview(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => createProformaMutation.mutate(invoicePreview.booking.id)}
                  disabled={createProformaMutation.isPending}
                >
                  {createProformaMutation.isPending ? 'Creating...' : 'Create Proforma Invoice'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}