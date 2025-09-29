import hre from "hardhat";
import type { NetworkConnection } from "hardhat/types/network";
import MyMockV3AggregatorModule from "../../ignition/modules/mocks/MyMockV3Aggregator.js";

export const developmentChains = new Set(["hardhat", "localhost"]);

export const isDevelopmentChain = (networkName: string): boolean => {
  return developmentChains.has(networkName);
};

export const deployMyMockV3Aggregator = async (
  connection: NetworkConnection,
) => {
  if (!connection) {
    connection = await hre.network.connect();
  }
  const { networkName, ignition } = connection;

  if (!isDevelopmentChain(networkName)) {
    console.log(
      `The network ${networkName} is not a development chain. Skipping deployment of MyMockV3Aggregator.`,
    );
    return;
  }

  console.log(`Deploying MyMockV3Aggregator to ${networkName}...`);
  const { myMockV3Aggregator } = await ignition.deploy(
    MyMockV3AggregatorModule,
  );
  console.log(
    `MyMockV3Aggregator deployed at address: ${await myMockV3Aggregator.getAddress()}`,
  );
};
