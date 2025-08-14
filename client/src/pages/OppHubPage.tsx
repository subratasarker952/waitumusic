import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import OpportunitiesMarketplace from '@/components/OpportunitiesMarketplace';
import { useLocation } from 'wouter';

const OppHubPage = () => {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  // Redirect to login if not authenticated
  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-cyan-50">
      <div className="container mx-auto px-4 py-8">
        <OpportunitiesMarketplace userRoleId={user.roleId} userId={user.id} />
      </div>
    </div>
  );
};

export default OppHubPage;