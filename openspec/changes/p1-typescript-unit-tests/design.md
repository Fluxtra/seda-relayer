## Context

The TypeScript source in `src/` contains the relayer's application logic: YAML config loading with .env support, SEDA FAST API client with oracle result decoding, on-chain submitter with gas cap enforcement, and error summarization utilities. Several key functions (`decodeResult`, `summarizeError`) are currently module-private and need to be exported for direct unit testing. The project has no test runner for TypeScript code — `hardhat test` only runs Solidity tests.

## Goals / Non-Goals

**Goals:**
- Add a lightweight TypeScript test runner (vitest) for fast unit test iteration
- Test all pure functions and isolated module logic with mocked dependencies
- Export private helpers to make them directly testable without indirection
- Cover config validation error paths exhaustively (each missing field = one test)

**Non-Goals:**
- Testing Solidity contract behavior (covered by P0)
- Integration testing against a real EVM (covered by P2)
- Testing the main loop's `while(true)` orchestration (covered by P2)
- Performance benchmarking

## Decisions

### 1. Use vitest over mocha/jest
**Rationale**: Vitest has native TypeScript support (no compilation step), built-in mocking (`vi.mock`, `vi.fn`), and fast execution. The project already uses `tsx` for runtime TS execution, and vitest integrates well. Alternative: mocha (already in hardhat-toolbox) — rejected because it lacks built-in mocking and requires additional chai setup for TS. Alternative: jest — rejected for heavier config and slower startup.

### 2. Export `decodeResult` and `summarizeError`
**Rationale**: These are pure functions with complex logic (hex decoding, regex parsing) that benefit from direct unit testing. Exporting them is a minimal, non-breaking change. Alternative: test only through their parent functions (`execute`, main loop error handler) — rejected because it requires mocking more infrastructure and produces less precise failure signals.

### 3. Test `loadConfig` with temp files, not mocked fs
**Rationale**: `loadConfig` reads YAML files and `.env` files from disk. Writing real temp files (via `os.tmpdir()` + `fs.writeFileSync`) tests the actual I/O path. Alternative: `vi.mock('node:fs')` — workable but brittle if the implementation changes how it reads files.

### 4. Mock `fetch` globally for `SedaFastClient` tests
**Rationale**: `SedaFastClient.execute` calls the global `fetch`. Use `vi.stubGlobal('fetch', mockFn)` to intercept. Alternative: dependency injection of a fetch function — rejected as it would change the production API for test convenience.

## Risks / Trade-offs

- **[Risk] Exporting private functions increases public API surface** → Mitigation: Use `/** @internal */` JSDoc tags. These are test-only exports, not consumed externally.
- **[Risk] vitest and hardhat-toolbox's mocha may conflict** → Mitigation: vitest only runs `test/unit/**` via explicit config. Hardhat runs `test/*.test.ts` at root level. No overlap.
- **[Risk] Environment variable pollution between `loadConfig` tests** → Mitigation: Save and restore `process.env` in `beforeEach`/`afterEach`.
