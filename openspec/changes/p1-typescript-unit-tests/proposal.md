## Why

The TypeScript application layer (`src/`) contains config loading, API client logic, oracle result decoding, and error summarization — all with zero unit tests. Misconfigurations silently target the wrong chain, decoding bugs silently corrupt price data, and error handling regressions swallow critical failures. Pure functions and isolated modules are cheap to test and provide high signal.

## What Changes

- Install `vitest` as a dev dependency
- Add `"test:unit": "vitest run"` script to `package.json`
- Export currently-private helper functions (`decodeResult` from `seda-fast-client.ts`, `summarizeError` from `index.ts`) to make them directly testable
- Create unit test files:
  - `test/unit/submitter.test.ts` — `feedIdFromSymbol` pure function tests
  - `test/unit/seda-fast-client.test.ts` — `decodeResult` and `SedaFastClient.execute` tests (mocked fetch)
  - `test/unit/config.test.ts` — `loadConfig` validation tests (temp files / mocked fs)
  - `test/unit/index.test.ts` — `summarizeError` pure function tests
- ~18 test cases total across 4 files

## Capabilities

### New Capabilities

- `feed-id-tests`: Tests that `feedIdFromSymbol` produces deterministic keccak256 output, matches known precomputed values, and returns distinct IDs for different symbols
- `decode-result-tests`: Tests that `decodeResult` correctly uses the convenience result field, falls back to hex-encoded dataResult, handles decimal prices, and throws on malformed input
- `seda-client-tests`: Tests that `SedaFastClient.execute` handles successful responses, non-200 errors (with truncation), and non-zero exit codes via mocked fetch
- `config-validation-tests`: Tests that `loadConfig` returns correct config for valid input, applies env var overrides, and throws specific errors for each missing required field
- `error-summarizer-tests`: Tests that `summarizeError` extracts ethers error codes/actions/reasons via regex, handles partial matches, and truncates long messages

### Modified Capabilities

_None — no existing specs._

## Impact

- **New files**: `test/unit/submitter.test.ts`, `test/unit/seda-fast-client.test.ts`, `test/unit/config.test.ts`, `test/unit/index.test.ts`
- **Modified files**: `package.json` (add vitest dep + script), `src/seda-fast-client.ts` (export `decodeResult`), `src/index.ts` (export `summarizeError`)
- **New dependencies**: `vitest` (dev only)
- **CI**: New `npm run test:unit` command available
