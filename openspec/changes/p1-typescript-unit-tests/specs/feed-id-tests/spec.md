## ADDED Requirements

### Requirement: feedIdFromSymbol produces deterministic output
The test suite SHALL verify that `feedIdFromSymbol` returns the same bytes32 hash for the same input across multiple calls.

#### Scenario: Repeated calls return same value
- **WHEN** `feedIdFromSymbol("ETH/USD")` is called twice
- **THEN** both calls MUST return the identical bytes32 string

### Requirement: feedIdFromSymbol matches known keccak256 value
The test suite SHALL verify that `feedIdFromSymbol` produces the correct keccak256 hash by comparing against a precomputed expected value.

#### Scenario: Known value check
- **WHEN** `feedIdFromSymbol("ETH/USD")` is called
- **THEN** the result MUST equal `ethers.keccak256(ethers.toUtf8Bytes("ETH/USD"))`

### Requirement: Different symbols produce different feed IDs
The test suite SHALL verify that distinct symbol strings map to distinct feed IDs.

#### Scenario: Distinct symbols yield distinct IDs
- **WHEN** `feedIdFromSymbol("ETH/USD")` and `feedIdFromSymbol("BTC/USD")` are called
- **THEN** the two returned values MUST NOT be equal
