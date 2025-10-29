import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Sparkles, Heart, ArrowLeft } from 'lucide-react';
import { revivalService } from '../services/revivalService';
import { Revival } from '../lib/supabase';
import CommentSection from '../components/CommentSection';
import { useWallet } from '../contexts/WalletContext';
import { blessRevival, getRevivalBlessingCount, userHasBlessedRevival, getNextBadgeTier, getCurrentBadgeTier } from '../services/blessingService';
import { sendTipToRevivalCreator } from '../services/tippingService';
import { useWeb3 } from '../hooks/useWeb3';
import Toast from '../components/Toast';
import BlessingModal from '../components/BlessingModal';

export default function RevivalDetailPage() {
  const { revivalId } = useParams();
  const { profile, isConnected } = useWallet();
  const { signer } = useWeb3();
  const navigate = useNavigate();
  const [revival, setRevival] = useState<Revival | null>(null);
  const [loading, setLoading] = useState(true);
  const [blessingCount, setBlessingCount] = useState(0);
  const [hasBlessed, setHasBlessed] = useState(false);
  const [isBlessing, setIsBlessing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [showBlessingModal, setShowBlessingModal] = useState(false);

  useEffect(() => {
    if (revivalId) {
      loadRevival();
      loadBlessingData();
    }
  }, [revivalId, profile]);

  const loadRevival = async () => {
    try {
      setLoading(true);
      const data = await revivalService.getById(revivalId!);
      setRevival(data);
    } catch (error) {
      console.error('Error loading revival:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBlessingData = async () => {
    if (!revivalId) return;

    const count = await getRevivalBlessingCount(revivalId);
    setBlessingCount(count);

    if (profile?.wallet_address) {
      const blessed = await userHasBlessedRevival(revivalId, profile.wallet_address);
      setHasBlessed(blessed);
    }
  };

  const handleBlessOnly = async () => {
    if (!isConnected || !profile?.wallet_address) {
      setToastMessage('Please connect your wallet first');
      setToastType('error');
      setShowToast(true);
      return;
    }

    setIsBlessing(true);
    const result = await blessRevival(revivalId!, profile!.wallet_address);

    if (result.success) {
      setHasBlessed(true);
      await loadBlessingData();
      setToastMessage('You blessed the project successfully!');
      setToastType('success');
    } else {
      setToastMessage(result.error || 'Failed to add blessing');
      setToastType('error');
    }

    setShowToast(true);
    setIsBlessing(false);
    setShowBlessingModal(false);
  };

  const handleBlessWithTip = async (tipAmount: string) => {
    console.log('🎯 Starting bless with tip process:', {
      tipAmount,
      revivalId,
      isConnected,
      hasProfile: !!profile,
      hasSigner: !!signer,
      walletAddress: profile?.wallet_address
    });

    if (!isConnected || !profile?.wallet_address || !signer) {
      console.error('❌ Prerequisites not met:', {
        isConnected,
        hasProfile: !!profile,
        hasSigner: !!signer
      });
      setToastMessage('Please connect your wallet first');
      setToastType('error');
      setShowToast(true);
      return;
    }

    setIsBlessing(true);
    
    try {
      console.log('💰 Sending tip to revival creator...');
      
      // First send the tip
      const tipResult = await sendTipToRevivalCreator(revivalId!, tipAmount, signer);
      
      console.log('💰 Tip result:', tipResult);
      
      if (!tipResult.success) {
        console.error('❌ Tip failed:', tipResult.error);
        setToastMessage(tipResult.error || 'Failed to send tip');
        setToastType('error');
        setShowToast(true);
        setIsBlessing(false);
        return;
      }

      console.log('✅ Tip successful, now adding blessing...');
      
      // Then add the blessing
      const blessResult = await blessRevival(revivalId!, profile!.wallet_address);
      
      console.log('🙏 Blessing result:', blessResult);
      
      if (blessResult.success) {
        setHasBlessed(true);
        await loadBlessingData();
        console.log('🎉 Complete success - tip sent and blessing added');
        setToastMessage(`🎉 ${tipAmount} ETH sent successfully! Blessing added.`);
        setToastType('success');
      } else {
        console.warn('⚠️ Tip sent but blessing failed:', blessResult.error);
        setToastMessage(`Tip sent but blessing failed: ${blessResult.error}`);
        setToastType('error');
      }
      
    } catch (error) {
      console.error('💥 Unexpected error in bless with tip:', {
        error: error.message,
        stack: error.stack
      });
      setToastMessage('Failed to process blessing with tip');
      setToastType('error');
    }

    setShowToast(true);
    setIsBlessing(false);
    setShowBlessingModal(false);
  };

  const handleBlessClick = () => {
    console.log('🎯 Bless button clicked!', {
      isConnected,
      hasProfile: !!profile,
      walletAddress: profile?.wallet_address,
      hasBlessed,
      revivalId,
      reviverIdFromRevival: revival?.reviver_id,
      currentUserId: profile?.id,
      isOwnRevival: revival?.reviver_id === profile?.id
    });

    if (!isConnected || !profile?.wallet_address) {
      console.log('❌ Wallet not connected');
      setToastMessage('Please connect your wallet first');
      setToastType('error');
      setShowToast(true);
      return;
    }

    if (hasBlessed) {
      console.log('❌ Already blessed');
      setToastMessage('You have already blessed this revival');
      setToastType('error');
      setShowToast(true);
      return;
    }

    // Check if user is trying to bless their own revival
    if (revival?.reviver_id === profile?.id) {
      console.log('❌ Cannot bless own revival');
      setToastMessage('You cannot bless your own revival');
      setToastType('error');
      setShowToast(true);
      return;
    }

    console.log('✅ Opening blessing modal...');
    setShowBlessingModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-zinc-400 text-xl">Loading revival...</p>
      </div>
    );
  }

  if (!revival) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-zinc-400 text-xl">Revival not found</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-10">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center gap-2 text-zinc-400 hover:text-primary transition-colors mb-6 bg-zinc-900/50 hover:bg-zinc-800/50 px-4 py-2 rounded-lg border border-zinc-800 hover:border-primary/30"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back</span>
        </button>
        
        <div className="mb-6">
          <h1 className="text-zinc-gray text-5xl font-bold mb-2">{revival.title}</h1>
          {revival.profiles && (
            <Link
              to={`/profile/${revival.reviver_wallet}`}
              className="text-zinc-gray text-lg hover:text-primary transition-colors inline-block"
            >
              Revived by @{revival.profiles.username}
            </Link>
          )}
        </div>

        <div className="flex gap-4 mb-8 flex-wrap">
          {revival.github_url && (
            <a
              href={revival.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-primary text-background-dark px-6 py-3 font-bold hover:bg-primary/80"
            >
              GitHub
            </a>
          )}
          {revival.deployed_url && (
            <a
              href={revival.deployed_url}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-zinc-gray text-zinc-gray px-6 py-3 font-bold hover:bg-zinc-gray/20"
            >
              Live Site
            </a>
          )}

        </div>

        <div className="mb-8">
          <h2 className="text-zinc-gray text-2xl font-bold mb-4">Revival Log</h2>
          <p className="text-zinc-gray text-base leading-relaxed">{revival.description}</p>
        </div>

        <div className="border-t border-zinc-gray/50 py-6 mb-12">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex-1">
              <h3 className="text-zinc-gray text-xl font-bold mb-2">Bless this Revival</h3>
              <p className="text-zinc-gray text-sm mb-3">Show your support and help this project gain visibility.</p>

              {blessingCount > 0 && (
                <div className="space-y-2">
                  {getCurrentBadgeTier(blessingCount) && (
                    <p className="text-sm text-primary font-semibold">
                      Current Tier: {getCurrentBadgeTier(blessingCount)?.name} {getCurrentBadgeTier(blessingCount)?.icon}
                    </p>
                  )}
                  {getNextBadgeTier(blessingCount) && (
                    <div className="space-y-1">
                      <p className="text-xs text-gray-400">
                        Next: {getNextBadgeTier(blessingCount)?.name} at {getNextBadgeTier(blessingCount)?.threshold} blessings
                      </p>
                      <div className="w-full bg-dark-card rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min((blessingCount / (getNextBadgeTier(blessingCount)?.threshold || 1)) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleBlessClick}
                disabled={!isConnected || hasBlessed || isBlessing || revival?.reviver_id === profile?.id}
                className={`flex items-center gap-2 px-6 py-3 text-lg font-bold transition-all ${
                  hasBlessed
                    ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                    : revival?.reviver_id === profile?.id
                    ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                    : isBlessing
                    ? 'bg-primary/50 text-background-dark cursor-wait'
                    : !isConnected
                    ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                    : 'bg-primary text-background-dark hover:bg-primary/80'
                }`}
              >
                {hasBlessed ? (
                  <>
                    <Heart className="w-5 h-5 fill-current" />
                    <span>Blessed</span>
                  </>
                ) : revival?.reviver_id === profile?.id ? (
                  <>
                    <Heart className="w-5 h-5" />
                    <span>Your Revival</span>
                  </>
                ) : !isConnected ? (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Connect Wallet</span>
                  </>
                ) : isBlessing ? (
                  <>
                    <Sparkles className="w-5 h-5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Bless</span>
                  </>
                )}
              </button>
              <p className="text-primary text-lg font-bold">{blessingCount} Blessings</p>
            </div>
          </div>
        </div>

        <CommentSection revivalId={revival.id} initialCount={revival.comment_count} />
      </div>

      <BlessingModal
        isOpen={showBlessingModal}
        onClose={() => setShowBlessingModal(false)}
        onBlessOnly={handleBlessOnly}
        onBlessWithTip={handleBlessWithTip}
        loading={isBlessing}
      />

      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          visible={showToast}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}
