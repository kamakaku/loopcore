import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { updateSpot } from '../../lib/firebase';
import { Spot } from '../../types';

interface SpotEditorProps {
  spot: Spot;
  onClose: () => void;
  onUpdated: () => void;
}

export default function SpotEditor({ spot, onClose, onUpdated }: SpotEditorProps) {
  const [content, setContent] = useState(spot.content);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setContent(spot.content);
  }, [spot]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || !content.trim()) return;

    setLoading(true);
    setError(null);

    try {
      await updateSpot({
        spotId: spot.id,
        content: content.trim()
      });
      onUpdated();
      onClose();
    } catch (err) {
      console.error('Error updating spot:', err);
      setError(err instanceof Error ? err.message : 'Failed to update spot');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Edit Spot</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              Content
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none"
              rows={4}
              required
              disabled={loading}
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !content.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              )}
              <span>{loading ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}