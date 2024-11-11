import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Eye } from 'lucide-react';
import { Loop } from '../../types';
import { formatDate } from '../../utils/formatDate';

interface LoopCardProps {
  loop: Loop;
}

export default function LoopCard({ loop }: LoopCardProps) {
  const navigate = useNavigate();

  const getPreviewImage = () => {
    if (!loop || !loop.content) return null;
    
    switch (loop.type) {
      case 'url':
        return loop.screenshot || loop.content;
      case 'image':
        return loop.content;
      case 'pdf':
        return loop.pdfPages && loop.pdfPages.length > 0 
          ? loop.pdfPages[0] 
          : 'https://images.unsplash.com/photo-1497493292307-31c376b6e479?auto=format&fit=crop&w=800&q=80';
      default:
        return null;
    }
  };

  const handleClick = () => {
    if (!loop?.id) return;
    navigate(`/loops/${loop.id}`);
  };

  if (!loop) {
    return null;
  }

  return (
    <div 
      onClick={handleClick}
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
            {formatDate(loop.createdAt)}
          </time>
        </div>
      </div>
    </div>
  );
}