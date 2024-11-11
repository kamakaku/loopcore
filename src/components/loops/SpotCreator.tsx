import React, { useState } from 'react';
import { Loop, Spot } from '../../types';
import { createSpot } from '../../lib/firebase';

interface SpotCreatorProps {
  loop: Loop;
  onClose: () => void;
  onSpotCreated: (spot: Spot) => void;
}

export default function SpotCreator({ loop, onClose, onSpotCreated }: SpotCreatorProps) {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPosition({ x, y });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!position || !content.trim()) return;

    setLoading(true);
    try {
      const spot = await createSpot({
        loopId: loop.id,
        position,
        content: content.trim()
      });
      onSpotCreated(spot);
    } catch (error) {
      console.error('Error creating spot:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full p-6">
        <h2 className="text-xl font-bold mb-4">Add New Spot</h2>
        
        <div className="relative mb-4" onClick={handleImageClick}>
          {loop.type === 'url' ? (
            <img
              src={loop.screenshot}
              alt={loop.title}
              className="w-full h-auto cursor-crosshair"
            />
          ) : loop.type === 'image' ? (
            <img
              src={loop.content}
              alt={loop.title}
              className="w-full h-auto cursor-crosshair"
            />
          ) : (
            <embed
              src={loop.content}
              type="application/pdf"
              className="w-full h-[60vh] cursor-crosshair"
            />
          )}

          {position && (
            <div
              className="absolute w-6 h-6 -ml-3 -mt-3 bg-blue-600 text-white rounded-full flex items-center justify-center"
              style={{
                left: `${position.x}%`,
                top: `${position.y}%`,
              }}
            >
              <span className="text-sm font-medium">+</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Comment
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              rows={3}
              required
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!position || !content.trim() || loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Spot'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}