import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useSidebar } from '../../contexts/SidebarContext';
import OfflineIndicator from '../common/OfflineIndicator';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { isOpen } = useSidebar();

  return (
    <>
      <Header />
      <Sidebar />
      <main className={`min-h-screen pt-16 pb-16 transition-all duration-200 ${
        isOpen ? 'pl-64' : 'pl-20'
      } bg-gray-50`}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          {children}
        </div>
      </main>
      <Footer />
      <OfflineIndicator />
    </>
  );
}