require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
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
      url: "https://scroll-sepolia-testnet.rpc.thirdweb.com",
      accounts: [process.env.VITE_PLATFORM_PRIVATE_KEY],
      chainId: 534351,
    },
  },
};