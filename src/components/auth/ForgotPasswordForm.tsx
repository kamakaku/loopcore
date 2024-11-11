import React, { useState } from 'react';
import { resetPassword } from '../../lib/firebase';

export default function ForgotPasswordForm({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || loading) return;

    setLoading(true);
    setError('');

    try {
      await resetPassword(email.trim());
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center">
        <div className="mb-4 text-green-600">
          Password reset email sent! Check your inbox for further instructions.
        </div>
        <button
          onClick={onBack}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          Back to sign in
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          required
          disabled={loading}
        />
      </div>

      <button
        type="submit"
        disabled={loading || !email.trim()}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Sending reset email...' : 'Reset password'}
      </button>

      <button
        type="button"
        onClick={onBack}
        className="w-full text-gray-600 hover:text-gray-700 text-sm font-medium"
      >
        Back to sign in
      </button>
    </form>
  );
}