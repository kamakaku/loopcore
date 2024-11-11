import React from 'react';
import { User, MoreVertical } from 'lucide-react';
import { Comment } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { formatDate } from '../../utils/formatDate';

interface CommentItemProps {
  comment: Comment;
}

export default function CommentItem({ comment }: CommentItemProps) {
  const { user } = useAuth();

  return (
    <div className="space-y-2">
      <div className="bg-white rounded-lg p-3 shadow-sm">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">
              {comment.createdBy === user?.uid ? 'You' : 'Team Member'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">
              {formatDate(comment.createdAt)}
            </span>
            <button className="p-1 hover:bg-gray-100 rounded">
              <MoreVertical className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-600">{comment.content}</p>
      </div>
    </div>
  );
}