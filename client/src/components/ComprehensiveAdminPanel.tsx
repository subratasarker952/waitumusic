import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Users, Upload, Download, Database, RefreshCw, 
  DollarSign, Settings, UserPlus, Save 
} from 'lucide-react';

export function ComprehensiveAdminPanel() {
  const [isLoading, setIsLoading] = useState(false);
  const [platformFeeRate, setPlatformFeeRate] = useState('15');
  const [processingFeeRate, setProcessingFeeRate] = useState('2.9');
  const { toast } = useToast();

  const handleAddUser = async () => {
    try {
      setIsLoading(true);
      // Open user creation modal (to be implemented)
      toast({
        title: "User Creation",
        description: "User creation modal will open here",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add user",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportData = async () => {
    try {
      setIsLoading(true);
      // Create file input element
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json,.csv';
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const formData = new FormData();
          formData.append('file', file);
          
          const response = await apiRequest('/api/admin/import-data', {
            method: 'POST',
            body: formData,
            headers: {} // Let browser set content-type for FormData
          });
          
          toast({
            title: "Import Complete",
            description: `Successfully imported ${response.recordsImported || 0} records`,
          });
        }
      };
      input.click();
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "Failed to import data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/export-data');
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `waitumusic_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Export Complete",
        description: "Data export downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDatabaseBackup = async () => {
    try {
      setIsLoading(true);
      const response = await apiRequest('/api/admin/database/backup', {
        method: 'POST'
      });
      
      toast({
        title: "Backup Created",
        description: `Database backup created: ${response.filename}`,
      });
    } catch (error) {
      toast({
        title: "Backup Failed",
        description: "Failed to create database backup",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestartServices = async () => {
    try {
      setIsLoading(true);
      await apiRequest('/api/admin/system/restart', {
        method: 'POST'
      });
      
      toast({
        title: "Services Restarted",
        description: "All system services have been restarted",
      });
    } catch (error) {
      toast({
        title: "Restart Failed",
        description: "Failed to restart services",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateFinancialSettings = async () => {
    try {
      setIsLoading(true);
      await apiRequest('/api/admin/financial-settings', {
        method: 'PUT',
        body: JSON.stringify({
          platformFeeRate: parseFloat(platformFeeRate),
          processingFeeRate: parseFloat(processingFeeRate)
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      toast({
        title: "Settings Updated",
        description: "Financial settings have been updated successfully",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update financial settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* User Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={handleAddUser}
              disabled={isLoading}
              className="w-full"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
            <div className="text-sm text-gray-600">
              Create new user accounts and manage permissions
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Data Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={handleImportData}
              disabled={isLoading}
              variant="outline"
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              Import Data
            </Button>
            <Button 
              onClick={handleExportData}
              disabled={isLoading}
              variant="outline"
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </CardContent>
        </Card>

        {/* System Operations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              System Operations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={handleDatabaseBackup}
              disabled={isLoading}
              variant="outline"
              className="w-full"
            >
              <Database className="h-4 w-4 mr-2" />
              Backup Database
            </Button>
            <Button 
              onClick={handleRestartServices}
              disabled={isLoading}
              variant="outline"
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Restart Services
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Financial Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Financial Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="platformFee">Platform Fee Rate (%)</Label>
              <Input
                id="platformFee"
                type="number"
                step="0.1"
                value={platformFeeRate}
                onChange={(e) => setPlatformFeeRate(e.target.value)}
                placeholder="15.0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="processingFee">Processing Fee Rate (%)</Label>
              <Input
                id="processingFee"
                type="number"
                step="0.1"
                value={processingFeeRate}
                onChange={(e) => setProcessingFeeRate(e.target.value)}
                placeholder="2.9"
              />
            </div>
          </div>
          <Button 
            onClick={handleUpdateFinancialSettings}
            disabled={isLoading}
            className="mt-4"
          >
            <Save className="h-4 w-4 mr-2" />
            Update Financial Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}