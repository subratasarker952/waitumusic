import React, { useState, useEffect, useRef } from "react";
// @ts-ignore
import SignatureCanvas from "react-signature-canvas";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Import technical rider components
import Enhanced32PortMixer from "@/components/modals/Enhanced32PortMixer";

import EnhancedTechnicalRider from "@/components/technical-rider/EnhancedTechnicalRider";
import EnhancedMixerPatchSystem from "@/components/stage-plot/EnhancedMixerPatchSystem";

import {
  Calendar,
  Clock,
  Users,
  FileText,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Download,
  Signature,
  Music,
  User,
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  Edit,
  Save,
  Loader2,
  CheckCircle2,
  Settings,
  Wrench,
  Volume2,
  Mic,
  Target,
  DollarSign,
  UserPlus,
  Crown,
  Guitar,
  Star,
  Briefcase,
  AlertTriangle,
  PenTool,
  Send,
  Receipt,
  Layout,
  Sliders,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  TOAST_CONFIGS,
  BUTTON_CONFIGS,
  COLOR_CONFIGS,
  SPACING_CONFIGS,
} from "@shared/ui-config";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { workerData } from "worker_threads";
import { LoadingSpinner } from "../ui/loading-spinner";
import { Alert } from "../ui/alert";

interface ComprehensiveBookingWorkflowProps {
  bookingId: number;
  onStatusChange?: (status: string) => void;
  userRole?: string;
  canEdit?: boolean;
}

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  canProgress: boolean; // Next button enable হবে কি না
  status?: "pending" | "in_progress" | "completed"; // step progress indicator
  icon?: React.ReactNode; // lucide-react বা অন্য যেকোনো icon
  isActive: boolean;
}

interface BookingData {
  id: number;
  eventName: string;
  eventDate: string;
  eventType?: string;
  venueName?: string;
  venueDetails?: string;
  bookerName?: string;
  clientName?: string;
  status: string;
  price?: number;
  primaryArtist: any;
  assignedMusicians?: any[];
  assignedAdmin?: any;
  currentUserId?: number;
  technicalRider?: any;
  stagePlot?: any;
  mixerSettings?: any;
  contracts?: any[];
  payments: any[];
  signatures: any[];
}

