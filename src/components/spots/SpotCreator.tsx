import React, { useState } from 'react';
import { Loop } from '../../types';
import { createSpot } from '../../lib/spots';

interface SpotCreatorProps {
  loop: Loop;
  position: { x: number; y: number };
  currentPage?: number;
  onClose: () => void;
  onSpotCreated: () => void;
}

export default function SpotCreator({ 
  loop, 
  position, 
  currentPage = 0,
  onClose, 
  onSpotCreated 
}: SpotCreatorProps) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || loading) return;

    setLoading(true);
    try {
      await createSpot({
        loopId: loop.id,
        position,
        content: content.trim(),
        pageNumber: currentPage
      });
      onSpotCreated();
      onClose();
    } catch (error) {
      console.error('Error creating spot:', error);
      setError('Failed to create spot. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-lg w-full p-6">
        <h2 className="text-lg font-semibold mb-4">Add Spot Description</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              rows={3}
              required
              placeholder="Enter a description for this spot..."
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
              disabled={!content.trim() || loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              )}
              <span>{loading ? 'Creating...' : 'Create Spot'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}