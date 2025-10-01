import type { NetworkConnection } from "hardhat/types/network";
import MyMockV3AggregatorModule from "../../ignition/modules/mocks/MyMockV3Aggregator.js";
import { MyMockV3Aggregator__factory } from "../../types/ethers-contracts/index.js";

export const deployMyMockV3Aggregator = async (
  connection: NetworkConnection,
) => {
  const { networkName, ignition, ethers } = connection;
  const [signer] = await ethers.getSigners();

  console.log(`Deploying MyMockV3Aggregator to ${networkName}...`);
  const { myMockV3Aggregator } = await ignition.deploy(
    MyMockV3AggregatorModule,
  );
  console.log(
    `MyMockV3Aggregator deployed at address: ${await myMockV3Aggregator.getAddress()}`,
  );

  const typedMyMockV3Aggregator = MyMockV3Aggregator__factory.connect(
    await myMockV3Aggregator.getAddress(),
    signer,
  );

  return typedMyMockV3Aggregator;
};
