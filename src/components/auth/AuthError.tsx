import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

interface AuthErrorProps {
  error: string;
  mode: 'signin' | 'signup' | 'forgot';
}

export default function AuthError({ error, mode }: AuthErrorProps) {
  return (
    <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-start space-x-3">
      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm">{error}</p>
        {error === 'auth.errors.emailInUse' && mode === 'signup' && (
          <Link 
            to="/auth?mode=signin" 
            className="block mt-2 text-sm font-medium text-red-700 hover:text-red-800"
          >
            Sign in instead →
          </Link>
        )}
        {(error === 'auth.errors.userNotFound' || error === 'auth.errors.wrongPassword') && mode === 'signin' && (
          <Link 
            to="/auth?mode=signup" 
            className="block mt-2 text-sm font-medium text-red-700 hover:text-red-800"
          >
            Create an account →
          </Link>
        )}
      </div>
    </div>
  );
}