## ADDED Requirements

### Requirement: submitBatch writes prices to contract
The test suite SHALL verify that `Submitter.submitBatch` correctly writes price data to a real deployed `SedaPriceStore` contract.

#### Scenario: Batch write and read-back
- **WHEN** a `Submitter` is created pointing at a Hardhat-deployed `SedaPriceStore` AND `submitBatch` is called with a valid `PriceBatch` array
- **THEN** the transaction MUST succeed AND `getLatestPrice` for each feedId MUST return the submitted price and timestamp

### Requirement: submitBatch skips when gas price exceeds cap
The test suite SHALL verify that `submitBatch` returns `null` without submitting a transaction when the gas price exceeds the configured `maxGasPriceGwei`.

#### Scenario: Gas cap enforcement
- **WHEN** the provider's `getFeeData` is mocked to return a gas price higher than `maxGasPriceGwei` AND `submitBatch` is called
- **THEN** `submitBatch` MUST return `null` AND no transaction MUST be sent to the contract

### Requirement: submitBatch propagates simulation revert
The test suite SHALL verify that `submitBatch` throws an error containing "Simulation reverted" when the `staticCall` simulation fails (e.g., stale timestamp).

#### Scenario: Stale timestamp simulation failure
- **WHEN** a price has already been submitted for a feedId at timestamp T AND `submitBatch` is called again with the same feedId and timestamp T
- **THEN** `submitBatch` MUST throw an error whose message contains "Simulation reverted"

### Requirement: isPaused reflects contract state
The test suite SHALL verify that `Submitter.isPaused()` returns the correct pause state of the deployed contract.

#### Scenario: isPaused returns true when paused
- **WHEN** the contract owner calls `pause()` on the `SedaPriceStore`
- **THEN** `submitter.isPaused()` MUST return `true`

#### Scenario: isPaused returns false when not paused
- **WHEN** the contract is in its default (unpaused) state
- **THEN** `submitter.isPaused()` MUST return `false`
