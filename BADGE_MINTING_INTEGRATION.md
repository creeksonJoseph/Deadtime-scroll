# Badge Minting Integration Guide

## Overview

The blessing and badge system is fully implemented with off-chain tracking in Supabase. To enable NFT minting on Scroll Sepolia testnet, you need to deploy smart contracts and integrate them with the frontend.

## What's Already Built

### Database Schema
- `revival_blessings` table - tracks all blessings given to revivals
- `user_badges` table - tracks earned badges and their claim status
- Automatic badge awarding triggers when blessing thresholds are reached

### Badge Tiers
| Badge | Threshold | Icon |
|-------|-----------|------|
| Grave Keeper | 10 blessings | ⚰️ |
| Necromancer | 30 blessings | 🔮 |
| Digital Ghost | 50 blessings | 👻 |
| Phoenix | 70 blessings | 🔥 |
| Soul Shepherd | 100 blessings | ✨ |
| Master Curator | 150+ blessings | 👑 |

### Frontend Features
- Blessing button on revival detail pages
- Badge display on user profile pages
- "Claim NFT Badge" buttons for unclaimed badges
- Progress tracking towards next badge tier
- Toast notifications for blessing actions

## Smart Contract Integration (To Be Implemented)

### Step 1: Deploy Smart Contracts

You need to create and deploy two contracts to Scroll Sepolia:

1. **Badge NFT Contract (ERC-721)**
   - Implement ERC-721 standard
   - Store badge metadata (type, revival_id, earned_at)
   - Restrict minting to authorized addresses only

2. **Badge Minter Contract**
   - Verify badge eligibility by checking the database
   - Handle minting requests from authorized backend
   - Emit events for successful mints

### Step 2: Create Minting Service

Create a new file: `src/services/mintingService.ts`

```typescript
import { ethers } from 'ethers';
import { markBadgeAsClaimed } from './blessingService';

// Add your contract addresses here after deployment
const BADGE_CONTRACT_ADDRESS = 'YOUR_DEPLOYED_BADGE_CONTRACT_ADDRESS';
const MINTER_CONTRACT_ADDRESS = 'YOUR_DEPLOYED_MINTER_CONTRACT_ADDRESS';

// Add your contract ABIs here
const BADGE_ABI = []; // Your Badge NFT ABI
const MINTER_ABI = []; // Your Minter ABI

export async function mintBadgeNFT(
  badge: Badge,
  userAddress: string
): Promise<{ success: boolean; tokenId?: string; txHash?: string; error?: string }> {
  try {
    // Connect to user's wallet
    if (!window.ethereum) {
      return { success: false, error: 'Please install MetaMask' };
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    // Initialize minter contract
    const minterContract = new ethers.Contract(
      MINTER_CONTRACT_ADDRESS,
      MINTER_ABI,
      signer
    );

    // Call mint function
    const tx = await minterContract.mintBadge(
      userAddress,
      badge.badge_type,
      badge.revival_id
    );

    // Wait for transaction confirmation
    const receipt = await tx.wait();

    // Extract token ID from event logs
    const tokenId = extractTokenIdFromReceipt(receipt);

    // Update database to mark badge as claimed
    await markBadgeAsClaimed(badge.id, tokenId, receipt.hash);

    return {
      success: true,
      tokenId,
      txHash: receipt.hash
    };
  } catch (error) {
    console.error('Error minting badge:', error);
    return {
      success: false,
      error: 'Failed to mint badge. Please try again.'
    };
  }
}

function extractTokenIdFromReceipt(receipt: any): string {
  // Parse the Transfer event to get token ID
  // This depends on your contract's event structure
  return '0'; // Placeholder
}
```

### Step 3: Update Profile Page

Replace the placeholder minting handler in `UserProfilePage.tsx`:

```typescript
const handleClaimBadge = async (badge: Badge) => {
  if (!walletAddress) {
    setToastMessage('Please connect your wallet');
    setToastType('error');
    setShowToast(true);
    return;
  }

  setToastMessage('Minting your badge NFT...');
  setToastType('success');
  setShowToast(true);

  const result = await mintBadgeNFT(badge, walletAddress);

  if (result.success) {
    setToastMessage(`Badge minted successfully! Token ID: ${result.tokenId}`);
    setToastType('success');
    await loadBadges(); // Reload badges to show updated status
  } else {
    setToastMessage(result.error || 'Failed to mint badge');
    setToastType('error');
  }

  setShowToast(true);
};
```

### Step 4: Add Web3 Dependencies

```bash
npm install ethers
```

### Step 5: Configure Network

Add Scroll Sepolia network configuration to the wallet context or create a separate config file:

```typescript
export const SCROLL_SEPOLIA = {
  chainId: '0x8274F', // 534351 in hex
  chainName: 'Scroll Sepolia Testnet',
  rpcUrls: ['https://sepolia-rpc.scroll.io/'],
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18
  },
  blockExplorerUrls: ['https://sepolia.scrollscan.com/']
};
```

## Testing Flow

1. **Test Blessing System**
   - Connect wallet
   - Navigate to a revival
   - Click "Bless" button
   - Verify blessing count increases

2. **Test Badge Earning**
   - Create a revival
   - Have multiple wallets bless it
   - When threshold is reached, check profile page
   - Badge should appear as "unclaimed"

3. **Test NFT Minting** (after contract deployment)
   - Go to profile page
   - Click "Claim NFT Badge"
   - Approve MetaMask transaction
   - Verify badge shows as "claimed" with token ID
   - Check transaction on Scroll Sepolia explorer

## Database Queries for Testing

```sql
-- Check blessing counts for a revival
SELECT revival_id, COUNT(*) as blessing_count
FROM revival_blessings
GROUP BY revival_id;

-- Check earned badges
SELECT * FROM user_badges WHERE user_wallet = 'YOUR_WALLET_ADDRESS';

-- Manually trigger badge check
SELECT check_and_award_badges('REVIVAL_ID');
```

## Security Considerations

1. **Minting Authorization**: Only allow badge minting if the database shows the badge as earned
2. **One Badge Per Tier**: Prevent duplicate badge minting for the same tier
3. **Wallet Verification**: Ensure the connected wallet matches the badge owner
4. **Gas Optimization**: Batch minting if possible
5. **Error Handling**: Properly handle failed transactions and update database accordingly

## Next Steps

1. Deploy your smart contracts to Scroll Sepolia
2. Add contract addresses and ABIs to the minting service
3. Install ethers.js: `npm install ethers`
4. Update the minting handler in UserProfilePage
5. Test the complete flow on testnet
6. Monitor gas costs and optimize if needed

## Support

For smart contract development assistance, consider:
- Scroll Sepolia documentation: https://docs.scroll.io/
- OpenZeppelin Contracts: https://docs.openzeppelin.com/
- Hardhat tutorials: https://hardhat.org/tutorial
