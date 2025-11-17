const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  // 1. Compile contracts
  await hre.run("compile");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // ----------------------------------------------------
  // 2. Deploy LandRegistry (NFT Contract)
  // ----------------------------------------------------
  const LandRegistry = await hre.ethers.getContractFactory("LandRegistry");
  const landRegistry = await LandRegistry.deploy();
  await landRegistry.deployed();
  console.log("LandRegistry deployed to:", landRegistry.address);

  // ----------------------------------------------------
  // 3. Deploy Marketplace
  // ----------------------------------------------------
  // We pass '1' as the constructor argument (1% fee)
  const Marketplace = await hre.ethers.getContractFactory("Marketplace");
  const marketplace = await Marketplace.deploy(1);
  await marketplace.deployed();
  console.log("Marketplace deployed to:", marketplace.address);

  // ----------------------------------------------------
  // 4. Save ABIs to the Frontend
  // ----------------------------------------------------
  // This targets your NEW Next.js folder structure
  const frontendAbisDir = path.join(__dirname, "..", "frontend", "lib", "abis");

  if (!fs.existsSync(frontendAbisDir)) {
    fs.mkdirSync(frontendAbisDir, { recursive: true });
  }

  // Helper function to get the ABI from the artifacts
  const saveAbi = (name) => {
    const artifactPath = path.join(
      __dirname,
      "..",
      "artifacts",
      "contracts",
      `${name}.sol`,
      `${name}.json`
    );
    
    const artifact = JSON.parse(fs.readFileSync(artifactPath));
    const abiContent = { abi: artifact.abi }; // Keep the structure compatible with your constants.ts
    
    fs.writeFileSync(
      path.join(frontendAbisDir, `${name}.json`),
      JSON.stringify(abiContent, null, 2)
    );
  };

  saveAbi("LandRegistry");
  saveAbi("Marketplace");

  console.log("----------------------------------------------------");
  console.log("✅ Files saved to: frontend/lib/abis/");
  console.log("👉 UPDATE your frontend/lib/constants.ts with these addresses:");
  console.log(`   export const LAND_REGISTRY_ADDRESS = "${landRegistry.address}";`);
  console.log(`   export const MARKETPLACE_ADDRESS = "${marketplace.address}";`);
  console.log("----------------------------------------------------");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});