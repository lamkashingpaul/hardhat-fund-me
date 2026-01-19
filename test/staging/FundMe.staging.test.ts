import type { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/types";
import { expect } from "chai";
import { ethers } from "ethers";
import hre from "hardhat";
import type { NetworkConnection } from "hardhat/types/network";
import { deployFundMe } from "../../scripts/helpers/deploy-fund-me.js";
import { isDevelopmentChain } from "../../scripts/helpers/deployment-helpers.js";
import { evaluateEthUsdPriceFeedAddress } from "../../scripts/helpers/evaluate-ethusd-price-feed-address.js";
import type { FundMe } from "../../types/ethers-contracts/index.js";

describe("FundMe", async () => {
  before(async function () {
    const { networkConfig } = await hre.network.connect();
    const chainId = networkConfig.chainId;
    if (chainId === undefined || isDevelopmentChain(chainId)) {
      this.skip();
    }
  });

  let connection: NetworkConnection;
  let signer: HardhatEthersSigner;
  let typedFundMe: FundMe;
  const sendValue = ethers.parseEther("1");

  beforeEach(async () => {
    connection = await hre.network.connect();
    [signer] = await connection.ethers.getSigners();
    const priceFeedAddress = await evaluateEthUsdPriceFeedAddress(connection);
    typedFundMe = await deployFundMe(connection, priceFeedAddress);
  });

  it("allows people to fund and withdraw", async () => {
    const ownerAddress = await typedFundMe.getOwner();
    const signerAddress = await signer.getAddress();
    expect(ownerAddress).to.equal(signerAddress);

    await typedFundMe.fund({ value: sendValue });
    await typedFundMe.withdraw();

    const provider = connection.ethers.provider;
    const fundMeAddress = await typedFundMe.getAddress();
    const endingFundMeBalance = await provider.getBalance(fundMeAddress);
    expect(endingFundMeBalance).to.equal(0);
  });
});
