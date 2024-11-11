import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { PLANS } from '../lib/stripe';

export function useSubscription() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const subscription = user?.subscription;
  const plan = subscription ? PLANS[subscription.planId] : PLANS.FREE;

  useEffect(() => {
    if (user) {
      setLoading(false);
    }
  }, [user]);

  const checkFeatureAccess = (feature: string): boolean => {
    if (!subscription) return false;
    return plan.limits.features.includes(feature) || plan.limits.features.includes('all');
  };

  const checkTeamMemberLimit = (currentMembers: number): boolean => {
    if (!subscription) return false;
    const totalAllowedMembers = plan.limits.teamMembers + (subscription.additionalTeamMembers || 0);
    return totalAllowedMembers === -1 || currentMembers <= totalAllowedMembers;
  };

  const checkProjectLimit = (currentProjects: number): boolean => {
    if (!subscription) return false;
    return plan.limits.projects === -1 || currentProjects <= plan.limits.projects;
  };

  const checkLoopLimit = (currentLoops: number): boolean => {
    if (!subscription) return false;
    return plan.limits.loopsPerProject === -1 || currentLoops <= plan.limits.loopsPerProject;
  };

  const checkSpotLimit = (currentSpots: number): boolean => {
    if (!subscription) return false;
    return plan.limits.spotsPerLoop === -1 || currentSpots <= plan.limits.spotsPerLoop;
  };

  return {
    subscription,
    plan,
    loading,
    error,
    checkFeatureAccess,
    checkTeamMemberLimit,
    checkProjectLimit,
    checkLoopLimit,
    checkSpotLimit
  };
}