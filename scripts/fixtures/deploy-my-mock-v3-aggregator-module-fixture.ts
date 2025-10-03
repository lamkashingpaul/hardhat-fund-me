import type { NetworkConnection } from "hardhat/types/network";
import MyMockV3AggregatorModule from "../../ignition/modules/mocks/MyMockV3Aggregator.js";

export const deployMyMockV3AggregatorModuleFixture = async (
  connection: NetworkConnection,
) => {
  const { networkName, ignition } = connection;

  console.log(`Deploying MyMockV3Aggregator to ${networkName}...`);
  const myMockV3AggregatorModuleFixture = await ignition.deploy(
    MyMockV3AggregatorModule,
  );

  const { myMockV3Aggregator } = myMockV3AggregatorModuleFixture;
  console.log(
    `MyMockV3Aggregator deployed at address: ${await myMockV3Aggregator.getAddress()}`,
  );

  return myMockV3AggregatorModuleFixture;
};
