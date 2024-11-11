import React, { useEffect, useRef } from 'react';
import { MessageSquare, Reply, Eye } from 'lucide-react';
import { Loop, Spot } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { formatDate } from '../../utils/formatDate';
import SpotActions from './SpotActions';
import SpotEditor from './SpotEditor';
import CommentInput from '../loops/CommentInput';
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
  const [editingSpot, setEditingSpot] = React.useState<Spot | null>(null);
  const [replyingToSpot, setReplyingToSpot] = React.useState<string | null>(null);
  const spotRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Get comments for spots
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

  // Scroll to selected spot in the list
  useEffect(() => {
    if (selectedSpot && spotRefs.current[selectedSpot.id]) {
      spotRefs.current[selectedSpot.id]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [selectedSpot]);

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
            ref={el => spotRefs.current[spot.id] = el}
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
            {/* ... rest of the spot content remains the same ... */}
          </div>
        );
      })}

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