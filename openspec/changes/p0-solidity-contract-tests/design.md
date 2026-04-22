## Context

The `SedaPriceStore.sol` contract is a UUPS-upgradeable proxy deployed on Mantra chain (chainId 5888). It stores SEDA oracle prices pushed by an authorized relayer and exposes Chainlink AggregatorV3-compatible read functions. The contract uses OpenZeppelin v5 (`OwnableUpgradeable`, `PausableUpgradeable`, `UUPSUpgradeable`). The project uses Hardhat 2.22+ with `@nomicfoundation/hardhat-toolbox` (includes ethers v6, chai, mocha, hardhat-network-helpers) and `@openzeppelin/hardhat-upgrades` — all already installed. There are currently zero tests.

## Goals / Non-Goals

**Goals:**
- Achieve comprehensive test coverage for every public/external function in `SedaPriceStore.sol`
- Test through the UUPS proxy (not the implementation directly) to match production deployment
- Cover happy paths, revert conditions, access control, event emissions, and upgrade mechanics
- Use `loadFixture` for gas-efficient, isolated test runs

**Non-Goals:**
- Testing TypeScript application code (covered by P1)
- Integration tests between TS and Solidity (covered by P2)
- Gas optimization benchmarks
- Fuzzing or formal verification

## Decisions

### 1. Deploy via `upgrades.deployProxy` in tests
**Rationale**: The contract is deployed as a UUPS proxy in production. Testing through the proxy catches proxy-specific bugs (e.g., storage layout collisions, initializer issues). Alternative: testing the implementation contract directly — rejected because it wouldn't catch proxy-layer bugs.

### 2. Use `loadFixture` from hardhat-network-helpers
**Rationale**: Snapshots and reverts the EVM state between tests for isolation without redeployment cost. Alternative: `beforeEach` with fresh deploys — rejected for being slower and not idiomatic Hardhat.

### 3. Create a minimal V2 contract for upgrade tests
**Rationale**: UUPS upgrade tests require a second implementation contract. A minimal `SedaPriceStoreV2` with an added `version()` function is sufficient. Place in `contracts/test/SedaPriceStoreV2.sol` — Hardhat compiles all `.sol` files in `contracts/` recursively. Alternative: mock contract inline — rejected because `upgrades.upgradeProxy` needs a real compiled artifact.

### 4. Test file location: `test/SedaPriceStore.test.ts`
**Rationale**: Hardhat's default test directory is `test/`. Single file is appropriate for one contract. Alternative: split per-concern (e.g., `test/initialization.test.ts`) — rejected as premature for ~20 tests.

## Risks / Trade-offs

- **[Risk] OZ v5 error names differ from v4** → Mitigation: Use exact v5 error names (`EnforcedPause`, `InvalidInitialization`, `OwnableUnauthorizedAccount`). Verified against installed `@openzeppelin/contracts-upgradeable` v5.1.0.
- **[Risk] Proxy storage layout changes in future upgrades** → Mitigation: The V2 test contract only adds a new function, not new storage, avoiding layout conflicts.
- **[Risk] `hardhat test` runs all `.test.ts` in `test/`** → Mitigation: Future P1/P2 tests use `vitest` (separate runner) or are in subdirectories with their own config.
