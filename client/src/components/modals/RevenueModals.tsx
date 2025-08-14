import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2, Plus, Target, TrendingUp, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

// Revenue Stream Creation Modal Schema
const createStreamSchema = z.object({
  streamName: z.string().min(1, 'Stream name is required'),
  streamType: z.enum([
    'booking',
    'streaming', 
    'merchandise',
    'sync_licensing',
    'brand_partnership',
    'performance_royalties',
    'mechanical_royalties',
    'publishing'
  ]),
  amount: z.string().min(1, 'Amount is required'),
  currency: z.string().default('USD'),
  dateReceived: z.date(),
  description: z.string().optional(),
  metadata: z.object({
    platform: z.string().optional(),
    trackName: z.string().optional(),
    clientName: z.string().optional(),
  }).optional(),
});

// Revenue Goal Creation Modal Schema
const createGoalSchema = z.object({
  goalType: z.enum(['monthly', 'quarterly', 'annual', 'milestone']),
  targetAmount: z.string().min(1, 'Target amount is required'),
  timeframe: z.enum(['1month', '3months', '6months', '12months', '24months']),
  targetDate: z.date(),
  description: z.string().min(1, 'Description is required'),
  currency: z.string().default('USD'),
});

// Forecast Generation Modal Schema
const generateForecastSchema = z.object({
  forecastType: z.enum(['monthly', 'quarterly', 'annual']),
  method: z.enum(['ai_analysis', 'historical_trend', 'market_based']),
  timeframePeriods: z.number().min(1).max(12),
  includeStreams: z.array(z.string()).optional(),
});

type CreateStreamFormData = z.infer<typeof createStreamSchema>;
type CreateGoalFormData = z.infer<typeof createGoalSchema>;
type GenerateForecastFormData = z.infer<typeof generateForecastSchema>;

interface RevenueStreamModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: number;
}

interface RevenueGoalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: number;
}

interface ForecastModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: number;
}

