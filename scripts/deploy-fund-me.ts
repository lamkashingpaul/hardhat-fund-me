import hre from "hardhat";
import { deployFundMe } from "./helpers/deploy-fund-me.js";
import { evaluateEthUsdPriceFeedAddress } from "./helpers/evaluate-ethusd-price-feed-address.js";

const main = async () => {
  const connection = await hre.network.connect();
  const priceFeedAddress = await evaluateEthUsdPriceFeedAddress(connection);
  await deployFundMe(connection, priceFeedAddress);
};

main().catch(console.error);
