import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const decimals = 8n;
const initialAnswer = 2000n * 10n ** decimals;

export default buildModule("FundMe", (m) => {
  const myMockV3Aggregator = m.contract("MyMockV3Aggregator", [
    m.getParameter("decimals", decimals),
    m.getParameter("initialAnswer", initialAnswer),
  ]);

  const fundMe = m.contract("FundMe", [myMockV3Aggregator], {
    after: [myMockV3Aggregator],
  });

  return { fundMe };
});
