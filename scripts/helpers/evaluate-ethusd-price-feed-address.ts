import "dotenv/config";
import type { NetworkConnection } from "hardhat/types/network";
import { isDevelopmentChain } from "./deploy-helpers.js";
import { deployMyMockV3Aggregator } from "./deploy-my-mock-v3-aggregator.js";

export const evaluateEthUsdPriceFeedAddress = async (
  connection: NetworkConnection,
): Promise<string> => {
  const { networkName } = connection;

  if (isDevelopmentChain(networkName)) {
    const myMockV3Aggregator = await deployMyMockV3Aggregator(connection);
    return await myMockV3Aggregator.getAddress();
  }

  if (networkName === "sepolia") {
    return process.env.SEPOLIA_ETHUSD_PRICE_FEED_ADDRESS;
  }

  throw new Error(
    `No ETH/USD price feed address configured for network: ${networkName}`,
  );
};
