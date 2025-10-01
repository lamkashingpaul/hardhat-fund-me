export const developmentChains = new Set(["hardhat", "localhost"]);

export const isDevelopmentChain = (networkName: string): boolean => {
  return developmentChains.has(networkName);
};
