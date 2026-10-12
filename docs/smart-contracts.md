# Smart Contracts & Web3 Integration

DeadTime deploys its smart contract infrastructure on **Scroll Mainnet**, a zero-knowledge Ethereum Layer 2 rollup providing high throughput and low fees.

---

## Deployed Contracts

### `BadgeMinterV2`
The primary contract handling NFT badge awards, reputation milestones, and ETH creator tipping.

- **Network**: Scroll Mainnet
- **Chain ID**: `534352`
- **Contract Address**: [`0xCeAc210d3e6B6436E18DEc913991e4E74665fba0`](https://scrollscan.com/address/0xCeAc210d3e6B6436E18DEc913991e4E74665fba0)
- **Explorer**: [Scrollscan Contract View](https://scrollscan.com/address/0xCeAc210d3e6B6436E18DEc913991e4E74665fba0)

---

## Key Smart Contract Methods

### 1. `mintBadgeFor(address to, uint256 blessings)`
- **Access**: Restricted to Platform Relayer
- **Description**: Verifies the user's qualified blessing count and mints the corresponding ERC-721 badge to the user's wallet address without requiring the recipient to pay gas.

### 2. `tipRevivalCreator(string revivalId)`
- **Access**: Public / Any connected wallet
- **Value**: Payable (accepts ETH)
- **Description**: Direct ETH tipping mechanism. Automatically forwards 100% of the attached ETH to the registered creator wallet associated with the revival ID.

### 3. `setRevivalCreator(string revivalId, address creator)`
- **Access**: Restricted to Platform Relayer / Contract Owner
- **Description**: Maps revival identifiers to valid recipient wallet addresses for tipping destination routing.

---

## Badge Tiers & Blessing Thresholds

Badges are earned dynamically as revivals gather community endorsements ("blessings"):

| Badge Name | Blessing Threshold | Rarity Tier | Description |
|---|---|---|---|
| **Grave Keeper** | 1 blessing | Common | Initiated into the revival collective |
| **Necromancer** | 30 blessings | Uncommon | Breathing fresh life into abandoned codebases |
| **Digital Ghost** | 50 blessings | Rare | Proven contribution across multiple generations |
| **Phoenix** | 70 blessings | Epic | Architect of a major revived platform |
| **Soul Shepherd** | 100 blessings | Legendary | Guiding massive community adoption |
| **Master Curator** | 150+ blessings | Mythic | Pillar of the DeadTime ecosystem |

---

## Gasless Transaction Architecture

To eliminate Web3 UX friction, DeadTime adopts a sponsored relayer pattern for badge claims.

```text
User initiates badge claim
       │
       ▼
DeadTime Backend verifies database thresholds
       │
       ▼
Platform Relayer Wallet signs & broadcasts `mintBadgeFor` transaction (pays gas)
       │
       ▼
Scroll Mainnet mints ERC-721 badge directly to User's wallet
```

### Responsibility Matrix:
- **Platform Sponsored Gas**:
  - `mintBadgeFor` (NFT badge claims)
  - Badge metadata synchronization
  - Platform registry calls
  - *Platform Relayer*: `0xa9bf1aeab85ea771ddeaf4036a98554f0e81bdd1`
- **User-Paid Gas**:
  - Direct ETH tipping (`tipRevivalCreator`)
  - Direct custom contract transactions initiated outside the standard platform flow
