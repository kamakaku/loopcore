import React, { useState } from 'react';
import { MoreVertical, Edit, Archive, Trash2, Users } from 'lucide-react';

interface TableActionsProps {
  onEdit?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
  onManageMembers?: () => void;
  isArchived?: boolean;
}

export default function TableActions({
  onEdit,
  onArchive,
  onDelete,
  onManageMembers,
  isArchived
}: TableActionsProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowMenu(!showMenu);
        }}
        className="p-1 hover:bg-gray-100 rounded-lg"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                  setShowMenu(false);
                }}
                className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </button>
            )}

            {onManageMembers && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onManageMembers();
                  setShowMenu(false);
                }}
                className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Users className="w-4 h-4 mr-2" />
                Manage Members
              </button>
            )}

            {onArchive && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onArchive();
                  setShowMenu(false);
                }}
                className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Archive className="w-4 h-4 mr-2" />
                {isArchived ? 'Unarchive' : 'Archive'}
              </button>
            )}

            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                  setShowMenu(false);
                }}
                className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}