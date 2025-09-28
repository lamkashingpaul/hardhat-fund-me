import type { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/types";
import { expect } from "chai";
import hre from "hardhat";
import MyMockV3AggregatorModule from "../../ignition/modules/mocks/MyMockV3Aggregator.js";
import {
  type MyMockV3Aggregator,
  MyMockV3Aggregator__factory,
} from "../../types/ethers-contracts/index.js";

describe("MyMockV3Aggregator", () => {
  const DECIMALS = 8n;
  const INITIAL_ANSWER = 3000n * 10n ** DECIMALS;

  let signer: HardhatEthersSigner;
  let typedAggregator: MyMockV3Aggregator;

  beforeEach(async () => {
    const connection = await hre.network.connect();
    [signer] = await connection.ethers.getSigners();

    const { myMockV3Aggregator } = await connection.ignition.deploy(
      MyMockV3AggregatorModule,
      {
        defaultSender: signer.address,
        parameters: {
          MyMockV3Aggregator: {
            decimals: DECIMALS,
            initialAnswer: INITIAL_ANSWER,
          },
        },
      },
    );

    typedAggregator = MyMockV3Aggregator__factory.connect(
      await myMockV3Aggregator.getAddress(),
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
