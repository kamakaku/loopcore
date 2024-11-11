import React, { useState } from 'react';
import { MoreVertical, Edit, CheckCircle, Trash2 } from 'lucide-react';
import { Spot } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { updateSpot, deleteSpot } from '../../lib/firebase';

interface SpotActionsProps {
  spot: Spot;
  loopId: string;
  onEdit: () => void;
  onDelete: () => void;
  userRole?: string;
}

export default function SpotActions({ 
  spot, 
  loopId, 
  onEdit, 
  onDelete,
  userRole = 'viewer'
}: SpotActionsProps) {
  const { user } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(false);

  const canModify = ['owner', 'editor'].includes(userRole);

  const handleCheck = async () => {
    if (loading || !canModify) return;
    setLoading(true);
    
    try {
      await updateSpot(spot.id, {
        status: spot.status === 'resolved' ? 'open' : 'resolved'
      });
      setShowMenu(false);
    } catch (error) {
      console.error('Error updating spot status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (loading || !canModify || !window.confirm('Are you sure you want to delete this spot? This action cannot be undone.')) return;
    setLoading(true);

    try {
      await deleteSpot(spot.id, loopId);
      onDelete();
      setShowMenu(false);
    } catch (error) {
      console.error('Error deleting spot:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!canModify) return null;

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowMenu(!showMenu);
        }}
        className="p-1 hover:bg-gray-100 rounded"
      >
        <MoreVertical className="w-4 h-4 text-gray-400" />
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(false);
            }}
          />
          <div className="absolute right-0 mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
            <button
              onClick={(e) => {
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
                e.stopPropagation();
                handleCheck();
              }}
              className={`w-full flex items-center px-3 py-1.5 hover:bg-gray-50 text-sm ${
                spot.status === 'resolved' ? 'text-green-600' : 'text-gray-600'
              }`}
              disabled={loading}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              <span>{spot.status === 'resolved' ? 'Uncheck' : 'Check'}</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              className="w-full flex items-center px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
              disabled={loading}
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