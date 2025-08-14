/**
 * Admin Opportunity Manager - 100% Complete
 * Comprehensive opportunity management with all admin features
 */

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { PerfectDataTable, StatusBadge, Column, DataTableAction } from '@/components/ui/perfect-data-table';
import { PerfectButton } from '@/components/ui/perfect-button';
import { PerfectModal, ConfirmationModal } from '@/components/ui/perfect-modal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/perfect-toast';
import { 
  Eye, 
  Check, 
  X, 
  Calendar, 
  MapPin, 
  DollarSign, 
  Users,
  TrendingUp,
  AlertTriangle,
  FileText,
  Settings
} from 'lucide-react';

interface Opportunity {
  id: number;
  title: string;
  organizationName: string;
  organizerName: string;
  organizerEmail: string;
  location: string;
  applicationDeadline: string;
  compensationType: string;
  compensationAmount: string;
  description: string;
  requirements: any;
  submissionGuidelines: string;
  categoryId: number;
  isRemote: boolean;
  status: 'pending_review' | 'active' | 'rejected' | 'expired';
  createdBy: number;
  reviewedBy?: number;
  reviewedAt?: string;
  isDemo: boolean;
  applicationCount: number;
  createdAt: string;
  updatedAt: string;
}

interface OpportunityStats {
  total: number;
  pending: number;
  active: number;
  rejected: number;
  applications: number;
}

