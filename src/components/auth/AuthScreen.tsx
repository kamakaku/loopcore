import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CircleSlash2 } from 'lucide-react';
import LoginForm from './LoginForm';
import SignUpForm from './SignUpForm';

export default function AuthScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const mode = new URLSearchParams(location.search).get('mode') || 'signin';

  const updateMode = (newMode: string) => {
    navigate(`/auth?mode=${newMode}`, { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <CircleSlash2 className="w-12 h-12 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            {mode === 'signup' ? 'Jetzt registrieren' : 'Willkommen zurück'}
          </h1>
          <p className="text-gray-600">
            {mode === 'signup' 
              ? 'Erstellen Sie Ihren Account und wählen Sie Ihren Plan'
              : 'Melden Sie sich in Ihrem Account an'}
          </p>
        </div>

        {mode === 'signup' ? (
          <>
            <SignUpForm />
            <div className="mt-6 text-center text-sm">
              <p className="text-gray-600">
                Bereits einen Account?{' '}
                <button
                  onClick={() => updateMode('signin')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Jetzt anmelden
                </button>
              </p>
            </div>
          </>
        ) : (
          <>
            <LoginForm />
            <div className="mt-6 text-center text-sm">
              <p className="text-gray-600">
                Noch keinen Account?{' '}
                <button
                  onClick={() => updateMode('signup')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Jetzt registrieren
                </button>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}