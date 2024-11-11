import React, { useState } from 'react';
import { MessageSquare, Reply, Eye } from 'lucide-react';
import { Loop, Spot } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { formatDate } from '../../utils/formatDate';
import SpotActions from '../spots/SpotActions';
import SpotEditor from '../spots/SpotEditor';
import CommentInput from './CommentInput';
import Avatar from '../common/Avatar';
import { useFirestore } from '../../hooks/useFirestore';
import { canAddComments, canEditSpots } from '../../hooks/useUserRole';

interface SpotListProps {
  loop: Loop;
  spots: Spot[];
  selectedSpot: Spot | null;
  onSpotSelect: (spot: Spot | null) => void;
  hoveredSpot: Spot | null;
  onSpotHover: (spot: Spot | null) => void;
  currentPage: number;
  onPageChange: (page: number) => void;
  userRole?: string;
}

export default function SpotList({ 
  loop, 
  spots = [], 
  selectedSpot, 
  onSpotSelect,
  hoveredSpot,
  onSpotHover,
  currentPage,
  onPageChange,
  userRole = 'viewer'
}: SpotListProps) {
  const { user } = useAuth();
  const [editingSpot, setEditingSpot] = useState<Spot | null>(null);
  const [replyingToSpot, setReplyingToSpot] = useState<string | null>(null);

  // Only query comments if we have spots
  const { data: comments = [] } = useFirestore<Comment>('comments', spots.length > 0 ? {
    where: [
      ['targetType', '==', 'spot'],
      ['targetId', 'in', spots.map(s => s.id)]
    ],
    orderBy: [['createdAt', 'asc']]
  } : undefined);

  // Get user info for spots and comments
  const { data: users = [] } = useFirestore<any>('users', {
    where: spots.length > 0 ? [['__name__', 'in', [...new Set([
      ...spots.map(s => s.createdBy),
      ...comments.map(c => c.createdBy)
    ])]]] : undefined,
    limitTo: 10
  });

  const getUserData = (userId: string) => {
    return users.find(u => u.id === userId);
  };

  if (spots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <Eye className="w-12 h-12 text-gray-400 mb-4" />
        <p className="text-gray-500 text-center">No spots added yet</p>
        {userRole !== 'viewer' && (
          <p className="text-sm text-gray-400 mt-2 text-center">
            Click the "Add" button to create your first spot
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="divide-y divide-gray-200">
        {spots.map((spot) => {
          const isSelected = selectedSpot?.id === spot.id;
          const isHovered = hoveredSpot?.id === spot.id;
          const spotComments = comments.filter(c => c.targetId === spot.id);
          const spotCreator = getUserData(spot.createdBy);
          const canEdit = user && canEditSpots(userRole as any, spot.createdBy, user.uid);

          return (
            <div
              key={spot.id}
              className={`p-4 transition-colors cursor-pointer ${
                isSelected
                  ? 'bg-blue-50'
                  : isHovered
                  ? 'bg-gray-50'
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => onSpotSelect(spot)}
              onMouseEnter={() => onSpotHover(spot)}
              onMouseLeave={() => onSpotHover(null)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 font-medium text-sm">
                      {spot.number}
                    </div>
                    <Avatar 
                      src={spotCreator?.photoURL || null}
                      alt={spotCreator?.name || 'User'}
                      size="sm"
                    />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {spot.createdBy === user?.uid ? 'You' : spotCreator?.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDate(spot.createdAt)}
                    </div>
                  </div>
                </div>
                {canEdit && (
                  <SpotActions
                    spot={spot}
                    loopId={loop.id}
                    onEdit={() => setEditingSpot(spot)}
                    onDelete={() => {
                      if (selectedSpot?.id === spot.id) {
                        onSpotSelect(null);
                      }
                    }}
                    userRole={userRole}
                  />
                )}
              </div>

              <div className="ml-11">
                <p className="text-sm text-gray-600 mb-2">{spot.content}</p>
                
                {canAddComments(userRole as any) && (
                  <div className="flex items-center space-x-4 mt-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setReplyingToSpot(spot.id);
                      }}
                      className="flex items-center space-x-1 text-xs text-gray-500 hover:text-gray-700"
                    >
                      <Reply className="w-3 h-3" />
                      <span>Reply</span>
                    </button>
                    {spotComments.length > 0 && (
                      <span className="flex items-center space-x-1 text-xs text-gray-500">
                        <MessageSquare className="w-3 h-3" />
                        <span>{spotComments.length} {spotComments.length === 1 ? 'reply' : 'replies'}</span>
                      </span>
                    )}
                  </div>
                )}

                {spotComments.length > 0 && (
                  <div className="mt-3 space-y-3">
                    {spotComments.map(comment => {
                      const commentUser = getUserData(comment.createdBy);
                      return (
                        <div 
                          key={comment.id} 
                          className="bg-white rounded-lg p-3 shadow-sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center space-x-2">
                            <Avatar 
                              src={commentUser?.photoURL || null}
                              alt={commentUser?.name || 'User'}
                              size="sm"
                            />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {comment.createdBy === user?.uid ? 'You' : commentUser?.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {formatDate(comment.createdAt)}
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 ml-10 mt-1">{comment.content}</p>
                        </div>
                      );
                    })}
                  </div>
                )}

                {replyingToSpot === spot.id && (
                  <div className="mt-3" onClick={(e) => e.stopPropagation()}>
                    <CommentInput
                      targetId={spot.id}
                      targetType="spot"
                      onSubmitted={() => setReplyingToSpot(null)}
                      autoFocus
                      placeholder="Write a reply..."
                      userRole={userRole}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {editingSpot && (
        <SpotEditor
          spot={editingSpot}
          onClose={() => setEditingSpot(null)}
          onUpdated={() => setEditingSpot(null)}
        />
      )}
    </div>
  );
}