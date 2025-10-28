import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { profileService } from '../services/profileService';
import { Profile } from '../lib/supabase';

interface WalletContextType {
  isConnected: boolean;
  walletAddress: string | null;
  profile: Profile | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  loading: boolean;
  error: string | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  console.log('WalletProvider: Initializing...');
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log('WalletProvider state:', { isConnected, walletAddress, loading, error });

  useEffect(() => {
    console.log('WalletProvider: Running checkConnection effect');
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      setLoading(true);
      const storedAddress = localStorage.getItem('walletAddress');

      if (storedAddress) {
        console.log('Found stored wallet address:', storedAddress);
        await loadProfile(storedAddress);
      }
    } catch (err) {
      console.error('Error checking connection:', err);
      // Clear potentially corrupted cache data
      localStorage.removeItem('walletAddress');
      setError(err instanceof Error ? err.message : 'Failed to check connection');
    } finally {
      setLoading(false);
    }
  };

  const loadProfile = async (address: string) => {
    try {
      console.log('Loading profile for address:', address);
      let userProfile = await profileService.getByWallet(address);

      if (!userProfile) {
        console.log('Profile not found, creating new profile...');
        userProfile = await profileService.create({
          wallet_address: address,
          username: `User${address.slice(2, 8)}`,
          avatar_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDhxG6-3WTElJeasUAcmB5DDlhbmaMIK71Jf4iup8F_wBmZtu-aaggNMk5u8fsbjNLBRFAV0AzVh8YzeMo5TUuRCrtjG1sSxUwE8nMUgIgdtljT8l5Z3HB81DSdF003Fh2PqkEFFxNJMnfJvCKwaJ5EutcWFRX9ojqK0IRZmEUa3SN87zVgVHPKEAFrM99klh2sNtS37f3Ge4JwXntuwtIUHgYY1VczHe6al3LJsiIHJuKqGgUw31xGSLnzyGkKy0LKb4xbyn4cLso',
        });
        console.log('New profile created:', userProfile);
      } else {
        console.log('Profile loaded:', userProfile);
      }

      setProfile(userProfile);
      setWalletAddress(address);
      setIsConnected(true);
      setError(null);
    } catch (err) {
      console.error('Error loading profile:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load profile';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const connectWallet = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Starting wallet connection...');

      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask is not installed. Please install MetaMask browser extension to continue.');
      }

      console.log('MetaMask detected, requesting accounts...');

      try {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });

        if (!accounts || accounts.length === 0) {
          throw new Error('No accounts returned from MetaMask');
        }

        const address = accounts[0].toLowerCase();
        console.log('MetaMask connected with address:', address);

        localStorage.setItem('walletAddress', address);
        await loadProfile(address);

        console.log('Wallet connection successful!');
      } catch (metamaskError: any) {
        if (metamaskError.code === 4001) {
          throw new Error('Connection request rejected. Please approve the connection in MetaMask.');
        }
        throw metamaskError;
      }
    } catch (err) {
      console.error('Wallet connection error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect wallet';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = () => {
    console.log('Disconnecting wallet...');
    setIsConnected(false);
    setWalletAddress(null);
    setProfile(null);
    setError(null);
    localStorage.removeItem('walletAddress');
    console.log('Wallet disconnected');
  };

  console.log('WalletProvider: Rendering children');

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        walletAddress,
        profile,
        connectWallet,
        disconnectWallet,
        loading,
        error,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      isMetaMask?: boolean;
      on?: (event: string, handler: (...args: any[]) => void) => void;
      removeListener?: (event: string, handler: (...args: any[]) => void) => void;
    };
  }
}
