import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Eye, Trash2 } from 'lucide-react';
import { Loop } from '../../types';
import { formatDate } from '../../utils/formatDate';

interface ProjectLoopsTableProps {
  loops: Loop[];
  loading?: boolean;
  onDeleteLoop?: (id: string) => void;
}

export default function ProjectLoopsTable({ loops, loading, onDeleteLoop }: ProjectLoopsTableProps) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="animate-pulse p-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded mb-2"></div>
        ))}
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
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loops.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center">
                  <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No loops added yet</p>
                </td>
              </tr>
            ) : (
              loops.map((loop) => (
                <tr 
                  key={loop.id}
                  onClick={() => navigate(`/loops/${loop.id}`)}
                  className="hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-lg overflow-hidden">
                        {loop.type === 'url' ? (
                          <img
                            src={loop.screenshot}
                            alt={loop.title}
                            className="h-10 w-10 object-cover"
                          />
                        ) : loop.type === 'image' ? (
                          <img
                            src={loop.content}
                            alt={loop.title}
                            className="h-10 w-10 object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 bg-gray-100 flex items-center justify-center">
                            <Eye className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                          {loop.title}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {formatDate(loop.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <Eye className="w-4 h-4 mr-1" />
                      {loop.spotCount || 0}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <MessageSquare className="w-4 h-4 mr-1" />
                      {loop.commentCount || 0}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/loops/${loop.id}`);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        View
                      </button>
                      {onDeleteLoop && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteLoop(loop.id);
                          }}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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