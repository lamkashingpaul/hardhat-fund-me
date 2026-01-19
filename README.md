# Hardhat FundMe - Deployment Guide

A decentralized crowdfunding smart contract built with Hardhat 3 Beta, featuring ETH price feeds via Chainlink oracles. This project demonstrates both basic and advanced deployment patterns for Ethereum smart contracts.

## 📋 Project Overview

This project includes:

- **FundMe Contract**: A crowdfunding contract that accepts ETH donations with USD minimum threshold
- **Chainlink Price Feed Integration**: Real-time ETH/USD conversion using Chainlink oracles
- **Mock Price Feed**: For local testing on Hardhat/localhost networks
- **Multiple Deployment Methods**: Hardhat Ignition modules and custom TypeScript scripts
- **Contract Verification**: Automatic Etherscan verification for testnet/mainnet deployments

## 🚀 Prerequisites

Before deploying, ensure you have:

- Node.js >= 24
- pnpm 10.28.0 or higher
- An Ethereum wallet with testnet ETH (for Sepolia deployments)

## 📦 Installation

```bash
pnpm install
```

## 🔑 Environment Setup

Create a `.env` file in the root directory:

```env
# Required for Sepolia deployments
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
SEPOLIA_PRIVATE_KEY=your_private_key_here
SEPOLIA_ETHUSD_PRICE_FEED_ADDRESS=0x694AA1769357215DE4FAC081bf1f309aDC325306

# Required for contract verification
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### Network Configuration

- **Localhost/Hardhat**: Uses mock price feed (automatically deployed)
- **Sepolia**: Uses Chainlink ETH/USD price feed at `0x694AA1769357215DE4FAC081bf1f309aDC325306`

## 📘 Deployment Methods

### Method 1: Basic Deployment with Hardhat Ignition (Recommended for Beginners)

Hardhat Ignition is a declarative deployment system that handles dependency management and provides deployment tracking.

#### Step 1: Start a Local Hardhat Node

```bash
pnpm hardhat node
```

This starts a local Ethereum network on `http://127.0.0.1:8545/` with 20 pre-funded accounts.

#### Step 2: Deploy Mock Price Feed First

Since FundMe requires a `priceFeedAddress` parameter, first deploy the mock price feed:

```bash
pnpm hardhat ignition deploy ignition/modules/mocks/MyMockV3Aggregator.ts --network localhost
```

**Expected Output:**

```
Deploying module MyMockV3Aggregator...
✔ Deployed MyMockV3Aggregator#MyMockV3Aggregator at 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

Copy the deployed address from the output.

#### Step 3: Deploy FundMe with Parameters

Now deploy FundMe with the mock price feed address as a parameter:

```bash
pnpm hardhat ignition deploy ignition/modules/FundMe.ts --network localhost --parameters '{"FundMe":{"priceFeedAddress":"0x5FbDB2315678afecb367f032d93F642f64180aa3"}}'
```

Replace `0x5FbDB2315678afecb367f032d93F642f64180aa3` with the actual mock aggregator address from Step 2.

**Alternative: Using a Parameters File**

Create a file `ignition/parameters.json`:

```json
{
  "FundMe": {
    "priceFeedAddress": "0x5FbDB2315678afecb367f032d93F642f64180aa3"
  }
}
```

Then deploy:

```bash
pnpm hardhat ignition deploy ignition/modules/FundMe.ts --network localhost --parameters ignition/parameters.json
```

**What happens:**

1. Reads the provided `priceFeedAddress` parameter
2. Deploys `FundMe` contract with the mock price feed address as constructor parameter
3. Stores deployment artifacts in `ignition/deployments/chain-31337/`

**Expected Output:**

```
Deploying module FundMe...
✔ Deployed FundMe#FundMe at 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
```

**Mock Price Feed Details:**

- Decimals: 8
- Initial ETH/USD price: $2000
- Updates can be made by calling `updateAnswer()` on the mock contract

### Method 2: Advanced Deployment with Custom Scripts

Custom scripts provide more control, logging, and automatic contract verification.

#### Why Use Scripts Instead of Ignition Alone?

While Hardhat Ignition is excellent for declarative deployments, it has important limitations:

**Ignition Limitations:**

- ❌ **No conditional logic**: Cannot deploy different contracts based on network conditions
- ❌ **No async/await operations**: Cannot fetch data from external sources or perform sequential operations
- ❌ **No console logging**: Cannot log deployment progress, addresses, or debugging information
- ❌ **No environment variable access**: Cannot read from `.env` files directly
- ❌ **No dynamic parameter computation**: Parameters must be known at invocation time
- ❌ **No contract verification**: Cannot verify contracts on Etherscan automatically

**What Scripts Enable:**

- ✅ **Network-aware deployments**: Deploy mocks on localhost, use real contracts on testnet/mainnet
- ✅ **Dynamic address resolution**: Fetch and use contract addresses programmatically
- ✅ **Detailed logging**: Track deployment progress with custom console messages
- ✅ **Automatic verification**: Verify contracts on Etherscan after deployment
- ✅ **Complex workflows**: Chain multiple operations with error handling
- ✅ **Environment configuration**: Read network-specific settings from `.env` files

#### Script-Based Deployment Flow

The script deployment uses a modular helper system:

```
deploy-fund-me.ts (Main Entry)
    │
    ├─→ evaluateEthUsdPriceFeedAddress()
    │   │   • Checks network type (development vs production)
    │   │   • If development: deploys mock via deployMyMockV3Aggregator()
    │   │   • If Sepolia: returns address from .env
    │   │   • Returns the appropriate price feed address
    │   │
    │   └─→ deployMyMockV3Aggregator() [if development network]
    │       • Uses Ignition to deploy mock aggregator
    │       • Logs deployment address
    │       • Returns typed contract instance
    │
    └─→ deployFundMe(connection, priceFeedAddress)
        • Uses Ignition to deploy FundMe with parameters
        • Logs deployment details
        • If NOT development: calls verifyContractAfterDeployment()
        • Returns typed FundMe contract instance
