const hre = require("hardhat");

async function main() {
  console.log("Deploying BadgeMinterV2 to Scroll Sepolia...");

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Check balance
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");

  // Deploy the contract
  const BadgeMinterV2 = await hre.ethers.getContractFactory("BadgeMinterV2");
  
  // Base URI for NFT metadata (you can change this)
  const baseURI = "https://api.deadtime-scroll.com/metadata/";
  
  console.log("Deploying contract with baseURI:", baseURI);
  
  const contract = await BadgeMinterV2.deploy(baseURI);
  
  await contract.waitForDeployment();
  
  const contractAddress = await contract.getAddress();
  
  console.log("✅ BadgeMinterV2 deployed to:", contractAddress);
  console.log("🔗 View on Scroll Sepolia Explorer:");
  console.log(`https://sepolia.scrollscan.com/address/${contractAddress}`);
  
  // Verify contract ownership
  const owner = await contract.owner();
  console.log("📋 Contract owner:", owner);
  console.log("✅ Owner matches deployer:", owner === deployer.address);
  
  // Save deployment info
  const deploymentInfo = {
    contractAddress: contractAddress,
    deployer: deployer.address,
    network: "scrollSepolia",
    chainId: 534351,
    blockNumber: await hre.ethers.provider.getBlockNumber(),
    timestamp: new Date().toISOString(),
    baseURI: baseURI
  };
  
  console.log("\n📄 Deployment Summary:");
  console.log(JSON.stringify(deploymentInfo, null, 2));
  
  console.log("\n🔧 Next Steps:");
  console.log("1. Update BADGE_MINTER_V2_ADDRESS in tippingService.ts");
  console.log("2. Update contract address in config/contracts.ts");
  console.log("3. Test tipping functionality");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });