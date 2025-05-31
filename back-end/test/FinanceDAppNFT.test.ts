import { ethers } from "hardhat";
import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("FinanceDAppNFT", function () {
  // We define a fixture to reuse the same setup in every test.
  async function deployFinanceDAppNFTFixture() {
    const [owner, addr1, addr2] = await ethers.getSigners();

    const FinanceDAppNFTFactory = await ethers.getContractFactory("FinanceDAppNFT");
    const nftName = "FinanceDAppNFT";
    const nftSymbol = "FDN";
    const financeDAppNFT = await FinanceDAppNFTFactory.deploy(nftName, nftSymbol);
    await financeDAppNFT.waitForDeployment();

    return { financeDAppNFT, nftName, nftSymbol, owner, addr1, addr2 };
  }

  describe("Deployment", function () {
    it("Should set the right name and symbol", async function () {
      const { financeDAppNFT, nftName, nftSymbol } = await loadFixture(deployFinanceDAppNFTFixture);
      expect(await financeDAppNFT.name()).to.equal(nftName);
      expect(await financeDAppNFT.symbol()).to.equal(nftSymbol);
    });

    it("Should assign the deployer as the owner", async function () {
      const { financeDAppNFT, owner } = await loadFixture(deployFinanceDAppNFTFixture);
      expect(await financeDAppNFT.owner()).to.equal(owner.address);
    });
  });

  describe("Minting", function () {
    it("Should allow the owner to mint an NFT", async function () {
      const { financeDAppNFT, owner, addr1 } = await loadFixture(deployFinanceDAppNFTFixture);
      await expect(financeDAppNFT.connect(owner).mint(addr1.address))
        .to.emit(financeDAppNFT, "Transfer")
        .withArgs(ethers.ZeroAddress, addr1.address, 0); // Assuming first token ID is 0
      expect(await financeDAppNFT.ownerOf(0)).to.equal(addr1.address);
      expect(await financeDAppNFT.balanceOf(addr1.address)).to.equal(1);
    });

    it("Should increment token IDs", async function () {
      const { financeDAppNFT, owner, addr1, addr2 } = await loadFixture(deployFinanceDAppNFTFixture);
      await financeDAppNFT.connect(owner).mint(addr1.address); // Token ID 0
      await financeDAppNFT.connect(owner).mint(addr2.address); // Token ID 1
      expect(await financeDAppNFT.ownerOf(0)).to.equal(addr1.address);
      expect(await financeDAppNFT.ownerOf(1)).to.equal(addr2.address);
    });

    it("Should NOT allow non-owner to mint an NFT", async function () {
      const { financeDAppNFT, addr1, addr2 } = await loadFixture(deployFinanceDAppNFTFixture);
      await expect(financeDAppNFT.connect(addr1).mint(addr2.address))
        .to.be.revertedWithCustomError(financeDAppNFT, "OwnableUnauthorizedAccount")
        .withArgs(addr1.address);
    });
  });

  describe("Transfers", function () {
    it("Should allow owner of an NFT to transfer it", async function () {
      const { financeDAppNFT, owner, addr1, addr2 } = await loadFixture(deployFinanceDAppNFTFixture);
      await financeDAppNFT.connect(owner).mint(addr1.address); // Mint token 0 to addr1

      await expect(financeDAppNFT.connect(addr1).transferFrom(addr1.address, addr2.address, 0))
        .to.emit(financeDAppNFT, "Transfer")
        .withArgs(addr1.address, addr2.address, 0);

      expect(await financeDAppNFT.ownerOf(0)).to.equal(addr2.address);
      expect(await financeDAppNFT.balanceOf(addr1.address)).to.equal(0);
      expect(await financeDAppNFT.balanceOf(addr2.address)).to.equal(1);
    });

    it("Should allow approved address to transfer an NFT", async function () {
      const { financeDAppNFT, owner, addr1, addr2 } = await loadFixture(deployFinanceDAppNFTFixture);
      await financeDAppNFT.connect(owner).mint(addr1.address); // Mint token 0 to addr1
      await financeDAppNFT.connect(addr1).approve(addr2.address, 0); // addr1 approves addr2 for token 0

      await expect(financeDAppNFT.connect(addr2).transferFrom(addr1.address, addr2.address, 0))
        .to.emit(financeDAppNFT, "Transfer")
        .withArgs(addr1.address, addr2.address, 0);

      expect(await financeDAppNFT.ownerOf(0)).to.equal(addr2.address);
    });
  });

  describe("Burning (implicitly via transfer to zero address)", function () {
    it("Should allow burning of an NFT by transferring to the zero address", async function () {
      const { financeDAppNFT, owner, addr1 } = await loadFixture(deployFinanceDAppNFTFixture);
      await financeDAppNFT.connect(owner).mint(addr1.address); // Mint token 0 to addr1

      // Transfer to zero address (burn)
      await expect(financeDAppNFT.connect(addr1).transferFrom(addr1.address, ethers.ZeroAddress, 0))
        .to.emit(financeDAppNFT, "Transfer")
        .withArgs(addr1.address, ethers.ZeroAddress, 0);

      expect(await financeDAppNFT.balanceOf(addr1.address)).to.equal(0);
      await expect(financeDAppNFT.ownerOf(0)).to.be.revertedWithCustomError(financeDAppNFT, "ERC721NonexistentToken");
    });
  });
})