```

**Key Advantages of This Approach:**

1. **Conditional Deployment**: Automatically deploys mocks for local testing
2. **Network Detection**: `isDevelopmentChain()` determines the deployment strategy
3. **Parameter Resolution**: Price feed address is computed dynamically
4. **Comprehensive Logging**: See what's happening at each step
5. **Automatic Verification**: Sepolia deployments are verified on Etherscan
6. **Type Safety**: Returns strongly-typed contract instances for further interaction

#### Local Deployment with Scripts

```bash
pnpm hardhat node
```

In a new terminal:

```bash
pnpm hardhat run scripts/deploy-fund-me.ts --network localhost
```

**What happens:**

1. Detects localhost as a development chain
2. Deploys mock price feed via Ignition
3. Deploys FundMe contract with extensive logging
4. Skips verification (local networks don't need it)

**Expected Output:**

```
Deploying FundMe to localhost...
FundMe deployed at address: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

#### Testnet Deployment (Sepolia)

**Prerequisites:**

- Sepolia ETH in your wallet (get from [Alchemy faucet](https://sepoliafaucet.com/))
- Environment variables configured (see Environment Setup section)

**Deploy to Sepolia:**

```bash
pnpm hardhat run scripts/deploy-fund-me.ts --network sepolia
```

**What happens:**

1. Connects to Sepolia via your RPC URL
2. Uses the real Chainlink ETH/USD price feed address
3. Deploys FundMe contract
4. Automatically verifies contract on Etherscan

**Expected Output:**

```
Deploying FundMe to sepolia...
FundMe deployed at address: 0x1234...5678
Verifying contract on Etherscan...
Contract verified successfully!
```

#### ⚠️ Important: Script Deployments vs Ignition CLI

When deploying with scripts (`pnpm hardhat run scripts/deploy-fund-me.ts`), the `--reset` flag is **NOT available**.

**Key Differences:**

| Feature             | Ignition CLI            | Script Deployment       |
| ------------------- | ----------------------- | ----------------------- |
| Reset flag          | `--reset` available     | ❌ Not available        |
| Deployment tracking | Automatic               | Automatic               |
| Redeployment        | Smart (skips if exists) | Smart (skips if exists) |

**To Reset Script Deployments:**

If you need to redeploy from scratch when using scripts, you must manually delete the deployment folder:

```bash
# Windows (PowerShell)
Remove-Item -Recurse -Force ignition/deployments/chain-31337  # localhost
Remove-Item -Recurse -Force ignition/deployments/chain-11155111  # sepolia

# Linux/macOS
rm -rf ignition/deployments/chain-31337  # localhost
rm -rf ignition/deployments/chain-11155111  # sepolia
```

**Why This Matters:**

- Ignition tracks deployments to avoid duplicate deployments
- Both CLI and scripts use the same deployment artifacts in `ignition/deployments/`
- The `--reset` flag only works with `pnpm hardhat ignition deploy` commands
- Scripts inherit Ignition's tracking but don't support the reset parameter

**Best Practice:** Only delete deployment folders when you intentionally want to redeploy everything from scratch.

#### Understanding the Script Code Flow

**1. Main Entry Point** ([deploy-fund-me.ts](scripts/deploy-fund-me.ts))

```typescript
const main = async () => {
  const connection = await hre.network.connect();
  const priceFeedAddress = await evaluateEthUsdPriceFeedAddress(connection);
  await deployFundMe(connection, priceFeedAddress);
};
```

- **Async/await**: Sequential operations impossible in Ignition modules
- **Network connection**: Access to network, ethers, and ignition APIs
- **Dynamic parameter resolution**: Price feed address computed at runtime

**2. Network-Aware Price Feed Resolution** ([evaluate-ethusd-price-feed-address.ts](scripts/helpers/evaluate-ethusd-price-feed-address.ts))

```typescript
export const evaluateEthUsdPriceFeedAddress = async (
  connection: NetworkConnection,
): Promise<string> => {
  const { networkName } = connection;

  // Conditional logic - impossible in Ignition!
  if (isDevelopmentChain(networkName)) {
    const myMockV3Aggregator = await deployMyMockV3Aggregator(connection);
    return await myMockV3Aggregator.getAddress();
  }

  // Environment variable access - impossible in Ignition!
  if (networkName === "sepolia") {
    return process.env.SEPOLIA_ETHUSD_PRICE_FEED_ADDRESS;
  }

  throw new Error(`No price feed configured for: ${networkName}`);
};
```

**Demonstrates Ignition Limitations:**

- ❌ Conditional branching based on network
- ❌ Calling async functions to get addresses
- ❌ Reading environment variables
- ❌ Error handling with custom messages

**3. Mock Deployment Helper** ([deploy-my-mock-v3-aggregator.ts](scripts/helpers/deploy-my-mock-v3-aggregator.ts))

```typescript
export const deployMyMockV3Aggregator = async (
  connection: NetworkConnection,
) => {
  const { networkName, ignition, ethers } = connection;
  const [signer] = await ethers.getSigners();

  // Console logging - impossible in Ignition!
  console.log(`Deploying MyMockV3Aggregator to ${networkName}...`);

  const { myMockV3Aggregator } = await ignition.deploy(
    MyMockV3AggregatorModule,
  );

  // Dynamic address retrieval and logging
  console.log(
    `MyMockV3Aggregator deployed at: ${await myMockV3Aggregator.getAddress()}`,
  );

  // Type-safe contract instance creation
  const typedMyMockV3Aggregator = MyMockV3Aggregator__factory.connect(
    await myMockV3Aggregator.getAddress(),
    signer,
  );

  return typedMyMockV3Aggregator;
};
```

**Demonstrates Script Capabilities:**

- ✅ Console logging for deployment tracking
- ✅ Dynamic address retrieval
- ✅ Type-safe contract factory usage
- ✅ Returning contract instances for further use

**4. FundMe Deployment with Verification** ([deploy-fund-me.ts](scripts/helpers/deploy-fund-me.ts))

```typescript
export const deployFundMe = async (
  connection: NetworkConnection,
  priceFeedAddress: string,
) => {
  const { networkName, ignition, ethers } = connection;
  const [signer] = await ethers.getSigners();

  console.log(`Deploying FundMe to ${networkName}...`);

  // Ignition used within script context
  const { fundMe } = await ignition.deploy(FundMeModule, {
    parameters: {
      FundMe: {
        priceFeedAddress,
      },
    },
  });

  const fundMeAddress = await fundMe.getAddress();
  console.log(`FundMe deployed at address: ${fundMeAddress}`);

  // Conditional verification - impossible in Ignition!
  if (!isDevelopmentChain(networkName)) {
    await verifyContractAfterDeployment({
      address: fundMeAddress,
      constructorArgs: [priceFeedAddress],
    });
  }

  return FundMe__factory.connect(fundMeAddress, signer);
};
```

**Key Features:**

- ✅ Detailed logging throughout deployment
- ✅ Conditional verification based on network
- ✅ Parameters passed programmatically
- ✅ Returns typed contract for immediate use

**5. Network Detection Utility** ([deploy-helpers.ts](scripts/helpers/deploy-helpers.ts))

```typescript
export const developmentChains = new Set(["hardhat", "localhost"]);

export const isDevelopmentChain = (networkName: string): boolean => {
  return developmentChains.has(networkName);
};
```

**Simple but powerful**: Enables network-aware deployment logic throughout the codebase.

## 🏗️ Understanding the Deployment Architecture

### Ignition Modules

Located in `ignition/modules/`:

- **FundMe.ts**: Main deployment module

  ```typescript
  buildModule("FundMe", (m) => {
    const fundMe = m.contract("FundMe", [m.getParameter("priceFeedAddress")]);
    return { fundMe };
  });
  ```

- **mocks/MyMockV3Aggregator.ts**: Mock price feed for local testing
  ```typescript
  buildModule("MyMockV3Aggregator", (m) => {
    const myMockV3Aggregator = m.contract("MyMockV3Aggregator", [
      m.getParameter("decimals", 8n),
      m.getParameter("initialAnswer", 200000000000n), // $2000
    ]);
    return { myMockV3Aggregator };
  });
  ```

**Note:** Ignition modules are declarative and pure - they define _what_ to deploy, but cannot handle _when_ or _how_ based on runtime conditions. This is where scripts become essential.

### Deployment Scripts Architecture

Located in `scripts/`, these helpers wrap Ignition modules with imperative logic:

- **[deploy-fund-me.ts](scripts/deploy-fund-me.ts)**: Main entry point that orchestrates the deployment
- **[helpers/evaluate-ethusd-price-feed-address.ts](scripts/helpers/evaluate-ethusd-price-feed-address.ts)**: Network-specific price feed resolution with conditional logic
- **[helpers/deploy-fund-me.ts](scripts/helpers/deploy-fund-me.ts)**: Core deployment logic with verification and logging
- **[helpers/deploy-my-mock-v3-aggregator.ts](scripts/helpers/deploy-my-mock-v3-aggregator.ts)**: Mock price feed deployment with console output
- **[helpers/verify-contract-after-deployment.ts](scripts/helpers/verify-contract-after-deployment.ts)**: Etherscan verification wrapper
- **[helpers/deploy-helpers.ts](scripts/helpers/deploy-helpers.ts)**: Network detection utilities

**Script vs Ignition Comparison:**

| Feature                   | Ignition Module | Script-Wrapped Ignition |
| ------------------------- | --------------- | ----------------------- |
| Deploy contracts          | ✅              | ✅                      |
| Declarative syntax        | ✅              | ❌ (Imperative)         |
| Conditional logic         | ❌              | ✅                      |
| Console logging           | ❌              | ✅                      |
| Async/await operations    | ❌              | ✅                      |
| Environment variables     | ❌              | ✅                      |
| Contract verification     | ❌              | ✅                      |
| Network detection         | ❌              | ✅                      |
| Return contract instances | ✅ (basic)      | ✅ (typed)              |

See the "Understanding the Script Code Flow" section above for detailed code examples.

## 🔍 Verifying Deployed Contracts

For testnet/mainnet deployments, contracts are automatically verified using the script deployment method.

Manual verification:

```bash
pnpm hardhat verify --network sepolia DEPLOYED_CONTRACT_ADDRESS "CONSTRUCTOR_ARG_PRICE_FEED_ADDRESS"
```

Example:

```bash
pnpm hardhat verify --network sepolia 0x1234...5678 "0x694AA1769357215DE4FAC081bf1f309aDC325306"
```

## 🧪 Testing

Run all tests:

```bash
pnpm hardhat test
```

Run specific test types:

```bash
pnpm hardhat test solidity  # Run Solidity tests
pnpm hardhat test mocha     # Run TypeScript/mocha tests
```

## 📁 Deployment Artifacts

After deployment, artifacts are stored in:

- **Ignition deployments**: `ignition/deployments/chain-{chainId}/`
  - `deployed_addresses.json`: Contract addresses
  - `journal.jsonl`: Deployment history
  - `artifacts/`: Contract ABIs and metadata

- **Compilation artifacts**: `artifacts/contracts/`
  - Contract ABIs, bytecode, and metadata

## 🎯 Common Deployment Scenarios

### Scenario 1: Fresh Local Development

```bash
# Terminal 1: Start node
pnpm hardhat node

# Terminal 2: Deploy using Ignition CLI (supports --reset)
pnpm hardhat ignition deploy ignition/modules/FundMe.ts --network localhost --parameters '{"FundMe":{"priceFeedAddress":"0x5FbDB2315678afecb367f032d93F642f64180aa3"}}'

# OR deploy using scripts (no --reset flag available)
pnpm hardhat run scripts/deploy-fund-me.ts --network localhost
```

### Scenario 2: Deploy to Testnet with Verification

```bash
# Ensure .env is configured
pnpm hardhat run scripts/deploy-fund-me.ts --network sepolia
```

### Scenario 3: Redeploy to Existing Local Node

**Using Ignition CLI:**

```bash
# Use --reset flag to start fresh
pnpm hardhat ignition deploy ignition/modules/FundMe.ts --network localhost --reset --parameters '{"FundMe":{"priceFeedAddress":"0x5FbDB2315678afecb367f032d93F642f64180aa3"}}'
```

**Using Scripts:**

```bash
# Scripts don't support --reset, manually delete deployment folder first
Remove-Item -Recurse -Force ignition/deployments/chain-31337  # Windows
# rm -rf ignition/deployments/chain-31337  # Linux/macOS

# Then run the script
pnpm hardhat run scripts/deploy-fund-me.ts --network localhost
```

## 🔧 Troubleshooting

### Error: "Insufficient funds"

- Ensure your wallet has enough ETH for deployment
- For Sepolia: Get testnet ETH from faucets

### Error: "Invalid price feed address"

- Check `SEPOLIA_ETHUSD_PRICE_FEED_ADDRESS` in `.env`
- Verify the Chainlink price feed is active on your target network

### Error: "Contract verification failed"

- Check `ETHERSCAN_API_KEY` is valid
- Wait a few moments and verify manually
- Ensure constructor arguments match deployment

### Deployment hangs on localhost

- Ensure Hardhat node is running
- Check if port 8545 is available
- Try restarting the Hardhat node

## 📚 Additional Resources

- [Hardhat 3 Beta Documentation](https://hardhat.org/docs/getting-started#getting-started-with-hardhat-3)
- [Hardhat Ignition Guide](https://hardhat.org/ignition/docs/getting-started)
- [Chainlink Price Feeds](https://docs.chain.link/data-feeds/price-feeds/addresses)
- [Sepolia Testnet Faucets](https://sepoliafaucet.com/)

## 📝 Contract Details

**FundMe Contract Features:**

- Minimum funding: $50 USD equivalent in ETH
- Owner-only withdrawal function
- Tracks all funders and amounts
- Uses Chainlink for accurate ETH/USD conversion

**Constructor Parameters:**

- `priceFeedAddress`: Chainlink AggregatorV3Interface address

## 💰 Interacting with Deployed Contracts

Once deployed, you can interact with the FundMe contract using the provided interaction scripts.

### Funding the Contract

The [fund.ts](scripts/fund.ts) script allows you to send ETH to the deployed FundMe contract:

```bash
pnpm hardhat run scripts/fund.ts --network localhost
# or
pnpm hardhat run scripts/fund.ts --network sepolia
```

**What the script does:**

1. Connects to the specified network
2. Retrieves or deploys the FundMe contract
3. Sends 0.1 ETH to the contract via the `fund()` function
4. Waits for transaction confirmation
5. Logs success message

**Code Implementation:**

```typescript
const main = async () => {
  const connection = await hre.network.connect();
  const [signer] = await connection.ethers.getSigners();
  const priceFeedAddress = await evaluateEthUsdPriceFeedAddress(connection);
  const typedFundMe = await deployFundMe(connection, priceFeedAddress);

  const connectedFundMe = typedFundMe.connect(signer);
  const transactionResponse = await connectedFundMe.fund({
    value: ethers.parseEther("0.1"), // Send 0.1 ETH
  });
  await transactionResponse.wait(1); // Wait for 1 confirmation
  console.log("Funded FundMe contract!");
};
```

**Expected Output:**

```
Funded FundMe contract!
```

**Key Features:**

- ✅ Reuses deployment infrastructure (`deployFundMe` helper)
- ✅ Works on any network (localhost, Sepolia, etc.)
- ✅ Type-safe contract interaction
- ✅ Transaction confirmation handling

### Withdrawing from the Contract

The [withdraw.ts](scripts/withdraw.ts) script allows the contract owner to withdraw all funds:

```bash
pnpm hardhat run scripts/withdraw.ts --network localhost
# or
pnpm hardhat run scripts/withdraw.ts --network sepolia
```

**What the script does:**

1. Connects to the specified network
2. Retrieves or deploys the FundMe contract
3. Calls the `withdraw()` function (owner only)
4. Waits for transaction confirmation
5. Logs success message

**Code Implementation:**

```typescript
const main = async () => {
  const connection = await hre.network.connect();
  const [signer] = await connection.ethers.getSigners();
  const priceFeedAddress = await evaluateEthUsdPriceFeedAddress(connection);
  const typedFundMe = await deployFundMe(connection, priceFeedAddress);

  const connectedFundMe = typedFundMe.connect(signer);
  const transactionResponse = await connectedFundMe.withdraw();
  await transactionResponse.wait(1); // Wait for 1 confirmation
  console.log("Withdrew from FundMe contract!");
};
```

**Expected Output:**

```
Withdrew from FundMe contract!
```

**Important Notes:**

- ⚠️ Only the contract owner (deployer) can withdraw funds
- ⚠️ Attempting to withdraw as a non-owner will revert with `NotOwner()` error
- ✅ Withdraws all ETH from the contract
- ✅ Resets all funder balances to zero

### Script Architecture Pattern

Both interaction scripts follow a consistent pattern:

```
1. Connect to network
   ↓
2. Get signer (wallet)
   ↓
3. Resolve price feed address (network-aware)
   ↓
4. Deploy or retrieve FundMe contract
   ↓
5. Connect signer to contract (for transactions)
   ↓
6. Execute contract function
   ↓
7. Wait for confirmation
   ↓
8. Log result
```

**Advantages of This Pattern:**

- **Reusability**: Leverages existing deployment helpers
- **Network Agnostic**: Works on any configured network
- **Type Safety**: Full TypeScript type checking
- **Error Handling**: Catches and logs errors properly
- **Transaction Safety**: Waits for confirmations

### Complete Workflow Example

Here's a complete workflow demonstrating the full lifecycle:

```bash
# Step 1: Start local network (separate terminal)
pnpm hardhat node

# Step 2: Deploy FundMe contract
pnpm hardhat run scripts/deploy-fund-me.ts --network localhost

# Step 3: Fund the contract with 0.1 ETH
pnpm hardhat run scripts/fund.ts --network localhost

# Step 4: Withdraw all funds (as owner)
pnpm hardhat run scripts/withdraw.ts --network localhost
```

**Expected Complete Output:**

```
# Deploy
Deploying MyMockV3Aggregator to localhost...
MyMockV3Aggregator deployed at address: 0x5FbDB2315678afecb367f032d93F642f64180aa3
Deploying FundMe to localhost...
FundMe deployed at address: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0

# Fund
Funded FundMe contract!

# Withdraw
Withdrew from FundMe contract!
```

### Testing on Sepolia

The same scripts work on Sepolia testnet:

```bash
# Deploy
pnpm hardhat run scripts/deploy-fund-me.ts --network sepolia

# Fund
pnpm hardhat run scripts/fund.ts --network sepolia

# Withdraw
pnpm hardhat run scripts/withdraw.ts --network sepolia
```

**Prerequisites for Sepolia:**

- ✅ `.env` configured with `SEPOLIA_RPC_URL` and `SEPOLIA_PRIVATE_KEY`
- ✅ Account has sufficient Sepolia ETH (for gas + funding amount)
- ✅ Chainlink price feed address configured

## 🤝 Contributing

This project uses:

- Biome for linting and formatting
- Solhint for Solidity linting

Run checks:

```bash
pnpm run lint    # Check code style
pnpm run format  # Auto-fix code style
pnpm run ci      # Run CI checks
```
