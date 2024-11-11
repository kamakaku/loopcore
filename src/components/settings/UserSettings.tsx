import React, { useState, useRef } from 'react';
import { X, Camera, Mail, Lock, Bell, Eye, EyeOff, User, Globe, Palette } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { updateUserProfile } from '../../lib/firebase/user';
import { useTranslation } from 'react-i18next';
import LanguageSelector from './LanguageSelector';
import Avatar from '../common/Avatar';

interface UserSettingsProps {
  onClose: () => void;
}

export default function UserSettings({ onClose }: UserSettingsProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'privacy' | 'appearance'>('profile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Profile form state
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.photoURL || null);

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);

  // Privacy settings
  const [profileVisibility, setProfileVisibility] = useState<'public' | 'private'>('public');
  const [activityVisibility, setActivityVisibility] = useState<'public' | 'private'>('public');

  // Appearance settings
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const updates: any = {};

      if (displayName !== user?.displayName) {
        updates.displayName = displayName;
      }

      if (email !== user?.email) {
        updates.email = email;
        updates.currentPassword = currentPassword;
      }

      if (newPassword) {
        updates.newPassword = newPassword;
        updates.currentPassword = currentPassword;
      }

      if (avatar) {
        updates.avatar = avatar;
      }

      await updateUserProfile(updates);
      setSuccess(t('settings.profile.updateSuccess'));
      if (newPassword) {
        setNewPassword('');
        setCurrentPassword('');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : t('settings.profile.updateError'));
    } finally {
      setLoading(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <Avatar
                src={avatarPreview}
                alt={displayName || t('settings.profile.avatar')}
                size="lg"
                editable
                onChange={(file) => {
                  setAvatar(file);
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setAvatarPreview(reader.result as string);
                  };
                  reader.readAsDataURL(file);
                }}
              />
              <p className="text-sm text-gray-500">
                {t('settings.profile.avatarHelp')}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('settings.profile.name')}
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('settings.profile.email')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('settings.profile.currentPassword')}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('settings.profile.newPassword')}
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
                disabled={loading}
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? t('common.loading') : t('common.save')}
              </button>
            </div>
          </form>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  {t('settings.notifications.email')}
                </span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={pushNotifications}
                  onChange={(e) => setPushNotifications(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  {t('settings.notifications.push')}
                </span>
              </label>
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('settings.privacy.profileVisibility')}
              </label>
              <select
                value={profileVisibility}
                onChange={(e) => setProfileVisibility(e.target.value as 'public' | 'private')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              >
                <option value="public">{t('settings.privacy.public')}</option>
                <option value="private">{t('settings.privacy.private')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('settings.privacy.activityVisibility')}
              </label>
              <select
                value={activityVisibility}
                onChange={(e) => setActivityVisibility(e.target.value as 'public' | 'private')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              >
                <option value="public">{t('settings.privacy.public')}</option>
                <option value="private">{t('settings.privacy.private')}</option>
              </select>
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {t('settings.appearance.language')}
              </h3>
              <LanguageSelector />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {t('settings.appearance.theme')}
              </h3>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'system')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              >
                <option value="light">{t('settings.appearance.light')}</option>
                <option value="dark">{t('settings.appearance.dark')}</option>
                <option value="system">{t('settings.appearance.system')}</option>
              </select>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">{t('settings.title')}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex h-[600px]">
          <div className="w-48 border-r border-gray-200 p-4">
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-lg ${
                  activeTab === 'profile'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <User className="w-4 h-4" />
                <span>{t('settings.profile.title')}</span>
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`w-full flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-lg ${
                  activeTab === 'notifications'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Bell className="w-4 h-4" />
                <span>{t('settings.notifications.title')}</span>
              </button>
              <button
                onClick={() => setActiveTab('privacy')}
                className={`w-full flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-lg ${
                  activeTab === 'privacy'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Lock className="w-4 h-4" />
                <span>{t('settings.privacy.title')}</span>
              </button>
              <button
                onClick={() => setActiveTab('appearance')}
                className={`w-full flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-lg ${
                  activeTab === 'appearance'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Palette className="w-4 h-4" />
                <span>{t('settings.appearance.title')}</span>
              </button>
            </nav>
          </div>

          <div className="flex-1 p-6 overflow-y-auto">
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-lg text-sm">
                {success}
              </div>
            )}

            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
}