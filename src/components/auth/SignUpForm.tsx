import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signUp } from '../../lib/firebase';
import AuthInput from './AuthInput';
import AuthError from './AuthError';
import AuthButton from './AuthButton';

export default function SignUpForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
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

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Name wird benötigt');
      return false;
    }
    if (!formData.email.trim()) {
      setError('E-Mail wird benötigt');
      return false;
    }
    if (!formData.password) {
      setError('Passwort wird benötigt');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Passwort muss mindestens 6 Zeichen lang sein');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwörter stimmen nicht überein');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      await signUp(formData.email.trim(), formData.password, formData.name.trim());
      // After successful signup, redirect to plans page
      navigate('/plans');
    } catch (err: any) {
      console.error('Signup error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Ein Account mit dieser E-Mail existiert bereits');
      } else if (err.code === 'auth/invalid-email') {
        setError('Ungültiges E-Mail Format');
      } else {
        setError('Account konnte nicht erstellt werden. Bitte versuchen Sie es erneut');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <AuthError error={error} mode="signup" />}

      <AuthInput
        id="name"
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        label="Name"
        placeholder="Ihr vollständiger Name"
        required
        disabled={loading}
      />

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
        placeholder="Passwort erstellen"
        required
        disabled={loading}
        minLength={6}
        autoComplete="new-password"
        helperText="Mindestens 6 Zeichen"
      />

      <AuthInput
        id="confirmPassword"
        type="password"
        name="confirmPassword"
        value={formData.confirmPassword}
        onChange={handleChange}
        label="Passwort bestätigen"
        placeholder="Passwort wiederholen"
        required
        disabled={loading}
        minLength={6}
        autoComplete="new-password"
      />

      <AuthButton
        type="submit"
        loading={loading}
        disabled={loading || !formData.email || !formData.password || !formData.name}
        loadingText="Account wird erstellt..."
      >
        Account erstellen
      </AuthButton>

      <div className="mt-4 text-sm text-gray-600">
        Mit der Erstellung eines Accounts akzeptieren Sie unsere{' '}
        <a href="/terms" className="text-blue-600 hover:text-blue-700">AGB</a>{' '}
        und{' '}
        <a href="/privacy" className="text-blue-600 hover:text-blue-700">Datenschutzerklärung</a>
      </div>
    </form>
  );
}