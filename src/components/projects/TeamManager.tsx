import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Project, Team } from '../../types';
import { useFirestore } from '../../hooks/useFirestore';
import { updateProject } from '../../lib/projects';
import { useAuth } from '../../contexts/AuthContext';

interface TeamManagerProps {
  project: Project;
  onClose: () => void;
  onUpdated: () => void;
}

export default function TeamManager({ project, onClose, onUpdated }: TeamManagerProps) {
  const { user } = useAuth();
  const [selectedTeamId, setSelectedTeamId] = useState(project.teamId || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { data: teams = [] } = useFirestore<Team>('teams', {
    where: [['members', 'array-contains', user?.uid]],
    orderBy: [['name', 'asc']]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || selectedTeamId === project.teamId) return;

    setLoading(true);
    setError('');

    try {
      await updateProject(project.id, {
        teamId: selectedTeamId || null
      });
      onUpdated();
    } catch (err) {
      console.error('Error updating team:', err);
      setError(err instanceof Error ? err.message : 'Failed to update team');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Manage Team</h2>
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="team" className="block text-sm font-medium text-gray-700 mb-1">
              Select Team
            </label>
            <select
              id="team"
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              disabled={loading}
            >
              <option value="">No team</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || selectedTeamId === project.teamId}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              )}
              <span>{loading ? 'Updating...' : 'Update Team'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}