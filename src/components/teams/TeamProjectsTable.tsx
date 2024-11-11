import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Project } from '../../types';
import { formatDate } from '../../utils/formatDate';
import { Users, Trash2 } from 'lucide-react';

interface TeamProjectsTableProps {
  projects: Project[];
  loading?: boolean;
  onViewProject: (id: string) => void;
  onDeleteProject?: (id: string) => void;
}

export default function TeamProjectsTable({ projects, loading, onViewProject, onDeleteProject }: TeamProjectsTableProps) {
  if (loading) {
    return (
      <div className="animate-pulse p-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded mb-2"></div>
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No projects added to this team yet</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Members
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {projects.map((project) => (
            <tr key={project.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <button
                  onClick={() => onViewProject(project.id)}
                  className="text-sm font-medium text-gray-900 hover:text-blue-600"
                >
                  <div className="max-w-xs truncate">{project.name}</div>
                </button>
                {project.description && (
                  <p className="text-sm text-gray-500 max-w-xs truncate">
                    {project.description}
                  </p>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(project.createdAt)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500">{project.members.length}</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  project.status === 'active'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {project.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                <div className="flex items-center justify-end space-x-2">
                  <button
                    onClick={() => onViewProject(project.id)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    View
                  </button>
                  {onDeleteProject && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteProject(project.id);
                      }}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}