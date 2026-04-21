# SEDA Relayer for Mantra Chain

A relayer that polls [SEDA FAST](https://docs.seda.xyz) oracle APIs and pushes price data on-chain to a `SedaPriceStore` contract on Mantra chain EVM.

## Feeds

| Symbol | Oracle Program | Source |
|---|---|---|
| HYPE/USD | Pyth via SEDA | Pyth Network |
| MANTRA/USD | BinByGate | Binance, Bybit, Gate.io |
| HYPE/MANTRA | Cross-rate | CEX + Pyth |
| USDC/USD | Pyth via SEDA | Pyth Network |
| USDT/USD | Pyth via SEDA | Pyth Network |
| stMANTRA/MANTRA | EVM Vault | ERC-4626 ratio |
| wmantraUSD-Yld/USD | EVM Vault | Accountant rate |

## Prerequisites

- Node.js 18+
- A funded wallet on Mantra chain EVM (for gas)
- A SEDA FAST API key (from the SEDA team)

## Quick Start

```bash
# Install dependencies
npm install

# Copy config files
cp config.example.yaml config.yaml
cp .env.example .env

# Edit .env with your keys
# Edit config.yaml — update priceStoreAddress after deploying the contract
```

## Deploy Contract

```bash
# Set DEPLOYER_PRIVATE_KEY in .env
# Optionally set RELAYER_ADDRESS (defaults to deployer)

npx hardhat run scripts/deploy.ts --network mantra
```

This deploys the `SedaPriceStore` UUPS proxy. Copy the output address into `config.yaml` → `evm.priceStoreAddress`.

## Run Relayer

```bash
# Dry run (no transactions, just fetch and log)
npm run dry-run

# Live
npm start
```

## Configuration

### config.yaml

| Setting | Description |
|---|---|
| `sedaFast.apiUrl` | SEDA FAST API base URL |
| `feeds[].symbol` | Human-readable feed name |
| `feeds[].execProgramId` | Oracle program ID |
| `feeds[].execInputs` | Inputs passed to the oracle program |
| `evm.rpcUrl` | Mantra chain EVM RPC |
| `evm.chainId` | `5888` |
| `evm.priceStoreAddress` | Deployed SedaPriceStore address |
| `updateIntervalMs` | Polling interval (default: 10000ms) |
| `maxGasPriceGwei` | Gas price cap |

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `RELAYER_PRIVATE_KEY` | Yes | Wallet private key (pays gas) |
| `SEDA_FAST_API_KEY` | Yes | SEDA FAST API key |
| `DEPLOYER_PRIVATE_KEY` | For deploy | Contract deployer key |
| `RELAYER_ADDRESS` | No | Initial relayer address (defaults to deployer) |
| `DRY_RUN` | No | Set `true` to skip transactions |

## Contract

**Deployed**: `0xa249A4FfaE48f0f404Ab262eB04b6068F4efECCa` (UUPS proxy on Mantra chain EVM)
**Implementation**: `0xe3674d1c43fe249d468c362f663a01bcc1c3c318`
**Verified**: [Blockscout](https://blockscout.mantrascan.io/address/0xa249A4FfaE48f0f404Ab262eB04b6068F4efECCa)

`SedaPriceStore` is a UUPS upgradeable contract that stores `(price, timestamp, roundId)` per feed. All prices use **18 decimals**.

### Feed IDs

Each feed is identified by `keccak256(symbol)`. These are the on-chain feed IDs:

| Symbol | feedId |
|---|---|
| HYPE/USD | `0xc5f3d8462b1cf323f17cd65568a8349b94a47e414db695620043be926eb5fbfd` |
| MANTRA/USD | `0xcd0f31baa49ff3fbccfe0ece74135c3a6a9cb32ae57fd36272ad812bb58a0cf3` |
| HYPE/MANTRA | `0xf07f96b99794a6dc491a1eb3cc06f4effda805e0ee6ec8102205a3f33ab48551` |
| USDC/USD | `0xff064b881a0c0fff844177f881a313ff894bfc6093d33b5514e34d7faa41b7ef` |
| USDT/USD | `0x91879a0c0be4e43cacda1599ac414205651f4a62b614b6be9e5318a182c33eb0` |
| stMANTRA/MANTRA | `0x9383700fa8a8ef44ad75bc49dfafac6b028d32c54c9805ae6db6de00164f344c` |
| wmantraUSD-Yld/USD | `0xd12021a04f97a016a1894eb4123056141bbabc0ffde255b5c6371cde11a4018e` |

### Reading Prices

There are two read methods — same data, different shape:

**`getLatestPrice(feedId)`** — simple, returns 3 values:
```solidity
bytes32 feedId = keccak256(abi.encodePacked("HYPE/USD"));
(int256 price, uint256 timestamp, uint80 roundId) = priceStore.getLatestPrice(feedId);
```

**`latestRoundData(feedId)`** — AggregatorV3Interface-compatible (Chainlink standard), returns 5 values:
```solidity
(uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)
    = priceStore.latestRoundData(feedId);
// startedAt == updatedAt == timestamp; answeredInRound == roundId
```

Use `latestRoundData` when integrating with DeFi protocols that expect Chainlink-style feeds. Use `getLatestPrice` for simpler use cases.

### Admin Functions

```solidity
priceStore.addRelayer(address);     // Add relayer (owner only)
priceStore.removeRelayer(address);  // Remove relayer (owner only)
priceStore.pause();                 // Emergency pause (owner only)
priceStore.unpause();               // Resume (owner only)
```

## Architecture

```
SEDA FAST API (/execute)       ← 7 separate calls per cycle
       │
  { price, timestamp } (JSON)
       │
       ▼
  TypeScript Relayer
  1. Fetch each feed from SEDA FAST
  2. Decode JSON result → { price, timestamp }
  3. Skip if timestamp ≤ last pushed
  4. Batch into one tx
  5. Call SedaPriceStore.updatePrices()
       │
       ▼
  SedaPriceStore (Mantra chain EVM)
  → Only authorized relayer can write
  → Stores (price, timestamp, roundId) per feedId
  → AggregatorV3-compatible reads
```
