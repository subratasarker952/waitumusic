import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Icons
import {
  Users, Calendar, DollarSign, TrendingUp, Music, Star,
  Settings, Shield, Activity, FileText, Heart, Download,
  Mic, Headphones, Briefcase, Check, AlertTriangle,
  BarChart3, Clock, MapPin, Play, ShoppingCart, Award,
  Globe, Wrench, Database, UserCheck, BookOpen,
  CreditCard, Camera, Video, Image, FolderOpen
} from 'lucide-react';

interface AdminDashboardProps {
  stats: any;
  bookings: any[];
  user: any;
}

export default function AdminDashboard({ stats, bookings, user }: AdminDashboardProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Platform management and oversight</p>
        </div>
        <Badge variant="outline" className="text-blue-600 border-blue-600">
          <Shield className="h-3 w-3 mr-1" />
          Admin
        </Badge>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookings?.filter(b => b.status === 'pending').length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats?.monthlyRevenue || '0'}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Artists</CardTitle>
            <Music className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeArtists || 0}</div>
            <p className="text-xs text-muted-foreground">
              Managed artists
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Management Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Button onClick={() => setLocation('/dashboard')} className="w-full">
            <Users className="w-4 h-4 mr-2" />
            Manage Users
          </Button>
          <Button onClick={() => setLocation('/artists')} variant="outline" className="w-full">
            <Music className="w-4 h-4 mr-2" />
            View Artists
          </Button>
          <Button onClick={() => setLocation('/comprehensive-workflow')} variant="outline" className="w-full">
            <Calendar className="w-4 h-4 mr-2" />
            Comprehensive Workflow
          </Button>
        </CardContent>
      </Card>

      {/* Recent Bookings */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bookings?.slice(0, 5).map((booking: any, index) => (
              <div key={booking.id || index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{booking.eventName || 'Event'}</p>
                  <p className="text-sm text-muted-foreground">
                    {booking.eventDate ? new Date(booking.eventDate).toLocaleDateString() : 'Date TBD'}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={booking.status === 'pending' ? 'outline' : 'default'}>
                    {booking.status || 'pending'}
                  </Badge>
                  <Button size="sm" variant="outline">
                    Review
                  </Button>
                </div>
              </div>
            )) || (
              <p className="text-muted-foreground text-center py-4">No recent bookings</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}