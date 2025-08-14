import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link, useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Building, 
  Users, 
  Globe,
  Phone,
  Mail,
  Send,
  Clock
} from "lucide-react";
import { formatDistanceToNow } from 'date-fns';

// Application form schema
const applicationSchema = z.object({
  coverLetter: z.string().min(100, 'Cover letter must be at least 100 characters').max(2000, 'Cover letter must be under 2000 characters'),
  portfolioLinks: z.string().optional(),
  experience: z.string().min(50, 'Experience description must be at least 50 characters').max(1000, 'Experience must be under 1000 characters'),
  availability: z.string().min(10, 'Availability must be at least 10 characters').max(500, 'Availability must be under 500 characters'),
  additionalNotes: z.string().optional()
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

export default function OpportunityDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  // Fetch opportunity details
  const { data: opportunity, isLoading } = useQuery({
    queryKey: [`/api/marketplace/opportunities/${id}`],
    queryFn: async () => {
      const response = await fetch(`/api/marketplace/opportunities/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Opportunity not found');
        }
        throw new Error('Failed to fetch opportunity');
      }
      return response.json();
    },
    enabled: !!id
  });

  // Check if user has already applied
  const { data: myApplications } = useQuery({
    queryKey: ['/api/marketplace/my-applications'],
    queryFn: async () => {
      const response = await fetch('/api/marketplace/my-applications', {
        credentials: 'include'
      });
      if (!response.ok) return [];
      return response.json();
    }
  });

  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      coverLetter: '',
      portfolioLinks: '',
      experience: '',
      availability: '',
      additionalNotes: ''
    }
  });

  const submitApplication = useMutation({
    mutationFn: async (data: ApplicationFormData) => {
      const portfolioLinks = data.portfolioLinks 
        ? data.portfolioLinks.split(',').map(link => link.trim()).filter(link => link)
        : [];

      const response = await fetch('/api/marketplace/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          opportunityId: parseInt(id!),
          ...data,
          portfolioLinks
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit application');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Application Submitted!",
        description: "Your application has been sent to the organization.",
      });
      setShowApplicationForm(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/marketplace/my-applications'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: ApplicationFormData) => {
    submitApplication.mutate(data);
  };

  const getCompensationBadge = (type: string, amount?: string) => {
    const colors = {
      paid: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      unpaid: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
      revenue_share: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      experience: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
    };

    const labels = {
      paid: amount ? `$${amount}` : 'Paid',
      unpaid: 'Unpaid',
      revenue_share: 'Revenue Share',
      experience: 'Experience'
    };

    return (
      <Badge className={colors[type as keyof typeof colors]}>
        {labels[type as keyof typeof labels]}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-12 bg-gray-200 rounded w-3/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl text-center">
        <h1 className="text-2xl font-bold mb-4">Opportunity Not Found</h1>
        <p className="text-gray-600 mb-6">The opportunity you're looking for doesn't exist or has been removed.</p>
        <Button asChild>
          <Link href="/opphub">Back to Marketplace</Link>
        </Button>
      </div>
    );
  }

  const hasApplied = myApplications?.some((app: any) => app.opportunityTitle === opportunity.title);
  const isExpired = new Date(opportunity.deadline) < new Date();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/opphub">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Marketplace
          </Link>
        </Button>

        <div className="space-y-4">
          <h1 className="text-3xl font-bold">{opportunity.title}</h1>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Building className="h-4 w-4" />
              {opportunity.organizationName}
            </div>
            
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {opportunity.location}
              {opportunity.isRemote && (
                <Badge variant="secondary" className="ml-2">Remote</Badge>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Posted {formatDistanceToNow(new Date(opportunity.createdAt), { addSuffix: true })}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className={`font-medium ${isExpired ? 'text-red-600' : 'text-green-600'}`}>
                Deadline: {new Date(opportunity.deadline).toLocaleDateString()}
                {isExpired && ' (Expired)'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-gray-400" />
              {getCompensationBadge(opportunity.compensationType, opportunity.amount)}
            </div>
            
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-400" />
              <span>{opportunity.applicationCount || 0} applications</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                {opportunity.description}
              </p>
            </CardContent>
          </Card>

          {/* Requirements */}
          <Card>
            <CardHeader>
              <CardTitle>Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                {opportunity.requirements}
              </p>
            </CardContent>
          </Card>

          {/* Application Process */}
          <Card>
            <CardHeader>
              <CardTitle>How to Apply</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                {opportunity.applicationProcess}
              </p>
            </CardContent>
          </Card>

          {/* Application Form */}
          {showApplicationForm && !hasApplied && !isExpired && (
            <Card>
              <CardHeader>
                <CardTitle>Apply for this Opportunity</CardTitle>
                <CardDescription>
                  Fill out the form below to submit your application
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="coverLetter"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cover Letter *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Explain why you're interested and what makes you a good fit..."
                              className="min-h-[120px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="experience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Relevant Experience *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe your relevant experience and background..."
                              className="min-h-[100px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="portfolioLinks"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Portfolio Links (Optional)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Separate multiple links with commas"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="availability"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Availability *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="When are you available to start? Any scheduling constraints?"
                              className="min-h-[80px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="additionalNotes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Additional Notes (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Any additional information you'd like to share..."
                              className="min-h-[80px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end space-x-4">
                      <Button 
                        variant="outline" 
                        type="button" 
                        onClick={() => setShowApplicationForm(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={submitApplication.isPending}
                        className="min-w-[120px]"
                      >
                        {submitApplication.isPending ? (
                          'Submitting...'
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Submit Application
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Apply Now</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isExpired ? (
                <div className="text-center py-4">
                  <p className="text-red-600 font-medium mb-2">This opportunity has expired</p>
                  <p className="text-sm text-gray-500">Applications are no longer being accepted</p>
                </div>
              ) : hasApplied ? (
                <div className="text-center py-4">
                  <Badge className="mb-2">Applied</Badge>
                  <p className="text-sm text-gray-500">You have already applied to this opportunity</p>
                </div>
              ) : (
                <Button 
                  className="w-full" 
                  onClick={() => setShowApplicationForm(true)}
                  disabled={showApplicationForm}
                >
                  {showApplicationForm ? 'Form Open Below' : 'Apply Now'}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-gray-400" />
                <a 
                  href={`mailto:${opportunity.contactEmail}`}
                  className="text-blue-600 hover:underline"
                >
                  {opportunity.contactEmail}
                </a>
              </div>
              
              {opportunity.contactPhone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <a 
                    href={`tel:${opportunity.contactPhone}`}
                    className="text-blue-600 hover:underline"
                  >
                    {opportunity.contactPhone}
                  </a>
                </div>
              )}
              
              {opportunity.website && (
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4 text-gray-400" />
                  <a 
                    href={opportunity.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Visit Website
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Opportunity Details */}
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <span className="font-medium">Posted:</span>
                <br />
                {formatDistanceToNow(new Date(opportunity.createdAt), { addSuffix: true })}
              </div>
              
              <div>
                <span className="font-medium">Deadline:</span>
                <br />
                {new Date(opportunity.deadline).toLocaleDateString()}
              </div>
              
              <div>
                <span className="font-medium">Location:</span>
                <br />
                {opportunity.location}
                {opportunity.isRemote && ' (Remote possible)'}
              </div>
              
              <div>
                <span className="font-medium">Compensation:</span>
                <br />
                {getCompensationBadge(opportunity.compensationType, opportunity.amount)}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}