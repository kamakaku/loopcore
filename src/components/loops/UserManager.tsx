import React, { useState } from 'react';
import { X, Search, UserPlus, Check } from 'lucide-react';
import { useFirestore } from '../../hooks/useFirestore';
import { Loop, User, LoopMember } from '../../types';
import { addLoopMember, removeLoopMember } from '../../lib/loops';
import { useAuth } from '../../contexts/AuthContext';

interface UserManagerProps {
  loop: Loop;
  onClose: () => void;
  onUpdated: () => void;
}

export default function UserManager({ loop, onClose, onUpdated }: UserManagerProps) {
  const { user: currentUser } = useAuth();
  const [search, setSearch] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Ensure loop.members is initialized as an array
  const members = Array.isArray(loop.members) ? loop.members : [];

  // Get all users for search
  const { data: users = [] } = useFirestore<User>('users', {
    where: search ? [['email', '>=', search], ['email', '<=', search + '\uf8ff']] : undefined,
    limitTo: 5
  });

  // Get current members
  const { data: memberUsers = [] } = useFirestore<User>('users', {
    where: members.length > 0 ? [['__name__', 'in', members.map(m => m.id)]] : undefined
  });

  // Filter out users who are already members
  const filteredUsers = users.filter(user => 
    !members.some(member => member.id === user.id)
  );

  const handleUserSelect = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || selectedUsers.length === 0) return;

    setLoading(true);
    setError('');

    try {
      await Promise.all(
        selectedUsers.map(userId => addLoopMember(loop.id, userId))
      );
      onUpdated();
      setSelectedUsers([]);
      setSearch('');
    } catch (err) {
      console.error('Error adding members:', err);
      setError(err instanceof Error ? err.message : 'Failed to add members');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (loading) return;

    setLoading(true);
    setError('');

    try {
      await removeLoopMember(loop.id, userId);
      onUpdated();
    } catch (err) {
      console.error('Error removing member:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove member');
    } finally {
      setLoading(false);
    }
  };

  const getMemberRole = (userId: string): LoopMember['role'] => {
    const member = members.find(m => m.id === userId);
    return member?.role || 'viewer';
  };

  if (!currentUser) {
    return null;
  }

  const isOwner = getMemberRole(currentUser.uid) === 'owner';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Manage Members</h2>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Add Members
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by email..."
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                disabled={loading}
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
              disabled={loading || selectedUsers.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              )}
              <span>{loading ? 'Adding...' : 'Add Members'}</span>
            </button>
          </div>
        </form>

        <div className="mt-6">
          <h3 className="font-medium text-gray-900 mb-4">Current Members</h3>
          <div className="divide-y divide-gray-200">
            {memberUsers.map(member => (
              <div key={member.id} className="py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">
                      {member.name || member.email}
                      {getMemberRole(member.id) === 'owner' && (
                        <span className="ml-2 text-xs text-gray-500">(Owner)</span>
                      )}
                    </div>
                    {member.name && (
                      <div className="text-sm text-gray-500">{member.email}</div>
                    )}
                  </div>
                  {isOwner && getMemberRole(member.id) !== 'owner' && (
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      title="Remove member"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {memberUsers.length === 0 && (
              <div className="text-center py-4">
                <p className="text-gray-500">No members yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}