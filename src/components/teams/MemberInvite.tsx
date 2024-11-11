import React, { useState } from 'react';
import { X, Search, UserPlus, Check, AlertCircle } from 'lucide-react';
import { useFirestore } from '../../hooks/useFirestore';
import { User } from '../../types';
import { addTeamMember } from '../../lib/teams';
import { useSubscription } from '../../hooks/useSubscription';

interface MemberInviteProps {
  teamId: string;
  currentMembers: string[];
  onClose: () => void;
  onMembersAdded: () => void;
}

export default function MemberInvite({ teamId, currentMembers, onClose, onMembersAdded }: MemberInviteProps) {
  const [search, setSearch] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { data: users = [] } = useFirestore<User>('users', {
    where: search ? [['email', '>=', search], ['email', '<=', search + '\uf8ff']] : undefined,
    limitTo: 5
  });

  const { checkTeamMemberLimit, plan } = useSubscription();
  const canAddMembers = checkTeamMemberLimit(currentMembers.length + selectedUsers.length);

  const filteredUsers = users.filter(user => !currentMembers.includes(user.id));

  const handleUserSelect = (userId: string) => {
    setSelectedUsers(prev => {
      const newSelection = prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId];
      
      // Check if new selection would exceed limit
      if (!checkTeamMemberLimit(currentMembers.length + newSelection.length)) {
        setError('Team member limit would be exceeded');
        return prev;
      }
      
      setError('');
      return newSelection;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || selectedUsers.length === 0 || !canAddMembers) return;

    setLoading(true);
    setError('');

    try {
      for (const userId of selectedUsers) {
        await addTeamMember(teamId, userId);
      }
      onMembersAdded();
    } catch (err) {
      console.error('Error adding members:', err);
      setError(err instanceof Error ? err.message : 'Failed to add members');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Add Team Members</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!canAddMembers && (
          <div className="mb-4 p-3 bg-yellow-50 rounded-lg flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Team Member Limit Reached</h3>
              <p className="text-sm text-yellow-700 mt-1">
                You've reached the team member limit ({plan.limits.teamMembers}) for your current plan.
                Please upgrade to add more members.
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
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Users
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by email..."
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                disabled={loading || !canAddMembers}
              />
            </div>
          </div>

          {selectedUsers.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map(userId => {
                const user = users.find(u => u.id === userId);
                return user ? (
                  <div
                    key={userId}
                    className="flex items-center space-x-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm"
                  >
                    <span>{user.email}</span>
                    <button
                      type="button"
                      onClick={() => handleUserSelect(userId)}
                      className="hover:text-blue-900"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : null;
              })}
            </div>
          )}

          {search && filteredUsers.length > 0 && (
            <div className="border border-gray-200 rounded-lg divide-y divide-gray-200">
              {filteredUsers.map(user => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleUserSelect(user.id)}
                  className="w-full flex items-center justify-between px-4 py-2 hover:bg-gray-50"
                  disabled={!canAddMembers && !selectedUsers.includes(user.id)}
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
              disabled={loading || selectedUsers.length === 0 || !canAddMembers}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              )}
              <span>{loading ? 'Adding...' : 'Add Members'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}