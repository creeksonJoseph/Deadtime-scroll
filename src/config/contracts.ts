export const BADGE_MINTER_ADDRESS = "0xd8b934580fcE35a11B58C6D73aDeE468a2833fa8";
export const BADGE_MINTER_V2_ADDRESS = "0xFf1101fdd63e5A4b515d4c06B5bA185715Fb2f18";

export const BADGE_MINTER_ABI = [
  "function claimBadge(uint256 blessings, uint256 nonce, bytes calldata signature) external returns (uint256)",
  "function badgeForBlessings(uint256 blessings) external view returns (string memory)",
  "function authorizedSigner() external view returns (address)",
  "function balanceOf(address owner) external view returns (uint256)",
  "function tokenURI(uint256 tokenId) external view returns (string memory)",
  "event BadgeClaimed(address indexed claimer, uint256 indexed tokenId, string badgeName, uint256 blessings)"
];

export const BADGE_MINTER_V2_ABI = [
  "function tipRevivalCreator(string memory revivalId) external payable",
  "function setRevivalCreator(string memory revivalId, address creator) external",
  "function mintBadgeFor(address to, uint256 blessings) external returns (uint256)",
  "function totalTipsReceived(address creator) external view returns (uint256)",
  "event TipSent(address indexed from, address indexed to, string revivalId, uint256 amount)",
  "event BadgeMinted(address indexed to, uint256 indexed tokenId, string badgeName, uint256 blessings)"
];

export const SCROLL_SEPOLIA_CONFIG = {
  chainId: 534351,
  name: "Scroll Sepolia",
  rpcUrl: "https://sepolia-rpc.scroll.io/",
  blockExplorer: "https://sepolia.scrollscan.com"
};