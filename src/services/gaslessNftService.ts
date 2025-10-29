import { ethers } from 'ethers';
import { BADGE_MINTER_V2_ABI, BADGE_MINTER_V2_ADDRESS } from '../config/contracts';

const SCROLL_SEPOLIA_RPC = 'https://sepolia-rpc.scroll.io/';

export async function claimNFTBadgeGasless(
  badgeId: string,
  blessings: number,
  userAddress: string
): Promise<{ success: boolean; tokenId?: string; txHash?: string; error?: string }> {
  try {
    const platformPrivateKey = import.meta.env.VITE_PLATFORM_PRIVATE_KEY;
    
    if (!platformPrivateKey) {
      throw new Error('Platform private key not configured');
    }

    // Create provider and platform wallet
    const provider = new ethers.JsonRpcProvider(SCROLL_SEPOLIA_RPC);
    const platformWallet = new ethers.Wallet(platformPrivateKey, provider);
    
    // Create contract instance with platform wallet
    const contract = new ethers.Contract(BADGE_MINTER_V2_ADDRESS, BADGE_MINTER_V2_ABI, platformWallet);

    console.log('Minting NFT badge gaslessly...');
    console.log('User address:', userAddress);
    console.log('Blessings:', blessings);
    console.log('Platform wallet:', platformWallet.address);

    // Call mintBadgeFor function (platform pays gas)
    const tx = await contract.mintBadgeFor(userAddress, blessings);
    
    console.log('Transaction sent:', tx.hash);
    
    // Wait for transaction confirmation
    const receipt = await tx.wait();
    
    console.log('Transaction confirmed:', receipt);

    // Extract token ID from events
    let tokenId = '';
    if (receipt.logs && receipt.logs.length > 0) {
      try {
        const iface = new ethers.Interface(BADGE_MINTER_V2_ABI);
        for (const log of receipt.logs) {
          try {
            const parsed = iface.parseLog(log);
            if (parsed && parsed.name === 'BadgeMinted') {
              tokenId = parsed.args.tokenId.toString();
              break;
            }
          } catch (e) {
            // Skip logs that don't match our interface
            continue;
          }
        }
      } catch (error) {
        console.error('Error parsing logs:', error);
      }
    }

    return {
      success: true,
      tokenId,
      txHash: receipt.hash
    };

  } catch (error: any) {
    console.error('Gasless NFT minting failed:', error);
    
    let errorMessage = 'Failed to mint NFT badge';
    if (error.message?.includes('insufficient funds')) {
      errorMessage = 'Platform wallet has insufficient funds for gas fees';
    } else if (error.message?.includes('already claimed')) {
      errorMessage = 'Badge already claimed for this blessing level';
    } else if (error.message) {
      errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage
    };
  }
}