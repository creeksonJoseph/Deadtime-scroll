import { Menu } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';

interface HeaderProps {
  onMenuToggle: () => void;
}

export default function Header({ onMenuToggle }: HeaderProps) {
  const { isConnected, profile, connectWallet, loading } = useWallet();
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <header className="w-full flex items-center justify-between border-b border-solid border-zinc-gray px-4 md:px-10 py-4 bg-background-dark sticky top-0 z-50">
      <div className="flex items-center gap-4">
        {isConnected && !isHomePage && (
          <button
            onClick={onMenuToggle}
            className="md:hidden text-white hover:text-primary transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        )}
        <Link to="/" className="flex items-center gap-2">
          <div className="text-primary text-2xl font-bold">DeadTime</div>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {!isConnected ? (
          <button
            onClick={connectWallet}
            disabled={loading}
            className="bg-primary text-black px-6 py-2 font-bold hover:bg-primary/80 transition-colors disabled:opacity-50"
          >
            {loading ? 'Connecting...' : 'Connect Wallet'}
          </button>
        ) : (
          <Link
            to="/profile"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <img
              src={profile?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400'}
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover border-2 border-primary"
            />
          </Link>
        )}
      </div>
    </header>
  );
}
