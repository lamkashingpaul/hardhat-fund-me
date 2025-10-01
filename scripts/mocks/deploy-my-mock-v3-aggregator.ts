import hre from "hardhat";
import { deployMyMockV3Aggregator } from "../helpers/deploy-my-mock-v3-aggregator.js";

const main = async () => {
  const connection = await hre.network.connect();
  deployMyMockV3Aggregator(connection);
};

main().catch(console.error);
