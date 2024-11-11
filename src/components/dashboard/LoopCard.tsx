import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Loop } from '../../types';

interface LoopCardProps {
  loop: Loop;
}

export default function LoopCard({ loop }: LoopCardProps) {
  const navigate = useNavigate();

  const getPreviewImage = () => {
    if (!loop.content) return null;
    
    switch (loop.type) {
      case 'url':
        return loop.screenshot || loop.content;
      case 'image':
        return loop.content;
      case 'pdf':
        return 'https://images.unsplash.com/photo-1497493292307-31c376b6e479?auto=format&fit=crop&w=800&q=80';
      default:
        return null;
    }
  };

  const getTimeAgo = () => {
    if (!loop.createdAt) return '';
    
    try {
      const date = typeof loop.createdAt === 'object' && 'toDate' in loop.createdAt 
        ? loop.createdAt.toDate() 
        : new Date(loop.createdAt);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  return (
    <div 
      onClick={() => navigate(`/loops/${loop.id}`)}
      className="group cursor-pointer bg-white rounded-lg shadow hover:shadow-lg transition-all duration-200 overflow-hidden"
    >
      <div className="aspect-video relative overflow-hidden bg-gray-100">
        {getPreviewImage() ? (
          <img
            src={getPreviewImage()!}
            alt={loop.title || 'Loop preview'}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No preview available
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      </div>
      
      <div className="p-4">
        <h3 className="font-medium text-gray-900 mb-2 truncate group-hover:text-blue-600 transition-colors">
          {loop.title || 'Untitled Loop'}
        </h3>
        
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <Eye className="w-4 h-4 mr-1" />
              {loop.spotCount || 0}
            </span>
            <span className="flex items-center">
              <MessageSquare className="w-4 h-4 mr-1" />
              {loop.commentCount || 0}
            </span>
          </div>
          
          <time dateTime={loop.createdAt?.toString()} className="text-xs">
            {getTimeAgo()}
          </time>
        </div>
      </div>
    </div>
  );
}