import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Link, Image as ImageIcon, FileText, Trash2, MessageSquare, Eye } from 'lucide-react';
import { Loop } from '../../types';
import { formatDate } from '../../utils/formatDate';
import { useTranslation } from 'react-i18next';

interface TeamLoopsTableProps {
  loops: Loop[];
  loading?: boolean;
  onViewLoop: (id: string) => void;
  onDeleteLoop?: (id: string) => void;
}

export default function TeamLoopsTable({ loops, loading, onViewLoop, onDeleteLoop }: TeamLoopsTableProps) {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="animate-pulse p-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded mb-2"></div>
        ))}
      </div>
    );
  }

  if (loops.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">{t('loops.noLoops')}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('common.table.type')}
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('common.table.title')}
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('common.table.created')}
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('common.table.spots')}
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('common.table.actions')}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {loops.map((loop) => (
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
                        <FileText className="h-5 w-5 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                      {loop.title}
                    </div>
                    {loop.description && (
                      <div className="text-sm text-gray-500 max-w-xs truncate">
                        {loop.description}
                      </div>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(loop.createdAt)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    <Eye className="w-4 h-4 mr-1" />
                    {t('loops.spotCount', { count: loop.spotCount || 0 })}
                  </span>
                  <span className="flex items-center">
                    <MessageSquare className="w-4 h-4 mr-1" />
                    {t('loops.commentCount', { count: loop.commentCount || 0 })}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                <div className="flex items-center justify-end space-x-2">
                  <button
                    onClick={() => onViewLoop(loop.id)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {t('common.view')}
                  </button>
                  {onDeleteLoop && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteLoop(loop.id);
                      }}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      title={t('common.delete')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}