export default function BookingWorkflow({
  bookingId,
  onStatusChange,
  userRole = "admin",
  canEdit = true,
}: ComprehensiveBookingWorkflowProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [assignedTalent, setAssignedTalent] = useState<any[]>([]);
  const [talentReviewConfirmed, setTalentReviewConfirmed] = useState(false);
  const [stepConfirmations, setStepConfirmations] = useState<
    Record<number, boolean>
  >({});
  const [technicalConfirmed, setTechnicalConfirmed] = useState(false);
  const [selectedRolesByUser, setSelectedRolesByUser] = useState<
    Record<number, string[]>
  >({});
  const [isTransitioning, setIsTransitioning] = useState(false);

  const [activeSignature, setActiveSignature] = useState<number | null>(null);
  const sigCanvas = useRef<SignatureCanvas | null>(null);

  const handleSign = (contractId: number, signerId: number) => {
    setActiveSignature(signerId); // Open signature pad
  };

  const saveSignature = async (contractId: number, signerId: number) => {
    if (!sigCanvas.current) return;
  
    try {
      const trimmedCanvas = sigCanvas.current.getTrimmedCanvas();
      const signatureData = trimmedCanvas.toDataURL("image/png");
  
      console.log("Signature Data:", signatureData);
  
      const response = await apiRequest(
        `/api/contracts/${contractId}/signatures/${signerId}`,
        {
          method: "POST",
          body: JSON.stringify({ signatureData }),
        }
      );
      console.log(response);
  
      setActiveSignature(null); // Close signature pad
    } catch (err) {
      console.error("Signature saving failed:", err);
    }
  };
  

  const clearSignature = () => {
    sigCanvas.current?.clear();
  };

  console.log(booking);
  console.log(assignedTalent);

  // Modal states for technical rider components
  const [mixerModalOpen, setMixerModalOpen] = useState(false);
  const [setlistModalOpen, setSetlistModalOpen] = useState(false);
  const [technicalRiderModalOpen, setTechnicalRiderModalOpen] = useState(false);

  // Load booking data with controlled caching
  const {
    data: bookingData,
    isLoading: bookingLoading,
    refetch: refetchBooking,
  } = useQuery({
    queryKey: ["booking-workflow", bookingId],
    enabled: !!bookingId,
    queryFn: async () => {
      if (!bookingId) return {};
      const res = await apiRequest(`/api/bookings/${bookingId}`);
      return res; // or res.json() depending on your apiRequest
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: "always",
    refetchOnReconnect: false,
  });

  console.log(bookingData);

  // Load all bookings for selection
  const { data: availableBookings = [] } = useQuery({
    queryKey: ["available-bookings"],
    queryFn: async () => {
      const data = await apiRequest("/api/bookings/all");
      return data;
    },
  });

  // Load available users for assignment with controlled caching
  const { data: availableUsers = [] } = useQuery({
    queryKey: ["available-users"],
    staleTime: 10 * 60 * 1000, // 10 minutes for user list
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  // Load assigned talent data with controlled caching
  const {
    data: assignedTalentData,
    isLoading: assignedTalentLoading,
    refetch: refetchAssignedTalent,
  } = useQuery({
    queryKey: ["booking-assigned-talent", bookingId],
    queryFn: async () => {
      if (!bookingId) return [];
      console.log(
        "🔍 FRONTEND: Fetching assigned talent for booking ID:",
        bookingId
      );
      const data = await apiRequest(
        `/api/bookings/${bookingId}/assigned-talent`
      );
      console.log("📋 FRONTEND: Received assigned talent data:", data);
      return data;
    },
    enabled: !!bookingId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: "always",
    refetchOnReconnect: false,
  });

  // Load specific user types for assignment
  const { data: availableArtists = [] } = useQuery({
    queryKey: ["/api/artists"],
  });

  const { data: availableMusicians = [] } = useQuery({
    queryKey: ["/api/musicians"],
  });

  const { data: availableProfessionals = [] } = useQuery({
    queryKey: ["/api/professionals"],
  });

  // Set booking data and auto-assign primary artist
  useEffect(() => {
    if (bookingData && typeof bookingData === "object") {
      const booking = bookingData as BookingData;
      setBooking(booking);
      setIsLoading(false);

      // Auto-assign primary artist as main booked talent if not already assigned
      // if (booking.primaryArtist && assignedTalentData !== undefined && Array.isArray(assignedTalentData) && assignedTalentData.length === 0) {
      //   console.log('🎯 AUTO-ASSIGNMENT TRIGGER: Primary artist exists, no assignments found');
      //   autoAssignPrimaryArtist(booking.primaryArtist);
      // }
    }
  }, [bookingData, assignedTalentData]);

  // Update assigned talent state when data loads
  useEffect(() => {
    if (assignedTalentData) {
      console.log("📋 UPDATING assigned talent state:", assignedTalentData);
      console.log(
        "🔍 DETAILED DATA CHECK - First talent object:",
        assignedTalentData[0]
      );
      console.log(
        "🔍 KEYS in first talent:",
        Object.keys(assignedTalentData[0] || {})
      );
      console.log(
        "🔍 PRIMARY TALENT field:",
        assignedTalentData[0]?.primaryTalent
      );
      console.log(
        "🔍 SECONDARY TALENTS field:",
        assignedTalentData[0]?.secondaryTalents
      );
      setAssignedTalent(assignedTalentData);
    }
  }, [assignedTalentData]);

  // Function to auto-assign primary artist as main booked talent
  // const autoAssignPrimaryArtist = async (primaryArtist: any) => {
  //   try {
  //     console.log('🎯 AUTO-ASSIGNING primary artist as main booked talent:', primaryArtist);

  //     // Check if primary artist is already assigned as main booked talent
  //     const existingMainTalent = assignedTalentData?.find(
  //       (talent: any) => talent.userId === (primaryArtist.userId || primaryArtist.id) && talent.role === 'Main Booked Talent'
  //     );

  //     if (existingMainTalent) {
  //       console.log('✅ Primary artist already assigned as main booked talent');
  //       return;
  //     }

  //     const assignmentData = {
  //       userId: primaryArtist.userId || primaryArtist.id,
  //       roleId: primaryArtist.roleId || 3, // Default to managed_artist role
  //       name: primaryArtist.stageName || primaryArtist.fullName,
  //       type: 'Main Booked Talent',
  //       role: primaryArtist.primaryTalent || 'Artist',
  //       selectedRoles: [primaryArtist.primaryTalent || 'Artist'],
  //       availableRoles: [primaryArtist.primaryTalent, ...(primaryArtist.secondaryTalents || [])].filter(Boolean),
  //       isMainBookedTalent: true,
  //       isPrimary: true,
  //       talentType: primaryArtist.userType || 'managed_artist',
  //       assignmentType: 'auto'
  //     };

  //     console.log('📝 Creating main booked talent assignment:', assignmentData);

  //     // Create the assignment
  //     await createAssignmentMutation.mutateAsync(assignmentData);
  //     console.log('✅ Primary artist auto-assigned successfully');

  //   } catch (error) {
  //     console.error('❌ Failed to auto-assign primary artist:', error);
  //   }
  // };

  const updateBookingMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        body: data,
      });
      if (!response.ok) throw new Error("Failed to update booking");
      return response.json();
    },
    onSuccess: () => {
      // Only invalidate the specific booking queries
      queryClient.invalidateQueries({
        queryKey: ["booking-workflow", bookingId],
      });
      queryClient.invalidateQueries({
        queryKey: ["booking-assigned-talent", bookingId],
      });
      toast({ title: "Success", description: "Booking updated successfully" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update booking",
        variant: "destructive",
      });
    },
  });

  // Assignment creation mutation with comprehensive cache invalidation
  const createAssignmentMutation = useMutation({
    mutationFn: async (assignmentData: any) => {
      const backendPayload = {
        userId: assignmentData.userId,
        roleId: assignmentData.roleId,
        selectedTalent: assignmentData.primaryTalentId,
        isMainBookedTalent: assignmentData.isMainBookedTalent,
        assignmentType: assignmentData.assignmentType,
      };

      console.log("💾 SAVING TO DATABASE - Backend payload:", backendPayload);

      // apiRequest থেকে already JSON পাওয়া যাবে
      const data = await apiRequest(`/api/bookings/${bookingId}/assign`, {
        method: "POST",
        body: backendPayload,
      });

      // যদি backend error দিয়ে থাকে
      if (!data || data.error) {
        throw new Error(data?.message || "Failed to create assignment");
      }

      return data; // ✅ Already parsed object
    },

    onSuccess: (data, variables) => {
      // Only invalidate specific booking queries to prevent loops
      queryClient.invalidateQueries({
        queryKey: ["booking-workflow", bookingId],
      });
      queryClient.invalidateQueries({
        queryKey: ["booking-assigned-talent", bookingId],
      });

      toast({
        title: "Assignment Created",
        description: `${variables.name} has been assigned to the booking`,
      });
    },
    onError: (error: any) => {
      console.error("Assignment mutation error:", error);
      const errorMessage =
        typeof error?.message === "string"
          ? error.message
          : "Failed to create assignment";
      toast({
        title: "Assignment Failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const sendWorkflowNotification = async (
    type: string,
    additionalData?: any
  ) => {
    try {
      await apiRequest(`/api/bookings/${bookingId}/workflow/notify`, {
        method: "POST",
        body: {
          type,
          recipients: ["admin@waitumusic.com"],
          ...additionalData,
        },
      });
    } catch (error) {
      console.error("Failed to send workflow notification:", error);
    }
  };

  // Save workflow data function
  const saveWorkflow = async () => {
    setSaving(true);
    try {
      const workflowData = {
        currentStep,
        assignedTalent,
        stagePlot,
        mixerConfig,
        setlist,
        technicalStep,
        selectedTemplate,
        stepConfirmations,
        talentReviewConfirmed,
      };

      console.log(workflowData);

      // API call
      const response = await apiRequest(
        `/api/bookings/${bookingId}/workflow/save`,
        {
          method: "POST",
          body: { workflowData },
        }
      );

      // ✅ No need to check .ok, just check if response has message
      if (!response || !response.message)
        throw new Error("Failed to save workflow");

      toast({
        title: "Workflow Saved",
        description: response.message,
      });
    } catch (error: any) {
      console.error("Save workflow error:", error);
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save workflow data",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Generate PDF function
  const generatePDF = async () => {
    try {
      // Create a link that navigates to the PDF endpoint directly for download
      const token = localStorage.getItem("token");
      const url = `/api/bookings/${bookingId}/workflow/pdf`;

      // Create a temporary link with authentication headers
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to generate PDF");

      // Get the PDF as blob
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);

      // Create download link
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `booking-workflow-${bookingId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up
      window.URL.revokeObjectURL(downloadUrl);

      toast({
        title: "PDF Generated",
        description: "Comprehensive booking workflow PDF has been downloaded",
      });
    } catch (error) {
      console.error("Generate PDF error:", error);
      toast({
        title: "PDF Generation Failed",
        description: "Failed to generate workflow PDF",
        variant: "destructive",
      });
    }
  };

  // Step 2: Enhanced Contract Generation with Category-Based Pricing
  const [contractPreview, setContractPreview] = useState<{
    bookingAgreement: string | null;
    performanceContract: string | null;
  }>({
    bookingAgreement: null,
    performanceContract: null,
  });

  const [contractConfig, setContractConfig] = useState({
    counterOfferDeadline: "",
    paymentTerms: "50% deposit, 50% on completion",
    cancellationPolicy: "72 hours notice required",
    additionalTerms: "",
    waituMusicPlatformName: "Wai'tuMusic",
    labelAddress: "123 Music Lane\nNashville, TN 37203\nUnited States",
    totalBookingPrice: 0,
  });

  // Calculate dynamic total booking price based on category and individual pricing
  const calculateTotalBookingPrice = () => {
    return assignedTalent.reduce((total, talent) => {
      // Main Booked Talent has special priority - only individual overrides apply
      if (talent.isMainBookedTalent) {
        return (
          total +
          (individualPricing[talent.id]?.price ||
            parseFloat(categoryPricing["Main Booked Talent"] as string) ||
            0)
        );
      }
      // For other talent, individual pricing overrides category pricing
      return (
        total +
        (individualPricing[talent.id]?.price ||
          parseFloat(
            categoryPricing[
            talent.type as keyof typeof categoryPricing
            ] as string
          ) ||
          0)
      );
    }, 0);
  };

  // Get assigned talent categories for readonly logic
  const getAssignedCategories = () => {
    const categories = new Set<string>();
    assignedTalent.forEach((talent) => {
      if (talent.isMainBookedTalent) {
        categories.add("Main Booked Talent");
      } else {
        categories.add(talent.type);
      }
    });
    return categories;
  };

  // Category-based pricing for talent types with Main Booked Talent priority
  const [categoryPricing, setCategoryPricing] = useState({
    "Main Booked Talent": "",
    Artist: "",
    Musician: "",
    "Managed Musician": "",
    Professional: "",
    "Contracted Professional": "",
  });

  // Individual talent pricing overrides
  const [individualPricing, setIndividualPricing] = useState<
    Record<
      string,
      {
        price: number;
        counterOfferDeadline: string;
        paymentTerms: string;
        cancellationPolicy: string;
        additionalTerms: string;
      }
    >
  >({});

  const [counterOffer, setCounterOffer] = useState({
    received: false,
    amount: 0,
    deadline: "",
    notes: "",
  });

  useEffect(() => {
    if (booking?.contracts && booking.contracts.length > 0) {
      const bookingAgreement = booking.contracts.find(
        (c: any) => c.contractType === "booking_agreement"
      );
      const performanceContract = booking.contracts.find(
        (c: any) => c.contractType === "performance_contract"
      );

      if (bookingAgreement?.content?.contractConfig) {
        setContractConfig((prev) => ({
          ...prev,
          ...bookingAgreement.content.contractConfig,
        }));
      }

      if (bookingAgreement?.content?.counterOffer) {
        setCounterOffer(bookingAgreement.content.counterOffer);
      }

      if (bookingAgreement?.content?.categoryPricing) {
        setCategoryPricing(bookingAgreement.content.categoryPricing);
      }

      if (bookingAgreement?.content?.individualPricing) {
        setIndividualPricing(bookingAgreement.content.individualPricing);
      }

      // ✅ contract_generation step complete
      setStepConfirmations((prev) => ({ ...prev, 2: true }));
    }

    if (booking?.technicalRider) {
      // ✅ technical_rider + stage_plot step complete
      setStepConfirmations((prev) => ({ ...prev, 3: true, 4: true }));
    }
  }, [booking]);


  const generateContractPreview = async (type: "booking" | "performance") => {
    try {
      // Enhanced preview data with category-based and individual pricing
      const previewData = {
        assignedTalent: assignedTalent.map((talent) => ({
          ...talent,
          individualPrice:
            individualPricing[talent.id]?.price ||
            parseFloat(
              categoryPricing[
              talent.type as keyof typeof categoryPricing
              ] as string
            ) ||
            0,
          paymentTerms:
            individualPricing[talent.id]?.paymentTerms ||
            contractConfig.paymentTerms,
          cancellationPolicy:
            individualPricing[talent.id]?.cancellationPolicy ||
            contractConfig.cancellationPolicy,
          additionalTerms: individualPricing[talent.id]?.additionalTerms || "",
          counterOfferDeadline:
            individualPricing[talent.id]?.counterOfferDeadline ||
            contractConfig.counterOfferDeadline,
        })),
        contractConfig: {
          ...contractConfig,
          categoryPricing,
          totalTalentCost: assignedTalent.reduce((total, talent) => {
            const talentPrice =
              individualPricing[talent.id]?.price ||
              categoryPricing[talent.type as keyof typeof categoryPricing] ||
              0;
            return total + talentPrice;
          }, 0),
          // Ensure platform name is included in contract generation
          platformName: contractConfig.waituMusicPlatformName,
          labelAddress: contractConfig.labelAddress,
        },
        counterOffer,
        booking: {
          ...booking,
          clientName: booking?.bookerName || booking?.clientName || "",
          eventName: booking?.eventName || "",
          eventDate: booking?.eventDate || "",
          venueName: booking?.venueName || booking?.venueDetails || "TBD",
        },
        totalBookingPrice:
          contractConfig.totalBookingPrice || calculateTotalBookingPrice(),
        finalOfferPrice:
          contractConfig.totalBookingPrice || calculateTotalBookingPrice(),
        talentAskingPrice: calculateTotalBookingPrice(),
      };

      // Make raw fetch request since server returns text/plain, not JSON
      const token = localStorage.getItem("token");
      const response = await fetch(
        `/api/bookings/${bookingId}/${type}-agreement-preview`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify(previewData),
          credentials: "include",
        }
      );

      if (response.ok) {
        const preview = await response.text();
        setContractPreview((prev) => ({
          ...prev,
          [type === "booking" ? "bookingAgreement" : "performanceContract"]:
            preview,
        }));
        toast({
          title: "Contract Preview Generated",
          description: `${type === "booking" ? "Booking Agreement" : "Performance Contract"
            } preview with enhanced pricing`,
        });
      } else {
        const errorText = await response.text();
        throw new Error(`${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error("Contract preview error:", error);
      toast({
        title: "Preview Error",
        description: "Unable to generate contract preview",
        variant: "destructive",
      });
    }
  };

  // NEW ENHANCED TECHNICAL RIDER SYSTEM - ALL OLD INTERFACE DESTROYED
  // Step 3: Technical Rider Creation - Original Technical Rider Code with Templates
  const [rider, setRider] = useState<any>({
    artistTechnicalSpecs: {},
    musicianTechnicalSpecs: {},
    equipmentRequirements: [],
    stageRequirements: {},
    lightingRequirements: {},
    soundRequirements: {},
    additionalNotes: "",
  });
  const [technicalStep, setTechnicalStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [stagePlot, setStagePlot] = useState({
    stageWidth: 32,
    stageDepth: 24,
    performers: [
      {
        id: 1,
        name: "Lead Vocals",
        position: { x: 16, y: 4 },
        instrument: "vocals",
        musician: "",
      },
      {
        id: 2,
        name: "Guitar",
        position: { x: 8, y: 8 },
        instrument: "guitar",
        musician: "",
      },
      {
        id: 3,
        name: "Bass",
        position: { x: 24, y: 8 },
        instrument: "bass",
        musician: "",
      },
      {
        id: 4,
        name: "Drums",
        position: { x: 16, y: 16 },
        instrument: "drums",
        musician: "",
      },
      {
        id: 5,
        name: "Keyboards",
        position: { x: 4, y: 12 },
        instrument: "keyboard",
        musician: "",
      },
    ],
    monitors: [
      { id: 1, position: { x: 14, y: 2 }, mix: "Vocal Mix" },
      { id: 2, position: { x: 18, y: 2 }, mix: "Vocal Mix" },
      { id: 3, position: { x: 6, y: 6 }, mix: "Guitar Mix" },
      { id: 4, position: { x: 26, y: 6 }, mix: "Bass Mix" },
      { id: 5, position: { x: 2, y: 10 }, mix: "Keys Mix" },
    ],
    lighting: true,
    videoRecording: false,
    photographyArea: true,
    template: "",
  });

  const stageTemplates = {
    "solo-acoustic": {
      name: "Solo Acoustic",
      performers: [
        {
          id: 1,
          name: "Lead Vocals",
          position: { x: 16, y: 4 },
          instrument: "vocals",
          musician: "",
        },
        {
          id: 2,
          name: "Acoustic Guitar",
          position: { x: 16, y: 8 },
          instrument: "guitar",
          musician: "",
        },
      ],
      monitors: [
        { id: 1, position: { x: 14, y: 2 }, mix: "Vocal/Guitar Mix" },
        { id: 2, position: { x: 18, y: 2 }, mix: "Vocal/Guitar Mix" },
      ],
    },
    duo: {
      name: "Duo Setup",
      performers: [
        {
          id: 1,
          name: "Lead Vocals",
          position: { x: 12, y: 4 },
          instrument: "vocals",
          musician: "",
        },
        {
          id: 2,
          name: "Guitar",
          position: { x: 8, y: 8 },
          instrument: "guitar",
          musician: "",
        },
        {
          id: 3,
          name: "Keyboard/Vocals",
          position: { x: 20, y: 8 },
          instrument: "keyboard",
          musician: "",
        },
      ],
      monitors: [
        { id: 1, position: { x: 10, y: 2 }, mix: "Vocal Mix" },
        { id: 2, position: { x: 18, y: 6 }, mix: "Keys Mix" },
      ],
    },
    "full-band": {
      name: "Full Band",
      performers: [
        {
          id: 1,
          name: "Lead Vocals",
          position: { x: 16, y: 4 },
          instrument: "vocals",
          musician: "",
        },
        {
          id: 2,
          name: "Guitar",
          position: { x: 8, y: 8 },
          instrument: "guitar",
          musician: "",
        },
        {
          id: 3,
          name: "Bass",
          position: { x: 24, y: 8 },
          instrument: "bass",
          musician: "",
        },
        {
          id: 4,
          name: "Drums",
          position: { x: 16, y: 16 },
          instrument: "drums",
          musician: "",
        },
        {
          id: 5,
          name: "Keyboards",
          position: { x: 4, y: 12 },
          instrument: "keyboard",
          musician: "",
        },
      ],
      monitors: [
        { id: 1, position: { x: 14, y: 2 }, mix: "Vocal Mix" },
        { id: 2, position: { x: 18, y: 2 }, mix: "Vocal Mix" },
        { id: 3, position: { x: 6, y: 6 }, mix: "Guitar Mix" },
        { id: 4, position: { x: 26, y: 6 }, mix: "Bass Mix" },
        { id: 5, position: { x: 2, y: 10 }, mix: "Keys Mix" },
      ],
    },
  };

  const [mixerConfig, setMixerConfig] = useState({
    inputs: [
      {
        channel: 1,
        source: "Lead Vocal",
        mic: "SM58",
        location: "Center Stage",
        notes: "Main vocal microphone",
        musician: "",
      },
      {
        channel: 2,
        source: "Backup Vocal 1",
        mic: "SM57",
        location: "Stage Left",
        notes: "Harmony vocals",
        musician: "",
      },
      {
        channel: 3,
        source: "Backup Vocal 2",
        mic: "SM57",
        location: "Stage Right",
        notes: "Harmony vocals",
        musician: "",
      },
      {
        channel: 4,
        source: "Acoustic Guitar",
        mic: "DI + SM81",
        location: "Stage Left",
        notes: "Direct input + condenser mic",
        musician: "",
      },
      {
        channel: 5,
        source: "Electric Guitar",
        mic: "SM57",
        location: "Guitar Amp",
        notes: "Close mic on amp",
        musician: "",
      },
      {
        channel: 6,
        source: "Bass Guitar",
        mic: "DI",
        location: "Bass Amp",
        notes: "Direct input from bass",
        musician: "",
      },
      {
        channel: 7,
        source: "Kick Drum",
        mic: "Beta 52",
        location: "Drum Kit",
        notes: "Inside kick drum",
        musician: "",
      },
      {
        channel: 8,
        source: "Snare Drum",
        mic: "SM57",
        location: "Drum Kit",
        notes: "Top of snare",
        musician: "",
      },
      {
        channel: 9,
        source: "Hi-Hat",
        mic: "SM81",
        location: "Drum Kit",
        notes: "Condenser mic above hi-hat",
        musician: "",
      },
      {
        channel: 10,
        source: "Overhead L",
        mic: "SM81",
        location: "Drum Kit",
        notes: "Left overhead cymbal mic",
        musician: "",
      },
      {
        channel: 11,
        source: "Overhead R",
        mic: "SM81",
        location: "Drum Kit",
        notes: "Right overhead cymbal mic",
        musician: "",
      },
      {
        channel: 12,
        source: "Keyboard",
        mic: "DI (Stereo)",
        location: "Stage Left",
        notes: "Stereo direct input",
        musician: "",
      },
    ],
    monitors: [
      { mix: 1, name: "Lead Vocal Mix", sends: "Vocal, Drums, Bass, Keys" },
      { mix: 2, name: "Guitar Mix", sends: "Guitar, Drums, Bass, Vocal" },
      { mix: 3, name: "Bass Mix", sends: "Bass, Drums, Vocal, Guitar" },
      { mix: 4, name: "Drums Mix", sends: "Drums, Bass, Guitar, Vocal" },
      { mix: 5, name: "Keys Mix", sends: "Keys, Vocal, Drums, Bass" },
    ],
    effects: [
      {
        name: "Vocal Reverb",
        type: "Hall Reverb",
        settings: "Medium decay, warm tone",
      },
      {
        name: "Vocal Delay",
        type: "Digital Delay",
        settings: "1/8 note, 15% feedback",
      },
      {
        name: "Drum Compression",
        type: "Compressor",
        settings: "Fast attack, medium release",
      },
      {
        name: "Master EQ",
        type: "Graphic EQ",
        settings: "House curve adjustment",
      },
    ],
  });

  const [setlist, setSetlist] = useState({
    songs: [
      {
        id: 1,
        title: "Opening Song",
        key: "G",
        duration: "3:45",
        transition: "Direct",
        notes: "High energy opener, crowd interaction",
        chords: "G-D-Em-C",
      },
      {
        id: 2,
        title: "Fan Favorite #1",
        key: "C",
        duration: "4:12",
        transition: "Guitar intro",
        notes: "Audience participation, clap along",
        chords: "C-Am-F-G",
      },
      {
        id: 3,
        title: "Ballad",
        key: "Em",
        duration: "5:30",
        transition: "Acoustic",
        notes: "Stripped down, intimate moment",
        chords: "Em-C-G-D",
      },
      {
        id: 4,
        title: "Dance Track",
        key: "A",
        duration: "3:55",
        transition: "Build up",
        notes: "Get the crowd moving, lights flash",
        chords: "A-D-E-A",
      },
      {
        id: 5,
        title: "Cover Song",
        key: "D",
        duration: "4:20",
        transition: "Medley",
        notes: "Popular cover, sing-along moment",
        chords: "D-A-Bm-G",
      },
      {
        id: 6,
        title: "New Single",
        key: "F",
        duration: "3:38",
        transition: "Direct",
        notes: "Promote new release, energy boost",
        chords: "F-C-Dm-Bb",
      },
      {
        id: 7,
        title: "Instrumental Break",
        key: "Bb",
        duration: "2:45",
        transition: "Solo intro",
        notes: "Showcase musicians, guitar/drum solos",
        chords: "Bb-F-Gm-Eb",
      },
      {
        id: 8,
        title: "Emotional Peak",
        key: "Am",
        duration: "4:55",
        transition: "Slow build",
        notes: "Powerful vocals, emotional connection",
        chords: "Am-F-C-G",
      },
      {
        id: 9,
        title: "Party Anthem",
        key: "E",
        duration: "3:25",
        transition: "Immediate",
        notes: "High energy, crowd jumping",
        chords: "E-A-B-E",
      },
      {
        id: 10,
        title: "Regional Hit",
        key: "G",
        duration: "4:05",
        transition: "Call back",
        notes: "Local crowd favorite, cultural moment",
        chords: "G-Em-C-D",
      },
      {
        id: 11,
        title: "Closing Song",
        key: "C",
        duration: "5:15",
        transition: "Epic build",
        notes: "Big finish, confetti, thank you speech",
        chords: "C-G-Am-F",
      },
    ],
    timing: {
      mainSet: "38:33",
      encore: "7:40",
      totalShow: "~54:00",
    },
    notes:
      "Energy flow: High → Mixed → Emotional peak → Party finish. Include 2-3 crowd interaction moments.",
    specialRequirements:
      "Confetti cannons for final song, backup wireless mics available, towels for performers",
  });

  const generateChords = (key: string) => {
    const chordProgressions = {
      C: ["C-Am-F-G", "C-F-G-C", "Am-F-C-G"],
      G: ["G-D-Em-C", "G-C-D-G", "Em-C-G-D"],
      D: ["D-A-Bm-G", "D-G-A-D", "Bm-G-D-A"],
      A: ["A-D-E-A", "A-F#m-D-E", "F#m-D-A-E"],
      E: ["E-A-B-E", "E-C#m-A-B", "C#m-A-E-B"],
      Em: ["Em-C-G-D", "Em-Am-B-Em", "C-G-Em-D"],
      Am: ["Am-F-C-G", "Am-Dm-G-Am", "F-C-Am-G"],
      F: ["F-C-Dm-Bb", "F-Bb-C-F", "Dm-Bb-F-C"],
      Bb: ["Bb-F-Gm-Eb", "Bb-Eb-F-Bb", "Gm-Eb-Bb-F"],
    };
    const progressions = chordProgressions[
      key as keyof typeof chordProgressions
    ] || ["C-Am-F-G"];
    return progressions[Math.floor(Math.random() * progressions.length)];
  };

  const getInstrumentColor = (instrument: string) => {
    const colors = {
      vocals: "#FF6B6B",
      guitar: "#4ECDC4",
      bass: "#45B7D1",
      drums: "#96CEB4",
      keyboard: "#FFEAA7",
    };
    return colors[instrument as keyof typeof colors] || "#DDD";
  };

  const {
    data: technicalRider,
    refetch: refetchRider,
    isLoading: riderLoading,
  } = useQuery({
    queryKey: ["technical-rider", bookingId],
    queryFn: async () =>
      apiRequest(`/api/bookings/${bookingId}/enhanced-technical-rider`),
    refetchOnWindowFocus: false,
  });

  if (!technicalRider && riderLoading) {
    return <LoadingSpinner />;
  }

  // 1 Function to save all assigned talent to database
  const saveBatchAssignments = async () => {
    if (!assignedTalent || assignedTalent.length === 0) {
      toast({
        title: "No Assignments",
        description: "No talent assigned to save to database",
        variant: "destructive",
      });
      return;
    }

    try {
      // payload তৈরি
      setIsLoading(true);
      const assignments = assignedTalent.map((talent) => {
        const roleId =
          talent.roleId ??
          (talent.type === "Main Booked Talent"
            ? 3
            : talent.type === "Artist"
              ? 4
              : talent.type === "Managed Musician"
                ? 5
                : talent.type === "Musician"
                  ? 6
                  : talent.type === "Contracted Professional"
                    ? 7
                    : talent.type === "Professional"
                      ? 8
                      : 6);

        return {
          userId: talent.userId,
          roleId,
          selectedTalent: talent.selectedTalent || null,
          isMainBookedTalent: talent.isMainBookedTalent || false,
          assignedGroup: talent.assignedGroup || null,
          assignedChannelPair: talent.assignedChannelPair || null,
          assignedChannel: talent.assignedChannel || null,
          assignmentType: "workflow",
        };
      });

      // একবারে সব পাঠানো
      const result = await apiRequest(
        `/api/bookings/${bookingId}/assign/batch`,
        {
          method: "POST",
          body: JSON.stringify({ assignments }),
        }
      );

      // এখানে response already JSON
      stepConfirmations[1] = true;

      queryClient.invalidateQueries({
        queryKey: ["booking-workflow", bookingId],
      });
      queryClient.invalidateQueries({
        queryKey: ["booking-assigned-talent", bookingId],
      });
      setIsLoading(false);

      toast({
        title: "Database Updated",
        description: Array.isArray(result)
          ? `${result.length} talent assignments saved to database`
          : "Assignments saved successfully",
      });
    } catch (error: any) {
      console.error("❌ BATCH SAVE FAILED:", error);
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save assignments",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveContracts = async () => {
    try {
      if (!bookingId) throw new Error("Booking ID not found");
      if (assignedTalent.length === 0) throw new Error("No talent assigned");

      setIsLoading(true);

      // Booking Agreement
      const bookingContract = await apiRequest(
        `/api/bookings/${bookingId}/contracts`,
        {
          method: "POST",
          body: {
            contractType: "booking_agreement",
            title: `Booking Agreement for ${booking?.eventName || "Event"}`,
            content: {
              totalBookingPrice: contractConfig.totalBookingPrice || calculateTotalBookingPrice(),
              categoryPricing,
              individualPricing,
              contractConfig,
              counterOffer,
            },
            metadata: { generatedBy: "system", step: "contract_generation" },
            status: "draft",
          },
        }
      );

      // Performance Contract
      const performanceContract = await apiRequest(
        `/api/bookings/${bookingId}/contracts`,
        {
          method: "POST",
          body: {
            contractType: "performance_contract",
            title: `Performance Contract for ${booking?.eventName || "Event"}`,
            content: {
              totalBookingPrice: contractConfig.totalBookingPrice || calculateTotalBookingPrice(),
              categoryPricing,
              individualPricing,
              contractConfig,
              counterOffer,
            },
            metadata: { generatedBy: "system", step: "contract_generation" },
            status: "draft",
          },
        }
      );

      // Step confirm
      setStepConfirmations((prev) => ({ ...prev, 2: true }));

      // Refetch
      queryClient.invalidateQueries({ queryKey: ["booking-workflow", bookingId] });
      queryClient.invalidateQueries({ queryKey: ["booking-contract", bookingId] });
      queryClient.invalidateQueries({ queryKey: ["booking-signatures", bookingId] });

      toast({
        title: "Contracts Saved",
        description: "Booking & Performance contracts saved successfully",
      });

      return { bookingContract, performanceContract };
    } catch (error: any) {
      console.error("❌ Save contracts error:", error);
      toast({
        title: "Save Failed",
        description: error.message || "Unable to save contracts",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };


  // 3
  const saveTechnicalRider = async (data: any) => {
    try {
      if (!bookingId) throw new Error("Booking ID not found");
      if (assignedTalent.length === 0) throw new Error("No talent assigned");
      if (!data) throw new Error("No Data Found");

      setIsLoading(true);
      console.log(data)

      // Database এ পাঠানোর payload তৈরি করলাম
      // const payload = {
      //   bookingId: bookingId,
      //   artistTechnicalSpecs: rider.artistTechnicalSpecs || {},
      //   musicianTechnicalSpecs: rider.musicianTechnicalSpecs || {},
      //   equipmentRequirements: rider.equipmentRequirements || [],
      //   stageRequirements: {
      //     ...stagePlot,
      //   },
      //   lightingRequirements: {
      //     lighting: stagePlot.lighting,
      //     videoRecording: stagePlot.videoRecording,
      //     photographyArea: stagePlot.photographyArea,
      //   },
      //   soundRequirements: {
      //     ...mixerConfig,
      //   },
      //   additionalNotes: rider.additionalNotes || "",
      //   setlist: setlist, // চাইলে এটাকেও save করতে পারো (extra jsonb column লাগবে)
      // };

      // // API call
      // await apiRequest(`/api/bookings/${bookingId}/technical-rider`, {
      //   method: "POST",
      //   body: JSON.stringify(payload),
      // });


      toast(TOAST_CONFIGS.SUCCESS.SAVE);
      setIsLoading(false);
      stepConfirmations[3] === true
      queryClient.invalidateQueries({
        queryKey: ["booking-workflow", bookingId],
      });
    } catch (error) {
      console.error("Error saving technical rider:", error);
      toast(TOAST_CONFIGS.ERROR.SAVE_FAILED);
    } finally {
      setIsLoading(false);
    }
  };

  const saveStagePlot = async (): Promise<void> => {
    if (!stagePlot) {
      toast({
        title: "No Stage Plot",
        description: "Please fill stage plot data",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await apiRequest(
        `/api/bookings/${bookingId}/stage-plot`,
        {
          method: "POST",
          body: JSON.stringify(stagePlot),
        }
      );

      if (!response.ok) {
        const err = await response.text();
        throw new Error(err || "Failed to save stage plot");
      }

      await response.json();
      queryClient.invalidateQueries({
        queryKey: ["booking-stage-plot", bookingId],
      });

      toast({ title: "Stage Plot Saved" });
    } catch (error: any) {
      console.error("❌ Save Stage Plot Error:", error);
      toast({
        title: "Save Failed",
        description: error.message || "Unable to save stage plot",
        variant: "destructive",
      });
    }
  };

  const saveSignatures = async () => {
    // if (!signatures || signatures.length === 0) {
    //   toast({ title: "No Signatures", description: "Please collect signatures", variant: "destructive" });
    //   return;
    // }
    // try {
    //   const promises = signatures.map(async (sig) => {
    //     const response = await apiRequest(`/api/bookings/${bookingId}/signatures`, {
    //       method: "POST",
    //       body: JSON.stringify(sig),
    //     });
    //     if (!response.ok) throw new Error(`Failed to save signature: ${sig.name}`);
    //     return await response.json();
    //   });
    //   const results = await Promise.allSettled(promises);
    //   const savedCount = results.filter((r) => r.status === "fulfilled").length;
    //   queryClient.invalidateQueries({ queryKey: ["booking-signatures", bookingId] });
    //   toast({ title: "Signatures Saved", description: `${savedCount} signatures saved` });
    // } catch (error: any) {
    //   console.error("❌ Save Signatures Error:", error);
    //   toast({ title: "Save Failed", description: error.message, variant: "destructive" });
    // }
  };

  const savePayments = async () => {
    // if (!payments || payments.length === 0) {
    //   toast({ title: "No Payments", description: "Please record payments", variant: "destructive" });
    //   return;
    // }
    // try {
    //   const promises = payments.map(async (pay) => {
    //     const response = await apiRequest(`/api/bookings/${bookingId}/payments`, {
    //       method: "POST",
    //       body: JSON.stringify(pay),
    //     });
    //     if (!response.ok) throw new Error(`Failed to save payment: ${pay.amount}`);
    //     return await response.json();
    //   });
    //   const results = await Promise.allSettled(promises);
    //   const savedCount = results.filter((r) => r.status === "fulfilled").length;
    //   queryClient.invalidateQueries({ queryKey: ["booking-payments", bookingId] });
    //   toast({ title: "Payments Saved", description: `${savedCount} payments saved` });
    // } catch (error: any) {
    //   console.error("❌ Save Payments Error:", error);
    //   toast({ title: "Save Failed", description: error.message, variant: "destructive" });
    // }
  };

  // Define the new 6-step workflow as requested
  const workflowSteps: WorkflowStep[] = [
    {
      id: "talent_assignment",
      title: "Talent Assignment",
      description: "Assign Artists, Musicians and Professionals",
      canProgress: assignedTalent.length > 0,
      status:
        assignedTalent.length > 0
          ? "completed"
          : currentStep === 1
            ? "in_progress"
            : "pending",
      icon: <Users className="h-5 w-5" />,
      isActive: currentStep === 1,
    },
    {
      id: "contract_generation",
      title: "Contract Generation",
      description: "Generate booking contracts",
      canProgress: stepConfirmations[2] === true,
      status: stepConfirmations[2]
        ? "completed"
        : currentStep === 2
          ? "in_progress"
          : "pending",
      icon: <FileText className="h-5 w-5" />,
      isActive: currentStep === 2,
    },
    {
      id: "technical_rider",
      title: "Technical Rider",
      description: "Technical requirements",
      canProgress: stepConfirmations[3] === true,
      status: stepConfirmations[3]
        ? "completed"
        : currentStep === 3
          ? "in_progress"
          : "pending",
      icon: <Sliders className="h-5 w-5" />,
      isActive: currentStep === 3,
    },
    {
      id: "stage_plot",
      title: "Stage Plot",
      description: "Stage plot requirements",
      canProgress: stepConfirmations[4] === true,
      status: stepConfirmations[4]
        ? "completed"
        : currentStep === 4
          ? "in_progress"
          : "pending",
      icon: <Sliders className="h-5 w-5" />,
      isActive: currentStep === 4,
    },
    {
      id: "signature_collection",
      title: "Signature Collection",
      description: "Collect contract signatures",
      canProgress: (booking?.signatures?.length || 0) >= 1,
      status:
        (booking?.signatures?.length || 0) >= 1
          ? "completed"
          : currentStep === 5
            ? "in_progress"
            : "pending",
      icon: <PenTool className="h-5 w-5" />,
      isActive: currentStep === 5,
    },
    {
      id: "payment_processing",
      title: "Payment Processing",
      description: "Process payments & receipts",
      canProgress: (booking?.payments?.length || 0) > 0,
      status:
        (booking?.payments?.length || 0) > 0
          ? "completed"
          : currentStep === 6
            ? "in_progress"
            : "pending",
      icon: <CreditCard className="h-5 w-5" />,
      isActive: currentStep === 6,
    },
  ];

  const goToNextStep = () => {
    setCurrentStep((prev) => {
      if (prev < workflowSteps.length) {
        return prev + 1;
      }
      return prev; // শেষ step এ থাকলে আর বাড়বে না
    });
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle navigation step click with role-based permissions
  const handleStepClick = (stepNumber: number) => {
    // Superadmins can jump to any step
    if (userRole === "superadmin") {
      setCurrentStep(stepNumber);
      toast({
        title: "Navigation",
        description: `Jumped to step ${stepNumber}: ${workflowSteps[stepNumber - 1]?.title
          }`,
      });
      return;
    }

    // Admins and assigned admins can only jump to steps after completing Technical Rider (step 3)
    if (
      (userRole === "admin" || userRole === "assigned_admin") &&
      technicalConfirmed
    ) {
      setCurrentStep(stepNumber);
      toast({
        title: "Navigation",
        description: `Jumped to step ${stepNumber}: ${workflowSteps[stepNumber - 1]?.title
          }`,
      });
      return;
    }

    // For other users or if technical rider not completed, only allow backward navigation or current step
    if (stepNumber <= currentStep) {
      setCurrentStep(stepNumber);
    } else {
      toast({
        title: "Navigation Restricted",
        description:
          userRole === "admin" || userRole === "assigned_admin"
            ? "Complete the Technical Rider section first to enable step navigation"
            : "You can only navigate to previous or current steps",
        variant: "destructive",
      });
    }
  };

  const getProgressPercentage = () => {
    const completedSteps = workflowSteps.filter(
      (step) => step.status === "completed"
    ).length;
    return (completedSteps / workflowSteps.length) * 100;
  };

  // Step 1: Booking Selection
  const renderBookingSelection = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Current Booking</CardTitle>
          </CardHeader>
          <CardContent>
            {booking ? (
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Event Name</Label>
                  <p className="text-lg">{booking.eventName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Date</Label>
                  <p>{new Date(booking.eventDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge variant="outline">{booking.status}</Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Primary Artist</Label>
                  <p>{booking.primaryArtist?.stageName || "Not assigned"}</p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No booking selected</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Available Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {availableBookings.map((bkg: any) => (
                <div
                  key={bkg.id}
                  className={`p-3 border rounded cursor-pointer transition-colors ${bkg.id === bookingId
                    ? "bg-primary/10 border-primary"
                    : "hover:bg-muted"
                    }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{bkg.eventName}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(bkg.eventDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="outline">{bkg.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Step 2: Talent Assignment
  const renderTalentAssignment = () => {
    // Categorize available talent by their primary talent type, not role_id
    const availableTalent = [
      ...(Array.isArray(availableArtists) ? availableArtists : []),
      ...(Array.isArray(availableMusicians) ? availableMusicians : []),
      ...(Array.isArray(availableProfessionals) ? availableProfessionals : []),
    ];

    const managedRoles = [3, 5, 7];
    const regularRoles = [4, 6, 8];

    const getRoles = (talent: any): number[] => {
      if (Array.isArray(talent.roles)) return talent.roles;
      if (Array.isArray(talent.user?.roles)) return talent.user.roles;
      if (talent.roleId) return [talent.roleId];
      if (talent.user?.roleId) return [talent.user.roleId];
      return [];
    };

    // const availableTalent = allTalent.filter(
    //   (talent) => talent.userId !== booking?.primaryArtist?.userId
    // );

    const categorizedTalent = {
      managedArtists: availableTalent.filter((talent) =>
        getRoles(talent).some((r) => managedRoles.includes(r) && r === 3)
      ),
      managedMusicians: availableTalent.filter((talent) =>
        getRoles(talent).some((r) => managedRoles.includes(r) && r === 5)
      ),
      managedProfessionals: availableTalent.filter((talent) =>
        getRoles(talent).some((r) => managedRoles.includes(r) && r === 7)
      ),

      artists: availableTalent.filter((talent) =>
        getRoles(talent).some((r) => regularRoles.includes(r) && r === 4)
      ),
      musicians: availableTalent.filter((talent) =>
        getRoles(talent).some((r) => regularRoles.includes(r) && r === 6)
      ),
      professionals: availableTalent.filter((talent) =>
        getRoles(talent).some((r) => regularRoles.includes(r) && r === 8)
      ),
    };


    return (
      <div className="space-y-6">
        {/* Main Booked Talent */}
        {booking && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Main Booked Talent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 p-4 border rounded bg-gradient-to-r from-emerald-50 to-cyan-50">
                <div className="flex flex-col gap-4 lg:flex-row justify-between w-full">
                  <div className="flex-1 flex gap-4">
                    <Avatar className="w-16 h-16 border-2 border-emerald-500">
                      <AvatarImage
                        src={
                          booking.primaryArtist?.profile?.avatarUrl ||
                          booking.primaryArtist?.avatarUrl
                        }
                      />
                      <AvatarFallback className="bg-emerald-500 text-white text-xl font-bold">
                        {booking.primaryArtist?.stageName?.[0] ||
                          booking.primaryArtist?.fullName?.[0] ||
                          "P"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-bold text-emerald-800">
                        {booking.primaryArtist?.stageName ||
                          booking.primaryArtist?.fullName ||
                          "Primary Talent"}
                      </h3>
                      <p className="text-emerald-600 font-medium">
                        {booking.primaryArtist?.isManaged ? "Managed " : ""}
                        {booking.primaryArtist?.userType || "Artist"}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Event: {booking.eventName} •{" "}
                        {booking.eventDate
                          ? new Date(booking.eventDate).toLocaleDateString()
                          : "Date TBD"}
                      </p>
                      <Badge variant="default" className="mt-2 bg-emerald-600">
                        Main Booked Talent
                      </Badge>
                    </div>
                  </div>
                  <div className="flex-1 flex justify-center items-center w-full h-full">
                    <div className="flex flex-col gap-2 w-full">
                      <div className="text-right">
                        <Badge
                          className="capitalize"
                          variant={
                            booking.status === "approved"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {booking.status || "pending"}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-green-500 text-green-700 hover:bg-green-50 w-full"
                          onClick={async () => {
                            try {
                              await updateBookingMutation.mutateAsync({
                                status: "accepted",
                              });
                              toast({
                                title: "Booking Accepted",
                                description:
                                  "The booking has been accepted by the primary artist",
                              });
                            } catch (error) {
                              toast({
                                title: "Error",
                                description: "Failed to accept booking",
                                variant: "destructive",
                              });
                            }
                          }}
                        >
                          Accept Booking
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-500 text-red-700 hover:bg-red-50 w-full"
                          onClick={async () => {
                            try {
                              await updateBookingMutation.mutateAsync({
                                status: "declined",
                              });
                              toast({
                                title: "Booking Declined",
                                description:
                                  "The booking has been declined by the primary artist",
                              });
                            } catch (error) {
                              toast({
                                title: "Error",
                                description: "Failed to decline booking",
                                variant: "destructive",
                              });
                            }
                          }}
                        >
                          Decline Booking
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Assigned Talent */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Assigned Talent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {assignedTalent.length > 0 ? (
                assignedTalent.map((talent: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded bg-blue-50"
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={talent.avatarUrl} />
                        <AvatarFallback className="bg-blue-500 text-white">
                          {talent.name?.[0] || "T"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">
                          {talent.assignmentName || talent.name || "No name"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {talent.type || "No type"} •{" "}
                          {talent.genre || talent.role || "No role"}
                        </p>
                        {/* Performance Professional Rate Field */}
                        {talent.type === "Performance Professional" && (
                          <div className="mt-2 flex items-center gap-2">
                            <Label
                              htmlFor={`rate-${talent.id}`}
                              className="text-xs"
                            >
                              Rate:
                            </Label>
                            <Input
                              id={`rate-${talent.id}`}
                              type="number"
                              placeholder="$0.00"
                              className="w-24 h-6 text-xs"
                              defaultValue={talent.rate || ""}
                              onChange={(e) => {
                                const updatedTalent = assignedTalent.map((t) =>
                                  t.id === talent.id
                                    ? { ...t, rate: e.target.value }
                                    : t
                                );
                                setAssignedTalent(updatedTalent);
                              }}
                            />
                            <span className="text-xs text-muted-foreground">
                              per hour
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    {talent.type === "Main Booked Talent" ||
                      talent.userId === booking?.primaryArtist.userId ? (
                      <div className="flex flex-col items-end gap-1">
                        <Badge
                          variant="outline"
                          className="border-emerald-500 text-emerald-700 bg-emerald-50"
                        >
                          Main Booked Talent
                        </Badge>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-green-500 text-green-700 hover:bg-green-50 text-xs px-2 py-1"
                          >
                            Accept
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-red-500 text-red-700 hover:bg-red-50 text-xs px-2 py-1"
                          >
                            Decline
                          </Button>
                          {/* <Button
                            variant="outline"
                            size="sm"
                            className="border-red-300 text-red-600 hover:bg-red-50"
                            onClick={async () => {
                              try {
                                await apiRequest(`/api/assignments/${talent.id}`, {
                                  method: "DELETE",
                                });

                                setAssignedTalent((prev) =>
                                  prev.filter((t) => t.id !== talent.id)
                                );

                                toast({
                                  title: "Unassigned",
                                  description: `${talent.name} removed from booking`,
                                });
                              } catch (error: any) {
                                toast({
                                  title: "Remove Failed",
                                  description:
                                    error.message || "Something went wrong",
                                  variant: "destructive",
                                });
                              }
                            }}
                          >
                            Remove
                          </Button> */}
                        </div>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-300 text-red-600 hover:bg-red-50"
                        onClick={async () => {
                          try {
                            await apiRequest(`/api/assignments/${talent.id}`, {
                              method: "DELETE",
                            });

                            setAssignedTalent((prev) =>
                              prev.filter((t) => t.id !== talent.id)
                            );

                            toast({
                              title: "Unassigned",
                              description: `${talent.name} removed from booking`,
                            });
                          } catch (error: any) {
                            toast({
                              title: "Remove Failed",
                              description:
                                error.message || "Something went wrong",
                              variant: "destructive",
                            });
                          }
                        }}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No talent assigned yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Available Talent */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Available Talent
              <Badge variant="outline" className="ml-auto">
                Admin Access Only
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* 1. Managed Artists */}
              {categorizedTalent.managedArtists.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm text-emerald-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <Crown className="w-4 h-4 text-emerald-600" />
                    Managed Artists
                  </h4>
                  <div className="space-y-2">
                    {categorizedTalent.managedArtists.map(
                      (artist: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border rounded bg-emerald-50"
                        >
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage src={artist.profile?.avatarUrl} />
                              <AvatarFallback className="bg-emerald-500 text-white">
                                {artist.stageName?.[0] ||
                                  artist.user?.fullName?.[0] ||
                                  "A"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {artist.stageName || artist.user?.fullName}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Managed Artist • {artist.primaryTalent}
                              </p>
                            </div>
                          </div>
                          {assignedTalent.some(
                            (t) => t.userId === artist.userId
                          ) ? (
                            <Badge variant="secondary">Already Assigned</Badge>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-emerald-300 hover:bg-emerald-100"
                              onClick={async () => {
                                const isMainBookedTalent =
                                  assignedTalent.length === 0; // First assigned becomes Main Booked Talent
                                // Use the artist's primary role instead of management status
                                const primaryRole =
                                  artist.primaryRole || "Lead Vocalist";
                                const artistRoles = [
                                  primaryRole,
                                  ...(artist.skillsAndInstruments || []),
                                ].filter(Boolean);
                                const newAssignment = {
                                  id: Date.now(),
                                  userId: artist.userId,
                                  name:
                                    artist.stageName || artist.user?.fullName,
                                  type: isMainBookedTalent
                                    ? "Main Booked Talent"
                                    : "Artist",
                                  role: isMainBookedTalent
                                    ? "Main Booked Talent"
                                    : primaryRole,
                                  selectedRoles: isMainBookedTalent
                                    ? ["Main Booked Talent", ...artistRoles]
                                    : artistRoles,
                                  availableRoles: artistRoles,
                                  avatarUrl: artist.profile?.avatarUrl,
                                  genre: artist.genre,
                                  isPrimary: isMainBookedTalent,
                                  isMainBookedTalent: isMainBookedTalent,
                                  primaryTalentId: artist.primaryTalentId,
                                  assignmentType: "manual",
                                };
                                // setAssignedTalent([...assignedTalent, assignmentData]);
                                // toast({
                                //   title: "Assignment",
                                //   description: `${artist.stageName || artist.user?.fullName} assigned as ${isMainBookedTalent ? 'Main Booked Talent' : 'Supporting Talent'}`
                                // });

                                // Save immediately to database
                                try {
                                  await createAssignmentMutation.mutateAsync({
                                    ...newAssignment,
                                    roleId: 4,
                                  });
                                  console.log(
                                    "✅ Assignment saved to database immediately"
                                  );
                                } catch (error) {
                                  console.error(
                                    "❌ Failed to save assignment:",
                                    error
                                  );
                                }
                              }}
                            >
                              Assign
                            </Button>
                          )}
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* 2. Artists */}
              {categorizedTalent.artists.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm text-blue-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <Music className="w-4 h-4 text-blue-600" />
                    Artists
                  </h4>
                  <div className="space-y-2">
                    {categorizedTalent.artists.map((artist: any, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded"
                      >
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={artist.profile?.avatarUrl} />
                            <AvatarFallback className="bg-blue-500 text-white">
                              {artist.stageName?.[0] ||
                                artist.user?.fullName?.[0] ||
                                "A"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {artist.stageName || artist.user?.fullName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Artist • {artist.primaryTalent}
                            </p>
                          </div>
                        </div>
                        {assignedTalent.some(
                          (t) => t.userId === artist.userId
                        ) ? (
                          <Badge variant="secondary">Already Assigned</Badge>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              const isMainBookedTalent =
                                assignedTalent.length === 0; // First assigned becomes Main Booked Talent
                              // Use the artist's primary role instead of management status
                              const primaryRole =
                                artist.primaryRole || "Lead Vocalist";
                              const artistRoles = [
                                primaryRole,
                                ...(artist.skillsAndInstruments || []),
                              ].filter(Boolean);
                              const newAssignment = {
                                id: Date.now(),
                                userId: artist.userId,
                                name: artist.stageName || artist.user?.fullName,
                                type: isMainBookedTalent
                                  ? "Main Booked Talent"
                                  : "Artist",
                                role: isMainBookedTalent
                                  ? "Main Booked Talent"
                                  : primaryRole,
                                selectedRoles: isMainBookedTalent
                                  ? ["Main Booked Talent", ...artistRoles]
                                  : artistRoles,
                                availableRoles: artistRoles,
                                avatarUrl: artist.profile?.avatarUrl,
                                genre: artist.genre,
                                primaryTalentId: artist.primaryTalentId,
                                isPrimary: isMainBookedTalent,
                                isMainBookedTalent: isMainBookedTalent,
                              };
                              // setAssignedTalent([...assignedTalent, newAssignment]);
                              // toast({
                              //   title: "Assignment",
                              //   description: `${artist.stageName || artist.user?.fullName} assigned as ${isMainBookedTalent ? 'Main Booked Talent' : 'Supporting Talent'}`
                              // });

                              // Save immediately to database
                              try {
                                await createAssignmentMutation.mutateAsync({
                                  ...newAssignment,
                                  roleId: 4,
                                });
                                console.log(
                                  "✅ Assignment saved to database immediately"
                                );
                              } catch (error) {
                                console.error(
                                  "❌ Failed to save assignment:",
                                  error
                                );
                              }
                            }}
                          >
                            Assign
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Managed Musicians */}
              {categorizedTalent.managedMusicians.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm text-purple-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <Crown className="w-4 h-4 text-purple-600" />
                    Managed Musicians
                  </h4>
                  <div className="space-y-2">
                    {categorizedTalent.managedMusicians.map(
                      (musician: any, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border rounded bg-purple-50"
                        >
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage src={musician.profile?.avatarUrl} />
                              <AvatarFallback className="bg-purple-500 text-white">
                                {musician.stageName?.[0] ||
                                  musician.user?.fullName?.[0] ||
                                  "M"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="font-medium">
                                {musician.stageName || musician.user?.fullName}
                              </p>
                              <div className="mt-1">
                                <div className="flex flex-wrap gap-1 items-center">
                                  <span className="text-xs text-muted-foreground">
                                    Talents/Skills:
                                  </span>
                                  {/* Primary Talent Badge */}
                                  {musician.primaryTalent && (
                                    <Badge
                                      variant="default"
                                      className="text-xs bg-purple-600 text-white"
                                    >
                                      {musician.primaryTalent}
                                    </Badge>
                                  )}
                                  {/* Secondary Talents */}
                                  {musician.secondaryTalents &&
                                    musician.secondaryTalents.length > 0 ? (
                                    musician.secondaryTalents
                                      .slice(0, 3)
                                      .map((talent: string, idx: number) => (
                                        <Badge
                                          key={idx}
                                          variant="outline"
                                          className="text-xs border-purple-300 text-purple-700"
                                        >
                                          {talent}
                                        </Badge>
                                      ))
                                  ) : (
                                    <span className="text-xs text-muted-foreground italic">
                                      No secondary talents listed
                                    </span>
                                  )}
                                  {musician.secondaryTalents &&
                                    musician.secondaryTalents.length > 3 && (
                                      <span className="text-xs text-muted-foreground">
                                        +{musician.secondaryTalents.length - 3}{" "}
                                        more
                                      </span>
                                    )}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 min-w-32">
                            {assignedTalent.some(
                              (t) => t.userId === musician.userId
                            ) ? (
                              <Badge variant="secondary">
                                Already Assigned
                              </Badge>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-purple-300 hover:bg-purple-100"
                                onClick={async () => {
                                  const isMainBookedTalent =
                                    assignedTalent.length === 0;
                                  const primaryRole =
                                    musician.primaryTalent ||
                                    "Managed Musician";
                                  const musicianRoles = [
                                    primaryRole,
                                    ...(musician.secondaryTalents || []),
                                  ].filter(Boolean);
                                  const newAssignment = {
                                    id: Date.now(),
                                    userId: musician.userId,
                                    name:
                                      musician.stageName ||
                                      musician.user?.fullName,
                                    type: isMainBookedTalent
                                      ? "Main Booked Talent"
                                      : "Managed Musician",
                                    role: isMainBookedTalent
                                      ? "Main Booked Talent"
                                      : primaryRole,
                                    selectedRoles: isMainBookedTalent
                                      ? ["Main Booked Talent", ...musicianRoles]
                                      : musicianRoles,
                                    availableRoles: musicianRoles,
                                    avatarUrl: musician.profile?.avatarUrl,
                                    isPrimary: isMainBookedTalent,
                                    primaryTalentId: musician.primaryTalentId,
                                    isMainBookedTalent: isMainBookedTalent,
                                  };
                                  // setAssignedTalent([...assignedTalent, newAssignment]);
                                  // toast({
                                  //   title: "Assignment",
                                  //   description: `${musician.stageName || musician.user?.fullName} assigned as ${isMainBookedTalent ? 'Main Booked Talent' : primaryRole}`
                                  // });
                                  // Save immediately to database
                                  try {
                                    await createAssignmentMutation.mutateAsync({
                                      ...newAssignment,
                                      roleId: 5, // managed_musician role
                                    });
                                    console.log(
                                      "✅ Managed musician assignment saved to database immediately"
                                    );
                                  } catch (error) {
                                    console.error(
                                      "❌ Failed to save managed musician assignment:",
                                      error
                                    );
                                  }
                                }}
                              >
                                Assign
                              </Button>
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* 4. Musicians */}
              {categorizedTalent.musicians.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm text-indigo-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <Guitar className="w-4 h-4 text-indigo-600" />
                    Musicians
                  </h4>
                  <div className="space-y-2">
                    {categorizedTalent.musicians.map(
                      (musician: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border rounded"
                        >
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage src={musician.profile?.avatarUrl} />
                              <AvatarFallback className="bg-indigo-500 text-white">
                                {musician.stageName?.[0] ||
                                  musician.user?.fullName?.[0] ||
                                  "M"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="font-medium">
                                {musician.stageName || musician.user?.fullName}
                              </p>
                              <div className="mt-1">
                                <div className="flex flex-wrap gap-1 items-center">
                                  <span className="text-xs text-muted-foreground">
                                    Talents/Skills:
                                  </span>
                                  {/* Primary Talent Badge */}
                                  {musician.primaryTalent && (
                                    <Badge
                                      variant="default"
                                      className="text-xs bg-purple-600 text-white"
                                    >
                                      {musician.primaryTalent}
                                    </Badge>
                                  )}
                                  {/* Secondary Talents */}
                                  {musician.secondaryTalents &&
                                    musician.secondaryTalents.length > 0 ? (
                                    musician.secondaryTalents
                                      .slice(0, 3)
                                      .map((talent: string, idx: number) => (
                                        <Badge
                                          key={idx}
                                          variant="outline"
                                          className="text-xs border-indigo-300 text-indigo-700"
                                        >
                                          {talent}
                                        </Badge>
                                      ))
                                  ) : (
                                    <span className="text-xs text-muted-foreground italic">
                                      No secondary talents listed
                                    </span>
                                  )}
                                  {musician.secondaryTalents &&
                                    musician.secondaryTalents.length > 3 && (
                                      <span className="text-xs text-muted-foreground">
                                        +{musician.secondaryTalents.length - 3}{" "}
                                        more
                                      </span>
                                    )}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 min-w-32">
                            {assignedTalent.some(
                              (t) => t.userId === musician.userId
                            ) ? (
                              <Badge variant="secondary">
                                Already Assigned
                              </Badge>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={async () => {
                                  const isMainBookedTalent =
                                    assignedTalent.length === 0;
                                  const primaryRole =
                                    musician.primaryTalent || "Musician";
                                  const musicianRoles = [
                                    primaryRole,
                                    ...(musician.secondaryTalents || []),
                                  ].filter(Boolean);
                                  const newAssignment = {
                                    id: Date.now(),
                                    userId: musician.userId,
                                    name:
                                      musician.stageName ||
                                      musician.user?.fullName,
                                    type: isMainBookedTalent
                                      ? "Main Booked Talent"
                                      : "Musician",
                                    role: isMainBookedTalent
                                      ? "Main Booked Talent"
                                      : primaryRole,
                                    selectedRoles: isMainBookedTalent
                                      ? ["Main Booked Talent", ...musicianRoles]
                                      : musicianRoles,
                                    availableRoles: musicianRoles,
                                    avatarUrl: musician.profile?.avatarUrl,
                                    isPrimary: isMainBookedTalent,
                                    primaryTalentId: musician.primaryTalentId,
                                    isMainBookedTalent: isMainBookedTalent,
                                  };
                                  // setAssignedTalent([...assignedTalent, newAssignment]);
                                  // toast({
                                  //   title: "Assignment",
                                  //   description: `${musician.stageName || musician.user?.fullName} assigned as ${isMainBookedTalent ? 'Main Booked Talent' : primaryRole}`
                                  // });
                                  // Save immediately to database
                                  try {
                                    await createAssignmentMutation.mutateAsync({
                                      ...newAssignment,
                                      roleId: 6, // musician role
                                    });
                                    console.log(
                                      "✅ Musician assignment saved to database immediately"
                                    );
                                  } catch (error) {
                                    console.error(
                                      "❌ Failed to save musician assignment:",
                                      error
                                    );
                                  }
                                }}
                              >
                                Assign
                              </Button>
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* 5. Managed Professionals */}
              {categorizedTalent.managedProfessionals &&
                categorizedTalent.managedProfessionals.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm text-purple-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-purple-600" />
                      Managed Professionals
                    </h4>
                    <div className="space-y-2">
                      {categorizedTalent.managedProfessionals.map(
                        (professional: any, index: number) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 border rounded bg-purple-50"
                          >
                            <div className="flex items-center space-x-3">
                              <Avatar>
                                <AvatarImage
                                  src={professional.profile?.avatarUrl}
                                />
                                <AvatarFallback className="bg-purple-500 text-white">
                                  {professional.stageName?.[0] ||
                                    professional.user?.fullName?.[0] ||
                                    "P"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">
                                  {professional.stageName ||
                                    professional.user?.fullName}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Managed Professional •{" "}
                                  {professional.primaryTalent}
                                </p>
                              </div>
                            </div>
                            {assignedTalent.some(
                              (t) => t.userId === professional.userId
                            ) ? (
                              <Badge variant="secondary">
                                Already Assigned
                              </Badge>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-purple-300 hover:bg-purple-100"
                                onClick={async () => {
                                  // Simple assignment for professionals - they don't need talent dropdowns
                                  const newAssignment = {
                                    id: Date.now(),
                                    userId: professional.userId,
                                    name:
                                      professional.stageName ||
                                      professional.user?.fullName,
                                    type: "Contracted Professional",
                                    role:
                                      professional.serviceType ||
                                      "Contracted Professional",
                                    primaryTalentId:
                                      professional.primaryTalentId,
                                    avatarUrl: professional.profile?.avatarUrl,
                                  };
                                  // setAssignedTalent([...assignedTalent, newAssignment]);
                                  // toast({
                                  //   title: "Assignment",
                                  //   description: `${professional.stageName || professional.user?.fullName} assigned as ${professional.serviceType || 'Professional'}`
                                  // });

                                  // Save immediately to database
                                  try {
                                    await createAssignmentMutation.mutateAsync({
                                      ...newAssignment,
                                      roleId: 7, // professional role
                                    });
                                    console.log(
                                      "✅ Professional assignment saved to database immediately"
                                    );
                                  } catch (error) {
                                    console.error(
                                      "❌ Failed to save professional assignment:",
                                      error
                                    );
                                  }
                                }}
                              >
                                Assign
                              </Button>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* 6. Professionals */}
              {categorizedTalent.professionals &&
                categorizedTalent.professionals.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm text-slate-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-slate-600" />
                      Professionals
                    </h4>
                    <div className="space-y-2">
                      {categorizedTalent.professionals.map(
                        (professional: any, index: number) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 border rounded"
                          >
                            <div className="flex items-center space-x-3">
                              <Avatar>
                                <AvatarImage
                                  src={professional.profile?.avatarUrl}
                                />
                                <AvatarFallback className="bg-slate-500 text-white">
                                  {professional.stageName?.[0] ||
                                    professional.user?.fullName?.[0] ||
                                    "P"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">
                                  {professional.stageName ||
                                    professional.user?.fullName}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Professional • {professional.primaryTalent}
                                </p>
                              </div>
                            </div>
                            {assignedTalent.some(
                              (t) => t.userId === professional.userId
                            ) ? (
                              <Badge variant="secondary">
                                Already Assigned
                              </Badge>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={async () => {
                                  // Simple assignment for professionals - they don't need talent dropdowns
                                  const newAssignment = {
                                    id: Date.now(),
                                    userId: professional.userId,
                                    name:
                                      professional.stageName ||
                                      professional.user?.fullName,
                                    type: "Professional",
                                    role:
                                      professional.serviceType ||
                                      "Professional",
                                    avatarUrl: professional.profile?.avatarUrl,
                                  };
                                  // setAssignedTalent([...assignedTalent, newAssignment]);
                                  // toast({
                                  //   title: "Assignment",
                                  //   description: `${professional.stageName || professional.user?.fullName} assigned as ${professional.serviceType || 'Professional'}`
                                  // });
                                  try {
                                    await createAssignmentMutation.mutateAsync({
                                      ...newAssignment,
                                      roleId: 8, // professional role
                                    });
                                    console.log(
                                      "✅ Professional assignment saved to database immediately"
                                    );
                                  } catch (error) {
                                    console.error(
                                      "❌ Failed to save professional assignment:",
                                      error
                                    );
                                  }
                                }}
                              >
                                Assign
                              </Button>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* Loading states */}
              {(!availableArtists ||
                !availableMusicians ||
                !availableProfessionals) && (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
                    <p className="text-muted-foreground">
                      Loading available talent...
                    </p>
                  </div>
                )}

              {/* No talent available */}
              {(Array.isArray(availableArtists)
                ? availableArtists.length
                : 0) === 0 &&
                (Array.isArray(availableMusicians)
                  ? availableMusicians.length
                  : 0) === 0 &&
                (Array.isArray(availableProfessionals)
                  ? availableProfessionals.length
                  : 0) === 0 && (
                  <p className="text-muted-foreground text-center py-4">
                    No talent available for assignment
                  </p>
                )}
            </div>
          </CardContent>
        </Card>

        {/* Talent Review Confirmation
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="talent-review-confirm"
                checked={talentReviewConfirmed}
                onCheckedChange={(checked) => setTalentReviewConfirmed(checked === true)}
              />
              <label htmlFor="talent-review-confirm" className="text-sm font-medium text-gray-700">
                I have reviewed the talent assignments and confirm they are ready for the next step
              </label>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Check this box to enable the Next button and proceed to technical setup.
            </p>
          </CardContent>
        </Card> */}

        {/* <div>
          <Button className='w-full' onClick={saveBatchAssignments} disabled={isLoading}>
            Save Step {currentStep} Data
          </Button>
        </div> */}
      </div>
    );
  };

  const renderContractGeneration = () => {
    return (
      <div className="space-y-6">
        {/* Contract Configuration */}
        {/* Enhanced Contract Configuration with Category-Based Pricing */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-2 md:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Contract Configuration
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Configure contract terms, set category-based pricing, and
                  customize individual talent terms
                </p>
              </div>
              <div>
                <Button
                  className="w-full"
                  onClick={saveContracts}
                  disabled={isLoading}
                >
                  Save Contract Data
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Counter-Offer Deadline */}
            <div>
              <label className="text-sm font-medium">
                Counter-Offer Deadline
              </label>
              <input
                type="datetime-local"
                value={contractConfig.counterOfferDeadline}
                onChange={(e) =>
                  setContractConfig((prev) => ({
                    ...prev,
                    counterOfferDeadline: e.target.value,
                  }))
                }
                className="w-full mt-1 p-2 border rounded"
              />
            </div>

            {/* Category-Based Pricing */}
            <div>
              <h4 className="text-lg font-medium mb-3 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-600 rounded"></div>
                Category-Based Pricing
              </h4>
              <p className="text-sm text-muted-foreground mb-4">
                Set default asking prices for each talent category. Unassigned
                categories are readonly and set to zero.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(categoryPricing).map(([category, price]) => (
                  <div
                    key={category}
                    className={`p-3 rounded-lg border ${getAssignedCategories().has(category)
                      ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200"
                      : "bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200"
                      }`}
                  >
                    <label
                      className={`text-sm font-medium flex items-center gap-2 ${getAssignedCategories().has(category)
                        ? "text-green-800"
                        : "text-gray-600"
                        }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${getAssignedCategories().has(category)
                          ? "bg-green-500"
                          : "bg-gray-400"
                          }`}
                      ></div>
                      {category}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={price}
                      onChange={(e) => {
                        setCategoryPricing((prev) => ({
                          ...prev,
                          [category]: e.target.value,
                        }));
                      }}
                      className={`w-full mt-2 p-2 border rounded ${!getAssignedCategories().has(category)
                        ? "bg-gray-100 text-gray-500"
                        : "bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        }`}
                      placeholder={
                        getAssignedCategories().has(category)
                          ? `Enter ${category.toLowerCase()} rate`
                          : "No talent assigned"
                      }
                      readOnly={!getAssignedCategories().has(category)}
                    />
                    {!getAssignedCategories().has(category) ? (
                      <p className="text-xs text-gray-500 mt-1">
                        No talent assigned
                      </p>
                    ) : (
                      <p className="text-xs text-green-600 mt-1">
                        Active category
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Individual Talent Overrides */}
            <div>
              <h4 className="text-lg font-medium mb-3">
                Individual Talent Pricing
              </h4>
              <p className="text-sm text-muted-foreground mb-4">
                Override category pricing and set individual terms for specific
                talent
              </p>
              <div className="space-y-4">
                {assignedTalent.map((talent) => (
                  <Card key={talent.id} className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={talent.avatarUrl} />
                        <AvatarFallback>
                          {talent.name
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {talent.assignmentName || talent.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {talent.isMainBookedTalent
                            ? "Main Booked Talent"
                            : talent.type}{" "}
                          - {talent.role}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">
                          Individual Price ($)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={
                            individualPricing[talent.id]?.price ||
                            parseFloat(
                              categoryPricing[
                              talent.type as keyof typeof categoryPricing
                              ] as string
                            ) ||
                            ""
                          }
                          onChange={(e) => {
                            const value = Math.max(
                              0,
                              parseFloat(e.target.value) || 0
                            );
                            setIndividualPricing((prev) => ({
                              ...prev,
                              [talent.id]: {
                                ...prev[talent.id],
                                price: value,
                                counterOfferDeadline:
                                  prev[talent.id]?.counterOfferDeadline || "",
                                paymentTerms:
                                  prev[talent.id]?.paymentTerms ||
                                  "50% deposit, 50% on completion",
                                cancellationPolicy:
                                  prev[talent.id]?.cancellationPolicy ||
                                  "72 hours notice required",
                                additionalTerms:
                                  prev[talent.id]?.additionalTerms || "",
                              },
                            }));
                          }}
                          className="w-full mt-1 p-2 border rounded"
                          placeholder="Individual rate"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">
                          Counter-Offer Deadline
                        </label>
                        <input
                          type="datetime-local"
                          value={
                            individualPricing[talent.id]
                              ?.counterOfferDeadline || ""
                          }
                          onChange={(e) =>
                            setIndividualPricing((prev) => ({
                              ...prev,
                              [talent.id]: {
                                ...prev[talent.id],
                                price:
                                  prev[talent.id]?.price ||
                                  parseFloat(
                                    categoryPricing[
                                    talent.type as keyof typeof categoryPricing
                                    ] as string
                                  ) ||
                                  0,
                                counterOfferDeadline: e.target.value,
                                paymentTerms:
                                  prev[talent.id]?.paymentTerms ||
                                  "50% deposit, 50% on completion",
                                cancellationPolicy:
                                  prev[talent.id]?.cancellationPolicy ||
                                  "72 hours notice required",
                                additionalTerms:
                                  prev[talent.id]?.additionalTerms || "",
                              },
                            }))
                          }
                          className="w-full mt-1 p-2 border rounded"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">
                          Payment Terms
                        </label>
                        <select
                          value={
                            individualPricing[talent.id]?.paymentTerms ||
                            "50% deposit, 50% on completion"
                          }
                          onChange={(e) =>
                            setIndividualPricing((prev) => ({
                              ...prev,
                              [talent.id]: {
                                ...prev[talent.id],
                                price:
                                  prev[talent.id]?.price ||
                                  parseFloat(
                                    categoryPricing[
                                    talent.type as keyof typeof categoryPricing
                                    ] as string
                                  ) ||
                                  0,
                                counterOfferDeadline:
                                  prev[talent.id]?.counterOfferDeadline || "",
                                paymentTerms: e.target.value,
                                cancellationPolicy:
                                  prev[talent.id]?.cancellationPolicy ||
                                  "72 hours notice required",
                                additionalTerms:
                                  prev[talent.id]?.additionalTerms || "",
                              },
                            }))
                          }
                          className="w-full mt-1 p-2 border rounded"
                        >
                          <option value="50% deposit, 50% on completion">
                            50% deposit, 50% on completion
                          </option>
                          <option value="100% upfront">100% upfront</option>
                          <option value="Payment on completion">
                            Payment on completion
                          </option>
                          <option value="Net 30 terms">Net 30 terms</option>
                          <option value="Payment within 7 days">
                            Payment within 7 days
                          </option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">
                          Cancellation Policy
                        </label>
                        <select
                          value={
                            individualPricing[talent.id]?.cancellationPolicy ||
                            "72 hours notice required"
                          }
                          onChange={(e) =>
                            setIndividualPricing((prev) => ({
                              ...prev,
                              [talent.id]: {
                                ...prev[talent.id],
                                price:
                                  prev[talent.id]?.price ||
                                  parseFloat(
                                    categoryPricing[
                                    talent.type as keyof typeof categoryPricing
                                    ] as string
                                  ) ||
                                  0,
                                counterOfferDeadline:
                                  prev[talent.id]?.counterOfferDeadline || "",
                                paymentTerms:
                                  prev[talent.id]?.paymentTerms ||
                                  "50% deposit, 50% on completion",
                                cancellationPolicy: e.target.value,
                                additionalTerms:
                                  prev[talent.id]?.additionalTerms || "",
                              },
                            }))
                          }
                          className="w-full mt-1 p-2 border rounded"
                        >
                          <option value="72 hours notice required">
                            72 hours notice required
                          </option>
                          <option value="7 days notice required">
                            7 days notice required
                          </option>
                          <option value="14 days notice required">
                            14 days notice required
                          </option>
                          <option value="30 days notice required">
                            30 days notice required
                          </option>
                          <option value="No cancellation allowed">
                            No cancellation allowed
                          </option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium">
                          Additional Terms for {talent.name}
                        </label>
                        <textarea
                          value={
                            individualPricing[talent.id]?.additionalTerms || ""
                          }
                          onChange={(e) =>
                            setIndividualPricing((prev) => ({
                              ...prev,
                              [talent.id]: {
                                ...prev[talent.id],
                                price:
                                  prev[talent.id]?.price ||
                                  parseFloat(
                                    categoryPricing[
                                    talent.type as keyof typeof categoryPricing
                                    ] as string
                                  ) ||
                                  0,
                                counterOfferDeadline:
                                  prev[talent.id]?.counterOfferDeadline || "",
                                paymentTerms:
                                  prev[talent.id]?.paymentTerms ||
                                  "50% deposit, 50% on completion",
                                cancellationPolicy:
                                  prev[talent.id]?.cancellationPolicy ||
                                  "72 hours notice required",
                                additionalTerms: e.target.value,
                              },
                            }))
                          }
                          rows={2}
                          className="w-full mt-1 p-2 border rounded"
                          placeholder="Special terms or requirements for this talent"
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Global Contract Terms */}
            <div>
              <h4 className="text-lg font-medium mb-3">
                Global Contract Terms
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">
                    Total Booking Price ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={
                      contractConfig.totalBookingPrice ||
                      calculateTotalBookingPrice()
                    }
                    onChange={(e) => {
                      const value = Math.max(
                        0,
                        parseFloat(e.target.value) || 0
                      );
                      setContractConfig((prev) => ({
                        ...prev,
                        totalBookingPrice: value,
                      }));
                    }}
                    className="w-full mt-1 p-2 border rounded font-semibold text-green-700 bg-green-50"
                    placeholder="Set final booking price"
                  />
                  {/* Enhanced Pricing Hint */}
                  <div className="mt-2 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <p className="text-sm font-medium text-blue-800">
                        Pricing Breakdown
                      </p>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-blue-700">
                          Talent asking total:
                        </span>
                        <span className="font-semibold text-blue-900">
                          ${calculateTotalBookingPrice()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">
                          Your offer/counter:
                        </span>
                        <span className="font-semibold text-green-700">
                          $
                          {contractConfig.totalBookingPrice ||
                            calculateTotalBookingPrice()}
                        </span>
                      </div>
                      {counterOffer.received && (
                        <div className="flex justify-between border-t pt-1">
                          <span className="text-orange-700">
                            Counter-offer received:
                          </span>
                          <span className="font-semibold text-orange-900">
                            ${counterOffer.amount}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between text-gray-600 pt-1 border-t">
                        <span>Talent assigned:</span>
                        <span className="font-semibold">
                          {assignedTalent.length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-cyan-50 p-4 rounded-lg border border-emerald-200">
                  <label className="text-sm font-medium text-emerald-800 flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    Wai'tuMusic Platform Name
                  </label>
                  <input
                    type="text"
                    value={contractConfig.waituMusicPlatformName}
                    onChange={(e) =>
                      setContractConfig((prev) => ({
                        ...prev,
                        waituMusicPlatformName: e.target.value,
                      }))
                    }
                    className="w-full mt-2 p-3 border border-emerald-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Platform name for contracts"
                  />
                  <p className="text-xs text-emerald-600 mt-1">
                    Used in all generated contracts
                  </p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                  <label className="text-sm font-medium text-purple-800 flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    Label Address
                  </label>
                  <textarea
                    value={contractConfig.labelAddress}
                    onChange={(e) =>
                      setContractConfig((prev) => ({
                        ...prev,
                        labelAddress: e.target.value,
                      }))
                    }
                    className="w-full mt-2 p-3 border border-purple-300 rounded-lg bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows={3}
                    placeholder="Complete address for inclusion in agreements"
                  />
                  <p className="text-xs text-purple-600 mt-1">
                    Complete business address
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-lg border border-amber-200">
                  <label className="text-sm font-medium text-amber-800 flex items-center gap-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    Payment Terms
                  </label>
                  <select
                    value={contractConfig.paymentTerms}
                    onChange={(e) =>
                      setContractConfig((prev) => ({
                        ...prev,
                        paymentTerms: e.target.value,
                      }))
                    }
                    className="w-full mt-2 p-3 border border-amber-300 rounded-lg bg-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    <option value="50% deposit, 50% on completion">
                      50% deposit, 50% on completion
                    </option>
                    <option value="100% upfront">100% upfront</option>
                    <option value="Payment on completion">
                      Payment on completion
                    </option>
                    <option value="Net 30 terms">Net 30 terms</option>
                  </select>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-pink-50 p-4 rounded-lg border border-red-200">
                  <label className="text-sm font-medium text-red-800 flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    Cancellation Policy
                  </label>
                  <select
                    value={contractConfig.cancellationPolicy}
                    onChange={(e) =>
                      setContractConfig((prev) => ({
                        ...prev,
                        cancellationPolicy: e.target.value,
                      }))
                    }
                    className="w-full mt-2 p-3 border border-red-300 rounded-lg bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="72 hours notice required">
                      72 hours notice required
                    </option>
                    <option value="7 days notice required">
                      7 days notice required
                    </option>
                    <option value="14 days notice required">
                      14 days notice required
                    </option>
                    <option value="No cancellation allowed">
                      No cancellation allowed
                    </option>
                  </select>
                </div>
              </div>
              <div className="mt-6 bg-gradient-to-br from-slate-50 to-gray-50 p-4 rounded-lg border border-slate-200">
                <label className="text-sm font-medium text-slate-800 flex items-center gap-2">
                  <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                  Additional Terms
                </label>
                <textarea
                  value={contractConfig.additionalTerms}
                  onChange={(e) =>
                    setContractConfig((prev) => ({
                      ...prev,
                      additionalTerms: e.target.value,
                    }))
                  }
                  className="w-full mt-2 p-3 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  rows={4}
                  placeholder="Enter any additional contract terms or special requirements"
                />
                <p className="text-xs text-slate-600 mt-1">
                  Special clauses and custom requirements
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Counter-Offer Management */}
        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <AlertTriangle className="h-5 w-5" />
              Counter-Offer Management
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Handle price negotiations from assigned talent
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {!counterOffer.received ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground">
                  No counter-offers received yet
                </p>
                <Button
                  variant="outline"
                  className="mt-2"
                  onClick={() =>
                    setCounterOffer((prev) => ({ ...prev, received: true }))
                  }
                >
                  Simulate Counter-Offer
                </Button>
              </div>
            ) : (
              <div className="space-y-4 bg-orange-50 p-4 rounded">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">
                      Counter-Offer Amount ($)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={counterOffer.amount}
                      onChange={(e) => {
                        const value = Math.max(
                          0,
                          parseFloat(e.target.value) || 0
                        );
                        setCounterOffer((prev) => ({
                          ...prev,
                          amount: value,
                        }));
                      }}
                      className="w-full mt-1 p-2 border rounded"
                      placeholder="Proposed amount"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">
                      Response Deadline
                    </label>
                    <input
                      type="datetime-local"
                      value={counterOffer.deadline}
                      onChange={(e) =>
                        setCounterOffer((prev) => ({
                          ...prev,
                          deadline: e.target.value,
                        }))
                      }
                      className="w-full mt-1 p-2 border rounded"
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <Button
                      variant="default"
                      className="bg-green-600 hover:bg-green-700 w-full"
                      onClick={() => {
                        setContractConfig((prev) => ({
                          ...prev,
                          proposedPrice: counterOffer.amount,
                        }));
                        toast({
                          title: "Counter-Offer Approved",
                          description: "Contract price updated",
                        });
                      }}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={() => {
                        setCounterOffer({
                          received: false,
                          amount: 0,
                          deadline: "",
                          notes: "",
                        });
                        toast({
                          title: "Counter-Offer Declined",
                          description: "Original terms maintained",
                        });
                      }}
                    >
                      Decline
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Notes</label>
                  <textarea
                    value={counterOffer.notes}
                    onChange={(e) =>
                      setCounterOffer((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                    className="w-full mt-1 p-2 border rounded"
                    rows={2}
                    placeholder="Negotiation notes and reasoning"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contract Generation and Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Contract Generation & Preview
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Preview and Generate contracts before proceeding to signatures
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Button
                  className="w-full flex items-center gap-2"
                  onClick={() => generateContractPreview("booking")}
                  disabled={false}
                >
                  <FileText className="h-4 w-4" />
                  Preview Booking Agreement
                </Button>
                {contractPreview.bookingAgreement && (
                  <div className="p-3 bg-gray-50 rounded border max-h-[60vh] overflow-y-auto">
                    <h4 className="font-medium text-sm mb-2">
                      Booking Agreement Preview:
                    </h4>
                    <div className="text-xs text-gray-700 whitespace-pre-line">
                      {contractPreview.bookingAgreement}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2"
                      onClick={() => {
                        // Download full preview
                        const blob = new Blob(
                          [contractPreview.bookingAgreement!],
                          { type: "text/plain" }
                        );
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = "booking-agreement-preview.txt";
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Download Full Preview
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Button
                  className="w-full flex items-center gap-2"
                  onClick={() => generateContractPreview("performance")}
                  disabled={assignedTalent.length === 0}
                >
                  <FileText className="h-4 w-4" />
                  Preview Performance Contracts
                </Button>
                {contractPreview.performanceContract && (
                  <div className="p-3 bg-gray-50 rounded border max-h-[60vh] overflow-y-auto">
                    <h4 className="font-medium text-sm mb-2">
                      Performance Contract Preview:
                    </h4>
                    <div className="text-xs text-gray-700 whitespace-pre-line">
                      {contractPreview.performanceContract}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2"
                      onClick={() => {
                        // Download full preview
                        const blob = new Blob(
                          [contractPreview.performanceContract!],
                          { type: "text/plain" }
                        );
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = "performance-contract-preview.txt";
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Download Full Preview
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Contract Confirmation 
            <div className="mt-6 p-4 bg-blue-50 rounded border border-blue-200">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="contractConfirmation"
                  className="mt-1"
                  checked={stepConfirmations[currentStep] || false}
                  onChange={(e) => setStepConfirmations((prev: Record<number, boolean>) => ({
                    ...prev,
                    [currentStep]: e.target.checked
                  }))}
                />
                <label htmlFor="contractConfirmation" className="text-sm">
                  <span className="font-medium">I confirm that:</span>
                  <ul className="mt-1 space-y-1 text-muted-foreground">
                    <li>• Contract terms and pricing have been reviewed and approved</li>
                    <li>• Counter-offers (if any) have been properly handled</li>
                    <li>• All assigned talent and contract previews are accurate</li>
                    <li>• Ready to proceed to Technical Rider Creation</li>
                  </ul>
                </label>
              </div>
            </div>*/}
          </CardContent>
        </Card>

        {/* <div>
          <Button
            className="w-full"
            onClick={saveContracts}
            disabled={isLoading}
          >
            Save Step {currentStep} Data
          </Button>
        </div> */}
      </div>
    );
  };

  const renderTechnicalRider = () => {
    return (
      <div className="space-y-6">
        {/* Enhanced Mixer Patch System */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="h-5 w-5" />
              Enhanced Technical Rider System
            </CardTitle>
            <CardDescription>
              Professional technical requirements management with stage plot,
              mixer configuration, and setlist integration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EnhancedTechnicalRider
              bookingId={bookingId}
              assignedTalents={assignedTalent}
              eventDetails={{
                eventName: booking?.eventName || "",
                venueName: booking?.venueName || "",
                eventDate: booking?.eventDate || "",
                eventType: booking?.eventType || "",
                duration: 60,
              }}
              canEdit={canEdit}
              userRole={userRole}
              onSave={async (data) => saveTechnicalRider(data)}
              onLoad={async () => technicalRider ?? null}
            />
          </CardContent>
        </Card>

        <div>
          <Button
            className="w-full"
            onClick={saveTechnicalRider}
            disabled={isLoading}
          >
            Save Step {currentStep} Data
          </Button>
        </div>
      </div>
    );
  };

  const renderStagePlot = () => {
    return (
      <div className="space-y-6">
        {/* Enhanced Mixer Patch System */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="h-5 w-5" />
              Stage Plot & Mixer Patch System
            </CardTitle>
            <CardDescription>
              Automatically generate mixer input patch list from assigned talent
              with proper instrument ordering
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EnhancedMixerPatchSystem
              bookingId={bookingId}
              assignedTalent={assignedTalent.map((talent: any) => ({
                id: talent.id || talent.userId?.toString(),
                userId: talent.userId,
                name: talent.name || talent.fullName,
                stageName: talent.stageName || talent.name || talent.fullName,
                primaryTalent:
                  talent.primaryTalent || talent.role || "Lead Vocalist",
                secondaryTalents: talent.secondaryTalents || [],
                assignedTo: talent.assignedTo || talent.name || talent.fullName,
                isMainBookedTalent:
                  talent.isPrimary || talent.isMainBookedTalent || false,
              }))}
              canEdit={canEdit}
              onSave={async (patchData: any) => {
                try {
                  await apiRequest(
                    `/api/bookings/${bookingId}/mixer-patch-list`,
                    {
                      method: "POST",
                      body: JSON.stringify(patchData),
                    }
                  );
                  toast({
                    title: "Mixer Patch List Saved",
                    description:
                      "Stage plot assignments converted to mixer channels successfully",
                  });
                } catch (error) {
                  toast({
                    title: "Save Failed",
                    description: "Could not save mixer patch list",
                    variant: "destructive",
                  });
                }
              }}
            />
          </CardContent>
        </Card>

        <div>
          <Button
            className="w-full"
            onClick={saveStagePlot}
            disabled={isLoading}
          >
            Save Step {currentStep} Data
          </Button>
        </div>
      </div>
    );
  };

  // Render Signature Collection step

  const renderSignatureCollection = () => {

    const groupedSignatures = booking?.signatures.reduce((acc, sig) => {
      if (!acc[sig.contractId]) acc[sig.contractId] = [];
      acc[sig.contractId].push(sig);
      return acc;
    }, {} as Record<number, any[]>);

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-2 md:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <PenTool className="h-5 w-5" />
                  Signature Collection
                </CardTitle>
                <CardDescription>
                  Collect digital signatures from all parties on contracts and agreements
                </CardDescription>
              </div>

              <div>
                <Button className="w-full" onClick={saveSignatures} disabled={isLoading}>
                  Save Step {currentStep} Data
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {Object.entries(groupedSignatures).map(([contractId, signatures]) => {
              const contractType = signatures[0]?.contractType || "Unknown";

              return (
                <div key={contractId} className="mb-6">
                  <h3 className="text-lg font-semibold mb-3 capitalize">
                    {contractType.replace("_", " ")} Signatures
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {signatures?.map((sig: any) => (
                      <Card key={sig.signatureId} className="border border-gray-200">
                        <CardHeader>
                          <CardTitle className="capitalize">{sig.signerType} Signature</CardTitle>
                          <CardDescription>
                            {sig.signerName} ({sig.signerEmail})
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex justify-between items-center">
                            <span>
                              <strong>Status:</strong> {sig.status}
                            </span>

                            {sig.status === "pending" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleSign(sig.contractId, sig.signerUserId)
                                }
                              >
                                Sign
                              </Button>
                            )}

                            {sig.status === "signed" && (
                              <span className="text-green-600 font-semibold">✅ Signed</span>
                            )}
                          </div>

                          {/* Signature pad modal */}
                          {activeSignature === sig.signerUserId && (
                            <div className="mt-4 p-4 border rounded bg-gray-50">
                              <SignatureCanvas
                                ref={sigCanvas}
                                penColor="black"
                                canvasProps={{ className: "border w-full h-40" }}
                              />
                              <div className="flex gap-2 mt-2">
                                <Button size="sm" onClick={() => saveSignature(sig.contractId, sig.signerUserId)}>
                                  Save
                                </Button>
                                <Button size="sm" variant="outline" onClick={clearSignature}>
                                  Clear
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => setActiveSignature(null)}>
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    );
  };




  // Render Payment Processing step
  const renderPaymentProcessing = () => {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Processing
            </CardTitle>
            <CardDescription>
              Process payments and generate receipts for the booking
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <CreditCard className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">
                Payment processing functionality will be implemented here
              </p>
              <Button variant="outline" className="mt-4">
                Process Payment
              </Button>
            </div>
          </CardContent>
        </Card>

        <div>
          <Button
            className="w-full"
            onClick={savePayments}
            disabled={isLoading}
          >
            Save Step {currentStep} Data
          </Button>
        </div>
      </div>
    );
  };

  // Main component render
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Progress Header */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">
                Comprehensive Booking Workflow
              </CardTitle>
              <CardDescription>
                Manage the complete booking process from assignment to
                completion
              </CardDescription>
            </div>
            <Badge variant="outline" className="px-3 py-1">
              Step {currentStep} of {workflowSteps.length}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Progress Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {workflowSteps.map((step, index) => (
          <Card
            key={step.id}
            className={`cursor-pointer transition-all ${step.isActive ? "ring-2 ring-primary shadow-lg" : ""
              } ${step.status === "completed" ? "bg-green-50 border-green-200" : ""
              }`}
            onClick={() => setCurrentStep(index + 1)}
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${step.status === "completed"
                    ? "bg-green-500 text-white"
                    : step.isActive
                      ? "bg-primary text-white"
                      : "bg-gray-200"
                    }`}
                >
                  {step.status === "completed" ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    step.icon
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-sm">{step.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Step Content */}
      <div className="space-y-6">
        {currentStep === 1 && renderTalentAssignment()}
        {currentStep === 2 && renderContractGeneration()}
        {currentStep === 3 && renderTechnicalRider()}
        {currentStep === 4 && renderStagePlot()}
        {currentStep === 5 && renderSignatureCollection()}
        {currentStep === 6 && renderPaymentProcessing()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-6 border-t">
        <Button
          variant="outline"
          onClick={goToPreviousStep}
          disabled={currentStep === 1}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        <div className="flex space-x-2">
          <Button variant="outline" onClick={saveWorkflow} disabled={saving}>
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {saving ? "Saving..." : "Save Progress"}
          </Button>
        </div>

        <Button
          onClick={goToNextStep}
          disabled={!workflowSteps[currentStep - 1]?.canProgress}
        >
          Next
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
