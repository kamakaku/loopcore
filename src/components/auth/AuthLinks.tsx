import React from 'react';
import { Link } from 'react-router-dom';

interface AuthLinksProps {
  mode: 'signin' | 'signup' | 'forgot';
}

export default function AuthLinks({ mode }: AuthLinksProps) {
  if (mode === 'signup') {
    return (
      <>
        <p className="text-sm text-gray-600 text-center mt-4">
          By signing up, you agree to our{' '}
          <Link to="/legal/terms" className="text-blue-600 hover:text-blue-700">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link to="/legal/privacy" className="text-blue-600 hover:text-blue-700">
            Privacy Policy
          </Link>
        </p>
        <div className="mt-6 text-center">
          <Link 
            to="/auth?mode=signin"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Already have an account?
          </Link>
        </div>
      </>
    );
  }

  if (mode === 'signin') {
    return (
      <div className="mt-6 text-center">
        <Link 
          to="/auth?mode=signup"
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          Don't have an account?
        </Link>
      </div>
    );
  }

  return null;
}