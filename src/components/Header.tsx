import { Clock, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';

interface HeaderProps {
  onMenuToggle: () => void;
  isSidebarOpen: boolean;
}

export default function Header({ onMenuToggle, isSidebarOpen }: HeaderProps) {
  const { isConnected, profile, connectWallet, disconnectWallet, loading, error } = useWallet();

  console.log('Header render - isConnected:', isConnected, 'loading:', loading, 'profile:', profile);

  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-zinc-gray px-4 md:px-10 py-4 bg-background-dark sticky top-0 z-50">
      <div className="flex items-center gap-4">
        {isConnected && (
          <button
            onClick={onMenuToggle}
            className="text-white hover:text-primary transition-colors md:hidden"
          >
            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        )}
        <Link to="/" className="flex items-center gap-4 text-white">
          <Clock className="w-6 h-6 text-primary" />
          <h2 className="text-white text-xl font-bold leading-tight">
            DeadTime
          </h2>
        </Link>
      </div>
      <div className="flex items-center gap-4">
        {loading ? (
          <div className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden h-10 px-4 bg-zinc-gray text-white text-sm font-bold">
            <span className="truncate">Loading...</span>
          </div>
        ) : isConnected && profile ? (
          <>
            <button
              onClick={disconnectWallet}
              className="hidden md:flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden h-10 px-4 border border-primary text-primary text-sm font-bold hover:bg-primary hover:text-black transition-colors"
            >
              <span className="truncate">Disconnect</span>
            </button>
            <Link to="/profile">
              <div
                className="bg-center bg-no-repeat aspect-square bg-cover w-10 h-10 border border-zinc-gray hover:border-primary transition-colors cursor-pointer"
                style={{
                  backgroundImage: profile.avatar_url
                    ? `url("${profile.avatar_url}")`
                    : 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDhxG6-3WTElJeasUAcmB5DDlhbmaMIK71Jf4iup8F_wBmZtu-aaggNMk5u8fsbjNLBRFAV0AzVh8YzeMo5TUuRCrtjG1sSxUwE8nMUgIgdtljT8l5Z3HB81DSdF003Fh2PqkEFFxNJMnfJvCKwaJ5EutcWFRX9ojqK0IRZmEUa3SN87zVgVHPKEAFrM99klh2sNtS37f3Ge4JwXntuwtIUHgYY1VczHe6al3LJsiIHJuKqGgUw31xGSLnzyGkKy0LKb4xbyn4cLso")',
                }}
              ></div>
            </Link>
          </>
        ) : (
          <button
            onClick={connectWallet}
            className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden h-10 px-4 bg-primary text-black text-sm font-bold hover:bg-white hover:text-black transition-colors"
          >
            <span className="truncate">Connect Wallet</span>
          </button>
        )}
      </div>
    </header>
  );
}
