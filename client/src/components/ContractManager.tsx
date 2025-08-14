import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Calendar, DollarSign } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Contract {
  id: number;
  title?: string;
  type?: string;
  status: string;
  amount?: number;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
}

export default function ContractManager() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newContract, setNewContract] = useState({
    title: '',
    type: 'booking',
    terms: '',
    amount: 0,
    startDate: '',
    endDate: ''
  });

  const queryClient = useQueryClient();

  const { data: contracts, isLoading } = useQuery({
    queryKey: ['/api/contracts'],
    queryFn: () => apiRequest('/api/contracts')
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/contracts', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contracts'] });
      setIsCreateOpen(false);
      setNewContract({
        title: '',
        type: 'booking',
        terms: '',
        amount: 0,
        startDate: '',
        endDate: ''
      });
    }
  });

  const handleCreate = () => {
    if (!newContract.title || !newContract.type) return;
    createMutation.mutate(newContract);
  };

  if (isLoading) return <div>Loading contracts...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Contract Management</h2>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Contract
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Contract</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Contract Title</Label>
                <Input
                  id="title"
                  value={newContract.title}
                  onChange={(e) => setNewContract(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Performance Agreement, Recording Contract, etc."
                />
              </div>
              
              <div>
                <Label htmlFor="type">Contract Type</Label>
                <Select
                  value={newContract.type}
                  onValueChange={(value) => setNewContract(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="booking">Booking Agreement</SelectItem>
                    <SelectItem value="recording">Recording Contract</SelectItem>
                    <SelectItem value="management">Management Agreement</SelectItem>
                    <SelectItem value="publishing">Publishing Deal</SelectItem>
                    <SelectItem value="licensing">Licensing Agreement</SelectItem>
                    <SelectItem value="performance">Performance Contract</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="terms">Contract Terms</Label>
                <Textarea
                  id="terms"
                  value={newContract.terms}
                  onChange={(e) => setNewContract(prev => ({ ...prev, terms: e.target.value }))}
                  placeholder="Enter contract terms and conditions..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount">Contract Value ($)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={newContract.amount}
                    onChange={(e) => setNewContract(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div></div>
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={newContract.startDate}
                    onChange={(e) => setNewContract(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={newContract.endDate}
                    onChange={(e) => setNewContract(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>

              <Button onClick={handleCreate} disabled={createMutation.isPending} className="w-full">
                {createMutation.isPending ? 'Creating...' : 'Create Contract'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.isArray(contracts) && contracts.length > 0 ? (
          contracts.map((contract: Contract) => (
            <Card key={contract.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  {contract.title || `Contract #${contract.id}`}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant={contract.status === 'draft' ? 'secondary' : 'default'}>
                      {contract.status}
                    </Badge>
                    {contract.type && (
                      <Badge variant="outline">{contract.type}</Badge>
                    )}
                  </div>
                  
                  {contract.amount && (
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="w-4 h-4" />
                      ${contract.amount.toLocaleString()}
                    </div>
                  )}
                  
                  {(contract.startDate || contract.endDate) && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      {contract.startDate && new Date(contract.startDate).toLocaleDateString()}
                      {contract.startDate && contract.endDate && ' - '}
                      {contract.endDate && new Date(contract.endDate).toLocaleDateString()}
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-500">
                    Created: {new Date(contract.createdAt).toLocaleDateString()}
                  </p>
                  
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      View
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      Edit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">No contracts found. Create your first contract!</p>
          </div>
        )}
      </div>
    </div>
  );
}