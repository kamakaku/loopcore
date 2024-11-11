import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Loop, Project } from '../../types';
import { deleteLoop } from '../../lib/loops';
import { deleteProject } from '../../lib/projects';
import TeamLoopsTable from './TeamLoopsTable';
import TeamProjectsTable from './TeamProjectsTable';

interface TeamMainContentProps {
  activeTab: 'loops' | 'projects';
  onTabChange: (tab: 'loops' | 'projects') => void;
  loops: Loop[];
  projects: Project[];
  loopsLoading: boolean;
  projectsLoading: boolean;
  onViewLoop: (id: string) => void;
  onViewProject: (id: string) => void;
  isOwner: boolean;
}

export default function TeamMainContent({
  activeTab,
  onTabChange,
  loops,
  projects,
  loopsLoading,
  projectsLoading,
  onViewLoop,
  onViewProject,
  isOwner
}: TeamMainContentProps) {
  const handleDeleteLoop = async (loopId: string) => {
    if (!window.confirm('Are you sure you want to remove this loop from the team? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteLoop(loopId);
    } catch (error) {
      console.error('Error deleting loop:', error);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!window.confirm('Are you sure you want to remove this project from the team? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteProject(projectId);
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  return (
    <div className="flex-1">
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => onTabChange('loops')}
              className={`flex-1 px-4 py-3 text-sm font-medium ${
                activeTab === 'loops'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Team Loops
            </button>
            <button
              onClick={() => onTabChange('projects')}
              className={`flex-1 px-4 py-3 text-sm font-medium ${
                activeTab === 'projects'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Team Projects
            </button>
          </div>
        </div>

        <div>
          {activeTab === 'loops' ? (
            <TeamLoopsTable
              loops={loops}
              loading={loopsLoading}
              onViewLoop={onViewLoop}
              onDeleteLoop={isOwner ? handleDeleteLoop : undefined}
            />
          ) : (
            <TeamProjectsTable
              projects={projects}
              loading={projectsLoading}
              onViewProject={onViewProject}
              onDeleteProject={isOwner ? handleDeleteProject : undefined}
            />
          )}
        </div>
      </div>
    </div>
  );
}