import React from 'react';
import { Plus, FolderKanban } from 'lucide-react';
import { useFirestore } from '../../hooks/useFirestore';
import { Project } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface ProjectListProps {
  selectedProject: Project | null;
  onSelectProject: (project: Project) => void;
}

export default function ProjectList({ selectedProject, onSelectProject }: ProjectListProps) {
  const { user } = useAuth();
  const { data: projects, loading } = useFirestore<Project>('projects', {
    where: [['teamMembers', 'array-contains', user?.uid]],
    orderBy: [['createdAt', 'desc']]
  });

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-white rounded-lg"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      <div className="grid gap-4">
        {projects.map((project) => (
          <button
            key={project.id}
            onClick={() => onSelectProject(project)}
            className={`w-full text-left p-6 rounded-lg transition-all ${
              selectedProject?.id === project.id
                ? 'bg-blue-50 border-2 border-blue-600'
                : 'bg-white border border-gray-200 hover:border-blue-600'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <FolderKanban className={`w-6 h-6 ${
                  selectedProject?.id === project.id ? 'text-blue-600' : 'text-gray-400'
                }`} />
                <div>
                  <h3 className="font-semibold text-gray-900">{project.name}</h3>
                  {project.description && (
                    <p className="mt-1 text-sm text-gray-500">{project.description}</p>
                  )}
                </div>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                project.status === 'active'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {project.status}
              </span>
            </div>
          </button>
        ))}

        {projects.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <FolderKanban className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
            <p className="text-gray-500">Create your first project to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}