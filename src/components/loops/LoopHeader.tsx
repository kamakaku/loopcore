import React from 'react';
import { ArrowLeft, Users, Building2, FolderKanban } from 'lucide-react';
import { Loop, Team, Project, User } from '../../types';
import { formatDate } from '../../utils/formatDate';
import Avatar from '../common/Avatar';

interface LoopHeaderProps {
  loop: Loop;
  team?: Team;
  project?: Project;
  members: User[];
  onBack: () => void;
  onManageMembers?: () => void;
}

export default function LoopHeader({ 
  loop, 
  team, 
  project, 
  members,
  onBack, 
  onManageMembers 
}: LoopHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <button
              onClick={onBack}
              className="p-1 hover:bg-gray-100 rounded mt-1"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            
            <div>
              <h1 className="text-xl font-bold text-gray-900">{loop.title}</h1>
              {loop.description && (
                <p className="text-sm text-gray-600 mt-1 max-w-2xl">{loop.description}</p>
              )}
              
              <div className="flex flex-wrap items-center gap-4 mt-3">
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="w-4 h-4 mr-1" />
                  <span>{members.length} members</span>
                </div>

                {team && (
                  <div className="flex items-center text-sm text-gray-500">
                    <Building2 className="w-4 h-4 mr-1" />
                    <span>{team.name}</span>
                  </div>
                )}

                {project && (
                  <div className="flex items-center text-sm text-gray-500">
                    <FolderKanban className="w-4 h-4 mr-1" />
                    <span>{project.name}</span>
                  </div>
                )}

                <span className="text-sm text-gray-500">
                  Created {formatDate(loop.createdAt)}
                </span>
              </div>

              {members.length > 0 && (
                <div className="flex items-center mt-3 -space-x-2">
                  {members.slice(0, 5).map((member) => (
                    <Avatar
                      key={member.id}
                      src={member.photoURL || null}
                      alt={member.name || 'Team Member'}
                      size="sm"
                      className="border-2 border-white rounded-full"
                    />
                  ))}
                  {members.length > 5 && (
                    <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full border-2 border-white">
                      <span className="text-xs text-gray-600">+{members.length - 5}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}