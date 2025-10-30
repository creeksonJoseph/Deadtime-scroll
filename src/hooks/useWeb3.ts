import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { BADGE_MINTER_ADDRESS, BADGE_MINTER_ABI, CURRENT_NETWORK } from '../config/contracts';

export function useWeb3() {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    initializeWeb3();
  }, []);

  const initializeWeb3 = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const web3Provider = new ethers.BrowserProvider(window.ethereum);
        setProvider(web3Provider);

        const accounts = await web3Provider.listAccounts();
        if (accounts.length > 0) {
          const web3Signer = await web3Provider.getSigner();
          setSigner(web3Signer);
          
          const badgeContract = new ethers.Contract(
            BADGE_MINTER_ADDRESS,
            BADGE_MINTER_ABI,
            web3Signer
          );
          setContract(badgeContract);
          setIsConnected(true);
        }
      } catch (error) {
        console.error('Error initializing Web3:', error);
      }
    }
  };

  const connectWallet = async () => {
    console.log('🔗 Attempting to connect wallet...');
    
    if (!provider) {
      console.error('❌ No provider available');
      return false;
    }

    try {
      console.log('💳 Requesting account access...');
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      console.log('🌐 Checking/switching to Scroll Sepolia network...');
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${CURRENT_NETWORK.chainId.toString(16)}` }],
        });
        console.log('✅ Successfully switched to Scroll Sepolia');
      } catch (switchError: any) {
        console.log('⚠️ Network switch failed, attempting to add network:', switchError.code);
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${CURRENT_NETWORK.chainId.toString(16)}`,
              chainName: CURRENT_NETWORK.name,
              rpcUrls: [CURRENT_NETWORK.rpcUrl],
              blockExplorerUrls: [CURRENT_NETWORK.blockExplorer],
            }],
          });
          console.log('✅ Successfully added Scroll Sepolia network');
        }
      }

      console.log('🔍 Getting signer...');
      const web3Signer = await provider.getSigner();
      const signerAddress = await web3Signer.getAddress();
      console.log('👤 Signer address:', signerAddress);
      setSigner(web3Signer);
      
      console.log('📄 Creating contract instance...');
      const badgeContract = new ethers.Contract(
        BADGE_MINTER_ADDRESS,
        BADGE_MINTER_ABI,
        web3Signer
      );
      setContract(badgeContract);
      setIsConnected(true);
      
      console.log('🎉 Wallet connected successfully!');
      return true;
    } catch (error) {
      console.error('❌ Error connecting wallet:', {
        error: error.message,
        code: error.code
      });
      return false;
    }
  };

  return {
    provider,
    signer,
    contract,
    isConnected,
    connectWallet,
  };
}