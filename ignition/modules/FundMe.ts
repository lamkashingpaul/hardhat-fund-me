import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("FundMe", (m) => {
  const fundMe = m.contract("FundMe", [m.getParameter("priceFeedAddress")]);
  return { fundMe };
});
