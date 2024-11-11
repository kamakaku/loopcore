import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreVertical, Users, FolderKanban, Archive, Trash2, Edit } from 'lucide-react';
import { updateLoop, deleteLoop } from '../../lib/firebase';
import { Loop } from '../../types';
import TeamSelector from '../shared/TeamSelector';
import ProjectSelector from '../shared/ProjectSelector';
import { useAuth } from '../../contexts/AuthContext';
import { canManageLoop } from '../../hooks/useUserRole';

interface LoopActionsProps {
  loop: Loop;
  onUpdate?: () => void;
  userRole?: string;
}

export default function LoopActions({ loop, onUpdate, userRole = 'viewer' }: LoopActionsProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [showTeamSelect, setShowTeamSelect] = useState(false);
  const [showProjectSelect, setShowProjectSelect] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!user || !canManageLoop(userRole as any, loop.createdBy, user.uid)) {
    return null;
  }

  const handleStatusChange = async (status: 'active' | 'archived') => {
    if (loading) return;
    setLoading(true);
    
    try {
      await updateLoop(loop.id, { status });
      onUpdate?.();
      setShowMenu(false);
    } catch (error) {
      console.error('Error updating loop status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (loading || !window.confirm('Are you sure you want to delete this loop? This action cannot be undone.')) return;
    setLoading(true);
    
    try {
      await deleteLoop(loop.id);
      navigate('/');
    } catch (error) {
      console.error('Error deleting loop:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="p-1 hover:bg-gray-100 rounded"
      >
        <MoreVertical className="w-3 h-3" />
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
            <button
              onClick={() => {
                setShowTeamSelect(true);
                setShowMenu(false);
              }}
              className="w-full flex items-center px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              <Users className="w-3 h-3 mr-2" />
              {loop.teamId ? 'Change Team' : 'Add to Team'}
            </button>

            {loop.teamId && (
              <button
                onClick={() => {
                  setShowProjectSelect(true);
                  setShowMenu(false);
                }}
                className="w-full flex items-center px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
                disabled={loading}
              >
                <FolderKanban className="w-3 h-3 mr-2" />
                {loop.projectId ? 'Change Project' : 'Add to Project'}
              </button>
            )}

            <button
              onClick={() => handleStatusChange(loop.status === 'active' ? 'archived' : 'active')}
              className="w-full flex items-center px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              <Archive className="w-3 h-3 mr-2" />
              {loop.status === 'active' ? 'Archive Loop' : 'Activate Loop'}
            </button>

            <button
              onClick={handleDelete}
              className="w-full flex items-center px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
              disabled={loading}
            >
              <Trash2 className="w-3 h-3 mr-2" />
              Delete Loop
            </button>
          </div>
        </>
      )}

      {showTeamSelect && (
        <TeamSelector
          loop={loop}
          onClose={() => setShowTeamSelect(false)}
          onTeamSelected={() => {
            setShowTeamSelect(false);
            onUpdate?.();
          }}
        />
      )}

      {showProjectSelect && loop.teamId && (
        <ProjectSelector
          loop={loop}
          teamId={loop.teamId}
          onClose={() => setShowProjectSelect(false)}
          onProjectSelected={() => {
            setShowProjectSelect(false);
            onUpdate?.();
          }}
        />
      )}
    </div>
  );
}