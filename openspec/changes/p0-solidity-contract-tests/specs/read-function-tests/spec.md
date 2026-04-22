## ADDED Requirements

### Requirement: Uninitialized feed returns zeros
The test suite SHALL verify that querying a feedId that has never been written returns default zero values.

#### Scenario: Zero values for unknown feed
- **WHEN** `getLatestPrice(feedId)` is called for a feedId that has never been updated
- **THEN** the function MUST return `(0, 0, 0)` for price, timestamp, and roundId

### Requirement: latestRoundData returns AggregatorV3-compatible format
The test suite SHALL verify that `latestRoundData` returns values in the Chainlink AggregatorV3Interface format.

#### Scenario: Correct AggregatorV3 tuple after update
- **WHEN** a feed is updated with `price=P`, `timestamp=T`, resulting in `roundId=R` AND `latestRoundData(feedId)` is called
- **THEN** the function MUST return `(R, P, T, T, R)` mapping to `(roundId, answer, startedAt, updatedAt, answeredInRound)`

### Requirement: decimals returns 18
The test suite SHALL verify that the `decimals()` function returns 18.

#### Scenario: Decimals value
- **WHEN** `decimals()` is called
- **THEN** the function MUST return `18`
