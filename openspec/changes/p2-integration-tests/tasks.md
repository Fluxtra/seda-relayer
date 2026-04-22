## 1. Setup

- [x] 1.1 Create `test/integration/` directory
- [x] 1.2 Create `test/integration/round-trip.test.ts` with imports for hardhat, ethers, chai, `loadFixture`, and `@openzeppelin/hardhat-upgrades`
- [x] 1.3 Implement a shared `deployWithRelayerFixture` that deploys `SedaPriceStore` via UUPS proxy and returns `{ contract, owner, relayer }` using Hardhat default signers

## 2. Round-Trip Tests

- [x] 2.1 Mock `global.fetch` to return a valid SEDA FAST API response with known price and timestamp
- [x] 2.2 Test full round-trip: `SedaFastClient.execute` → compute `feedIdFromSymbol` → `Submitter.submitBatch` → `getLatestPrice` returns submitted price and timestamp
- [x] 2.3 Clean up fetch mock in `afterEach`

## 3. Submitter Integration Tests

- [x] 3.1 Test `submitBatch` writes prices to the deployed contract: submit a batch, read back via `getLatestPrice`, assert values match
- [x] 3.2 Test `submitBatch` returns `null` when gas price exceeds `maxGasPriceGwei`: mock the provider's `getFeeData` to return high gas, assert no transaction
- [x] 3.3 Test `submitBatch` throws "Simulation reverted" when submitting a stale timestamp (submit once, then submit again with same timestamp)
- [x] 3.4 Test `isPaused()` returns `false` by default and `true` after owner calls `pause()` on the contract

## 4. Timestamp Deduplication Tests

- [x] 4.1 Extract the timestamp filtering logic from `src/index.ts` into a testable function `filterNewPrices(fetchResults, lastTimestamps)` — pure refactor, call from original location
- [x] 4.2 Test that feeds with timestamps equal to `lastTimestamps` are excluded from the output batch
- [x] 4.3 Test that feeds with timestamps strictly greater than `lastTimestamps` are included in the output batch

## 5. Verification

- [x] 5.1 Run `npx hardhat test` and verify all integration tests pass alongside P0 contract tests
- [x] 5.2 Verify `npm run test:unit` (P1) still passes without interference
