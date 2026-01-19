import type { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/types";
import { expect } from "chai";
import hre from "hardhat";
import type { NetworkConnection } from "hardhat/types/network";
import { deployMyMockV3AggregatorModuleFixture } from "../../scripts/fixtures/deploy-my-mock-v3-aggregator-module-fixture.js";
import { deployFundMe } from "../../scripts/helpers/deploy-fund-me.js";
import { isDevelopmentChain } from "../../scripts/helpers/deployment-helpers.js";
import {
  type FundMe,
  type MyMockV3Aggregator,
  MyMockV3Aggregator__factory,
} from "../../types/ethers-contracts/index.js";

describe("FundMe", () => {
  before(async function () {
    const { networkConfig } = await hre.network.connect();
    const chainId = networkConfig.chainId;
    if (chainId === undefined || !isDevelopmentChain(chainId)) {
      this.skip();
    }
  });

  let connection: NetworkConnection;
  let signer: HardhatEthersSigner;
  let typedAggregator: MyMockV3Aggregator;
  let typedFundMe: FundMe;

  beforeEach(async () => {
    connection = await hre.network.connect();
    const { networkHelpers, ethers } = connection;
    const { myMockV3Aggregator } = await networkHelpers.loadFixture(
      deployMyMockV3AggregatorModuleFixture,
    );
    const myMockV3AggregatorAddress = await myMockV3Aggregator.getAddress();

    [signer] = await ethers.getSigners();
    typedAggregator = MyMockV3Aggregator__factory.connect(
      myMockV3AggregatorAddress,
      signer,
    );
    typedFundMe = await deployFundMe(connection, myMockV3AggregatorAddress);
  });

  describe("constructor", async () => {
    it("should set the price feed address correctly", async () => {
      const response = await typedFundMe.getPriceFeed();
      const expectedAddress = await typedAggregator.getAddress();
      expect(response).to.equal(expectedAddress);
    });
  });

  describe("fund", async () => {
    it("should fail if not enough ETH is sent", async () => {
      await expect(typedFundMe.fund()).to.be.revertedWith(
        "You need to spend more ETH!",
      );
    });

    it("should update the amount funded data structure", async () => {
      const sendValue = connection.ethers.parseEther("1");
      await typedFundMe.fund({ value: sendValue });
      const response = await typedFundMe.getAddressToAmountFunded(
        await signer.getAddress(),
      );
      expect(response).to.equal(sendValue);
    });

    it("should add funder to array of funders", async () => {
      const sendValue = connection.ethers.parseEther("1");
      await typedFundMe.fund({ value: sendValue });
      const funder = await typedFundMe.getFunder(0);
      expect(funder).to.equal(await signer.getAddress());
    });
  });

  describe("withdraw", async () => {
    beforeEach(async () => {
      const { ethers } = connection;
      const sendValue = ethers.parseEther("1");
      await typedFundMe.fund({ value: sendValue });
    });

    it("should withdraw ETH from a single funder", async () => {
      const provider = connection.ethers.provider;
      const fundMeAddress = await typedFundMe.getAddress();
      const signerAddress = await signer.getAddress();

      const startingFundMeBalance = await provider.getBalance(fundMeAddress);
      const startingSignerBalance = await provider.getBalance(signerAddress);

      const transactionResponse = await typedFundMe.withdraw();
      const transactionReceipt = await transactionResponse.wait(1);
      if (!transactionReceipt) {
        // This should never happen, but TypeScript needs this check
        throw new Error("Transaction receipt is null");
      }

      const { gasUsed, gasPrice } = transactionReceipt;
      const gasCost = gasUsed * gasPrice;

      const endingFundMeBalance = await provider.getBalance(fundMeAddress);
      const endingSignerBalance = await provider.getBalance(signerAddress);

      expect(endingFundMeBalance).to.equal(0);
      expect(startingFundMeBalance + startingSignerBalance).to.equal(
        endingSignerBalance + gasCost,
      );
    });

    it("should allow owner to withdraw with multiple funders", async () => {
      const { ethers } = connection;
      const { provider } = ethers;
      const accounts = await ethers.getSigners();
      for (let i = 1; i < 6; i++) {
        const fundMeConnectedContract = typedFundMe.connect(accounts[i]);
        const sendValue = ethers.parseEther("1");
        await fundMeConnectedContract.fund({ value: sendValue });
      }

      const fundMeAddress = await typedFundMe.getAddress();
      const signerAddress = await signer.getAddress();

      const startingFundMeBalance = await provider.getBalance(fundMeAddress);
      const startingSignerBalance = await provider.getBalance(signerAddress);

      const transactionResponse = await typedFundMe.withdraw();
      const transactionReceipt = await transactionResponse.wait(1);
      if (!transactionReceipt) {
        // This should never happen, but TypeScript needs this check
        throw new Error("Transaction receipt is null");
      }

      const { gasUsed, gasPrice } = transactionReceipt;
      const gasCost = gasUsed * gasPrice;

      const endingFundMeBalance = await provider.getBalance(fundMeAddress);
      const endingSignerBalance = await provider.getBalance(signerAddress);

      expect(endingFundMeBalance).to.equal(0);
      expect(startingFundMeBalance + startingSignerBalance).to.equal(
        endingSignerBalance + gasCost,
      );

      await expect(typedFundMe.getFunder(0)).to.be.revert(ethers);

      for (let i = 1; i < 6; i++) {
        const amountFunded = await typedFundMe.getAddressToAmountFunded(
          await accounts[i].getAddress(),
        );
        expect(amountFunded).to.equal(0);
      }
    });

    it("should not allow non-owner to withdraw", async () => {
      const { ethers } = connection;
      const accounts = await ethers.getSigners();
      const attacker = accounts[1];
      const attackerConnectedFundMe = typedFundMe.connect(attacker);

      const ownerAddress = await typedFundMe.getOwner();
      const attackerAddress = await attacker.getAddress();
      expect(attackerAddress).to.not.equal(ownerAddress);

      await expect(
        attackerConnectedFundMe.withdraw(),
      ).to.be.revertedWithCustomError(typedFundMe, "FundMe__NotOwner");
    });

    it("should allow owner to withdraw with multiple funders with cheaperWithdraw", async () => {
      const { ethers } = connection;
      const { provider } = ethers;
      const accounts = await ethers.getSigners();
      for (let i = 1; i < 6; i++) {
        const fundMeConnectedContract = typedFundMe.connect(accounts[i]);
        const sendValue = ethers.parseEther("1");
        await fundMeConnectedContract.fund({ value: sendValue });
      }

      const fundMeAddress = await typedFundMe.getAddress();
      const signerAddress = await signer.getAddress();

      const startingFundMeBalance = await provider.getBalance(fundMeAddress);
      const startingSignerBalance = await provider.getBalance(signerAddress);

      const transactionResponse = await typedFundMe.cheaperWithdraw();
      const transactionReceipt = await transactionResponse.wait(1);
      if (!transactionReceipt) {
        // This should never happen, but TypeScript needs this check
        throw new Error("Transaction receipt is null");
      }

      const { gasUsed, gasPrice } = transactionReceipt;
      const gasCost = gasUsed * gasPrice;

      const endingFundMeBalance = await provider.getBalance(fundMeAddress);
      const endingSignerBalance = await provider.getBalance(signerAddress);

      expect(endingFundMeBalance).to.equal(0);
      expect(startingFundMeBalance + startingSignerBalance).to.equal(
        endingSignerBalance + gasCost,
      );

      await expect(typedFundMe.getFunder(0)).to.be.revert(ethers);

      for (let i = 1; i < 6; i++) {
        const amountFunded = await typedFundMe.getAddressToAmountFunded(
          await accounts[i].getAddress(),
        );
        expect(amountFunded).to.equal(0);
      }
    });
  });
});
