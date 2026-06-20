import { createContext, useState, type ReactNode } from 'react';

export interface SidebarContextValue {
  isCollapsed: boolean;
  toggle: () => void;
  collapse: () => void;
  expand: () => void;
}

export const SidebarContext = createContext<SidebarContextValue | null>(null);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('wetfuel_sidebar') === 'collapsed';
  });

  const toggle = () => {
    setIsCollapsed((prev) => {
      localStorage.setItem('wetfuel_sidebar', !prev ? 'collapsed' : 'expanded');
      return !prev;
    });
  };

  const collapse = () => {
    setIsCollapsed(true);
    localStorage.setItem('wetfuel_sidebar', 'collapsed');
  };

  const expand = () => {
    setIsCollapsed(false);
    localStorage.setItem('wetfuel_sidebar', 'expanded');
  };

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggle, collapse, expand }}>
      {children}
    </SidebarContext.Provider>
  );
}
