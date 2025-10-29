import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";

/** @type import('hardhat/config').HardhatUserConfig */
export default {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    scrollSepolia: {
      url: "https://sepolia-rpc.scroll.io/",
      accounts: [process.env.VITE_PLATFORM_PRIVATE_KEY],
      chainId: 534351,
    },
  },
  etherscan: {
    apiKey: {
      scrollSepolia: "abc", // Scroll Sepolia doesn't require real API key
    },
    customChains: [
      {
        network: "scrollSepolia",
        chainId: 534351,
        urls: {
          apiURL: "https://sepolia-blockscout.scroll.io/api",
          browserURL: "https://sepolia-blockscout.scroll.io/",
        },
      },
    ],
  },
};