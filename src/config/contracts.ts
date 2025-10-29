export const BADGE_MINTER_ADDRESS = "0xd8b934580fcE35a11B58C6D73aDeE468a2833fa8";

export const BADGE_MINTER_ABI = [
  "function claimBadge(uint256 blessings, uint256 nonce, bytes calldata signature) external returns (uint256)",
  "function badgeForBlessings(uint256 blessings) external view returns (string memory)",
  "function authorizedSigner() external view returns (address)",
  "function balanceOf(address owner) external view returns (uint256)",
  "function tokenURI(uint256 tokenId) external view returns (string memory)",
  "event BadgeClaimed(address indexed claimer, uint256 indexed tokenId, string badgeName, uint256 blessings)"
];

export const SCROLL_SEPOLIA_CONFIG = {
  chainId: 534351,
  name: "Scroll Sepolia",
  rpcUrl: "https://sepolia-rpc.scroll.io/",
  blockExplorer: "https://sepolia.scrollscan.com"
};