import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Calendar, DollarSign, Building, Users, Search, Filter } from "lucide-react";
import { Link } from "wouter";

interface Opportunity {
  id: number;
  title: string;
  description: string;
  organizationName: string;
  location: string;
  deadline: string;
  compensationType: string;
  amount?: string;
  isRemote: boolean;
  createdAt: string;
  categoryName: string;
  applicationCount: number;
}

interface OpportunityFilters {
  search: string;
  category: string;
  location: string;
  compensationType: string;
  isRemote: boolean | null;
}

export default function OppHubMarketplace() {
  const [filters, setFilters] = useState<OpportunityFilters>({
    search: '',
    category: '',
    location: '',
    compensationType: '',
    isRemote: null
  });
  const [page, setPage] = useState(1);

  // Fetch opportunities
  const { data: opportunitiesData, isLoading } = useQuery({
    queryKey: ['/api/marketplace/opportunities', filters, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        ...(filters.search && { search: filters.search }),
        ...(filters.category && { category: filters.category }),
        ...(filters.location && { location: filters.location }),
        ...(filters.compensationType && { compensationType: filters.compensationType }),
        ...(filters.isRemote !== null && { isRemote: filters.isRemote.toString() })
      });
      
      const response = await fetch(`/api/marketplace/opportunities?${params}`);
      if (!response.ok) throw new Error('Failed to fetch opportunities');
      return response.json();
    }
  });

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['/api/marketplace/categories'],
    queryFn: async () => {
      const response = await fetch('/api/marketplace/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json();
    }
  });

  const handleFilterChange = (key: keyof OpportunityFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page when filtering
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      location: '',
      compensationType: '',
      isRemote: null
    });
    setPage(1);
  };

  const getCompensationBadge = (type: string, amount?: string) => {
    const colors = {
      paid: 'bg-green-100 text-green-800',
      unpaid: 'bg-gray-100 text-gray-800',
      revenue_share: 'bg-blue-100 text-blue-800',
      experience: 'bg-purple-100 text-purple-800'
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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">OppHub Marketplace</h1>
        <p className="text-gray-600">Discover real opportunities in the music industry</p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search opportunities..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category */}
            <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {categories?.map((category: any) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Location */}
            <Input
              placeholder="Location..."
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
            />

            {/* Compensation Type */}
            <Select value={filters.compensationType} onValueChange={(value) => handleFilterChange('compensationType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
                <SelectItem value="revenue_share">Revenue Share</SelectItem>
                <SelectItem value="experience">Experience</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.isRemote === true}
                onChange={(e) => handleFilterChange('isRemote', e.target.checked ? true : null)}
                className="rounded border-gray-300"
              />
              Remote Only
            </label>
            
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Submit Opportunity Button */}
      <div className="mb-6 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          {opportunitiesData?.pagination.total || 0} opportunities found
        </div>
        <Button asChild>
          <Link href="/submit-opportunity">Submit Opportunity</Link>
        </Button>
      </div>

      {/* Opportunities Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {opportunitiesData?.opportunities.map((opportunity: Opportunity) => (
            <Card key={opportunity.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg line-clamp-2">
                  {opportunity.title}
                </CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <Building className="h-4 w-4" />
                  {opportunity.organizationName}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600 line-clamp-3">
                  {opportunity.description}
                </p>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    {opportunity.location}
                    {opportunity.isRemote && (
                      <Badge variant="secondary">Remote</Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    Deadline: {new Date(opportunity.deadline).toLocaleDateString()}
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    {getCompensationBadge(opportunity.compensationType, opportunity.amount)}
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-gray-400" />
                    {opportunity.applicationCount} applications
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4">
                  <Badge variant="outline">{opportunity.categoryName}</Badge>
                  <Button asChild size="sm">
                    <Link href={`/opportunities/${opportunity.id}`}>
                      View Details
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {opportunitiesData?.pagination && opportunitiesData.pagination.totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>
          
          <span className="flex items-center px-4">
            Page {page} of {opportunitiesData.pagination.totalPages}
          </span>
          
          <Button
            variant="outline"
            disabled={page === opportunitiesData.pagination.totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}