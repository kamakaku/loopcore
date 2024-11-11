import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link, Image as ImageIcon, FileText, ExternalLink, CircleSlash2 } from 'lucide-react';
import { useFirestore } from '../../hooks/useFirestore';
import { Loop } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { formatDate } from '../../utils/formatDate';

export default function LoopList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<Error | null>(null);

  const { data: loops = [], loading, error: fetchError } = useFirestore<Loop>('loops', {
    where: [['createdBy', '==', user?.uid]],
    orderBy: [['createdAt', 'desc']]
  });

  useEffect(() => {
    if (fetchError) {
      console.error('Error in LoopList:', fetchError);
      setError(fetchError);
    }
  }, [fetchError]);

  if (!user) {
    return (
      <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
        <CircleSlash2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Sign in Required</h3>
        <p className="text-gray-500">Please sign in to view your loops</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-6 bg-red-50 rounded-lg">
        <CircleSlash2 className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600">Failed to load loops. Please try again.</p>
      </div>
    );
  }

  if (!loading && (!loops || loops.length === 0)) {
    return (
      <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
        <CircleSlash2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No loops yet</h3>
        <p className="text-gray-500">Create your first loop using the "New Loop" button above</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Spots
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Comments
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-5 w-5 bg-gray-200 rounded"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-4 bg-gray-200 rounded w-48"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-4 bg-gray-200 rounded w-12"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-4 bg-gray-200 rounded w-12"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </td>
                </tr>
              ))
            ) : (
              loops.map((loop) => (
                <tr key={loop.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {loop.type === 'url' ? (
                        <Link className="w-5 h-5 text-blue-600" />
                      ) : loop.type === 'image' ? (
                        <ImageIcon className="w-5 h-5 text-green-600" />
                      ) : (
                        <FileText className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {loop.title || 'Untitled Loop'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {formatDate(loop.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {loop.spotCount || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {loop.commentCount || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-3">
                      <button 
                        onClick={() => navigate(`/loops/${loop.id}`)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        View
                      </button>
                      {loop.type === 'url' && loop.content && (
                        <a
                          href={loop.content}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}