const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying BadgeMinterV2 to Scroll Mainnet...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Check balance
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  // Deploy the contract
  const BadgeMinterV2 = await ethers.getContractFactory("BadgeMinterV2");
  
  // Base URI for NFT metadata (you can update this later)
  const baseURI = "https://deadtime-scroll.vercel.app/api/metadata/";
  
  console.log("Deploying contract...");
  const badgeMinter = await BadgeMinterV2.deploy(baseURI);
  
  console.log("Waiting for deployment confirmation...");
  await badgeMinter.waitForDeployment();
  
  const contractAddress = await badgeMinter.getAddress();
  console.log("✅ BadgeMinterV2 deployed to:", contractAddress);
  
  // Verify deployment
  console.log("Verifying deployment...");
  const owner = await badgeMinter.owner();
  console.log("Contract owner:", owner);
  console.log("Deployer address:", deployer.address);
  
  console.log("\n🎉 Deployment Summary:");
  console.log("======================");
  console.log("Network: Scroll Mainnet");
  console.log("Contract Address:", contractAddress);
  console.log("Owner:", owner);
  console.log("Base URI:", baseURI);
  
  console.log("\n📝 Next Steps:");
  console.log("1. Update BADGE_MINTER_V2_ADDRESS in your app config");
  console.log("2. Verify contract on Scrollscan (optional)");
  console.log("3. Test the contract functionality");
  
  return contractAddress;
}

main()
  .then((address) => {
    console.log(`\n✅ Contract deployed successfully at: ${address}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });