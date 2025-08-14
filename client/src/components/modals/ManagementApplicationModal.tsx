import { useState } from "react";
import { useModalManager } from '@/hooks/useModalManager';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, AlertCircle, Clock, Star } from "lucide-react";

const managementApplicationSchema = z.object({
  requestedRoleType: z.enum(['managed_artist', 'managed_musician', 'managed_professional', 'artist', 'musician', 'professional'], {
    required_error: "Please select a role type"
  }),
  requestedManagementTierId: z.number().optional(),
  applicationReason: z.string().min(50, "Please provide at least 50 characters explaining why you want this role"),
  businessPlan: z.string().optional(),
  expectedRevenue: z.string().optional(),
  portfolioLinks: z.string().optional(),
  socialMediaMetrics: z.string().optional(),
});

type ManagementApplicationForm = z.infer<typeof managementApplicationSchema>;

interface ManagementApplicationModalProps {
  children: React.ReactNode;
  onSuccess?: () => void;
}

interface ManagementTier {
  id: number;
  name: string;
  description: string;
}

export default function ManagementApplicationModal({ children, onSuccess }: ManagementApplicationModalProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<ManagementApplicationForm>({
    resolver: zodResolver(managementApplicationSchema),
    defaultValues: {
      applicationReason: "",
      businessPlan: "",
      expectedRevenue: "",
      portfolioLinks: "",
      socialMediaMetrics: "",
    },
  });

  const roleOptions = [
    { value: 'managed_artist', label: 'Managed Artist', description: 'Professional artist with management support' },
    { value: 'managed_musician', label: 'Managed Musician', description: 'Session musician with management benefits' },
    { value: 'managed_professional', label: 'Managed Professional', description: 'Professional service provider with management' },
    { value: 'artist', label: 'Artist', description: 'Independent artist' },
    { value: 'musician', label: 'Musician', description: 'Independent session musician' },
    { value: 'professional', label: 'Professional', description: 'Independent service professional' },
  ];

  const tierOptions = {
    artist: [
      { id: 1, name: "Publisher", description: "Up to 10% discounts, publishing only" },
      { id: 2, name: "Representation", description: "Up to 50% discounts, business handling" },
      { id: 3, name: "Full Management", description: "Up to 100% discounts, complete career responsibility" }
    ],
    musician: [
      { id: 1, name: "Publisher", description: "Up to 10% discounts, publishing only" },
      { id: 2, name: "Representation", description: "Up to 50% discounts, business handling" },
      { id: 3, name: "Full Management", description: "Up to 100% discounts, complete career responsibility" }
    ],
    professional: [
      { id: 2, name: "Representation", description: "Up to 50% discounts, business handling" },
      { id: 3, name: "Full Management", description: "Up to 100% discounts, complete career responsibility" }
    ]
  };

  const watchedRoleType = form.watch("requestedRoleType");
  const isManaged = watchedRoleType?.startsWith("managed_");
  const baseRoleType = isManaged ? watchedRoleType.replace("managed_", "") as keyof typeof tierOptions : null;

  const onSubmit = async (data: ManagementApplicationForm) => {
    setIsSubmitting(true);
    try {
      await apiRequest("/api/management-applications", {
        method: "POST",
        body: JSON.stringify(data),
      });

      toast({
        title: "Application submitted successfully",
        description: "Your management application has been submitted for review.",
      });

      form.reset();
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error submitting application:", error);
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isSubmitting) {
      setOpen(newOpen);
      if (!newOpen) {
        form.reset();
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Apply for Role Change
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Change your role or apply for managed status with exclusive benefits and professional support.
          </p>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Role Type Selection */}
            <FormField
              control={form.control}
              name="requestedRoleType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold">Select Role Type</FormLabel>
                  <Select onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose the role you want to apply for" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {roleOptions.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          <div className="flex flex-col">
                            <span className="font-medium">{role.label}</span>
                            <span className="text-xs text-muted-foreground">{role.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Management Tier Selection - Only for managed roles */}
            {isManaged && baseRoleType && (
              <FormField
                control={form.control}
                name="requestedManagementTierId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold">Select Management Tier</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose your preferred management tier" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {tierOptions[baseRoleType]?.map((tier) => (
                          <SelectItem key={tier.id} value={tier.id.toString()}>
                            <div className="flex flex-col">
                              <span className="font-medium">{tier.name}</span>
                              <span className="text-xs text-muted-foreground">{tier.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <Separator />

            {/* Application Reason */}
            <FormField
              control={form.control}
              name="applicationReason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold">Application Reason</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us why you want this role and how it fits your goals..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Business Plan */}
            <FormField
              control={form.control}
              name="businessPlan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Plan & Career Strategy (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your business plan and career strategy..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Expected Revenue */}
            <FormField
              control={form.control}
              name="expectedRevenue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expected Annual Revenue (USD) (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g., 50000"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Portfolio Links */}
            <FormField
              control={form.control}
              name="portfolioLinks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Portfolio/Website Links (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Share links to your portfolio, website, or relevant work..."
                      className="min-h-[60px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Social Media Metrics */}
            <FormField
              control={form.control}
              name="socialMediaMetrics"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Social Media Metrics (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Share your social media following and engagement metrics..."
                      className="min-h-[60px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Application Process Info */}
            <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-950/20">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-blue-500" />
                <h3 className="font-semibold text-blue-700 dark:text-blue-300">Application Process</h3>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-sm text-blue-600 dark:text-blue-400">
                <li>Submit your application with all required information</li>
                <li>Our team will review your application (typically 3-5 business days)</li>
                <li>If approved, you'll receive a management contract for signing</li>
                <li>Welcome to the WaituMusic family!</li>
              </ol>
            </div>

            <div className="flex justify-end gap-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}