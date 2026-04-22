## Context

P0 tests verify the Solidity contract in isolation. P1 tests verify TypeScript modules in isolation. Neither catches bugs at the seam between TypeScript and Solidity — ABI encoding mismatches, incorrect `feedIdFromSymbol` → contract `feedId` mapping, or `Submitter` class behavior against a real contract. The main loop's timestamp deduplication logic also requires integration-level testing since it spans multiple components (fetch → filter → submit).

## Goals / Non-Goals

**Goals:**
- Verify the full data path: mocked SEDA API → `SedaFastClient` → `Submitter` → on-chain `SedaPriceStore` → read-back
- Test `Submitter` class against a real Hardhat-deployed contract (not mocked ethers)
- Test gas cap enforcement, simulation revert propagation, and pause state reflection with real EVM behavior
- Test main loop timestamp deduplication logic in isolation from the infinite loop

**Non-Goals:**
- Testing against Mantra mainnet or a fork (local Hardhat network is sufficient)
- Testing SEDA FAST API availability (mocked)
- Load testing or performance benchmarking
- Testing the full `main()` function with its `while(true)` loop

## Decisions

### 1. Run integration tests via `hardhat test` (same as P0)
**Rationale**: Integration tests need a live EVM. Hardhat's built-in network provides this automatically when running `hardhat test`. Placing integration test files in `test/integration/` keeps them organized alongside the P0 contract tests. Alternative: use vitest with a programmatic Hardhat network — rejected for unnecessary complexity.

### 2. Mock fetch for SEDA API, use real EVM for contract
**Rationale**: The SEDA FAST API is an external dependency we can't control in tests. Mock it to produce deterministic responses. The contract interaction is the thing we're testing — use a real deployed instance. Alternative: mock both — rejected because it defeats the purpose of integration testing.

### 3. Extract timestamp dedup logic into a testable function
**Rationale**: The `lastTimestamps` map and filtering logic is buried inside `main()`'s `while(true)` loop. Extract the filter logic into a standalone function (e.g., `filterNewPrices(fetchResults, lastTimestamps)`) that can be called in tests. Alternative: test the full main loop with a mock timer — rejected as overly complex for the behavior being verified.

### 4. Share the `deployFixture` from P0 contract tests
**Rationale**: Integration tests also need a deployed `SedaPriceStore`. Import/re-use the same fixture pattern. Alternative: duplicate the fixture — rejected to avoid drift.

## Risks / Trade-offs

- **[Risk] Integration tests are slower than unit tests** → Mitigation: Only ~7 tests, and Hardhat's `loadFixture` keeps them fast. Separate from unit tests via directory.
- **[Risk] Extracting timestamp dedup logic changes production code** → Mitigation: Pure refactor — extract function, call it from the same location. No behavior change.
- **[Risk] `Submitter` constructor requires `RELAYER_PRIVATE_KEY` env var** → Mitigation: Set a test private key in the test setup (Hardhat provides default accounts).
