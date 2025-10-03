import "dotenv/config";
import type { NetworkConnection } from "hardhat/types/network";
import { deployMyMockV3Aggregator } from "./deploy-my-mock-v3-aggregator.js";
import { isDevelopmentChain } from "./deployment-helpers.js";

export const evaluateEthUsdPriceFeedAddress = async (
  connection: NetworkConnection,
): Promise<string> => {
  const { networkName, networkConfig } = connection;
  const chainId = networkConfig.chainId;

  if (isDevelopmentChain(chainId)) {
    const myMockV3Aggregator = await deployMyMockV3Aggregator(connection);
    return await myMockV3Aggregator.getAddress();
  }

  if (chainId === 11155111) {
    return process.env.SEPOLIA_ETHUSD_PRICE_FEED_ADDRESS;
  }

  throw new Error(
    `No ETH/USD price feed address configured for network: ${networkName}`,
  );
};
