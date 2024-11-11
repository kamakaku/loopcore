import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signIn } from '../../lib/firebase';
import AuthInput from './AuthInput';
import AuthError from './AuthError';
import AuthButton from './AuthButton';

export default function LoginForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || !formData.email.trim() || !formData.password) return;

    setLoading(true);
    setError('');

    try {
      const userCredential = await signIn(formData.email.trim(), formData.password);
      // Check if user has a subscription plan
      if (userCredential.user?.subscription?.planId) {
        navigate('/dashboard');
      } else {
        navigate('/plans');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      switch (err.code) {
        case 'auth/invalid-credential':
          setError('E-Mail oder Passwort ungültig');
          break;
        case 'auth/user-not-found':
          setError('Kein Account mit dieser E-Mail gefunden');
          break;
        case 'auth/wrong-password':
          setError('Falsches Passwort');
          break;
        case 'auth/invalid-email':
          setError('Ungültiges E-Mail Format');
          break;
        case 'auth/too-many-requests':
          setError('Zu viele Versuche. Bitte versuchen Sie es später erneut');
          break;
        default:
          setError('Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <AuthError error={error} mode="signin" />}

      <AuthInput
        id="email"
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        label="E-Mail"
        placeholder="Ihre E-Mail-Adresse"
        required
        disabled={loading}
        autoComplete="email"
      />

      <AuthInput
        id="password"
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        label="Passwort"
        placeholder="Ihr Passwort"
        required
        disabled={loading}
        autoComplete="current-password"
      />

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => navigate('/auth?mode=forgot')}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          Passwort vergessen?
        </button>
      </div>

      <AuthButton
        type="submit"
        loading={loading}
        disabled={loading || !formData.email || !formData.password}
        loadingText="Anmeldung..."
      >
        Anmelden
      </AuthButton>
    </form>
  );
}