// Revenue Stream Creation Modal
export function CreateRevenueStreamModal({ open, onOpenChange, userId }: RevenueStreamModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<CreateStreamFormData>({
    resolver: zodResolver(createStreamSchema),
    defaultValues: {
      streamName: '',
      streamType: 'booking',
      amount: '',
      currency: 'USD',
      dateReceived: new Date(),
      description: '',
      metadata: {},
    },
  });

  const createStreamMutation = useMutation({
    mutationFn: (data: CreateStreamFormData) =>
      apiRequest('/api/revenue/streams', {
        method: 'POST',
        body: JSON.stringify({
          ...data,
          artistUserId: userId,
          amount: parseFloat(data.amount),
          usdEquivalent: parseFloat(data.amount), // Assuming USD for now
          status: 'confirmed',
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/revenue/streams'] });
      toast({
        title: "Revenue Stream Created",
        description: "Your new revenue stream has been added successfully.",
      });
      form.reset();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create revenue stream.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateStreamFormData) => {
    createStreamMutation.mutate(data);
  };

  const streamTypeOptions = [
    { value: 'booking', label: 'Live Performance Booking', icon: '🎤' },
    { value: 'streaming', label: 'Streaming Royalties', icon: '🎵' },
    { value: 'merchandise', label: 'Merchandise Sales', icon: '👕' },
    { value: 'sync_licensing', label: 'Sync Licensing', icon: '🎬' },
    { value: 'brand_partnership', label: 'Brand Partnership', icon: '🤝' },
    { value: 'performance_royalties', label: 'Performance Royalties', icon: '💰' },
    { value: 'mechanical_royalties', label: 'Mechanical Royalties', icon: '⚙️' },
    { value: 'publishing', label: 'Publishing Income', icon: '📝' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create Revenue Stream
          </DialogTitle>
          <DialogDescription>
            Add a new source of income to track your revenue streams and optimize earnings.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="streamName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stream Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Summer Festival Booking" {...field} />
                  </FormControl>
                  <FormDescription>
                    A descriptive name for this revenue stream
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="streamType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Revenue Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select revenue type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {streamTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <span>{option.icon}</span>
                            <span>{option.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        placeholder="0.00" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                        <SelectItem value="XCD">XCD (EC$)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="dateReceived"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date Received</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Additional details about this revenue stream..."
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createStreamMutation.isPending}>
                {createStreamMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Stream
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Revenue Goal Creation Modal
export function CreateRevenueGoalModal({ open, onOpenChange, userId }: RevenueGoalModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<CreateGoalFormData>({
    resolver: zodResolver(createGoalSchema),
    defaultValues: {
      goalType: 'monthly',
      targetAmount: '',
      timeframe: '3months',
      targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 3 months from now
      description: '',
      currency: 'USD',
    },
  });

  const createGoalMutation = useMutation({
    mutationFn: (data: CreateGoalFormData) =>
      apiRequest('/api/revenue/goals', {
        method: 'POST',
        body: JSON.stringify({
          ...data,
          artistUserId: userId,
          targetAmount: parseFloat(data.targetAmount),
          progress: 0,
          isActive: true,
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/revenue/goals'] });
      toast({
        title: "Revenue Goal Created",
        description: "Your new revenue goal has been set successfully.",
      });
      form.reset();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create revenue goal.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateGoalFormData) => {
    createGoalMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Create Revenue Goal
          </DialogTitle>
          <DialogDescription>
            Set a specific revenue target to track your progress and stay motivated.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Goal Description</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Q1 Booking Revenue Target" {...field} />
                  </FormControl>
                  <FormDescription>
                    A clear description of what you want to achieve
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="goalType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Goal Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly Goal</SelectItem>
                        <SelectItem value="quarterly">Quarterly Goal</SelectItem>
                        <SelectItem value="annual">Annual Goal</SelectItem>
                        <SelectItem value="milestone">Milestone Goal</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timeframe"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Timeframe</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1month">1 Month</SelectItem>
                        <SelectItem value="3months">3 Months</SelectItem>
                        <SelectItem value="6months">6 Months</SelectItem>
                        <SelectItem value="12months">12 Months</SelectItem>
                        <SelectItem value="24months">24 Months</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="targetAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Amount</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        placeholder="0.00" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                        <SelectItem value="XCD">XCD (EC$)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="targetDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Target Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a target date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createGoalMutation.isPending}>
                {createGoalMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Goal
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Enhanced Forecast Generation Modal
export function GenerateForecastModal({ open, onOpenChange, userId }: ForecastModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<GenerateForecastFormData>({
    resolver: zodResolver(generateForecastSchema),
    defaultValues: {
      forecastType: 'quarterly',
      method: 'ai_analysis',
      timeframePeriods: 4,
      includeStreams: [],
    },
  });

  const generateForecastMutation = useMutation({
    mutationFn: (data: GenerateForecastFormData) =>
      apiRequest('/api/revenue/forecasts', {
        method: 'POST',
        body: JSON.stringify({
          userId,
          forecastType: data.forecastType,
          method: data.method,
          periods: data.timeframePeriods,
          streams: data.includeStreams,
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/revenue/forecasts'] });
      toast({
        title: "Forecast Generated",
        description: "Advanced revenue forecast has been generated successfully.",
      });
      form.reset();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate revenue forecast.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: GenerateForecastFormData) => {
    generateForecastMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Generate Revenue Forecast
          </DialogTitle>
          <DialogDescription>
            Create advanced revenue predictions based on your historical data and market trends.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="forecastType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Forecast Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly Forecast</SelectItem>
                        <SelectItem value="quarterly">Quarterly Forecast</SelectItem>
                        <SelectItem value="annual">Annual Forecast</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timeframePeriods"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Periods Ahead</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1" 
                        max="12" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      How many periods to forecast
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Forecasting Method</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="advanced_analysis">Advanced Analysis (Recommended)</SelectItem>
                      <SelectItem value="historical_trend">Historical Trend</SelectItem>
                      <SelectItem value="market_based">Market-Based Prediction</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Advanced Analysis provides the most accurate predictions using market data
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Forecast Features</span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Revenue breakdown by stream type</li>
                <li>• Confidence levels and reliability scores</li>
                <li>• Market trend integration</li>
                <li>• Seasonal pattern analysis</li>
              </ul>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={generateForecastMutation.isPending}>
                {generateForecastMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Generate Forecast
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}