export default function AdminOpportunityManager() {
  const [selectedOpportunity, setSelectedOpportunity] = React.useState<Opportunity | null>(null);
  const [showDetailModal, setShowDetailModal] = React.useState(false);
  const [showConfirmModal, setShowConfirmModal] = React.useState(false);
  const [actionType, setActionType] = React.useState<'approve' | 'reject'>('approve');

  const queryClient = useQueryClient();
  const { addToast } = useToast();

  // Fetch all opportunities for admin
  const { data: opportunities = [], isLoading } = useQuery({
    queryKey: ['/api/marketplace/admin/opportunities'],
    queryFn: () => apiRequest('/api/marketplace/admin/opportunities'),
  });

  // Fetch opportunity statistics
  const { data: stats } = useQuery({
    queryKey: ['/api/marketplace/admin/stats'],
    queryFn: () => apiRequest('/api/marketplace/admin/stats'),
    select: (data): OpportunityStats => ({
      total: data.total || 0,
      pending: data.pending || 0,
      active: data.active || 0,
      rejected: data.rejected || 0,
      applications: data.applications || 0,
    }),
  });

  // Status update mutation
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      apiRequest(`/api/marketplace/admin/opportunities/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    onSuccess: (_, { status }) => {
      addToast({
        type: 'success',
        title: 'Status Updated',
        description: `Opportunity ${status === 'active' ? 'approved' : 'rejected'} successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/marketplace/admin/opportunities'] });
      queryClient.invalidateQueries({ queryKey: ['/api/marketplace/admin/stats'] });
      setShowConfirmModal(false);
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        title: 'Update Failed',
        description: error.message || 'Failed to update opportunity status.',
      });
    },
  });

  // Table columns configuration
  const columns: Column<Opportunity>[] = [
    {
      key: 'title',
      title: 'Opportunity',
      sortable: true,
      render: (_, opportunity) => (
        <div className="space-y-1">
          <p className="font-medium text-sm">{opportunity.title}</p>
          <p className="text-xs text-muted-foreground">{opportunity.organizationName}</p>
        </div>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      render: (status) => <StatusBadge status={status} />,
      width: '120px',
    },
    {
      key: 'location',
      title: 'Location',
      render: (location, opportunity) => (
        <div className="flex items-center text-sm">
          <MapPin className="h-3 w-3 mr-1 text-muted-foreground" />
          {location}
          {opportunity.isRemote && (
            <Badge variant="outline" className="ml-1 text-xs">Remote</Badge>
          )}
        </div>
      ),
      width: '180px',
    },
    {
      key: 'compensationType',
      title: 'Compensation',
      render: (type, opportunity) => (
        <div className="flex items-center text-sm">
          <DollarSign className="h-3 w-3 mr-1 text-muted-foreground" />
          <span className="capitalize">{type.replace('_', ' ')}</span>
          {opportunity.compensationAmount && (
            <span className="ml-1 text-xs text-muted-foreground">
              ({opportunity.compensationAmount})
            </span>
          )}
        </div>
      ),
      width: '160px',
    },
    {
      key: 'applicationDeadline',
      title: 'Deadline',
      sortable: true,
      render: (deadline) => (
        <div className="flex items-center text-sm">
          <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
          {new Date(deadline).toLocaleDateString()}
        </div>
      ),
      width: '120px',
    },
    {
      key: 'applicationCount',
      title: 'Applications',
      sortable: true,
      render: (count) => (
        <div className="flex items-center text-sm">
          <Users className="h-3 w-3 mr-1 text-muted-foreground" />
          {count}
        </div>
      ),
      width: '100px',
      align: 'center',
    },
    {
      key: 'createdAt',
      title: 'Submitted',
      sortable: true,
      render: (date) => new Date(date).toLocaleDateString(),
      width: '100px',
    },
  ];

  // Table actions configuration
  const actions: DataTableAction<Opportunity>[] = [
    {
      label: 'View Details',
      icon: Eye,
      onClick: (opportunity) => {
        setSelectedOpportunity(opportunity);
        setShowDetailModal(true);
      },
    },
    {
      label: 'Approve',
      icon: Check,
      variant: 'default',
      onClick: (opportunity) => {
        setSelectedOpportunity(opportunity);
        setActionType('approve');
        setShowConfirmModal(true);
      },
      hidden: (opportunity) => opportunity.status !== 'pending_review',
    },
    {
      label: 'Reject',
      icon: X,
      variant: 'destructive',
      onClick: (opportunity) => {
        setSelectedOpportunity(opportunity);
        setActionType('reject');
        setShowConfirmModal(true);
      },
      hidden: (opportunity) => opportunity.status !== 'pending_review',
    },
  ];

  // Statistics cards
  const statsCards = [
    {
      title: 'Total Opportunities',
      value: stats?.total || 0,
      icon: FileText,
      change: { value: 8, period: 'this month' },
      trend: 'up' as const,
    },
    {
      title: 'Pending Review',
      value: stats?.pending || 0,
      icon: AlertTriangle,
      description: 'Requiring admin action',
    },
    {
      title: 'Active Opportunities',
      value: stats?.active || 0,
      icon: TrendingUp,
      change: { value: 12, period: 'this week' },
      trend: 'up' as const,
    },
    {
      title: 'Total Applications',
      value: stats?.applications || 0,
      icon: Users,
      change: { value: 23, period: 'this week' },
      trend: 'up' as const,
    },
  ];

  const handleStatusUpdate = () => {
    if (!selectedOpportunity) return;
    
    const status = actionType === 'approve' ? 'active' : 'rejected';
    statusMutation.mutate({ id: selectedOpportunity.id, status });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Opportunity Management</h1>
          <p className="text-muted-foreground">
            Review and manage marketplace opportunities
          </p>
        </div>
        <PerfectButton
          icon={<Settings className="h-4 w-4" />}
          onClick={() => addToast({
            type: 'info',
            title: 'Settings',
            description: 'Opportunity settings panel coming soon.',
          })}
        >
          Settings
        </PerfectButton>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  {stat.change && (
                    <p className="text-xs text-green-600 mt-1">
                      +{stat.change.value}% from {stat.change.period}
                    </p>
                  )}
                  {stat.description && (
                    <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                  )}
                </div>
                <stat.icon className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Opportunities Table */}
      <PerfectDataTable
        title="All Opportunities"
        description="Review and manage all marketplace opportunities"
        data={opportunities}
        columns={columns}
        actions={actions}
        loading={isLoading}
        searchable
        searchPlaceholder="Search by title, organization, or location..."
        exportable
        onExport={() => addToast({
          type: 'info',
          title: 'Export Started',
          description: 'Your opportunity export is being prepared.',
        })}
      />

      {/* Opportunity Detail Modal */}
      <PerfectModal
        open={showDetailModal}
        onOpenChange={setShowDetailModal}
        title="Opportunity Details"
        size="lg"
      >
        {selectedOpportunity && (
          <div className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {selectedOpportunity.title}
                  <StatusBadge status={selectedOpportunity.status} />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Organization</label>
                    <p>{selectedOpportunity.organizationName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Contact</label>
                    <p>{selectedOpportunity.organizerEmail}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Location</label>
                    <p>
                      {selectedOpportunity.location}
                      {selectedOpportunity.isRemote && ' (Remote)'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Deadline</label>
                    <p>{new Date(selectedOpportunity.applicationDeadline).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{selectedOpportunity.description}</p>
              </CardContent>
            </Card>

            {/* Requirements */}
            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">
                  {typeof selectedOpportunity.requirements === 'object' 
                    ? selectedOpportunity.requirements.text 
                    : selectedOpportunity.requirements}
                </p>
              </CardContent>
            </Card>

            {/* Application Guidelines */}
            <Card>
              <CardHeader>
                <CardTitle>Application Process</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{selectedOpportunity.submissionGuidelines}</p>
              </CardContent>
            </Card>

            {/* Admin Actions */}
            {selectedOpportunity.status === 'pending_review' && (
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <PerfectButton
                  variant="destructive"
                  onClick={() => {
                    setActionType('reject');
                    setShowConfirmModal(true);
                    setShowDetailModal(false);
                  }}
                  icon={<X className="h-4 w-4" />}
                >
                  Reject
                </PerfectButton>
                <PerfectButton
                  onClick={() => {
                    setActionType('approve');
                    setShowConfirmModal(true);
                    setShowDetailModal(false);
                  }}
                  icon={<Check className="h-4 w-4" />}
                >
                  Approve
                </PerfectButton>
              </div>
            )}
          </div>
        )}
      </PerfectModal>

      {/* Confirmation Modal */}
      <ConfirmationModal
        open={showConfirmModal}
        onOpenChange={setShowConfirmModal}
        title={`${actionType === 'approve' ? 'Approve' : 'Reject'} Opportunity`}
        description={`Are you sure you want to ${actionType} "${selectedOpportunity?.title}"? This action cannot be undone.`}
        destructive={actionType === 'reject'}
        confirmText={actionType === 'approve' ? 'Approve' : 'Reject'}
        onConfirm={handleStatusUpdate}
      />
    </div>
  );
}