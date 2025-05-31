import { ethers } from "hardhat";
import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("Scoring", function () {
  async function deployScoringFixture() {
    const [owner, user1, user2, unauthorizedUser] = await ethers.getSigners();

    const ScoringFactory = await ethers.getContractFactory("Scoring");
    const scoringContract = await ScoringFactory.deploy();
    await scoringContract.waitForDeployment();

    return { scoringContract, owner, user1, user2, unauthorizedUser };
  }

  describe("Deployment", function () {
    it("Should set the deployer as the owner", async function () {
      const { scoringContract, owner } = await loadFixture(deployScoringFixture);
      expect(await scoringContract.owner()).to.equal(owner.address);
    });

    it("Should initialize user scores to default values", async function () {
      const { scoringContract, user1 } = await loadFixture(deployScoringFixture);
      const score = await scoringContract.getUserScore(user1.address);
      expect(score.quizCompletions).to.equal(0);
      expect(score.hasSubscribedToNewsletter).to.be.false;
      expect(score.hasBookedCall).to.be.false;
    });
  });

  describe("submitQuizAttestation", function () {
    it("Should increment quizCompletions for the caller", async function () {
      const { scoringContract, user1 } = await loadFixture(deployScoringFixture);
      await scoringContract.connect(user1).submitQuizAttestation();
      const score = await scoringContract.getUserScore(user1.address);
      expect(score.quizCompletions).to.equal(1);
    });

    it("Should emit ScoreUpdated event", async function () {
      const { scoringContract, user1 } = await loadFixture(deployScoringFixture);
      await expect(scoringContract.connect(user1).submitQuizAttestation())
        .to.emit(scoringContract, "ScoreUpdated")
        .withArgs(user1.address, [1, false, false]); // score struct: [quizCompletions, newsletter, callBooked]
    });

    it("Should allow multiple attestations from the same user", async function () {
      const { scoringContract, user1 } = await loadFixture(deployScoringFixture);
      await scoringContract.connect(user1).submitQuizAttestation();
      await scoringContract.connect(user1).submitQuizAttestation();
      const score = await scoringContract.getUserScore(user1.address);
      expect(score.quizCompletions).to.equal(2);
    });
  });

  describe("updateNewsletterSubscription", function () {
    it("Should allow owner to update newsletter subscription status", async function () {
      const { scoringContract, owner, user1 } = await loadFixture(deployScoringFixture);
      await scoringContract.connect(owner).updateNewsletterSubscription(user1.address, true);
      const score = await scoringContract.getUserScore(user1.address);
      expect(score.hasSubscribedToNewsletter).to.be.true;
    });

    it("Should emit ScoreUpdated event on newsletter update", async function () {
      const { scoringContract, owner, user1 } = await loadFixture(deployScoringFixture);
      await expect(scoringContract.connect(owner).updateNewsletterSubscription(user1.address, true))
        .to.emit(scoringContract, "ScoreUpdated")
        .withArgs(user1.address, [0, true, false]);
    });

    it("Should NOT allow non-owner to update newsletter subscription", async function () {
      const { scoringContract, user1, unauthorizedUser } = await loadFixture(deployScoringFixture);
      await expect(scoringContract.connect(unauthorizedUser).updateNewsletterSubscription(user1.address, true))
        .to.be.revertedWithCustomError(scoringContract, "OwnableUnauthorizedAccount")
        .withArgs(unauthorizedUser.address);
    });
  });

  describe("updateCallBooking", function () {
    it("Should allow owner to update call booking status", async function () {
      const { scoringContract, owner, user1 } = await loadFixture(deployScoringFixture);
      await scoringContract.connect(owner).updateCallBooking(user1.address, true);
      const score = await scoringContract.getUserScore(user1.address);
      expect(score.hasBookedCall).to.be.true;
    });

    it("Should emit ScoreUpdated event on call booking update", async function () {
      const { scoringContract, owner, user1 } = await loadFixture(deployScoringFixture);
      await expect(scoringContract.connect(owner).updateCallBooking(user1.address, true))
        .to.emit(scoringContract, "ScoreUpdated")
        .withArgs(user1.address, [0, false, true]);
    });

    it("Should NOT allow non-owner to update call booking", async function () {
      const { scoringContract, user1, unauthorizedUser } = await loadFixture(deployScoringFixture);
      await expect(scoringContract.connect(unauthorizedUser).updateCallBooking(user1.address, true))
        .to.be.revertedWithCustomError(scoringContract, "OwnableUnauthorizedAccount")
        .withArgs(unauthorizedUser.address);
    });
  });

  describe("getUserScore", function () {
    it("Should return the correct score after multiple updates", async function () {
      const { scoringContract, owner, user1 } = await loadFixture(deployScoringFixture);

      // Quiz attestation by user1
      await scoringContract.connect(user1).submitQuizAttestation();
      // Newsletter subscription by owner for user1
      await scoringContract.connect(owner).updateNewsletterSubscription(user1.address, true);
      // Call booking by owner for user1
      await scoringContract.connect(owner).updateCallBooking(user1.address, true);

      const score = await scoringContract.getUserScore(user1.address);
      expect(score.quizCompletions).to.equal(1);
      expect(score.hasSubscribedToNewsletter).to.be.true;
      expect(score.hasBookedCall).to.be.true;

      // Another quiz attestation
      await scoringContract.connect(user1).submitQuizAttestation();
      const newScore = await scoringContract.getUserScore(user1.address);
      expect(newScore.quizCompletions).to.equal(2);
      expect(newScore.hasSubscribedToNewsletter).to.be.true; // Should remain true
    });
  });
});
