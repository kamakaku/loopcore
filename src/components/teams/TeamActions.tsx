import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Team } from '../../types';
import LoopSelector from '../shared/LoopSelector';
import MemberInvite from './MemberInvite';
import ProjectSelector from '../shared/ProjectSelector';
import { updateTeam } from '../../lib/teams';

interface TeamActionsProps {
  teamId: string;
  isOwner: boolean;
  onUpdate: () => void;
}

export default function TeamActions({ teamId, isOwner, onUpdate }: TeamActionsProps) {
  const [showLoopSelector, setShowLoopSelector] = useState(false);
  const [showMemberInvite, setShowMemberInvite] = useState(false);
  const [showProjectSelector, setShowProjectSelector] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!teamId) {
    return null;
  }

  const handleLoopsSelected = async (selectedLoopIds: string[]) => {
    if (!teamId || loading) return;
    
    setLoading(true);
    try {
      await updateTeam(teamId, { 
        loops: selectedLoopIds 
      });
      onUpdate();
      setShowLoopSelector(false);
    } catch (error) {
      console.error('Error adding loops:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMembersAdded = () => {
    setShowMemberInvite(false);
    onUpdate();
  };

  const handleProjectsSelected = async (projectIds: string[]) => {
    if (!teamId || loading) return;

    setLoading(true);
    try {
      await updateTeam(teamId, { 
        projects: projectIds 
      });
      onUpdate();
      setShowProjectSelector(false);
    } catch (error) {
      console.error('Error adding projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const buttonClasses = `
    inline-flex items-center space-x-2 px-4 py-2 
    bg-blue-600 text-white rounded-lg 
    hover:bg-blue-700 hover:shadow-md
    active:bg-blue-800 active:scale-95
    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none
    transform transition-all duration-200 ease-in-out
  `;

  return (
    <>
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={() => setShowLoopSelector(true)}
          disabled={loading}
          className={buttonClasses}
        >
          <Plus className="w-4 h-4" />
          <span>Add Loops</span>
        </button>

        {isOwner && (
          <>
            <button
              onClick={() => setShowMemberInvite(true)}
              disabled={loading}
              className={buttonClasses}
            >
              <Plus className="w-4 h-4" />
              <span>Add Members</span>
            </button>

            <button
              onClick={() => setShowProjectSelector(true)}
              disabled={loading}
              className={buttonClasses}
            >
              <Plus className="w-4 h-4" />
              <span>Add Projects</span>
            </button>
          </>
        )}
      </div>

      {showLoopSelector && (
        <LoopSelector
          teamId={teamId}
          onClose={() => setShowLoopSelector(false)}
          onSelect={handleLoopsSelected}
        />
      )}

      {showMemberInvite && (
        <MemberInvite
          teamId={teamId}
          currentMembers={[]}
          onClose={() => setShowMemberInvite(false)}
          onMembersAdded={handleMembersAdded}
        />
      )}

      {showProjectSelector && (
        <ProjectSelector
          teamId={teamId}
          currentProjects={[]}
          onClose={() => setShowProjectSelector(false)}
          onProjectsAdded={() => {
            setShowProjectSelector(false);
            onUpdate();
          }}
        />
      )}
    </>
  );
}