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

  return (
    <Routes>
      {/* Public routes */}
      <Route 
        path="/" 
        element={
          !user ? (
            <Navigate to="/auth" replace />
          ) : !user.subscription?.planId ? (
            <Navigate to="/plans" replace />
          ) : (
            <Navigate to="/dashboard" replace />
          )
        } 
      />
      
      <Route 
        path="/auth" 
        element={
          user ? (
            <Navigate to={user.subscription?.planId ? '/dashboard' : '/plans'} replace />
          ) : (
            <AuthScreen />
          )
        } 
      />
      
      {/* Protected routes */}
      <Route 
        path="/plans" 
        element={
          !user ? (
            <Navigate to="/auth" replace />
          ) : user.subscription?.planId ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <PlanSelector />
          )
        } 
      />

      <Route 
        path="/dashboard/*" 
        element={
          !user ? (
            <Navigate to="/auth" replace />
          ) : !user.subscription?.planId ? (
            <Navigate to="/plans" replace />
          ) : (
            <Dashboard />
          )
        } 
      />

      {/* Catch all - redirect to auth if not logged in, or appropriate page if logged in */}
      <Route 
        path="*" 
        element={
          !user ? (
            <Navigate to="/auth" replace />
          ) : !user.subscription?.planId ? (
            <Navigate to="/plans" replace />
          ) : (
            <Navigate to="/dashboard" replace />
          )
        } 
      />
    </Routes>
  );
}