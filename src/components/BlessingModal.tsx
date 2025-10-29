import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, DollarSign, X } from 'lucide-react';

interface BlessingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBlessOnly: () => void;
  onBlessWithTip: (amount: string) => void;
  loading: boolean;
}

export default function BlessingModal({ 
  isOpen, 
  onClose, 
  onBlessOnly, 
  onBlessWithTip, 
  loading 
}: BlessingModalProps) {
  const [tipAmount, setTipAmount] = useState('');
  const [selectedOption, setSelectedOption] = useState<'bless' | 'tip' | null>(null);

  const handleTipSubmit = () => {
    if (tipAmount && parseFloat(tipAmount) > 0) {
      onBlessWithTip(tipAmount);
    }
  };

  const resetModal = () => {
    setSelectedOption(null);
    setTipAmount('');
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Bless This Revival</h3>
              <button
                onClick={handleClose}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!selectedOption && (
              <div className="space-y-4">
                <p className="text-zinc-400 text-sm mb-6">
                  Choose how you'd like to show your support:
                </p>

                <button
                  onClick={() => setSelectedOption('bless')}
                  className="w-full flex items-center gap-3 p-4 border border-zinc-700 rounded-lg hover:border-primary/50 hover:bg-zinc-800/50 transition-colors text-left"
                >
                  <Heart className="w-6 h-6 text-primary" />
                  <div>
                    <h4 className="text-white font-semibold">Just Bless</h4>
                    <p className="text-zinc-400 text-sm">Show support with a free blessing</p>
                  </div>
                </button>

                <button
                  onClick={() => setSelectedOption('tip')}
                  className="w-full flex items-center gap-3 p-4 border border-zinc-700 rounded-lg hover:border-primary/50 hover:bg-zinc-800/50 transition-colors text-left"
                >
                  <DollarSign className="w-6 h-6 text-primary" />
                  <div>
                    <h4 className="text-white font-semibold">Bless + Send ETH</h4>
                    <p className="text-zinc-400 text-sm">Support with blessing + ETH tip</p>
                  </div>
                </button>
              </div>
            )}

            {selectedOption === 'bless' && (
              <div className="space-y-4">
                <div className="text-center py-4">
                  <Heart className="w-12 h-12 text-primary mx-auto mb-3" />
                  <h4 className="text-white font-semibold mb-2">Free Blessing</h4>
                  <p className="text-zinc-400 text-sm">
                    Your blessing will help this revival gain visibility and support the creator.
                  </p>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedOption(null)}
                    className="flex-1 border border-zinc-700 text-zinc-400 px-4 py-3 font-bold hover:bg-zinc-800 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={onBlessOnly}
                    disabled={loading}
                    className="flex-1 bg-primary text-black px-4 py-3 font-bold hover:bg-primary/80 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Blessing...' : 'Send Blessing'}
                  </button>
                </div>
              </div>
            )}

            {selectedOption === 'tip' && (
              <div className="space-y-4">
                <div className="text-center py-4">
                  <DollarSign className="w-12 h-12 text-primary mx-auto mb-3" />
                  <h4 className="text-white font-semibold mb-2">Bless + Send ETH</h4>
                  <p className="text-zinc-400 text-sm mb-4">
                    Send ETH directly to the revival creator along with your blessing.
                  </p>
                </div>

                <div>
                  <label className="block text-white text-sm font-semibold mb-2">
                    ETH Amount
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    min="0.001"
                    value={tipAmount}
                    onChange={(e) => setTipAmount(e.target.value)}
                    placeholder="0.01"
                    className="w-full bg-zinc-800 border border-zinc-700 text-white px-4 py-3 rounded focus:outline-none focus:border-primary"
                  />
                  <p className="text-zinc-500 text-xs mt-1">
                    Minimum: 0.001 ETH (~$3)
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedOption(null)}
                    className="flex-1 border border-zinc-700 text-zinc-400 px-4 py-3 font-bold hover:bg-zinc-800 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleTipSubmit}
                    disabled={loading || !tipAmount || parseFloat(tipAmount) < 0.001}
                    className="flex-1 bg-primary text-black px-4 py-3 font-bold hover:bg-primary/80 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Sending...' : `Send ${tipAmount || '0'} ETH`}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}