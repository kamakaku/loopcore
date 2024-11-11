import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Dashboard from './dashboard/Dashboard';
import AuthScreen from './auth/AuthScreen';
import PlanSelector from './plans/PlanSelector';
import LoadingScreen from './common/LoadingScreen';

export default function AppRouter() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  // Check if user has selected a plan
  const hasSelectedPlan = user?.subscription?.planId !== undefined;

  return (
    <Routes>
      {/* Public routes */}
      <Route 
        path="/" 
        element={
          !user ? (
            <Navigate to="/auth" replace />
          ) : hasSelectedPlan ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/plans" replace />
          )
        } 
      />
      
      <Route 
        path="/auth" 
        element={
          !user ? (
            <AuthScreen />
          ) : hasSelectedPlan ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/plans" replace />
          )
        } 
      />
      
      {/* Protected routes */}
      {user ? (
        !hasSelectedPlan ? (
          <>
            <Route path="/plans" element={<PlanSelector />} />
            <Route path="*" element={<Navigate to="/plans" replace />} />
          </>
        ) : (
          <>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </>
        )
      ) : (
        // Not authenticated - redirect to auth
        <Route path="*" element={<Navigate to="/auth" replace />} />
      )}
    </Routes>
  );
}