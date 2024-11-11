import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { createProject } from '../../lib/projects';
import { useAuth } from '../../contexts/AuthContext';
import { useSubscription } from '../../hooks/useSubscription';
import { useFirestore } from '../../hooks/useFirestore';
import Layout from '../layout/Layout';

export default function ProjectCreator() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { data: projects = [] } = useFirestore('projects', {
    where: [['createdBy', '==', user?.uid]]
  });

  const { checkProjectLimit, plan } = useSubscription();
  const canCreateProject = checkProjectLimit(projects.length);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCreateProject) {
      setError('Project limit reached for your current plan');
      return;
    }

    if (!name.trim() || loading) return;

    setLoading(true);
    setError('');

    try {
      const project = await createProject({
        name: name.trim(),
        description: description.trim()
      });
      navigate(`/projects/${project.id}`);
    } catch (err) {
      console.error('Error creating project:', err);
      setError(err instanceof Error ? err.message : 'Failed to create project');
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={() => navigate('/projects')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Create New Project</h1>
        </div>

        {!canCreateProject && (
          <div className="mb-6 p-4 bg-yellow-50 rounded-lg flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Project Limit Reached</h3>
              <p className="text-sm text-yellow-700 mt-1">
                You've reached the project limit ({plan.limits.projects}) for your current plan.
                Please upgrade to create more projects.
              </p>
              <button
                onClick={() => navigate('/settings/billing')}
                className="mt-2 text-sm font-medium text-yellow-800 hover:text-yellow-900"
              >
                Upgrade Plan →
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Project Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                required
                disabled={loading || !canCreateProject}
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none"
                disabled={loading || !canCreateProject}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/projects')}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !name.trim() || !canCreateProject}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                )}
                <span>{loading ? 'Creating...' : 'Create Project'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}