import React from 'react';
import { FileText, MessageSquare } from 'lucide-react';
import { Loop, Comment } from '../../types';
import { formatDistanceToNow } from 'date-fns';
import { Timestamp } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';

interface RecentActivityProps {
  loops: Loop[];
  comments: Comment[];
  onLoopClick: (id: string) => void;
}

export default function RecentActivity({ loops, comments, onLoopClick }: RecentActivityProps) {
  const { t } = useTranslation();

  const getDate = (timestamp: Date | Timestamp | any): Date => {
    if (timestamp instanceof Date) return timestamp;
    if (timestamp instanceof Timestamp) return timestamp.toDate();
    if (timestamp && typeof timestamp === 'object' && 'seconds' in timestamp) {
      return new Date(timestamp.seconds * 1000);
    }
    return new Date(timestamp);
  };

  const activities = [
    ...loops.map(loop => ({
      type: 'loop' as const,
      id: loop.id,
      title: loop.title,
      date: getDate(loop.createdAt),
      data: loop
    })),
    ...comments.map(comment => ({
      type: 'comment' as const,
      id: comment.id,
      title: comment.content,
      targetId: comment.targetId,
      date: getDate(comment.createdAt),
      data: comment
    }))
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 5);

  if (activities.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">{t('dashboard.activity.noActivity')}</p>
      </div>
    );
  }

  const formatTimeAgo = (date: Date) => {
    try {
      return t('dashboard.activity.timeAgo', {
        time: formatDistanceToNow(date)
      });
    } catch (error) {
      console.error('Error formatting date:', error, date);
      return t('dashboard.activity.timeAgo', { time: 'recently' });
    }
  };

  return (
    <div className="divide-y divide-gray-200">
      {activities.map((activity) => (
        <div
          key={`${activity.type}-${activity.id}`}
          className="p-4 cursor-pointer hover:bg-gray-50"
          onClick={() => {
            if (activity.type === 'loop') {
              onLoopClick(activity.id);
            } else {
              onLoopClick(activity.targetId);
            }
          }}
        >
          <div className="flex items-start space-x-3">
            <div className={`p-2 rounded-lg ${
              activity.type === 'loop' 
                ? 'bg-blue-100 text-blue-600'
                : 'bg-green-100 text-green-600'
            }`}>
              {activity.type === 'loop' ? (
                <FileText className="w-4 h-4" />
              ) : (
                <MessageSquare className="w-4 h-4" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">
                {activity.type === 'loop' 
                  ? t('dashboard.activity.createdLoop')
                  : t('dashboard.activity.addedComment')
                }
              </p>
              <p className="text-sm text-gray-500 truncate">
                {activity.title}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {formatTimeAgo(activity.date)}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}