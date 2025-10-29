import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { BADGE_MINTER_ADDRESS, BADGE_MINTER_ABI, SCROLL_SEPOLIA_CONFIG } from '../config/contracts';

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
    if (!provider) return false;

    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${SCROLL_SEPOLIA_CONFIG.chainId.toString(16)}` }],
        });
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${SCROLL_SEPOLIA_CONFIG.chainId.toString(16)}`,
              chainName: SCROLL_SEPOLIA_CONFIG.name,
              rpcUrls: [SCROLL_SEPOLIA_CONFIG.rpcUrl],
              blockExplorerUrls: [SCROLL_SEPOLIA_CONFIG.blockExplorer],
            }],
          });
        }
      }

      const web3Signer = await provider.getSigner();
      setSigner(web3Signer);
      
      const badgeContract = new ethers.Contract(
        BADGE_MINTER_ADDRESS,
        BADGE_MINTER_ABI,
        web3Signer
      );
      setContract(badgeContract);
      setIsConnected(true);
      return true;
    } catch (error) {
      console.error('Error connecting wallet:', error);
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