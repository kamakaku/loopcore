import React, { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { createComment } from '../../lib/firebase';

interface CommentInputProps {
  targetId: string;
  targetType: 'loop' | 'spot';
  onSubmitted?: () => void;
  autoFocus?: boolean;
  placeholder?: string;
  userRole?: string;
}

export default function CommentInput({
  targetId,
  targetType,
  onSubmitted,
  autoFocus,
  placeholder,
  userRole = 'viewer'
}: CommentInputProps) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || loading || !['owner', 'editor'].includes(userRole)) return;

    setLoading(true);
    try {
      await createComment({
        targetId,
        targetType,
        content: content.trim()
      });
      setContent('');
      onSubmitted?.();
    } catch (error) {
      console.error('Error creating comment:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-resize textarea
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    setContent(textarea.value);
    
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  if (!['owner', 'editor'].includes(userRole)) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex items-end space-x-2 bg-gray-50 rounded-lg p-2">
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleInput}
            placeholder={placeholder || `Add a ${targetType === 'spot' ? 'spot' : 'loop'} comment...`}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm min-h-[36px]"
            style={{ maxHeight: '120px' }}
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          disabled={!content.trim() || loading}
          className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}