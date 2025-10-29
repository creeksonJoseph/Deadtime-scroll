# 🚀 BadgeMinterV2 Deployment Instructions

## Network Issues
The deployment is failing due to network connectivity issues with Scroll Sepolia RPC endpoints. Here are alternative deployment methods:

## Option 1: Deploy via Remix IDE (Recommended)

1. **Go to Remix IDE**: https://remix.ethereum.org/
2. **Create new file**: `BadgeMinterV2.sol`
3. **Copy contract code** from `contracts/BadgeMinterV2.sol`
4. **Compile**: 
   - Solidity version: 0.8.19
   - Enable optimization: 200 runs
5. **Deploy**:
   - Environment: Injected Provider (MetaMask)
   - Network: Scroll Sepolia Testnet
   - Constructor parameter: `"https://api.deadtime-scroll.com/metadata/"`
   - Deploy with your platform wallet

## Option 2: Try Different RPC Endpoints

Update `hardhat.config.js` with these alternatives:

```javascript
networks: {
  scrollSepolia: {
    url: "https://rpc.ankr.com/scroll_sepolia_testnet",
    // or
    url: "https://scroll-sepolia-testnet.rpc.thirdweb.com",
    accounts: [process.env.VITE_PLATFORM_PRIVATE_KEY],
    chainId: 534351,
  },
}
```

Then run: `npx hardhat run scripts/deploy.js --network scrollSepolia`

## Option 3: Manual Deployment Steps

1. **Ensure wallet has Scroll Sepolia ETH**
2. **Use MetaMask + Remix for deployment**
3. **Copy the deployed contract address**
4. **Update frontend files**:

### Files to Update After Deployment:

```javascript
// src/services/tippingService.ts
const BADGE_MINTER_V2_ADDRESS = 'YOUR_NEW_CONTRACT_ADDRESS';

// src/config/contracts.ts (create if needed)
export const BADGE_MINTER_V2_ADDRESS = 'YOUR_NEW_CONTRACT_ADDRESS';
export const BADGE_MINTER_V2_ABI = [
  "function tipRevivalCreator(string memory revivalId) external payable",
  "function setRevivalCreator(string memory revivalId, address creator) external",
  "function mintBadgeFor(address to, uint256 blessings) external returns (uint256)",
  "function totalTipsReceived(address creator) external view returns (uint256)",
  "event TipSent(address indexed from, address indexed to, string revivalId, uint256 amount)",
  "event BadgeMinted(address indexed to, uint256 indexed tokenId, string badgeName, uint256 blessings)"
];
```

## ✅ After Successful Deployment:

1. **Contract Address**: Update in `tippingService.ts`
2. **Test Tipping**: Create revival → Register creator → Test tip
3. **Test NFT Minting**: Test gasless badge claiming
4. **Verify on Explorer**: Check contract on https://sepolia.scrollscan.com/

## 🔧 Network Configuration:

- **Network**: Scroll Sepolia Testnet
- **Chain ID**: 534351
- **RPC**: https://sepolia-rpc.scroll.io/
- **Explorer**: https://sepolia.scrollscan.com/
- **Faucet**: https://sepolia.scroll.io/faucet

The contract is ready for deployment - just need to overcome the network connectivity issues!