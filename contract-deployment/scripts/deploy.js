const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying BadgeMinterV2 to Scroll Sepolia...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);

  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH");

  const BadgeMinterV2 = await hre.ethers.getContractFactory("BadgeMinterV2");
  const baseURI = "https://api.deadtime-scroll.com/metadata/";
  
  console.log("⏳ Deploying contract...");
  const contract = await BadgeMinterV2.deploy(baseURI);
  await contract.waitForDeployment();
  
  const contractAddress = await contract.getAddress();
  
  console.log("✅ BadgeMinterV2 deployed to:", contractAddress);
  console.log("🔗 Explorer:", `https://sepolia.scrollscan.com/address/${contractAddress}`);
  
  const owner = await contract.owner();
  console.log("👤 Contract owner:", owner);
  
  console.log("\n📋 UPDATE THESE FILES:");
  console.log(`1. tippingService.ts: BADGE_MINTER_V2_ADDRESS = "${contractAddress}"`);
  console.log(`2. contracts.ts: Add new contract config`);
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});