## ADDED Requirements

### Requirement: Single feed price update
The test suite SHALL verify that a relayer can update a single feed's price and read it back correctly.

#### Scenario: Single feed stored correctly
- **WHEN** a relayer calls `updatePrices([feedId], [price], [timestamp])` with a valid feedId, price, and timestamp
- **THEN** `getLatestPrice(feedId)` MUST return `(price, timestamp, 1)` where roundId is 1

### Requirement: Batch update of multiple feeds
The test suite SHALL verify that multiple feeds can be updated in a single `updatePrices` call.

#### Scenario: Three feeds updated in one batch
- **WHEN** a relayer calls `updatePrices` with 3 different feedIds, prices, and timestamps
- **THEN** `getLatestPrice` for each feedId MUST return the correct price, timestamp, and `roundId = 1`

### Requirement: Sequential updates increment roundId
The test suite SHALL verify that updating the same feed multiple times increments the roundId.

#### Scenario: Second update increments round
- **WHEN** a relayer updates feedId at timestamp T1, then updates the same feedId at timestamp T2 > T1
- **THEN** the second `getLatestPrice(feedId)` call MUST return `roundId = 2` with the new price and timestamp

### Requirement: PriceUpdated events emitted
The test suite SHALL verify that each feed in a batch emits a `PriceUpdated` event.

#### Scenario: Events emitted for batch
- **WHEN** a relayer calls `updatePrices` with N feeds
- **THEN** N `PriceUpdated` events MUST be emitted, each containing the correct `feedId`, `price`, `timestamp`, and `roundId`

### Requirement: Array length mismatch reverts
The test suite SHALL verify that `updatePrices` reverts when input arrays have mismatched lengths.

#### Scenario: feedIds and prices length mismatch
- **WHEN** `updatePrices` is called with `feedIds.length = 2` and `prices.length = 1`
- **THEN** the transaction MUST revert with `ArrayLengthMismatch()`

#### Scenario: feedIds and timestamps length mismatch
- **WHEN** `updatePrices` is called with `feedIds.length = 2` and `timestamps.length = 3`
- **THEN** the transaction MUST revert with `ArrayLengthMismatch()`

### Requirement: Stale timestamp reverts
The test suite SHALL verify that `updatePrices` reverts when the new timestamp is not strictly greater than the stored timestamp.

#### Scenario: Equal timestamp rejected
- **WHEN** a feed is updated at timestamp T, then `updatePrices` is called again with the same timestamp T
- **THEN** the transaction MUST revert with `StaleTimestamp(feedId, T, T)`

#### Scenario: Earlier timestamp rejected
- **WHEN** a feed is updated at timestamp 100, then `updatePrices` is called with timestamp 50
- **THEN** the transaction MUST revert with `StaleTimestamp(feedId, 50, 100)`

### Requirement: Empty arrays succeed as no-op
The test suite SHALL verify that calling `updatePrices` with empty arrays does not revert.

#### Scenario: Empty batch succeeds
- **WHEN** `updatePrices([], [], [])` is called by a relayer
- **THEN** the transaction MUST succeed without reverting and no events MUST be emitted
