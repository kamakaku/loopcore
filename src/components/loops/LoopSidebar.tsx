import React, { useState } from 'react';
import { Users, Building2, FolderKanban } from 'lucide-react';
import { Loop, Team, Project, User, Spot } from '../../types';
import SpotList from './SpotList';
import CommentList from './CommentList';
import Avatar from '../common/Avatar';

interface LoopSidebarProps {
  loop: Loop;
  team?: Team;
  project?: Project;
  members: User[];
  selectedSpot: Spot | null;
  onSpotClose: () => void;
  isOwner: boolean;
}

export default function LoopSidebar({
  loop,
  team,
  project,
  members,
  selectedSpot,
  onSpotClose,
  isOwner
}: LoopSidebarProps) {
  const [activeTab, setActiveTab] = useState<'spots' | 'comments'>('spots');

  return (
    <div className="w-96 flex-shrink-0">
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('spots')}
              className={`flex-1 px-4 py-3 text-sm font-medium ${
                activeTab === 'spots'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Spots
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`flex-1 px-4 py-3 text-sm font-medium ${
                activeTab === 'comments'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Comments
            </button>
          </div>
        </div>

        {activeTab === 'spots' ? (
          <SpotList
            loop={loop}
            spots={[]}
            selectedSpot={selectedSpot}
            onSpotSelect={() => {}}
            hoveredSpot={null}
            onSpotHover={() => {}}
            currentPage={0}
            onPageChange={() => {}}
            userRole={isOwner ? 'owner' : 'viewer'}
          />
        ) : (
          <CommentList
            loop={loop}
            selectedSpot={selectedSpot}
            userRole={isOwner ? 'owner' : 'viewer'}
          />
        )}

        <div className="border-t border-gray-200">
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Details</h3>
            
            {team && (
              <div className="mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Building2 className="w-4 h-4" />
                  <span>Team</span>
                </div>
                <div className="mt-2 flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-gray-400" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">{team.name}</span>
                </div>
              </div>
            )}

            {project && (
              <div className="mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <FolderKanban className="w-4 h-4" />
                  <span>Project</span>
                </div>
                <div className="mt-2 flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <FolderKanban className="w-5 h-5 text-gray-400" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">{project.name}</span>
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Users className="w-4 h-4" />
                <span>Members</span>
              </div>
              <div className="mt-2 space-y-2">
                {members.map(member => (
                  <div key={member.id} className="flex items-center space-x-3">
                    <Avatar
                      src={member.photoURL || null}
                      alt={member.name || 'Member'}
                      size="sm"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {member.name}
                        {member.id === loop.createdBy && (
                          <span className="ml-2 text-xs text-gray-500">(Owner)</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">{member.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}