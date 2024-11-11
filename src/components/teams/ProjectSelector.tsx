import React, { useState } from 'react';
import { X, Search, FolderKanban, Check } from 'lucide-react';
import { useFirestore } from '../../hooks/useFirestore';
import { Project } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { updateProject } from '../../lib/projects';

interface ProjectSelectorProps {
  teamId: string;
  currentProjects: string[];
  onClose: () => void;
  onProjectsAdded: () => void;
}

export default function ProjectSelector({ 
  teamId, 
  currentProjects, 
  onClose, 
  onProjectsAdded 
}: ProjectSelectorProps) {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { data: projects = [] } = useFirestore<Project>('projects', {
    where: [
      ['createdBy', '==', user?.uid],
      ['teamId', '==', null]
    ],
    orderBy: [['createdAt', 'desc']]
  });

  const availableProjects = projects.filter(project => 
    !currentProjects.includes(project.id) &&
    project.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleProjectSelect = (projectId: string) => {
    setSelectedProjects(prev =>
      prev.includes(projectId)
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const handleSubmit = async () => {
    if (loading || selectedProjects.length === 0) return;

    setLoading(true);
    setError('');

    try {
      await Promise.all(
        selectedProjects.map(projectId =>
          updateProject(projectId, { teamId })
        )
      );
      onProjectsAdded();
      onClose();
    } catch (err) {
      console.error('Error adding projects:', err);
      setError(err instanceof Error ? err.message : 'Failed to add projects');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Add Projects to Team</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              disabled={loading}
            />
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg h-[400px] overflow-y-auto mb-4">
          {availableProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <FolderKanban className="w-8 h-8 mb-2" />
              <p className="text-sm">No available projects found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {availableProjects.map(project => (
                <button
                  key={project.id}
                  onClick={() => handleProjectSelect(project.id)}
                  className={`w-full flex items-center p-4 hover:bg-gray-50 ${
                    selectedProjects.includes(project.id) ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                    <FolderKanban className="w-6 h-6 text-gray-400" />
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="text-sm font-medium text-gray-900">{project.name}</h4>
                    {project.description && (
                      <p className="text-xs text-gray-500">{project.description}</p>
                    )}
                  </div>
                  {selectedProjects.includes(project.id) && (
                    <Check className="w-4 h-4 text-blue-600 ml-2" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:text-gray-900"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || selectedProjects.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            )}
            <span>{loading ? 'Adding...' : 'Add Selected'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}