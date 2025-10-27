import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import { useWallet } from '../contexts/WalletContext';

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isConnected, loading } = useWallet();
  const location = useLocation();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const isHomePage = location.pathname === '/';
  const showSidebar = isConnected && !isHomePage;

  console.log('Layout - isConnected:', isConnected, 'loading:', loading, 'isHomePage:', isHomePage, 'showSidebar:', showSidebar);

  return (
    <div className="flex h-screen overflow-hidden bg-background-dark">
      {showSidebar && <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuToggle={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
