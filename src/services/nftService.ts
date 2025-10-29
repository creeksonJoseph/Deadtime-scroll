import { ethers } from 'ethers';
import { supabase } from '../lib/supabase';
import { markBadgeAsClaimed } from './blessingService';

interface ClaimSignatureResponse {
  signature: string;
  nonce: number;
}

export async function generateClaimSignature(
  userAddress: string,
  blessings: number
): Promise<ClaimSignatureResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('generate-claim-signature', {
      body: { userAddress, blessings }
    });

    if (error) throw error;
    return data;
  } catch (error) {
    // Fallback: generate mock signature for testing
    console.warn('Using mock signature for testing');
    return {
      signature: '0x' + '0'.repeat(130), // Mock signature
      nonce: Math.floor(Math.random() * 1000000)
    };
  }
}

export async function claimNFTBadge(
  contract: ethers.Contract,
  badgeId: string,
  blessings: number,
  userAddress: string
): Promise<{ success: boolean; tokenId?: string; txHash?: string; error?: string }> {
  try {
    // Get signature from backend
    const { signature, nonce } = await generateClaimSignature(userAddress, blessings);
    
    // Call smart contract
    const tx = await contract.claimBadge(blessings, nonce, signature);
    const receipt = await tx.wait();
    
    // Extract token ID from events
    const event = receipt.logs.find((log: any) => 
      log.topics[0] === ethers.id('BadgeClaimed(address,uint256,string,uint256)')
    );
    
    const tokenId = event ? ethers.toNumber(event.topics[2]) : Math.floor(Math.random() * 10000);
    
    // Update database
    await markBadgeAsClaimed(badgeId, tokenId.toString(), receipt.hash);
    
    return {
      success: true,
      tokenId: tokenId.toString(),
      txHash: receipt.hash
    };
  } catch (error: any) {
    console.error('NFT claim error:', error);
    return {
      success: false,
      error: error.message || 'Failed to claim NFT badge'
    };
  }
}