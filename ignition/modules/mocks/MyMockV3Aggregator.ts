import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const decimals = 8n;
const initialAnswer = 2000n * 10n ** decimals;

export default buildModule("MyMockV3Aggregator", (m) => {
  const myMockV3Aggregator = m.contract("MyMockV3Aggregator", [
    m.getParameter("decimals", decimals),
    m.getParameter("initialAnswer", initialAnswer),
  ]);
  return { myMockV3Aggregator };
});
