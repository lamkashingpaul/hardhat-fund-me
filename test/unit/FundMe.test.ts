import type { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/types";
import { expect } from "chai";
import hre from "hardhat";
import { deployMyMockV3AggregatorModuleFixture } from "../../scripts/fixtures/deploy-my-mock-v3-aggregator-module-fixture.js";
import { deployFundMe } from "../../scripts/helpers/deploy-fund-me.js";
import {
  type FundMe,
  type MyMockV3Aggregator,
  MyMockV3Aggregator__factory,
} from "../../types/ethers-contracts/index.js";

describe("FundMe", () => {
  let signer: HardhatEthersSigner;
  let typedAggregator: MyMockV3Aggregator;
  let typedFundMe: FundMe;

  beforeEach(async () => {
    const connection = await hre.network.connect();
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
      const response = await typedFundMe.i_priceFeed();
      const expectedAddress = await typedAggregator.getAddress();
      expect(response).to.equal(expectedAddress);
    });
  });
});
