import React, { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useConfiguration } from "@/contexts/ConfigurationProvider";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

// UI Components
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { PerfectLoading } from "@/components/ui/perfect-loading";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Icons
import {
  Calendar,
  MapPin,
  Clock,
  Music,
  Camera,
  Video,
  FileText,
  Download,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign,
  Send,
  Mic,
  Guitar,
  Headphones,
  Users,
  Receipt,
  FileMusic,
  SplitSquareVertical,
  Target,
  Layout,
  BookOpen,
  PenTool,
  Image,
  Briefcase,
} from "lucide-react";
import { ContractsTab } from "../gighub/components/ContractsTab";
import { CounterOfferDialog } from "../gighub/components/CounterOfferDialog";

// Role-specific components

export default function BookerView() {
  const { user, roles } = useAuth();
  const roleIds = roles.map((r) => r.id);
  const { config } = useConfiguration();
  const params = useParams();
  const bookingId = parseInt(params.id as string);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("overview");
  const [counterOfferOpen, setCounterOfferOpen] = useState(false);

  // Fetch booking details
  const {
    data: booking,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["booking-details", bookingId],
    queryFn: async () => {
      const response = await apiRequest(
        `/api/bookings/${bookingId}/booker-view`
      );
      return response;
    },
    enabled: !!bookingId && !!user,
  });

  console.log(booking);

  if (isLoading) {
    return <PerfectLoading message="Loading gig details..." />;
  }

  if (error || !booking) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
          <p className="text-lg font-semibold">
            Unable to load booking details
          </p>
          <p className="text-muted-foreground">Please try again later</p>
        </CardContent>
      </Card>
    );
  }

  // Role-specific tab configuration
  const tabs = [
    {
      value: "overview",
      label: "Overview",
      icon: <Briefcase className="h-4 w-4" />,
    },
    {
      value: "performer",
      label: "Performer",
      icon: <FileText className="h-4 w-4" />,
    },
    {
      value: "contracts",
      label: "Contracts",
      icon: <FileText className="h-4 w-4" />,
    },
    {
      value: "payment",
      label: "Payment",
      icon: <DollarSign className="h-4 w-4" />,
    },
  ];

  function formatEventDates(eventDates: any[]) {
    return eventDates.map(({ eventDate, startTime, endTime }) => {
      const dateObj = new Date(eventDate);
      const formattedDate = dateObj.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      const formatTime = (time: any) => {
        const [hour, minute] = time?.split(":")?.map(Number);
        const ampm = hour >= 12 ? "PM" : "AM";
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minute.toString().padStart(2, "0")} ${ampm}`;
      };

      return (
        <p className="whitespace-nowrap" key={eventDate}>
          {formattedDate} ({formatTime(startTime)} - {formatTime(endTime)})
        </p>
      );
    });
  }

  const totalBookingPrice = booking.contracts?.find((c: any) => c.contractType === "booking_agreement").content.totalBookingPrice

  const renderBookingActions = () => {
    const canRespond =
      booking.assignmentInfo?.status === "pending" ||
      booking.status === "pending";

    if (!canRespond) {
      return (
        <Badge
          variant={
            booking.assignmentInfo?.status === "active"
              ? "default"
              : "secondary"
          }
          className="capitalize"
        >
          {booking.assignmentInfo?.status || booking.status}
        </Badge>
      );
    }

    return (
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCounterOfferOpen(true)}
          data-testid="button-counter-offer"
        >
          <Edit className="h-4 w-4 mr-1" />
          Counter Offer
        </Button>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{booking.eventName}</CardTitle>
            </div>
            {renderBookingActions()}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>{formatEventDates(booking.eventDates)}</div>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{booking.venueName || "Venue TBD"}</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span>
                  Budget:{" "}
                  {booking.totalBudget
                    ? `$${booking.totalBudget}`
                    : "Price TBD"}
                </span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span>
                  Final Price:{" "}
                  {booking.finalPrice ? `$${booking.finalPrice}` : `$${parseInt(totalBookingPrice) + booking.totalBudget * 0.08}`}
                </span>
              </div>
            </div>
          </div>
          {booking.venueAddress && (
            <p className="text-sm text-muted-foreground mt-2">
              {booking.venueAddress}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Role-Adaptive Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList
          className="grid w-full"
          style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}
        >
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="text-xs">
              {tab.icon}
              <span className="ml-1">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-800">
                Booking Overview
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  {/* Event Name */}
                  <div className="flex flex-col">
                    <Label className="font-medium text-gray-600">
                      Event Name
                    </Label>
                    <p className="text-sm text-gray-800">{booking.eventName}</p>
                  </div>

                  {/* Event Type */}
                  <div className="flex flex-col">
                    <Label className="font-medium text-gray-600">
                      Event Type
                    </Label>
                    <p className="text-sm text-gray-800">{booking.eventType}</p>
                  </div>
                </div>

                {/* Event Dates */}
                <div className="flex flex-col">
                  <Label className="font-medium text-gray-600">
                    Event Dates
                  </Label>
                  <div className="text-sm text-gray-800">
                    {formatEventDates(booking.eventDates)}
                  </div>
                </div>

                <div>
                  {/* Venue */}
                  <div className="flex flex-col">
                    <Label className="font-medium text-gray-600">
                      Venue Name
                    </Label>
                    <p className="text-sm text-gray-800">{booking.venueName}</p>
                  </div>

                  <div className="flex flex-col">
                    <Label className="font-medium text-gray-600">
                      Venue Address
                    </Label>
                    <p className="text-sm text-gray-800">
                      {booking.venueAddress}
                    </p>
                  </div>

                  {/* Requirements */}
                  {booking.requirements && (
                    <div className="flex flex-col">
                      <Label className="font-medium text-gray-600">
                        Requirements
                      </Label>
                      <p className="text-sm text-gray-800 whitespace-pre-wrap border-l-2 border-blue-200 pl-4">
                        {booking.requirements}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Documents</CardTitle>
              <CardDescription>View or download your agreement and invoices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3 mt-4">
                {/* Agreement */}
                {booking?.agreementSigned ? (
                  <Button asChild variant="outline" size="sm">
                    <a href={booking.agreementPdfUrl} target="_blank" rel="noopener noreferrer">
                      <FileText className="h-4 w-4 mr-1" /> View Agreement
                    </a>
                  </Button>
                ) : (
                  <Button disabled variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-1" /> Agreement Pending
                  </Button>
                )}

                {/* Due Invoice */}
                {booking?.agreementSigned && !booking?.paymentCompleted && (
                  <Button asChild variant="outline" size="sm">
                    <a href={booking.dueInvoiceUrl} target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4 mr-1" /> Download Due Invoice
                    </a>
                  </Button>
                )}

                {/* Paid Invoice */}
                {booking?.paymentCompleted && booking?.paidInvoiceUrl && (
                  <Button asChild variant="outline" size="sm">
                    <a href={booking.paidInvoiceUrl} target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4 mr-1" /> Download Paid Invoice
                    </a>
                  </Button>
                )}

                {/* Receipt */}
                {booking?.paymentCompleted && booking?.receiptUrl && (
                  <Button asChild variant="outline" size="sm">
                    <a href={booking.receiptUrl} target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4 mr-1" /> Download Receipt
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contracts">
          <ContractsTab booking={booking}></ContractsTab>
        </TabsContent>

        <TabsContent value="performer">
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Performers & Agreements</CardTitle>
              <CardDescription>
                See all assigned performers, their fees, and contract status
              </CardDescription>
            </CardHeader>

            <CardContent>
              {booking.contracts?.filter((c: any) => c.contractType === "performance_contract")
                .length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {booking.contracts
                    .filter((c: any) => c.contractType === "performance_contract")
                    .map((contract: any) => {
                      const performerId = contract.assignedToUserId;
                      if (!performerId) return null;

                      const performer = booking.assignedTalent?.find(
                        (t: any) => t.userId === performerId
                      );

                      const performerName = performer?.fullName || `Performer #${performerId}`;
                      const performerAvatar = performer?.avatarUrl;

                      const individualPrice =
                        contract.content?.individualPricing?.[performerId]?.price ??
                        contract.content?.totalBookingPrice ??
                        0;

                      const isSigned = contract.status === "signed";
                      const pdfUrl = contract.pdfUrl;

                      return (
                        <div
                          key={contract.id}
                          className="flex flex-col border rounded-xl p-4 bg-muted/30 hover:bg-muted/50 transition-all shadow-sm"
                        >
                          {/* Avatar & Name */}
                          <div className="flex items-center gap-3 mb-3">
                            {performerAvatar ? (
                              <img
                                src={performerAvatar}
                                alt={performerName}
                                className="h-12 w-12 rounded-full object-cover border"
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center text-sm font-semibold text-gray-700">
                                {performerName.charAt(0).toUpperCase()}
                              </div>
                            )}

                            <div>
                              <p className="font-medium text-base">{performerName}</p>
                              <p
                                className={`text-sm ${isSigned ? "text-green-600" : "text-yellow-600"
                                  }`}
                              >
                                {isSigned ? "Signed" : "Pending Signature"}
                              </p>
                            </div>
                          </div>

                          {/* Performer Details */}
                          <div className="text-sm text-muted-foreground flex-1 space-y-1">
                            <p>Price: ৳{Number(individualPrice).toLocaleString()}</p>
                            {performer?.gender && (
                              <p>Gender: {performer.gender}</p>
                            )}
                            {performer?.phoneNumber && (
                              <p>Phone: {performer.phoneNumber}</p>
                            )}
                          </div>

                          {/* Action Button */}
                          <div className="mt-4">
                            {isSigned && pdfUrl ? (
                              <Button
                                asChild
                                variant="outline"
                                size="sm"
                                className="w-full"
                              >
                                <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                                  <Download className="h-4 w-4 mr-1" /> Agreement
                                </a>
                              </Button>
                            ) : (
                              <Button disabled variant="outline" size="sm" className="w-full">
                                Pending
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-3">
                  No performer agreements yet.
                </p>
              )}
            </CardContent>

          </Card>
        </TabsContent>

        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
              <CardDescription>
                Track payment status and schedule
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <Label>Total Amount</Label>
                    <p className="text-2xl font-bold">
                      {booking.finalPrice ? `$${booking.finalPrice}` : "TBD"}
                    </p>
                  </div>
                  <Badge
                    variant={
                      booking?.paymentCompleted ? "default" : "secondary"
                    }
                  >
                    {booking?.paymentCompleted ? "Paid" : "Pending"}
                  </Badge>
                </div>
                <Separator />
                <div>
                  <Label>Payment Schedule</Label>
                  <p className="text-sm text-muted-foreground">
                    50% deposit upon contract signing, 50% on event day
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Counter Offer Dialog */}
      <CounterOfferDialog
        open={counterOfferOpen}
        onOpenChange={setCounterOfferOpen}
        bookingId={bookingId}
        currentPrice={booking.finalPrice}
        onSuccess={() => {
          setCounterOfferOpen(false);
          queryClient.invalidateQueries({
            queryKey: ["booking-details", bookingId],
          });
        }}
      />
    </div>
  );
}
