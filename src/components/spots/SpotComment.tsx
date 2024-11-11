import React from 'react';
import { User } from 'lucide-react';
import { Comment } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { formatDate } from '../../utils/formatDate';

interface SpotCommentProps {
  comment: Comment;
}

export default function SpotComment({ comment }: SpotCommentProps) {
  const { user } = useAuth();

  return (
    <div className="space-y-2">
      <div className="bg-white rounded-lg p-3 shadow-sm">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">
              {comment.createdBy === user?.uid ? 'You' : 'Team Member'}
            </span>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">
                {comment.createdBy === user?.uid ? 'You' : 'Team Member'}
              </div>
              <div className="text-xs text-gray-500">
                {formatDate(comment.createdAt)}
              </div>
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-600 ml-10">{comment.content}</p>
      </div>
    </div>
  );
}