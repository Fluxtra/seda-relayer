## Why

Unit tests verify individual components in isolation, but the relayer's real risk is in the seams: ABI mismatches between TypeScript and Solidity, the `Submitter` class interacting with a live contract, and the main loop's timestamp deduplication logic preventing duplicate on-chain writes. Integration tests catch these cross-boundary bugs that unit tests miss.

## What Changes

- Create integration test suite using Hardhat's local network as a real EVM backend
- Test the full round-trip: mock SEDA FAST API → `SedaFastClient.execute` → `Submitter.submitBatch` → on-chain `getLatestPrice` read-back
- Test `Submitter` class against a real deployed contract (gas cap skip, simulation revert propagation, `isPaused` reflection)
- Test main loop timestamp deduplication logic (skip unchanged timestamps, process newer ones)
- ~7 test cases in `test/integration/round-trip.test.ts`

## Capabilities

### New Capabilities

- `round-trip-tests`: End-to-end test from mocked SEDA API response through submitter to on-chain price verification, catching ABI mismatches and encoding errors
- `submitter-integration-tests`: Tests for `Submitter` class against a real Hardhat-deployed `SedaPriceStore` — batch writes, gas cap enforcement, simulation revert propagation, and pause state reflection
- `timestamp-dedup-tests`: Tests that the main loop's `lastTimestamps` deduplication logic correctly skips feeds with unchanged timestamps and processes feeds with newer timestamps

### Modified Capabilities

_None — no existing specs._

## Impact

- **New files**: `test/integration/round-trip.test.ts`
- **Existing files**: No production code changes (depends on P1's exported helpers)
- **Dependencies**: None new (uses Hardhat local network already available)
- **Prerequisites**: P0 (contract tests prove the contract works) and P1 (exported helpers + vitest setup) should be completed first
- **CI**: Tests run via `hardhat test` (same as P0 contract tests)
