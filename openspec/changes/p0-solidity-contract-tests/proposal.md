## Why

The `seda-relayer` project has zero test coverage. The `SedaPriceStore` Solidity contract is deployed on Mantra chain and stores oracle price data that downstream DeFi protocols consume. Bugs in initialization, access control, pause logic, or price update validation could lead to unauthorized writes, stale data, or locked funds. Contract-level tests are the highest-value, lowest-effort defense.

## What Changes

- Add comprehensive Hardhat test suite for `SedaPriceStore.sol` in `test/SedaPriceStore.test.ts`
- Create a minimal `SedaPriceStoreV2` test helper contract in `contracts/test/SedaPriceStoreV2.sol` for UUPS upgrade testing
- ~20 test cases covering initialization, batch price updates, access control, pause/unpause, read functions, and UUPS upgradeability
- No new dependencies required — `@nomicfoundation/hardhat-toolbox` and `@openzeppelin/hardhat-upgrades` are already installed

## Capabilities

### New Capabilities

- `contract-initialization-tests`: Tests that `initialize` correctly sets owner/relayer, emits events, reverts on zero addresses, and blocks re-initialization
- `price-update-tests`: Tests for `updatePrices` happy path (single, batch, sequential round increments, events) and revert paths (array mismatch, stale timestamps, empty arrays)
- `access-control-tests`: Tests that `onlyRelayer` modifier blocks unauthorized callers, and `addRelayer`/`removeRelayer` are owner-only with zero-address guards
- `pause-tests`: Tests that pause blocks `updatePrices`, unpause re-enables it, and only owner can toggle pause state
- `read-function-tests`: Tests for `getLatestPrice`, `latestRoundData` (AggregatorV3-compatible), and `decimals` return values
- `upgrade-tests`: Tests that owner can UUPS-upgrade the proxy and non-owner cannot

### Modified Capabilities

_None — no existing specs._

## Impact

- **New files**: `test/SedaPriceStore.test.ts`, `contracts/test/SedaPriceStoreV2.sol`
- **Existing files**: No production code changes
- **Dependencies**: None new (uses existing Hardhat toolbox + OZ upgrades)
- **CI**: The `npm test` / `hardhat test` command will now execute these tests
