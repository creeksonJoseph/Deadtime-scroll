import { Link, useLocation } from 'react-router-dom';
import { Home, FolderOpen, PlusCircle, RefreshCw, MessageSquare, User, LogOut } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const { isConnected, disconnectWallet } = useWallet();

  const menuItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/projects', icon: FolderOpen, label: 'Projects' },
    { path: '/submit', icon: PlusCircle, label: 'Submit Project' },
    { path: '/revivals', icon: RefreshCw, label: 'My Revivals' },
    { path: '/chat', icon: MessageSquare, label: 'Messages' },
    { path: '/profile', icon: User, label: 'Account' },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    disconnectWallet();
    onClose();
  };

  console.log('Sidebar - isConnected:', isConnected);

  if (!isConnected) {
    console.log('Sidebar not rendering - wallet not connected');
    return null;
  }

  console.log('Sidebar rendering - isOpen:', isOpen);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        ></div>
      )}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 border-r border-zinc-gray bg-background-dark z-50 transition-transform duration-300 flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex-1 overflow-y-auto p-4">
          <nav className="flex flex-col gap-2 mt-16 md:mt-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3 py-3 transition-colors ${
                    active
                      ? 'bg-primary/20 text-primary'
                      : 'text-white hover:bg-primary/10 hover:text-primary'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className={`text-sm ${active ? 'font-bold' : 'font-medium'}`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="p-4 border-t border-zinc-gray">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-3 w-full text-white hover:bg-red-500/20 hover:text-red-500 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
