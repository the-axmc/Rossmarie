import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying Scoring contract with the account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  try {
    const ScoringFactory = await ethers.getContractFactory("Scoring");
    const scoringContract = await ScoringFactory.deploy();

    await scoringContract.waitForDeployment();
    const contractAddress = await scoringContract.getAddress();

    console.log(`Scoring contract deployed to: ${contractAddress}`);

  } catch (error) {
    console.error("Error deploying Scoring contract:", error);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("Unhandled error in deployment script:", error);
  process.exitCode = 1;
});
