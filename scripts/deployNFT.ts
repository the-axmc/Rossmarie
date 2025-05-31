import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying FinanceDAppNFT contract with the account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  const nftName = "FinanceDApp NFT";
  const nftSymbol = "FNFT";

  try {
    const FinanceDAppNFTFactory = await ethers.getContractFactory("FinanceDAppNFT");
    const financeDAppNFT = await FinanceDAppNFTFactory.deploy(nftName, nftSymbol);

    await financeDAppNFT.waitForDeployment();
    const contractAddress = await financeDAppNFT.getAddress();

    console.log(`FinanceDAppNFT contract deployed to: ${contractAddress}`);
    console.log(`Constructor arguments: Name: "${nftName}", Symbol: "${nftSymbol}"`);

  } catch (error) {
    console.error("Error deploying FinanceDAppNFT contract:", error);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("Unhandled error in deployment script:", error);
  process.exitCode = 1;
});
