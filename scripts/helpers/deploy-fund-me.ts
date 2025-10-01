import type { NetworkConnection } from "hardhat/types/network";
import FundMeModule from "../../ignition/modules/FundMe.js";
import { FundMe__factory } from "../../types/ethers-contracts/index.js";

export const deployFundMe = async (
  connection: NetworkConnection,
  priceFeedAddress: string,
) => {
  const { networkName, ignition, ethers } = connection;
  const [signer] = await ethers.getSigners();

  console.log(`Deploying FundMe to ${networkName}...`);
  const { fundMe } = await ignition.deploy(FundMeModule, {
    parameters: {
      FundMe: {
        priceFeedAddress,
      },
    },
  });
  console.log(`FundMe deployed at address: ${await fundMe.getAddress()}`);

  const typedFundMe = FundMe__factory.connect(
    await fundMe.getAddress(),
    signer,
  );

  return typedFundMe;
};
