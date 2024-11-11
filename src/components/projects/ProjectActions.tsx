import React, { useState } from 'react';
import { Users, FileText, Building2 } from 'lucide-react';
import MemberInvite from './MemberInvite';
import LoopSelector from '../shared/LoopSelector';
import TeamSelector from '../shared/TeamSelector';

interface ProjectActionsProps {
  projectId: string;
  hasTeam: boolean;
  isOwner: boolean;
  onTeamAdded: () => void;
}

export default function ProjectActions({ projectId, hasTeam, isOwner, onTeamAdded }: ProjectActionsProps) {
  const [showMemberInvite, setShowMemberInvite] = useState(false);
  const [showLoopSelector, setShowLoopSelector] = useState(false);
  const [showTeamSelector, setShowTeamSelector] = useState(false);

  const actionButtons = [
    {
      label: 'Add Members',
      icon: <Users className="w-4 h-4" />,
      onClick: () => setShowMemberInvite(true),
      show: true
    },
    {
      label: 'Add Loops',
      icon: <FileText className="w-4 h-4" />,
      onClick: () => setShowLoopSelector(true),
      show: true
    },
    {
      label: hasTeam ? 'Change Team' : 'Add Team',
      icon: <Building2 className="w-4 h-4" />,
      onClick: () => setShowTeamSelector(true),
      show: isOwner
    }
  ].filter(button => button.show);

  return (
    <>
      <div className="flex flex-wrap gap-3 mb-6">
        {actionButtons.map((button, index) => (
          <button
            key={index}
            onClick={button.onClick}
            className="inline-flex items-center space-x-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg transition-colors shadow-sm hover:bg-blue-700 hover:shadow"
          >
            {button.icon}
            <span>{button.label}</span>
          </button>
        ))}
      </div>

      {showLoopSelector && (
        <LoopSelector
          projectId={projectId}
          onClose={() => setShowLoopSelector(false)}
          onLoopsAdded={() => setShowLoopSelector(false)}
        />
      )}

      {showTeamSelector && (
        <TeamSelector
          projectId={projectId}
          onClose={() => setShowTeamSelector(false)}
          onTeamSelected={() => {
            setShowTeamSelector(false);
            onTeamAdded();
          }}
        />
      )}

      {showMemberInvite && (
        <MemberInvite
          projectId={projectId}
          onClose={() => setShowMemberInvite(false)}
          onMembersAdded={() => setShowMemberInvite(false)}
        />
      )}
    </>
  );
}