import { useState, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface ApprovalItem {
  id: number;
  title: string;
  type: string;
  submittedBy: string;
  submittedAt: string;
}

interface ApprovalItemProps {
  item: ApprovalItem;
  isSelected: boolean;
  onToggle: (id: number) => void;
}

function ApprovalItemComponent({ item, isSelected, onToggle }: ApprovalItemProps) {
  return (
    <div className="flex items-center space-x-3 p-3 border rounded">
      <Checkbox 
        checked={isSelected}
        onCheckedChange={() => onToggle(item.id)}
      />
      <div className="flex-1">
        <h4 className="font-medium">{item.title}</h4>
        <p className="text-sm text-muted-foreground">
          {item.type} by {item.submittedBy}
        </p>
      </div>
    </div>
  );
}

export function PendingApprovals() {
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: pendingItems = [], isLoading } = useQuery({
    queryKey: ['/api/admin/pending-approvals'],
    enabled: true
  });

  const approveMutation = useMutation({
    mutationFn: async (itemIds: number[]) => {
      return apiRequest('/api/admin/approve-batch', {
        method: 'POST',
        body: JSON.stringify({ itemIds })
      });
    },
    onSuccess: () => {
      toast({
        title: "Items Approved",
        description: `${selectedItems.size} items have been approved successfully.`
      });
      setSelectedItems(new Set());
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pending-approvals'] });
    }
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = pendingItems.map((item: ApprovalItem) => item.id);
      setSelectedItems(new Set(allIds));
    } else {
      setSelectedItems(new Set());
    }
  };

  const handleToggleItem = (id: number) => {
    const newSet = new Set(selectedItems);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedItems(newSet);
  };

  const handleApproveSelected = () => {
    if (selectedItems.size === 0) return;
    approveMutation.mutate(Array.from(selectedItems));
  };

  const allSelected = pendingItems.length > 0 && selectedItems.size === pendingItems.length;
  const someSelected = selectedItems.size > 0 && selectedItems.size < pendingItems.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Pending Approvals</h3>
          <div className="flex items-center gap-2">
            <Checkbox 
              checked={allSelected}
              indeterminate={someSelected}
              onCheckedChange={handleSelectAll}
              aria-label="Select all items"
            />
            <span className="text-sm text-muted-foreground">Select All</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {isLoading ? (
            <div className="text-center py-4">Loading...</div>
          ) : pendingItems.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No pending approvals
            </div>
          ) : (
            pendingItems.map((item: ApprovalItem) => (
              <ApprovalItemComponent
                key={item.id}
                item={item}
                isSelected={selectedItems.has(item.id)}
                onToggle={handleToggleItem}
              />
            ))
          )}
        </div>
        
        {selectedItems.size > 0 && (
          <div className="mt-4 flex justify-end">
            <Button 
              onClick={handleApproveSelected}
              disabled={approveMutation.isPending}
            >
              Approve {selectedItems.size} Item{selectedItems.size !== 1 ? 's' : ''}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}