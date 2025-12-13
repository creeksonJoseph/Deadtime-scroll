import { FolderOpen, Sparkles, MessageCircle, Trophy, User, LogOut, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';

interface SidebarProps {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  onToggle: () => void;
  onMobileClose: () => void;
}

export default function Sidebar({ isCollapsed, isMobileOpen, onToggle, onMobileClose }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { disconnectWallet } = useWallet();

  const handleDisconnect = () => {
    disconnectWallet();
    navigate('/');
    onMobileClose();
  };

  const menuItems = [
    { icon: FolderOpen, label: 'Projects', path: '/projects' },
    { icon: Sparkles, label: 'My Revivals', path: '/my-revivals' },
    { icon: FileText, label: 'My Projects', path: '/my-projects' },
    { icon: MessageCircle, label: 'Messages', path: '/chat' },
    { icon: Trophy, label: 'Leaderboard', path: '/leaderboard' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    // Don't highlight profile for other users' profiles
    if (path === '/profile') {
      return location.pathname === '/profile';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <div
        className={`${
          isMobileOpen ? 'block' : 'hidden'
        } md:hidden fixed inset-0 bg-black/50 z-40`}
        onClick={onMobileClose}
      />

      <aside
        className={`
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
          fixed md:relative
          h-[calc(100vh-73px)]
          ${isCollapsed ? 'w-20' : 'w-64'}
          bg-zinc-900
          border-r border-zinc-800
          transition-all duration-300
          z-50
          flex flex-col
        `}
      >
        <nav className="flex-1 overflow-y-auto py-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onMobileClose}
                className={`
                  flex items-center gap-3 px-4 py-3 mx-2 rounded-lg
                  transition-all duration-200
                  ${active
                    ? 'bg-primary text-black font-semibold'
                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                  }
                  ${isCollapsed ? 'justify-center' : ''}
                `}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-zinc-800 p-4 space-y-2">
          <button
            onClick={handleDisconnect}
            className={`
              w-full flex items-center gap-3 px-4 py-3 rounded-lg
              text-red-400 hover:bg-red-400/10 hover:text-red-300
              transition-all duration-200
              ${isCollapsed ? 'justify-center' : ''}
            `}
            title={isCollapsed ? 'Disconnect Wallet' : undefined}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span>Disconnect Wallet</span>}
          </button>

          <button
            onClick={onToggle}
            className={`
              hidden md:flex
              w-full items-center gap-3 px-4 py-3 rounded-lg
              text-zinc-400 hover:bg-zinc-800 hover:text-white
              transition-all duration-200
              ${isCollapsed ? 'justify-center' : ''}
            `}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5 flex-shrink-0" />
            ) : (
              <>
                <ChevronLeft className="w-5 h-5 flex-shrink-0" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
