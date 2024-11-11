import React, { useState } from 'react';
import { X, Copy, Link } from 'lucide-react';
import { Loop } from '../../types';
import { toggleLoopPublicAccess } from '../../lib/loops';

interface PublicShareProps {
  loop: Loop;
  onClose: () => void;
  onUpdated: () => void;
}

export default function PublicShare({ loop, onClose, onUpdated }: PublicShareProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const publicUrl = loop.publicId 
    ? `${window.location.origin}/public/${loop.publicId}`
    : null;

  const handleTogglePublic = async () => {
    setLoading(true);
    setError('');

    try {
      await toggleLoopPublicAccess(loop.id);
      onUpdated();
    } catch (err) {
      console.error('Error toggling public access:', err);
      setError(err instanceof Error ? err.message : 'Failed to update public access');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!publicUrl) return;

    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error copying to clipboard:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Share Loop</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Public Access</h3>
              <p className="text-sm text-gray-500">
                Allow anyone with the link to view and interact with this loop
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={!!loop.publicId}
                onChange={handleTogglePublic}
                disabled={loading}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {publicUrl && (
            <>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Public Link
                </label>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg">
                    <Link className="w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={publicUrl}
                      readOnly
                      className="flex-1 bg-transparent border-none focus:ring-0 text-sm"
                    />
                  </div>
                  <button
                    onClick={handleCopyLink}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                </div>
                {copied && (
                  <p className="text-sm text-green-600 mt-1">
                    Link copied to clipboard!
                  </p>
                )}
              </div>

              <div className="bg-blue-50 p-4 rounded-lg mt-4">
                <h4 className="font-medium text-blue-900 mb-2">What can visitors do?</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• View the loop and all spots</li>
                  <li>• Add new spots (email required)</li>
                  <li>• Leave comments (email required)</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}