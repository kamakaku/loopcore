import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { Loop, Comment, Spot } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { formatDate } from '../../utils/formatDate';
import CommentInput from './CommentInput';
import CommentActions from '../spots/CommentActions';
import Avatar from '../common/Avatar';
import { useFirestore } from '../../hooks/useFirestore';

interface CommentListProps {
  loop: Loop;
  selectedSpot: Spot | null;
  userRole?: string;
}

export default function CommentList({ loop, selectedSpot, userRole = 'viewer' }: CommentListProps) {
  const { user } = useAuth();
  const [replyingToLoop, setReplyingToLoop] = useState(false);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showActionsFor, setShowActionsFor] = useState<string | null>(null);

  const { data: comments = [], loading } = useFirestore<Comment>('comments', {
    where: [
      ['targetId', '==', selectedSpot ? selectedSpot.id : loop.id],
      ['targetType', '==', selectedSpot ? 'spot' : 'loop']
    ],
    orderBy: [['createdAt', 'asc']]
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4">
      {comments.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full">
          <MessageSquare className="w-12 h-12 text-gray-400 mb-4" />
          <p className="text-gray-500 text-center">No comments yet</p>
          {userRole !== 'viewer' && (
            <p className="text-sm text-gray-400 mt-2 text-center">
              Be the first to add a comment
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map(comment => (
            <div key={comment.id} className="relative bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Avatar 
                    src={user?.photoURL}
                    alt={user?.displayName || 'User'}
                    size="sm"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {comment.createdBy === user?.uid ? 'You' : 'Team Member'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDate(comment.createdAt)}
                    </div>
                  </div>
                </div>
                {comment.createdBy === user?.uid && (
                  <CommentActions
                    comment={comment}
                    onEdit={() => {
                      setEditingComment(comment.id);
                      setEditContent(comment.content);
                      setShowActionsFor(null);
                    }}
                    onDelete={() => setShowActionsFor(null)}
                    showMenu={showActionsFor === comment.id}
                    onToggleMenu={() => setShowActionsFor(showActionsFor === comment.id ? null : comment.id)}
                  />
                )}
              </div>
              {editingComment === comment.id ? (
                <div className="ml-10">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none"
                    rows={2}
                  />
                  <div className="flex justify-end space-x-2 mt-2">
                    <button
                      onClick={() => setEditingComment(null)}
                      className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        // Handle update comment
                        setEditingComment(null);
                      }}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-600 ml-10">{comment.content}</p>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-4">
        {!replyingToLoop ? (
          <button
            onClick={() => setReplyingToLoop(true)}
            className="w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg border border-gray-200"
          >
            Add a comment...
          </button>
        ) : (
          <CommentInput
            targetId={selectedSpot ? selectedSpot.id : loop.id}
            targetType={selectedSpot ? 'spot' : 'loop'}
            onSubmitted={() => setReplyingToLoop(false)}
            placeholder="Write a comment..."
            autoFocus
            userRole={userRole}
          />
        )}
      </div>
    </div>
  );
}