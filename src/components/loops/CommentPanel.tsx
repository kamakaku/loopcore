import React, { useState } from 'react';
import { X, Send, Paperclip, MessageSquare } from 'lucide-react';
import { Loop, Spot, Comment } from '../../types';
import { useFirestore } from '../../hooks/useFirestore';
import { useAuth } from '../../contexts/AuthContext';
import { createComment } from '../../lib/firebase';
import { formatDistanceToNow } from 'date-fns';

interface CommentPanelProps {
  loop: Loop;
  selectedSpot: Spot | null;
  onSpotClose: () => void;
}

export default function CommentPanel({ loop, selectedSpot, onSpotClose }: CommentPanelProps) {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);

  const { data: comments } = useFirestore<Comment>('comments', {
    where: [
      ['targetId', '==', selectedSpot ? selectedSpot.id : loop.id],
      ['type', '==', selectedSpot ? 'spot' : 'loop']
    ],
    orderBy: [['createdAt', 'asc']]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await createComment({
        type: selectedSpot ? 'spot' : 'loop',
        targetId: selectedSpot ? selectedSpot.id : loop.id,
        content: newComment.trim(),
        attachments
      });

      setNewComment('');
      setAttachments([]);
    } catch (error) {
      console.error('Error creating comment:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  return (
    <>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-900">
            {selectedSpot ? `Spot #${selectedSpot.number}` : 'Loop Comments'}
          </h3>
          {selectedSpot && (
            <button
              onClick={onSpotClose}
              className="p-1 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Comments list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {comments?.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No comments yet</p>
          </div>
        ) : (
          comments?.map((comment) => (
            <div
              key={comment.id}
              className={`flex space-x-3 ${
                comment.createdBy === user?.uid ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0" />
              <div
                className={`flex-1 rounded-lg p-3 ${
                  comment.createdBy === user?.uid
                    ? 'bg-blue-50'
                    : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">
                    {comment.createdBy === user?.uid ? 'You' : 'Team Member'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(comment.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                <p className="text-gray-700">{comment.content}</p>
                {comment.attachments?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {comment.attachments.map((url, i) => (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-16 h-16 rounded-lg bg-gray-100 overflow-hidden"
                      >
                        <img
                          src={url}
                          alt={`Attachment ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Comment input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
        {attachments.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {attachments.map((file, i) => (
              <div
                key={i}
                className="relative group w-16 h-16 rounded-lg bg-gray-100 overflow-hidden"
              >
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Attachment ${i + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setAttachments(prev => prev.filter((_, index) => index !== i))}
                  className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex items-end space-x-2">
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none"
              rows={1}
              style={{ minHeight: '2.5rem' }}
            />
          </div>
          <div className="flex space-x-2">
            <label className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer">
              <input
                type="file"
                className="hidden"
                multiple
                accept="image/*"
                onChange={handleFileChange}
              />
              <Paperclip className="w-5 h-5 text-gray-500" />
            </label>
            <button
              type="submit"
              disabled={!newComment.trim()}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </form>
    </>
  );
}