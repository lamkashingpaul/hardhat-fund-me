import hre from "hardhat";
import { deployMyMockV3Aggregator } from "../helpers/deploy-helpers.js";

async function main() {
  const connection = await hre.network.connect();
  deployMyMockV3Aggregator(connection);
}

main().catch(console.error);
