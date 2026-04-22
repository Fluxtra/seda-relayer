## ADDED Requirements

### Requirement: Full round-trip from API to on-chain read-back
The test suite SHALL verify the complete data path: mocked SEDA FAST API response → `SedaFastClient.execute` → `Submitter.submitBatch` → `getLatestPrice` on the deployed contract returns the correct price.

#### Scenario: End-to-end price submission and verification
- **WHEN** `fetch` is mocked to return a valid SEDA FAST response with `price = "2000000000000000000000"` and `timestamp = "2025-06-15T12:00:00Z"` AND `SedaFastClient.execute` is called AND the result is fed into `Submitter.submitBatch` against a Hardhat-deployed `SedaPriceStore`
- **THEN** `getLatestPrice(feedId)` on the contract MUST return the price `2000000000000000000000` and the correct unix timestamp
