## 1. Setup

- [x] 1.1 Install vitest as a dev dependency: `npm install -D vitest`
- [x] 1.2 Add `"test:unit": "vitest run"` and `"test:all": "hardhat test && vitest run"` scripts to `package.json`
- [x] 1.3 Create `test/unit/` directory structure

## 2. Export Private Helpers

- [x] 2.1 Export `decodeResult` from `src/seda-fast-client.ts` (add `export` keyword, add `/** @internal */` JSDoc tag)
- [x] 2.2 Export `summarizeError` from `src/index.ts` (add `export` keyword, add `/** @internal */` JSDoc tag)

## 3. feedIdFromSymbol Tests

- [x] 3.1 Create `test/unit/submitter.test.ts` with vitest imports
- [x] 3.2 Test deterministic output: `feedIdFromSymbol("ETH/USD")` called twice returns the same value
- [x] 3.3 Test known value: result matches `ethers.keccak256(ethers.toUtf8Bytes("ETH/USD"))`
- [x] 3.4 Test different symbols produce different IDs: `feedIdFromSymbol("ETH/USD") !== feedIdFromSymbol("BTC/USD")`

## 4. decodeResult Tests

- [x] 4.1 Create `test/unit/seda-fast-client.test.ts` with vitest imports and mock `SedaFastResponse` factory helper
- [x] 4.2 Test decoding from convenience `data.result` field: provide populated price and timestamp, assert correct `OraclePrice`
- [x] 4.3 Test hex fallback: provide empty `data.result.price`, hex-encoded JSON in `data.dataResult.result`, assert correct decoding
- [x] 4.4 Test decimal price truncation: `"123.456"` → `BigInt(123)`
- [x] 4.5 Test malformed hex fallback throws an error

## 5. SedaFastClient.execute Tests

- [x] 5.1 Add fetch mocking setup using `vi.stubGlobal('fetch', ...)` in `test/unit/seda-fast-client.test.ts`
- [x] 5.2 Test successful execution: mock 200 response with valid body, assert returned price and response
- [x] 5.3 Test non-200 response throws with status code in message
- [x] 5.4 Test non-zero exit code throws with "exit code" in message
- [x] 5.5 Test long error body (1000 chars) is truncated to ~300 chars

## 6. loadConfig Tests

- [x] 6.1 Create `test/unit/config.test.ts` with vitest imports and temp file helpers (write YAML to `os.tmpdir()`)
- [x] 6.2 Add `beforeEach`/`afterEach` to save and restore `process.env` to prevent pollution
- [x] 6.3 Test valid config loads successfully with all required fields and env vars
- [x] 6.4 Test `SEDA_FAST_API_KEY` env var overrides the YAML config value
- [x] 6.5 Test missing `sedaFast.apiUrl` throws "Missing sedaFast.apiUrl"
- [x] 6.6 Test missing `sedaFast.apiKey` (no env var, no config) throws appropriate error
- [x] 6.7 Test empty feeds array throws "Missing feeds configuration"
- [x] 6.8 Test feed missing `symbol` throws "Feed missing symbol"
- [x] 6.9 Test feed missing `execProgramId` throws with "missing execProgramId"
- [x] 6.10 Test missing `evm.rpcUrl` throws "Missing evm.rpcUrl"
- [x] 6.11 Test missing `evm.priceStoreAddress` throws "Missing evm.priceStoreAddress"
- [x] 6.12 Test missing `RELAYER_PRIVATE_KEY` env var throws "Missing RELAYER_PRIVATE_KEY env var"

## 7. summarizeError Tests

- [x] 7.1 Create `test/unit/index.test.ts` with vitest imports
- [x] 7.2 Test full ethers error extraction: input with `code=`, `action=`, `reason=` → output contains all three
- [x] 7.3 Test code-only input (no action/reason): output contains the code and "unknown" for action
- [x] 7.4 Test 300-char message without code pattern → truncated to 200 + "…"
- [x] 7.5 Test 50-char message without code pattern → returned unchanged

## 8. Verification

- [x] 8.1 Run `npm run test:unit` and verify all tests pass
- [x] 8.2 Verify existing `npx hardhat test` still works (no interference from vitest config)
