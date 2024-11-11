import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, UserPlus, Check } from 'lucide-react';
import { createTeam } from '../../lib/teams';
import { useAuth } from '../../contexts/AuthContext';
import { useFirestore } from '../../hooks/useFirestore';
import { User } from '../../types';
import Layout from '../layout/Layout';

export default function TeamCreator() {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { data: users = [] } = useFirestore<User>('users', {
    where: userSearch ? [['email', '>=', userSearch], ['email', '<=', userSearch + '\uf8ff']] : undefined,
    limitTo: 5
  });

  const filteredUsers = users.filter(u => u.id !== currentUser?.uid);

  const handleUserSelect = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !name.trim() || loading) return;

    setLoading(true);
    setError('');

    try {
      const team = await createTeam({
        name: name.trim(),
        description: description.trim(),
        members: [currentUser.uid, ...selectedUsers]
      });
      navigate(`/teams/${team.id}`);
    } catch (err) {
      console.error('Error creating team:', err);
      setError(err instanceof Error ? err.message : 'Failed to create team');
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={() => navigate('/teams')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Create New Team</h1>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Team Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                required
                disabled={loading}
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
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Add Team Members
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search by email..."
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  disabled={loading}
                />
              </div>

              {selectedUsers.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedUsers.map(userId => {
                    const selectedUser = users.find(u => u.id === userId);
                    return selectedUser ? (
                      <div
                        key={userId}
                        className="flex items-center space-x-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm"
                      >
                        <span>{selectedUser.email}</span>
                        <button
                          type="button"
                          onClick={() => handleUserSelect(userId)}
                          className="hover:text-blue-900"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    ) : null;
                  })}
                </div>
              )}

              {userSearch && filteredUsers.length > 0 && (
                <div className="mt-2 border border-gray-200 rounded-lg divide-y divide-gray-200">
                  {filteredUsers.map(user => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => handleUserSelect(user.id)}
                      className="w-full flex items-center justify-between px-4 py-2 hover:bg-gray-50"
                    >
                      <div className="flex flex-col items-start">
                        <span className="text-sm font-medium text-gray-900">
                          {user.name || user.email}
                        </span>
                        {user.name && (
                          <span className="text-xs text-gray-500">{user.email}</span>
                        )}
                      </div>
                      {selectedUsers.includes(user.id) ? (
                        <Check className="w-4 h-4 text-blue-600" />
                      ) : (
                        <UserPlus className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-6">
              <button
                type="button"
                onClick={() => navigate('/teams')}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !name.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                )}
                <span>{loading ? 'Creating...' : 'Create Team'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}