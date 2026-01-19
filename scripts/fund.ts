import "dotenv/config";
import { ethers } from "ethers";
import hre from "hardhat";
import { deployFundMe } from "./helpers/deploy-fund-me.js";
import { evaluateEthUsdPriceFeedAddress } from "./helpers/evaluate-ethusd-price-feed-address.js";

const main = async () => {
  const connection = await hre.network.connect();
  const [signer] = await connection.ethers.getSigners();
  const priceFeedAddress = await evaluateEthUsdPriceFeedAddress(connection);
  const typedFundMe = await deployFundMe(connection, priceFeedAddress);

  const connectedFundMe = typedFundMe.connect(signer);
  const transactionResponse = await connectedFundMe.fund({
    value: ethers.parseEther("0.1"),
  });
  await transactionResponse.wait(1);
  console.log("Funded FundMe contract!");
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
