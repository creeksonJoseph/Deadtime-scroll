import { ethers } from 'ethers';

import { BADGE_MINTER_V2_ABI, BADGE_MINTER_V2_ADDRESS } from '../config/contracts';

const SCROLL_SEPOLIA_RPC = 'https://sepolia-rpc.scroll.io/';

export async function sendTipToRevivalCreator(
  revivalId: string,
  tipAmountEth: string,
  userWallet: any
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  console.log('🚀 Starting tip transaction:', {
    revivalId,
    tipAmountEth,
    walletConnected: !!userWallet,
    contractAddress: BADGE_MINTER_V2_ADDRESS
  });

  try {
    if (!userWallet) {
      console.error('❌ Wallet not connected');
      throw new Error('Wallet not connected');
    }

    // Check wallet network
    const network = await userWallet.provider.getNetwork();
    console.log('🌐 Current network:', {
      chainId: network.chainId,
      name: network.name,
      expectedChainId: 534351
    });

    if (network.chainId !== 534351n) {
      console.warn('⚠️ Wrong network detected, switching to Scroll Sepolia (534351)');
      
      try {
        // Try to switch to Scroll Sepolia
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x82750' }], // 534351 in hex
        });
        console.log('✅ Successfully switched to Scroll Sepolia');
        
        // Refresh network info after switch
        const newNetwork = await userWallet.provider.getNetwork();
        console.log('🔄 New network:', newNetwork);
        
      } catch (switchError: any) {
        console.log('⚠️ Network switch failed, attempting to add network:', switchError.code);
        
        if (switchError.code === 4902) {
          // Network not added, add it
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x82750',
              chainName: 'Scroll Sepolia Testnet',
              rpcUrls: ['https://sepolia-rpc.scroll.io/', 'https://rpc.ankr.com/scroll_sepolia_testnet'],
              blockExplorerUrls: ['https://sepolia.scrollscan.com/'],
              nativeCurrency: {
                name: 'Ethereum',
                symbol: 'ETH',
                decimals: 18
              }
            }],
          });
          console.log('✅ Successfully added and switched to Scroll Sepolia');
        } else {
          throw new Error('Please manually switch to Scroll Sepolia network in MetaMask');
        }
      }
    }

    // Convert ETH amount to wei
    const tipAmountWei = ethers.parseEther(tipAmountEth);

    // Check wallet balance
    const walletAddress = await userWallet.getAddress();
    const balance = await userWallet.provider.getBalance(walletAddress);
    const balanceEth = ethers.formatEther(balance);
    console.log('💰 Wallet balance:', {
      walletAddress,
      balanceWei: balance.toString(),
      balanceEth,
      tipAmount: tipAmountEth,
      hasEnoughBalance: balance >= tipAmountWei
    });
    console.log('💱 Amount conversion:', {
      inputEth: tipAmountEth,
      outputWei: tipAmountWei.toString(),
      sufficientBalance: balance >= tipAmountWei
    });

    if (balance < tipAmountWei) {
      console.error('❌ Insufficient balance for tip:', {
        requiredWei: tipAmountWei.toString(),
        availableWei: balance.toString(),
        requiredEth: tipAmountEth,
        availableEth: balanceEth,
        shortfall: ethers.formatEther(tipAmountWei - balance)
      });
      throw new Error(`Insufficient ETH balance. Need ${tipAmountEth} ETH, have ${balanceEth} ETH`);
    }

    // Create contract instance
    const contract = new ethers.Contract(BADGE_MINTER_V2_ADDRESS, BADGE_MINTER_V2_ABI, userWallet);
    console.log('📄 Contract instance created');

    // Estimate gas
    try {
      const gasEstimate = await contract.tipRevivalCreator.estimateGas(revivalId, {
        value: tipAmountWei
      });
      console.log('⛽ Gas estimate:', gasEstimate.toString());
    } catch (gasError) {
      console.error('❌ Gas estimation failed:', gasError);
      throw new Error('Transaction will likely fail: ' + gasError.message);
    }

    console.log('📤 Sending transaction to contract...');
    
    // Send tip transaction
    const tx = await contract.tipRevivalCreator(revivalId, {
      value: tipAmountWei
    });

    console.log('✅ Transaction sent:', {
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      value: tx.value?.toString()
    });

    console.log('⏳ Waiting for confirmation...');
    
    // Wait for confirmation
    const receipt = await tx.wait();
    
    console.log('🎉 Transaction confirmed:', {
      hash: receipt.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed?.toString(),
      status: receipt.status
    });

    return {
      success: true,
      txHash: receipt.hash
    };

  } catch (error: any) {
    console.error('❌ Tip sending failed:', {
      error: error.message,
      code: error.code,
      reason: error.reason,
      stack: error.stack
    });
    
    let errorMessage = 'Failed to send tip';
    if (error.message?.includes('insufficient funds')) {
      errorMessage = 'Insufficient ETH balance for tip + gas fees';
    } else if (error.message?.includes('user rejected') || error.code === 4001) {
      errorMessage = 'Transaction cancelled by user';
    } else if (error.message?.includes('Cannot tip yourself')) {
      errorMessage = 'You cannot tip your own revival';
    } else if (error.reason) {
      errorMessage = error.reason;
    } else if (error.message) {
      errorMessage = error.message;
    }

    console.error('📋 Final error message:', errorMessage);

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