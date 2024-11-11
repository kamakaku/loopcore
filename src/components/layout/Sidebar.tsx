import { NavLink, useLocation } from 'react-router-dom';
import { Menu } from 'antd';
import { 
  HomeOutlined, 
  TeamOutlined, 
  ProjectOutlined,
  FileTextOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons';
import { useSidebar } from '../../contexts/SidebarContext';

const navigation = [
  { name: 'Dashboard', icon: <HomeOutlined />, path: '/' },
  { name: 'Loops', icon: <FileTextOutlined />, path: '/loops' },
  { name: 'Teams', icon: <TeamOutlined />, path: '/teams' },
  { name: 'Projects', icon: <ProjectOutlined />, path: '/projects' }
];

export default function Sidebar() {
  const location = useLocation();
  const { isOpen, toggle } = useSidebar();

  const getSelectedKey = () => {
    const path = location.pathname;
    if (path === '/') return '/';
    const matchingPath = navigation.find(item => 
      path.startsWith(item.path) && item.path !== '/'
    )?.path;
    return matchingPath || '/';
  };

  return (
    <aside className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 z-40 transition-all duration-200 ${
      isOpen ? 'w-64' : 'w-20'
    }`}>
      <div className="flex flex-col h-full">
        <Menu
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          style={{ height: '100%', borderRight: 0 }}
          inlineCollapsed={!isOpen}
          items={navigation.map(item => ({
            key: item.path,
            icon: item.icon,
            label: <NavLink to={item.path}>{item.name}</NavLink>,
          }))}
        />
        
        <button
          onClick={toggle}
          className="p-4 border-t border-gray-200 flex items-center justify-center hover:bg-gray-50"
        >
          {isOpen ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
        </button>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-30 md:hidden" 
          onClick={toggle}
        />
      )}
    </aside>
  );
}