import { createContext, useContext, useState, useEffect } from 'react';

interface SidebarContextType {
  isOpen: boolean;
  toggle: () => void;
}

const SidebarContext = createContext<SidebarContextType>({
  isOpen: true,
  toggle: () => {}
});

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(() => {
    const saved = localStorage.getItem('sidebarOpen');
    return saved ? JSON.parse(saved) : true;
  });

  const toggle = () => setIsOpen(prev => !prev);

  useEffect(() => {
    localStorage.setItem('sidebarOpen', JSON.stringify(isOpen));
  }, [isOpen]);

  return (
    <SidebarContext.Provider value={{ isOpen, toggle }}>
      {children}
    </SidebarContext.Provider>
  );
}

export const useSidebar = () => useContext(SidebarContext);