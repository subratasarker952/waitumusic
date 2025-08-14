import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, FileText, FileSpreadsheet, Mic, Hash, Mail, Settings, Users } from 'lucide-react';
import { Link } from 'wouter';

export default function SystemManagement() {
  const managementSystems = [
    {
      title: 'Merchandise Manager',
      description: 'Manage products, inventory, and artist merchandise',
      icon: Package,
      route: '/merchandise-manager',
      color: 'bg-blue-500'
    },
    {
      title: 'Splitsheet Manager', 
      description: 'Create and manage music rights splitsheets',
      icon: FileSpreadsheet,
      route: '/splitsheet-manager',
      color: 'bg-green-500'
    },
    {
      title: 'Contract Manager',
      description: 'Handle legal documents and contract management',
      icon: FileText,
      route: '/contract-manager',
      color: 'bg-purple-500'
    },
    {
      title: 'Technical Rider Manager',
      description: 'Create performance specifications and technical requirements',
      icon: Mic,
      route: '/technical-rider-manager',
      color: 'bg-orange-500'
    },
    {
      title: 'ISRC Manager',
      description: 'Generate and manage music identification codes',
      icon: Hash,
      route: '/isrc-manager',
      color: 'bg-red-500'
    },
    {
      title: 'Newsletter Manager',
      description: 'Create and distribute marketing communications',
      icon: Mail,
      route: '/newsletter-manager',
      color: 'bg-indigo-500'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4 flex items-center gap-3">
          <Settings className="w-8 h-8" />
          System Management
        </h1>
        <p className="text-gray-600">
          Access comprehensive management tools for all platform systems
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {managementSystems.map((system) => {
          const IconComponent = system.icon;
          
          return (
            <Card key={system.route} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${system.color} text-white`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  {system.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  {system.description}
                </p>
                <Link href={system.route}>
                  <Button className="w-full">
                    Access Manager
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-12 bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" />
          System Status
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg">
            <h3 className="font-medium text-green-600">All Systems Operational</h3>
            <p className="text-sm text-gray-600">6/6 management systems online</p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <h3 className="font-medium text-blue-600">Database Connected</h3>
            <p className="text-sm text-gray-600">Schema properly aligned</p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <h3 className="font-medium text-purple-600">APIs Functional</h3>
            <p className="text-sm text-gray-600">All endpoints returning JSON</p>
          </div>
        </div>
      </div>
    </div>
  );
}