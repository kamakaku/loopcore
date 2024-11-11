import React, { useState } from 'react';
import { Users, Building2, Plus, Trash2 } from 'lucide-react';
import { Project, Team, User } from '../../types';
import { removeProjectMember } from '../../lib/projects';
import Avatar from '../common/Avatar';

interface ProjectSidebarProps {
  project: Project;
  team: Team | undefined;
  members: User[];
  isOwner: boolean;
  onAddMembers: () => void;
  onAddTeam: () => void;
  onRemoveTeam: () => void;
}

export default function ProjectSidebar({ 
  project, 
  team, 
  members, 
  isOwner,
  onAddMembers,
  onAddTeam,
  onRemoveTeam
}: ProjectSidebarProps) {
  const [activeTab, setActiveTab] = useState<'team' | 'members'>('team');

  const handleRemoveMember = async (userId: string) => {
    if (!window.confirm('Are you sure you want to remove this member from the project? This action cannot be undone.')) {
      return;
    }

    try {
      await removeProjectMember(project.id, userId);
    } catch (error) {
      console.error('Error removing project member:', error);
    }
  };

  return (
    <div className="w-80 flex-shrink-0">
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('team')}
              className={`flex-1 px-4 py-3 text-sm font-medium ${
                activeTab === 'team'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Team
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`flex-1 px-4 py-3 text-sm font-medium ${
                activeTab === 'members'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Members
            </button>
          </div>
        </div>

        {activeTab === 'team' ? (
          <div>
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Team</h2>
                {isOwner && !team && (
                  <button
                    onClick={onAddTeam}
                    className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add</span>
                  </button>
                )}
              </div>
            </div>

            {team ? (
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-gray-500" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{team.name}</h3>
                      {team.description && (
                        <p className="text-sm text-gray-500">{team.description}</p>
                      )}
                    </div>
                  </div>
                  {isOwner && (
                    <button
                      onClick={onRemoveTeam}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      title="Remove team"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center">
                <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No team assigned</p>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Members</h2>
                {isOwner && (
                  <button
                    onClick={onAddMembers}
                    className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add</span>
                  </button>
                )}
              </div>
            </div>

            <div className="divide-y divide-gray-200">
              {members.map((member) => (
                <div key={member.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar 
                        src={member.photoURL || null}
                        alt={member.name || 'Project Member'}
                        size="sm"
                      />
                      <div>
                        <div className="font-medium text-gray-900">
                          {member.name}
                          {member.id === project.createdBy && (
                            <span className="ml-2 text-xs text-gray-500">(Owner)</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">{member.email}</div>
                      </div>
                    </div>
                    {isOwner && member.id !== project.createdBy && (
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Remove member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {members.length === 0 && (
                <div className="p-8 text-center">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No members yet</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}