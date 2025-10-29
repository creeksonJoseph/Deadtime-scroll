import { ethers } from 'ethers';

import { BADGE_MINTER_V2_ABI, BADGE_MINTER_V2_ADDRESS } from '../config/contracts';

const SCROLL_SEPOLIA_RPC = 'https://sepolia-rpc.scroll.io/';

export async function sendTipToRevivalCreator(
  revivalId: string,
  tipAmountEth: string,
  userWallet: any
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    if (!userWallet) {
      throw new Error('Wallet not connected');
    }

    // Create contract instance
    const contract = new ethers.Contract(BADGE_MINTER_V2_ADDRESS, BADGE_MINTER_V2_ABI, userWallet);

    // Convert ETH amount to wei
    const tipAmountWei = ethers.parseEther(tipAmountEth);

    console.log('Sending tip:', {
      revivalId,
      tipAmountEth,
      tipAmountWei: tipAmountWei.toString()
    });

    // Send tip transaction
    const tx = await contract.tipRevivalCreator(revivalId, {
      value: tipAmountWei
    });

    console.log('Tip transaction sent:', tx.hash);

    // Wait for confirmation
    const receipt = await tx.wait();
    
    console.log('Tip transaction confirmed:', receipt);

    return {
      success: true,
      txHash: receipt.hash
    };

  } catch (error: any) {
    console.error('Tip sending failed:', error);
    
    let errorMessage = 'Failed to send tip';
    if (error.message?.includes('insufficient funds')) {
      errorMessage = 'Insufficient ETH balance for tip + gas fees';
    } else if (error.message?.includes('user rejected')) {
      errorMessage = 'Transaction cancelled by user';
    } else if (error.message?.includes('Cannot tip yourself')) {
      errorMessage = 'You cannot tip your own revival';
    } else if (error.message) {
      errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage
    };
  }
}

export async function registerRevivalCreator(
  revivalId: string,
  creatorAddress: string
): Promise<{ success: boolean; error?: string }> {
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

    console.log('Registering revival creator:', {
      revivalId,
      creatorAddress
    });

    // Register revival creator
    const tx = await contract.setRevivalCreator(revivalId, creatorAddress);
    await tx.wait();

    console.log('Revival creator registered successfully');

    return { success: true };

  } catch (error: any) {
    console.error('Failed to register revival creator:', error);
    return {
      success: false,
      error: error.message || 'Failed to register revival creator'
    };
  }
}