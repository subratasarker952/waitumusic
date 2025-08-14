import React from 'react';
import HierarchicalDashboard from './HierarchicalDashboard';

interface RoleSpecificDashboardProps {
  user: {
    id: number;
    fullName: string;
    role: string;
    roleId: number;
    roleName: string;
  };
  useHierarchicalView?: boolean;
}

export default function RoleSpecificDashboard({ user, useHierarchicalView = true }: RoleSpecificDashboardProps) {
  // Use hierarchical dashboard for unified experience across all user types
  return <HierarchicalDashboard user={user} />;
}