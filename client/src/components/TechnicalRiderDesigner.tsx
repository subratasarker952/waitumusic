import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { FileText, Camera, Video, Music, Download, Settings, Users, CheckCircle } from "lucide-react";
import ProfessionalBookingAssignments from './ProfessionalBookingAssignments';

interface TechnicalRiderDesignerProps {
  bookingId: number;
  onClose?: () => void;
}

export function TechnicalRiderDesigner({ bookingId, onClose }: TechnicalRiderDesignerProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  // Fetch booking details
  const { data: booking, isLoading } = useQuery({
    queryKey: [`booking-${bookingId}`],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch booking');
      return response.json();
    }
  });

  const downloadTechnicalRider = async () => {
    try {
      setIsGenerating(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/bookings/${bookingId}/technical-rider`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to generate technical rider');
      }

      // Handle PDF download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Technical_Rider_Booking_${bookingId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "Technical rider generated and downloaded successfully",
        variant: "default"
      });

    } catch (error) {
      console.error('Error generating technical rider:', error);
      toast({
        title: "Error",
        description: "Failed to generate technical rider",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadBookingAgreement = async () => {
    try {
      setIsGenerating(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/bookings/${bookingId}/booking-agreement`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to generate booking agreement');
      }

      // Handle PDF download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Booking_Agreement_${bookingId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "Booking agreement generated and downloaded successfully",
        variant: "default"
      });

    } catch (error) {
      console.error('Error generating booking agreement:', error);
      toast({
        title: "Error",
        description: "Failed to generate booking agreement",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!booking) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-500">Booking not found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Technical Rider Designer - Booking #{bookingId}
          </CardTitle>
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          )}
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-600">Event Date</p>
              <p className="font-medium">
                {booking.eventDate ? new Date(booking.eventDate).toLocaleDateString() : 'TBD'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Venue</p>
              <p className="font-medium">{booking.venueLocation || 'TBD'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Cost</p>
              <p className="font-medium text-green-600">${booking.totalCost}</p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="professionals">Professionals</TabsTrigger>
              <TabsTrigger value="technical">Technical</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Booking Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Event Details</h4>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Type:</span> {booking.eventType}</p>
                        <p><span className="font-medium">Duration:</span> {booking.eventDuration || '2 hours'}</p>
                        <p><span className="font-medium">Time:</span> {booking.preferredTime || 'TBD'}</p>
                        <p><span className="font-medium">Status:</span> 
                          <Badge className="ml-2" variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                            {booking.status}
                          </Badge>
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Financial Breakdown</h4>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Artist Fee:</span> ${booking.artistFee}</p>
                        <p><span className="font-medium">Platform Fee:</span> ${booking.platformFee}</p>
                        <p><span className="font-medium">Processing Fee:</span> ${booking.processingFee}</p>
                        <p className="font-medium border-t pt-2">
                          <span>Total:</span> ${booking.totalCost}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="professionals" className="space-y-4">
              <ProfessionalBookingAssignments 
                bookingId={bookingId}
                onAssignmentUpdate={() => {
                  // Refresh booking data when assignments change
                  // queryClient.invalidateQueries([`booking-${bookingId}`]);
                }}
              />
            </TabsContent>

            <TabsContent value="technical" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Technical Specifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3">Audio Requirements</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Professional sound system
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Wireless microphone system
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Monitor speakers for performers
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Audio recording capability
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-3">Lighting & Stage</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Professional stage lighting
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Stage area minimum 12x8 feet
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Power distribution (220V/110V)
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Load-in access for equipment
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Document Generation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="border-blue-200">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <FileText className="h-8 w-8 text-blue-600 mt-1" />
                          <div className="flex-1">
                            <h4 className="font-medium">Technical Rider</h4>
                            <p className="text-sm text-gray-600 mb-3">
                              Complete technical requirements and specifications for the performance
                            </p>
                            <Button
                              onClick={downloadTechnicalRider}
                              disabled={isGenerating}
                              className="w-full"
                            >
                              {isGenerating ? (
                                <>
                                  <Settings className="h-4 w-4 mr-2 animate-spin" />
                                  Generating...
                                </>
                              ) : (
                                <>
                                  <Download className="h-4 w-4 mr-2" />
                                  Download Technical Rider
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-green-200">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <FileText className="h-8 w-8 text-green-600 mt-1" />
                          <div className="flex-1">
                            <h4 className="font-medium">Booking Agreement</h4>
                            <p className="text-sm text-gray-600 mb-3">
                              Legal agreement outlining terms, conditions, and payment details
                            </p>
                            <Button
                              onClick={downloadBookingAgreement}
                              disabled={isGenerating}
                              variant="outline"
                              className="w-full"
                            >
                              {isGenerating ? (
                                <>
                                  <Settings className="h-4 w-4 mr-2 animate-spin" />
                                  Generating...
                                </>
                              ) : (
                                <>
                                  <Download className="h-4 w-4 mr-2" />
                                  Download Agreement
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">Document Features</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-blue-600">Technical Rider includes:</p>
                        <ul className="list-disc list-inside space-y-1 mt-2">
                          <li>Professional requirements</li>
                          <li>Equipment specifications</li>
                          <li>Stage plot and setup</li>
                          <li>Hospitality requirements</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium text-green-600">Booking Agreement includes:</p>
                        <ul className="list-disc list-inside space-y-1 mt-2">
                          <li>Performance terms</li>
                          <li>Payment schedule</li>
                          <li>Cancellation policy</li>
                          <li>Liability coverage</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

export default TechnicalRiderDesigner;