import React, { useState, useCallback } from 'react';
import { Button, Dropdown } from 'antd';
import { 
  BellOutlined, 
  SettingOutlined, 
  UserOutlined, 
  LogoutOutlined,
  MenuOutlined
} from '@ant-design/icons';
import { signOut } from '../../lib/firebase';
import { useSidebar } from '../../contexts/SidebarContext';
import GlobalSearch from '../common/GlobalSearch';
import UserSettings from '../settings/UserSettings';
import Avatar from '../common/Avatar';
import { useAuth } from '../../contexts/AuthContext';
import LanguageSelector from '../settings/LanguageSelector';
import { useTranslation } from 'react-i18next';

export default function Header() {
  const { toggle } = useSidebar();
  const { user } = useAuth();
  const [showSettings, setShowSettings] = useState(false);
  const { t } = useTranslation();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const menuItems = [
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: t('settings.title'),
      onClick: () => setShowSettings(true)
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: t('auth.signOut'),
      onClick: handleLogout,
    },
  ];

  const renderUserButton = useCallback(() => (
    <Button type="text" className="flex items-center space-x-2">
      <Avatar 
        src={user?.photoURL || null} 
        alt={user?.displayName || 'User'} 
        size="sm"
      />
      <span className="hidden md:inline">
        {user?.displayName || t('common.profile')}
      </span>
    </Button>
  ), [user?.photoURL, user?.displayName, t]);

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-4">
          <Button 
            type="text"
            icon={<MenuOutlined />}
            onClick={toggle}
            className="flex"
          />
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Loopcore
          </span>
        </div>

        <div className="flex-1 max-w-2xl mx-8">
          <GlobalSearch />
        </div>

        <div className="flex items-center space-x-4">
          <LanguageSelector />
          
          <Button 
            type="text" 
            icon={<BellOutlined />}
            className="relative"
          >
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </Button>
          
          <Dropdown 
            menu={{ items: menuItems }} 
            trigger={['click']}
            getPopupContainer={(triggerNode) => triggerNode.parentNode as HTMLElement}
          >
            {renderUserButton()}
          </Dropdown>
        </div>
      </div>

      {showSettings && (
        <UserSettings onClose={() => setShowSettings(false)} />
      )}
    </header>
  );
}