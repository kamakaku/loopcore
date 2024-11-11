import React from 'react';
import { MessageSquare, Plus } from 'lucide-react';
import { useFirestore } from '../../hooks/useFirestore';
import { Project, Feedback } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface FeedbackPanelProps {
  project: Project | null;
}

export default function FeedbackPanel({ project }: FeedbackPanelProps) {
  const { user } = useAuth();
  const { data: feedback, loading } = useFirestore<Feedback>(
    'feedback',
    project ? {
      where: [['projectId', '==', project.id]],
      orderBy: [['createdAt', 'desc']]
    } : undefined
  );

  if (!project) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center py-8">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No project selected</h3>
          <p className="text-gray-500">Select a project to view feedback</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Feedback</h3>
          <button className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700">
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </div>

        <div className="flex space-x-2">
          {['all', 'open', 'in_progress', 'resolved'].map((status) => (
            <button
              key={status}
              className={`px-3 py-1 text-sm rounded-full capitalize ${
                status === 'all'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="divide-y divide-gray-200 max-h-[calc(100vh-20rem)] overflow-y-auto">
        {loading ? (
          <div className="animate-pulse p-4 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-100 rounded"></div>
            ))}
          </div>
        ) : feedback?.length ? (
          feedback.map((item) => (
            <div key={item.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-gray-900">{item.content}</p>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                      item.status === 'open'
                        ? 'bg-yellow-100 text-yellow-700'
                        : item.status === 'in_progress'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {item.status.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                {item.replies?.length > 0 && (
                  <span className="flex items-center space-x-1 text-xs text-gray-500">
                    <MessageSquare className="w-4 h-4" />
                    <span>{item.replies.length}</span>
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No feedback yet</h3>
            <p className="text-gray-500">Be the first to add feedback</p>
          </div>
        )}
      </div>
    </div>
  );
}