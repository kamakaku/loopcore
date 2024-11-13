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
            <AuthScreen />
          ) : (
            <Navigate to="/dashboard" replace />
          )
        } 
      />
      
      <Route 
        path="/auth" 
        element={
          user ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <AuthScreen />
          )
        } 
      />
      
      <Route 
        path="/plans" 
        element={
          !user ? (
            <Navigate to="/auth" replace />
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
          ) : !user.subscription ? (
            <Navigate to="/plans" replace />
          ) : (
            <Dashboard />
          )
        } 
      />
    </Routes>
  );
}