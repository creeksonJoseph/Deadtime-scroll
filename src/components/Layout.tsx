import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import { useWallet } from '../contexts/WalletContext';

export default function Layout() {
  console.log('Layout component rendering...');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { isConnected } = useWallet();
  const location = useLocation();

  console.log('Layout state:', { isConnected, pathname: location.pathname });

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  const isHomePage = location.pathname === '/';
  const showSidebar = isConnected && !isHomePage;
  const showHeader = !isHomePage;

  console.log('Layout display logic:', { isHomePage, showSidebar, showHeader });

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background-dark">
      {showHeader && <Header onMenuToggle={toggleMobileSidebar} />}

      <div className="flex flex-1 overflow-hidden">
        {showSidebar && (
          <Sidebar
            isCollapsed={isSidebarCollapsed}
            isMobileOpen={isMobileSidebarOpen}
            onToggle={toggleSidebar}
            onMobileClose={closeMobileSidebar}
          />
        )}
        <main className={`flex-1 overflow-y-auto transition-all duration-300 ${
          showSidebar && !isSidebarCollapsed ? 'ml-0' : ''
        }`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
