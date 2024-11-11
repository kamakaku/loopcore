import React from 'react';
import { Users, Building2, Trash2 } from 'lucide-react';
import { Team, User } from '../../types';
import { removeTeamMember } from '../../lib/teams';
import Avatar from '../common/Avatar';

// ... Rest of the imports

export default function TeamSidebar({ 
  team, 
  members, 
  isOwner,
  onAddMembers,
  onAddTeam,
  onRemoveTeam
}: TeamSidebarProps) {
  // ... Rest of the component logic

  return (
    <div className="w-80 flex-shrink-0">
      {/* ... Rest of the component structure */}
      <div className="divide-y divide-gray-200">
        {members.map((member) => (
          <div key={member.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar 
                  src={member.photoURL || null}
                  alt={member.name || 'Team Member'}
                  size="sm"
                />
                <div>
                  <div className="font-medium text-gray-900">
                    {member.name}
                    {member.id === team.createdBy && (
                      <span className="ml-2 text-xs text-gray-500">(Owner)</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">{member.email}</div>
                </div>
              </div>
              {/* ... Rest of member actions */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}