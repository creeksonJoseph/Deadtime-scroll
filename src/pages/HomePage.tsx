import { Link } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';

export default function HomePage() {
  const { connectWallet } = useWallet();

  return (
    <div className="relative flex min-h-full w-full flex-col overflow-x-hidden">
      <div className="absolute inset-0 neon-grid z-0"></div>
      <div className="relative z-10 flex h-full grow flex-col items-center justify-center text-center px-4 min-h-[calc(100vh-4rem)]">
        <div className="flex flex-col gap-6 items-center justify-center">
          <div className="flex flex-col gap-4">
            <h1 className="text-primary text-6xl md:text-8xl font-black neon-glow animate-pulse">
              DeadTime
            </h1>
            <h2 className="text-zinc-gray text-lg md:text-2xl font-normal">
              Revive What Was Lost.
            </h2>
          </div>
          <div className="flex gap-4">
            <Link
              to="/projects"
              className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden h-12 px-6 bg-primary text-black text-base font-bold hover:bg-white hover:text-black transition-colors"
            >
              <span className="truncate">Browse Projects</span>
            </Link>
            <button
              onClick={connectWallet}
              className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden h-12 px-6 border border-primary text-primary text-base font-bold hover:bg-primary hover:text-black transition-colors"
            >
              <span className="truncate">Connect Wallet</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
