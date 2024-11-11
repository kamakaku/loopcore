import React, { useState } from 'react';
import { MoreVertical, Edit, Trash2 } from 'lucide-react';

interface CommentActionsProps {
  onEdit: () => void;
  onDelete: () => void;
}

export default function CommentActions({ onEdit, onDelete }: CommentActionsProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowMenu(!showMenu);
        }}
        className="p-1 hover:bg-gray-100 rounded-full"
      >
        <MoreVertical className="w-4 h-4 text-gray-400" />
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowMenu(false);
            }}
          />
          <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onEdit();
                setShowMenu(false);
              }}
              className="w-full flex items-center px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete();
                setShowMenu(false);
              }}
              className="w-full flex items-center px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}