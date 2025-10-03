import { deployMyMockV3Aggregator } from "../helpers/deploy-my-mock-v3-aggregator.js";

const main = async () => {
  await deployMyMockV3Aggregator();
};

main().catch(console.error);
