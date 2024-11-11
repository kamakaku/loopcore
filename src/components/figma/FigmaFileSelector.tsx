import React, { useState } from 'react';
import { X, Search, FileText, Check } from 'lucide-react';
import { getFigmaFile, extractFigmaKeyFromUrl } from '../../lib/figma';

interface FigmaFileSelectorProps {
  accessToken: string;
  onFileSelect: (file: any) => void;
  onClose: () => void;
}

export default function FigmaFileSelector({
  accessToken,
  onFileSelect,
  onClose
}: FigmaFileSelectorProps) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filePreview, setFilePreview] = useState<any>(null);

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || loading) return;

    setLoading(true);
    setError('');

    try {
      const fileKey = extractFigmaKeyFromUrl(url);
      if (!fileKey) {
        throw new Error('Invalid Figma URL. Please use a URL from a Figma file, prototype, or design.');
      }

      const file = await getFigmaFile(fileKey, accessToken);
      if (!file) {
        throw new Error('Failed to fetch Figma file details');
      }

      setFilePreview(file);
    } catch (err) {
      console.error('Error fetching Figma file:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch Figma file. Please check the URL and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Import from Figma</h2>
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

        <form onSubmit={handleUrlSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Figma File URL
            </label>
            <div className="relative">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.figma.com/file/..."
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                disabled={loading}
              />
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Paste a Figma file, prototype, or design URL
            </p>
          </div>

          {filePreview && (
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                {filePreview.thumbnailUrl ? (
                  <img
                    src={filePreview.thumbnailUrl}
                    alt={filePreview.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                    <FileText className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                <div>
                  <h3 className="font-medium text-gray-900">{filePreview.name}</h3>
                  <p className="text-sm text-gray-500">
                    Last modified: {new Date(filePreview.lastModified).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
              disabled={loading}
            >
              Cancel
            </button>
            {filePreview ? (
              <button
                type="button"
                onClick={() => onFileSelect(filePreview)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Import File
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading || !url.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                )}
                <span>{loading ? 'Loading...' : 'Check URL'}</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}