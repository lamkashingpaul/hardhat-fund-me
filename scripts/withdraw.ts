import "dotenv/config";
import hre from "hardhat";
import { deployFundMe } from "./helpers/deploy-fund-me.js";
import { evaluateEthUsdPriceFeedAddress } from "./helpers/evaluate-ethusd-price-feed-address.js";

const main = async () => {
  const connection = await hre.network.connect();
  const [signer] = await connection.ethers.getSigners();
  const priceFeedAddress = await evaluateEthUsdPriceFeedAddress(connection);
  const typedFundMe = await deployFundMe(connection, priceFeedAddress);

  const connectedFundMe = typedFundMe.connect(signer);
  const transactionResponse = await connectedFundMe.withdraw();
  await transactionResponse.wait(1);
  console.log("Withdrew from FundMe contract!");
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
