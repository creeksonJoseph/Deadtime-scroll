import { useWeb3 } from '../hooks/useWeb3';
import { BADGE_MINTER_ADDRESS } from '../config/contracts';

export default function Web3Status() {
  const { isConnected, connectWallet } = useWeb3();

  return (
    <div className="fixed bottom-4 left-4 bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-sm">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className="text-white font-medium">
          Web3: {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>
      
      {!isConnected && (
        <button
          onClick={connectWallet}
          className="bg-primary text-black px-3 py-1 text-xs font-bold hover:bg-primary/80 transition-colors rounded"
        >
          Connect Web3
        </button>
      )}
      
      <div className="text-zinc-400 text-xs mt-2">
        Contract: {BADGE_MINTER_ADDRESS.slice(0, 6)}...{BADGE_MINTER_ADDRESS.slice(-4)}
      </div>
    </div>
  );
}