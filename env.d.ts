declare global {
  namespace NodeJS {
    interface ProcessEnv {
      TZ: "UTC";
      NODE_ENV: "development" | "production" | "test";

      ETHERSCAN_API_KEY: string;
      SEPOLIA_RPC_URL: string;
      SEPOLIA_PRIVATE_KEY: string;
    }
  }
}
export {};
