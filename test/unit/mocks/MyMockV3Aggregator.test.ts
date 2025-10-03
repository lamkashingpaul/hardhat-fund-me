import type { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/types";
import { expect } from "chai";
import hre from "hardhat";
import { deployMyMockV3AggregatorModuleFixture } from "../../../scripts/fixtures/deploy-my-mock-v3-aggregator-module-fixture.js";
import {
  type MyMockV3Aggregator,
  MyMockV3Aggregator__factory,
} from "../../../types/ethers-contracts/index.js";

describe("MyMockV3Aggregator", () => {
  const DECIMALS = 8n;
  const INITIAL_ANSWER = 2000n * 10n ** DECIMALS;

  let signer: HardhatEthersSigner;
  let typedAggregator: MyMockV3Aggregator;

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
  });

  it("should deploy and verify the mock aggregator", async () => {
    const decimals = await typedAggregator.decimals();
    const answer = await typedAggregator.latestAnswer();
    expect(decimals).to.equal(DECIMALS);
    expect(answer).to.equal(INITIAL_ANSWER);
  });

  it("should update the answer", async () => {
    await typedAggregator.updateAnswer(2500n * 10n ** 8n);
    const updatedAnswer = await typedAggregator.latestAnswer();
    expect(updatedAnswer).to.equal(2500n * 10n ** 8n);
  });
});
