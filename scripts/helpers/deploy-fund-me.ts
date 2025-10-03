import type { NetworkConnection } from "hardhat/types/network";
import FundMeModule from "../../ignition/modules/FundMe.js";
import { FundMe__factory } from "../../types/ethers-contracts/index.js";
import { isDevelopmentChain } from "./deployment-helpers.js";
import { verifyContractAfterDeployment } from "./verify-contract-after-deployment.js";

export const deployFundMe = async (
  connection: NetworkConnection,
  priceFeedAddress: string,
) => {
  const { networkName, networkConfig, ignition, ethers } = connection;
  const chainId = networkConfig.chainId;
  const [signer] = await ethers.getSigners();

  console.log(`Deploying FundMe to ${networkName}...`);
  const { fundMe } = await ignition.deploy(FundMeModule, {
    parameters: {
      FundMe: {
        priceFeedAddress,
      },
    },
  });
  const fundMeAddress = await fundMe.getAddress();
  console.log(`FundMe deployed at address: ${fundMeAddress}`);

  if (!isDevelopmentChain(chainId) && process.env.ETHERSCAN_API_KEY) {
    await verifyContractAfterDeployment({
      address: fundMeAddress,
      constructorArgs: [priceFeedAddress],
    });
  }

  const typedFundMe = FundMe__factory.connect(fundMeAddress, signer);

  return typedFundMe;
};
