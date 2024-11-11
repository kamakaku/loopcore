import { useState } from 'react';
import { X, Search, Image as ImageIcon, Check, Loader2 } from 'lucide-react';
import { useFirestore } from '../../hooks/useFirestore';
import { Loop } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { updateLoop } from '../../lib/loops';
import { formatDate } from '../../utils/formatDate';

interface LoopSelectorProps {
  projectId: string;
  onClose: () => void;
  onLoopsAdded: () => void;
}

export default function LoopSelector({ projectId, onClose, onLoopsAdded }: LoopSelectorProps) {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [selectedLoops, setSelectedLoops] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { data: loops = [], loading: loopsLoading } = useFirestore<Loop>('loops', {
    where: [
      ['createdBy', '==', user?.uid],
      ['projectId', '==', null]
    ],
    orderBy: [['createdAt', 'desc']]
  });

  const filteredLoops = loops.filter(loop => 
    loop.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleLoopSelect = (loopId: string) => {
    setSelectedLoops(prev =>
      prev.includes(loopId)
        ? prev.filter(id => id !== loopId)
        : [...prev, loopId]
    );
  };

  const handleSubmit = async () => {
    if (loading || selectedLoops.length === 0) return;

    setLoading(true);
    setError('');

    try {
      await Promise.all(
        selectedLoops.map(loopId => 
          updateLoop(loopId, { projectId })
        )
      );
      onLoopsAdded();
    } catch (err) {
      console.error('Error adding loops:', err);
      setError(err instanceof Error ? err.message : 'Failed to add loops');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Add Loops to Project</h2>
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

        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search loops..."
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              disabled={loading}
            />
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg h-[400px] overflow-y-auto mb-4">
          {loopsLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : filteredLoops.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <ImageIcon className="w-8 h-8 mb-2" />
              <p className="text-sm">No available loops found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredLoops.map(loop => (
                <button
                  key={loop.id}
                  onClick={() => handleLoopSelect(loop.id)}
                  className={`w-full flex items-start p-4 hover:bg-gray-50 ${
                    selectedLoops.includes(loop.id) ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg overflow-hidden mr-4">
                    {loop.type === 'url' ? (
                      <img
                        src={loop.screenshot}
                        alt={loop.title}
                        className="w-full h-full object-cover"
                      />
                    ) : loop.type === 'image' ? (
                      <img
                        src={loop.content}
                        alt={loop.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="text-sm font-medium text-gray-900 mb-1">
                      {loop.title}
                    </h4>
                    <p className="text-xs text-gray-500">
                      Created {formatDate(loop.createdAt)}
                    </p>
                  </div>
                  {selectedLoops.includes(loop.id) && (
                    <Check className="w-4 h-4 text-blue-600 ml-2" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:text-gray-900"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || selectedLoops.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {loading && (
              <Loader2 className="w-4 h-4 animate-spin" />
            )}
            <span>{loading ? 'Adding...' : 'Add Selected'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}